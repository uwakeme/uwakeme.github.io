---
title: 【前端】CommonJS模块系统详解：Node.js的模块化基石
categories: 前端
date: 2025-07-28
tags:
  - JavaScript
  - Node.js
  - 模块化
  - CommonJS
  - 前端
  - 后端
description: 深入解析CommonJS模块系统的工作原理、语法特性、与ES6模块的区别，以及在现代JavaScript开发中的应用实践
keywords: CommonJS, Node.js, 模块化, require, exports, module.exports, JavaScript, ES6模块
cover: https://cdn.jsdelivr.net/gh/uwakeme/personal-image-repository/images/commonjs.jpg
---

# 前言

在JavaScript的发展历程中，模块化一直是一个重要的话题。CommonJS作为Node.js采用的模块系统，为服务端JavaScript开发奠定了坚实的基础。本文将深入探讨CommonJS的核心概念、工作原理、语法特性，以及它与现代ES6模块系统的区别和联系。

# 一、CommonJS模块系统概述

## （一）什么是CommonJS

CommonJS是一个JavaScript模块化规范，最初由Mozilla的工程师Kevin Dangoor于2009年提出。它的目标是为JavaScript定义一套通用的模块API，使JavaScript能够在浏览器之外的环境中运行，特别是服务器端环境。

### 1. 设计目标

CommonJS规范的主要设计目标包括：

- **模块化开发**：将代码分割成独立的模块，提高代码的可维护性
- **依赖管理**：明确模块间的依赖关系，避免全局变量污染
- **代码复用**：通过模块导入导出机制，实现代码的高效复用
- **服务端支持**：为JavaScript在服务器端运行提供模块化支持

### 2. 核心特点

```javascript
// CommonJS的核心特点
// 1. 同步加载 - 模块在运行时同步加载
const fs = require('fs');

// 2. 动态导入 - 可以在条件语句中导入模块
if (process.env.NODE_ENV === 'development') {
    const debug = require('debug');
}

// 3. 值拷贝 - 导出的是值的拷贝，不是引用
const { count } = require('./counter');
```

## （二）CommonJS在Node.js中的实现

Node.js是CommonJS规范最成功的实现之一，它将CommonJS作为默认的模块系统。

### 1. Node.js模块系统架构

```javascript
// Node.js为每个模块提供以下全局对象
console.log(__filename);  // 当前模块的文件路径
console.log(__dirname);   // 当前模块的目录路径
console.log(module);      // 当前模块对象
console.log(exports);     // module.exports的引用
console.log(require);     // 模块加载函数
```

### 2. 模块包装机制

Node.js在执行模块代码前，会将其包装在一个函数中：

```javascript
// Node.js实际执行的代码结构
(function(exports, require, module, __filename, __dirname) {
    // 你的模块代码在这里
    const fs = require('fs');
    
    function readFile(path) {
        return fs.readFileSync(path, 'utf8');
    }
    
    module.exports = { readFile };
});
```

# 二、CommonJS核心语法

## （一）模块导出 - exports和module.exports

CommonJS提供了两种导出方式：`exports`和`module.exports`。

### 1. 使用exports导出

```javascript
// math.js - 使用exports导出多个函数
exports.add = function(a, b) {
    return a + b;
};

exports.subtract = function(a, b) {
    return a - b;
};

exports.PI = 3.14159;

// 也可以使用箭头函数
exports.multiply = (a, b) => a * b;
```

### 2. 使用module.exports导出

```javascript
// calculator.js - 使用module.exports导出整个对象
module.exports = {
    add: function(a, b) {
        return a + b;
    },
    
    subtract: function(a, b) {
        return a - b;
    },
    
    // 支持ES6简写语法
    multiply(a, b) {
        return a * b;
    },
    
    divide: (a, b) => {
        if (b === 0) {
            throw new Error('除数不能为零');
        }
        return a / b;
    }
};
```

### 3. 导出类和构造函数

```javascript
// user.js - 导出类
class User {
    constructor(name, email) {
        this.name = name;
        this.email = email;
        this.createdAt = new Date();
    }
    
    getInfo() {
        return `用户: ${this.name}, 邮箱: ${this.email}`;
    }
    
    static validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
}

module.exports = User;

// 或者导出构造函数
function Product(name, price) {
    this.name = name;
    this.price = price;
    this.id = Math.random().toString(36).substr(2, 9);
}

Product.prototype.getPrice = function() {
    return `¥${this.price.toFixed(2)}`;
};

module.exports = Product;
```

