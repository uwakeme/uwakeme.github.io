---
title: 【前端】HTML5现代Web开发完全指南：从基础特性到高级应用的全面实践
categories: 前端
date: 2025-01-29
tags:
  - HTML5
  - Web开发
  - 前端技术
  - 移动端
  - 响应式设计
  - Web API
cover: https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/html5.svg
---

# 前言

HTML5作为Web标准的重大革新，不仅仅是HTML的第五个版本，更是现代Web开发的基石。它引入了语义化标签、多媒体支持、离线存储、地理定位等众多新特性，同时配合CSS3和JavaScript，构建了完整的现代Web开发生态。就像从传统建筑到现代摩天大楼的演进一样，HTML5将Web开发从静态页面时代带入了富交互应用时代。本文将全面介绍HTML5的核心特性、开发实践和最佳应用，帮助开发者掌握现代Web开发的核心技术。

# 一、HTML5概述与核心特性

## （一）HTML5的发展历程

**HTML5的技术演进：**
```
HTML发展历程：

HTML 1.0 (1993)：
├── 基础标签：<html>、<head>、<body>
├── 文本格式：<h1>-<h6>、<p>、<br>
├── 链接图片：<a>、<img>
└── 列表表格：<ul>、<ol>、<table>

HTML 4.01 (1999)：
├── 表单增强：<form>、<input>、<select>
├── 样式分离：引入CSS支持
├── 脚本支持：<script>标签
└── 框架支持：<frameset>、<frame>

XHTML 1.0 (2000)：
├── XML语法：严格的标签闭合
├── 小写标签：统一标签命名规范
├── 属性引号：所有属性值必须加引号
└── 文档类型：DOCTYPE声明

HTML5 (2014)：
├── 语义化标签：<header>、<nav>、<section>、<article>
├── 多媒体支持：<video>、<audio>、<canvas>
├── 表单增强：新的input类型和属性
├── 离线存储：localStorage、sessionStorage
├── 地理定位：Geolocation API
├── 拖拽支持：Drag and Drop API
├── Web Workers：多线程支持
└── WebSocket：实时通信
```

**HTML5与传统HTML的对比：**

| 特性 | HTML 4.01 | HTML5 |
|------|-----------|-------|
| **文档类型** | 复杂的DOCTYPE | 简化的`<!DOCTYPE html>` |
| **语义化** | 依赖div+class | 语义化标签 |
| **多媒体** | 依赖插件 | 原生支持 |
| **表单** | 基础表单元素 | 丰富的input类型 |
| **存储** | 仅Cookie | 多种存储方案 |
| **图形** | 依赖Flash/SVG | Canvas原生支持 |
| **通信** | 轮询/长连接 | WebSocket实时通信 |
| **离线** | 不支持 | Application Cache |

## （二）HTML5核心特性详解

**语义化标签：**
```html
<!-- HTML5语义化标签：提供更好的文档结构和SEO支持 -->
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>HTML5语义化页面结构</title>
</head>
<body>
    <!-- 页面头部：包含导航、logo等 -->
    <header class="site-header">
        <nav class="main-navigation">
            <ul>
                <li><a href="#home">首页</a></li>
                <li><a href="#about">关于</a></li>
                <li><a href="#services">服务</a></li>
                <li><a href="#contact">联系</a></li>
            </ul>
        </nav>
    </header>
    
    <!-- 主要内容区域 -->
    <main class="main-content">
        <!-- 文章内容：独立的内容单元 -->
        <article class="blog-post">
            <header class="post-header">
                <h1>HTML5现代Web开发</h1>
                <time datetime="2025-01-29">2025年1月29日</time>
                <address class="author">
                    作者：<a href="mailto:author@example.com">张三</a>
                </address>
            </header>
            
            <!-- 文章正文 -->
            <section class="post-content">
                <h2>HTML5的核心特性</h2>
                <p>HTML5引入了许多新的语义化标签，使得网页结构更加清晰...</p>
                
                <!-- 代码示例 -->
                <figure class="code-example">
                    <pre><code>&lt;section&gt;内容区域&lt;/section&gt;</code></pre>
                    <figcaption>HTML5语义化标签示例</figcaption>
                </figure>
            </section>
            
            <!-- 相关内容 -->
            <aside class="related-content">
                <h3>相关文章</h3>
                <ul>
                    <li><a href="#">CSS3新特性详解</a></li>
                    <li><a href="#">JavaScript ES6入门</a></li>
                </ul>
            </aside>
        </article>
        
        <!-- 另一个内容区域 -->
        <section class="features-section">
            <h2>HTML5新特性</h2>
            <div class="features-grid">
                <article class="feature-item">
                    <h3>语义化标签</h3>
                    <p>提供更好的文档结构和可访问性</p>
                </article>
                <article class="feature-item">
                    <h3>多媒体支持</h3>
                    <p>原生支持音频和视频播放</p>
                </article>
                <article class="feature-item">
                    <h3>Canvas绘图</h3>
                    <p>强大的2D图形绘制能力</p>
                </article>
            </div>
        </section>
    </main>
    
    <!-- 页面底部 -->
    <footer class="site-footer">
        <section class="footer-content">
            <div class="contact-info">
                <h4>联系信息</h4>
                <address>
                    <p>地址：北京市朝阳区某某街道123号</p>
                    <p>电话：<a href="tel:+86-10-12345678">010-12345678</a></p>
                    <p>邮箱：<a href="mailto:info@example.com">info@example.com</a></p>
                </address>
            </div>
        </section>
        <small class="copyright">
            &copy; 2025 示例网站. 保留所有权利.
        </small>
    </footer>
</body>
</html>
```

**多媒体支持：**
```html
<!-- HTML5原生多媒体支持：无需插件即可播放音视频 -->
<section class="multimedia-demo">
    <h2>HTML5多媒体特性</h2>
    
    <!-- 视频播放：支持多种格式和控制选项 -->
    <div class="video-container">
        <video 
            width="800" 
            height="450" 
            controls 
            preload="metadata"
            poster="video-poster.jpg"
            crossorigin="anonymous"
        >
            <!-- 多格式支持：浏览器会选择支持的格式 -->
            <source src="demo-video.mp4" type="video/mp4">
            <source src="demo-video.webm" type="video/webm">
            <source src="demo-video.ogg" type="video/ogg">
            
            <!-- 字幕支持：提供多语言字幕 -->
            <track 
                kind="subtitles" 
                src="subtitles-zh.vtt" 
                srclang="zh" 
                label="中文字幕"
                default
            >
            <track 
                kind="subtitles" 
                src="subtitles-en.vtt" 
                srclang="en" 
                label="English Subtitles"
            >
            
            <!-- 降级处理：不支持video标签时的提示 -->
            <p>您的浏览器不支持HTML5视频播放。
               <a href="demo-video.mp4">点击下载视频</a>
            </p>
        </video>
    </div>
    
    <!-- 音频播放：支持背景音乐和音效 -->
    <div class="audio-container">
        <h3>音频播放示例</h3>
        <audio 
            controls 
            preload="none"
            loop
        >
            <source src="background-music.mp3" type="audio/mpeg">
            <source src="background-music.ogg" type="audio/ogg">
            <source src="background-music.wav" type="audio/wav">
            <p>您的浏览器不支持HTML5音频播放。</p>
        </audio>
        
        <!-- 音效按钮：通过JavaScript控制播放 -->
        <div class="sound-effects">
            <button onclick="playSound('click')">点击音效</button>
            <button onclick="playSound('success')">成功音效</button>
            <button onclick="playSound('error')">错误音效</button>
            
            <!-- 隐藏的音频元素：用于音效播放 -->
            <audio id="click-sound" preload="auto">
                <source src="sounds/click.mp3" type="audio/mpeg">
            </audio>
            <audio id="success-sound" preload="auto">
                <source src="sounds/success.mp3" type="audio/mpeg">
            </audio>
            <audio id="error-sound" preload="auto">
                <source src="sounds/error.mp3" type="audio/mpeg">
            </audio>
        </div>
    </div>
</section>

<script>
// 音效播放函数：控制音频播放
function playSound(soundType) {
    const audio = document.getElementById(soundType + '-sound');
    if (audio) {
        // 重置播放位置，支持快速连续播放
        audio.currentTime = 0;
        audio.play().catch(error => {
            console.warn('音频播放失败：', error);
        });
    }
}

// 视频播放控制：添加自定义功能
document.addEventListener('DOMContentLoaded', function() {
    const video = document.querySelector('video');
    
    if (video) {
        // 监听视频事件
        video.addEventListener('loadstart', () => {
            console.log('开始加载视频');
        });
        
        video.addEventListener('canplay', () => {
            console.log('视频可以播放');
        });
        
        video.addEventListener('play', () => {
            console.log('视频开始播放');
        });
        
        video.addEventListener('pause', () => {
            console.log('视频暂停');
        });
        
        video.addEventListener('ended', () => {
            console.log('视频播放结束');
            // 可以在这里添加播放结束后的逻辑
        });
        
        // 播放进度监听
        video.addEventListener('timeupdate', () => {
            const progress = (video.currentTime / video.duration) * 100;
            // 可以在这里更新自定义进度条
            console.log(`播放进度: ${progress.toFixed(2)}%`);
        });
    }
});
</script>
```

