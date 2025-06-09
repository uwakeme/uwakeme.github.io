/**
 * 基础版AI助手模块 - 不需要API密钥，使用预设回答
 */

(function() {
    'use strict';
    
    // 配置参数
    const config = {
        botName: '博客智能助手(基础版)',
        welcomeMessage: '你好！我是Wake的博客助手，有什么可以帮到你的吗？',
        placeholder: '输入你的问题...'
    };
    
    // 预设问答库
    const faqs = [
        {
            keywords: ['博客', '内容', '文章', '写什么'],
            answer: '这个博客主要分享技术学习笔记、编程技巧和问题解决方案，涵盖后端开发、前端技术、数据库和Linux等领域的内容。'
        },
        {
            keywords: ['联系', '作者', '博主', '交流'],
            answer: '你可以通过以下方式联系博主：\n1. 在文章下方留言评论\n2. 通过"关于"页面的社交媒体链接'
        },
        {
            keywords: ['推荐', '热门', '文章', '阅读量'],
            answer: '以下是一些热门文章推荐：\n1. [Java Stream流操作详解](/categories/JAVA技巧/)\n2. [Linux常用命令整理](/categories/LINUX/)\n3. [MySQL性能优化实践](/categories/数据库/)'
        },
        {
            keywords: ['hexo', '主题', 'fluid', '博客搭建'],
            answer: '这个博客使用的是Hexo框架和Fluid主题。如果你想了解如何搭建类似的博客，可以参考[Hexo官方文档](https://hexo.io/zh-cn/docs/)和[Fluid主题文档](https://hexo.fluid-dev.com/docs/)。'
        },
        {
            keywords: ['你是谁', '你是什么', '介绍自己'],
            answer: '我是一个简单的博客助手程序，可以回答一些关于这个博客的基本问题。我的功能比较有限，但我会尽力帮助你找到需要的信息！'
        },
        {
            keywords: ['源码', 'github', '代码', '开源'],
            answer: '博客的一些项目源码可以在GitHub上找到，具体链接请查看"关于"页面的社交媒体图标。'
        },
        {
            keywords: ['更新', '频率', '多久', '发布'],
            answer: '博主通常每周会更新1-2篇文章，主要分享最近的技术学习和实践经验。'
        }
    ];
    
    // 通用回复
    const defaultResponses = [
        '抱歉，我目前无法回答这个问题。你可以尝试浏览博客分类或使用搜索功能查找相关内容。',
        '这个问题有点超出我的知识范围了。你可以尝试更具体的问题，或者在评论区留言给博主。',
        '我理解你的问题，但可能需要更多上下文。能否提供更多详细信息，或者换个方式提问？',
        '作为一个基础版助手，我的能力有限。如果你的问题比较复杂，建议直接联系博主获取帮助。'
    ];
    
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
        
        // 添加预设问题建议
        addSuggestedQuestions();
        
        // 检查本地存储中的历史记录
        loadChatHistory();
        
        // 初始化输入框样式
        userInput.style.height = 'auto';
        userInput.style.overflowX = 'hidden';
        
        console.log('基础版AI助手初始化完成');
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
        
        // 模拟网络延迟和处理时间
        setTimeout(() => {
            // 生成回复
            const response = generateResponse(message);
            
            // 更新加载消息为实际回复
            updateBotMessage(loadingId, response);
            
            // 保存聊天历史
            saveChatHistory();
        }, 600); // 适当的延迟，使体验更真实
    }
    
    // 添加预设问题建议
    function addSuggestedQuestions() {
        const suggestions = [
            '这个博客主要写什么内容？',
            '如何联系博主？',
            '推荐几篇热门文章'
        ];
        
        const container = document.createElement('div');
        container.className = 'ai-assistant-suggestions';
        
        const title = document.createElement('p');
        title.className = 'suggestions-title';
        title.textContent = '你可以问我：';
        container.appendChild(title);
        
        suggestions.forEach(question => {
            const button = document.createElement('button');
            button.className = 'suggestion-button';
            button.textContent = question;
            button.addEventListener('click', function() {
                userInput.value = question;
                sendMessage();
            });
            container.appendChild(button);
        });
        
        chatMessages.appendChild(container);
    }
    
    // 生成回复
    function generateResponse(message) {
        message = message.toLowerCase();
        
        // 检查是否匹配预设问答
        for (const faq of faqs) {
            // 检查是否包含关键词
            if (faq.keywords.some(keyword => message.includes(keyword.toLowerCase()))) {
                return faq.answer;
            }
        }
        
        // 如果没有匹配到预设问答，返回随机的默认回复
        return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
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
    
    // 保存聊天历史
    function saveChatHistory() {
        const chatHistory = Array.from(chatMessages.children)
            .filter(el => el.classList.contains('ai-assistant-message') || el.classList.contains('ai-assistant-suggestions'))
            .map(el => {
                if(el.classList.contains('ai-assistant-suggestions')) {
                    return { type: 'suggestions' };
                }
                const isUser = el.classList.contains('user-message');
                const content = el.querySelector('.message-content').innerHTML;
                return { type: 'message', isUser, content };
            });
        
        localStorage.setItem('ai-assistant-basic-history', JSON.stringify(chatHistory));
    }
    
    // 加载聊天历史
    function loadChatHistory() {
        const historyJson = localStorage.getItem('ai-assistant-basic-history');
        if(historyJson) {
            try {
                const history = JSON.parse(historyJson);
                // 清除欢迎消息
                chatMessages.innerHTML = '';
                
                let hasSuggestions = false;
                
                history.forEach(item => {
                    if(item.type === 'suggestions') {
                        hasSuggestions = true;
                        addSuggestedQuestions();
                    } else {
                        const messageElement = document.createElement('div');
                        messageElement.className = 'ai-assistant-message ' + (item.isUser ? 'user-message' : 'bot-message');
                        const avatarIcon = item.isUser ? 
                            '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/></svg>' : 
                            '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 2a9 9 0 0 0-9 9c0 4.17 2.84 7.67 6.69 8.69L12 22l2.31-2.31C18.16 18.67 21 15.17 21 11a9 9 0 0 0-9-9zm0 2c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.3c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/></svg>';
                        
                        messageElement.innerHTML = `
                            <div class="message-avatar">
                                ${avatarIcon}
                            </div>
                            <div class="message-content">${item.content}</div>
                        `;
                        chatMessages.appendChild(messageElement);
                    }
                });
                
                if(!hasSuggestions) {
                    addSuggestedQuestions();
                }
            } catch(e) {
                console.error('加载聊天历史出错:', e);
                clearChatHistory();
            }
        }
    }
    
    // 清除聊天历史
    function clearChatHistory() {
        localStorage.removeItem('ai-assistant-basic-history');
        chatMessages.innerHTML = '';
        addBotMessage(config.welcomeMessage);
        addSuggestedQuestions();
    }
    
    // 页面加载完成后初始化
    if(document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})(); 