## （二）模块导入 - require函数

`require`函数是CommonJS中加载模块的核心机制。

### 1. 基本导入语法

```javascript
// 导入核心模块
const fs = require('fs');
const path = require('path');
const http = require('http');

// 导入本地模块
const math = require('./math');           // 相对路径
const utils = require('../utils/helper'); // 相对路径
const config = require('/app/config');    // 绝对路径

// 导入npm包
const express = require('express');
const lodash = require('lodash');
const moment = require('moment');
```

### 2. 解构导入

```javascript
// 解构导入特定功能
const { readFile, writeFile } = require('fs');
const { join, resolve, basename } = require('path');

// 使用解构导入自定义模块
const { add, subtract, PI } = require('./math');

// 混合导入
const express = require('express');
const { Router } = express;
```

### 3. 条件导入和动态导入

```javascript
// 条件导入
let logger;
if (process.env.NODE_ENV === 'production') {
    logger = require('./production-logger');
} else {
    logger = require('./development-logger');
}

// 动态导入（基于变量）
function loadModule(moduleName) {
    try {
        return require(moduleName);
    } catch (error) {
        console.error(`无法加载模块 ${moduleName}:`, error.message);
        return null;
    }
}

const dbDriver = loadModule(process.env.DB_TYPE || 'mysql');
```

# 三、CommonJS模块加载机制

## （一）模块解析规则

Node.js按照特定的规则来解析模块路径：

### 1. 核心模块优先级最高

```javascript
// 这些都是Node.js核心模块，优先级最高
const fs = require('fs');
const http = require('http');
const crypto = require('crypto');
```

### 2. 文件模块解析

```javascript
// Node.js会按以下顺序查找文件：
require('./math');
// 1. ./math.js
// 2. ./math.json
// 3. ./math.node
// 4. ./math/index.js
// 5. ./math/package.json中main字段指定的文件
```

### 3. node_modules查找机制

```javascript
// 查找npm包时的搜索路径
require('express');
// 从当前目录开始，逐级向上查找node_modules目录：
// ./node_modules/express
// ../node_modules/express
// ../../node_modules/express
// ... 直到根目录
```

## （二）模块缓存机制

CommonJS具有强大的缓存机制，确保模块只被加载一次。

### 1. 缓存示例

```javascript
// counter.js
let count = 0;

function increment() {
    return ++count;
}

function getCount() {
    return count;
}

module.exports = { increment, getCount };

// main.js
const counter1 = require('./counter');
const counter2 = require('./counter');

console.log(counter1 === counter2); // true - 同一个对象引用

counter1.increment();
console.log(counter2.getCount()); // 1 - 共享状态
```

### 2. 清除缓存

```javascript
// 查看模块缓存
console.log(Object.keys(require.cache));

// 删除特定模块的缓存
delete require.cache[require.resolve('./config')];

// 重新加载模块
const freshConfig = require('./config');
```

# 四、CommonJS实践应用

## （一）创建实用工具模块

### 1. 文件操作工具

```javascript
// fileUtils.js
const fs = require('fs');
const path = require('path');

/**
 * 异步读取JSON文件
 * @param {string} filePath - 文件路径
 * @returns {Promise<Object>} 解析后的JSON对象
 */
async function readJsonFile(filePath) {
    try {
        const data = await fs.promises.readFile(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        throw new Error(`读取JSON文件失败: ${error.message}`);
    }
}

/**
 * 异步写入JSON文件
 * @param {string} filePath - 文件路径
 * @param {Object} data - 要写入的数据
 */
async function writeJsonFile(filePath, data) {
    try {
        const jsonString = JSON.stringify(data, null, 2);
        await fs.promises.writeFile(filePath, jsonString, 'utf8');
    } catch (error) {
        throw new Error(`写入JSON文件失败: ${error.message}`);
    }
}

/**
 * 确保目录存在
 * @param {string} dirPath - 目录路径
 */
async function ensureDir(dirPath) {
    try {
        await fs.promises.access(dirPath);
    } catch (error) {
        await fs.promises.mkdir(dirPath, { recursive: true });
    }
}

module.exports = {
    readJsonFile,
    writeJsonFile,
    ensureDir
};
```

### 2. 配置管理模块

