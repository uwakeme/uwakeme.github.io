---
title: 【Node.js】Express.js详解：Node.js Web应用框架
date: 2025-07-05
tags: 
    - 后端
    - Node.js
    - Express.js
    - JavaScript
    - Web框架
    - 中间件
    - REST API
categories: Node.js
description: 全面深入解析Express.js框架，涵盖路由系统设计、中间件机制、模板引擎集成、数据库操作、用户认证授权、错误处理机制、性能优化策略、安全防护等Node.js Web开发的核心技术与最佳实践
keywords: Express.js, Node.js, Web框架, 路由系统, 中间件, REST API, 模板引擎, 数据库集成, 用户认证, 性能优化
cover: https://cdn.jsdelivr.net/gh/uwakeme/personal-image-repository/images/expressjs.jpg
---

# 前言

Express.js是Node.js生态系统中最受欢迎的Web应用框架，由TJ Holowaychuk于2010年创建。作为一个快速、开放、极简的Web框架，Express.js以其简洁的API设计和强大的扩展能力，成为了构建Web应用和API服务的首选解决方案。

## 为什么选择Express.js？

- **极简设计**：最小化的核心功能，保持框架轻量级和高性能
- **灵活架构**：不强制特定的项目结构，给开发者充分的自由度
- **中间件生态**：丰富的中间件生态系统，满足各种开发需求
- **成熟稳定**：经过多年发展，拥有稳定的API和强大的社区支持
- **学习成本低**：简单易学，适合快速上手和原型开发
- **性能优异**：基于Node.js的事件驱动和非阻塞I/O模型

## 核心特性详解

- **路由系统**：强大而灵活的路由处理，支持RESTful API设计
- **中间件机制**：可插拔的中间件架构，实现功能模块化
- **模板引擎支持**：兼容多种模板引擎（EJS、Pug、Handlebars等）
- **静态文件服务**：内置静态文件服务功能，简化资源管理
- **错误处理**：完善的错误处理机制，提升应用稳定性
- **HTTP工具集**：丰富的HTTP工具方法，简化Web开发

## 本文内容概览

本文将全面介绍Express.js框架的核心概念和实践应用，包括：
- **基础配置与项目结构**：快速搭建Express.js应用
- **路由系统设计**：掌握路由定义、参数处理和模块化组织
- **中间件机制详解**：理解中间件工作原理和最佳实践
- **模板引擎集成**：实现动态页面渲染和前端集成
- **数据库操作**：集成MongoDB、MySQL等数据库
- **用户认证授权**：实现安全的用户管理系统
- **错误处理与调试**：构建健壮的错误处理机制
- **性能优化策略**：提升应用性能和响应速度
- **安全防护措施**：保障应用安全性
- **测试与部署**：完整的开发到生产流程

# 一、安装与基础配置

## （一）项目初始化

```bash
# 创建项目目录
mkdir express-app
cd express-app

# 初始化npm项目
npm init -y

# 安装Express
npm install express

# 安装开发依赖
npm install --save-dev nodemon
```

## （二）基础应用结构

```javascript
// app.js
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// 基础中间件
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 基础路由
app.get('/', (req, res) => {
    res.json({
        message: 'Welcome to Express.js API',
        version: '1.0.0',
        timestamp: new Date().toISOString()
    });
});

// 启动服务器
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
```

## （三）package.json配置

```json
{
  "name": "express-app",
  "version": "1.0.0",
  "description": "Express.js应用示例",
  "main": "app.js",
  "scripts": {
    "start": "node app.js",
    "dev": "nodemon app.js",
    "test": "jest"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "morgan": "^1.10.0",
    "dotenv": "^16.3.1"
  },
  "devDependencies": {
    "nodemon": "^3.0.1",
    "jest": "^29.7.0",
    "supertest": "^6.3.3"
  }
}
```

# 二、路由系统

## （一）基础路由

