---
title: 【数据库】MongoDB详解：NoSQL文档数据库的领导者
date: 2025-07-17 15:25:00
tags: [数据库, MongoDB, NoSQL, 文档数据库, 后端开发]
categories: 数据库
---

## 什么是MongoDB？

MongoDB是一个基于分布式文件存储的NoSQL数据库，由C++语言编写。它采用文档存储模型，将数据存储为类似JSON的BSON格式，具有高性能、高可用性和易扩展的特点。

## 核心概念

### 1. 文档（Document）
- MongoDB的基本数据单元
- 类似JSON的BSON格式
- 支持嵌套文档和数组
- 动态模式，无需预定义结构

### 2. 集合（Collection）
- 文档的容器
- 类似关系型数据库中的表
- 不需要预定义模式
- 可以存储不同结构的文档

### 3. 数据库（Database）
- 集合的容器
- 一个MongoDB实例可以包含多个数据库

## 数据模型示例

### 文档结构
```json
{
  "_id": ObjectId("507f1f77bcf86cd799439011"),
  "username": "john_doe",
  "email": "john@example.com",
  "profile": {
    "firstName": "John",
    "lastName": "Doe",
    "age": 30,
    "address": {
      "street": "123 Main St",
      "city": "New York",
      "state": "NY",
      "zipcode": "10001"
    }
  },
  "tags": ["developer", "mongodb", "nodejs"],
  "createdAt": ISODate("2024-01-15T10:00:00Z"),
  "updatedAt": ISODate("2024-01-15T10:00:00Z")
}
```

## 基本操作

### 连接数据库
```javascript
// 使用MongoDB Shell
mongo mongodb://localhost:27017/mydb

// 使用Node.js
const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri);
```

### 数据库操作
```javascript
// 创建/切换数据库
use mydb

// 查看所有数据库
show dbs

// 查看当前数据库
db

// 删除数据库
db.dropDatabase()
```

### 集合操作
```javascript
// 创建集合
db.createCollection("users")

// 查看所有集合
show collections

// 删除集合
db.users.drop()
```

### 文档操作（CRUD）

#### 创建（Create）
```javascript
// 插入单个文档
db.users.insertOne({
  username: "alice",
  email: "alice@example.com",
  age: 25,
  createdAt: new Date()
})

// 插入多个文档
db.users.insertMany([
  { username: "bob", email: "bob@example.com", age: 30 },
  { username: "charlie", email: "charlie@example.com", age: 35 }
])
```

#### 读取（Read）
```javascript
// 查询所有文档
db.users.find()

// 条件查询
db.users.find({ age: { $gt: 25 } })

// 投影查询（只返回指定字段）
db.users.find({}, { username: 1, email: 1 })

// 排序
db.users.find().sort({ age: -1 })

// 分页
db.users.find().skip(10).limit(5)

// 计数
db.users.countDocuments({ age: { $gte: 25 } })
```

#### 更新（Update）
```javascript
// 更新单个文档
db.users.updateOne(
  { username: "alice" },
  { $set: { age: 26, updatedAt: new Date() } }
)

// 更新多个文档
db.users.updateMany(
  { age: { $lt: 30 } },
  { $set: { status: "young" } }
)

// 使用upsert（如果不存在则创建）
db.users.updateOne(
  { username: "david" },
  { $set: { email: "david@example.com", age: 28 } },
  { upsert: true }
)
```

#### 删除（Delete）
```javascript
// 删除单个文档
db.users.deleteOne({ username: "alice" })

// 删除多个文档
db.users.deleteMany({ age: { $lt: 18 } })
```

## 查询操作符

### 比较操作符
```javascript
// 等于
db.users.find({ age: 25 })

// 不等于
db.users.find({ age: { $ne: 25 } })

// 大于
db.users.find({ age: { $gt: 25 } })

// 大于等于
db.users.find({ age: { $gte: 25 } })

// 小于
db.users.find({ age: { $lt: 25 } })

// 小于等于
db.users.find({ age: { $lte: 25 } })

// 在范围内
db.users.find({ age: { $in: [25, 30, 35] } })

// 不在范围内
db.users.find({ age: { $nin: [25, 30, 35] } })
```

### 逻辑操作符
```javascript
// AND条件
db.users.find({ age: { $gte: 25 }, status: "active" })

// OR条件
db.users.find({
  $or: [
    { age: { $lt: 25 } },
    { status: "premium" }
  ]
})

// NOT条件
db.users.find({ age: { $not: { $gt: 25 } } })
```

### 数组操作符
```javascript
// 包含特定元素
db.users.find({ tags: "developer" })

// 包含所有指定元素
db.users.find({ tags: { $all: ["developer", "mongodb"] } })

// 数组大小
db.users.find({ tags: { $size: 3 } })

// 数组切片
db.users.find({ tags: { $slice: 2 } })
```

## 索引

### 创建索引
```javascript
// 单字段索引
db.users.createIndex({ username: 1 })

// 复合索引
db.users.createIndex({ username: 1, email: 1 })

// 唯一索引
db.users.createIndex({ email: 1 }, { unique: true })

// 文本索引
db.users.createIndex({ description: "text" })

// 查看索引
db.users.getIndexes()
```

