# 台灣股市推薦觀察台部署說明

這個專案是一個純前端台股觀察工具，搭配 Vercel Serverless Function 代理 TWSE 資料來源，避免瀏覽器直接請求時遇到 CORS 或 Referer 限制。

## 功能

- 顯示 10 檔台股推薦觀察清單，含推薦分數、推薦理由、股價、漲跌幅、成交量、殖利率、本益比與風險標籤。
- 可搜尋代號、股票名稱與產業。
- 可依成長、收益、價值篩選，也可調整最低推薦分數與殖利率條件。
- 可加入「我的最愛」，資料會保存在瀏覽器 localStorage。
- 另有 `favorites.html` 最愛觀察頁，可集中查看已收藏股票。
- 每 5 分鐘自動更新一次，也可按「立即更新」手動刷新。

## 資料來源

- 每日收盤與成交資料：`https://openapi.twse.com.tw/v1/exchangeReport/STOCK_DAY_ALL`
- 殖利率與本益比資料：`https://openapi.twse.com.tw/v1/exchangeReport/BWIBBU_ALL`
- 即時報價：透過 `/api/twse?type=realtime&codes=2330,2454...` 代理 TWSE MIS 報價。

資料可能受到交易所延遲、休市、盤後或部署環境限制影響。畫面上的推薦分數是觀察模型，不是投資建議。

## 本機預覽

在專案根目錄執行：

```bash
python -m http.server 8000 --bind 127.0.0.1
```

再打開：

```text
http://127.0.0.1:8000/index.html
```

純靜態預覽時，`/api/twse` 不會存在，前端會嘗試直接讀取 TWSE OpenAPI；即時 MIS 報價建議部署到 Vercel 後測試。

## Vercel 部署

1. 將專案推到 GitHub repository。
2. 到 Vercel 新增專案並匯入 repository。
3. Framework Preset 選 `Other`。
4. Build command 與 Output directory 可留空。
5. 部署完成後，Vercel 會使用 `api/twse.js` 提供 `/api/twse` proxy。

## GitHub Pages 或 Netlify

可以部署靜態檔案，但這兩種方式不會執行 `api/twse.js`。若要完整的即時報價 proxy，建議使用 Vercel 或自行提供相同 API proxy。