```javascript
// routes/basic.js
const express = require('express');
const router = express.Router();

// GET路由
router.get('/users', (req, res) => {
    res.json({
        users: [
            { id: 1, name: 'John Doe', email: 'john@example.com' },
            { id: 2, name: 'Jane Smith', email: 'jane@example.com' }
        ]
    });
});

// POST路由
router.post('/users', (req, res) => {
    const { name, email } = req.body;
    
    // 简单验证
    if (!name || !email) {
        return res.status(400).json({
            error: 'Name and email are required'
        });
    }
    
    const newUser = {
        id: Date.now(),
        name,
        email,
        createdAt: new Date().toISOString()
    };
    
    res.status(201).json({
        message: 'User created successfully',
        user: newUser
    });
});

// PUT路由
router.put('/users/:id', (req, res) => {
    const { id } = req.params;
    const { name, email } = req.body;
    
    res.json({
        message: `User ${id} updated successfully`,
        user: { id: parseInt(id), name, email }
    });
});

// DELETE路由
router.delete('/users/:id', (req, res) => {
    const { id } = req.params;
    
    res.json({
        message: `User ${id} deleted successfully`
    });
});

module.exports = router;
```

## （二）路由参数与查询

```javascript
// routes/advanced.js
const express = require('express');
const router = express.Router();

// 路径参数
router.get('/users/:id', (req, res) => {
    const { id } = req.params;
    
    res.json({
        userId: id,
        user: {
            id: parseInt(id),
            name: 'John Doe',
            email: 'john@example.com'
        }
    });
});

// 多个路径参数
router.get('/users/:userId/posts/:postId', (req, res) => {
    const { userId, postId } = req.params;
    
    res.json({
        userId: parseInt(userId),
        postId: parseInt(postId),
        post: {
            id: parseInt(postId),
            title: 'Sample Post',
            content: 'This is a sample post content',
            authorId: parseInt(userId)
        }
    });
});

// 查询参数
router.get('/search', (req, res) => {
    const { q, page = 1, limit = 10, sort = 'name' } = req.query;
    
    if (!q) {
        return res.status(400).json({
            error: 'Search query is required'
        });
    }
    
    res.json({
        query: q,
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: 100
        },
        sort,
        results: [
            { id: 1, name: 'John Doe', relevance: 0.95 },
            { id: 2, name: 'Jane Smith', relevance: 0.87 }
        ]
    });
});

// 正则表达式路由
router.get(/.*fly$/, (req, res) => {
    res.json({
        message: 'This route matches paths ending with "fly"',
        path: req.path
    });
});

// 路由参数验证
router.param('id', (req, res, next, id) => {
    // 验证ID格式
    if (!/^\d+$/.test(id)) {
        return res.status(400).json({
            error: 'Invalid ID format'
        });
    }
    
    // 将验证后的ID添加到请求对象
    req.validatedId = parseInt(id);
    next();
});

module.exports = router;
```

## （三）路由组织与模块化

```javascript
// routes/index.js
const express = require('express');
const router = express.Router();

// 导入子路由
const userRoutes = require('./users');
const postRoutes = require('./posts');
const authRoutes = require('./auth');

// API版本控制
const v1Router = express.Router();
const v2Router = express.Router();

// V1 API路由
v1Router.use('/users', userRoutes);
v1Router.use('/posts', postRoutes);
v1Router.use('/auth', authRoutes);

// V2 API路由（可能有不同的实现）
v2Router.use('/users', require('./v2/users'));
v2Router.use('/posts', require('./v2/posts'));

// 挂载版本路由
router.use('/api/v1', v1Router);
router.use('/api/v2', v2Router);

// 健康检查路由
router.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage()
    });
});

module.exports = router;
```

# 三、中间件系统

## （一）内置中间件

