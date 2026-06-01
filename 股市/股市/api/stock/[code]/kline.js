function toNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function yahooSymbol(code) {
  return `${String(code).replace(/\D/g, "")}.TW`;
}

function intervalFor(type) {
  if (type === "weekly") return { range: "2y", interval: "1wk" };
  if (type === "monthly") return { range: "5y", interval: "1mo" };
  return { range: "1y", interval: "1d" };
}

export default async function handler(request, response) {
  const code = request.query.code;
  const type = request.query.type || "daily";
  const { range, interval } = intervalFor(type);
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${yahooSymbol(code)}?range=${range}&interval=${interval}`;

  try {
    const upstream = await fetch(url, {
      headers: {
        accept: "application/json",
        "user-agent": "tw-stock-radar/1.0"
      }
    });

    if (!upstream.ok) {
      response.status(upstream.status).json({ error: "Yahoo Finance request failed" });
      return;
    }

    const payload = await upstream.json();
    const result = payload.chart?.result?.[0];
    const quote = result?.indicators?.quote?.[0];
    const timestamps = result?.timestamp || [];

    if (!result || !quote || !timestamps.length) {
      response.status(404).json({ error: "No kline data" });
      return;
    }

    const items = timestamps
      .map((time, index) => ({
        date: new Date(time * 1000).toISOString().slice(0, 10),
        open: toNumber(quote.open?.[index]),
        high: toNumber(quote.high?.[index]),
        low: toNumber(quote.low?.[index]),
        close: toNumber(quote.close?.[index]),
        volume: toNumber(quote.volume?.[index])
      }))
      .filter((item) => item.open && item.high && item.low && item.close);

    response.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=600");
    response.status(200).json({ code, type, items });
  } catch {
    response.status(502).json({ error: "Unable to fetch kline data" });
  }
}