### 索引类型
- **单字段索引**：单个字段的索引
- **复合索引**：多个字段的组合索引
- **多键索引**：数组字段的索引
- **文本索引**：全文搜索索引
- **地理空间索引**：地理位置数据索引

## 聚合管道

### 基本聚合
```javascript
// 统计每个年龄段的用户数量
db.users.aggregate([
  {
    $group: {
      _id: "$age",
      count: { $sum: 1 }
    }
  },
  {
    $sort: { _id: 1 }
  }
])
```

### 复杂聚合
```javascript
// 计算用户的平均订单金额
db.orders.aggregate([
  {
    $lookup: {
      from: "users",
      localField: "userId",
      foreignField: "_id",
      as: "user"
    }
  },
  {
    $unwind: "$user"
  },
  {
    $group: {
      _id: "$user.username",
      avgOrderAmount: { $avg: "$amount" },
      totalOrders: { $sum: 1 }
    }
  },
  {
    $sort: { avgOrderAmount: -1 }
  }
])
```

## 数据验证

### 模式验证
```javascript
// 创建带验证的集合
db.createCollection("users", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["username", "email"],
      properties: {
        username: {
          bsonType: "string",
          description: "必须是字符串"
        },
        email: {
          bsonType: "string",
          pattern: "^.+@.+$",
          description: "必须是有效的邮箱格式"
        },
        age: {
          bsonType: "int",
          minimum: 0,
          maximum: 150,
          description: "必须是0-150之间的整数"
        }
      }
    }
  }
})
```

## 复制集（Replica Set）

### 配置复制集
```javascript
// 启动三个mongod实例
mongod --replSet rs0 --port 27017 --dbpath /data/db1
mongod --replSet rs0 --port 27018 --dbpath /data/db2
mongod --replSet rs0 --port 27019 --dbpath /data/db3

// 初始化复制集
rs.initiate({
  _id: "rs0",
  members: [
    { _id: 0, host: "localhost:27017" },
    { _id: 1, host: "localhost:27018" },
    { _id: 2, host: "localhost:27019" }
  ]
})
```

## 分片（Sharding）

### 分片集群架构
- **mongos**：查询路由器
- **config servers**：配置服务器
- **shards**：分片服务器

### 启用分片
```javascript
// 连接到mongos
mongos --configdb configReplSet/cfg1.example.net:27019,cfg2.example.net:27019,cfg3.example.net:27019

// 添加分片
sh.addShard("shard1.example.net:27018")
sh.addShard("shard2.example.net:27018")

// 对数据库启用分片
sh.enableSharding("mydb")

// 对集合分片
sh.shardCollection("mydb.users", { username: "hashed" })
```

## 性能优化

### 1. 索引优化
- 为查询频繁的字段创建索引
- 使用复合索引优化多字段查询
- 避免索引选择性低的字段

### 2. 查询优化
- 使用投影减少返回字段
- 使用limit限制结果集
- 避免全表扫描

### 3. 连接优化
- 使用连接池
- 合理设置连接超时时间
- 监控连接数

## 常用工具

### 1. MongoDB Compass
- 官方GUI管理工具
- 可视化查询和索引管理

### 2. Robo 3T
- 轻量级MongoDB管理工具
- 支持Shell命令

### 3. 命令行工具
- **mongo**：交互式Shell
- **mongodump**：备份工具
- **mongorestore**：恢复工具

## 与Node.js集成

### 使用Mongoose
```javascript
const mongoose = require('mongoose');

// 连接数据库
mongoose.connect('mongodb://localhost:27017/mydb');

// 定义模式
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  age: { type: Number, min: 0, max: 150 },
  createdAt: { type: Date, default: Date.now }
});

// 创建模型
const User = mongoose.model('User', userSchema);

// 使用模型
const newUser = new User({
  username: 'testuser',
  email: 'test@example.com',
  age: 25
});

newUser.save()
  .then(user => console.log('User saved:', user))
  .catch(err => console.error(err));
```

## 常见应用场景

1. **内容管理系统**：文章、评论、用户管理
2. **实时分析**：日志收集、用户行为分析
3. **物联网**：设备数据存储、传感器数据
4. **移动应用**：用户数据、消息推送
5. **电商平台**：商品目录、订单管理

## 优缺点分析

### 优点
- 灵活的文档模型
- 高性能和可扩展性
- 丰富的查询语言
- 自动分片和复制
- 活跃的开源社区

### 缺点
- 不支持复杂事务
- 内存占用较高
- 缺乏成熟的DBA工具
- 数据一致性较弱

## 学习资源推荐

- **官方文档**：https://docs.mongodb.com/
- **在线课程**：MongoDB University
- **书籍**：《MongoDB权威指南》、《MongoDB实战》
- **实践项目**：构建博客系统、实时聊天应用

## 总结

MongoDB作为NoSQL数据库的领导者，凭借其灵活的文档模型、高性能和易扩展性，在现代Web开发中占据重要地位。特别适合处理非结构化数据和需要快速迭代的应用场景。对于需要处理大量数据和高并发访问的现代应用，MongoDB是一个值得考虑的选择。
