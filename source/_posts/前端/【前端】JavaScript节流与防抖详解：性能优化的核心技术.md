---
title: 【前端】JavaScript节流与防抖详解：性能优化的核心技术
categories: 前端
date: 2025-08-06
tags:
  - JavaScript
  - 节流
  - 防抖
  - 性能优化
  - throttle
  - debounce
  - 前端优化
---

# 前言

在前端开发中，我们经常遇到需要处理高频事件的场景，比如用户快速点击按钮、滚动页面、调整窗口大小、输入搜索关键词等。如果不加以控制，这些高频事件会导致函数被频繁调用，造成性能问题，甚至可能导致页面卡顿或浏览器崩溃。

节流（Throttle）和防抖（Debounce）是两种重要的性能优化技术，它们通过控制函数的执行频率来解决高频事件带来的性能问题。虽然这两种技术都能限制函数的执行次数，但它们的实现原理和适用场景有所不同。

本文将详细介绍节流和防抖的概念、实现原理、使用场景，并提供完整的代码示例和最佳实践。

# 一、防抖（Debounce）详解

## （一）什么是防抖

防抖是指在事件被触发n秒后再执行回调函数，如果在这n秒内又被触发，则重新计时。简单来说，防抖就是"等你不触发了，我再执行"。

**生活中的比喻：** 就像电梯等人一样，如果有人进电梯，电梯会等待几秒钟，如果在等待期间又有人进来，就重新开始等待，直到没有人进来了才关门启动。

## （二）防抖的实现原理

防抖的核心思想是使用定时器延迟执行函数，如果在延迟期间再次触发事件，就清除之前的定时器并重新设置。

### 基础版防抖实现

```javascript
/**
 * 防抖函数 - 基础版
 * @param {Function} func 需要防抖的函数
 * @param {number} delay 延迟时间（毫秒）
 * @returns {Function} 防抖后的函数
 */
function debounce(func, delay) {
    let timeoutId; // 存储定时器ID
    
    return function(...args) {
        // 清除之前的定时器
        clearTimeout(timeoutId);
        
        // 设置新的定时器
        timeoutId = setTimeout(() => {
            func.apply(this, args); // 保持this指向和参数传递
        }, delay);
    };
}

// 使用示例
const searchInput = document.getElementById('search');
const handleSearch = debounce(function(event) {
    console.log('执行搜索:', event.target.value);
    // 这里可以发送AJAX请求
}, 500);

searchInput.addEventListener('input', handleSearch);
```

### 增强版防抖实现

```javascript
/**
 * 防抖函数 - 增强版
 * @param {Function} func 需要防抖的函数
 * @param {number} delay 延迟时间（毫秒）
 * @param {Object} options 配置选项
 * @param {boolean} options.immediate 是否立即执行（第一次触发时）
 * @param {number} options.maxWait 最大等待时间，超过此时间强制执行
 * @returns {Function} 防抖后的函数
 */
function debounce(func, delay, options = {}) {
    let timeoutId;
    let lastCallTime;
    let lastInvokeTime = 0;
    
    const { immediate = false, maxWait } = options;
    
    function invokeFunc(time) {
        const args = lastArgs;
        const thisArg = lastThis;
        
        lastArgs = lastThis = undefined;
        lastInvokeTime = time;
        return func.apply(thisArg, args);
    }
    
    function shouldInvoke(time) {
        const timeSinceLastCall = time - lastCallTime;
        const timeSinceLastInvoke = time - lastInvokeTime;
        
        // 首次调用或者超过延迟时间或者超过最大等待时间
        return (lastCallTime === undefined || 
                timeSinceLastCall >= delay || 
                (maxWait && timeSinceLastInvoke >= maxWait));
    }
    
    let lastArgs, lastThis;
    
    function debounced(...args) {
        const time = Date.now();
        const isInvoking = shouldInvoke(time);
        
        lastArgs = args;
        lastThis = this;
        lastCallTime = time;
        
        if (isInvoking) {
            if (timeoutId === undefined) {
                // 立即执行模式
                if (immediate) {
                    return invokeFunc(time);
                }
            }
            
            if (maxWait) {
                // 有最大等待时间的情况
                timeoutId = setTimeout(() => {
                    timeoutId = undefined;
                    if (!immediate) {
                        invokeFunc(Date.now());
                    }
                }, delay);
                
                if (immediate && lastInvokeTime === 0) {
                    return invokeFunc(time);
                }
            }
        }
        
        if (timeoutId === undefined) {
            timeoutId = setTimeout(() => {
                timeoutId = undefined;
                if (!immediate) {
                    invokeFunc(Date.now());
                }
            }, delay);
        }
        
        if (immediate && lastInvokeTime === 0) {
            return invokeFunc(time);
        }
    }
    
    // 取消防抖
    debounced.cancel = function() {
        if (timeoutId !== undefined) {
            clearTimeout(timeoutId);
        }
        lastInvokeTime = 0;
        lastArgs = lastCallTime = lastThis = timeoutId = undefined;
    };
    
    // 立即执行
    debounced.flush = function() {
        return timeoutId === undefined ? undefined : invokeFunc(Date.now());
    };
    
    return debounced;
}
```

