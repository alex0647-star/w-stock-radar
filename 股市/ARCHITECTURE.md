# 台灣股票推薦與追蹤網頁分階段設計

## 階段一：系統架構與資料庫設計

### 建議技術棧

目前專案是純前端加 Vercel API proxy，適合快速部署。若要升級成正式產品，建議：

- 前端：Next.js 或 React + Vite，搭配 Tailwind CSS。
- 後端：Next.js API Routes、Node.js Express 或 FastAPI。
- 資料庫：PostgreSQL，搭配 Prisma ORM。
- 即時更新：短期使用 Polling，每 15 至 60 秒更新；正式版可用 WebSocket 或 Server-Sent Events。
- 部署：Vercel 適合前端與輕量 API；若 WebSocket 需求較重，可改 Railway、Render、Fly.io 或自架 VPS。

### Database Schema

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  display_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE stock_list (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  market TEXT NOT NULL DEFAULT 'TWSE',
  sector TEXT,
  style TEXT CHECK (style IN ('growth', 'income', 'value')),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE watchlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  stock_id UUID NOT NULL REFERENCES stock_list(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, stock_id)
);

CREATE TABLE recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stock_id UUID NOT NULL REFERENCES stock_list(id) ON DELETE CASCADE,
  score INTEGER NOT NULL CHECK (score BETWEEN 0 AND 100),
  reason JSONB NOT NULL,
  strategy_summary TEXT NOT NULL,
  entry_range TEXT,
  take_profit TEXT,
  stop_loss TEXT,
  strategy_note TEXT,
  source TEXT DEFAULT 'admin',
  published_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT TRUE
);
```

### 台股資料 API 來源

- TWSE OpenAPI：免費，適合收盤價、成交量、殖利率、本益比等公開資料。
- TWSE MIS：可取得近即時報價，但部署環境可能受 Referer 或限制影響。
- FinMind：適合歷史股價、法人買賣超、營收、財報等研究資料。
- Fugle 富果 API：正式產品較適合，台股即時與歷史資料完整，但需申請與管理 API key。
- Yahoo Finance：可作備援，但穩定性與授權條件要自行評估。

## 階段二：前端 UI/UX 介面設計

目前已實作：

- 搜尋列：支援股票代號、名稱、產業即時篩選。
- 推薦股票卡片：顯示名稱、代號、即時價格、漲跌、殖利率、本益比、成交量。
- 推薦原因：每檔股票以 2 至 3 點顯示核心理由。
- 建議策略：顯示策略摘要、進場區間、停利目標、停損防守點與備註。
- 我的最愛：使用 localStorage 保存，主頁與 `favorites.html` 共用。
- RWD：桌機雙欄卡片，手機改單欄。

下一步可加入：

- 星號收藏 icon。
- 股票詳情 modal。
- 產業與投資風格 tabs。
- 風險等級與推薦分數視覺化。

## 階段三：後端 API 與即時數據串接

正式版 API 建議：

```text
GET    /api/stocks
GET    /api/stocks/:code
GET    /api/recommendations
POST   /api/watchlist
DELETE /api/watchlist/:stockId
GET    /api/watchlist?userId=...
```

### GET /api/stocks

回傳推薦股票清單，並在後端串接 TWSE、FinMind 或 Fugle 補上最新價格、漲跌幅、成交量與估值資料。

### POST /api/watchlist

body：

```json
{
  "userId": "uuid",
  "stockId": "uuid"
}
```

### DELETE /api/watchlist/:stockId

依 `userId` 與 `stockId` 刪除最愛關聯。

### 即時更新策略

- MVP：前端 Polling，每 60 秒打 `/api/stocks`。
- 交易時段：可縮短為 15 秒。
- 正式版：後端定時抓取第三方報價後寫入 Redis cache，再用 WebSocket 或 SSE 推送給前端。

## 階段四：AI 推薦原因與策略生成

若之後串接 OpenAI API，可將每檔股票的盤後資料輸入模型，產生結構化推薦內容。

### 建議輸出格式

```json
{
  "stockName": "台積電",
  "code": "2330",
  "reason": [
    "AI 與 HPC 需求支撐先進製程訂單。",
    "毛利率與資本支出顯示長期競爭力。",
    "大型權值股流動性佳，適合核心配置。"
  ],
  "strategy": {
    "summary": "偏長線配置，拉回分批建立部位。",
    "entryRange": "月線附近或回測支撐",
    "takeProfit": "上漲 12% 至 18% 分批",
    "stopLoss": "跌破月線且量能轉弱",
    "note": "保留資金應對大盤修正。"
  }
}
```

### System Prompt 範例

```text
你是一位精通台灣股市的證券分析師。請根據輸入的股票代號、產業、價格、K 線、法人買賣超、營收與估值資料，輸出繁體中文 JSON。內容需包含推薦原因 2-3 點，以及建議策略、進場區間、停利目標、停損防守點。避免保證獲利，並加入風險提醒。
```

## 目前專案狀態

目前版本仍是前端 localStorage MVP，適合展示與快速部署。若要變成多使用者正式產品，下一步應新增登入、PostgreSQL、Recommendation 後台管理與正式行情 API key。
