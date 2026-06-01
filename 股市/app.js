const stocks = [
  {
    code: "2330",
    name: "台積電",
    sector: "半導體",
    style: "growth",
    score: 95,
    yield: 0.9,
    momentum: 92,
    risk: 32,
    pe: 24.8,
    accent: "#2563eb",
    reason: ["AI 晶片與高效能運算需求延續，先進製程仍具全球定價能力。", "資本支出與客戶訂單能見度高，長線競爭優勢明確。", "大型權值股流動性佳，適合作為科技成長核心觀察股。"],
    strategy: {
      summary: "偏長線成長配置，避免急漲後追高，適合分批建立基本部位。",
      entry: "回測 10 日或月線附近分批",
      takeProfit: "上漲 12% 至 18% 分批停利",
      stopLoss: "跌破月線且量能轉弱",
      note: "若大盤系統性修正，可保留資金分 2 至 3 次加碼。"
    }
  },
  {
    code: "2454",
    name: "聯發科",
    sector: "IC 設計",
    style: "growth",
    score: 90,
    yield: 4.1,
    momentum: 78,
    risk: 42,
    pe: 18.6,
    accent: "#0891b2",
    reason: ["手機、Wi-Fi、車用與邊緣 AI 題材提供成長動能。", "現金流與配息水準具吸引力，兼具成長與收益特性。", "評價相對台股高成長電子股仍有觀察空間。"],
    strategy: {
      summary: "適合成長收益並重，等待拉回或盤整突破再分批。",
      entry: "回落至季線附近或突破整理區",
      takeProfit: "前高附近先收回部分本金",
      stopLoss: "跌破季線後 2 至 3 日無法站回",
      note: "若殖利率維持 4% 以上，可提高長線持有比重。"
    }
  },
  {
    code: "2308",
    name: "台達電",
    sector: "電源與散熱",
    style: "growth",
    score: 88,
    yield: 1.9,
    momentum: 82,
    risk: 37,
    pe: 26.4,
    accent: "#16a34a",
    reason: ["資料中心電源、散熱、電動車與工業自動化皆有中長期需求。", "營運品質穩健，產品線分散度高。", "股價拉回時通常具機構資金承接力。"],
    strategy: {
      summary: "中長線偏多觀察，適合用支撐位置分批承接。",
      entry: "回測月線或前波平台支撐",
      takeProfit: "創高後漲勢鈍化分批調節",
      stopLoss: "跌破前波低點",
      note: "偏高評價時不宜一次買滿，保留加碼彈性。"
    }
  },
  {
    code: "2317",
    name: "鴻海",
    sector: "電子代工",
    style: "value",
    score: 86,
    yield: 3.0,
    momentum: 85,
    risk: 45,
    pe: 14.8,
    accent: "#7c3aed",
    reason: ["AI 伺服器與電動車題材帶來重新評價機會。", "代工規模優勢與供應鏈整合能力仍具競爭力。", "本益比相對溫和，若獲利改善有評價修復空間。"],
    strategy: {
      summary: "偏價值轉型股，適合等待量價轉強後分批。",
      entry: "突破整理區後回測不破",
      takeProfit: "評價修復或題材過熱時分批",
      stopLoss: "跌破整理區下緣",
      note: "題材股波動較大，建議控制單一持股比例。"
    }
  },
  {
    code: "2382",
    name: "廣達",
    sector: "AI 伺服器",
    style: "growth",
    score: 85,
    yield: 3.6,
    momentum: 87,
    risk: 56,
    pe: 20.2,
    accent: "#dc2626",
    reason: ["AI 伺服器出貨能見度高，營收題材明確。", "動能強，容易吸引短中線資金。", "波動度偏高，需搭配嚴格風險控管。"],
    strategy: {
      summary: "適合波段交易，不建議在急漲長紅後追價。",
      entry: "回測 10 日線或量縮整理時",
      takeProfit: "上漲 10% 至 15% 分批落袋",
      stopLoss: "跌破 20 日線或爆量長黑",
      note: "若持有成本偏高，應用移動停利保護獲利。"
    }
  },
  {
    code: "2881",
    name: "富邦金",
    sector: "金融",
    style: "income",
    score: 83,
    yield: 5.2,
    momentum: 60,
    risk: 30,
    pe: 12.7,
    accent: "#ca8a04",
    reason: ["壽險與銀行獲利修復時，配息想像較明確。", "金融股波動相對電子股低，可平衡組合風險。", "殖利率具吸引力，適合收益型投資人觀察。"],
    strategy: {
      summary: "偏存股與收益配置，適合逢回分批，不追短線急漲。",
      entry: "除息後回穩或殖利率高於 5%",
      takeProfit: "漲至低殖利率區間可調節",
      stopLoss: "金融環境惡化且跌破年線",
      note: "以股利與穩定性為主，短線價差不是核心目標。"
    }
  },
  {
    code: "2891",
    name: "中信金",
    sector: "金融",
    style: "income",
    score: 82,
    yield: 4.8,
    momentum: 58,
    risk: 28,
    pe: 11.9,
    accent: "#b45309",
    reason: ["銀行本業穩健，獲利與配息預期較清楚。", "股價彈性低於電子股，但防禦性較佳。", "適合作為觀察組合的穩定收益部位。"],
    strategy: {
      summary: "核心收益型持股，適合定期分批累積。",
      entry: "殖利率接近 5% 或回測季線",
      takeProfit: "短線急漲偏離均線時調節",
      stopLoss: "跌破年線且獲利展望下修",
      note: "可用定期定額降低金融股循環波動。"
    }
  },
  {
    code: "2412",
    name: "中華電",
    sector: "電信",
    style: "income",
    score: 79,
    yield: 3.7,
    momentum: 43,
    risk: 20,
    pe: 24.1,
    accent: "#0f766e",
    reason: ["現金流與配息穩定，波動度低。", "電信龍頭具防禦屬性，可降低投資組合波動。", "短線爆發力有限，較適合長期核心配置。"],
    strategy: {
      summary: "防禦型存股，重點是穩定配息與低波動。",
      entry: "回測年線或殖利率改善時",
      takeProfit: "大幅偏離歷史評價時調節",
      stopLoss: "基本面明顯轉弱才檢討",
      note: "適合以長期持有和股利再投入為主。"
    }
  },
  {
    code: "2357",
    name: "華碩",
    sector: "品牌電腦",
    style: "value",
    score: 78,
    yield: 4.4,
    momentum: 54,
    risk: 40,
    pe: 14.1,
    accent: "#4d7c0f",
    reason: ["PC 景氣循環回溫與 AI PC 題材提供支撐。", "評價相對溫和，殖利率具吸引力。", "適合用景氣循環與股利角度追蹤。"],
    strategy: {
      summary: "景氣循環價值股，適合在低評價區分批。",
      entry: "本益比偏低且股價回測支撐",
      takeProfit: "PC 題材升溫或評價修復時",
      stopLoss: "營收連續轉弱且跌破前低",
      note: "觀察庫存與毛利率是否同步改善。"
    }
  },
  {
    code: "2884",
    name: "玉山金",
    sector: "金融",
    style: "income",
    score: 76,
    yield: 4.2,
    momentum: 48,
    risk: 27,
    pe: 13.4,
    accent: "#059669",
    reason: ["資產品質與獲利穩定度佳。", "股價波動低，適合保守型金融股觀察。", "配息雖非最高，但長期穩定性具優勢。"],
    strategy: {
      summary: "保守收益配置，適合慢慢累積，不適合追求短線爆發。",
      entry: "回測季線或殖利率高於 4%",
      takeProfit: "高於歷史評價區間時調節",
      stopLoss: "獲利下修且跌破年線",
      note: "可和高成長電子股搭配，降低組合波動。"
    }
  }
].map((stock) => ({
  ...stock,
  price: 0,
  previousClose: 0,
  open: 0,
  high: 0,
  low: 0,
  volume: 0,
  change: 0,
  changePercent: 0
}));

