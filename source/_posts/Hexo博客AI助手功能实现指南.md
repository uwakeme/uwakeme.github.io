---
title: 【前端功能】Hexo博客AI助手功能实现指南（集成DeepSeek/智谱GLM-4）
categories: 前端功能
tags:
  - JavaScript
  - CSS
  - Hexo
  - AI
  - 智谱AI
  - GLM-4
---

# 【前端功能】Hexo博客AI助手功能实现指南（集成DeepSeek/智谱GLM-4）

## 一、前言

在AI技术快速发展的时代，为个人博客添加智能助手功能已成为提升用户体验的重要手段。本文详细介绍如何在Hexo博客中实现一个美观实用的AI助手，支持多种AI模型接入（智谱GLM-4、DeepSeek等），并提供完整的代码实现。

特别值得一提的是，智谱AI推出的GLM-4模型目前提供了免费版本（glm-4-flash），可以零成本为你的博客增添智能交互能力。

## 二、功能特点

实现后的AI助手功能将具备以下特点：

- **美观的浮动聊天窗口**：支持深色/浅色模式自动适配
- **多种模型支持**：可接入智谱GLM-4、DeepSeek等多种AI模型
- **两种实现版本**：完整版（API调用）和基础版（预设问答，无需API）
- **流畅的用户体验**：打字动画、加载提示、Markdown渲染支持
- **响应式设计**：完美适配移动端和桌面端
- **本地记忆功能**：保存聊天历史，提供连续对话体验

## 三、实现步骤

### （一）准备工作

#### 1. 所需资源

- 已搭建的Hexo博客
- 智谱AI平台账号（使用GLM-4时需要）或DeepSeek账号
- 基本的JavaScript和CSS知识

#### 2. 注册智谱AI账号（可选）

