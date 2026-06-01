const stocks = [
  ["2330", "台積電", "半導體", "growth", 95, 1.7, 92, 32, 24.8, "#2563eb", "AI 晶片、高效能運算與先進製程需求仍是核心動能，長線競爭力明確，但評價已反映高成長期待。"],
  ["2454", "聯發科", "IC 設計", "growth", 90, 4.1, 78, 42, 18.6, "#0891b2", "手機、Wi-Fi、車用與邊緣 AI 題材提供成長想像，現金配息也具吸引力，適合成長收益並重觀察。"],
  ["2308", "台達電", "電源與散熱", "growth", 88, 1.9, 82, 37, 26.4, "#16a34a", "資料中心電源、散熱、電動車與工業自動化都是中長期題材，營運品質佳，適合拉回分批追蹤。"],
  ["2317", "鴻海", "電子代工", "value", 86, 3.0, 85, 45, 14.8, "#7c3aed", "AI 伺服器、電動車與代工規模優勢帶來重新評價機會，股價波動較大，需留意追價風險。"],
  ["2382", "廣達", "AI 伺服器", "growth", 85, 3.6, 87, 56, 20.2, "#dc2626", "AI 伺服器出貨能見度高，動能強但籌碼與題材敏感度也高，適合設好停損與分批策略。"],
  ["2881", "富邦金", "金融", "income", 83, 5.2, 60, 30, 12.7, "#ca8a04", "壽險與銀行獲利修復時具配息想像，適合收益型投資人觀察，但仍需留意利率與匯率變化。"],
  ["2891", "中信金", "金融", "income", 82, 4.8, 58, 28, 11.9, "#b45309", "銀行本業穩健、配息期待較清楚，價格彈性通常低於電子股，適合作為觀察組合的穩定部位。"],
  ["2412", "中華電", "電信", "income", 79, 3.7, 43, 20, 24.1, "#0f766e", "現金流與配息穩定，波動較低，適合防禦配置；短線爆發力有限，較適合作為核心觀察股。"],
  ["2357", "華碩", "品牌電腦", "value", 78, 4.4, 54, 40, 14.1, "#4d7c0f", "PC 景氣循環回溫與 AI PC 題材提供支撐，評價相對溫和，適合用殖利率與景氣循環角度觀察。"],
  ["2884", "玉山金", "金融", "income", 76, 4.2, 48, 27, 13.4, "#059669", "資產品質與獲利穩定度佳，適合偏保守的金融股觀察名單；成長速度通常不如高 beta 電子股。"]
].map(([code, name, sector, style, score, yieldRate, momentum, risk, pe, accent, reason]) => ({
  code,
  name,
  sector,
  style,
  score,
  yield: yieldRate,
  momentum,
  risk,
  pe,
  accent,
  reason,
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
    return stocks.filter((stock) => state.watch.has(stock.code));
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

  return `
    <article class="stock-card" style="--accent:${stock.accent}">
      <div class="stock-head">
        <div class="stock-title">
          <h3>${stock.code} ${stock.name}</h3>
          <span class="stock-meta">${stock.sector}</span>
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
        <div class="metric"><span>成交量</span><strong>${stock.volume ? Math.round(stock.volume / 1000).toLocaleString("zh-TW") + " 張" : "--"}</strong></div>
      </div>

      <p class="reason">${stock.reason}</p>

      <div class="session-row">
        <span>開 ${formatPrice(stock.open)}</span>
        <span>高 ${formatPrice(stock.high)}</span>
        <span>低 ${formatPrice(stock.low)}</span>
      </div>

      <div class="card-actions">
        <span class="risk-pill" style="--risk-color:${risk.color}">${risk.text} ${stock.risk}</span>
        <div class="card-buttons">
          <button class="analyze-btn" data-analyze="${stock.code}" type="button">分析策略</button>
          <button class="watch-btn ${added ? "added" : ""}" data-code="${stock.code}" type="button">${buttonText}</button>
        </div>
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
      // Daily data remains available when realtime MIS is blocked.
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
    const analyzeButton = event.target.closest("[data-analyze]");
    const closeBtn = event.target.closest("#closeModalBtn");
    const overlay = event.target;

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

    if (analyzeButton) {
      openAnalysisModal(analyzeButton.dataset.analyze);
    }

    if (closeBtn || (overlay && overlay.id === "analysisModal")) {
      closeAnalysisModal();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeAnalysisModal();
    }
  });

  window.addEventListener("resize", render);
}

/* ==========================================================================
   個股策略與分析邏輯 (Modal & Strategy Analysis Implementation)
   ========================================================================== */

let currentAnalysisStock = null;

function openAnalysisModal(stockCode) {
  const stock = stocks.find((s) => s.code === stockCode);
  if (!stock) return;

  currentAnalysisStock = stock;
  const modal = document.querySelector("#analysisModal");
  const modalBody = document.querySelector("#modalBody");

  if (!modal || !modalBody) return;

  // 初始試算參數設定
  const defaultAmount = 100000;
  const defaultPeriod = "long";

  // 渲染初始版面樣式
  modalBody.innerHTML = generateAnalysisHtml(stock, defaultAmount, defaultPeriod);

  // 延遲載入進度條動畫以利瀏覽器渲染過渡
  setTimeout(() => {
    const bars = modalBody.querySelectorAll(".indicator-progress-inner");
    bars.forEach((bar) => {
      const val = bar.dataset.val;
      bar.style.width = `${val}%`;
    });
  }, 40);

  // 開啟視窗
  modal.classList.add("active");
  modal.setAttribute("aria-hidden", "false");

  // 綁定智慧試算事件
  const amountInput = modalBody.querySelector("#investmentAmount");
  const periodSelect = modalBody.querySelector("#investmentPeriod");

  const updateCalc = () => {
    const amount = toNumber(amountInput.value) || 0;
    const period = periodSelect.value;
    const results = calculateStockStrategy(stock, amount, period);

    const sharesEl = modalBody.querySelector("#calcShares");
    const dividendEl = modalBody.querySelector("#calcDividend");
    const strategyEl = modalBody.querySelector("#strategyAdvice");

    if (sharesEl) sharesEl.innerHTML = results.sharesText;
    if (dividendEl) dividendEl.textContent = results.dividendText;
    if (strategyEl) {
      strategyEl.querySelector("h5").textContent = results.strategyTitle;
      strategyEl.querySelector("p").textContent = results.strategyBody;
    }
  };

  amountInput?.addEventListener("input", updateCalc);
  periodSelect?.addEventListener("change", updateCalc);
}

function closeAnalysisModal() {
  const modal = document.querySelector("#analysisModal");
  if (!modal) return;
  modal.classList.remove("active");
  modal.setAttribute("aria-hidden", "true");
  currentAnalysisStock = null;
}

function calculateStockStrategy(stock, amount, period) {
  const price = stock.price || 0;
  const yieldVal = stock.yield || 0;

  // 1. 預估可買進股數計算
  let sharesText = "--";
  if (price > 0) {
    const shares = Math.floor(amount / price);
    if (shares >= 1000) {
      const lots = Math.floor(shares / 1000);
      const remain = shares % 1000;
      sharesText = `<span class="highlight">${shares.toLocaleString("zh-TW")}</span> 股 <small>(${lots} 張${remain ? ` + ${remain} 股` : ""})</small>`;
    } else if (shares > 0) {
      sharesText = `<span class="highlight">${shares}</span> 股 <small>(零股交易)</small>`;
    } else {
      sharesText = `<span class="highlight">0</span> 股 <small>(資金不足買 1 股)</small>`;
    }
  } else {
    sharesText = `<span style="color:var(--red)">請立即更新報價</span>`;
  }

  // 2. 年估計股利回報
  const estDividend = Math.round(amount * (yieldVal / 100));
  const dividendText = price > 0 ? `NT$ ${estDividend.toLocaleString("zh-TW")} 元 / 年` : "--";

  // 3. 建議買點、停利目標與停損價位
  let buyLevel = "--";
  let profitLevel = "--";
  let stopLevel = "--";

  if (price > 0) {
    if (stock.style === "growth") {
      buyLevel = formatPrice(price * 0.96);
      profitLevel = formatPrice(price * 1.15);
      stopLevel = formatPrice(price * 0.91);
    } else if (stock.style === "value") {
      buyLevel = formatPrice(price * 0.95);
      profitLevel = formatPrice(price * 1.18);
      stopLevel = formatPrice(price * 0.90);
    } else { // income
      buyLevel = formatPrice(price * 0.98);
      profitLevel = formatPrice(price * 1.08);
      stopLevel = formatPrice(price * 0.95);
    }
  }

  // 4. 客製化交易策略內容
  let strategyTitle = "";
  let strategyBody = "";

  if (period === "swing") {
    strategyTitle = "📊 波段操作建議策略";
    if (stock.style === "growth") {
      strategyBody = `建議設定 10 日均線（約 ${buyLevel} 元）附近為分批波段切入點。若股價跌破月線或支撐關卡（約 ${stopLevel} 元）則應嚴格停損。第一階段停利目標設為 ${profitLevel} 元，預估有 15% 上檔空間。`;
    } else if (stock.style === "value") {
      strategyBody = `本益比偏低具備高度安全邊際。適合在股價回檔至區間下緣（約 ${buyLevel} 元）分批承接。一旦轉型或伺服器題材發酵帶動評價修復、股價向停利點 ${profitLevel} 元靠攏時即可分批獲利了結。`;
    } else {
      strategyBody = `收益型標的波動度極低，短線波段空間偏窄。若逢盤勢修正使股價跌至 ${buyLevel} 元可酌量介入，反彈至停利目標 ${profitLevel} 元即可獲利入袋，操作不宜過度追價。`;
    }
  } else {
    strategyTitle = "📈 長期投資配置策略";
    if (stock.style === "growth") {
      strategyBody = `長線高成長領先股，極適合以『定期定額』建立基本部位。若遇大盤系統性修正導致股價跌幅達 10-15%（跌破 ${stopLevel} 元）時，建議採單筆額外加碼。策略以中長線持有為主，充分享受行業長期增值的複利效應。`;
    } else if (stock.style === "value") {
      strategyBody = `適合在中長線景氣循環底部或轉型期逢低分批布局。建議設定 1 年以上的持有耐心，在股價低於 ${buyLevel} 元時逐步累積部位，靜待營運體質优化與盈餘重新評價的到來。`;
    } else {
      strategyBody = `核心存股標的。建議採取『逢黑 K 買進』策略以降低平均持有成本。當股價低於 ${buyLevel} 元時是極佳的加碼扣款點，並建議將每年領取的現金股利持續『複利再投資』，發揮長線滾雪球的最大綜效。`;
    }
  }

  return {
    sharesText,
    dividendText,
    buyLevel,
    profitLevel,
    stopLevel,
    strategyTitle,
    strategyBody
  };
}

function generateAnalysisHtml(stock, amount, period) {
  // 根據投資類型計算指標雷達圖佔比 (成長潛力、防禦屬性、收益回報、市場動能)
  let growthRating = 50;
  let defenseRating = 50;
  let yieldRating = 50;
  let momentumRating = Math.round(stock.momentum);

  if (stock.style === "growth") {
    growthRating = 94;
    defenseRating = 55;
    yieldRating = 42;
  } else if (stock.style === "value") {
    growthRating = 74;
    defenseRating = 72;
    yieldRating = 60;
  } else if (stock.style === "income") {
    growthRating = 40;
    defenseRating = 92;
    yieldRating = 88;
  }

  // 根據風險係數與實際殖利率動態微調評分
  if (stock.risk <= 32) defenseRating = Math.max(defenseRating, 94);
  else if (stock.risk > 48) defenseRating = Math.min(defenseRating, 48);

  if (stock.yield >= 4.5) yieldRating = Math.max(yieldRating, 92);
  else if (stock.yield < 2.0) yieldRating = Math.min(yieldRating, 35);

  // 動態評價分析評語
  let peComment = "";
  if (!stock.pe) {
    peComment = "目前尚無本益比資料，暫不進行評價估算。建議參考同業水準。";
  } else if (stock.pe < 15) {
    peComment = `當前本益比僅為 <b>${stock.pe.toFixed(1)} 倍</b>，顯著低於歷史均值，安全邊際極高。在市場重新評價前，為絕佳的價值佈局點。`;
  } else if (stock.pe >= 15 && stock.pe <= 25) {
    peComment = `當前本益比為 <b>${stock.pe.toFixed(1)} 倍</b>，處於合理價值區間，反映市場對於公司穩健盈餘成長與產業地位的期待。`;
  } else {
    peComment = `當前本益比為 <b>${stock.pe.toFixed(1)} 倍</b>，溢價反映市場對其在 AI、先進製程等領域高速成長的強烈預期。操作需留意短期技術性震盪。`;
  }

  let yieldComment = "";
  if (stock.yield >= 4.0) {
    yieldComment = `當前殖利率高達 <b>${stock.yield.toFixed(1)}%</b>，提供極佳的防禦性支撐與強勁現金流，非常適合作為收益型存股配置。`;
  } else if (stock.yield >= 2.5 && stock.yield < 4.0) {
    yieldComment = `當前殖利率為 <b>${stock.yield.toFixed(1)}%</b>，配息表現屬中等穩健，兼顧公司擴大營運的資本保留與股東股利回饋。`;
  } else {
    yieldComment = `當前殖利率為 <b>${stock.yield.toFixed(1)}%</b>，並非主打高配息標的。公司盈餘多數保留以投入高研發及先進製程，適合追求長期資本增值的投資人。`;
  }

  const results = calculateStockStrategy(stock, amount, period);
  const styleLabel = stock.style === "growth" ? "成長型" : stock.style === "value" ? "價值型" : "收益型";

  return `
    <div class="modal-stock-header">
      <div class="modal-stock-title">
        <h2 id="modalTitle">${stock.code} ${stock.name}</h2>
        <span class="modal-stock-style-tag ${stock.style}">${styleLabel}</span>
        <span class="risk-pill" style="--risk-color:${riskLabel(stock.risk).color}">${riskLabel(stock.risk).text} ${stock.risk}</span>
      </div>
      <div class="modal-stock-subtitle">
        <span>產業分類：<b>${stock.sector}</b></span>
        <span>推薦總分：<b>${stock.score} 分</b></span>
      </div>
    </div>

    <div class="modal-grid">
      <!-- 左欄：推薦原因與量規指標 -->
      <div class="analysis-info-col">
        <div class="indicators-panel">
          <div class="indicator-row">
            <span class="indicator-label">成長潛力</span>
            <div class="indicator-progress-outer">
              <div class="indicator-progress-inner" style="background:var(--teal); width:0%" data-val="${growthRating}"></div>
            </div>
            <span class="indicator-value">${growthRating}%</span>
          </div>
          <div class="indicator-row">
            <span class="indicator-label">防禦屬性</span>
            <div class="indicator-progress-outer">
              <div class="indicator-progress-inner" style="background:var(--green); width:0%" data-val="${defenseRating}"></div>
            </div>
            <span class="indicator-value">${defenseRating}%</span>
          </div>
          <div class="indicator-row">
            <span class="indicator-label">收益回報</span>
            <div class="indicator-progress-outer">
              <div class="indicator-progress-inner" style="background:var(--amber); width:0%" data-val="${yieldRating}"></div>
            </div>
            <span class="indicator-value">${yieldRating}%</span>
          </div>
          <div class="indicator-row">
            <span class="indicator-label">市場動能</span>
            <div class="indicator-progress-outer">
              <div class="indicator-progress-inner" style="background:var(--red); width:0%" data-val="${momentumRating}"></div>
            </div>
            <span class="indicator-value">${momentumRating}%</span>
          </div>
        </div>

        <div class="dynamic-analysis-box">
          <div class="analysis-card" style="border-left: 4px solid ${stock.accent}">
            <h4>
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true">
                <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                <path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533L8.93 6.588zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/>
              </svg>
              推薦核心原因
            </h4>
            <p>${stock.reason}</p>
          </div>

          <div class="analysis-card" style="border-left: 4px solid var(--teal)">
            <h4>
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true">
                <path d="M4 11H2v3h2v-3zm5-4H7v7h2V7zm5-5v12h-2V2h2zm-2-1a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1h-2zM6 7a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V7zm-5 4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1v-3z"/>
              </svg>
              估值合理性分析
            </h4>
            <p>${peComment}</p>
          </div>

          <div class="analysis-card" style="border-left: 4px solid var(--amber)">
            <h4>
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true">
                <path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zm0-1a8 8 0 1 1 0 16A8 8 0 0 1 8 0z"/>
                <path d="M4 8a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7A.5.5 0 0 1 4 8z"/>
              </svg>
              殖利率與現金流
            </h4>
            <p>${yieldComment}</p>
          </div>
        </div>
      </div>

      <!-- 右欄：智慧策略計算器 -->
      <div class="strategy-calc-col">
        <div class="calc-box">
          <h3 class="calc-title">智慧投資試算</h3>
          <div class="calc-input-group">
            <label class="calc-field">
              <span>預計投資金額 (NTD)</span>
              <div class="calc-input-wrapper">
                <input id="investmentAmount" type="number" value="${amount}" min="1000" step="5000" />
                <span class="calc-input-unit">元</span>
              </div>
            </label>
            <label class="calc-field">
              <span>選擇投資週期</span>
              <select id="investmentPeriod">
                <option value="long" ${period === "long" ? "selected" : ""}>長期存股佈局</option>
                <option value="swing" ${period === "swing" ? "selected" : ""}>波段操作交易</option>
              </select>
            </label>
          </div>

          <div class="calc-results">
            <div class="calc-result-item">
              <span>預估可買進股數</span>
              <strong id="calcShares">${results.sharesText}</strong>
            </div>
            <div class="calc-result-item">
              <span>估計年配息收益</span>
              <strong id="calcDividend" class="highlight">${results.dividendText}</strong>
            </div>
            ${stock.price === 0 ? `
              <div class="price-warning">
                ⚠️ 目前顯示為系統初始價，建議點擊「立即更新」獲取 TWSE 即時股價，以利策略價位試算。
              </div>
            ` : ""}
          </div>
        </div>

        <div class="strategy-suggest-panel">
          <div class="target-levels-grid">
            <div class="level-card buy">
              <span>建議買點</span>
              <strong>${results.buyLevel}</strong>
            </div>
            <div class="level-card profit">
              <span>停利目標</span>
              <strong>${results.profitLevel}</strong>
            </div>
            <div class="level-card stop">
              <span>嚴格停損</span>
              <strong>${results.stopLevel}</strong>
            </div>
          </div>

          <div id="strategyAdvice" class="strategy-advice-text">
            <h5>${results.strategyTitle}</h5>
            <p>${results.strategyBody}</p>
          </div>
        </div>
      </div>
    </div>
  `;
}

bindEvents();
render();
refreshMarketData();
window.setInterval(refreshMarketData, REFRESH_INTERVAL_MS);

