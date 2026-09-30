# 旅行手帳

每趟旅行的行程、待辦、代購、花費，資料全部住在 Notion，這個網站只負責讀出來排好給手機看。

## 資料從哪來

- **旅程總覽**（Notion「旅行手帳系統」頁底下的資料庫）：一列就是一趟旅行，記日期、航班、時區、幣別，還有那趟四個資料庫的 id。
- **每趟的主頁**（Notion「旅行計劃」底下）：行程／待辦／代購／花費四個資料庫。
- 格式欄寫「手帳」的旅行，四個分頁都有；寫「舊頁」的是 2026/09 以前的舊格式，只顯示行程和代購，欄位照原本 Notion 的樣子列出來。

要改內容就去 Notion 改，網站按重新整理就會跟上。每一列展開後都有「在 Notion 改」按鈕。

## 新開一趟旅行

跟 Claude 說「開一趟 YYYY/MM 某地」。Claude 會在 Notion 建好那趟的主頁和四個資料庫，再到旅程總覽新增一列，網站首頁就會多一張卡。

## 第一次上線（只要做一次）

1. **Notion 建整合**：到 https://www.notion.so/profile/integrations 新增一個 Internal integration，權限只勾「讀取內容」，複製 Internal Integration Secret。
2. **讓整合看得到資料**：在 Notion 打開「旅行手帳系統」和「旅行計劃」兩頁，右上角 ⋯ → Connections → 加入剛剛那個整合。
3. **Vercel 匯入這個 repo**，在 Settings → Environment Variables 加兩個：
   - `NOTION_TOKEN`：第 1 步的 Secret
   - `JOURNAL_PASSCODE`：自己訂一組通關密語。網站有你的訂位代號和地址，沒有密語的人看不到資料。
4. 重新 deploy，打開網址輸入通關密語。手機會記住，下次不用再輸入。

## 本機預覽

```bash
npm run demo     # 用假資料，通關密語 demo，開 http://localhost:3000
npm test         # 測試 API 讀 Notion 的邏輯
NOTION_TOKEN=... JOURNAL_PASSCODE=... npm run dev   # 讀真的 Notion
```

## 檔案

| 路徑 | 做什麼 |
| --- | --- |
| `index.html`、`journal.js`、`journal.css` | 網站本體：旅程列表、單趟的行程／待辦／代購／花費／資料分頁 |
| `api/trips.js` | 讀旅程總覽，回傳全部旅行 |
| `api/trip.js` | 讀單趟旅行的四個資料庫 |
| `api/_notion.js` | 連 Notion、檢查通關密語 |
| `archive/2026-05-chiangmai/` | 2026/05 清邁員旅的原網站，原封不動保留 |
| `test/`、`scripts/` | 測試與本機預覽，不會被 deploy |

## 時間怎麼顯示

行程每列的「時區」欄寫「台北」就用台北時間，寫「當地」就用那趟的時區。空白時看地點的起點：從桃園、松山、天母、台北出發的算台北時間，其他算當地時間。
