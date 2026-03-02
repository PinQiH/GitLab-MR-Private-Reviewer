document.addEventListener('DOMContentLoaded', () => {
  const apiUrlInput = document.getElementById('apiUrl');
  const patTokenInput = document.getElementById('patToken');
  const openaiApiKeyInput = document.getElementById('openaiApiKey');
  const saveBtn = document.getElementById('saveBtn');
  const statusDiv = document.getElementById('status');

  // 載入已儲存的設定
  chrome.storage.local.get(['gitlabApiUrl', 'gitlabPatToken', 'openaiApiKey'], (result) => {
    if (result.gitlabApiUrl) {
      apiUrlInput.value = result.gitlabApiUrl;
    }
    if (result.gitlabPatToken) {
      patTokenInput.value = result.gitlabPatToken;
    }
    if (result.openaiApiKey) {
      openaiApiKeyInput.value = result.openaiApiKey;
    }
  });

  // 儲存設定
  saveBtn.addEventListener('click', () => {
    const apiUrl = apiUrlInput.value.trim();
    const patToken = patTokenInput.value.trim();
    const openaiApiKey = openaiApiKeyInput.value.trim();

    chrome.storage.local.set({
      gitlabApiUrl: apiUrl,
      gitlabPatToken: patToken,
      openaiApiKey: openaiApiKey
    }, () => {
      // 顯示已儲存的提示
      statusDiv.style.display = 'block';
      setTimeout(() => {
        statusDiv.style.display = 'none';
      }, 2000);
    });
  });
});
