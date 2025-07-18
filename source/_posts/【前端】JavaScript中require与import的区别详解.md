---
title: 【前端】JavaScript中require与import的区别详解
date: 2025-07-18
categories: 前端
tags:
  - JavaScript
  - Node.js
  - ES6
  - 模块化
  - CommonJS
  - ES Modules
---

# JavaScript中require与import的区别详解

## 前言

在JavaScript开发中，模块化是组织代码的重要方式。随着JavaScript生态的发展，出现了不同的模块系统，其中最常见的是CommonJS（使用require）和ES Modules（使用import）。本文将详细介绍这两种模块导入方式的区别、使用场景和最佳实践。

## 一、模块系统概述

### 1.1 什么是模块化

模块化是将复杂程序分解为独立、可重用的代码块的编程方法。每个模块都有自己的作用域，可以导出功能供其他模块使用。

#### 模块化的优势
- **代码复用**：避免重复编写相同功能
- **命名空间**：避免全局变量污染
- **依赖管理**：明确模块间的依赖关系
- **按需加载**：提高应用性能
- **团队协作**：便于多人协作开发

### 1.2 JavaScript模块系统发展历程

```javascript
// 1. 全局变量时代（容易冲突）
var myLibrary = {
    method1: function() {},
    method2: function() {}
};

// 2. IIFE模式（立即执行函数）
(function(global) {
    var myLibrary = {
        method1: function() {},
        method2: function() {}
    };
    global.myLibrary = myLibrary;
})(window);

// 3. CommonJS（Node.js）
const myLibrary = require('./myLibrary');

// 4. AMD（RequireJS）
define(['dependency'], function(dep) {
    return {
        method1: function() {}
    };
});

// 5. ES Modules（ES6+）
import myLibrary from './myLibrary.js';
```

## 二、CommonJS与require

### 2.1 CommonJS规范

CommonJS是Node.js采用的模块规范，主要用于服务器端JavaScript开发。

#### 基本语法
```javascript
// 导出模块 - module.exports
// math.js
function add(a, b) {
    return a + b;
}

function subtract(a, b) {
    return a - b;
}

// 方式1：直接赋值
module.exports = {
    add: add,
    subtract: subtract
};

// 方式2：逐个添加
module.exports.add = add;
module.exports.subtract = subtract;

// 方式3：使用exports简写
exports.add = add;
exports.subtract = subtract;
```

```javascript
// 导入模块 - require
// main.js
const math = require('./math');
const { add, subtract } = require('./math'); // 解构导入

console.log(math.add(5, 3)); // 8
console.log(subtract(5, 3)); // 2
```

### 2.2 require的特点

#### 同步加载
```javascript
// require是同步的，会阻塞代码执行
console.log('开始加载模块');
const fs = require('fs'); // 同步加载，必须等待完成
console.log('模块加载完成');
```

#### 动态加载
```javascript
// 可以在运行时动态加载模块
function loadModule(moduleName) {
    if (moduleName === 'math') {
        return require('./math');
    } else if (moduleName === 'utils') {
        return require('./utils');
    }
}

// 条件加载
if (process.env.NODE_ENV === 'development') {
    const devTools = require('./dev-tools');
}
```

#### 缓存机制
```javascript
// 模块会被缓存，多次require同一模块返回相同实例
const math1 = require('./math');
const math2 = require('./math');

console.log(math1 === math2); // true

// 查看模块缓存
console.log(require.cache);

// 删除缓存（谨慎使用）
delete require.cache[require.resolve('./math')];
```

### 2.3 CommonJS的导出方式

#### module.exports vs exports
```javascript
// math.js

// ✅ 正确：module.exports直接赋值
module.exports = {
    add: (a, b) => a + b,
    subtract: (a, b) => a - b
};

// ✅ 正确：module.exports添加属性
module.exports.multiply = (a, b) => a * b;

// ✅ 正确：exports添加属性
exports.divide = (a, b) => a / b;

// ❌ 错误：不能直接给exports赋值
// exports = { add: (a, b) => a + b }; // 这样不会生效

// 原因：exports只是module.exports的引用
// exports = module.exports = {};
```

#### 不同的导出模式
```javascript
// 1. 导出对象
module.exports = {
    name: 'MyModule',
    version: '1.0.0',
    init: function() {}
};

// 2. 导出函数
module.exports = function(options) {
    return {
        start: function() {},
        stop: function() {}
    };
};

// 3. 导出类
module.exports = class Calculator {
    add(a, b) { return a + b; }
    subtract(a, b) { return a - b; }
};

// 4. 导出基本类型
module.exports = 'Hello World';
module.exports = 42;
module.exports = true;
```

## 三、ES Modules与import

### 3.1 ES Modules规范

ES Modules（ESM）是ECMAScript 2015（ES6）引入的官方模块系统，现在是JavaScript的标准。