```javascript
// middleware/builtin.js
const express = require('express');
const path = require('path');

function setupBuiltinMiddleware(app) {
    // JSON解析中间件
    app.use(express.json({ 
        limit: '10mb',
        type: 'application/json'
    }));
    
    // URL编码解析中间件
    app.use(express.urlencoded({ 
        extended: true,
        limit: '10mb'
    }));
    
    // 静态文件服务
    app.use('/static', express.static(path.join(__dirname, '../public'), {
        maxAge: '1d',
        etag: true,
        lastModified: true
    }));
    
    // 原始数据解析
    app.use('/webhook', express.raw({ type: 'application/json' }));
    
    // 文本解析
    app.use('/text', express.text({ type: 'text/plain' }));
}

module.exports = setupBuiltinMiddleware;
```

## （二）第三方中间件

```javascript
// middleware/thirdparty.js
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

function setupThirdPartyMiddleware(app) {
    // 安全头部
    app.use(helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                styleSrc: ["'self'", "'unsafe-inline'"],
                scriptSrc: ["'self'"],
                imgSrc: ["'self'", "data:", "https:"]
            }
        },
        hsts: {
            maxAge: 31536000,
            includeSubDomains: true,
            preload: true
        }
    }));
    
    // CORS配置
    app.use(cors({
        origin: function(origin, callback) {
            const allowedOrigins = [
                'http://localhost:3000',
                'http://localhost:3001',
                'https://yourdomain.com'
            ];
            
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                callback(new Error('Not allowed by CORS'));
            }
        },
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization']
    }));
    
    // 请求日志
    app.use(morgan('combined', {
        skip: (req, res) => res.statusCode < 400
    }));
    
    app.use(morgan('dev', {
        skip: (req, res) => res.statusCode >= 400
    }));
    
    // 响应压缩
    app.use(compression({
        filter: (req, res) => {
            if (req.headers['x-no-compression']) {
                return false;
            }
            return compression.filter(req, res);
        },
        level: 6,
        threshold: 1024
    }));
    
    // 速率限制
    const limiter = rateLimit({
        windowMs: 15 * 60 * 1000, // 15分钟
        max: 100, // 限制每个IP 15分钟内最多100个请求
        message: {
            error: 'Too many requests from this IP, please try again later.'
        },
        standardHeaders: true,
        legacyHeaders: false
    });
    
    app.use('/api/', limiter);
    
    // API特定的更严格限制
    const apiLimiter = rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 50,
        message: {
            error: 'Too many API requests, please try again later.'
        }
    });
    
    app.use('/api/auth/', apiLimiter);
}

module.exports = setupThirdPartyMiddleware;
```

## （三）自定义中间件