## （三）防抖的应用场景

### 1. 搜索框输入优化

```javascript
// 搜索框防抖 - 避免每次输入都发送请求
const searchBox = document.getElementById('searchBox');
const searchAPI = debounce(async function(keyword) {
    if (!keyword.trim()) return;
    
    try {
        console.log('发送搜索请求:', keyword);
        const response = await fetch(`/api/search?q=${encodeURIComponent(keyword)}`);
        const results = await response.json();
        displaySearchResults(results);
    } catch (error) {
        console.error('搜索失败:', error);
    }
}, 300);

searchBox.addEventListener('input', function(e) {
    searchAPI(e.target.value);
});

function displaySearchResults(results) {
    // 显示搜索结果的逻辑
    console.log('搜索结果:', results);
}
```

### 2. 表单验证优化

```javascript
// 表单验证防抖 - 避免频繁验证
const emailInput = document.getElementById('email');
const validateEmail = debounce(function(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = emailRegex.test(email);
    
    const errorElement = document.getElementById('email-error');
    if (isValid) {
        errorElement.textContent = '';
        emailInput.classList.remove('error');
        emailInput.classList.add('valid');
    } else {
        errorElement.textContent = '请输入有效的邮箱地址';
        emailInput.classList.remove('valid');
        emailInput.classList.add('error');
    }
}, 500);

emailInput.addEventListener('input', function(e) {
    validateEmail(e.target.value);
});
```

### 3. 按钮点击防抖

```javascript
// 提交按钮防抖 - 防止重复提交
const submitButton = document.getElementById('submitBtn');
const handleSubmit = debounce(async function() {
    submitButton.disabled = true;
    submitButton.textContent = '提交中...';
    
    try {
        const formData = new FormData(document.getElementById('myForm'));
        const response = await fetch('/api/submit', {
            method: 'POST',
            body: formData
        });
        
        if (response.ok) {
            alert('提交成功！');
        } else {
            alert('提交失败，请重试');
        }
    } catch (error) {
        console.error('提交错误:', error);
        alert('网络错误，请重试');
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = '提交';
    }
}, 1000, { immediate: true }); // 立即执行，防止重复点击

submitButton.addEventListener('click', handleSubmit);
```

# 二、节流（Throttle）详解

## （一）什么是节流

节流是指规定在一个单位时间内，只能触发一次函数。如果这个单位时间内触发多次函数，只有一次生效。简单来说，节流就是"我有自己的节奏，不管你触发多频繁"。

**生活中的比喻：** 就像水龙头限流一样，不管你怎么拧，水流的速度都是固定的，每秒只能流出固定量的水。

## （二）节流的实现原理

节流的核心思想是通过时间戳或定时器来控制函数的执行频率，确保在指定的时间间隔内最多只执行一次。

### 时间戳版节流

```javascript
/**
 * 节流函数 - 时间戳版
 * @param {Function} func 需要节流的函数
 * @param {number} delay 节流间隔时间（毫秒）
 * @returns {Function} 节流后的函数
 */
function throttle(func, delay) {
    let lastExecTime = 0; // 上次执行时间
    
    return function(...args) {
        const currentTime = Date.now();
        
        // 如果距离上次执行时间超过了延迟时间，则执行函数
        if (currentTime - lastExecTime >= delay) {
            lastExecTime = currentTime;
            return func.apply(this, args);
        }
    };
}

// 使用示例
const handleScroll = throttle(function() {
    console.log('页面滚动事件处理');
    // 处理滚动逻辑，比如懒加载、滚动动画等
}, 100);

window.addEventListener('scroll', handleScroll);
```

