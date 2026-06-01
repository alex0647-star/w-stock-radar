function toNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function yahooSymbol(code) {
  return `${String(code).replace(/\D/g, "")}.TW`;
}

function buildMisUrl(code) {
  const query = new URLSearchParams({
    ex_ch: `tse_${String(code).replace(/\D/g, "")}.tw`,
    json: "1",
    delay: "0",
    _: String(Date.now())
  });
  return `https://mis.twse.com.tw/stock/api/getStockInfo.jsp?${query.toString()}`;
}

async function fetchYahooIntraday(code) {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${yahooSymbol(code)}?range=1d&interval=1m`;
  const response = await fetch(url, { headers: { "user-agent": "tw-stock-radar/1.0" } });
  if (!response.ok) throw new Error("Yahoo intraday request failed");

  const payload = await response.json();
  const result = payload.chart?.result?.[0];
  if (!result) throw new Error("Yahoo intraday empty result");

  const timestamps = result.timestamp || [];
  const quote = result.indicators?.quote?.[0] || {};
  const meta = result.meta || {};
  const points = timestamps
    .map((time, index) => ({
      time: new Date(time * 1000).toLocaleTimeString("zh-TW", { hour: "2-digit", minute: "2-digit", hour12: false }),
      price: toNumber(quote.close?.[index]),
      volume: toNumber(quote.volume?.[index])
    }))
    .filter((item) => item.price > 0);

  const latest = points.at(-1)?.price || toNumber(meta.regularMarketPrice);
  const previousClose = toNumber(meta.chartPreviousClose || meta.previousClose);
  const change = latest && previousClose ? latest - previousClose : 0;

  return {
    quote: {
      code: String(code),
      price: latest,
      change,
      changePercent: previousClose ? (change / previousClose) * 100 : 0,
      open: toNumber(quote.open?.find((item) => item)),
      high: Math.max(...points.map((item) => item.price), 0),
      low: Math.min(...points.map((item) => item.price).filter(Boolean)),
      volume: points.reduce((sum, item) => sum + item.volume, 0)
    },
    points
  };
}

async function fetchTwseQuote(code) {
  const response = await fetch(buildMisUrl(code), {
    headers: {
      accept: "application/json",
      referer: "https://mis.twse.com.tw/stock/index.jsp",
      "user-agent": "tw-stock-radar/1.0"
    }
  });
  if (!response.ok) throw new Error("TWSE MIS request failed");
  const row = (await response.json()).msgArray?.[0];
  if (!row) throw new Error("TWSE MIS empty result");

  const price = toNumber(row.z) || toNumber(row.y);
  const previousClose = toNumber(row.y);
  const change = price && previousClose ? price - previousClose : 0;
  return {
    quote: {
      code: String(code),
      price,
      change,
      changePercent: previousClose ? (change / previousClose) * 100 : 0,
      open: toNumber(row.o),
      high: toNumber(row.h),
      low: toNumber(row.l),
      volume: toNumber(row.v) * 1000
    },
    points: []
  };
}

export default async function handler(request, response) {
  const code = request.query.code;

  try {
    const data = await fetchYahooIntraday(code);
    response.setHeader("Cache-Control", "s-maxage=15, stale-while-revalidate=30");
    response.status(200).json(data);
  } catch {
    try {
      const data = await fetchTwseQuote(code);
      response.setHeader("Cache-Control", "s-maxage=15, stale-while-revalidate=30");
      response.status(200).json(data);
    } catch {
      response.status(502).json({ error: "Unable to fetch realtime stock data" });
    }
  }
}
