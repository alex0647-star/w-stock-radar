const STOCK_NAMES = {
  "2330": ["台積電", "半導體"],
  "2454": ["聯發科", "IC 設計"],
  "2308": ["台達電", "電源與散熱"],
  "2317": ["鴻海", "電子代工"],
  "2382": ["廣達", "AI 伺服器"],
  "2881": ["富邦金", "金融"],
  "2891": ["中信金", "金融"],
  "2412": ["中華電", "電信"],
  "2357": ["華碩", "品牌電腦"],
  "2884": ["玉山金", "金融"]
};

const code = getStockCode();
let chart;
let activeRange = "intraday";

const els = {
  title: document.querySelector("#stockTitle"),
  subtitle: document.querySelector("#stockSubtitle"),
  price: document.querySelector("#quotePrice"),
  change: document.querySelector("#quoteChange"),
  open: document.querySelector("#quoteOpen"),
  high: document.querySelector("#quoteHigh"),
  low: document.querySelector("#quoteLow"),
  volume: document.querySelector("#quoteVolume"),
  chart: document.querySelector("#stockChart"),
  crosshair: document.querySelector("#crosshairInfo")
};

init();

function getStockCode() {
  const pathCode = window.location.pathname.match(/\/stock\/(\d{4})/)?.[1];
  const queryCode = new URLSearchParams(window.location.search).get("code");
  return pathCode || queryCode || "2330";
}

function formatPrice(value) {
  return Number.isFinite(value)
    ? value.toLocaleString("zh-TW", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : "--";
}

function formatSigned(value, suffix = "") {
  if (!Number.isFinite(value) || value === 0) return `0${suffix}`;
  return `${value > 0 ? "+" : ""}${value.toFixed(2)}${suffix}`;
}

function formatVolume(value) {
  return Number.isFinite(value) ? `${Math.round(value / 1000).toLocaleString("zh-TW")} 張` : "--";
}

async function init() {
  const [name, sector] = STOCK_NAMES[code] || [`${code}`, "台灣股票"];
  els.title.textContent = `${code} ${name}`;
  els.subtitle.textContent = `${sector} / 即時行情與 K 線`;

  if (!window.echarts) {
    els.chart.innerHTML = '<div class="chart-empty">圖表套件載入失敗，請確認網路可連線至 CDN 後重新整理。</div>';
    await loadRealtime();
    return;
  }

  chart = echarts.init(els.chart, null, { renderer: "canvas" });
  window.addEventListener("resize", () => chart.resize());

  document.querySelectorAll("[data-range]").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelectorAll("[data-range]").forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
      activeRange = button.dataset.range;
      loadChart(activeRange);
    });
  });

  await Promise.all([loadRealtime(), loadChart(activeRange)]);
  window.setInterval(loadRealtime, 30000);
}

async function loadRealtime() {
  try {
    const response = await fetch(`/api/stock/${code}/realtime`, { cache: "no-store" });
    if (!response.ok) throw new Error("quote failed");
    const data = await response.json();
    renderQuote(data.quote);
  } catch {
    els.subtitle.textContent = "即時行情暫時無法更新，圖表仍可查看歷史資料";
  }
}

function renderQuote(quote = {}) {
  const changeClass = quote.change > 0 ? "up" : quote.change < 0 ? "down" : "flat";
  els.price.textContent = formatPrice(quote.price);
  els.change.textContent = `${formatSigned(quote.change)} / ${formatSigned(quote.changePercent, "%")}`;
  els.change.className = changeClass;
  els.open.textContent = formatPrice(quote.open);
  els.high.textContent = formatPrice(quote.high);
  els.low.textContent = formatPrice(quote.low);
  els.volume.textContent = formatVolume(quote.volume);
}

async function loadChart(range) {
  chart.showLoading("default", { text: "讀取行情資料..." });

  try {
    const endpoint =
      range === "intraday"
        ? `/api/stock/${code}/realtime`
        : `/api/stock/${code}/kline?type=${range}`;
    const response = await fetch(endpoint, { cache: "no-store" });
    if (!response.ok) throw new Error("chart failed");
    const data = await response.json();

    if (range === "intraday") {
      renderIntraday(data.points || []);
    } else {
      renderKline(data.items || [], range);
    }
  } catch {
    renderEmptyChart();
  } finally {
    chart.hideLoading();
  }
}