```javascript
// middleware/custom.js

// 请求ID中间件
function requestId(req, res, next) {
    req.id = Math.random().toString(36).substr(2, 9);
    res.setHeader('X-Request-ID', req.id);
    next();
}

// 请求时间中间件
function requestTime(req, res, next) {
    req.requestTime = Date.now();
    next();
}

// 响应时间中间件
function responseTime(req, res, next) {
    const start = Date.now();
    
    res.on('finish', () => {
        const duration = Date.now() - start;
        res.setHeader('X-Response-Time', `${duration}ms`);
        console.log(`${req.method} ${req.path} - ${duration}ms`);
    });
    
    next();
}

// 认证中间件
function authenticate(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({
            error: 'Access token is required'
        });
    }
    
    try {
        // 这里应该验证JWT token
        // const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // req.user = decoded;
        
        // 模拟用户信息
        req.user = {
            id: 1,
            username: 'john_doe',
            email: 'john@example.com',
            role: 'user'
        };
        
        next();
    } catch (error) {
        return res.status(401).json({
            error: 'Invalid token'
        });
    }
}

// 权限检查中间件
function authorize(roles = []) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                error: 'Authentication required'
            });
        }
        
        if (roles.length && !roles.includes(req.user.role)) {
            return res.status(403).json({
                error: 'Insufficient permissions'
            });
        }
        
        next();
    };
}

// 输入验证中间件
function validateInput(schema) {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.body);
        
        if (error) {
            return res.status(400).json({
                error: 'Validation failed',
                details: error.details.map(detail => ({
                    field: detail.path.join('.'),
                    message: detail.message
                }))
            });
        }
        
        req.validatedBody = value;
        next();
    };
}

// 缓存中间件
function cache(duration = 300) {
    const cache = new Map();
    
    return (req, res, next) => {
        const key = req.originalUrl;
        const cached = cache.get(key);
        
        if (cached && Date.now() - cached.timestamp < duration * 1000) {
            res.setHeader('X-Cache', 'HIT');
            return res.json(cached.data);
        }
        
        res.setHeader('X-Cache', 'MISS');
        
        // 重写res.json方法来缓存响应
        const originalJson = res.json;
        res.json = function(data) {
            cache.set(key, {
                data,
                timestamp: Date.now()
            });
            
            // 清理过期缓存
            setTimeout(() => {
                cache.delete(key);
            }, duration * 1000);
            
            return originalJson.call(this, data);
        };
        
        next();
    };
}

// 错误处理中间件
function errorHandler(err, req, res, next) {
    console.error(`Error ${req.id}:`, err);
    
    // 默认错误状态码
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Internal Server Error';
    
    // 处理特定类型的错误
    if (err.name === 'ValidationError') {
        statusCode = 400;
        message = 'Validation Error';
    } else if (err.name === 'UnauthorizedError') {
        statusCode = 401;
        message = 'Unauthorized';
    } else if (err.name === 'CastError') {
        statusCode = 400;
        message = 'Invalid ID format';
    }
    
    res.status(statusCode).json({
        error: message,
        requestId: req.id,
        timestamp: new Date().toISOString(),
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
}

// 404处理中间件
function notFound(req, res) {
    res.status(404).json({
        error: 'Route not found',
        path: req.path,
        method: req.method,
        timestamp: new Date().toISOString()
    });
}

module.exports = {
    requestId,
    requestTime,
    responseTime,
    authenticate,
    authorize,
    validateInput,
    cache,
    errorHandler,
    notFound
};
```

## 四、数据库集成

## （一）MongoDB集成（Mongoose）

```javascript
// models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Username is required'],
        unique: true,
        trim: true,
        minlength: [3, 'Username must be at least 3 characters'],
        maxlength: [30, 'Username cannot exceed 30 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters']
    },
    profile: {
        firstName: String,
        lastName: String,
        avatar: String,
        bio: String
    },
    role: {
        type: String,
        enum: ['user', 'admin', 'moderator'],
        default: 'user'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    lastLogin: Date,
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true,
    toJSON: {
        transform: function(doc, ret) {
            delete ret.password;
            return ret;
        }
    }
});

// 密码加密中间件
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    try {
        const salt = await bcrypt.genSalt(12);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// 密码验证方法
userSchema.methods.comparePassword = async function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

// 获取公开信息
userSchema.methods.getPublicProfile = function() {
    return {
        id: this._id,
        username: this.username,
        email: this.email,
        profile: this.profile,
        role: this.role,
        createdAt: this.createdAt
    };
};

// 静态方法：查找活跃用户
userSchema.statics.findActiveUsers = function() {
    return this.find({ isActive: true }).select('-password');
};

// 索引
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ createdAt: -1 });

module.exports = mongoose.model('User', userSchema);
```

## （二）数据库连接配置

```javascript
// config/database.js
const mongoose = require('mongoose');

class Database {
    constructor() {
        this.connection = null;
    }
    
    async connect() {
        try {
            const options = {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                maxPoolSize: 10,
                serverSelectionTimeoutMS: 5000,
                socketTimeoutMS: 45000,
                bufferCommands: false,
                bufferMaxEntries: 0
            };
            
            this.connection = await mongoose.connect(
                process.env.MONGODB_URI || 'mongodb://localhost:27017/express-app',
                options
            );
            
            console.log('MongoDB connected successfully');
            
            // 监听连接事件
            mongoose.connection.on('error', (err) => {
                console.error('MongoDB connection error:', err);
            });
            
            mongoose.connection.on('disconnected', () => {
                console.log('MongoDB disconnected');
            });
            
            // 优雅关闭
            process.on('SIGINT', async () => {
                await this.disconnect();
                process.exit(0);
            });
            
        } catch (error) {
            console.error('MongoDB connection failed:', error);
            process.exit(1);
        }
    }
    
    async disconnect() {
        if (this.connection) {
            await mongoose.connection.close();
            console.log('MongoDB connection closed');
        }
    }
    
    getConnection() {
        return this.connection;
    }
}

module.exports = new Database();
```