### 定时器版节流

```javascript
/**
 * 节流函数 - 定时器版
 * @param {Function} func 需要节流的函数
 * @param {number} delay 节流间隔时间（毫秒）
 * @returns {Function} 节流后的函数
 */
function throttle(func, delay) {
    let timeoutId = null; // 定时器ID
    
    return function(...args) {
        // 如果定时器不存在，说明可以执行
        if (!timeoutId) {
            timeoutId = setTimeout(() => {
                func.apply(this, args);
                timeoutId = null; // 执行完毕后清空定时器ID
            }, delay);
        }
    };
}
```

### 完整版节流实现

```javascript
/**
 * 节流函数 - 完整版
 * @param {Function} func 需要节流的函数
 * @param {number} delay 节流间隔时间（毫秒）
 * @param {Object} options 配置选项
 * @param {boolean} options.leading 是否在开始时执行
 * @param {boolean} options.trailing 是否在结束时执行
 * @returns {Function} 节流后的函数
 */
function throttle(func, delay, options = {}) {
    let timeoutId;
    let lastExecTime = 0;
    
    const { leading = true, trailing = true } = options;
    
    function throttled(...args) {
        const currentTime = Date.now();
        
        // 如果不需要开始时执行，且是第一次调用，记录时间但不执行
        if (!leading && lastExecTime === 0) {
            lastExecTime = currentTime;
        }
        
        // 计算剩余等待时间
        const remainingTime = delay - (currentTime - lastExecTime);
        
        if (remainingTime <= 0 || remainingTime > delay) {
            // 可以立即执行
            if (timeoutId) {
                clearTimeout(timeoutId);
                timeoutId = null;
            }
            
            lastExecTime = currentTime;
            return func.apply(this, args);
        } else if (!timeoutId && trailing) {
            // 设置定时器，在剩余时间后执行
            timeoutId = setTimeout(() => {
                lastExecTime = leading ? Date.now() : 0;
                timeoutId = null;
                func.apply(this, args);
            }, remainingTime);
        }
    }
    
    // 取消节流
    throttled.cancel = function() {
        if (timeoutId) {
            clearTimeout(timeoutId);
            timeoutId = null;
        }
        lastExecTime = 0;
    };
    
    return throttled;
}
```

## （三）节流的应用场景

### 1. 滚动事件优化

```javascript
// 滚动事件节流 - 优化滚动性能
const handleScroll = throttle(function() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    
    // 计算滚动百分比
    const scrollPercent = (scrollTop / (documentHeight - windowHeight)) * 100;
    
    // 更新进度条
    const progressBar = document.getElementById('progress-bar');
    if (progressBar) {
        progressBar.style.width = scrollPercent + '%';
    }
    
    // 懒加载图片
    lazyLoadImages();
    
    // 显示/隐藏回到顶部按钮
    const backToTopBtn = document.getElementById('back-to-top');
    if (backToTopBtn) {
        if (scrollTop > 300) {
            backToTopBtn.style.display = 'block';
        } else {
            backToTopBtn.style.display = 'none';
        }
    }
}, 16); // 约60fps

window.addEventListener('scroll', handleScroll);

function lazyLoadImages() {
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                imageObserver.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
}
```

### 2. 窗口大小调整优化

```javascript
// 窗口大小调整节流 - 优化响应式布局
const handleResize = throttle(function() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    console.log(`窗口大小变化: ${width} x ${height}`);
    
    // 重新计算布局
    recalculateLayout();
    
    // 更新图表大小（如果使用了图表库）
    updateChartsSize();
    
    // 调整移动端适配
    adjustMobileLayout(width);
}, 250);

window.addEventListener('resize', handleResize);

function recalculateLayout() {
    // 重新计算网格布局、瀑布流等
    const container = document.querySelector('.masonry-container');
    if (container) {
        // 重新排列瀑布流
        rearrangeMasonry(container);
    }
}

function updateChartsSize() {
    // 更新图表大小的逻辑
    const charts = document.querySelectorAll('.chart-container');
    charts.forEach(chart => {
        // 假设使用了某个图表库
        if (chart.chartInstance) {
            chart.chartInstance.resize();
        }
    });
}

function adjustMobileLayout(width) {
    const body = document.body;
    if (width <= 768) {
        body.classList.add('mobile-layout');
        body.classList.remove('desktop-layout');
    } else {
        body.classList.add('desktop-layout');
        body.classList.remove('mobile-layout');
    }
}
```

