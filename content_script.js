let isReviewPanelInjected = false;

function checkAndExtractGitLabInfo() {
  const url = window.location.href;
  if (!url.includes('/merge_requests/')) return;

  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    const match = pathname.match(/^\/(.+?)\/-\/merge_requests\/(\d+)/);

    if (match) {
      const projectPath = match[1];
      const mrIid = match[2];
      const encodedProjectPath = encodeURIComponent(projectPath);

      injectReviewUI(encodedProjectPath, mrIid);
    }
  } catch (error) {
    console.error('解析 GitLab URL 時發生錯誤：', error);
  }
}

function injectReviewUI(projectPath, mrIid) {
  if (isReviewPanelInjected) return;
  isReviewPanelInjected = true;

  // 1. 建立浮動按鈕
  const btn = document.createElement('button');
  btn.innerText = 'AI Code Review';
  btn.style.position = 'fixed';
  btn.style.bottom = '20px';
  btn.style.right = '20px';
  btn.style.zIndex = '9999';
  btn.style.padding = '10px 15px';
  btn.style.backgroundColor = '#292961';
  btn.style.color = '#fff';
  btn.style.border = 'none';
  btn.style.borderRadius = '5px';
  btn.style.cursor = 'pointer';
  btn.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';

  // 2. 建立右側面板
  const panel = document.createElement('div');
  panel.id = 'ai-review-panel';
  panel.style.position = 'fixed';
  panel.style.top = '0';
  panel.style.right = '-400px';
  panel.style.width = '400px';
  panel.style.height = '100vh';
  panel.style.backgroundColor = '#fff';
  panel.style.boxShadow = '-2px 0 10px rgba(0,0,0,0.2)';
  panel.style.zIndex = '10000';
  panel.style.transition = 'right 0.3s ease';
  panel.style.display = 'flex';
  panel.style.flexDirection = 'column';

  // 面板標題區
  const header = document.createElement('div');
  header.style.padding = '15px';
  header.style.backgroundColor = '#f8f9fa';
  header.style.borderBottom = '1px solid #dee2e6';
  header.style.display = 'flex';
  header.style.justifyContent = 'space-between';
  header.style.alignItems = 'center';

  const title = document.createElement('h3');
  title.innerText = 'AI Code Review';
  title.style.margin = '0';
  title.style.color = '#333';

  const closeBtn = document.createElement('button');
  closeBtn.innerText = '✕';
  closeBtn.style.background = 'none';
  closeBtn.style.border = 'none';
  closeBtn.style.fontSize = '18px';
  closeBtn.style.cursor = 'pointer';

  header.appendChild(title);
  header.appendChild(closeBtn);
  panel.appendChild(header);

  // 面板內容區
  const content = document.createElement('div');
  content.id = 'ai-review-content';
  content.style.padding = '15px';
  content.style.overflowY = 'auto';
  content.style.flex = '1';
  content.style.color = '#333';
  content.style.fontSize = '14px';
  content.style.lineHeight = '1.6';
  content.innerText = '點擊下方按鈕開始分析 MR 的程式碼差異。';
  panel.appendChild(content);

  // 面板底部區
  const footer = document.createElement('div');
  footer.style.padding = '15px';
  footer.style.borderTop = '1px solid #dee2e6';
  footer.style.backgroundColor = '#f8f9fa';

  const startReviewBtn = document.createElement('button');
  startReviewBtn.innerText = '開始分析';
  startReviewBtn.style.width = '100%';
  startReviewBtn.style.padding = '10px';
  startReviewBtn.style.backgroundColor = '#28a745';
  startReviewBtn.style.color = '#fff';
  startReviewBtn.style.border = 'none';
  startReviewBtn.style.borderRadius = '4px';
  startReviewBtn.style.cursor = 'pointer';

  footer.appendChild(startReviewBtn);
  panel.appendChild(footer);

  document.body.appendChild(btn);
  document.body.appendChild(panel);

  // 事件綁定
  btn.addEventListener('click', () => {
    panel.style.right = '0';
  });

  closeBtn.addEventListener('click', () => {
    panel.style.right = '-400px';
  });

  startReviewBtn.addEventListener('click', () => {
    startReview(projectPath, mrIid, content, startReviewBtn);
  });
}

