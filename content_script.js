let isReviewPanelInjected = false;

function checkAndExtractGitLabInfo() {
  const url = window.location.href;

  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;

    if (url.includes('/merge_requests/')) {
      const match = pathname.match(/^\/(.+?)\/-\/merge_requests\/(\d+)/);
      if (match) {
        const projectPath = match[1];
        const mrIid = match[2];
        const encodedProjectPath = encodeURIComponent(projectPath);
        injectReviewUI(encodedProjectPath, mrIid);
      }
    } else if (url.includes('/issues/')) {
      const match = pathname.match(/^\/(.+?)\/-\/issues\/(\d+)/);
      if (match) {
        const projectPath = match[1];
        const issueIid = match[2];
        const encodedProjectPath = encodeURIComponent(projectPath);
        injectIssueReviewUI(encodedProjectPath, issueIid);
      }
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

function injectIssueReviewUI(projectPath, issueIid) {
  if (document.getElementById('ai-issue-review-btn')) {
    document.getElementById('ai-issue-review-btn').remove();
    document.getElementById('ai-issue-review-panel').remove();
  }

  // 1. 建立浮動按鈕
  const btn = document.createElement('button');
  btn.id = 'ai-issue-review-btn';
  btn.innerText = '💡 AI Issue 建議';
  btn.style.position = 'fixed';
  btn.style.bottom = '80px';
  btn.style.right = '20px';
  btn.style.zIndex = '9999';
  btn.style.padding = '10px 15px';
  btn.style.backgroundColor = '#fd7e14';
  btn.style.color = '#fff';
  btn.style.border = 'none';
  btn.style.borderRadius = '5px';
  btn.style.cursor = 'pointer';
  btn.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';

  // 2. 建立右側面板
  const panel = document.createElement('div');
  panel.id = 'ai-issue-review-panel';
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
  title.innerText = 'AI Issue 建議';
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
  content.id = 'ai-issue-review-content';
  content.style.padding = '15px';
  content.style.overflowY = 'auto';
  content.style.flex = '1';
  content.style.color = '#333';
  content.style.fontSize = '14px';
  content.style.lineHeight = '1.6';
  content.innerText = '點擊下方按鈕開始分析 Issue 內容並獲取建議。';
  panel.appendChild(content);

  // 面板底部區
  const footer = document.createElement('div');
  footer.style.padding = '15px';
  footer.style.borderTop = '1px solid #dee2e6';
  footer.style.backgroundColor = '#f8f9fa';

  const startReviewBtn = document.createElement('button');
  startReviewBtn.innerText = '💡 開始純文字建議分析';
  startReviewBtn.style.width = '100%';
  startReviewBtn.style.padding = '10px';
  startReviewBtn.style.backgroundColor = '#6c757d';
  startReviewBtn.style.color = '#fff';
  startReviewBtn.style.border = 'none';
  startReviewBtn.style.borderRadius = '4px';
  startReviewBtn.style.cursor = 'pointer';
  startReviewBtn.style.marginBottom = '10px';

  const startAutoFixBtn = document.createElement('button');
  startAutoFixBtn.innerText = '🚀 開始 AI 自動修復並建立 MR';
  startAutoFixBtn.style.width = '100%';
  startAutoFixBtn.style.padding = '10px';
  startAutoFixBtn.style.backgroundColor = '#fd7e14';
  startAutoFixBtn.style.color = '#fff';
  startAutoFixBtn.style.border = 'none';
  startAutoFixBtn.style.borderRadius = '4px';
  startAutoFixBtn.style.cursor = 'pointer';

  footer.appendChild(startReviewBtn);
  footer.appendChild(startAutoFixBtn);
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
    startIssueReview(projectPath, issueIid, content, startReviewBtn);
  });

  startAutoFixBtn.addEventListener('click', () => {
    startIssueAutoFix(projectPath, issueIid, content, startAutoFixBtn);
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

async function startIssueReview(projectPath, issueIid, contentElement, btnElement) {
  contentElement.innerText = '讀取設定中...';
  btnElement.disabled = true;
  btnElement.innerText = '分析中...';

  try {
    const settings = await chrome.storage.local.get([
      'gitlabApiUrl', 'gitlabPatToken', 'openaiApiKey',
      'reviewerRole', 'preferredLanguage'
    ]);
    
    if (!settings.gitlabApiUrl || !settings.gitlabPatToken) {
      contentElement.innerText = '請先點擊擴充套件圖示，設定 GitLab API URL 與 PAT。';
      btnElement.disabled = false;
      btnElement.innerText = '開始分析';
      return;
    }

    contentElement.innerText = '正在從 GitLab 獲取 Issue 內容...';
    
    // 呼叫 GitLab API
    const apiUrl = `${settings.gitlabApiUrl.replace(/\/$/, '')}/api/v4/projects/${projectPath}/issues/${issueIid}`;
    const response = await fetch(apiUrl, {
      headers: {
        'PRIVATE-TOKEN': settings.gitlabPatToken
      }
    });

    if (!response.ok) {
      throw new Error(`GitLab API 錯誤: ${response.status} ${response.statusText}`);
    }

    const issueData = await response.json();
    const issueTitle = issueData.title || '';
    const issueDescription = issueData.description || '';
    
    if (!issueTitle && !issueDescription) {
      contentElement.innerText = '此 Issue 沒有標題與內容。';
      btnElement.disabled = false;
      btnElement.innerText = '開始分析';
      return;
    }

    if (!settings.openaiApiKey) {
      contentElement.innerText = `成功獲取 Issue 內容！\n但請先至設定頁面輸入 OpenAI API Key 以進行 AI 分析。`;
      btnElement.disabled = false;
      btnElement.innerText = '開始分析';
      return;
    }

    contentElement.innerText = `獲取 Issue 內容成功。\n正在呼叫 OpenAI 進行分析... (這可能需要幾十秒鐘)`;
    
    const reviewerRole = settings.reviewerRole || '資深的軟體工程師';
    const preferredLanguage = settings.preferredLanguage || 'Node.js / Express';

    // 呼叫 OpenAI API
    const reviewResult = await callOpenAIForIssue(issueTitle, issueDescription, settings.openaiApiKey, reviewerRole, preferredLanguage);
    
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

// ==============================
// Phase 2: AI 自動修復並建立 MR
// ==============================
async function startIssueAutoFix(projectPath, issueIid, contentElement, btnElement) {
  contentElement.innerText = '讀取設定中...';
  btnElement.disabled = true;
  btnElement.innerText = '自動修復處理中...';

  try {
    const settings = await chrome.storage.local.get([
      'gitlabApiUrl', 'gitlabPatToken', 'openaiApiKey',
      'reviewerRole', 'preferredLanguage'
    ]);
    
    if (!settings.gitlabApiUrl || !settings.gitlabPatToken || !settings.openaiApiKey) {
      contentElement.innerText = '請先點擊擴充套件圖示，設定 GitLab API URL, PAT 以及 OpenAI API Key。';
      btnElement.disabled = false;
      btnElement.innerText = '開始 AI 自動修復並建立 MR';
      return;
    }

    contentElement.innerText = '1. 正在從 GitLab 獲取 Issue 內容...';
    
    // 呼叫 GitLab API 取得 Issue 內容
    const apiUrl = `${settings.gitlabApiUrl.replace(/\/$/, '')}/api/v4/projects/${projectPath}/issues/${issueIid}`;
    const response = await fetch(apiUrl, {
      headers: { 'PRIVATE-TOKEN': settings.gitlabPatToken }
    });

    if (!response.ok) throw new Error(`GitLab API 錯誤: ${response.status} ${response.statusText}`);
    const issueData = await response.json();
    const issueTitle = issueData.title || '';
    const issueDescription = issueData.description || '';
    
    // 從 Issue 描述中提取檔案路徑
    contentElement.innerText = '2. 正在解析 Issue 描述中的目標檔案...';
    const filePaths = extractFilePaths(issueDescription);

    if (filePaths.length === 0) {
      contentElement.innerHTML = `<span style="color: #e24329; font-weight: bold;">找不到目標檔案標記。</span><br><br>
        如果您想要 AI 幫忙修改碼，請在 Issue 描述中加上：<br>
        <code style="background:#f1f1f1;padding:2px;display:block;margin-top:10px;">[File]: src/path/to/file.js</code><br>
        AI 會先去抓取這些檔案，再進行程式碼修改。<br><br>
        如果您目前只是需要純文字建議，請關閉面板後，再點擊「開始純文字建議分析」。`;
      btnElement.disabled = false;
      btnElement.innerText = '🚀 開始 AI 自動修復並建立 MR';
      return;
    }

    contentElement.innerText = `解析出 ${filePaths.length} 個檔案路徑：\n${filePaths.join('\n')}`;

    contentElement.innerText = `3. 正在從 GitLab 獲取 ${filePaths.length} 個原始檔案...`;
    const filesContent = [];
    for (const filePath of filePaths) {
      const fileData = await fetchGitLabFile(settings.gitlabApiUrl, projectPath, filePath, settings.gitlabPatToken);
      if (fileData) {
        filesContent.push({ filepath: filePath, content: fileData });
      } else {
        throw new Error(`無法獲取檔案內容：${filePath}`);
      }
    }

    contentElement.innerText = `4. 正在呼叫 OpenAI 產生修改程式碼 (需時較久)...`;
    
    const reviewerRole = settings.reviewerRole || '資深的軟體工程師';
    const preferredLanguage = settings.preferredLanguage || 'Node.js / Express';
    
    const aiModificationResponse = await callOpenAIToModifyCode(
      issueTitle, 
      issueDescription, 
      filesContent, 
      settings.openaiApiKey, 
      reviewerRole, 
      preferredLanguage
    );

    let parsedResponse = null;
    try {
      // 嘗試清理可能的 markdow JS block (```json ... ```)
      const cleanJsonStr = aiModificationResponse.replace(/```json/gi, '').replace(/```/g, '').trim();
      parsedResponse = JSON.parse(cleanJsonStr);
    } catch (e) {
      throw new Error(`OpenAI 返回的格式非預期 JSON：${aiModificationResponse.substring(0, 100)}...`);
    }

    if (!parsedResponse || !parsedResponse.files || parsedResponse.files.length === 0) {
      throw new Error('OpenAI 未返回任何檔案修改。');
    }

    contentElement.innerHTML = `5. AI 產生完畢！<br>
                                <b style="color:#28a745;">原因說明：</b><br>
                                ${escapeHTML(parsedResponse.explanation)}<br><br>
                                <span style="color:#e24329;">6. 即將自動為您建立 Branch 與 MR...</span>`;

    const mrUrl = await createGitLabBranchAndMR(
      settings.gitlabApiUrl, 
      settings.gitlabPatToken, 
      projectPath, 
      issueIid, 
      parsedResponse
    );

    contentElement.innerHTML = `
      <b style="color:#28a745; font-size: 16px;">🎉 MR 建立成功！</b><br>
      原因是：${escapeHTML(parsedResponse.explanation)}<br><br>
      <a href="${mrUrl}" target="_blank" style="display:inline-block; padding:8px 15px; background-color:#292961; color:#fff; text-decoration:none; border-radius:4px;">點擊前往查看 MR</a>
    `;

  } catch (error) {
    contentElement.innerHTML = `<span style="color: red;">發生錯誤：<br>${error.message}</span>`;
    console.error(error);
  } finally {
    btnElement.disabled = false;
    btnElement.innerText = '重試自動修復';
  }
}

async function fetchGitLabFile(apiUrl, projectPath, filePath, token) {
  // GitLab API v4: /projects/:id/repository/files/:file_path/raw
  const encodedFilePath = encodeURIComponent(filePath);
  const url = `${apiUrl.replace(/\/$/, '')}/api/v4/projects/${projectPath}/repository/files/${encodedFilePath}/raw?ref=main`;
  
  const response = await fetch(url, {
    headers: { 'PRIVATE-TOKEN': token }
  });

  if (response.status === 404) {
    // 試著抓 master
    const urlMaster = `${apiUrl.replace(/\/$/, '')}/api/v4/projects/${projectPath}/repository/files/${encodedFilePath}/raw?ref=master`;
    const responseMaster = await fetch(urlMaster, { headers: { 'PRIVATE-TOKEN': token } });
    if (responseMaster.ok) return await responseMaster.text();
    return null;
  }

  if (!response.ok) return null;
  return await response.text();
}

function extractFilePaths(description) {
  const filePaths = [];
  // 匹配 `[File]: path/to/file.js` 這種格式
  const regex = /\[File\]:\s*([^\r\n]+)/ig;
  let match;
  while ((match = regex.exec(description)) !== null) {
    const path = match[1].trim();
    if (path) {
      filePaths.push(path);
    }
  }
  return [...new Set(filePaths)]; // 去除重複路徑
}

async function createGitLabBranchAndMR(apiUrl, token, projectPath, issueIid, parsedResponse) {
  const branchName = `issue-${issueIid}-ai-fix-${Date.now().toString().slice(-6)}`;
  const baseUrl = apiUrl.replace(/\/$/, '');
  
  // 1. 取得預設分支 (通常是 main 或 master) - 簡化處理，先嘗試 main
  let defaultBranch = 'main';
  const repoTreeUrl = `${baseUrl}/api/v4/projects/${projectPath}/repository/tree?ref=main`;
  const treeRes = await fetch(repoTreeUrl, { headers: { 'PRIVATE-TOKEN': token } });
  if (!treeRes.ok && treeRes.status === 404) {
    defaultBranch = 'master';
  }

  // 2. 建立新分支
  const createBranchUrl = `${baseUrl}/api/v4/projects/${projectPath}/repository/branches?branch=${branchName}&ref=${defaultBranch}`;
  const branchRes = await fetch(createBranchUrl, { method: 'POST', headers: { 'PRIVATE-TOKEN': token } });
  if (!branchRes.ok) throw new Error(`建立分支失敗: ${branchRes.status}`);

  // 3. 提交多個檔案修改 (Commit API)
  const actions = parsedResponse.files.map(file => ({
    action: file.action || "update",
    file_path: file.filepath,
    content: file.content
  }));

  const commitPayload = {
    branch: branchName,
    commit_message: `✨ feat/fix: AI auto fix for Issue #${issueIid}\n\n${parsedResponse.explanation}`,
    actions: actions
  };

  const commitUrl = `${baseUrl}/api/v4/projects/${projectPath}/repository/commits`;
  const commitRes = await fetch(commitUrl, {
    method: 'POST',
    headers: { 'PRIVATE-TOKEN': token, 'Content-Type': 'application/json' },
    body: JSON.stringify(commitPayload)
  });
  if (!commitRes.ok) {
    const err = await commitRes.json();
    throw new Error(`Commit 失敗: ${err.message || commitRes.statusText}`);
  }

  // 4. 建立 Merge Request
  const createMRUrl = `${baseUrl}/api/v4/projects/${projectPath}/merge_requests`;
  const mrPayload = {
    source_branch: branchName,
    target_branch: defaultBranch,
    title: `Draft: Resolve Issue #${issueIid} (AI Auto Fix)`,
    description: `此 MR 由 AI 自動生成，用來修復 Issue #${issueIid}。\n\n**修改原因與說明：**\n${parsedResponse.explanation}\n\nResolves #${issueIid}`
  };

  const mrRes = await fetch(createMRUrl, {
    method: 'POST',
    headers: { 'PRIVATE-TOKEN': token, 'Content-Type': 'application/json' },
    body: JSON.stringify(mrPayload)
  });
  
  if (!mrRes.ok) {
    const err = await mrRes.json();
    throw new Error(`建立 MR 失敗: ${err.message || mrRes.statusText}`);
  }

  const mrData = await mrRes.json();
  return mrData.web_url;
}

// ==============================
// OpenAI 與 GitLab API 呼叫函式
// ==============================
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

async function callOpenAIForIssue(issueTitle, issueDescription, apiKey, reviewerRole, preferredLanguage) {
  const systemPrompt = `你是一個資深的${reviewerRole}與架構師。請根據使用者提供的 GitLab Issue 標題與描述，提供具體的程式碼修改建議、實作步驟或架構設計建議。

## 回饋規範
- 分析 Issue 的需求或根本原因，並提供以 ${preferredLanguage} 為主體的解決方案。
- 列出可能的實作步驟、修改方向，或建議涉及的程式碼檔案。
- 如果有可以優化或需要注意的潛在風險（如非同步處理 async/await、效能、資安、相容性），請特別指出。
- 保持專業且有建設性的語氣。

請使用繁體中文，並且用 Markdown 格式回覆。`;

  const url = 'https://api.openai.com/v1/chat/completions';
  
  const payload = {
    model: "gpt-5.2-2025-12-11",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: `Issue 標題：\n${issueTitle}\n\nIssue 描述：\n${issueDescription}` }
    ],
    temperature: 0.3
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

async function callOpenAIToModifyCode(issueTitle, issueDescription, filesContent, apiKey, reviewerRole, preferredLanguage) {
  const systemPrompt = `你是一個資深的${reviewerRole}與架構師。
使用者遇到了一個問題，請你根據 Issue 的標題、描述，以及提供的原始程式碼，直接進行修復並回傳完整的修改後程式碼。

## 技術棧要求
- 專案架構與語言：${preferredLanguage}

## 輸出規範 (非常重要)
你必須**嚴格**輸出一個 JSON 格式的字串，不要包含任何開頭或結尾的 markdown block (不也就是不能有 \`\`\`json 這種東西)，只允許輸出單純的 JSON string。
JSON 結構必須如下：
{
  "explanation": "請用繁體中文簡短說明你為什麼這樣修改、解決了什麼問題。",
  "files": [
    {
      "filepath": "原始檔案的路徑",
      "action": "update",
      "content": "這裡放修改後該檔案的【完整程式碼】。請不要省略任何東西，不要用 // ... 來代替未修改的部分"
    }
  ]
}`;

  let filesPrompt = `提供的原始碼如下：\n`;
  for (const file of filesContent) {
    filesPrompt += `\n--- [File]: ${file.filepath} ---\n${file.content}\n`;
  }

  const userPrompt = `Issue 標題：\n${issueTitle}\n\nIssue 描述：\n${issueDescription}\n\n${filesPrompt}`;

  const url = 'https://api.openai.com/v1/chat/completions';
  const payload = {
    model: "gpt-5.2-2025-12-11",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ],
    temperature: 0.1 // 降至最低以求穩定輸出格式
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

// 頁面載入時執行
checkAndExtractGitLabInfo();
