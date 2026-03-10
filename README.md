# GitLab MR (& Issue) Private Reviewer (Browser Extension)

這是一個專門為了自架 GitLab 的 Merge Request (MR) 及 Issue 頁面所開發的 Chrome / Edge 瀏覽器擴充套件。它能夠：

1. **MR Review**：自動抓取 MR 的程式碼差異（Diff），並整合 Generative AI 進行 Code Review，將建議顯示在瀏覽器介面中。
2. **Issue 純文字建議**：讀取 Issue 的標題與描述，提供解決思路與建議。
3. **Issue AI 自動修復 (Auto-Fix)**：自動讀取您在 Issue 中指定的程式碼檔案，交由 AI 產生修復程式，並透過 GitLab API 自動建立 Branch 與 Merge Request。

## 專案目標

- 自動偵測 GitLab MR 頁面與 Issue 頁面並啟動對應功能。
- 提供客製化的檢閱者角色 (Reviewer Role) 與偏好技術棧/語言 (Preferred Tech Stack) 設定。
- 透過 GitLab PAT 與 API 取得正確的原始碼與差異。
- 整合 AI (例如：OpenAI GPT)，並將結果以 Markdown 格式呈現於頁面上側邊欄。
- 實現「零環境切換」的 Issue 至 MR 自動化流程。

## 安裝方式（開發中）

1. 開啟 Chrome 或 Edge 的擴充功能管理頁面（`chrome://extensions/` 或是 `edge://extensions/`）。
2. 開啟右上角的 **開發人員模式 (Developer mode)**。
3. 點擊 **載入未封裝項目 (Load unpacked)**。
4. 選擇本專案的目錄 `GitLab MR Private Reviewer (Browser Extension)`。

## 使用說明與設定

1. 點擊擴充功能圖示，開啟設定面板 (Popup)。
2. 填入 **GitLab Base URL** (例如: `https://gitlab.example.com`) 與 **GitLab PAT**。
3. 填入 **OpenAI API Key**。
4. **客製化 AI 角色與技術棧**：
   - 設定您期望的「檢閱者角色」（例如：`資深的後端工程師`）。
   - 設定您專案的「偏好技術棧/語言」（例如：`Node.js / Express` 或 `Python / Django`）。
   - 設定自訂的 MR Review Checklist。
5. 點擊【儲存設定】。

## 🚀 特色功能：Issue 自動修復 (Auto-Fix) 建立 MR

當您在 GitLab 建立 Issue，且希望 AI 直接幫您改 code 並發 MR 時，請在 Issue 的**描述 (Description)** 內任意位置加上以下標記格式：

```text
[File]: src/controllers/authController.js
[File]: src/routes/api.js
```

(可以標記多個檔案，請一行一個)

進入該 Issue 頁面後，點擊右下角的**「💡 AI Issue 建議」**，再點擊面板最下方的**「🚀 開始 AI 自動修復並建立 MR」**。擴充套件將會：

1. 自動抓取您標記的原始檔內容。
2. 送交 OpenAI 產生 JSON 格式的修改更新。
3. 建立一個新 Branch (以 `issue-xxx-ai-fix` 命名)。
4. Commit 程式碼到該 Branch。
5. 自動建立並返回一個指回 main/master 的 Draft Merge Request。

## 目前進度

- [x] 初始化專案結構 (`manifest.json`, `content_script.js`, `popup.html`, `popup.js`)
- [x] Content Script: 解析 URL 並處理 MR 頁面與 Issue 頁面邏輯。
- [x] Popup (設定面板): 支援自訂 AI 角色、技術棧、Review Checklist 並存入 `chrome.storage.local`。
- [x] 串接 GitLab REST API (Diff 獲取、Raw File 獲取、Branches/Commits/MR 建立)。
- [x] 串接 OpenAI API，並實作純文字生成與結構化 JSON 生成。
- [x] 建立右側滑出式的 UI 顯示介面與按鈕行為。