function escapeHTML(str) {
  return str.replace(/[&<>'"]/g, tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag));
}

function parseMarkdown(text) {
  let html = escapeHTML(text);
  html = html
    .replace(/^### (.*$)/gim, '<h4>$1</h4>')
    .replace(/^## (.*$)/gim, '<h3>$1</h3>')
    .replace(/^# (.*$)/gim, '<h2>$1</h2>')
    .replace(/\*\*(.*)\*\*/gim, '<b>$1</b>')
    .replace(/\*(.*)\*/gim, '<i>$1</i>')
    .replace(/```([\s\S]*?)```/gim, '<pre style="background:#f1f1f1;padding:10px;border-radius:5px;overflow-x:auto;">$1</pre>')
    .replace(/`([^`]*)`/gim, '<code style="background:#f1f1f1;padding:2px 4px;border-radius:3px;">$1</code>')
    .replace(/^\> (.*$)/gim, '<blockquote style="border-left:4px solid #ccc;margin:0;padding-left:10px;color:#666;">$1</blockquote>')
    .replace(/\n\n/gim, '<br><br>')
    .replace(/\n/gim, '<br>');
  return html;
}

async function startReview(projectPath, mrIid, contentElement, btnElement) {
  contentElement.innerText = '讀取設定中...';
  btnElement.disabled = true;
  btnElement.innerText = '分析中...';

  try {
    const settings = await chrome.storage.local.get([
      'gitlabApiUrl', 'gitlabPatToken', 'openaiApiKey', 
      'reviewerRole', 'reviewProcess'
    ]);
    
    if (!settings.gitlabApiUrl || !settings.gitlabPatToken) {
      contentElement.innerText = '請先點擊擴充套件圖示，設定 GitLab API URL 與 PAT。';
      btnElement.disabled = false;
      btnElement.innerText = '開始分析';
      return;
    }

    contentElement.innerText = '正在從 GitLab 獲取 Diff...';
    
    // 呼叫 GitLab API
    const apiUrl = `${settings.gitlabApiUrl.replace(/\/$/, '')}/api/v4/projects/${projectPath}/merge_requests/${mrIid}/changes`;
    const response = await fetch(apiUrl, {
      headers: {
        'PRIVATE-TOKEN': settings.gitlabPatToken
      }
    });

    if (!response.ok) {
      throw new Error(`GitLab API 錯誤: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    let changes = data.changes;
    
    if (!changes || changes.length === 0) {
      contentElement.innerText = '此 MR 沒有程式碼變更。';
      btnElement.disabled = false;
      btnElement.innerText = '開始分析';
      return;
    }

    // 簡單過濾一下常見非程式碼檔案
    const validChanges = changes.filter(change => {
      const filePath = change.new_path || change.old_path;
      return !filePath.match(/\.(png|jpg|jpeg|gif|svg|pdf|mp4|zip)$/i);
    });

    let diffText = '';
    validChanges.forEach(change => {
      diffText += `File: ${change.new_path}\n`;
      diffText += `Diff:\n${change.diff}\n\n`;
    });

    if (!diffText.trim()) {
      contentElement.innerText = '此 MR 新增或修改的皆為非程式碼檔案，無需 Review。';
      btnElement.disabled = false;
      btnElement.innerText = '開始分析';
      return;
    }

    if (!settings.openaiApiKey) {
      contentElement.innerText = `成功獲取 Diff！\n共有 ${validChanges.length} 個檔案變動。\n但請先至設定頁面輸入 OpenAI API Key 以進行 AI Review。`;
      btnElement.disabled = false;
      btnElement.innerText = '開始分析';
      return;
    }

    contentElement.innerText = `獲取 Diff 成功，共有 ${validChanges.length} 個檔案變動。\n正在呼叫 OpenAI 進行 Review... (這可能需要幾十秒鐘)`;
    
    // 預設提示詞 fallback (防禦性)
    const reviewerRole = settings.reviewerRole || '資深的後端工程師';
    const reviewProcess = settings.reviewProcess || `1. 功能與邏輯（Correctness）\n2. 程式結構（Design）\n3. 可維護性（Maintainability）\n4. 錯誤處理（Error Handling）\n5. 效能與資安（Performance & Security）\n6. 測試（Testing）`;

    // 呼叫 OpenAI API
    const reviewResult = await callOpenAI(diffText, settings.openaiApiKey, reviewerRole, reviewProcess);
    
    // 顯示結果
    contentElement.innerHTML = parseMarkdown(reviewResult);

  } catch (error) {
    contentElement.innerHTML = `<span style="color: red;">發生錯誤：<br>${error.message}</span>`;
    console.error(error);
  } finally {
    btnElement.disabled = false;
    btnElement.innerText = '重新分析';
  }
}

async function callOpenAI(diffText, apiKey, reviewerRole, reviewProcess) {
  const systemPrompt = `你是一個${reviewerRole}。請依照下列 Code Review Workflow SOP 對以下的 GitLab Merge Request (MR) 程式碼差異 (Diff) 進行 Review。

## Review 核心流程（Reviewer SOP）
${reviewProcess}

## Review 回饋規範
- 指出問題與原因，並提供具體的改善建議。
- 請明確區分「必改」與「建議」。
- 保持語氣中立，聚焦程式碼本身。

請使用繁體中文，並且用 Markdown 格式回覆。如果程式碼沒有明顯問題，請給予鼓勵並指出寫得好的地方。`;

  const url = 'https://api.openai.com/v1/chat/completions';
  
  const payload = {
    model: "gpt-5.2-2025-12-11",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: `Diff 內容如下：\n${diffText.substring(0, 30000)}` }
    ],
    temperature: 0.2
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`OpenAI API 錯誤: ${errorData.error?.message || response.statusText}`);
  }

  const data = await response.json();
  if (!data.choices || data.choices.length === 0) {
    throw new Error('OpenAI API 未回傳任何結果');
  }
  return data.choices[0].message.content;
}

// 監聽 URL 變化 (SPA 架構下，GitLab 換頁時可能不會重新載入)
let lastUrl = window.location.href;
new MutationObserver(() => {
  const url = window.location.href;
  if (url !== lastUrl) {
    lastUrl = url;
    setTimeout(checkAndExtractGitLabInfo, 1000);
  }
}).observe(document, { subtree: true, childList: true });

// 頁面載入時執行
checkAndExtractGitLabInfo();