const STORAGE_KEY = "tw-stock-radar-watchlist";
const REFRESH_INTERVAL_MS = 5 * 60 * 1000;
const page = document.body.dataset.page || "home";

const state = {
  query: "",
  style: "all",
  minScore: 70,
  dividendOnly: false,
  sort: "score",
  watch: new Set(loadWatchList()),
  loading: false
};

const els = {
  searchInput: document.querySelector("#searchInput"),
  scoreRange: document.querySelector("#scoreRange"),
  scoreLabel: document.querySelector("#scoreLabel"),
  dividendOnly: document.querySelector("#dividendOnly"),
  sortSelect: document.querySelector("#sortSelect"),
  refreshButton: document.querySelector("#refreshButton"),
  stockGrid: document.querySelector("#stockGrid"),
  matchCount: document.querySelector("#matchCount"),
  avgScore: document.querySelector("#avgScore"),
  avgYield: document.querySelector("#avgYield"),
  watchList: document.querySelector("#watchList"),
  watchCount: document.querySelector("#watchCount"),
  portfolioRisk: document.querySelector("#portfolioRisk"),
  riskFill: document.querySelector("#riskFill"),
  sectorChart: document.querySelector("#sectorChart"),
  dataStatus: document.querySelector("#dataStatus")
};

const PROXY_ENDPOINTS = {
  daily: "/api/twse?type=daily",
  valuation: "/api/twse?type=valuation",
  realtime: `/api/twse?type=realtime&codes=${stocks.map((stock) => stock.code).join(",")}`
};

