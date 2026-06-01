const endpoints = {
  daily: "https://openapi.twse.com.tw/v1/exchangeReport/STOCK_DAY_ALL",
  valuation: "https://openapi.twse.com.tw/v1/exchangeReport/BWIBBU_ALL"
};

function buildRealtimeUrl(codes = "") {
  const channels = String(codes)
    .split(",")
    .map((code) => code.trim())
    .filter(Boolean)
    .map((code) => `tse_${code}.tw`)
    .join("|");

  const query = new URLSearchParams({
    ex_ch: channels,
    json: "1",
    delay: "0",
    _: String(Date.now())
  });

  return `https://mis.twse.com.tw/stock/api/getStockInfo.jsp?${query.toString()}`;
}

export default async function handler(request, response) {
  const type = request.query.type || "daily";
  const endpoint = type === "realtime" ? buildRealtimeUrl(request.query.codes) : endpoints[type];

  if (!endpoint) {
    response.status(400).json({ error: "Unsupported TWSE data type" });
    return;
  }

  try {
    const upstream = await fetch(endpoint, {
      headers: {
        accept: "application/json",
        referer: "https://mis.twse.com.tw/stock/index.jsp",
        "user-agent": "tw-stock-radar/1.0"
      }
    });

    if (!upstream.ok) {
      response.status(upstream.status).json({ error: "TWSE request failed" });
      return;
    }

    const data = await upstream.json();
    response.setHeader("Cache-Control", type === "realtime" ? "s-maxage=15" : "s-maxage=300, stale-while-revalidate=600");
    response.status(200).json(data);
  } catch {
    response.status(502).json({ error: "Unable to reach TWSE data source" });
  }
}
