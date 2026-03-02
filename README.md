# GitLab MR Private Reviewer (Browser Extension)

這是一個專門為了自架 GitLab 的 Merge Request (MR) 頁面所開發的 Chrome / Edge 瀏覽器擴充套件。它可以自動抓取 MR 的程式碼差異（Diff），並整合 Generative AI 進行 Code Review，將建議顯示在瀏覽器介面中。

## 專案目標

- 自動偵測 MR 頁面並啟動分析。
- 透過 GitLab PAT 與 API 取得正確的差異程式碼。
- 整合 AI (例如：Gemini)，提供針對「後端工程師」優化的程式碼審核。
- 以 Markdown 格式將 Review 結果呈現於頁面上。

## 安裝方式（開發中）

1. 開啟 Chrome 或 Edge 的擴充功能管理頁面（`chrome://extensions/` 或是 `edge://extensions/`）。
2. 開啟右上角的 **開發人員模式 (Developer mode)**。
3. 點擊 **載入未封裝項目 (Load unpacked)**。
4. 選擇本專案的目錄 `GitLab MR Private Reviewer (Browser Extension)`。

## 目前進度

- [x] 初始化專案結構 (`manifest.json`, `content_script.js`, `popup.html`, `popup.js`)
- [x] Content Script: 可以從 URL 自動解析 `project_path` (URL Encoded) 以及 `mr_iid`，並在 console 中印出。
- [x] Popup (安全認證): 提供設定介面以儲存 GitLab Base URL、PAT 與 Gemini API Key 至 `chrome.storage.local`。
- [x] 串接 GitLab REST API (GET `/projects/:id/merge_requests/:iid/changes`) 取得 Diff。
- [x] 串接 Gemini AI API。
- [x] 建立 Review 結果的 UI 顯示介面。