### 3. 鼠标移动事件优化

```javascript
// 鼠标移动节流 - 优化鼠标跟随效果
const cursor = document.createElement('div');
cursor.className = 'custom-cursor';
document.body.appendChild(cursor);

const handleMouseMove = throttle(function(e) {
    // 更新自定义鼠标位置
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';
    
    // 鼠标悬停效果检测
    const hoveredElement = document.elementFromPoint(e.clientX, e.clientY);
    if (hoveredElement && hoveredElement.classList.contains('interactive')) {
        cursor.classList.add('hover-effect');
    } else {
        cursor.classList.remove('hover-effect');
    }
}, 16); // 约60fps，保证流畅的动画效果

document.addEventListener('mousemove', handleMouseMove);
```

# 三、节流与防抖的区别与选择

## （一）核心区别对比

| 特性 | 防抖（Debounce） | 节流（Throttle） |
|------|------------------|------------------|
| **执行时机** | 事件停止触发后延迟执行 | 按固定频率执行 |
| **执行频率** | 可能一次都不执行 | 保证一定频率的执行 |
| **适用场景** | 用户输入、按钮点击 | 滚动、鼠标移动 |
| **性能影响** | 可能延迟较长时间 | 保证及时响应 |
| **实现复杂度** | 相对简单 | 稍微复杂 |

## （二）选择指南

### 使用防抖的场景：
- **搜索框输入**：用户停止输入后再发送请求
- **表单验证**：用户停止输入后再验证
- **按钮点击**：防止重复提交
- **窗口大小调整**：调整完成后再重新布局

### 使用节流的场景：
- **滚动事件**：需要实时响应但控制频率
- **鼠标移动**：需要流畅的交互效果
- **拖拽操作**：保证操作的流畅性
- **动画帧更新**：控制动画的帧率

## （三）实际应用示例对比

```javascript
// 搜索框：使用防抖
const searchInput = document.getElementById('search');
const debouncedSearch = debounce(function(value) {
    console.log('执行搜索:', value);
    // 发送搜索请求
}, 500);

searchInput.addEventListener('input', (e) => {
    debouncedSearch(e.target.value);
});

// 滚动事件：使用节流
const throttledScroll = throttle(function() {
    console.log('处理滚动事件');
    // 更新滚动相关的UI
}, 100);

window.addEventListener('scroll', throttledScroll);

// 按钮点击：使用防抖（防重复提交）
const submitBtn = document.getElementById('submit');
const debouncedSubmit = debounce(function() {
    console.log('提交表单');
    // 提交逻辑
}, 1000, { immediate: true });

submitBtn.addEventListener('click', debouncedSubmit);

// 鼠标移动：使用节流（保证流畅性）
const throttledMouseMove = throttle(function(e) {
    console.log('鼠标位置:', e.clientX, e.clientY);
    // 更新鼠标相关效果
}, 16); // 60fps

document.addEventListener('mousemove', throttledMouseMove);
```

# 四、最佳实践与注意事项

## （一）性能优化建议

### 1. 合理设置延迟时间

```javascript
// 不同场景的推荐延迟时间
const delays = {
    search: 300,        // 搜索：300ms，平衡用户体验和请求频率
    validation: 500,    // 表单验证：500ms，给用户足够输入时间
    scroll: 16,         // 滚动：16ms，约60fps，保证流畅性
    resize: 250,        // 窗口调整：250ms，避免频繁重排
    click: 1000,        // 按钮点击：1000ms，防止重复提交
    mousemove: 16       // 鼠标移动：16ms，保证交互流畅
};
```

### 2. 内存泄漏防护

```javascript
// 组件销毁时清理防抖/节流函数
class SearchComponent {
    constructor() {
        this.debouncedSearch = debounce(this.search.bind(this), 300);
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        this.searchInput = document.getElementById('search');
        this.searchInput.addEventListener('input', this.debouncedSearch);
    }
    
    search(value) {
        // 搜索逻辑
        console.log('搜索:', value);
    }
    
    destroy() {
        // 清理事件监听器
        this.searchInput.removeEventListener('input', this.debouncedSearch);
        
        // 取消防抖函数
        if (this.debouncedSearch.cancel) {
            this.debouncedSearch.cancel();
        }
    }
}
```

