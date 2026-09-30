# 旅行手帳 換手筆記

最後更新：2026-10-01 出發前。下次接手時先讀這份。

## 怎麼接著做

開一個新的 Claude Code session，選 `studio-retreat-2026` 這個 repo，然後說：

> 切到 travel-journal 分支，讀 HANDOFF.md，接著把旅行手帳做完。

## 現在的狀態

| 項目 | 狀態 |
| --- | --- |
| 網站本體（首頁、單趟五個分頁、通關密語） | 做完，在 `travel-journal` 分支 |
| 讀 Notion 的 API | 做完，6 項測試通過（`npm test`） |
| 用假資料在手機寬度實測 | 做完，7 個行程時間都跟 Notion 對得上 |
| 五月清邁員旅網站 | 原封不動搬到 `archive/2026-05-chiangmai/` |
| 新 repo `travel-journal` | **還沒建**。Claude 沒有開 repo 的權限，要 Ryan 自己開 |
| Notion 整合鑰匙 | **還沒建** |
| Vercel 上線 | **還沒做** |
| 用真的 Notion 資料測試 | **還沒做**，要等鑰匙 |

`main` 分支沒動過，舊網站照常在線上。

## 剩下的步驟

### Ryan 要做（Claude 做不了的）

1. **開 GitHub repo**：名字 `travel-journal`，選 Private，不要勾 README。確認 Claude GitHub App 有權限碰它（https://claude.ai/connect-github）。
2. **建 Notion 整合**：https://www.notion.so/profile/integrations 新增 Internal integration，只勾讀取內容，複製 Secret。
3. **把整合加進兩頁**：Notion 打開「旅行手帳系統」和「旅行計劃」，右上角 ⋯ → Connections → 加入整合。
4. **訂一組通關密語**，自己記好。

鑰匙和密語自己貼進 Vercel，不要貼到對話裡。

### Claude 接手後要做

1. 用 `add_repo` 把 `ryan770317-eng/travel-journal` 接進 session（要 push 權限）。
2. 把 `travel-journal` 分支推到新 repo 當 `main`，歷史一起帶過去：
   `git remote add journal <新 repo 網址> && git push journal travel-journal:main`
3. 帶 Ryan 在 Vercel 匯入新 repo、填 `NOTION_TOKEN` 和 `JOURNAL_PASSCODE`、deploy。Vercel 的 MCP 工具可以查部署狀態和錯誤紀錄。
4. 用真資料檢查：
   - 首頁要出現 10 趟旅行（1 趟手帳格式、9 趟舊頁）
   - 曼谷・華欣每個時間跟 Notion 對一次，特別是沒填時區的列
   - 舊頁旅行的行程 DS id 是不是 Notion API 認得的 data source id（只用 MCP 看過，還沒用正式 API 打過）
5. 在 Notion「旅行手帳系統」頁補一行：網站網址，還有它跟 claude.ai 線上手帳 artifact 的分工。
6. 舊 repo `studio-retreat-2026` 要不要封存，問 Ryan。

## 已經決定的事

- **Notion 是唯一的資料庫**，網站只讀不存。Ryan 9/30 選的。
- **開新 repo，不改舊 repo 名字**。Ryan 9/30 選的。
- **網站要通關密語**：裡面有訂位代號、地址、電話。
- **行程時區規則**：時區欄寫台北就用台北時間，寫當地就用那趟的時區；空白時看地點的起點，從桃園、松山、天母、台北出發的算台北時間。JX746「蘇凡納布 BKK 到桃園機場 T2」起點在曼谷，所以是當地 17:50。

## 還沒做、之後可以加

- 在網站上直接改資料（現在要按「在 Notion 改」跳過去）。claude.ai 那個線上手帳 artifact 可以直接改，這個網站還不行。
- 舊頁旅行只顯示行程和代購，沒有待辦和花費。
- 沒網路時會顯示上次存的內容，但只存在那支手機上。

## 關鍵 id

| 什麼 | id |
| --- | --- |
| 旅程總覽 data source | `99fc2894-fbfa-4aa0-8210-f204df140a92` |
| 曼谷・華欣 在旅程總覽的列 | `3df2a7ef8d60817f91ffd6003ba7cab8` |
| 曼谷・華欣 主頁 | `3dc2a7ef8d6081a28dfafade99fed6b2` |
| 行程／待辦／代購／花費 DS | `719ef03d…` ／ `6d0b9a10…` ／ `0783e725…` ／ `0ecd6a9e…` |
| claude.ai 線上手帳 artifact | https://claude.ai/artifact/CtbSBudaFYpPPKhtWLdajn |

Notion API 版本用 `2025-09-03`，查資料用 `/v1/data_sources/{id}/query`。