**Canvas绘图：**
```html
<!-- HTML5 Canvas：强大的2D图形绘制能力 -->
<section class="canvas-demo">
    <h2>Canvas绘图示例</h2>

    <!-- 基础绘图画布 -->
    <div class="canvas-container">
        <h3>基础图形绘制</h3>
        <canvas
            id="basic-canvas"
            width="800"
            height="400"
            style="border: 1px solid #ccc;"
        >
            您的浏览器不支持Canvas，请升级浏览器。
        </canvas>

        <div class="canvas-controls">
            <button onclick="drawBasicShapes()">绘制基础图形</button>
            <button onclick="clearCanvas('basic-canvas')">清除画布</button>
        </div>
    </div>

    <!-- 交互式绘图 -->
    <div class="canvas-container">
        <h3>交互式绘图</h3>
        <canvas
            id="interactive-canvas"
            width="800"
            height="400"
            style="border: 1px solid #ccc; cursor: crosshair;"
        ></canvas>

        <div class="drawing-controls">
            <label>画笔颜色：
                <input type="color" id="brush-color" value="#000000">
            </label>
            <label>画笔大小：
                <input type="range" id="brush-size" min="1" max="50" value="5">
                <span id="brush-size-display">5</span>px
            </label>
            <button onclick="clearCanvas('interactive-canvas')">清除画布</button>
            <button onclick="saveCanvas()">保存图片</button>
        </div>
    </div>

    <!-- 动画演示 -->
    <div class="canvas-container">
        <h3>Canvas动画</h3>
        <canvas
            id="animation-canvas"
            width="800"
            height="400"
            style="border: 1px solid #ccc;"
        ></canvas>

        <div class="animation-controls">
            <button onclick="startAnimation()">开始动画</button>
            <button onclick="stopAnimation()">停止动画</button>
            <button onclick="resetAnimation()">重置动画</button>
        </div>
    </div>
</section>

<script>
// Canvas绘图功能实现
class CanvasDrawing {
    constructor() {
        this.isDrawing = false;
        this.animationId = null;
        this.balls = [];
        this.initInteractiveCanvas();
        this.initAnimation();
    }

    // 绘制基础图形
    drawBasicShapes() {
        const canvas = document.getElementById('basic-canvas');
        const ctx = canvas.getContext('2d');

        // 清除画布
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // 绘制矩形
        ctx.fillStyle = '#ff6b6b';
        ctx.fillRect(50, 50, 100, 80);

        // 绘制描边矩形
        ctx.strokeStyle = '#4ecdc4';
        ctx.lineWidth = 3;
        ctx.strokeRect(200, 50, 100, 80);

        // 绘制圆形
        ctx.beginPath();
        ctx.arc(400, 90, 40, 0, 2 * Math.PI);
        ctx.fillStyle = '#45b7d1';
        ctx.fill();

        // 绘制路径
        ctx.beginPath();
        ctx.moveTo(500, 50);
        ctx.lineTo(550, 130);
        ctx.lineTo(600, 50);
        ctx.closePath();
        ctx.fillStyle = '#f9ca24';
        ctx.fill();

        // 绘制文字
        ctx.font = '24px Arial';
        ctx.fillStyle = '#2d3436';
        ctx.fillText('HTML5 Canvas绘图', 50, 200);

        // 绘制渐变
        const gradient = ctx.createLinearGradient(50, 250, 200, 350);
        gradient.addColorStop(0, '#ff7675');
        gradient.addColorStop(1, '#fd79a8');
        ctx.fillStyle = gradient;
        ctx.fillRect(50, 250, 150, 100);

        // 绘制图像（如果有的话）
        const img = new Image();
        img.onload = function() {
            ctx.drawImage(img, 250, 250, 100, 100);
        };
        img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzc0YjlmZiIvPjx0ZXh0IHg9IjUwIiB5PSI1NSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+SVNWRzwvdGV4dD48L3N2Zz4=';
    }

    // 初始化交互式画布
    initInteractiveCanvas() {
        const canvas = document.getElementById('interactive-canvas');
        const ctx = canvas.getContext('2d');
        const brushSizeSlider = document.getElementById('brush-size');
        const brushSizeDisplay = document.getElementById('brush-size-display');

        // 画笔大小显示更新
        brushSizeSlider.addEventListener('input', (e) => {
            brushSizeDisplay.textContent = e.target.value;
        });

        // 鼠标事件处理
        canvas.addEventListener('mousedown', (e) => {
            this.isDrawing = true;
            this.draw(e, ctx, canvas);
        });

        canvas.addEventListener('mousemove', (e) => {
            if (this.isDrawing) {
                this.draw(e, ctx, canvas);
            }
        });

        canvas.addEventListener('mouseup', () => {
            this.isDrawing = false;
            ctx.beginPath();
        });

        canvas.addEventListener('mouseout', () => {
            this.isDrawing = false;
            ctx.beginPath();
        });

        // 触摸事件处理（移动端支持）
        canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.isDrawing = true;
            const touch = e.touches[0];
            const mouseEvent = new MouseEvent('mousedown', {
                clientX: touch.clientX,
                clientY: touch.clientY
            });
            canvas.dispatchEvent(mouseEvent);
        });

        canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            if (this.isDrawing) {
                const touch = e.touches[0];
                const mouseEvent = new MouseEvent('mousemove', {
                    clientX: touch.clientX,
                    clientY: touch.clientY
                });
                canvas.dispatchEvent(mouseEvent);
            }
        });

        canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.isDrawing = false;
            ctx.beginPath();
        });
    }

    // 绘制函数
    draw(e, ctx, canvas) {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const color = document.getElementById('brush-color').value;
        const size = document.getElementById('brush-size').value;

        ctx.lineWidth = size;
        ctx.lineCap = 'round';
        ctx.strokeStyle = color;

        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x, y);
    }

    // 初始化动画
    initAnimation() {
        // 创建小球对象
        for (let i = 0; i < 10; i++) {
            this.balls.push({
                x: Math.random() * 800,
                y: Math.random() * 400,
                vx: (Math.random() - 0.5) * 4,
                vy: (Math.random() - 0.5) * 4,
                radius: Math.random() * 20 + 10,
                color: `hsl(${Math.random() * 360}, 70%, 60%)`
            });
        }
    }

    // 动画循环
    animate() {
        const canvas = document.getElementById('animation-canvas');
        const ctx = canvas.getContext('2d');

        // 清除画布
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // 更新和绘制小球
        this.balls.forEach(ball => {
            // 更新位置
            ball.x += ball.vx;
            ball.y += ball.vy;

            // 边界碰撞检测
            if (ball.x + ball.radius > canvas.width || ball.x - ball.radius < 0) {
                ball.vx = -ball.vx;
            }
            if (ball.y + ball.radius > canvas.height || ball.y - ball.radius < 0) {
                ball.vy = -ball.vy;
            }

            // 绘制小球
            ctx.beginPath();
            ctx.arc(ball.x, ball.y, ball.radius, 0, 2 * Math.PI);
            ctx.fillStyle = ball.color;
            ctx.fill();

            // 添加阴影效果
            ctx.shadowColor = ball.color;
            ctx.shadowBlur = 10;
            ctx.fill();
            ctx.shadowBlur = 0;
        });

        // 继续动画
        this.animationId = requestAnimationFrame(() => this.animate());
    }

    // 开始动画
    startAnimation() {
        if (!this.animationId) {
            this.animate();
        }
    }

    // 停止动画
    stopAnimation() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }

    // 重置动画
    resetAnimation() {
        this.stopAnimation();
        this.initAnimation();
        const canvas = document.getElementById('animation-canvas');
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
}

// 全局函数
let canvasDrawing;

document.addEventListener('DOMContentLoaded', function() {
    canvasDrawing = new CanvasDrawing();
});

function drawBasicShapes() {
    canvasDrawing.drawBasicShapes();
}

function clearCanvas(canvasId) {
    const canvas = document.getElementById(canvasId);
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function saveCanvas() {
    const canvas = document.getElementById('interactive-canvas');
    const link = document.createElement('a');
    link.download = 'canvas-drawing.png';
    link.href = canvas.toDataURL();
    link.click();
}

function startAnimation() {
    canvasDrawing.startAnimation();
}

function stopAnimation() {
    canvasDrawing.stopAnimation();
}

function resetAnimation() {
    canvasDrawing.resetAnimation();
}
</script>
```

# 二、HTML5表单增强与数据处理

## （一）新的表单元素和输入类型

