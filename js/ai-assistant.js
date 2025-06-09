/**
 * AI助手模块 - 为博客添加智能对话功能
 * 基于智谱GLM-4-Flash模型，帮助访问者解答问题
 */

(function() {
    'use strict';
    
    // 配置参数
    const config = {
        botName: '博客智能助手',
        welcomeMessage: '你好！我是Wake的博客助手，有什么可以帮到你的吗？',
        placeholder: '输入你的问题...',
        apiKey: 'c5c36fbe747442a8b6103bcaf910e17a.oYrzrFLS1iYk3Bh5', // 在实际使用时填入你的智谱API密钥
        apiEndpoint: 'https://open.bigmodel.cn/api/paas/v4/chat/completions', // 智谱GLM-4 API的完整URL
        modelName: 'glm-4-flash-250414', // 智谱GLM-4-Flash模型名称，完全免费版
        maxTokens: 2000,
        temperature: 0.7
    };
    
    // DOM元素引用
    let chatContainer, chatMessages, userInput, sendButton, toggleButton;
    
    // 初始化函数
    function init() {
        // 创建UI
        createChatUI();
        
        // 绑定事件
        bindEvents();
        
        // 添加欢迎消息
        addBotMessage(config.welcomeMessage);
        
        // 检查本地存储中的历史记录
        loadChatHistory();
        
        // 初始化输入框样式
        userInput.style.height = 'auto';
        userInput.style.overflowX = 'hidden';
        
        console.log('AI助手初始化完成');
    }
    
    // 创建聊天界面
    function createChatUI() {
        // 创建主容器
        chatContainer = document.createElement('div');
        chatContainer.className = 'ai-assistant-container';
        chatContainer.innerHTML = `
            <div class="ai-assistant-header">
                <div class="ai-assistant-title">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="8" r="2"></circle><rect x="9" y="15" width="6" height="3" rx="1"></rect><path d="M6 11.5h12"></path></svg>
                    ${config.botName}
                </div>
                <div class="ai-assistant-actions">
                    <button class="ai-assistant-minimize">_</button>
                    <button class="ai-assistant-close">×</button>
                </div>
            </div>
            <div class="ai-assistant-messages"></div>
            <div class="ai-assistant-input-container">
                <textarea class="ai-assistant-input" placeholder="${config.placeholder}" rows="1" autocomplete="off"></textarea>
                <button class="ai-assistant-send">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                </button>
            </div>
        `;
        
        // 创建悬浮按钮
        toggleButton = document.createElement('button');
        toggleButton.className = 'ai-assistant-toggle';
        toggleButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>';
        toggleButton.title = '打开AI助手';
        
        // 添加到页面
        document.body.appendChild(chatContainer);
        document.body.appendChild(toggleButton);
        
        // 获取DOM引用
        chatMessages = chatContainer.querySelector('.ai-assistant-messages');
        userInput = chatContainer.querySelector('.ai-assistant-input');
        sendButton = chatContainer.querySelector('.ai-assistant-send');
        
        // 默认隐藏聊天窗口
        chatContainer.classList.add('collapsed');
    }
    
    // 绑定事件处理
    function bindEvents() {
        // 切换助手显示/隐藏
        toggleButton.addEventListener('click', function() {
            chatContainer.classList.toggle('collapsed');
            if(!chatContainer.classList.contains('collapsed')) {
                userInput.focus();
            }
        });
        
        // 最小化聊天窗口
        chatContainer.querySelector('.ai-assistant-minimize').addEventListener('click', function() {
            chatContainer.classList.add('collapsed');
        });
        
        // 关闭聊天窗口
        chatContainer.querySelector('.ai-assistant-close').addEventListener('click', function() {
            chatContainer.classList.add('collapsed');
        });
        
        // 发送消息
        sendButton.addEventListener('click', sendMessage);
        
        // 回车发送消息
        userInput.addEventListener('keydown', function(e) {
            if(e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
            
            // 自动调整文本区域高度
            setTimeout(() => {
                this.style.height = 'auto';
                this.style.height = (this.scrollHeight) + 'px';
                // 阻止水平滚动
                this.style.overflowX = 'hidden';
            }, 0);
        });
        
        // 文本区域高度自适应
        userInput.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = (this.scrollHeight) + 'px';
            // 阻止水平滚动
            this.style.overflowX = 'hidden';
        });
        
        // 禁用自动完成
        userInput.setAttribute('autocomplete', 'off');
        userInput.setAttribute('autocorrect', 'off');
        userInput.setAttribute('autocapitalize', 'off');
        userInput.setAttribute('spellcheck', 'false');
    }
    
    // 发送消息
    function sendMessage() {
        const message = userInput.value.trim();
        
        if(!message) return;
        
        // 添加用户消息到界面
        addUserMessage(message);
        
        // 清空输入框
        userInput.value = '';
        userInput.style.height = 'auto';
        
        // 显示加载状态
        const loadingId = addBotMessage('<div class="ai-assistant-loading"><span></span><span></span><span></span></div>');
        
        // 发送请求到AI服务
        fetchAIResponse(message)
            .then(response => {
                // 更新加载消息为实际回复
                updateBotMessage(loadingId, response);
                saveChatHistory();
            })
            .catch(error => {
                console.error('AI请求错误:', error);
                updateBotMessage(loadingId, '抱歉，我遇到了一些问题，无法回答您的问题。请稍后再试。');
            });
    }
    
    // 添加用户消息
    function addUserMessage(text) {
        const messageElement = document.createElement('div');
        messageElement.className = 'ai-assistant-message user-message';
        messageElement.innerHTML = `
            <div class="message-avatar">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/></svg>
            </div>
            <div class="message-content">${formatMessage(text)}</div>
        `;
        
        chatMessages.appendChild(messageElement);
        scrollToBottom();
    }
    
    // 添加机器人消息
    function addBotMessage(text) {
        const messageId = 'bot-msg-' + Date.now();
        const messageElement = document.createElement('div');
        messageElement.className = 'ai-assistant-message bot-message';
        messageElement.id = messageId;
        messageElement.innerHTML = `
            <div class="message-avatar">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 2a9 9 0 0 0-9 9c0 4.17 2.84 7.67 6.69 8.69L12 22l2.31-2.31C18.16 18.67 21 15.17 21 11a9 9 0 0 0-9-9zm0 2c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.3c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/></svg>
            </div>
            <div class="message-content">${text}</div>
        `;
        
        chatMessages.appendChild(messageElement);
        scrollToBottom();
        
        return messageId;
    }
    
    // 更新机器人消息
    function updateBotMessage(messageId, text) {
        const messageElement = document.getElementById(messageId);
        if(messageElement) {
            const contentElement = messageElement.querySelector('.message-content');
            contentElement.innerHTML = formatMessage(text);
            scrollToBottom();
        }
    }
    
    // 格式化消息内容
    function formatMessage(text) {
        // 将URL转为链接
        text = text.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>');
        
        // 支持简单的Markdown
        // 代码块
        text = text.replace(/```(\w*)([\s\S]*?)```/g, '<pre><code class="language-$1">$2</code></pre>');
        
        // 行内代码
        text = text.replace(/`([^`]+)`/g, '<code>$1</code>');
        
        // 粗体
        text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
        
        // 斜体
        text = text.replace(/\*([^*]+)\*/g, '<em>$1</em>');
        
        // 将换行符转换为<br>
        text = text.replace(/\n/g, '<br>');
        
        return text;
    }
    
    // 滚动到底部
    function scrollToBottom() {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    // 请求AI回复
    async function fetchAIResponse(message) {
        if(!config.apiKey) {
            return '抱歉，AI助手尚未配置API密钥。请联系博客管理员设置API密钥。';
        }
        
        try {
            const response = await fetch(config.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${config.apiKey}`
                },
                body: JSON.stringify({
                    model: config.modelName,
                    messages: [
                        {
                            role: 'system',
                            content: '你是一个友好、专业的博客助手，负责回答访客的问题。你的回答应当简洁、专业、有帮助性。'
                        },
                        {
                            role: 'user',
                            content: message
                        }
                    ],
                    max_tokens: config.maxTokens,
                    temperature: config.temperature
                })
            });
            
            const data = await response.json();
            
            if(data.error) {
                console.error('API错误:', data.error);
                return `抱歉，AI服务出现问题：${data.error.message || '未知错误'}`;
            }
            
            return data.choices[0].message.content;
            
        } catch(error) {
            console.error('网络请求错误:', error);
            return '抱歉，连接AI服务时出现错误。请检查网络连接或稍后再试。';
        }
    }
    
    // 保存聊天历史
    function saveChatHistory() {
        const chatHistory = Array.from(chatMessages.children)
            .filter(el => el.classList.contains('ai-assistant-message'))
            .map(el => {
                const isUser = el.classList.contains('user-message');
                const content = el.querySelector('.message-content').innerHTML;
                return { isUser, content };
            });
        
        localStorage.setItem('ai-assistant-history', JSON.stringify(chatHistory));
    }
    
    // 加载聊天历史
    function loadChatHistory() {
        const historyJson = localStorage.getItem('ai-assistant-history');
        if(historyJson) {
            try {
                const history = JSON.parse(historyJson);
                // 清除欢迎消息
                chatMessages.innerHTML = '';
                
                history.forEach(msg => {
                    const messageElement = document.createElement('div');
                    messageElement.className = 'ai-assistant-message ' + (msg.isUser ? 'user-message' : 'bot-message');
                    
                    const avatarIcon = msg.isUser ? 
                        '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/></svg>' : 
                        '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 2a9 9 0 0 0-9 9c0 4.17 2.84 7.67 6.69 8.69L12 22l2.31-2.31C18.16 18.67 21 15.17 21 11a9 9 0 0 0-9-9zm0 2c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.3c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/></svg>';
                    
                    messageElement.innerHTML = `
                        <div class="message-avatar">
                            ${avatarIcon}
                        </div>
                        <div class="message-content">${msg.content}</div>
                    `;
                    chatMessages.appendChild(messageElement);
                });
            } catch(e) {
                console.error('加载聊天历史出错:', e);
                clearChatHistory();
            }
        }
    }
    
    // 清除聊天历史
    function clearChatHistory() {
        localStorage.removeItem('ai-assistant-history');
        chatMessages.innerHTML = '';
        addBotMessage(config.welcomeMessage);
    }
    
    // 页面加载完成后初始化
    if(document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();