```javascript
// config.js
const path = require('path');
const { readJsonFile } = require('./fileUtils');

class ConfigManager {
    constructor() {
        this.config = {};
        this.loaded = false;
    }
    
    async load(configPath = './config.json') {
        try {
            const fullPath = path.resolve(configPath);
            this.config = await readJsonFile(fullPath);
            this.loaded = true;
            console.log('配置加载成功');
        } catch (error) {
            console.error('配置加载失败:', error.message);
            // 使用默认配置
            this.config = this.getDefaultConfig();
            this.loaded = true;
        }
    }
    
    get(key, defaultValue = null) {
        if (!this.loaded) {
            throw new Error('配置尚未加载，请先调用load()方法');
        }
        
        return this.getNestedValue(this.config, key, defaultValue);
    }
    
    getNestedValue(obj, key, defaultValue) {
        const keys = key.split('.');
        let current = obj;
        
        for (const k of keys) {
            if (current && typeof current === 'object' && k in current) {
                current = current[k];
            } else {
                return defaultValue;
            }
        }
        
        return current;
    }
    
    getDefaultConfig() {
        return {
            server: {
                port: 3000,
                host: 'localhost'
            },
            database: {
                host: 'localhost',
                port: 5432,
                name: 'myapp'
            }
        };
    }
}

// 导出单例实例
module.exports = new ConfigManager();
```

## （二）模块组织最佳实践

### 1. 目录结构组织

```javascript
// 推荐的项目结构
project/
├── lib/                 // 核心库文件
│   ├── database.js
│   ├── logger.js
│   └── validator.js
├── utils/              // 工具函数
│   ├── fileUtils.js
│   ├── dateUtils.js
│   └── stringUtils.js
├── config/             // 配置文件
│   ├── index.js
│   ├── development.js
│   └── production.js
├── models/             // 数据模型
│   ├── User.js
│   └── Product.js
└── app.js             // 应用入口
```

### 2. 索引文件模式

```javascript
// utils/index.js - 统一导出工具函数
const fileUtils = require('./fileUtils');
const dateUtils = require('./dateUtils');
const stringUtils = require('./stringUtils');

module.exports = {
    ...fileUtils,
    ...dateUtils,
    ...stringUtils
};

// 使用时可以统一导入
const { readJsonFile, formatDate, capitalize } = require('./utils');
```

# 五、CommonJS与ES6模块对比

## （一）语法差异

### 1. 导出语法对比

```javascript
// CommonJS导出
// 方式1：exports
exports.add = function(a, b) { return a + b; };
exports.PI = 3.14159;

// 方式2：module.exports
module.exports = {
    add: function(a, b) { return a + b; },
    PI: 3.14159
};

// ES6模块导出
// 命名导出
export function add(a, b) { return a + b; }
export const PI = 3.14159;

// 默认导出
export default {
    add: function(a, b) { return a + b; },
    PI: 3.14159
};
```

### 2. 导入语法对比

```javascript
// CommonJS导入
const math = require('./math');
const { add, PI } = require('./math');

// ES6模块导入
import math from './math';
import { add, PI } from './math';
import * as math from './math';
```

## （二）核心差异

### 1. 加载时机

```javascript
// CommonJS - 运行时加载（同步）
console.log('开始加载');
const fs = require('fs'); // 运行到这里才加载
console.log('加载完成');

// ES6模块 - 编译时加载（静态）
import fs from 'fs'; // 在编译阶段就确定了依赖关系
console.log('开始执行');
```

### 2. 值传递方式

```javascript
// counter.js (CommonJS)
let count = 0;
exports.count = count;
exports.increment = function() {
    count++;
    exports.count = count; // 需要手动更新导出值
};

// main.js
const { count, increment } = require('./counter');
console.log(count); // 0
increment();
console.log(count); // 仍然是0，因为是值拷贝

// counter.mjs (ES6模块)
export let count = 0;
export function increment() {
    count++; // 导出的是引用，会自动更新
}

// main.mjs
import { count, increment } from './counter.mjs';
console.log(count); // 0
increment();
console.log(count); // 1，因为是引用
```

### 3. 循环依赖处理

```javascript
// CommonJS循环依赖示例
// a.js
console.log('a开始');
exports.done = false;
const b = require('./b');
console.log('在a中，b.done =', b.done);
exports.done = true;
console.log('a结束');

// b.js
console.log('b开始');
exports.done = false;
const a = require('./a');
console.log('在b中，a.done =', a.done);
exports.done = true;
console.log('b结束');

// main.js
const a = require('./a');
const b = require('./b');
console.log('在main中，a.done =', a.done, ', b.done =', b.done);
```

## （三）适用场景对比