**HTML5表单增强：**
```html
<!-- HTML5表单增强：提供更丰富的输入类型和验证功能 -->
<section class="form-demo">
    <h2>HTML5表单增强特性</h2>

    <form id="enhanced-form" class="enhanced-form" novalidate>
        <fieldset>
            <legend>基本信息</legend>

            <!-- 文本输入：支持占位符和自动完成 -->
            <div class="form-group">
                <label for="username">用户名：</label>
                <input
                    type="text"
                    id="username"
                    name="username"
                    placeholder="请输入用户名"
                    required
                    minlength="3"
                    maxlength="20"
                    pattern="[a-zA-Z0-9_]+"
                    autocomplete="username"
                    title="用户名只能包含字母、数字和下划线"
                >
                <span class="error-message"></span>
            </div>

            <!-- 邮箱输入：自动验证邮箱格式 -->
            <div class="form-group">
                <label for="email">邮箱地址：</label>
                <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="example@domain.com"
                    required
                    autocomplete="email"
                >
                <span class="error-message"></span>
            </div>

            <!-- 电话输入：支持电话号码格式 -->
            <div class="form-group">
                <label for="phone">手机号码：</label>
                <input
                    type="tel"
                    id="phone"
                    name="phone"
                    placeholder="13800138000"
                    pattern="1[3-9]\d{9}"
                    title="请输入正确的手机号码"
                >
                <span class="error-message"></span>
            </div>

            <!-- URL输入：自动验证URL格式 -->
            <div class="form-group">
                <label for="website">个人网站：</label>
                <input
                    type="url"
                    id="website"
                    name="website"
                    placeholder="https://www.example.com"
                >
                <span class="error-message"></span>
            </div>
        </fieldset>

        <fieldset>
            <legend>数值和日期</legend>

            <!-- 数字输入：支持数值范围和步长 -->
            <div class="form-group">
                <label for="age">年龄：</label>
                <input
                    type="number"
                    id="age"
                    name="age"
                    min="18"
                    max="100"
                    step="1"
                    placeholder="请输入年龄"
                >
                <span class="error-message"></span>
            </div>

            <!-- 范围输入：滑块选择 -->
            <div class="form-group">
                <label for="salary">期望薪资（千元）：</label>
                <input
                    type="range"
                    id="salary"
                    name="salary"
                    min="5"
                    max="50"
                    step="1"
                    value="15"
                    oninput="updateSalaryDisplay(this.value)"
                >
                <output id="salary-display">15</output>k
                <span class="error-message"></span>
            </div>

            <!-- 日期输入：日期选择器 -->
            <div class="form-group">
                <label for="birthday">出生日期：</label>
                <input
                    type="date"
                    id="birthday"
                    name="birthday"
                    max="2005-12-31"
                >
                <span class="error-message"></span>
            </div>

            <!-- 时间输入：时间选择器 -->
            <div class="form-group">
                <label for="meeting-time">会议时间：</label>
                <input
                    type="datetime-local"
                    id="meeting-time"
                    name="meeting-time"
                    min="2025-01-29T09:00"
                >
                <span class="error-message"></span>
            </div>

            <!-- 颜色输入：颜色选择器 -->
            <div class="form-group">
                <label for="favorite-color">喜欢的颜色：</label>
                <input
                    type="color"
                    id="favorite-color"
                    name="favorite-color"
                    value="#3498db"
                >
                <span class="error-message"></span>
            </div>
        </fieldset>

        <fieldset>
            <legend>文件和搜索</legend>

            <!-- 文件上传：支持多文件和文件类型限制 -->
            <div class="form-group">
                <label for="avatar">头像上传：</label>
                <input
                    type="file"
                    id="avatar"
                    name="avatar"
                    accept="image/*"
                    onchange="previewImage(this)"
                >
                <div id="image-preview"></div>
                <span class="error-message"></span>
            </div>

            <!-- 多文件上传 -->
            <div class="form-group">
                <label for="documents">文档上传：</label>
                <input
                    type="file"
                    id="documents"
                    name="documents"
                    multiple
                    accept=".pdf,.doc,.docx,.txt"
                    onchange="showFileList(this)"
                >
                <div id="file-list"></div>
                <span class="error-message"></span>
            </div>

            <!-- 搜索输入：搜索框样式 -->
            <div class="form-group">
                <label for="search">搜索：</label>
                <input
                    type="search"
                    id="search"
                    name="search"
                    placeholder="搜索内容..."
                    list="search-suggestions"
                >
                <!-- 数据列表：提供搜索建议 -->
                <datalist id="search-suggestions">
                    <option value="HTML5">
                    <option value="CSS3">
                    <option value="JavaScript">
                    <option value="Vue.js">
                    <option value="React">
                </datalist>
                <span class="error-message"></span>
            </div>
        </fieldset>

        <fieldset>
            <legend>其他控件</legend>

            <!-- 进度条：显示进度 -->
            <div class="form-group">
                <label>上传进度：</label>
                <progress id="upload-progress" value="0" max="100">0%</progress>
                <span id="progress-text">0%</span>
            </div>

            <!-- 测量值：显示已知范围内的标量值 -->
            <div class="form-group">
                <label>磁盘使用情况：</label>
                <meter id="disk-usage" value="0.6" min="0" max="1">60%</meter>
                <span>60% 已使用</span>
            </div>

            <!-- 详情展开：可折叠内容 -->
            <details class="form-group">
                <summary>高级设置</summary>
                <div class="advanced-settings">
                    <label>
                        <input type="checkbox" name="notifications" checked>
                        接收邮件通知
                    </label>
                    <label>
                        <input type="checkbox" name="newsletter">
                        订阅新闻简报
                    </label>
                </div>
            </details>
        </fieldset>

        <!-- 表单操作按钮 -->
        <div class="form-actions">
            <button type="submit">提交表单</button>
            <button type="reset">重置表单</button>
            <button type="button" onclick="validateForm()">验证表单</button>
            <button type="button" onclick="fillSampleData()">填充示例数据</button>
        </div>
    </form>
</section>

<script>
// HTML5表单处理和验证
class FormHandler {
    constructor(formId) {
        this.form = document.getElementById(formId);
        this.initFormHandling();
    }

    // 初始化表单处理
    initFormHandling() {
        if (!this.form) return;

        // 表单提交处理
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSubmit();
        });

        // 实时验证
        this.form.addEventListener('input', (e) => {
            this.validateField(e.target);
        });

        // 失焦验证
        this.form.addEventListener('blur', (e) => {
            this.validateField(e.target);
        }, true);
    }

    // 处理表单提交
    async handleSubmit() {
        if (this.validateForm()) {
            const formData = new FormData(this.form);

            // 显示提交进度
            this.showProgress();

            try {
                // 模拟表单提交
                await this.submitForm(formData);
                this.showSuccess('表单提交成功！');
            } catch (error) {
                this.showError('表单提交失败：' + error.message);
            } finally {
                this.hideProgress();
            }
        }
    }

    // 验证整个表单
    validateForm() {
        let isValid = true;
        const inputs = this.form.querySelectorAll('input, select, textarea');

        inputs.forEach(input => {
            if (!this.validateField(input)) {
                isValid = false;
            }
        });

        return isValid;
    }

    // 验证单个字段
    validateField(field) {
        const errorElement = field.parentNode.querySelector('.error-message');
        let isValid = true;
        let errorMessage = '';

        // HTML5原生验证
        if (!field.checkValidity()) {
            isValid = false;
            errorMessage = field.validationMessage;
        }

        // 自定义验证规则
        if (isValid) {
            switch (field.type) {
                case 'tel':
                    if (field.value && !/^1[3-9]\d{9}$/.test(field.value)) {
                        isValid = false;
                        errorMessage = '请输入正确的手机号码';
                    }
                    break;

                case 'file':
                    if (field.files.length > 0) {
                        const file = field.files[0];
                        if (field.id === 'avatar' && file.size > 2 * 1024 * 1024) {
                            isValid = false;
                            errorMessage = '头像文件大小不能超过2MB';
                        }
                    }
                    break;
            }
        }

        // 显示错误信息
        if (errorElement) {
            errorElement.textContent = errorMessage;
            errorElement.style.display = errorMessage ? 'block' : 'none';
        }

        // 添加样式类
        field.classList.toggle('invalid', !isValid);
        field.classList.toggle('valid', isValid && field.value);

        return isValid;
    }

    // 模拟表单提交
    async submitForm(formData) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // 模拟网络请求
                if (Math.random() > 0.1) { // 90%成功率
                    resolve({ success: true, message: '提交成功' });
                } else {
                    reject(new Error('网络错误'));
                }
            }, 2000);
        });
    }

    // 显示进度
    showProgress() {
        const progress = document.getElementById('upload-progress');
        const progressText = document.getElementById('progress-text');
        let value = 0;

        const interval = setInterval(() => {
            value += Math.random() * 20;
            if (value >= 100) {
                value = 100;
                clearInterval(interval);
            }

            progress.value = value;
            progressText.textContent = Math.round(value) + '%';
        }, 100);
    }

    // 隐藏进度
    hideProgress() {
        const progress = document.getElementById('upload-progress');
        const progressText = document.getElementById('progress-text');
        progress.value = 0;
        progressText.textContent = '0%';
    }

    // 显示成功消息
    showSuccess(message) {
        alert('✅ ' + message);
    }

    // 显示错误消息
    showError(message) {
        alert('❌ ' + message);
    }
}

// 全局函数
function updateSalaryDisplay(value) {
    document.getElementById('salary-display').textContent = value;
}

function previewImage(input) {
    const preview = document.getElementById('image-preview');
    preview.innerHTML = '';

    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = document.createElement('img');
            img.src = e.target.result;
            img.style.maxWidth = '200px';
            img.style.maxHeight = '200px';
            img.style.marginTop = '10px';
            preview.appendChild(img);
        };
        reader.readAsDataURL(input.files[0]);
    }
}

function showFileList(input) {
    const fileList = document.getElementById('file-list');
    fileList.innerHTML = '';

    if (input.files.length > 0) {
        const ul = document.createElement('ul');
        for (let i = 0; i < input.files.length; i++) {
            const li = document.createElement('li');
            li.textContent = `${input.files[i].name} (${(input.files[i].size / 1024).toFixed(2)} KB)`;
            ul.appendChild(li);
        }
        fileList.appendChild(ul);
    }
}

function validateForm() {
    formHandler.validateForm();
}

function fillSampleData() {
    document.getElementById('username').value = 'testuser';
    document.getElementById('email').value = 'test@example.com';
    document.getElementById('phone').value = '13800138000';
    document.getElementById('website').value = 'https://www.example.com';
    document.getElementById('age').value = '25';
    document.getElementById('birthday').value = '1999-01-01';
}

// 初始化表单处理器
let formHandler;
document.addEventListener('DOMContentLoaded', function() {
    formHandler = new FormHandler('enhanced-form');
});
</script>
```

# 三、HTML5 Web API与高级功能

## （一）Web存储技术