## （三）CRUD操作

```javascript
// controllers/userController.js
const User = require('../models/User');
const { validationResult } = require('express-validator');

class UserController {
    // 获取所有用户
    static async getAllUsers(req, res, next) {
        try {
            const { page = 1, limit = 10, search, role } = req.query;
            const skip = (page - 1) * limit;
            
            // 构建查询条件
            const query = { isActive: true };
            
            if (search) {
                query.$or = [
                    { username: { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } },
                    { 'profile.firstName': { $regex: search, $options: 'i' } },
                    { 'profile.lastName': { $regex: search, $options: 'i' } }
                ];
            }
            
            if (role) {
                query.role = role;
            }
            
            // 执行查询
            const [users, total] = await Promise.all([
                User.find(query)
                    .select('-password')
                    .sort({ createdAt: -1 })
                    .skip(skip)
                    .limit(parseInt(limit)),
                User.countDocuments(query)
            ]);
            
            res.json({
                users,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit)
                }
            });
        } catch (error) {
            next(error);
        }
    }
    
    // 获取单个用户
    static async getUserById(req, res, next) {
        try {
            const { id } = req.params;
            
            const user = await User.findById(id).select('-password');
            
            if (!user) {
                return res.status(404).json({
                    error: 'User not found'
                });
            }
            
            res.json({ user });
        } catch (error) {
            next(error);
        }
    }
    
    // 创建用户
    static async createUser(req, res, next) {
        try {
            // 验证输入
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    error: 'Validation failed',
                    details: errors.array()
                });
            }
            
            const userData = req.body;
            
            // 检查用户是否已存在
            const existingUser = await User.findOne({
                $or: [
                    { email: userData.email },
                    { username: userData.username }
                ]
            });
            
            if (existingUser) {
                return res.status(409).json({
                    error: 'User already exists with this email or username'
                });
            }
            
            // 创建新用户
            const user = new User(userData);
            await user.save();
            
            res.status(201).json({
                message: 'User created successfully',
                user: user.getPublicProfile()
            });
        } catch (error) {
            next(error);
        }
    }
    
    // 更新用户
    static async updateUser(req, res, next) {
        try {
            const { id } = req.params;
            const updates = req.body;
            
            // 移除不允许更新的字段
            delete updates.password;
            delete updates._id;
            delete updates.createdAt;
            
            const user = await User.findByIdAndUpdate(
                id,
                { ...updates, updatedAt: new Date() },
                { new: true, runValidators: true }
            ).select('-password');
            
            if (!user) {
                return res.status(404).json({
                    error: 'User not found'
                });
            }
            
            res.json({
                message: 'User updated successfully',
                user
            });
        } catch (error) {
            next(error);
        }
    }
    
    // 删除用户（软删除）
    static async deleteUser(req, res, next) {
        try {
            const { id } = req.params;
            
            const user = await User.findByIdAndUpdate(
                id,
                { isActive: false, updatedAt: new Date() },
                { new: true }
            );
            
            if (!user) {
                return res.status(404).json({
                    error: 'User not found'
                });
            }
            
            res.json({
                message: 'User deleted successfully'
            });
        } catch (error) {
            next(error);
        }
    }
    
    // 获取用户统计
    static async getUserStats(req, res, next) {
        try {
            const stats = await User.aggregate([
                {
                    $group: {
                        _id: null,
                        totalUsers: { $sum: 1 },
                        activeUsers: {
                            $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] }
                        },
                        adminUsers: {
                            $sum: { $cond: [{ $eq: ['$role', 'admin'] }, 1, 0] }
                        }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        totalUsers: 1,
                        activeUsers: 1,
                        adminUsers: 1,
                        inactiveUsers: { $subtract: ['$totalUsers', '$activeUsers'] }
                    }
                }
            ]);
            
            res.json({
                stats: stats[0] || {
                    totalUsers: 0,
                    activeUsers: 0,
                    adminUsers: 0,
                    inactiveUsers: 0
                }
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = UserController;
```