### 1. CommonJS适用场景

```javascript
// 1. Node.js服务端开发
const express = require('express');
const app = express();

// 2. 动态模块加载
const dbType = process.env.DB_TYPE || 'mysql';
const db = require(`./drivers/${dbType}`);

// 3. 条件加载
if (process.env.NODE_ENV === 'development') {
    const debug = require('debug')('app');
}
```

### 2. ES6模块适用场景

```javascript
// 1. 现代前端开发
import React from 'react';
import { useState, useEffect } from 'react';

// 2. 静态分析和Tree Shaking
import { debounce } from 'lodash-es'; // 只导入需要的函数

// 3. 类型检查友好
import type { User } from './types'; // TypeScript类型导入
```

# 六、CommonJS进阶技巧

## （一）模块包装和私有变量

### 1. 创建私有作用域

```javascript
// logger.js - 使用IIFE创建私有作用域
module.exports = (function() {
    // 私有变量，外部无法访问
    let logLevel = 'info';
    const logHistory = [];

    // 私有函数
    function formatMessage(level, message) {
        const timestamp = new Date().toISOString();
        return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
    }

    // 公共API
    return {
        setLevel(level) {
            if (['debug', 'info', 'warn', 'error'].includes(level)) {
                logLevel = level;
            }
        },

        log(message, level = 'info') {
            if (this.shouldLog(level)) {
                const formattedMessage = formatMessage(level, message);
                console.log(formattedMessage);
                logHistory.push(formattedMessage);
            }
        },

        shouldLog(level) {
            const levels = { debug: 0, info: 1, warn: 2, error: 3 };
            return levels[level] >= levels[logLevel];
        },

        getHistory() {
            return [...logHistory]; // 返回副本，防止外部修改
        }
    };
})();
```

### 2. 模块工厂模式

```javascript
// database.js - 工厂模式创建数据库连接
function createDatabase(config) {
    // 私有状态
    let connection = null;
    let isConnected = false;

    return {
        async connect() {
            if (isConnected) {
                return connection;
            }

            try {
                // 模拟数据库连接
                connection = await simulateConnection(config);
                isConnected = true;
                console.log('数据库连接成功');
                return connection;
            } catch (error) {
                console.error('数据库连接失败:', error);
                throw error;
            }
        },

        async disconnect() {
            if (connection) {
                await connection.close();
                connection = null;
                isConnected = false;
                console.log('数据库连接已关闭');
            }
        },

        getStatus() {
            return {
                connected: isConnected,
                config: { ...config, password: '***' } // 隐藏敏感信息
            };
        }
    };
}

async function simulateConnection(config) {
    // 模拟异步连接过程
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                host: config.host,
                port: config.port,
                close: async () => console.log('连接已关闭')
            });
        }, 100);
    });
}

module.exports = createDatabase;
```

## （二）模块热重载

### 1. 开发环境热重载

```javascript
// hotReload.js - 开发环境模块热重载
const fs = require('fs');
const path = require('path');

class HotReloader {
    constructor() {
        this.watchers = new Map();
        this.modules = new Map();
    }

    require(modulePath) {
        const fullPath = require.resolve(modulePath);

        // 如果是第一次加载，设置文件监听
        if (!this.watchers.has(fullPath)) {
            this.setupWatcher(fullPath);
        }

        // 返回模块
        return require(modulePath);
    }

    setupWatcher(filePath) {
        const watcher = fs.watchFile(filePath, (curr, prev) => {
            if (curr.mtime > prev.mtime) {
                console.log(`文件 ${filePath} 已更新，重新加载...`);
                this.reloadModule(filePath);
            }
        });

        this.watchers.set(filePath, watcher);
    }

    reloadModule(filePath) {
        // 清除模块缓存
        delete require.cache[filePath];

        // 触发重载事件
        this.emit('reload', filePath);
    }

    emit(event, data) {
        // 简单的事件发射器
        if (this.listeners && this.listeners[event]) {
            this.listeners[event].forEach(callback => callback(data));
        }
    }

    on(event, callback) {
        if (!this.listeners) this.listeners = {};
        if (!this.listeners[event]) this.listeners[event] = [];
        this.listeners[event].push(callback);
    }

    cleanup() {
        // 清理所有文件监听器
        this.watchers.forEach((watcher, filePath) => {
            fs.unwatchFile(filePath);
        });
        this.watchers.clear();
    }
}

module.exports = new HotReloader();
```

## （三）模块性能优化