**本地存储和会话存储：**
```html
<!-- HTML5 Web存储：localStorage和sessionStorage -->
<section class="storage-demo">
    <h2>Web存储技术演示</h2>

    <!-- localStorage演示 -->
    <div class="storage-container">
        <h3>localStorage（持久存储）</h3>
        <div class="storage-controls">
            <input type="text" id="local-key" placeholder="键名">
            <input type="text" id="local-value" placeholder="值">
            <button onclick="setLocalStorage()">存储数据</button>
            <button onclick="getLocalStorage()">获取数据</button>
            <button onclick="removeLocalStorage()">删除数据</button>
            <button onclick="clearLocalStorage()">清空存储</button>
        </div>
        <div id="local-result" class="result-display"></div>
        <div id="local-list" class="storage-list"></div>
    </div>

    <!-- sessionStorage演示 -->
    <div class="storage-container">
        <h3>sessionStorage（会话存储）</h3>
        <div class="storage-controls">
            <input type="text" id="session-key" placeholder="键名">
            <input type="text" id="session-value" placeholder="值">
            <button onclick="setSessionStorage()">存储数据</button>
            <button onclick="getSessionStorage()">获取数据</button>
            <button onclick="removeSessionStorage()">删除数据</button>
            <button onclick="clearSessionStorage()">清空存储</button>
        </div>
        <div id="session-result" class="result-display"></div>
        <div id="session-list" class="storage-list"></div>
    </div>

    <!-- 存储使用情况 -->
    <div class="storage-container">
        <h3>存储使用情况</h3>
        <div id="storage-info" class="storage-info"></div>
        <button onclick="checkStorageQuota()">检查存储配额</button>
    </div>

    <!-- 实际应用示例：用户偏好设置 -->
    <div class="storage-container">
        <h3>实际应用：用户偏好设置</h3>
        <div class="preferences-form">
            <label>
                主题：
                <select id="theme-select" onchange="savePreference('theme', this.value)">
                    <option value="light">浅色主题</option>
                    <option value="dark">深色主题</option>
                    <option value="auto">自动</option>
                </select>
            </label>

            <label>
                语言：
                <select id="language-select" onchange="savePreference('language', this.value)">
                    <option value="zh-CN">中文</option>
                    <option value="en-US">English</option>
                    <option value="ja-JP">日本語</option>
                </select>
            </label>

            <label>
                字体大小：
                <input
                    type="range"
                    id="font-size-range"
                    min="12"
                    max="24"
                    value="16"
                    onchange="savePreference('fontSize', this.value)"
                >
                <span id="font-size-display">16px</span>
            </label>

            <label>
                <input
                    type="checkbox"
                    id="notifications-checkbox"
                    onchange="savePreference('notifications', this.checked)"
                >
                启用通知
            </label>

            <button onclick="resetPreferences()">重置偏好</button>
        </div>
    </div>
</section>

<script>
// Web存储管理类
class WebStorageManager {
    constructor() {
        this.initStorageDisplay();
        this.loadUserPreferences();
        this.monitorStorageChanges();
    }

    // localStorage操作
    setLocalStorage() {
        const key = document.getElementById('local-key').value;
        const value = document.getElementById('local-value').value;

        if (!key) {
            this.showResult('local-result', '请输入键名', 'error');
            return;
        }

        try {
            localStorage.setItem(key, value);
            this.showResult('local-result', `已存储: ${key} = ${value}`, 'success');
            this.updateStorageList('local');
        } catch (error) {
            this.showResult('local-result', `存储失败: ${error.message}`, 'error');
        }
    }

    getLocalStorage() {
        const key = document.getElementById('local-key').value;

        if (!key) {
            this.showResult('local-result', '请输入键名', 'error');
            return;
        }

        const value = localStorage.getItem(key);
        if (value !== null) {
            this.showResult('local-result', `获取到: ${key} = ${value}`, 'success');
            document.getElementById('local-value').value = value;
        } else {
            this.showResult('local-result', `未找到键: ${key}`, 'warning');
        }
    }

    removeLocalStorage() {
        const key = document.getElementById('local-key').value;

        if (!key) {
            this.showResult('local-result', '请输入键名', 'error');
            return;
        }

        localStorage.removeItem(key);
        this.showResult('local-result', `已删除: ${key}`, 'success');
        this.updateStorageList('local');
    }

    clearLocalStorage() {
        localStorage.clear();
        this.showResult('local-result', '已清空localStorage', 'success');
        this.updateStorageList('local');
    }

    // sessionStorage操作
    setSessionStorage() {
        const key = document.getElementById('session-key').value;
        const value = document.getElementById('session-value').value;

        if (!key) {
            this.showResult('session-result', '请输入键名', 'error');
            return;
        }

        try {
            sessionStorage.setItem(key, value);
            this.showResult('session-result', `已存储: ${key} = ${value}`, 'success');
            this.updateStorageList('session');
        } catch (error) {
            this.showResult('session-result', `存储失败: ${error.message}`, 'error');
        }
    }

    getSessionStorage() {
        const key = document.getElementById('session-key').value;

        if (!key) {
            this.showResult('session-result', '请输入键名', 'error');
            return;
        }

        const value = sessionStorage.getItem(key);
        if (value !== null) {
            this.showResult('session-result', `获取到: ${key} = ${value}`, 'success');
            document.getElementById('session-value').value = value;
        } else {
            this.showResult('session-result', `未找到键: ${key}`, 'warning');
        }
    }

    removeSessionStorage() {
        const key = document.getElementById('session-key').value;

        if (!key) {
            this.showResult('session-result', '请输入键名', 'error');
            return;
        }

        sessionStorage.removeItem(key);
        this.showResult('session-result', `已删除: ${key}`, 'success');
        this.updateStorageList('session');
    }

    clearSessionStorage() {
        sessionStorage.clear();
        this.showResult('session-result', '已清空sessionStorage', 'success');
        this.updateStorageList('session');
    }

    // 显示结果
    showResult(elementId, message, type) {
        const element = document.getElementById(elementId);
        element.textContent = message;
        element.className = `result-display ${type}`;

        // 3秒后清除消息
        setTimeout(() => {
            element.textContent = '';
            element.className = 'result-display';
        }, 3000);
    }

    // 更新存储列表显示
    updateStorageList(storageType) {
        const storage = storageType === 'local' ? localStorage : sessionStorage;
        const listElement = document.getElementById(`${storageType}-list`);

        listElement.innerHTML = '';

        if (storage.length === 0) {
            listElement.innerHTML = '<p>暂无存储数据</p>';
            return;
        }

        const ul = document.createElement('ul');
        for (let i = 0; i < storage.length; i++) {
            const key = storage.key(i);
            const value = storage.getItem(key);

            const li = document.createElement('li');
            li.innerHTML = `
                <strong>${key}:</strong> ${value}
                <button onclick="storageManager.deleteStorageItem('${storageType}', '${key}')">删除</button>
            `;
            ul.appendChild(li);
        }

        listElement.appendChild(ul);
    }

    // 删除存储项
    deleteStorageItem(storageType, key) {
        const storage = storageType === 'local' ? localStorage : sessionStorage;
        storage.removeItem(key);
        this.updateStorageList(storageType);
    }

    // 初始化存储显示
    initStorageDisplay() {
        this.updateStorageList('local');
        this.updateStorageList('session');
        this.updateStorageInfo();
    }

    // 更新存储信息
    updateStorageInfo() {
        const info = document.getElementById('storage-info');

        let localSize = 0;
        let sessionSize = 0;

        // 计算localStorage大小
        for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                localSize += localStorage[key].length + key.length;
            }
        }

        // 计算sessionStorage大小
        for (let key in sessionStorage) {
            if (sessionStorage.hasOwnProperty(key)) {
                sessionSize += sessionStorage[key].length + key.length;
            }
        }

        info.innerHTML = `
            <p><strong>localStorage:</strong> ${localStorage.length} 项, 约 ${(localSize / 1024).toFixed(2)} KB</p>
            <p><strong>sessionStorage:</strong> ${sessionStorage.length} 项, 约 ${(sessionSize / 1024).toFixed(2)} KB</p>
        `;
    }

    // 检查存储配额
    async checkStorageQuota() {
        if ('storage' in navigator && 'estimate' in navigator.storage) {
            try {
                const estimate = await navigator.storage.estimate();
                const used = estimate.usage;
                const quota = estimate.quota;
                const usedMB = (used / 1024 / 1024).toFixed(2);
                const quotaMB = (quota / 1024 / 1024).toFixed(2);
                const usagePercent = ((used / quota) * 100).toFixed(2);

                alert(`存储配额信息：\n已使用: ${usedMB} MB\n总配额: ${quotaMB} MB\n使用率: ${usagePercent}%`);
            } catch (error) {
                alert('无法获取存储配额信息: ' + error.message);
            }
        } else {
            alert('浏览器不支持存储配额API');
        }
    }

    // 用户偏好设置
    savePreference(key, value) {
        const preferences = this.getPreferences();
        preferences[key] = value;
        localStorage.setItem('userPreferences', JSON.stringify(preferences));
        this.applyPreferences();

        // 更新字体大小显示
        if (key === 'fontSize') {
            document.getElementById('font-size-display').textContent = value + 'px';
        }
    }

    getPreferences() {
        const stored = localStorage.getItem('userPreferences');
        return stored ? JSON.parse(stored) : {};
    }

    loadUserPreferences() {
        const preferences = this.getPreferences();

        // 应用保存的偏好设置
        if (preferences.theme) {
            document.getElementById('theme-select').value = preferences.theme;
        }
        if (preferences.language) {
            document.getElementById('language-select').value = preferences.language;
        }
        if (preferences.fontSize) {
            document.getElementById('font-size-range').value = preferences.fontSize;
            document.getElementById('font-size-display').textContent = preferences.fontSize + 'px';
        }
        if (preferences.notifications !== undefined) {
            document.getElementById('notifications-checkbox').checked = preferences.notifications;
        }

        this.applyPreferences();
    }

    applyPreferences() {
        const preferences = this.getPreferences();

        // 应用主题
        if (preferences.theme) {
            document.body.setAttribute('data-theme', preferences.theme);
        }

        // 应用字体大小
        if (preferences.fontSize) {
            document.body.style.fontSize = preferences.fontSize + 'px';
        }

        // 其他偏好设置的应用...
    }

    resetPreferences() {
        localStorage.removeItem('userPreferences');

        // 重置表单
        document.getElementById('theme-select').value = 'light';
        document.getElementById('language-select').value = 'zh-CN';
        document.getElementById('font-size-range').value = '16';
        document.getElementById('font-size-display').textContent = '16px';
        document.getElementById('notifications-checkbox').checked = false;

        this.applyPreferences();
    }

    // 监听存储变化
    monitorStorageChanges() {
        window.addEventListener('storage', (e) => {
            console.log('存储发生变化:', e);
            this.updateStorageList('local');
            this.updateStorageInfo();
        });
    }
}

// 全局函数
let storageManager;

document.addEventListener('DOMContentLoaded', function() {
    storageManager = new WebStorageManager();
});

function setLocalStorage() { storageManager.setLocalStorage(); }
function getLocalStorage() { storageManager.getLocalStorage(); }
function removeLocalStorage() { storageManager.removeLocalStorage(); }
function clearLocalStorage() { storageManager.clearLocalStorage(); }

function setSessionStorage() { storageManager.setSessionStorage(); }
function getSessionStorage() { storageManager.getSessionStorage(); }
function removeSessionStorage() { storageManager.removeSessionStorage(); }
function clearSessionStorage() { storageManager.clearSessionStorage(); }

function checkStorageQuota() { storageManager.checkStorageQuota(); }
function savePreference(key, value) { storageManager.savePreference(key, value); }
function resetPreferences() { storageManager.resetPreferences(); }
</script>
```

## （二）地理定位API