function renderIntraday(points) {
  const data = points.map((item) => [item.time, item.price, item.volume]);
  chart.setOption({
    animation: false,
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "cross" },
      formatter: (params) => {
        const row = params[0]?.data;
        if (!row) return "";
        return `${row[0]}<br/>成交價：${formatPrice(row[1])}<br/>成交量：${formatVolume(row[2])}`;
      }
    },
    grid: [{ left: 54, right: 24, top: 28, height: "58%" }, { left: 54, right: 24, top: "74%", height: "14%" }],
    xAxis: [
      { type: "category", data: data.map((item) => item[0]), boundaryGap: false, axisLabel: { color: "#697278" } },
      { type: "category", data: data.map((item) => item[0]), gridIndex: 1, boundaryGap: false, axisLabel: { show: false } }
    ],
    yAxis: [
      { scale: true, axisLabel: { color: "#697278" }, splitLine: { lineStyle: { color: "#eee7dc" } } },
      { gridIndex: 1, axisLabel: { color: "#697278" }, splitLine: { show: false } }
    ],
    dataZoom: [{ type: "inside", xAxisIndex: [0, 1] }],
    series: [
      { name: "分時成交價", type: "line", data: data.map((item) => item[1]), smooth: true, showSymbol: false, lineStyle: { color: "#2563eb", width: 2 }, areaStyle: { color: "rgba(37,99,235,0.10)" } },
      { name: "成交量", type: "bar", xAxisIndex: 1, yAxisIndex: 1, data: data.map((item) => item[2]), itemStyle: { color: "#9ca3af" } }
    ]
  }, true);

  chart.off("updateAxisPointer");
  chart.on("updateAxisPointer", (event) => {
    const index = event.axesInfo?.[0]?.value;
    const row = data[index];
    if (row) els.crosshair.textContent = `${row[0]}  成交價 ${formatPrice(row[1])}  成交量 ${formatVolume(row[2])}`;
  });
}

function renderKline(items, range) {
  const dates = items.map((item) => item.date);
  const values = items.map((item) => [item.open, item.close, item.low, item.high]);
  const volumes = items.map((item) => item.volume);

  chart.setOption({
    animation: false,
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "cross" },
      formatter: (params) => {
        const candle = params.find((item) => item.seriesType === "candlestick");
        const volume = params.find((item) => item.seriesName === "成交量");
        if (!candle) return "";
        const [open, close, low, high] = candle.data;
        return `${candle.name}<br/>開：${formatPrice(open)} 高：${formatPrice(high)}<br/>低：${formatPrice(low)} 收：${formatPrice(close)}<br/>成交量：${formatVolume(volume?.data)}`;
      }
    },
    grid: [{ left: 54, right: 24, top: 28, height: "58%" }, { left: 54, right: 24, top: "74%", height: "14%" }],
    xAxis: [
      { type: "category", data: dates, boundaryGap: true, axisLabel: { color: "#697278" } },
      { type: "category", data: dates, gridIndex: 1, boundaryGap: true, axisLabel: { show: false } }
    ],
    yAxis: [
      { scale: true, axisLabel: { color: "#697278" }, splitLine: { lineStyle: { color: "#eee7dc" } } },
      { gridIndex: 1, axisLabel: { color: "#697278" }, splitLine: { show: false } }
    ],
    dataZoom: [{ type: "inside", xAxisIndex: [0, 1] }, { type: "slider", xAxisIndex: [0, 1], bottom: 8, height: 18 }],
    series: [
      {
        name: `${range} K`,
        type: "candlestick",
        data: values,
        itemStyle: {
          color: "#c2413d",
          color0: "#16835f",
          borderColor: "#c2413d",
          borderColor0: "#16835f"
        }
      },
      { name: "成交量", type: "bar", xAxisIndex: 1, yAxisIndex: 1, data: volumes, itemStyle: { color: "#9ca3af" } }
    ]
  }, true);

  chart.off("updateAxisPointer");
  chart.on("updateAxisPointer", (event) => {
    const index = event.axesInfo?.[0]?.value;
    const item = items[index];
    if (item) {
      els.crosshair.textContent = `${item.date}  O ${formatPrice(item.open)} H ${formatPrice(item.high)} L ${formatPrice(item.low)} C ${formatPrice(item.close)}  量 ${formatVolume(item.volume)}`;
    }
  });
}

function renderEmptyChart() {
  chart.setOption({
    title: { text: "目前無法取得圖表資料", left: "center", top: "middle", textStyle: { color: "#697278", fontSize: 15 } },
    xAxis: { show: false },
    yAxis: { show: false },
    series: []
  }, true);
}