### 1. 延迟加载

```javascript
// lazyLoader.js - 延迟加载大型模块
class LazyLoader {
    constructor() {
        this.cache = new Map();
    }

    // 创建延迟加载的getter
    createLazyGetter(target, property, modulePath) {
        Object.defineProperty(target, property, {
            get() {
                if (!this.cache.has(modulePath)) {
                    console.log(`延迟加载模块: ${modulePath}`);
                    this.cache.set(modulePath, require(modulePath));
                }
                return this.cache.get(modulePath);
            },
            configurable: true
        });
    }
}

// 使用示例
const lazyLoader = new LazyLoader();
const services = {};

// 只有在实际使用时才加载这些大型模块
lazyLoader.createLazyGetter(services, 'imageProcessor', './heavy-image-processor');
lazyLoader.createLazyGetter(services, 'mlModel', './machine-learning-model');
lazyLoader.createLazyGetter(services, 'videoEncoder', './video-encoder');

module.exports = services;
```

### 2. 模块预加载

```javascript
// preloader.js - 模块预加载器
class ModulePreloader {
    constructor() {
        this.preloadQueue = [];
        this.loaded = new Set();
    }

    // 添加到预加载队列
    add(modulePath, priority = 0) {
        this.preloadQueue.push({ modulePath, priority });
        this.preloadQueue.sort((a, b) => b.priority - a.priority);
    }

    // 开始预加载
    async start() {
        console.log('开始预加载模块...');

        for (const { modulePath } of this.preloadQueue) {
            if (!this.loaded.has(modulePath)) {
                try {
                    await this.loadModule(modulePath);
                    this.loaded.add(modulePath);
                } catch (error) {
                    console.error(`预加载模块 ${modulePath} 失败:`, error);
                }
            }
        }

        console.log('模块预加载完成');
    }

    async loadModule(modulePath) {
        return new Promise((resolve) => {
            // 使用setImmediate避免阻塞事件循环
            setImmediate(() => {
                try {
                    require(modulePath);
                    resolve();
                } catch (error) {
                    resolve(); // 即使失败也继续
                }
            });
        });
    }
}

module.exports = new ModulePreloader();
```

# 七、常见问题与解决方案

## （一）循环依赖问题

### 1. 识别循环依赖

```javascript
// dependencyTracker.js - 依赖关系追踪器
class DependencyTracker {
    constructor() {
        this.dependencies = new Map();
        this.loading = new Set();
    }

    trackRequire(requirer, required) {
        if (!this.dependencies.has(requirer)) {
            this.dependencies.set(requirer, new Set());
        }
        this.dependencies.get(requirer).add(required);

        // 检查循环依赖
        if (this.hasCycle(required, requirer)) {
            console.warn(`检测到循环依赖: ${requirer} <-> ${required}`);
        }
    }

    hasCycle(start, target, visited = new Set()) {
        if (start === target) return true;
        if (visited.has(start)) return false;

        visited.add(start);
        const deps = this.dependencies.get(start);

        if (deps) {
            for (const dep of deps) {
                if (this.hasCycle(dep, target, visited)) {
                    return true;
                }
            }
        }

        return false;
    }

    printDependencyGraph() {
        console.log('依赖关系图:');
        for (const [module, deps] of this.dependencies) {
            console.log(`${module} -> [${Array.from(deps).join(', ')}]`);
        }
    }
}

module.exports = new DependencyTracker();
```

### 2. 解决循环依赖

```javascript
// 方案1：延迟引用
// userService.js
const orderService = require('./orderService');

class UserService {
    constructor() {
        // 延迟获取orderService的方法
        this.getOrderService = () => orderService;
    }

    getUserOrders(userId) {
        // 使用时才调用
        return this.getOrderService().getOrdersByUserId(userId);
    }
}

module.exports = new UserService();

// 方案2：事件驱动解耦
// eventBus.js
const EventEmitter = require('events');
module.exports = new EventEmitter();

// userService.js
const eventBus = require('./eventBus');

class UserService {
    createUser(userData) {
        const user = this.saveUser(userData);
        // 通过事件通知，而不是直接调用
        eventBus.emit('user:created', user);
        return user;
    }
}

// orderService.js
const eventBus = require('./eventBus');

eventBus.on('user:created', (user) => {
    // 处理用户创建后的订单相关逻辑
    console.log(`为用户 ${user.id} 初始化订单系统`);
});
```

## （二）模块路径问题

### 1. 路径解析工具