const DIRECT_ENDPOINTS = {
  daily: "https://openapi.twse.com.tw/v1/exchangeReport/STOCK_DAY_ALL",
  valuation: "https://openapi.twse.com.tw/v1/exchangeReport/BWIBBU_ALL"
};

function loadWatchList() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

function saveWatchList() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...state.watch]));
}

function toNumber(value) {
  if (value === undefined || value === null) return 0;
  const normalized = String(value).replace(/[,％%]/g, "").trim();
  const number = Number(normalized);
  return Number.isFinite(number) ? number : 0;
}

function pick(row, keys) {
  const key = keys.find((item) => Object.prototype.hasOwnProperty.call(row, item));
  return key ? row[key] : undefined;
}

function formatPrice(value) {
  return value ? value.toLocaleString("zh-TW", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "--";
}

function formatSigned(value, suffix = "") {
  if (!value) return `0${suffix}`;
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}${suffix}`;
}

function formatVolume(value) {
  return value ? `${Math.round(value / 1000).toLocaleString("zh-TW")} 張` : "--";
}

function setDataStatus(message, tone = "muted") {
  if (!els.dataStatus) return;
  els.dataStatus.textContent = message;
  els.dataStatus.dataset.tone = tone;
}

async function getJson(type) {
  const urls = type === "realtime" ? [PROXY_ENDPOINTS.realtime] : [PROXY_ENDPOINTS[type], DIRECT_ENDPOINTS[type]];

  for (const url of urls) {
    try {
      const response = await fetch(url, { cache: "no-store" });
      if (response.ok) return response.json();
    } catch {
      // Try the next source.
    }
  }

  throw new Error(`Unable to fetch ${type} data`);
}

function currentStocks() {
  if (page === "favorites") {
    return stocks.filter((stock) => state.watch.has(stock.code)).sort(sortStocks);
  }

  const query = state.query.trim().toLowerCase();
  return stocks
    .filter((stock) => {
      const text = `${stock.code} ${stock.name} ${stock.sector}`.toLowerCase();
      return (
        (!query || text.includes(query)) &&
        (state.style === "all" || stock.style === state.style) &&
        stock.score >= state.minScore &&
        (!state.dividendOnly || stock.yield >= 4)
      );
    })
    .sort(sortStocks);
}

function sortStocks(a, b) {
  if (state.sort === "yield") return b.yield - a.yield;
  if (state.sort === "momentum") return b.momentum - a.momentum;
  if (state.sort === "price") return b.price - a.price;
  if (state.sort === "risk") return a.risk - b.risk;
  if (state.sort === "changePercent") return b.changePercent - a.changePercent;
  return b.score - a.score;
}

function styleLabel(style) {
  if (style === "growth") return "成長";
  if (style === "value") return "價值";
  return "收益";
}

function riskLabel(risk) {
  if (risk <= 32) return { text: "低風險", color: "#16835f" };
  if (risk <= 48) return { text: "中風險", color: "#b7791f" };
  return { text: "高波動", color: "#c2413d" };
}

function renderCards(list) {
  if (!els.stockGrid) return;
  if (!list.length) {
    const message =
      page === "favorites"
        ? '尚未加入最愛股票。請回到推薦清單，按下「加入最愛」後就會顯示在這裡。'
        : "沒有符合條件的股票，請放寬篩選或改用其他關鍵字。";
    els.stockGrid.innerHTML = `<div class="empty-state">${message}</div>`;
    return;
  }

  els.stockGrid.innerHTML = list.map(renderStockCard).join("");
}

function renderStockCard(stock) {
  const risk = riskLabel(stock.risk);
  const added = state.watch.has(stock.code);
  const changeClass = stock.change > 0 ? "up" : stock.change < 0 ? "down" : "flat";
  const buttonText = page === "favorites" ? "移出最愛" : added ? "已加入最愛" : "加入最愛";
  const reasonItems = stock.reason.map((item) => `<li>${item}</li>`).join("");

  return `
    <article class="stock-card" style="--accent:${stock.accent}">
      <div class="stock-head">
        <div class="stock-title">
          <h3>${stock.code} ${stock.name}</h3>
          <span class="stock-meta">${stock.sector} / ${styleLabel(stock.style)}</span>
        </div>
        <div class="score-badge" title="推薦分數">${stock.score}</div>
      </div>

      <div class="quote-strip ${changeClass}">
        <div><span>現價</span><strong>${formatPrice(stock.price)}</strong></div>
        <div><span>漲跌</span><strong>${formatSigned(stock.change)}</strong></div>
        <div><span>漲跌幅</span><strong>${formatSigned(stock.changePercent, "%")}</strong></div>
      </div>

      <div class="metrics">
        <div class="metric"><span>殖利率</span><strong>${stock.yield.toFixed(1)}%</strong></div>
        <div class="metric"><span>本益比</span><strong>${stock.pe ? stock.pe.toFixed(1) : "--"}</strong></div>
        <div class="metric"><span>成交量</span><strong>${formatVolume(stock.volume)}</strong></div>
      </div>

      <section class="analysis-block">
        <h4>推薦原因</h4>
        <ul>${reasonItems}</ul>
      </section>

      <section class="strategy-block">
        <h4>建議策略</h4>
        <p>${stock.strategy.summary}</p>
        <div class="strategy-grid">
          <div><span>進場區間</span><strong>${stock.strategy.entry}</strong></div>
          <div><span>停利目標</span><strong>${stock.strategy.takeProfit}</strong></div>
          <div><span>停損防守</span><strong>${stock.strategy.stopLoss}</strong></div>
        </div>
        <p class="strategy-note">${stock.strategy.note}</p>
      </section>

      <div class="session-row">
        <span>開 ${formatPrice(stock.open)}</span>
        <span>高 ${formatPrice(stock.high)}</span>
        <span>低 ${formatPrice(stock.low)}</span>
      </div>

      <div class="card-actions">
        <span class="risk-pill" style="--risk-color:${risk.color}">${risk.text} ${stock.risk}</span>
        <button class="watch-btn ${added ? "added" : ""}" data-code="${stock.code}" type="button">${buttonText}</button>
      </div>
    </article>
  `;
}

function renderStats(list) {
  const avgScore = list.length ? Math.round(list.reduce((sum, stock) => sum + stock.score, 0) / list.length) : 0;
  const avgYield = list.length ? list.reduce((sum, stock) => sum + stock.yield, 0) / list.length : 0;

  if (els.matchCount) els.matchCount.textContent = page === "favorites" ? `${list.length} 檔` : list.length;
  if (els.avgScore) els.avgScore.textContent = avgScore;
  if (els.avgYield) els.avgYield.textContent = `${avgYield.toFixed(1)}%`;
}

function renderWatch() {
  const watched = stocks.filter((stock) => state.watch.has(stock.code));
  if (els.watchCount) els.watchCount.textContent = `${watched.length} 檔`;

  if (!els.watchList) return;
  if (!watched.length) {
    els.watchList.className = "watch-list empty";
    els.watchList.textContent = "尚未加入觀察";
    updateRisk([]);
    return;
  }

  els.watchList.className = "watch-list";
  els.watchList.innerHTML = watched
    .map((stock) => {
      const changeClass = stock.change > 0 ? "up" : stock.change < 0 ? "down" : "flat";
      return `
        <div class="watch-item">
          <div>
            <strong>${stock.code} ${stock.name}</strong>
            <span class="${changeClass}">${formatPrice(stock.price)} / ${formatSigned(stock.changePercent, "%")}</span>
          </div>
          <button class="remove-btn" data-remove="${stock.code}" type="button" aria-label="移除 ${stock.name}">×</button>
        </div>
      `;
    })
    .join("");

  updateRisk(watched);
}

function updateRisk(list) {
  if (!els.portfolioRisk || !els.riskFill) return;
  if (!list.length) {
    els.portfolioRisk.textContent = "--";
    els.riskFill.style.width = "0%";
    els.riskFill.style.background = "#16835f";
    return;
  }

  const risk = Math.round(list.reduce((sum, stock) => sum + stock.risk, 0) / list.length);
  const label = riskLabel(risk);
  els.portfolioRisk.textContent = `${label.text} ${risk}`;
  els.riskFill.style.width = `${risk}%`;
  els.riskFill.style.background = label.color;
}

function renderChart(list) {
  if (!els.sectorChart) return;
  const ctx = els.sectorChart.getContext("2d");
  const rect = els.sectorChart.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  els.sectorChart.width = Math.max(1, Math.floor(rect.width * dpr));
  els.sectorChart.height = Math.max(1, Math.floor(rect.height * dpr));
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const width = rect.width;
  const height = rect.height;
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "#fffdfa";
  ctx.fillRect(0, 0, width, height);

  const sectorMap = new Map();
  list.forEach((stock) => {
    const current = sectorMap.get(stock.sector) || { total: 0, count: 0, color: stock.accent };
    current.total += stock.score;
    current.count += 1;
    sectorMap.set(stock.sector, current);
  });

  const data = Array.from(sectorMap, ([sector, value]) => ({
    sector,
    score: Math.round(value.total / value.count),
    color: value.color
  })).slice(0, 6);

  ctx.font = "600 13px Microsoft JhengHei, sans-serif";
  ctx.textBaseline = "middle";

  if (!data.length) {
    ctx.fillStyle = "#697278";
    ctx.fillText("沒有可繪製的產業資料", 24, height / 2);
    return;
  }

  const max = Math.max(...data.map((item) => item.score), 95);
  const rowHeight = Math.min(34, (height - 24) / data.length);
  data.forEach((item, index) => {
    const y = 18 + index * rowHeight;
    const labelWidth = Math.min(118, width * 0.34);
    const barX = labelWidth + 14;
    const barWidth = Math.max(44, width - barX - 46);
    const fillWidth = (item.score / max) * barWidth;

    ctx.fillStyle = "#697278";
    ctx.fillText(item.sector, 4, y + 9);
    ctx.fillStyle = "#e8e1d5";
    roundRect(ctx, barX, y, barWidth, 18, 8);
    ctx.fill();
    ctx.fillStyle = item.color;
    roundRect(ctx, barX, y, fillWidth, 18, 8);
    ctx.fill();
    ctx.fillStyle = "#182026";
    ctx.fillText(String(item.score), barX + barWidth + 12, y + 9);
  });
}

function roundRect(ctx, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

function render() {
  const list = currentStocks();
  renderStats(list);
  renderCards(list);
  renderWatch();
  renderChart(list);
}

function applyRealtime(rows) {
  const realtimeRows = Array.isArray(rows?.msgArray) ? rows.msgArray : [];
  const map = new Map(realtimeRows.map((row) => [String(row.c), row]));

  stocks.forEach((stock) => {
    const row = map.get(stock.code);
    if (!row) return;

    const price = toNumber(row.z) || toNumber(row.y);
    const previousClose = toNumber(row.y);
    stock.price = price || stock.price;
    stock.previousClose = previousClose || stock.previousClose;
    stock.open = toNumber(row.o) || stock.open;
    stock.high = toNumber(row.h) || stock.high;
    stock.low = toNumber(row.l) || stock.low;
    stock.volume = toNumber(row.v) * 1000 || stock.volume;
    stock.change = stock.price && stock.previousClose ? stock.price - stock.previousClose : stock.change;
    stock.changePercent = stock.previousClose ? (stock.change / stock.previousClose) * 100 : stock.changePercent;
  });
}

function applyDaily(rows) {
  const dailyMap = new Map(rows.map((row) => [String(pick(row, ["Code", "證券代號"])).trim(), row]));

  stocks.forEach((stock) => {
    const row = dailyMap.get(stock.code);
    if (!row) return;

    stock.price = toNumber(pick(row, ["ClosingPrice", "收盤價"])) || stock.price;
    stock.change = toNumber(pick(row, ["Change", "漲跌價差"])) || stock.change;
    stock.volume = toNumber(pick(row, ["TradeVolume", "成交股數"])) || stock.volume;
    stock.previousClose = stock.price && stock.change ? stock.price - stock.change : stock.previousClose;
    stock.changePercent = stock.previousClose ? (stock.change / stock.previousClose) * 100 : stock.changePercent;
  });
}

function applyValuation(rows) {
  const valuationMap = new Map(rows.map((row) => [String(pick(row, ["Code", "證券代號"])).trim(), row]));

  stocks.forEach((stock) => {
    const row = valuationMap.get(stock.code);
    if (!row) return;

    const dividendYield = toNumber(pick(row, ["DividendYield", "殖利率(%)"]));
    const pe = toNumber(pick(row, ["PER", "本益比"]));
    if (dividendYield) stock.yield = dividendYield;
    if (pe) stock.pe = pe;
  });
}

async function refreshMarketData() {
  if (state.loading) return;
  state.loading = true;
  if (els.refreshButton) els.refreshButton.disabled = true;
  setDataStatus("正在更新 TWSE 報價與評價資料...");

  try {
    const [dailyRows, valuationRows] = await Promise.all([getJson("daily"), getJson("valuation")]);
    applyDaily(dailyRows);
    applyValuation(valuationRows);

    try {
      applyRealtime(await getJson("realtime"));
    } catch {
      // Daily OpenAPI data is still useful when realtime MIS is unavailable.
    }

    setDataStatus(`已更新：${new Date().toLocaleString("zh-TW", { hour12: false })}`, "ok");
  } catch {
    setDataStatus("無法連線至 TWSE OpenAPI，目前顯示內建觀察資料。", "warn");
  } finally {
    state.loading = false;
    if (els.refreshButton) els.refreshButton.disabled = false;
    render();
  }
}

function bindEvents() {
  els.searchInput?.addEventListener("input", (event) => {
    state.query = event.target.value;
    render();
  });

  els.scoreRange?.addEventListener("input", (event) => {
    state.minScore = Number(event.target.value);
    if (els.scoreLabel) els.scoreLabel.textContent = state.minScore;
    render();
  });

  els.dividendOnly?.addEventListener("change", (event) => {
    state.dividendOnly = event.target.checked;
    render();
  });

  els.sortSelect?.addEventListener("change", (event) => {
    state.sort = event.target.value;
    render();
  });

  els.refreshButton?.addEventListener("click", refreshMarketData);

  document.querySelectorAll("[data-style]").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelectorAll("[data-style]").forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
      state.style = button.dataset.style;
      render();
    });
  });

  document.addEventListener("click", (event) => {
    const watchButton = event.target.closest("[data-code]");
    const removeButton = event.target.closest("[data-remove]");

    if (watchButton) {
      const code = watchButton.dataset.code;
      if (state.watch.has(code)) state.watch.delete(code);
      else state.watch.add(code);
      saveWatchList();
      render();
    }

    if (removeButton) {
      state.watch.delete(removeButton.dataset.remove);
      saveWatchList();
      render();
    }
  });

  window.addEventListener("resize", render);
}

bindEvents();
render();
refreshMarketData();
window.setInterval(refreshMarketData, REFRESH_INTERVAL_MS);