#### 基本语法
```javascript
// 导出模块 - export
// math.js

// 命名导出
export function add(a, b) {
    return a + b;
}

export function subtract(a, b) {
    return a - b;
}

// 批量导出
function multiply(a, b) {
    return a * b;
}

function divide(a, b) {
    return a / b;
}

export { multiply, divide };

// 默认导出
export default class Calculator {
    constructor() {
        this.result = 0;
    }
    
    add(num) {
        this.result += num;
        return this;
    }
}
```

```javascript
// 导入模块 - import
// main.js

// 命名导入
import { add, subtract } from './math.js';

// 默认导入
import Calculator from './math.js';

// 混合导入
import Calculator, { add, subtract } from './math.js';

// 重命名导入
import { add as sum, subtract as minus } from './math.js';

// 命名空间导入
import * as math from './math.js';

// 仅执行模块（副作用导入）
import './init.js';
```

### 3.2 import的特点

#### 静态分析
```javascript
// ✅ 正确：静态导入，在编译时确定
import { add } from './math.js';

// ❌ 错误：不能在条件语句中使用import
if (condition) {
    import { add } from './math.js'; // SyntaxError
}

// ✅ 正确：使用动态导入
if (condition) {
    const { add } = await import('./math.js');
}
```

#### 异步加载
```javascript
// import语句会被提升，但模块加载是异步的
console.log('开始');

import { add } from './math.js'; // 异步加载

console.log('结束');
// 输出顺序：开始 -> 结束 -> 模块加载完成
```

#### 动态导入（ES2020）
```javascript
// 动态导入返回Promise
async function loadMath() {
    try {
        const mathModule = await import('./math.js');
        console.log(mathModule.add(2, 3));
    } catch (error) {
        console.error('模块加载失败:', error);
    }
}

// 条件加载
if (needsMathModule) {
    import('./math.js').then(module => {
        console.log(module.add(1, 2));
    });
}

// 懒加载
button.addEventListener('click', async () => {
    const { heavyFunction } = await import('./heavy-module.js');
    heavyFunction();
});
```

### 3.3 ES Modules的导出方式

#### 命名导出
```javascript
// utils.js

// 直接导出
export const PI = 3.14159;
export let counter = 0;

export function increment() {
    counter++;
}

export class EventEmitter {
    constructor() {
        this.events = {};
    }
}

// 批量导出
const config = { debug: true };
const version = '1.0.0';

export { config, version };

// 重命名导出
function internalFunction() {}
export { internalFunction as publicFunction };
```

#### 默认导出
```javascript
// logger.js

// 方式1：直接默认导出
export default function log(message) {
    console.log(`[LOG] ${message}`);
}

// 方式2：先定义后导出
function createLogger(prefix) {
    return function(message) {
        console.log(`[${prefix}] ${message}`);
    };
}

export default createLogger;

// 方式3：导出对象作为默认
export default {
    log: (msg) => console.log(msg),
    error: (msg) => console.error(msg),
    warn: (msg) => console.warn(msg)
};
```

#### 重新导出
```javascript
// index.js - 模块聚合

// 重新导出命名导出
export { add, subtract } from './math.js';
export { log, error } from './logger.js';

// 重新导出默认导出
export { default as Calculator } from './calculator.js';

// 重新导出所有
export * from './utils.js';

// 重新导出并重命名
export { default as MathUtils } from './math.js';
```

## 四、require vs import 详细对比

### 4.1 语法差异对比表

| 特性 | require (CommonJS) | import (ES Modules) |
|------|-------------------|-------------------|
| **语法风格** | 函数调用 | 声明语句 |
| **加载时机** | 运行时 | 编译时 |
| **加载方式** | 同步 | 异步 |
| **动态加载** | 支持 | ES2020后支持 |
| **静态分析** | 不支持 | 支持 |
| **Tree Shaking** | 不支持 | 支持 |
| **循环依赖** | 部分支持 | 更好支持 |
| **浏览器支持** | 需要打包工具 | 现代浏览器原生支持 |

### 4.2 使用场景对比

#### require适用场景
```javascript
// 1. Node.js服务器端开发
const express = require('express');
const fs = require('fs');

// 2. 条件加载
if (process.env.NODE_ENV === 'development') {
    const devMiddleware = require('./dev-middleware');
}

// 3. 动态模块名
const moduleName = getUserInput();
const module = require(`./modules/${moduleName}`);

// 4. 老项目兼容
const _ = require('lodash');
const moment = require('moment');
```

#### import适用场景
```javascript
// 1. 现代前端开发
import React from 'react';
import { useState, useEffect } from 'react';

// 2. 静态分析和Tree Shaking
import { debounce } from 'lodash-es'; // 只导入需要的函数

// 3. 模块聚合
import * as utils from './utils/index.js';

// 4. 代码分割和懒加载
const LazyComponent = React.lazy(() => import('./LazyComponent'));
```

### 4.3 性能对比