**地理位置获取和监控：**
```html
<!-- HTML5地理定位API：获取用户位置信息 -->
<section class="geolocation-demo">
    <h2>地理定位API演示</h2>

    <div class="geolocation-container">
        <div class="location-controls">
            <button onclick="getCurrentPosition()">获取当前位置</button>
            <button onclick="watchPosition()">监控位置变化</button>
            <button onclick="stopWatching()">停止监控</button>
            <button onclick="clearLocationInfo()">清除信息</button>
        </div>

        <div id="location-status" class="status-display"></div>
        <div id="location-info" class="location-info"></div>
        <div id="location-map" class="location-map"></div>

        <!-- 位置历史记录 -->
        <div class="location-history">
            <h3>位置历史</h3>
            <div id="position-history"></div>
            <button onclick="clearPositionHistory()">清除历史</button>
        </div>
    </div>
</section>

<script>
// 地理定位管理类
class GeolocationManager {
    constructor() {
        this.watchId = null;
        this.positionHistory = [];
        this.checkGeolocationSupport();
    }

    // 检查地理定位支持
    checkGeolocationSupport() {
        if (!navigator.geolocation) {
            this.showStatus('您的浏览器不支持地理定位功能', 'error');
            return false;
        }
        return true;
    }

    // 获取当前位置
    getCurrentPosition() {
        if (!this.checkGeolocationSupport()) return;

        this.showStatus('正在获取位置信息...', 'loading');

        const options = {
            enableHighAccuracy: true,    // 启用高精度
            timeout: 10000,              // 超时时间10秒
            maximumAge: 60000            // 缓存时间1分钟
        };

        navigator.geolocation.getCurrentPosition(
            (position) => this.onPositionSuccess(position),
            (error) => this.onPositionError(error),
            options
        );
    }

    // 监控位置变化
    watchPosition() {
        if (!this.checkGeolocationSupport()) return;

        if (this.watchId !== null) {
            this.showStatus('已在监控位置变化', 'warning');
            return;
        }

        this.showStatus('开始监控位置变化...', 'loading');

        const options = {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 30000
        };

        this.watchId = navigator.geolocation.watchPosition(
            (position) => this.onPositionSuccess(position, true),
            (error) => this.onPositionError(error),
            options
        );
    }

    // 停止监控
    stopWatching() {
        if (this.watchId !== null) {
            navigator.geolocation.clearWatch(this.watchId);
            this.watchId = null;
            this.showStatus('已停止位置监控', 'success');
        } else {
            this.showStatus('当前未在监控位置', 'warning');
        }
    }

    // 位置获取成功
    onPositionSuccess(position, isWatching = false) {
        const coords = position.coords;
        const timestamp = new Date(position.timestamp);

        // 保存到历史记录
        this.positionHistory.push({
            latitude: coords.latitude,
            longitude: coords.longitude,
            accuracy: coords.accuracy,
            timestamp: timestamp,
            isWatching: isWatching
        });

        // 显示状态
        const statusText = isWatching ? '位置更新成功' : '位置获取成功';
        this.showStatus(statusText, 'success');

        // 显示位置信息
        this.displayLocationInfo(coords, timestamp);

        // 显示地图（简化版）
        this.displayMap(coords.latitude, coords.longitude);

        // 更新历史记录显示
        this.updatePositionHistory();

        // 获取地址信息（反向地理编码）
        this.reverseGeocode(coords.latitude, coords.longitude);
    }

    // 位置获取失败
    onPositionError(error) {
        let message = '';

        switch (error.code) {
            case error.PERMISSION_DENIED:
                message = '用户拒绝了地理定位请求';
                break;
            case error.POSITION_UNAVAILABLE:
                message = '位置信息不可用';
                break;
            case error.TIMEOUT:
                message = '获取位置信息超时';
                break;
            default:
                message = '获取位置信息时发生未知错误';
                break;
        }

        this.showStatus(`错误: ${message}`, 'error');
        console.error('地理定位错误:', error);
    }

    // 显示位置信息
    displayLocationInfo(coords, timestamp) {
        const infoElement = document.getElementById('location-info');

        infoElement.innerHTML = `
            <div class="location-details">
                <h4>位置详情</h4>
                <p><strong>纬度:</strong> ${coords.latitude.toFixed(6)}°</p>
                <p><strong>经度:</strong> ${coords.longitude.toFixed(6)}°</p>
                <p><strong>精度:</strong> ±${coords.accuracy.toFixed(0)} 米</p>
                ${coords.altitude !== null ? `<p><strong>海拔:</strong> ${coords.altitude.toFixed(0)} 米</p>` : ''}
                ${coords.altitudeAccuracy !== null ? `<p><strong>海拔精度:</strong> ±${coords.altitudeAccuracy.toFixed(0)} 米</p>` : ''}
                ${coords.heading !== null ? `<p><strong>方向:</strong> ${coords.heading.toFixed(0)}°</p>` : ''}
                ${coords.speed !== null ? `<p><strong>速度:</strong> ${coords.speed.toFixed(2)} 米/秒</p>` : ''}
                <p><strong>获取时间:</strong> ${timestamp.toLocaleString()}</p>
            </div>
        `;
    }

    // 显示简化地图
    displayMap(lat, lng) {
        const mapElement = document.getElementById('location-map');

        // 这里使用简化的地图显示，实际项目中可以集成Google Maps、百度地图等
        mapElement.innerHTML = `
            <div class="simple-map">
                <h4>位置地图</h4>
                <p>纬度: ${lat.toFixed(6)}, 经度: ${lng.toFixed(6)}</p>
                <div class="map-placeholder">
                    <div class="map-marker" title="您的位置">📍</div>
                    <p>地图占位符</p>
                    <small>实际项目中可集成真实地图服务</small>
                </div>
                <div class="map-links">
                    <a href="https://www.google.com/maps?q=${lat},${lng}" target="_blank">在Google地图中查看</a>
                    <a href="https://map.baidu.com/?l=13&tn=B_NORMAL_MAP&c=13565933,3550055&s=bt%26c%3D1%26wd%3D${lat},${lng}" target="_blank">在百度地图中查看</a>
                </div>
            </div>
        `;
    }

    // 反向地理编码（获取地址）
    async reverseGeocode(lat, lng) {
        try {
            // 这里使用免费的反向地理编码服务
            // 实际项目中建议使用专业的地图服务API
            const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=zh`);
            const data = await response.json();

            if (data && data.locality) {
                const addressElement = document.createElement('div');
                addressElement.className = 'address-info';
                addressElement.innerHTML = `
                    <h4>地址信息</h4>
                    <p><strong>国家:</strong> ${data.countryName || '未知'}</p>
                    <p><strong>省/州:</strong> ${data.principalSubdivision || '未知'}</p>
                    <p><strong>城市:</strong> ${data.locality || '未知'}</p>
                    <p><strong>详细地址:</strong> ${data.localityInfo?.administrative?.[0]?.name || '未知'}</p>
                `;

                document.getElementById('location-info').appendChild(addressElement);
            }
        } catch (error) {
            console.warn('反向地理编码失败:', error);
        }
    }

    // 更新位置历史显示
    updatePositionHistory() {
        const historyElement = document.getElementById('position-history');

        if (this.positionHistory.length === 0) {
            historyElement.innerHTML = '<p>暂无位置历史</p>';
            return;
        }

        const historyHtml = this.positionHistory
            .slice(-10) // 只显示最近10条
            .reverse()
            .map((pos, index) => `
                <div class="history-item">
                    <div class="history-header">
                        <span class="history-index">#${this.positionHistory.length - index}</span>
                        <span class="history-type">${pos.isWatching ? '监控' : '单次'}</span>
                        <span class="history-time">${pos.timestamp.toLocaleTimeString()}</span>
                    </div>
                    <div class="history-details">
                        <span>位置: ${pos.latitude.toFixed(4)}, ${pos.longitude.toFixed(4)}</span>
                        <span>精度: ±${pos.accuracy.toFixed(0)}m</span>
                    </div>
                </div>
            `)
            .join('');

        historyElement.innerHTML = historyHtml;
    }

    // 清除位置历史
    clearPositionHistory() {
        this.positionHistory = [];
        this.updatePositionHistory();
        this.showStatus('位置历史已清除', 'success');
    }

    // 显示状态
    showStatus(message, type) {
        const statusElement = document.getElementById('location-status');
        statusElement.textContent = message;
        statusElement.className = `status-display ${type}`;

        // 3秒后清除状态（除了loading状态）
        if (type !== 'loading') {
            setTimeout(() => {
                statusElement.textContent = '';
                statusElement.className = 'status-display';
            }, 3000);
        }
    }

    // 清除位置信息
    clearLocationInfo() {
        document.getElementById('location-info').innerHTML = '';
        document.getElementById('location-map').innerHTML = '';
        this.showStatus('位置信息已清除', 'success');
    }

    // 计算两点间距离（使用Haversine公式）
    calculateDistance(lat1, lng1, lat2, lng2) {
        const R = 6371; // 地球半径（公里）
        const dLat = this.toRadians(lat2 - lat1);
        const dLng = this.toRadians(lng2 - lng1);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                  Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
                  Math.sin(dLng / 2) * Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    toRadians(degrees) {
        return degrees * (Math.PI / 180);
    }
}

// 全局函数
let geolocationManager;

document.addEventListener('DOMContentLoaded', function() {
    geolocationManager = new GeolocationManager();
});

function getCurrentPosition() { geolocationManager.getCurrentPosition(); }
function watchPosition() { geolocationManager.watchPosition(); }
function stopWatching() { geolocationManager.stopWatching(); }
function clearLocationInfo() { geolocationManager.clearLocationInfo(); }
function clearPositionHistory() { geolocationManager.clearPositionHistory(); }
</script>
```

## （三）拖拽API

**HTML5拖拽功能：**
```html
<!-- HTML5拖拽API：实现拖拽交互功能 -->
<section class="drag-drop-demo">
    <h2>拖拽API演示</h2>

    <!-- 基础拖拽示例 -->
    <div class="drag-container">
        <h3>基础拖拽</h3>
        <div class="drag-source-area">
            <div class="draggable-item" draggable="true" data-value="item1">
                📦 可拖拽项目 1
            </div>
            <div class="draggable-item" draggable="true" data-value="item2">
                📋 可拖拽项目 2
            </div>
            <div class="draggable-item" draggable="true" data-value="item3">
                📄 可拖拽项目 3
            </div>
        </div>

        <div class="drop-zones">
            <div class="drop-zone" data-zone="zone1">
                <h4>放置区域 1</h4>
                <div class="drop-content"></div>
            </div>
            <div class="drop-zone" data-zone="zone2">
                <h4>放置区域 2</h4>
                <div class="drop-content"></div>
            </div>
        </div>
    </div>

    <!-- 文件拖拽上传 -->
    <div class="file-drop-container">
        <h3>文件拖拽上传</h3>
        <div id="file-drop-zone" class="file-drop-zone">
            <div class="drop-message">
                <p>📁 将文件拖拽到此处上传</p>
                <p>或点击选择文件</p>
                <input type="file" id="file-input" multiple style="display: none;">
                <button onclick="document.getElementById('file-input').click()">选择文件</button>
            </div>
            <div id="file-preview" class="file-preview"></div>
        </div>

        <div class="upload-progress">
            <div id="upload-status"></div>
            <progress id="file-upload-progress" value="0" max="100" style="display: none;"></progress>
        </div>
    </div>

    <!-- 排序列表 -->
    <div class="sortable-container">
        <h3>可排序列表</h3>
        <ul id="sortable-list" class="sortable-list">
            <li draggable="true" data-id="1">📌 任务项目 1</li>
            <li draggable="true" data-id="2">📌 任务项目 2</li>
            <li draggable="true" data-id="3">📌 任务项目 3</li>
            <li draggable="true" data-id="4">📌 任务项目 4</li>
            <li draggable="true" data-id="5">📌 任务项目 5</li>
        </ul>
        <button onclick="resetSortableList()">重置列表</button>
    </div>
