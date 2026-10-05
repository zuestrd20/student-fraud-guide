# 停一下，再查證｜學生防詐指南

繁體中文靜態防詐教育網站。2016–2025 臺灣官方統計、14 種學生生活情境、10 題互動練習與求助資訊。

## 執行

不需安裝套件或編譯。以任何靜態 HTTP 伺服器提供本目錄，例如 `python3 -m http.server 8126`。將根目錄發佈至 GitHub Pages 即可；所有資產與資料使用相對路徑，頁面路由使用 hash。

## 資料

- `data/statistics.json`：每年案件、警方記錄被害人、財損，含來源、缺值原因及口徑
- `data/lessons.json`：教學分類、虛構情境、解析、官方來源及查核日期
- `data/aggregate.json`：以上兩份資料的完整下載包

缺值保留 null，不能當作零。2024 年統計口徑變更，勿跨斷點計算成長率或以連線暗示可比。教學分類不等於警方統計分類。

## 檢查

`node --check app.js`

`node tests/check-data.mjs`

互動測試需先安裝 Playwright（`npm install --no-save playwright`、`npx playwright install chromium`），啟動本地伺服器後執行 `node tests/browser.mjs`。可用 `TEST_URL` 指定網站網址、`OUTPUT_DIR` 指定截圖目錄、`CHROMIUM_EXECUTABLE_PATH` 選用既有 Chromium。測試涵蓋桌機、手機、篩選、互動測驗、返回／深連結與下載。

網站沒有登入、分析追蹤、第三方字型或個資表單。作答只存在於頁面記憶體，重新整理即清除。外部官方來源依各網站政策運作。
