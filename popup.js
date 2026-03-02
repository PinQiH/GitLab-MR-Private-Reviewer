const DEFAULT_ROLE = '資深的後端工程師';
const DEFAULT_PROCESS = `1. 功能與邏輯（Correctness）：實作是否符合需求、邊界條件處理、失敗情境是否完整、權限與驗證是否正確。
2. 程式結構（Design）：責任分層清楚（Controller/Service/Repo）、無不必要耦合、無重複邏輯、命名清楚、可理解。
3. 可維護性（Maintainability）：程式易讀、邏輯可測試、無 magic number / hard-code、註解解釋「為什麼」而非「做什麼」。
4. 錯誤處理（Error Handling）：錯誤有被捕捉、回傳格式一致、不吞錯誤、log 有價值資訊。
5. 效能與資安（Performance & Security）：無明顯效能問題、DB/API 呼叫次數合理、無敏感資訊外洩、無 SQL Injection/XSS 風險。
6. 測試（Testing）：關鍵邏輯有測試、錯誤與權限有測試、Mock 合理不過度、測試可讀且穩定。`;

document.addEventListener('DOMContentLoaded', () => {
  const apiUrlInput = document.getElementById('apiUrl');
  const patTokenInput = document.getElementById('patToken');
  const openaiApiKeyInput = document.getElementById('openaiApiKey');
  const reviewerRoleInput = document.getElementById('reviewerRole');
  const reviewProcessInput = document.getElementById('reviewProcess');
  const saveBtn = document.getElementById('saveBtn');
  const statusDiv = document.getElementById('status');

  // 載入已儲存的設定
  chrome.storage.local.get(['gitlabApiUrl', 'gitlabPatToken', 'openaiApiKey', 'reviewerRole', 'reviewProcess'], (result) => {
    if (result.gitlabApiUrl) apiUrlInput.value = result.gitlabApiUrl;
    if (result.gitlabPatToken) patTokenInput.value = result.gitlabPatToken;
    if (result.openaiApiKey) openaiApiKeyInput.value = result.openaiApiKey;
    
    reviewerRoleInput.value = result.reviewerRole || DEFAULT_ROLE;
    reviewProcessInput.value = result.reviewProcess || DEFAULT_PROCESS;
  });

  // 儲存設定
  saveBtn.addEventListener('click', () => {
    const apiUrl = apiUrlInput.value.trim();
    const patToken = patTokenInput.value.trim();
    const openaiApiKey = openaiApiKeyInput.value.trim();
    const reviewerRole = reviewerRoleInput.value.trim();
    const reviewProcess = reviewProcessInput.value.trim();

    chrome.storage.local.set({
      gitlabApiUrl: apiUrl,
      gitlabPatToken: patToken,
      openaiApiKey: openaiApiKey,
      reviewerRole: reviewerRole || DEFAULT_ROLE,
      reviewProcess: reviewProcess || DEFAULT_PROCESS
    }, () => {
      // 顯示已儲存的提示
      statusDiv.style.display = 'block';
      setTimeout(() => {
        statusDiv.style.display = 'none';
      }, 2000);
    });
  });
});