</section>

<script>
// 拖拽功能管理类
class DragDropManager {
    constructor() {
        this.draggedElement = null;
        this.draggedData = null;
        this.initBasicDragDrop();
        this.initFileDragDrop();
        this.initSortableList();
    }

    // 初始化基础拖拽功能
    initBasicDragDrop() {
        // 拖拽源元素事件
        const draggableItems = document.querySelectorAll('.draggable-item');
        draggableItems.forEach(item => {
            item.addEventListener('dragstart', (e) => {
                this.draggedElement = e.target;
                this.draggedData = e.target.dataset.value;

                // 设置拖拽数据
                e.dataTransfer.setData('text/plain', this.draggedData);
                e.dataTransfer.effectAllowed = 'move';

                // 添加拖拽样式
                e.target.classList.add('dragging');

                console.log('开始拖拽:', this.draggedData);
            });

            item.addEventListener('dragend', (e) => {
                // 移除拖拽样式
                e.target.classList.remove('dragging');
                this.draggedElement = null;
                this.draggedData = null;

                console.log('拖拽结束');
            });
        });

        // 放置区域事件
        const dropZones = document.querySelectorAll('.drop-zone');
        dropZones.forEach(zone => {
            zone.addEventListener('dragover', (e) => {
                e.preventDefault(); // 允许放置
                e.dataTransfer.dropEffect = 'move';
                zone.classList.add('drag-over');
            });

            zone.addEventListener('dragleave', (e) => {
                // 检查是否真的离开了放置区域
                if (!zone.contains(e.relatedTarget)) {
                    zone.classList.remove('drag-over');
                }
            });

            zone.addEventListener('drop', (e) => {
                e.preventDefault();
                zone.classList.remove('drag-over');

                const data = e.dataTransfer.getData('text/plain');
                const dropContent = zone.querySelector('.drop-content');

                if (data && this.draggedElement) {
                    // 创建放置的元素副本
                    const droppedItem = this.draggedElement.cloneNode(true);
                    droppedItem.classList.remove('dragging');
                    droppedItem.classList.add('dropped-item');

                    // 添加删除按钮
                    const removeBtn = document.createElement('button');
                    removeBtn.textContent = '×';
                    removeBtn.className = 'remove-btn';
                    removeBtn.onclick = () => droppedItem.remove();
                    droppedItem.appendChild(removeBtn);

                    dropContent.appendChild(droppedItem);

                    console.log(`项目 ${data} 被放置到 ${zone.dataset.zone}`);
                }
            });
        });
    }

    // 初始化文件拖拽上传
    initFileDragDrop() {
        const fileDropZone = document.getElementById('file-drop-zone');
        const fileInput = document.getElementById('file-input');

        // 文件输入变化事件
        fileInput.addEventListener('change', (e) => {
            this.handleFiles(e.target.files);
        });

        // 拖拽事件
        fileDropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'copy';
            fileDropZone.classList.add('drag-over');
        });

        fileDropZone.addEventListener('dragleave', (e) => {
            if (!fileDropZone.contains(e.relatedTarget)) {
                fileDropZone.classList.remove('drag-over');
            }
        });

        fileDropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            fileDropZone.classList.remove('drag-over');

            const files = e.dataTransfer.files;
            this.handleFiles(files);
        });

        // 防止页面默认的拖拽行为
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            document.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
            });
        });
    }

    // 处理文件
    handleFiles(files) {
        const filePreview = document.getElementById('file-preview');
        const uploadStatus = document.getElementById('upload-status');

        if (files.length === 0) return;

        filePreview.innerHTML = '';
        uploadStatus.innerHTML = '';

        Array.from(files).forEach((file, index) => {
            // 创建文件预览项
            const fileItem = document.createElement('div');
            fileItem.className = 'file-item';

            // 文件信息
            const fileInfo = document.createElement('div');
            fileInfo.className = 'file-info';
            fileInfo.innerHTML = `
                <div class="file-name">${file.name}</div>
                <div class="file-details">
                    大小: ${this.formatFileSize(file.size)} |
                    类型: ${file.type || '未知'} |
                    修改时间: ${new Date(file.lastModified).toLocaleString()}
                </div>
            `;

            // 文件预览
            const filePreviewElement = document.createElement('div');
            filePreviewElement.className = 'file-preview-content';

            if (file.type.startsWith('image/')) {
                // 图片预览
                const img = document.createElement('img');
                img.style.maxWidth = '200px';
                img.style.maxHeight = '200px';

                const reader = new FileReader();
                reader.onload = (e) => {
                    img.src = e.target.result;
                };
                reader.readAsDataURL(file);

                filePreviewElement.appendChild(img);
            } else if (file.type.startsWith('text/')) {
                // 文本文件预览
                const reader = new FileReader();
                reader.onload = (e) => {
                    const pre = document.createElement('pre');
                    pre.textContent = e.target.result.substring(0, 500) +
                                     (e.target.result.length > 500 ? '...' : '');
                    pre.style.maxHeight = '200px';
                    pre.style.overflow = 'auto';
                    filePreviewElement.appendChild(pre);
                };
                reader.readAsText(file);
            } else {
                // 其他文件类型
                filePreviewElement.innerHTML = `
                    <div class="file-icon">📄</div>
                    <div>无法预览此文件类型</div>
                `;
            }

            fileItem.appendChild(fileInfo);
            fileItem.appendChild(filePreviewElement);
            filePreview.appendChild(fileItem);
        });

        // 模拟文件上传
        this.simulateFileUpload(files);
    }

    // 模拟文件上传
    async simulateFileUpload(files) {
        const uploadStatus = document.getElementById('upload-status');
        const progressBar = document.getElementById('file-upload-progress');

        uploadStatus.innerHTML = `正在上传 ${files.length} 个文件...`;
        progressBar.style.display = 'block';
        progressBar.value = 0;

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            uploadStatus.innerHTML = `正在上传: ${file.name} (${i + 1}/${files.length})`;

            // 模拟上传进度
            for (let progress = 0; progress <= 100; progress += 10) {
                progressBar.value = progress;
                await new Promise(resolve => setTimeout(resolve, 100));
            }
        }

        uploadStatus.innerHTML = `✅ 成功上传 ${files.length} 个文件`;
        progressBar.style.display = 'none';

        setTimeout(() => {
            uploadStatus.innerHTML = '';
        }, 3000);
    }

    // 初始化可排序列表
    initSortableList() {
        const sortableList = document.getElementById('sortable-list');
        let draggedItem = null;

        sortableList.addEventListener('dragstart', (e) => {
            draggedItem = e.target;
            e.target.classList.add('dragging');
            e.dataTransfer.effectAllowed = 'move';
        });

        sortableList.addEventListener('dragend', (e) => {
            e.target.classList.remove('dragging');
            draggedItem = null;
        });

        sortableList.addEventListener('dragover', (e) => {
            e.preventDefault();
            const afterElement = this.getDragAfterElement(sortableList, e.clientY);

            if (afterElement == null) {
                sortableList.appendChild(draggedItem);
            } else {
                sortableList.insertBefore(draggedItem, afterElement);
            }
        });
    }

    // 获取拖拽后的插入位置
    getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('li:not(.dragging)')];

        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;

            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }

    // 格式化文件大小
    formatFileSize(bytes) {
        if (bytes === 0) return '0 B';

        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // 重置排序列表
    resetSortableList() {
        const sortableList = document.getElementById('sortable-list');
        const items = Array.from(sortableList.children);

        // 按data-id排序
        items.sort((a, b) => {
            return parseInt(a.dataset.id) - parseInt(b.dataset.id);
        });

        // 重新排列
        items.forEach(item => {
            sortableList.appendChild(item);
        });
    }
}

// 全局函数
let dragDropManager;

document.addEventListener('DOMContentLoaded', function() {
    dragDropManager = new DragDropManager();
});