# 五、认证与授权

## （一）JWT认证实现

```javascript
// utils/jwt.js
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

class JWTService {
    constructor() {
        this.accessTokenSecret = process.env.JWT_ACCESS_SECRET || 'access-secret';
        this.refreshTokenSecret = process.env.JWT_REFRESH_SECRET || 'refresh-secret';
        this.accessTokenExpiry = process.env.JWT_ACCESS_EXPIRY || '15m';
        this.refreshTokenExpiry = process.env.JWT_REFRESH_EXPIRY || '7d';
    }
    
    // 生成访问令牌
    generateAccessToken(payload) {
        return jwt.sign(payload, this.accessTokenSecret, {
            expiresIn: this.accessTokenExpiry,
            issuer: 'express-app',
            audience: 'express-app-users'
        });
    }
    
    // 生成刷新令牌
    generateRefreshToken(payload) {
        return jwt.sign(payload, this.refreshTokenSecret, {
            expiresIn: this.refreshTokenExpiry,
            issuer: 'express-app',
            audience: 'express-app-users'
        });
    }
    
    // 验证访问令牌
    verifyAccessToken(token) {
        try {
            return jwt.verify(token, this.accessTokenSecret);
        } catch (error) {
            throw new Error('Invalid access token');
        }
    }
    
    // 验证刷新令牌
    verifyRefreshToken(token) {
        try {
            return jwt.verify(token, this.refreshTokenSecret);
        } catch (error) {
            throw new Error('Invalid refresh token');
        }
    }
    
    // 生成令牌对
    generateTokenPair(payload) {
        const accessToken = this.generateAccessToken(payload);
        const refreshToken = this.generateRefreshToken(payload);
        
        return {
            accessToken,
            refreshToken,
            expiresIn: this.accessTokenExpiry
        };
    }
    
    // 从令牌中提取载荷
    decodeToken(token) {
        return jwt.decode(token);
    }
}

module.exports = new JWTService();
```

## （二）认证控制器