```javascript
// pathResolver.js - 路径解析工具
const path = require('path');

class PathResolver {
    constructor(baseDir = process.cwd()) {
        this.baseDir = baseDir;
        this.aliases = new Map();
    }

    // 设置路径别名
    setAlias(alias, realPath) {
        this.aliases.set(alias, path.resolve(this.baseDir, realPath));
    }

    // 解析路径
    resolve(modulePath) {
        // 检查是否使用了别名
        for (const [alias, realPath] of this.aliases) {
            if (modulePath.startsWith(alias + '/')) {
                return modulePath.replace(alias, realPath);
            }
        }

        // 相对路径处理
        if (modulePath.startsWith('./') || modulePath.startsWith('../')) {
            return path.resolve(this.baseDir, modulePath);
        }

        return modulePath;
    }

    // 创建require函数
    createRequire(fromPath) {
        const resolver = this;
        return function customRequire(modulePath) {
            const resolvedPath = resolver.resolve(modulePath);
            return require(resolvedPath);
        };
    }
}

// 使用示例
const resolver = new PathResolver();
resolver.setAlias('@lib', './lib');
resolver.setAlias('@utils', './utils');
resolver.setAlias('@config', './config');

// 现在可以使用别名
const customRequire = resolver.createRequire(__dirname);
const utils = customRequire('@utils/fileUtils');

module.exports = PathResolver;
```

# 八、总结

## （一）CommonJS的优势

1. **简单易用**：语法简洁，学习成本低
2. **同步加载**：适合服务端环境，文件读取速度快
3. **动态特性**：支持条件加载和运行时模块解析
4. **成熟稳定**：在Node.js生态中经过长期验证
5. **向后兼容**：与大量现有npm包兼容

## （二）使用建议

### 1. 最佳实践

- **模块职责单一**：每个模块应该有明确的职责
- **避免循环依赖**：通过合理的架构设计避免循环引用
- **合理使用缓存**：利用模块缓存机制提高性能
- **错误处理**：在require时进行适当的错误处理
- **文档完善**：为模块提供清晰的API文档

### 2. 性能优化

- **延迟加载**：对于大型模块使用延迟加载策略
- **模块预加载**：在应用启动时预加载核心模块
- **缓存管理**：在必要时清理模块缓存
- **路径优化**：使用绝对路径或别名减少路径解析开销

## （三）发展趋势

随着ES6模块的普及，CommonJS在前端开发中的使用逐渐减少，但在Node.js服务端开发中仍然占据重要地位。未来的发展趋势包括：

1. **与ES6模块的互操作性**：Node.js正在改进两种模块系统的兼容性
2. **性能优化**：持续优化模块加载和缓存机制
3. **工具链支持**：构建工具对CommonJS的支持将继续完善
4. **渐进式迁移**：现有项目可以逐步迁移到ES6模块

CommonJS作为JavaScript模块化的重要里程碑，为现代JavaScript开发奠定了坚实基础。理解和掌握CommonJS不仅有助于Node.js开发，也为学习其他模块系统提供了重要参考。

# 九、参考资料

## 官方文档
- [Node.js Modules Documentation](https://nodejs.org/api/modules.html)
- [CommonJS官方规范](http://www.commonjs.org/)
- [npm官方文档](https://docs.npmjs.com/)

## 相关文章
- [【前端】JavaScript中的核心：理解和使用Document对象](./【前端】JavaScript中的核心：理解和使用Document对象.md)
- [【前端】TypeScript与JavaScript对比：异同、优势及适用场景](./【前端】TypeScript与JavaScript对比：异同、优势及适用场景.md)
- [【Node.js】Node.js学习笔记专栏介绍](../Node.js/【Node.js】Node.js学习笔记专栏介绍.md)
- [【Node.js】Node.js多版本管理：一台电脑安装多个Node.js版本的完整指南](../Node.js/【Node.js】Node.js多版本管理：一台电脑安装多个Node.js版本的完整指南.md)

## 学习资源
- 《深入浅出Node.js》- 朴灵著
- 《Node.js实战》- Mike Cantelon等著
- [MDN JavaScript模块](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Modules)
- [阮一峰ES6教程 - Module语法](https://es6.ruanyifeng.com/#docs/module)

## 在线资源
- [Node.js官方网站](https://nodejs.org/)
- [CommonJS规范详解](http://javascript.ruanyifeng.com/nodejs/module.html)
- [模块化发展历程](https://github.com/seajs/seajs/issues/588)