function resetSortableList() {
    dragDropManager.resetSortableList();
}
</script>
```

# 四、HTML5最佳实践与性能优化

## （一）语义化和可访问性

**语义化HTML最佳实践：**
```html
<!-- 语义化HTML：提供更好的结构和可访问性 -->
<article class="blog-post" itemscope itemtype="http://schema.org/BlogPosting">
    <!-- 结构化数据：帮助搜索引擎理解内容 -->
    <header class="post-header">
        <h1 itemprop="headline">HTML5最佳实践指南</h1>
        <div class="post-meta">
            <time itemprop="datePublished" datetime="2025-01-29T10:00:00Z">
                2025年1月29日
            </time>
            <address class="author" itemprop="author" itemscope itemtype="http://schema.org/Person">
                作者：<span itemprop="name">张三</span>
            </address>
            <div class="post-tags">
                <span itemprop="keywords">HTML5, Web开发, 前端技术</span>
            </div>
        </div>
    </header>

    <!-- 文章内容 -->
    <div class="post-content" itemprop="articleBody">
        <section>
            <h2>可访问性增强</h2>

            <!-- 正确的表单标签关联 -->
            <form class="accessible-form">
                <fieldset>
                    <legend>用户信息</legend>

                    <div class="form-group">
                        <label for="user-name">姓名（必填）：</label>
                        <input
                            type="text"
                            id="user-name"
                            name="userName"
                            required
                            aria-describedby="name-help"
                            aria-invalid="false"
                        >
                        <div id="name-help" class="help-text">
                            请输入您的真实姓名
                        </div>
                    </div>

                    <div class="form-group">
                        <label for="user-email">邮箱：</label>
                        <input
                            type="email"
                            id="user-email"
                            name="userEmail"
                            aria-describedby="email-help"
                        >
                        <div id="email-help" class="help-text">
                            用于接收重要通知
                        </div>
                    </div>
                </fieldset>

                <!-- 按钮组：明确的操作意图 -->
                <div class="form-actions" role="group" aria-label="表单操作">
                    <button type="submit" class="primary-btn">
                        <span aria-hidden="true">✓</span>
                        提交表单
                    </button>
                    <button type="reset" class="secondary-btn">
                        <span aria-hidden="true">↺</span>
                        重置表单
                    </button>
                </div>
            </form>

            <!-- 导航菜单：正确的ARIA标签 -->
            <nav aria-label="主导航" class="main-navigation">
                <ul role="menubar">
                    <li role="none">
                        <a href="#home" role="menuitem" aria-current="page">首页</a>
                    </li>
                    <li role="none">
                        <a href="#about" role="menuitem">关于我们</a>
                    </li>
                    <li role="none">
                        <button
                            role="menuitem"
                            aria-haspopup="true"
                            aria-expanded="false"
                            onclick="toggleSubmenu(this)"
                        >
                            产品服务
                        </button>
                        <ul role="menu" class="submenu" hidden>
                            <li role="none">
                                <a href="#web-dev" role="menuitem">网站开发</a>
                            </li>
                            <li role="none">
                                <a href="#app-dev" role="menuitem">应用开发</a>
                            </li>
                        </ul>
                    </li>
                </ul>
            </nav>

            <!-- 数据表格：完整的表格结构 -->
            <table class="data-table" role="table" aria-label="用户统计数据">
                <caption>2025年第一季度用户增长统计</caption>
                <thead>
                    <tr role="row">
                        <th scope="col" role="columnheader">月份</th>
                        <th scope="col" role="columnheader">新增用户</th>
                        <th scope="col" role="columnheader">活跃用户</th>
                        <th scope="col" role="columnheader">增长率</th>
                    </tr>
                </thead>
                <tbody>
                    <tr role="row">
                        <th scope="row" role="rowheader">1月</th>
                        <td role="cell">1,250</td>
                        <td role="cell">8,900</td>
                        <td role="cell">+15.2%</td>
                    </tr>
                    <tr role="row">
                        <th scope="row" role="rowheader">2月</th>
                        <td role="cell">1,480</td>
                        <td role="cell">9,650</td>
                        <td role="cell">+18.4%</td>
                    </tr>
                </tbody>
            </table>

            <!-- 模态对话框：正确的焦点管理 -->
            <div
                id="modal-dialog"
                class="modal"
                role="dialog"
                aria-labelledby="modal-title"
                aria-describedby="modal-description"
                aria-hidden="true"
            >
                <div class="modal-content">
                    <header class="modal-header">
                        <h2 id="modal-title">确认操作</h2>
                        <button
                            class="modal-close"
                            aria-label="关闭对话框"
                            onclick="closeModal()"
                        >
                            ×
                        </button>
                    </header>
                    <div class="modal-body">
                        <p id="modal-description">
                            您确定要执行此操作吗？此操作不可撤销。
                        </p>
                    </div>
                    <footer class="modal-footer">
                        <button class="btn-danger" onclick="confirmAction()">
                            确认
                        </button>
                        <button class="btn-cancel" onclick="closeModal()">
                            取消
                        </button>
                    </footer>
                </div>
            </div>
        </section>
    </div>
</article>

<script>
// 可访问性增强功能
class AccessibilityManager {
    constructor() {
        this.initKeyboardNavigation();
        this.initFocusManagement();
        this.initScreenReaderSupport();
    }

    // 键盘导航支持
    initKeyboardNavigation() {
        // ESC键关闭模态框
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
            }
        });

        // Tab键焦点管理
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                this.handleTabNavigation(e);
            }
        });

        // 方向键导航菜单
        const menuItems = document.querySelectorAll('[role="menuitem"]');
        menuItems.forEach((item, index) => {
            item.addEventListener('keydown', (e) => {
                switch (e.key) {
                    case 'ArrowDown':
                        e.preventDefault();
                        this.focusNextMenuItem(menuItems, index);
                        break;
                    case 'ArrowUp':
                        e.preventDefault();
                        this.focusPrevMenuItem(menuItems, index);
                        break;
                    case 'Enter':
                    case ' ':
                        e.preventDefault();
                        item.click();
                        break;
                }
            });
        });
    }

    // 焦点管理
    initFocusManagement() {
        // 记录模态框打开前的焦点元素
        this.lastFocusedElement = null;

        // 表单验证时的焦点管理
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            form.addEventListener('submit', (e) => {
                const firstInvalidField = form.querySelector(':invalid');
                if (firstInvalidField) {
                    e.preventDefault();
                    firstInvalidField.focus();
                    this.announceToScreenReader(`请检查${firstInvalidField.labels[0]?.textContent || '输入字段'}`);
                }
            });
        });
    }

    // 屏幕阅读器支持
    initScreenReaderSupport() {
        // 创建屏幕阅读器公告区域
        this.createAriaLiveRegion();

        // 动态内容更新通知
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    // 通知屏幕阅读器内容已更新
                    this.announceToScreenReader('页面内容已更新');
                }
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    // 创建ARIA Live区域
    createAriaLiveRegion() {
        const liveRegion = document.createElement('div');
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.setAttribute('aria-atomic', 'true');
        liveRegion.className = 'sr-only';
        liveRegion.id = 'aria-live-region';
        document.body.appendChild(liveRegion);
    }

    // 向屏幕阅读器公告消息
    announceToScreenReader(message) {
        const liveRegion = document.getElementById('aria-live-region');
        if (liveRegion) {
            liveRegion.textContent = message;

            // 清除消息，避免重复公告
            setTimeout(() => {
                liveRegion.textContent = '';
            }, 1000);
        }
    }

    // 菜单导航
    focusNextMenuItem(menuItems, currentIndex) {
        const nextIndex = (currentIndex + 1) % menuItems.length;
        menuItems[nextIndex].focus();
    }

    focusPrevMenuItem(menuItems, currentIndex) {
        const prevIndex = currentIndex === 0 ? menuItems.length - 1 : currentIndex - 1;
        menuItems[prevIndex].focus();
    }

    // Tab键导航处理
    handleTabNavigation(e) {
        const modal = document.querySelector('.modal[aria-hidden="false"]');
        if (modal) {
            // 在模态框内循环Tab导航
            const focusableElements = modal.querySelectorAll(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );

            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];

            if (e.shiftKey) {
                if (document.activeElement === firstElement) {
                    e.preventDefault();
                    lastElement.focus();
                }
            } else {
                if (document.activeElement === lastElement) {
                    e.preventDefault();
                    firstElement.focus();
                }
            }
        }
    }

    // 模态框管理
    openModal() {
        const modal = document.getElementById('modal-dialog');
        this.lastFocusedElement = document.activeElement;

        modal.setAttribute('aria-hidden', 'false');
        modal.style.display = 'block';

        // 焦点移到模态框的第一个可聚焦元素
        const firstFocusable = modal.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (firstFocusable) {
            firstFocusable.focus();
        }

        this.announceToScreenReader('对话框已打开');
    }

    closeModal() {
        const modal = document.getElementById('modal-dialog');
        modal.setAttribute('aria-hidden', 'true');
        modal.style.display = 'none';

        // 恢复焦点到打开模态框前的元素
        if (this.lastFocusedElement) {
            this.lastFocusedElement.focus();
        }

        this.announceToScreenReader('对话框已关闭');
    }
}

// 全局函数
let accessibilityManager;

document.addEventListener('DOMContentLoaded', function() {
    accessibilityManager = new AccessibilityManager();
});

function toggleSubmenu(button) {
    const submenu = button.nextElementSibling;
    const isExpanded = button.getAttribute('aria-expanded') === 'true';

    button.setAttribute('aria-expanded', !isExpanded);
    submenu.hidden = isExpanded;
}

function openModal() {
    accessibilityManager.openModal();
}

function closeModal() {
    accessibilityManager.closeModal();
}

function confirmAction() {
    alert('操作已确认');
    closeModal();
}
</script>
```

## （二）性能优化策略

**HTML5性能优化最佳实践：**
```html
<!-- 性能优化：资源加载和渲染优化 -->
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <!-- DNS预解析：提前解析域名 -->
    <link rel="dns-prefetch" href="//cdn.example.com">
    <link rel="dns-prefetch" href="//api.example.com">

    <!-- 预连接：建立早期连接 -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>

    <!-- 关键资源预加载 -->
    <link rel="preload" href="/fonts/main-font.woff2" as="font" type="font/woff2" crossorigin>
    <link rel="preload" href="/css/critical.css" as="style">
    <link rel="preload" href="/js/critical.js" as="script">

    <!-- 关键CSS内联：减少渲染阻塞 -->
    <style>
        /* 关键路径CSS：首屏渲染必需的样式 */
        body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
        .header { background: #333; color: white; padding: 1rem; }
        .loading { display: flex; justify-content: center; align-items: center; height: 100vh; }
        .sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); border: 0; }
    </style>

    <!-- 非关键CSS异步加载 -->
    <link rel="preload" href="/css/main.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
    <noscript><link rel="stylesheet" href="/css/main.css"></noscript>

    <title>HTML5性能优化示例</title>