```javascript
// controllers/authController.js
const User = require('../models/User');
const JWTService = require('../utils/jwt');
const { validationResult } = require('express-validator');
const crypto = require('crypto');

// 存储刷新令牌（生产环境应使用Redis）
const refreshTokens = new Set();

class AuthController {
    // 用户注册
    static async register(req, res, next) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    error: 'Validation failed',
                    details: errors.array()
                });
            }
            
            const { username, email, password, profile } = req.body;
            
            // 检查用户是否已存在
            const existingUser = await User.findOne({
                $or: [{ email }, { username }]
            });
            
            if (existingUser) {
                return res.status(409).json({
                    error: 'User already exists with this email or username'
                });
            }
            
            // 创建新用户
            const user = new User({
                username,
                email,
                password,
                profile
            });
            
            await user.save();
            
            // 生成令牌
            const tokenPayload = {
                userId: user._id,
                username: user.username,
                email: user.email,
                role: user.role
            };
            
            const tokens = JWTService.generateTokenPair(tokenPayload);
            refreshTokens.add(tokens.refreshToken);
            
            res.status(201).json({
                message: 'User registered successfully',
                user: user.getPublicProfile(),
                tokens
            });
        } catch (error) {
            next(error);
        }
    }
    
    // 用户登录
    static async login(req, res, next) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    error: 'Validation failed',
                    details: errors.array()
                });
            }
            
            const { email, password } = req.body;
            
            // 查找用户
            const user = await User.findOne({ email, isActive: true });
            if (!user) {
                return res.status(401).json({
                    error: 'Invalid credentials'
                });
            }
            
            // 验证密码
            const isPasswordValid = await user.comparePassword(password);
            if (!isPasswordValid) {
                return res.status(401).json({
                    error: 'Invalid credentials'
                });
            }
            
            // 更新最后登录时间
            user.lastLogin = new Date();
            await user.save();
            
            // 生成令牌
            const tokenPayload = {
                userId: user._id,
                username: user.username,
                email: user.email,
                role: user.role
            };
            
            const tokens = JWTService.generateTokenPair(tokenPayload);
            refreshTokens.add(tokens.refreshToken);
            
            res.json({
                message: 'Login successful',
                user: user.getPublicProfile(),
                tokens
            });
        } catch (error) {
            next(error);
        }
    }
    
    // 刷新令牌
    static async refreshToken(req, res, next) {
        try {
            const { refreshToken } = req.body;
            
            if (!refreshToken) {
                return res.status(401).json({
                    error: 'Refresh token is required'
                });
            }
            
            if (!refreshTokens.has(refreshToken)) {
                return res.status(403).json({
                    error: 'Invalid refresh token'
                });
            }
            
            try {
                const decoded = JWTService.verifyRefreshToken(refreshToken);
                
                // 验证用户是否仍然存在且活跃
                const user = await User.findById(decoded.userId);
                if (!user || !user.isActive) {
                    refreshTokens.delete(refreshToken);
                    return res.status(403).json({
                        error: 'User not found or inactive'
                    });
                }
                
                // 生成新的令牌对
                const tokenPayload = {
                    userId: user._id,
                    username: user.username,
                    email: user.email,
                    role: user.role
                };
                
                const newTokens = JWTService.generateTokenPair(tokenPayload);
                
                // 移除旧的刷新令牌，添加新的
                refreshTokens.delete(refreshToken);
                refreshTokens.add(newTokens.refreshToken);
                
                res.json({
                    message: 'Token refreshed successfully',
                    tokens: newTokens
                });
            } catch (error) {
                refreshTokens.delete(refreshToken);
                return res.status(403).json({
                    error: 'Invalid refresh token'
                });
            }
        } catch (error) {
            next(error);
        }
    }
    
    // 用户登出
    static async logout(req, res, next) {
        try {
            const { refreshToken } = req.body;
            
            if (refreshToken) {
                refreshTokens.delete(refreshToken);
            }
            
            res.json({
                message: 'Logout successful'
            });
        } catch (error) {
            next(error);
        }
    }
    
    // 获取当前用户信息
    static async getProfile(req, res, next) {
        try {
            const user = await User.findById(req.user.userId).select('-password');
            
            if (!user) {
                return res.status(404).json({
                    error: 'User not found'
                });
            }
            
            res.json({
                user: user.getPublicProfile()
            });
        } catch (error) {
            next(error);
        }
    }
    
    // 更新用户资料
    static async updateProfile(req, res, next) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    error: 'Validation failed',
                    details: errors.array()
                });
            }
            
            const { profile } = req.body;
            
            const user = await User.findByIdAndUpdate(
                req.user.userId,
                { profile, updatedAt: new Date() },
                { new: true, runValidators: true }
            ).select('-password');
            
            if (!user) {
                return res.status(404).json({
                    error: 'User not found'
                });
            }
            
            res.json({
                message: 'Profile updated successfully',
                user: user.getPublicProfile()
            });
        } catch (error) {
            next(error);
        }
    }
    
    // 修改密码
    static async changePassword(req, res, next) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    error: 'Validation failed',
                    details: errors.array()
                });
            }
            
            const { currentPassword, newPassword } = req.body;
            
            const user = await User.findById(req.user.userId);
            if (!user) {
                return res.status(404).json({
                    error: 'User not found'
                });
            }
            
            // 验证当前密码
            const isCurrentPasswordValid = await user.comparePassword(currentPassword);
            if (!isCurrentPasswordValid) {
                return res.status(400).json({
                    error: 'Current password is incorrect'
                });
            }
            
            // 更新密码
            user.password = newPassword;
            await user.save();
            
            res.json({
                message: 'Password changed successfully'
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = AuthController;
```