## （二）错误处理

```javascript
// 带错误处理的防抖函数
function safeDebounce(func, delay) {
    let timeoutId;
    
    return function(...args) {
        clearTimeout(timeoutId);
        
        timeoutId = setTimeout(() => {
            try {
                func.apply(this, args);
            } catch (error) {
                console.error('防抖函数执行错误:', error);
                // 可以添加错误上报逻辑
            }
        }, delay);
    };
}

// 使用示例
const safeSearch = safeDebounce(async function(keyword) {
    const response = await fetch(`/api/search?q=${keyword}`);
    if (!response.ok) {
        throw new Error(`搜索失败: ${response.status}`);
    }
    const data = await response.json();
    displayResults(data);
}, 300);
```

## （三）TypeScript支持

```typescript
// TypeScript版本的防抖和节流
type DebouncedFunction<T extends (...args: any[]) => any> = {
    (...args: Parameters<T>): void;
    cancel(): void;
    flush(): ReturnType<T> | undefined;
};

function debounce<T extends (...args: any[]) => any>(
    func: T,
    delay: number,
    options: { immediate?: boolean; maxWait?: number } = {}
): DebouncedFunction<T> {
    let timeoutId: NodeJS.Timeout | undefined;
    let lastCallTime: number | undefined;
    let lastInvokeTime = 0;
    
    const { immediate = false, maxWait } = options;
    
    function invokeFunc(time: number): ReturnType<T> {
        const args = lastArgs;
        const thisArg = lastThis;
        
        lastArgs = lastThis = undefined;
        lastInvokeTime = time;
        return func.apply(thisArg, args);
    }
    
    let lastArgs: Parameters<T> | undefined;
    let lastThis: any;
    
    function debounced(this: any, ...args: Parameters<T>): void {
        const time = Date.now();
        lastArgs = args;
        lastThis = this;
        lastCallTime = time;
        
        if (timeoutId === undefined) {
            timeoutId = setTimeout(() => {
                timeoutId = undefined;
                if (!immediate) {
                    invokeFunc(Date.now());
                }
            }, delay);
            
            if (immediate) {
                invokeFunc(time);
            }
        }
    }
    
    debounced.cancel = function(): void {
        if (timeoutId !== undefined) {
            clearTimeout(timeoutId);
        }
        lastInvokeTime = 0;
        lastArgs = lastCallTime = lastThis = timeoutId = undefined;
    };
    
    debounced.flush = function(): ReturnType<T> | undefined {
        return timeoutId === undefined ? undefined : invokeFunc(Date.now());
    };
    
    return debounced;
}
```

# 五、总结

节流和防抖是前端性能优化中的重要技术，它们通过控制函数的执行频率来解决高频事件带来的性能问题：

## （一）核心要点

1. **防抖（Debounce）**：等待用户停止操作后再执行，适用于搜索、表单验证等场景
2. **节流（Throttle）**：按固定频率执行，适用于滚动、鼠标移动等需要实时响应的场景
3. **选择原则**：根据业务需求选择，需要延迟执行用防抖，需要定期执行用节流

## （二）实践建议

1. **合理设置延迟时间**：平衡用户体验和性能
2. **注意内存泄漏**：组件销毁时清理防抖/节流函数
3. **添加错误处理**：确保函数执行的稳定性
4. **使用TypeScript**：提供更好的类型安全

## （三）性能收益

正确使用节流和防抖可以带来显著的性能提升：
- 减少不必要的函数调用
- 降低CPU使用率
- 减少网络请求次数
- 提升用户体验

掌握这两种技术，能够帮助我们构建更加高效、流畅的Web应用，是每个前端开发者必备的技能。

---

## 参考资料

- [MDN Web Docs - setTimeout](https://developer.mozilla.org/zh-CN/docs/Web/API/setTimeout)
- [MDN Web Docs - clearTimeout](https://developer.mozilla.org/zh-CN/docs/Web/API/clearTimeout)
- [Lodash - debounce](https://lodash.com/docs/4.17.15#debounce)
- [Lodash - throttle](https://lodash.com/docs/4.17.15#throttle)
- [JavaScript性能优化最佳实践](https://web.dev/performance/)