</head>
<body>
    <!-- 加载指示器 -->
    <div id="loading-indicator" class="loading" aria-label="页面加载中">
        <div>加载中...</div>
    </div>

    <!-- 主要内容 -->
    <main id="main-content" style="display: none;">
        <header class="header">
            <h1>HTML5性能优化</h1>
        </header>

        <!-- 图片懒加载和优化 -->
        <section class="image-optimization">
            <h2>图片优化示例</h2>

            <!-- 响应式图片：根据设备选择合适尺寸 -->
            <picture>
                <source
                    media="(min-width: 800px)"
                    srcset="/images/hero-large.webp 1200w, /images/hero-large.jpg 1200w"
                    type="image/webp"
                >
                <source
                    media="(min-width: 400px)"
                    srcset="/images/hero-medium.webp 800w, /images/hero-medium.jpg 800w"
                    type="image/webp"
                >
                <img
                    src="/images/hero-small.jpg"
                    srcset="/images/hero-small.webp 400w, /images/hero-small.jpg 400w"
                    alt="英雄图片"
                    loading="lazy"
                    decoding="async"
                    width="400"
                    height="300"
                >
            </picture>

            <!-- 懒加载图片列表 -->
            <div class="image-gallery">
                <img
                    data-src="/images/gallery-1.jpg"
                    alt="图片1"
                    loading="lazy"
                    class="lazy-image"
                    width="300"
                    height="200"
                >
                <img
                    data-src="/images/gallery-2.jpg"
                    alt="图片2"
                    loading="lazy"
                    class="lazy-image"
                    width="300"
                    height="200"
                >
            </div>
        </section>

        <!-- 代码分割和动态导入 -->
        <section class="dynamic-content">
            <h2>动态内容加载</h2>
            <button onclick="loadDynamicContent()">加载动态内容</button>
            <div id="dynamic-content-container"></div>
        </section>

        <!-- Web Workers示例 -->
        <section class="web-workers">
            <h2>Web Workers性能优化</h2>
            <button onclick="startHeavyComputation()">开始重计算</button>
            <div id="computation-result"></div>
            <progress id="computation-progress" value="0" max="100"></progress>
        </section>
    </main>

    <!-- 关键JavaScript内联 -->
    <script>
        // 关键路径JavaScript：页面初始化必需的代码
        (function() {
            // 性能监控
            const perfObserver = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    console.log('性能指标:', entry.name, entry.value);
                }
            });

            // 监控关键性能指标
            if ('observe' in perfObserver) {
                perfObserver.observe({ entryTypes: ['measure', 'navigation', 'paint'] });
            }

            // 页面加载完成处理
            function onPageLoad() {
                document.getElementById('loading-indicator').style.display = 'none';
                document.getElementById('main-content').style.display = 'block';

                // 记录首次内容绘制时间
                const paintEntries = performance.getEntriesByType('paint');
                paintEntries.forEach(entry => {
                    console.log(`${entry.name}: ${entry.startTime}ms`);
                });
            }

            // 使用requestIdleCallback优化非关键任务
            function scheduleNonCriticalTasks() {
                if ('requestIdleCallback' in window) {
                    requestIdleCallback(() => {
                        // 非关键任务：统计、分析等
                        console.log('执行非关键任务');
                        initAnalytics();
                        preloadNextPageResources();
                    });
                } else {
                    // 降级处理
                    setTimeout(() => {
                        initAnalytics();
                        preloadNextPageResources();
                    }, 100);
                }
            }

            // 页面加载事件
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', onPageLoad);
            } else {
                onPageLoad();
            }

            // 调度非关键任务
            window.addEventListener('load', scheduleNonCriticalTasks);

            // 图片懒加载实现
            function initLazyLoading() {
                const lazyImages = document.querySelectorAll('.lazy-image');

                if ('IntersectionObserver' in window) {
                    const imageObserver = new IntersectionObserver((entries) => {
                        entries.forEach(entry => {
                            if (entry.isIntersecting) {
                                const img = entry.target;
                                img.src = img.dataset.src;
                                img.classList.remove('lazy-image');
                                imageObserver.unobserve(img);
                            }
                        });
                    });

                    lazyImages.forEach(img => imageObserver.observe(img));
                } else {
                    // 降级处理：直接加载所有图片
                    lazyImages.forEach(img => {
                        img.src = img.dataset.src;
                    });
                }
            }

            // 初始化懒加载
            initLazyLoading();

            // 全局函数定义
            window.loadDynamicContent = async function() {
                try {
                    // 动态导入模块
                    const { DynamicComponent } = await import('./js/dynamic-component.js');
                    const container = document.getElementById('dynamic-content-container');

                    const component = new DynamicComponent();
                    container.appendChild(component.render());
                } catch (error) {
                    console.error('动态内容加载失败:', error);
                }
            };

            window.startHeavyComputation = function() {
                if ('Worker' in window) {
                    const worker = new Worker('./js/computation-worker.js');
                    const progressBar = document.getElementById('computation-progress');
                    const resultDiv = document.getElementById('computation-result');

                    worker.postMessage({ command: 'start', data: 1000000 });

                    worker.onmessage = function(e) {
                        const { type, progress, result } = e.data;

                        if (type === 'progress') {
                            progressBar.value = progress;
                        } else if (type === 'complete') {
                            resultDiv.textContent = `计算完成，结果：${result}`;
                            worker.terminate();
                        }
                    };
                } else {
                    alert('您的浏览器不支持Web Workers');
                }
            };

            // 分析和统计初始化
            function initAnalytics() {
                // 模拟分析代码初始化
                console.log('分析工具已初始化');
            }

            // 预加载下一页资源
            function preloadNextPageResources() {
                const nextPageLink = document.querySelector('link[rel="next"]');
                if (nextPageLink) {
                    const link = document.createElement('link');
                    link.rel = 'prefetch';
                    link.href = nextPageLink.href;
                    document.head.appendChild(link);
                }
            }

            // 错误监控
            window.addEventListener('error', (e) => {
                console.error('JavaScript错误:', e.error);
                // 发送错误报告到监控服务
            });

            // 未处理的Promise拒绝
            window.addEventListener('unhandledrejection', (e) => {
                console.error('未处理的Promise拒绝:', e.reason);
                // 发送错误报告到监控服务
            });
        })();
    </script>

    <!-- 非关键JavaScript异步加载 -->
    <script async src="/js/analytics.js"></script>
    <script defer src="/js/main.js"></script>
</body>
</html>
```

```javascript
// js/computation-worker.js - Web Worker示例
self.onmessage = function(e) {
    const { command, data } = e.data;

    if (command === 'start') {
        // 执行重计算任务
        let result = 0;
        const total = data;

        for (let i = 0; i < total; i++) {
            result += Math.sqrt(i);

            // 定期报告进度
            if (i % 10000 === 0) {
                const progress = (i / total) * 100;
                self.postMessage({
                    type: 'progress',
                    progress: progress
                });
            }
        }

        // 发送完成结果
        self.postMessage({
            type: 'complete',
            result: result.toFixed(2)
        });
    }
};
```

```javascript
// js/dynamic-component.js - 动态组件示例
export class DynamicComponent {
    constructor() {
        this.data = [];
    }

    async loadData() {
        // 模拟数据加载
        return new Promise(resolve => {
            setTimeout(() => {
                resolve([
                    { id: 1, name: '动态内容1' },
                    { id: 2, name: '动态内容2' },
                    { id: 3, name: '动态内容3' }
                ]);
            }, 1000);
        });
    }

    render() {
        const container = document.createElement('div');
        container.className = 'dynamic-component';
        container.innerHTML = '<p>正在加载动态内容...</p>';

        this.loadData().then(data => {
            this.data = data;
            container.innerHTML = `
                <h3>动态加载的内容</h3>
                <ul>
                    ${data.map(item => `<li>${item.name}</li>`).join('')}
                </ul>
            `;
        });

        return container;
    }
}
```

# 五、总结与展望

## （一）HTML5技术总结

通过本文的详细介绍，我们全面了解了HTML5的核心特性和实践应用：

**技术特性总结：**
```
HTML5核心价值：

语义化增强：
├── 结构化标签：header、nav、main、section、article、aside、footer
├── 表单增强：新的input类型、验证属性、表单控件
├── 多媒体支持：video、audio原生播放，无需插件
└── 可访问性：ARIA标签、语义化结构提升用户体验

API功能扩展：
├── 存储技术：localStorage、sessionStorage本地数据存储
├── 地理定位：Geolocation API获取用户位置信息
├── 拖拽交互：Drag and Drop API实现拖拽功能
├── Canvas绘图：2D图形绘制和动画制作
├── Web Workers：多线程处理提升性能
└── WebSocket：实时双向通信支持

性能优化：
├── 资源预加载：dns-prefetch、preload、prefetch
├── 图片优化：响应式图片、懒加载、现代格式
├── 代码分割：动态导入、按需加载
├── 缓存策略：Application Cache、Service Worker
└── 性能监控：Performance API、关键指标测量
```

**开发最佳实践：**
1. **语义化优先**：使用正确的HTML标签表达内容含义
2. **渐进增强**：从基础功能开始，逐步添加高级特性
3. **可访问性**：确保所有用户都能访问和使用网站
4. **性能优化**：关注加载速度和运行时性能
5. **跨浏览器兼容**：提供降级方案和polyfill支持

## （二）发展趋势和展望

**HTML5技术发展方向：**
1. **Web组件化**：Custom Elements、Shadow DOM标准化
2. **PWA技术**：Service Worker、Web App Manifest普及
3. **WebAssembly**：高性能Web应用开发
4. **Web API扩展**：更多设备API和系统集成能力
5. **性能优化**：Core Web Vitals、用户体验指标

**实际应用建议：**
- **选择HTML5**：现代Web开发的标准选择
- **渐进式采用**：根据项目需求逐步引入新特性
- **性能优先**：始终关注用户体验和页面性能
- **可访问性**：确保网站对所有用户友好
- **持续学习**：跟上Web标准的发展和更新

HTML5作为现代Web开发的基础，为开发者提供了丰富的功能和强大的能力。随着Web技术的不断发展，HTML5将继续演进，为构建更好的Web应用提供支持。掌握HTML5的核心概念和最佳实践，是每个前端开发者必备的技能。

# 参考资料

- [HTML5规范](https://html.spec.whatwg.org/) - WHATWG官方规范
- [MDN Web文档](https://developer.mozilla.org/zh-CN/docs/Web/HTML) - Mozilla开发者网络
- [Can I Use](https://caniuse.com/) - 浏览器兼容性查询
- [Web.dev](https://web.dev/) - Google Web开发最佳实践
- [W3C HTML5标准](https://www.w3.org/TR/html52/) - W3C官方标准
- [HTML5 Boilerplate](https://html5boilerplate.com/) - 前端模板项目
- [Lighthouse](https://developers.google.com/web/tools/lighthouse) - Web性能审计工具
- [WebAIM](https://webaim.org/) - Web可访问性资源