如果选择使用智谱GLM-4模型：
1. 访问[智谱AI官网](https://open.bigmodel.cn/)
2. 完成注册并登录
3. 在个人中心创建API密钥并保存

### （二）创建必要文件

1. 在博客的`source/js`目录下创建以下文件：
   - `ai-assistant.js`（API版本）
   - `ai-assistant-basic.js`（基础版本，可选）

2. 在博客的`source/css`目录下创建：
   - `ai-assistant.css`（样式定义）

### （三）编写CSS样式

创建美观的UI界面，以下是核心CSS代码：

```css
/* 主容器 */
.ai-assistant-container {
    position: fixed;
    bottom: 70px;
    right: 20px;
    width: 350px;
    height: 450px;
    background-color: #fff;
    border-radius: 16px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
    display: flex;
    flex-direction: column;
    z-index: 1000;
    overflow: hidden;
    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    border: 1px solid rgba(0, 0, 0, 0.1);
}

/* 深色模式适配 */
[data-user-color-scheme='dark'] .ai-assistant-container {
    background-color: #2d2d2d;
    border-color: #444;
    color: #f0f0f0;
}

/* 悬浮按钮 */
.ai-assistant-toggle {
    position: fixed;
    bottom: 20px;
    right: 20px;
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background: linear-gradient(135deg, #6e8efb 0%, #a777e3 100%);
    color: white;
    border: none;
    box-shadow: 0 3px 15px rgba(0, 0, 0, 0.25);
    cursor: pointer;
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    transition: all 0.3s ease;
    animation: float 3s ease-in-out infinite;
}

@keyframes float {
    0% { transform: translateY(0px); }
    50% { transform: translateY(-6px); }
    100% { transform: translateY(0px); }
}

/* 消息样式 */
.ai-assistant-message {
    display: flex;
    margin-bottom: 15px;
}

.ai-assistant-message.user-message {
    justify-content: flex-end;
}

.message-avatar {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 8px;
}

.user-message .message-avatar {
    background-color: #e9f5ff;
    color: #4a89dc;
}

.bot-message .message-avatar {
    background-color: #f5f0ff;
    color: #a777e3;
}

.message-content {
    max-width: 70%;
    padding: 10px 14px;
    border-radius: 18px;
    font-size: 14px;
    line-height: 1.5;
}

.user-message .message-content {
    background-color: #4a89dc;
    color: white;
    border-top-right-radius: 4px;
}

.bot-message .message-content {
    background-color: #f0f0f0;
    color: #333;
    border-top-left-radius: 4px;
}

[data-user-color-scheme='dark'] .bot-message .message-content {
    background-color: #3a3a3a;
    color: #e0e0e0;
}

/* 加载动画 */
.ai-assistant-loading {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 20px;
}

.ai-assistant-loading span {
    display: inline-block;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background-color: #888;
    margin: 0 3px;
    animation: bounce 1.4s infinite ease-in-out both;
}

.ai-assistant-loading span:nth-child(1) {
    animation-delay: -0.32s;
}

.ai-assistant-loading span:nth-child(2) {
    animation-delay: -0.16s;
}

@keyframes bounce {
    0%, 80%, 100% { transform: scale(0); } 
    40% { transform: scale(1.0); }
}
```

### （四）实现智谱GLM-4版本（完整版）

以下是使用智谱GLM-4模型的JavaScript实现：

```javascript
/**
 * AI助手模块 - 为博客添加智能对话功能
 * 基于智谱GLM-4-Flash模型，帮助访问者解答问题
 */

(function() {
    'use strict';
    
    // 配置参数
    const config = {
        botName: '博客智能助手',
        welcomeMessage: '你好！我是博客助手，有什么可以帮到你的吗？',
        placeholder: '输入你的问题...',
        apiKey: '', // 在实际使用时填入你的智谱API密钥
        apiEndpoint: 'https://open.bigmodel.cn/api/paas/v4/chat/completions', // 智谱GLM-4 API的URL
        modelName: 'glm-4-flash-250414', // 智谱GLM-4-Flash模型名称（免费版）
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
    }
    
    // 创建聊天界面
    function createChatUI() {
        // 创建主容器
        chatContainer = document.createElement('div');
        chatContainer.className = 'ai-assistant-container';
        chatContainer.innerHTML = `
            <div class="ai-assistant-header">
                <div class="ai-assistant-title">
                    <i class="fas fa-robot"></i> ${config.botName}
                </div>
                <div class="ai-assistant-actions">
                    <button class="ai-assistant-minimize">—</button>
                    <button class="ai-assistant-close">×</button>
                </div>
            </div>
            <div class="ai-assistant-messages"></div>
            <div class="ai-assistant-input-container">
                <textarea class="ai-assistant-input" placeholder="${config.placeholder}" rows="1"></textarea>
                <button class="ai-assistant-send">
                    <i class="fas fa-paper-plane"></i>
                </button>
            </div>
        `;
        
        // 创建悬浮按钮
        toggleButton = document.createElement('button');
        toggleButton.className = 'ai-assistant-toggle';
        toggleButton.innerHTML = '<i class="fas fa-robot"></i>';
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
    
    // 请求AI回复的核心函数
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
    
    // 其他必要函数（发送消息、添加消息到界面等）略...
    
    // 页面加载完成后初始化
    if(document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
```

### （五）实现DeepSeek版本

如果你想使用DeepSeek API，只需修改配置部分：

```javascript
// 配置参数
const config = {
    botName: '博客智能助手',
    welcomeMessage: '你好！我是博客助手，有什么可以帮到你的吗？',
    placeholder: '输入你的问题...',
    apiKey: '', // 在这里填入你的DeepSeek API密钥
    apiEndpoint: 'https://api.deepseek.com/v1/chat/completions', // DeepSeek API URL
    modelName: 'deepseek-chat', // DeepSeek模型
    maxTokens: 2000,
    temperature: 0.7
};
```

### （六）基础版实现（无需API）

如果不想申请API密钥或担心API使用成本，可以使用基础版：

```javascript
/**
 * 基础版AI助手模块 - 不需要API密钥，使用预设回答
 */

(function() {
    'use strict';
    
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
        // 可以添加更多预设问答...
    ];
    
    // 生成回复
    function generateResponse(message) {
        message = message.toLowerCase();
        
        // 检查是否匹配预设问答
        for (const faq of faqs) {
            if (faq.keywords.some(keyword => message.includes(keyword.toLowerCase()))) {
                return faq.answer;
            }
        }
        
        return '抱歉，我目前无法回答这个问题。你可以尝试浏览博客分类或使用搜索功能查找相关内容。';
    }
})();
```

### （七）引入AI助手到博客中

在Hexo主题的配置文件中添加自定义JS和CSS：

```yaml
custom_js:
  - /js/ai-assistant.js # 或者使用 ai-assistant-basic.js
  
custom_css:
  - /css/ai-assistant.css
```

## 四、高级功能

### （一）保护API密钥安全

为了避免API密钥在前端暴露，可以使用代理服务器：

```javascript
// Netlify function示例: /netlify/functions/ai-proxy.js
exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const body = JSON.parse(event.body);
    const { message } = body;
    
    const response = await fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.ZHIPUAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'glm-4-flash-250414',
        messages: [{ role: 'user', content: message }],
        max_tokens: 2000,
        temperature: 0.7
      })
    });
    
    const data = await response.json();
    return {
      statusCode: 200,
      body: JSON.stringify(data)
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
```

### （二）实现多轮对话记忆

保存对话历史，实现上下文连续对话：

```javascript
// 保存对话历史
let conversationHistory = [];

async function sendMessageWithContext(message) {
    // 添加用户消息到历史
    conversationHistory.push({
        role: 'user',
        content: message
    });
    
    // 构建带上下文的请求
    const messagesWithContext = [
        {
            role: 'system',
            content: '你是一个友好、专业的博客助手，负责回答访客的问题。'
        },
        ...conversationHistory
    ];
    
    // 如果历史过长，可以裁剪保留最近的几轮对话
    if(messagesWithContext.length > 10) {
        messagesWithContext = [
            messagesWithContext[0], // 保留system消息
            ...messagesWithContext.slice(messagesWithContext.length - 9) // 保留最近的对话
        ];
    }
    
    // 发送API请求
    // ...
    
    // 将AI回复添加到历史
    conversationHistory.push({
        role: 'assistant',
        content: aiResponse
    });
    
    return aiResponse;
}
```

### （三）添加语音输入功能

使用Web Speech API实现语音输入：

```javascript
// 添加语音输入按钮
const voiceButton = document.createElement('button');
voiceButton.className = 'ai-assistant-voice';
voiceButton.innerHTML = '<i class="fas fa-microphone"></i>';
inputContainer.appendChild(voiceButton);

// 语音识别功能
voiceButton.addEventListener('click', function() {
    if ('webkitSpeechRecognition' in window) {
        const recognition = new webkitSpeechRecognition();
        recognition.lang = 'zh-CN';
        recognition.interimResults = false;
        
        recognition.onresult = function(event) {
            const transcript = event.results[0][0].transcript;
            userInput.value = transcript;
            sendMessage();
        };
        
        recognition.start();
    } else {
        alert('抱歉，您的浏览器不支持语音识别功能');
    }
});
```

## 五、常见问题解决

### （一）API调用失败

如果遇到API调用失败的问题：

1. **API密钥错误**：确认API密钥是否正确复制
2. **网络问题**：检查网络连接是否正常
3. **请求格式错误**：确保请求体格式符合API要求
4. **添加重试机制**：

```javascript
async function fetchWithRetry(url, options, retries = 3) {
    try {
        return await fetch(url, options);
    } catch(error) {
        if(retries > 0) {
            console.log(`请求失败，剩余重试次数: ${retries-1}`);
            return fetchWithRetry(url, options, retries - 1);
        }
        throw error;
    }
}
```

### （二）深色模式适配问题

如果深色模式显示不正确，可能需要修改CSS变量或添加更多适配规则：

```css
/* 使用CSS变量适配主题 */
:root {
    --ai-primary-color: #4a89dc;
    --ai-text-color: #333;
    --ai-bg-color: #fff;
}

[data-user-color-scheme='dark'] {
    --ai-primary-color: #5d9cff;
    --ai-text-color: #f0f0f0;
    --ai-bg-color: #2d2d2d;
}

.ai-assistant-header {
    background-color: var(--ai-primary-color);
}
```

## 六、总结

通过本文介绍的方法，我们可以为Hexo博客添加一个美观实用的AI助手功能。无论是选择接入智谱GLM-4的免费模型，还是使用DeepSeek等其他AI服务，或者仅实现基础版预设问答，都能为博客访客提供更好的交互体验。

特别值得一提的是，智谱AI提供的GLM-4-Flash模型目前完全免费使用，这使得个人博客站长也能零成本享受AI带来的便利。

希望这篇教程对你有所帮助，赶快为你的博客添加一个智能助手吧！

## 参考资料

1. [智谱AI官方文档](https://open.bigmodel.cn/dev/api)
2. [Hexo官方文档](https://hexo.io/docs/)
3. [DeepSeek API文档](https://api.deepseek.com) 