#### 打包体积
```javascript
// CommonJS - 整个库被包含
const _ = require('lodash'); // 整个lodash库
const debounce = _.debounce;

// ES Modules - 支持Tree Shaking
import { debounce } from 'lodash-es'; // 只包含debounce函数
```

#### 加载性能
```javascript
// require - 同步加载，可能阻塞
const heavyModule = require('./heavy-module'); // 立即加载

// import - 可以懒加载
const loadHeavyModule = () => import('./heavy-module'); // 按需加载
```

## 五、实际应用示例

### 5.1 Node.js项目中的模块管理

#### package.json配置
```json
{
  "name": "my-node-app",
  "version": "1.0.0",
  "type": "module", // 启用ES Modules
  "main": "index.js",
  "scripts": {
    "start": "node index.js"
  }
}
```

#### 混合使用示例
```javascript
// config.js - 使用CommonJS
module.exports = {
    port: process.env.PORT || 3000,
    database: {
        host: 'localhost',
        port: 5432
    }
};

// app.mjs - 使用ES Modules
import express from 'express';
import { createRequire } from 'module';

// 在ES Modules中使用require
const require = createRequire(import.meta.url);
const config = require('./config.js');

const app = express();

app.listen(config.port, () => {
    console.log(`Server running on port ${config.port}`);
});
```

### 5.2 前端项目中的模块管理

#### Webpack配置
```javascript
// webpack.config.js
module.exports = {
    entry: './src/index.js',
    output: {
        filename: 'bundle.js',
        path: __dirname + '/dist'
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env']
                    }
                }
            }
        ]
    }
};
```

#### 模块组织示例
```javascript
// src/utils/index.js - 工具函数聚合
export { default as http } from './http.js';
export { default as storage } from './storage.js';
export { default as validator } from './validator.js';

// src/components/index.js - 组件聚合
export { default as Header } from './Header.js';
export { default as Footer } from './Footer.js';
export { default as Sidebar } from './Sidebar.js';

// src/index.js - 主入口
import { http, storage } from './utils/index.js';
import { Header, Footer } from './components/index.js';

// 应用初始化
async function initApp() {
    const config = await http.get('/api/config');
    storage.set('config', config);
    
    // 渲染组件
    document.body.appendChild(Header());
    document.body.appendChild(Footer());
}

initApp();
```

## 六、最佳实践与建议

### 6.1 选择指南

#### 何时使用require
- Node.js服务器端项目
- 需要动态加载模块
- 老项目维护
- 简单的脚本工具

#### 何时使用import
- 现代前端项目
- 需要Tree Shaking优化
- 静态分析和类型检查
- 新项目开发

### 6.2 迁移策略

#### 从CommonJS迁移到ES Modules
```javascript
// 1. 更新package.json
{
  "type": "module"
}

// 2. 修改文件扩展名
// old: utils.js
// new: utils.mjs 或保持.js但设置type: "module"

// 3. 转换导出语法
// Before (CommonJS)
module.exports = {
    add: (a, b) => a + b
};

// After (ES Modules)
export const add = (a, b) => a + b;
export default { add };

// 4. 转换导入语法
// Before
const { add } = require('./utils');

// After
import { add } from './utils.js';
```

### 6.3 常见问题与解决方案

#### 循环依赖问题
```javascript
// a.js
import { b } from './b.js';
export const a = 'a';
console.log(b); // undefined (TDZ)

// b.js
import { a } from './a.js';
export const b = 'b';
console.log(a); // undefined (TDZ)

// 解决方案：延迟访问
// a.js
import * as bModule from './b.js';
export const a = 'a';
setTimeout(() => console.log(bModule.b), 0); // 'b'
```

#### 文件扩展名问题
```javascript
// ❌ 在ES Modules中必须包含扩展名
import utils from './utils'; // Error

// ✅ 正确写法
import utils from './utils.js';
import utils from './utils.mjs';
```

## 七、总结

### 7.1 核心差异总结

1. **语法层面**：require是函数调用，import是语言关键字
2. **加载时机**：require运行时加载，import编译时分析
3. **加载方式**：require同步，import异步
4. **优化支持**：import支持Tree Shaking，require不支持
5. **浏览器支持**：import原生支持，require需要打包工具

### 7.2 选择建议

- **新项目**：优先选择ES Modules（import/export）
- **Node.js项目**：可以继续使用CommonJS，或逐步迁移到ES Modules
- **前端项目**：强烈推荐使用ES Modules
- **库开发**：提供两种格式的版本以兼容不同环境

### 7.3 未来趋势

ES Modules已经成为JavaScript模块化的标准，随着Node.js对ES Modules支持的完善和浏览器的普及，import/export将成为主流。但CommonJS在Node.js生态中仍有重要地位，两者在相当长的时间内会并存。

理解这两种模块系统的差异和适用场景，能够帮助开发者在不同项目中做出正确的技术选择，写出更高质量的JavaScript代码。
