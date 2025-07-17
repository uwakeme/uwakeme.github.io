---
title: 【数据库】MongoDB学习笔记
categories: 数据库
tags:
  - MongoDB
  - NoSQL
  - 数据库
  - 后端
---

# 前言

在现代的Web应用和大数据时代，对数据存储和管理的需求日益多样化和复杂化。传统的关系型数据库在某些场景下可能显得力不从心，而非关系型数据库（NoSQL）则因其灵活性、可扩展性和高性能等特点受到了广泛关注。MongoDB作为NoSQL数据库中的佼佼者，凭借其面向文档的存储方式、丰富的功能和强大的社区支持，成为了众多开发者的首选。本文旨在详细介绍MongoDB的基础知识、核心特性、安装使用及常见操作，帮助读者快速入门并掌握MongoDB的应用。

# 一、MongoDB 基本概念

MongoDB 是一个基于分布式文件存储的数据库，由 C++ 语言编写，旨在为WEB应用提供可扩展的高性能数据存储解决方案。它介于关系数据库和非关系数据库之间，是非关系数据库当中功能最丰富，最像关系数据库的。

## （一）文档数据库

MongoDB中的记录是一个**文档 (Document)**，它是由字段 (Field) 和值 (Value) 对组成的数据结构，类似于JSON对象。字段的值可以包含其他文档、数组以及文档数组。

使用文档的优点是：
1.  **对应编程语言原生数据类型**：文档结构与许多编程语言中的原生数据类型（如对象、字典）非常相似，便于开发者理解和操作。
2.  **减少连接操作**：嵌入式文档和数组的设计可以减少传统关系数据库中昂贵的JOIN操作，提高查询效率。
3.  **动态模式 (Dynamic Schema)**：集合中的文档不需要具有相同的字段集，这种灵活性使得数据模型的迭代更加容易。

## （二）集合 (Collection)

MongoDB将文档存储在**集合 (Collection)** 中。集合类似于关系数据库中的表。与表不同的是，集合不强制要求其文档具有相同的结构。

## （三）BSON (Binary JSON)

MongoDB在磁盘上以BSON（Binary JSON）的格式存储数据。BSON是一种二进制序列化的格式，用于在MongoDB中存储文档和进行远程过程调用。

BSON的优势：
1.  **更丰富的数据类型**：BSON扩展了JSON的数据类型，支持如日期 (Date)、二进制数据 (BinData)、对象ID (ObjectId)、正则表达式等。
2.  **高效的序列化/反序列化**：二进制编码允许快速解析，尤其适合大规模数据操作。
3.  **可遍历性**：BSON文档包含长度前缀等元数据，便于快速跳过无关字段，提升查询效率。

# 二、MongoDB 主要特性

## （一）高性能

MongoDB 提供高性能的数据持久化。
1.  **嵌入式数据模型**：支持嵌入式数据模型减少了数据库系统上的I/O活动。
2.  **索引支持**：索引支持更快的查询，并且可以包含嵌入式文档和数组的键。例如，文本索引解决搜索需求，TTL索引解决历史数据自动过期需求，地理位置索引可用于构建O2O应用。

## （二）高可用性

MongoDB的复制工具称为**副本集 (Replica Set)**，它提供自动故障转移和数据冗余。副本集是一组MongoDB服务器，它们维护相同的数据集，提供冗余并提高数据可用性。

## （三）高可扩展性 (水平扩展)

MongoDB提供横向可扩展性。**分片 (Sharding)** 会将数据分布在机器集群上。通过分片，MongoDB可以将大型数据集分布在多个服务器上，从而提高读写吞吐量和存储容量。

## （四）丰富的查询语言

MongoDB支持丰富的查询语言，支持读写操作 (CRUD)，以及数据聚合、文本搜索和地理空间查询等高级功能。

## （五）灵活的数据模型 (无模式)

MongoDB的文档型数据模型意味着集合中的文档可以有不同的字段和结构。这种灵活性使得应用开发更加敏捷，能够快速适应需求变化。

## （六）支持多种存储引擎

MongoDB支持多种存储引擎，如WiredTiger存储引擎（默认）和In-Memory存储引擎，以满足不同场景的需求。

# 三、安装与连接

MongoDB 提供了多种安装方式，包括在不同操作系统（Windows, Linux, macOS）上安装社区版或企业版，以及使用Docker进行安装。

## （一）Windows 安装示例 (社区版)

1.  **下载**：从MongoDB官网下载适用于Windows的社区版安装包 (通常是 `.msi` 或 `.zip` 文件)。
2.  **安装/解压**：
    *   如果是 `.msi` 文件，直接运行安装程序，按照提示完成安装。安装过程中可以选择 "Complete" (完整安装) 或 "Custom" (自定义安装)。建议选择自定义安装，以便指定安装路径和数据存储路径。
    *   如果是 `.zip` 文件，解压到指定目录，例如 `D:\MongoDB`。
3.  **配置数据和日志目录**：在MongoDB安装目录下创建 `data` 目录用于存放数据文件，创建 `logs` 目录用于存放日志文件，并在 `logs` 目录下创建一个日志文件，例如 `mongodb.log`。
4.  **安装为服务 (可选但推荐)**：以管理员身份打开命令提示符或PowerShell，进入MongoDB安装目录下的 `bin` 目录，执行以下命令将MongoDB安装为Windows服务：
    ```shell
    mongod --install --dbpath "D:\MongoDB\data" --logpath "D:\MongoDB\logs\mongodb.log"
    ```
    *   `--dbpath` 指定数据存储目录。
    *   `--logpath` 指定日志文件路径。
5.  **启动服务**：
    ```shell
    net start MongoDB
    ```
6.  **连接MongoDB**：打开新的命令提示符或PowerShell，进入MongoDB安装目录下的 `bin` 目录，执行 `mongo` 或 `mongosh` (新版shell) 命令即可连接到本地MongoDB服务 (默认端口27017)。
    ```shell
    mongo
    # 或者
    mongosh
    ```
    退出shell可以输入 `exit`。

## （二）Linux 安装示例 (以CentOS为例)

1.  **配置包管理系统 (yum)**：创建 `/etc/yum.repos.d/mongodb-org-7.0.repo` 文件 (版本号可能不同，请参考官方文档)，并添加MongoDB的yum仓库信息。
2.  **安装MongoDB**：
    ```shell
    sudo yum install -y mongodb-org
    ```
3.  **启动MongoDB服务**：
    ```shell
    sudo systemctl start mongod
    ```
4.  **设置开机自启 (可选)**：
    ```shell
    sudo systemctl enable mongod
    ```
5.  **验证MongoDB状态**：
    ```shell
    sudo systemctl status mongod
    ```
6.  **连接MongoDB**：
    ```shell
    mongosh
    ```

## （三）MongoDB Compass (图形化界面工具)

MongoDB Compass 是官方提供的图形化界面工具，可以方便地浏览数据、执行查询、分析性能等。可以从MongoDB官网下载并安装。连接时，默认连接到 `localhost:27017`。

# 四、MongoDB 基本操作 (CRUD)

MongoDB的核心操作包括创建 (Create)、读取 (Read)、更新 (Update) 和删除 (Delete) 文档。

## （一）数据库操作

1.  **查看所有数据库**:
    ```shell
    show dbs
    # 或者
    show databases
    ```
2.  **选择/创建数据库**:
    ```shell
    use <database_name>
    ```
    如果指定的数据库不存在，MongoDB不会立即创建它。只有当向该数据库中插入第一条数据时，数据库才会被真正创建。
3.  **查看当前数据库**:
    ```shell
    db
    ```
4.  **删除当前数据库**:
    ```shell
    db.dropDatabase()
    ```

## （二）集合操作

1.  **查看当前数据库中的所有集合**:
    ```shell
    show collections
    ```
2.  **创建集合**:
    ```shell
    db.createCollection("mycollection")
    ```
    通常情况下，不需要显式创建集合。当向一个不存在的集合中插入第一条文档时，MongoDB会自动创建该集合。
3.  **删除集合**:
    ```shell
    db.mycollection.drop()
    ```

## （三）文档操作 - 增 (Create)

1.  **插入单个文档**:
    ```javascript
    // db.collection_name.insertOne({document})
    db.users.insertOne({ name: "Alice", age: 30, city: "New York" })
    ```
2.  **插入多个文档**:
    ```javascript
    // db.collection_name.insertMany([{document1}, {document2}, ...])
    db.users.insertMany([
      { name: "Bob", age: 25, city: "London" },
      { name: "Charlie", age: 35, city: "Paris", occupation: "Engineer" }
    ])
    ```
    MongoDB会自动为每个文档添加一个唯一的 `_id` 字段，如果插入时没有指定。可以自定义 `_id`，但必须保证其唯一性。

## （四）文档操作 - 查 (Read)

1.  **查询所有文档**:
    ```javascript
    // db.collection_name.find({}) 或 db.collection_name.find()
    db.users.find({})
    ```
    使用 `.pretty()` 可以格式化输出结果：
    ```javascript
    db.users.find({}).pretty()
    ```
2.  **按条件查询**:
    ```javascript
    // 查询年龄为30的用户
    db.users.find({ age: 30 })

    // 查询年龄大于25的用户
    // $gt: 大于, $gte: 大于等于, $lt: 小于, $lte: 小于等于, $ne: 不等于, $in: 包含于, $nin: 不包含于
    db.users.find({ age: { $gt: 25 } })

    // 查询城市为 "New York" 且年龄小于等于 30 的用户
    db.users.find({ city: "New York", age: { $lte: 30 } })

    // 查询城市为 "London" 或 "Paris" 的用户
    db.users.find({ city: { $in: ["London", "Paris"] } })
    ```
3.  **查询指定字段**:
    ```javascript
    // 只显示 name 和 city 字段，_id 默认显示
    db.users.find({}, { name: 1, city: 1 })

    // 不显示 age 字段，其他字段都显示（包括_id）
    db.users.find({}, { age: 0 })

    // 只显示 name 和 city 字段，不显示 _id
    db.users.find({}, { name: 1, city: 1, _id: 0 })
    ```
4.  **查询单个文档**:
    ```javascript
    // db.collection_name.findOne(query_criteria, projection)
    db.users.findOne({ name: "Alice" })
    ```
    `findOne` 只返回匹配到的第一个文档。

## （五）文档操作 - 改 (Update)

1.  **更新单个文档**:
    ```javascript
    // db.collection_name.updateOne(filter, update, options)
    // 将名为 Alice 的用户的年龄更新为 31
    db.users.updateOne({ name: "Alice" }, { $set: { age: 31 } })

    // 如果匹配到多个文档，只更新第一个。
    // $set 操作符用于指定要修改的字段和值。如果字段不存在，则会创建它。
    // 其他常用更新操作符：
    // $inc: 对数字字段进行增减
    // $rename: 重命名字段
    // $unset: 删除字段
    // $push:向数组字段添加元素
    // $pull: 从数组字段移除元素
    ```
2.  **更新多个文档**:
    ```javascript
    // db.collection_name.updateMany(filter, update, options)
    // 将所有城市为 "New York" 的用户的 city 更新为 "NYC"
    db.users.updateMany({ city: "New York" }, { $set: { city: "NYC" } })
    ```
3.  **替换整个文档**:
    ```javascript
    // 除非使用更新操作符，否则 update 方法会用新文档替换匹配到的文档
    db.users.updateOne({ name: "Bob" }, { name: "Robert", age: 26, city: "Manchester" })
    // 注意：这种方式如果新文档中没有包含旧文档的某些字段，这些字段会丢失。_id 字段不能被替换。
    ```
4.  **Upsert 操作 (更新或插入)**:
    如果希望在没有文档匹配筛选条件时插入一个新文档，可以使用 `upsert: true` 选项。
    ```javascript
    db.users.updateOne(
      { name: "David" },
      { $set: { age: 40, city: "Berlin" } },
      { upsert: true }
    )
    // 如果名为 David 的用户存在，则更新；如果不存在，则插入新文档。
    ```

## （六）文档操作 - 删 (Delete)

1.  **删除单个文档**:
    ```javascript
    // db.collection_name.deleteOne(filter)
    // 删除名为 Charlie 的用户
    db.users.deleteOne({ name: "Charlie" })
    // 如果匹配到多个文档，只删除第一个。
    ```
2.  **删除多个文档**:
    ```javascript
    // db.collection_name.deleteMany(filter)
    // 删除所有年龄大于 30 的用户
    db.users.deleteMany({ age: { $gt: 30 } })
    ```
3.  **删除集合中所有文档**:
    ```javascript
    // db.collection_name.deleteMany({})
    db.users.deleteMany({}) // 慎用！会删除集合内所有文档，但集合本身及其索引结构依然存在。
    ```

## （七）排序与分页

1.  **排序 (sort)**:
    ```javascript
    // 按年龄升序排序 (1 表示升序, -1 表示降序)
    db.users.find().sort({ age: 1 })

    // 按年龄降序，姓名升序
    db.users.find().sort({ age: -1, name: 1 })
    ```
2.  **分页 (skip, limit)**:
    ```javascript
    // 跳过前5条文档，然后返回接下来的10条文档 (实现第二页，每页10条)
    db.users.find().skip(5).limit(10)

    // 统计文档数量
    db.users.countDocuments({ age: { $gt: 25 } }) // 推荐使用
    // db.users.find({ age: { $gt: 25 } }).count() // 旧版方法
    ```

# 五、索引 (Index)

索引是提高查询效率的关键。MongoDB支持多种类型的索引，包括单字段索引、复合索引、多键索引、文本索引、地理空间索引等。

## （一）索引基本概念

索引是一种特殊的数据结构，它以易于遍历的形式存储集合数据的小子集。索引存储特定字段或一组字段的值，按值的顺序排序。

**优点**：
*   显著提高查询性能。
*   支持排序操作。
*   确保字段的唯一性（唯一索引）。

**缺点**：
*   占用额外的磁盘空间。
*   在写入操作（插入、更新、删除）时需要额外的时间来维护索引，可能会降低写入性能。

## （二）创建索引

```javascript
// db.collection_name.createIndex({ field: type, ... }, { options })
// type: 1 表示升序, -1 表示降序

// 在 name 字段上创建升序索引
db.users.createIndex({ name: 1 })

// 在 age 字段上创建降序索引，并指定索引名称
db.users.createIndex({ age: -1 }, { name: "age_desc_idx" })

// 创建复合索引 (在 city 升序，age 降序)
db.users.createIndex({ city: 1, age: -1 })

// 创建唯一索引 (确保 name 字段的值是唯一的)
db.users.createIndex({ email: 1 }, { unique: true })

// 创建TTL索引 (Time-To-Live)，文档在特定时间后自动删除
// 假设 createdAt 字段存储文档创建时间，文档在1小时后过期
db.event_logs.createIndex({ createdAt: 1 }, { expireAfterSeconds: 3600 })
```

## （三）查看索引

```javascript
db.users.getIndexes()
```

## （四）删除索引

```javascript
// 删除指定名称的索引
db.users.dropIndex("age_desc_idx")

// 删除指定字段的索引 (如果名称未知，可以用字段定义)
db.users.dropIndex({ name: 1 })

// 删除所有非 _id 的索引
db.users.dropIndexes()
```

## （五）分析索引使用 (explain)

`explain()` 方法可以帮助分析查询的执行计划，了解查询是否以及如何使用了索引。
```javascript
db.users.find({ age: { $gt: 30 } }).explain("executionStats")
```
输出结果中的 `executionStats` 部分会显示查询的执行时间、扫描的文档数、是否使用了索引 (`IXSCAN` 表示索引扫描，`COLLSCAN` 表示全集合扫描)等信息。

# 六、聚合查询 (Aggregation Framework)

MongoDB的聚合框架是一种强大的数据处理管道，允许用户对集合中的文档进行复杂的转换和计算。聚合管道由一个或多个阶段 (Stage) 组成，每个阶段对输入的文档进行操作，并将结果传递给下一个阶段。

## （一）常用聚合阶段

1.  **`$match`**: 筛选文档，类似于 `find()` 中的查询条件。通常放在管道的早期以减少后续阶段处理的数据量。
2.  **`$group`**: 按指定的表达式对文档进行分组，并对每个组应用累加器表达式。
    *   `_id`: 分组的依据。
    *   累加器操作符：`$sum`, `$avg`, `$min`, `$max`, `$first`, `$last`, `$push` (将值添加到数组), `$addToSet` (将不重复的值添加到数组) 等。
3.  **`$project`**: 重塑文档，可以包含、排除或重命名字段，也可以计算新字段。
4.  **`$sort`**: 按指定字段对文档进行排序。
5.  **`$skip`**: 跳过指定数量的文档。
6.  **`$limit`**: 限制输出的文档数量。
7.  **`$unwind`**: 将数组字段中的每个元素拆分为单独的文档。
8.  **`$lookup`**: 执行左外连接 (left outer join) 到同一数据库中的另一个集合，以将"连接的"文档合并到输入文档中。

## （二）聚合查询示例

假设有一个 `orders` 集合，文档结构如下：
```json
{ "_id": 1, "item": "apple", "price": 5, "quantity": 2, "date": ISODate("2024-01-15") }
{ "_id": 2, "item": "banana", "price": 2, "quantity": 5, "date": ISODate("2024-01-16") }
{ "_id": 3, "item": "apple", "price": 5, "quantity": 10, "date": ISODate("2024-01-16") }
{ "_id": 4, "item": "orange", "price": 3, "quantity": 5, "date": ISODate("2024-01-15") }
{ "_id": 5, "item": "banana", "price": 2, "quantity": 10, "date": ISODate("2024-01-17") }
```

1.  **按商品名称分组，计算每种商品的总销售额和总销量**:
    ```javascript
    db.orders.aggregate([
      {
        $group: {
          _id: "$item", // 按 item 字段分组
          totalQuantity: { $sum: "$quantity" }, // 计算每个分组的 quantity 总和
          totalRevenue: { $sum: { $multiply: ["$price", "$quantity"] } } // 计算每个分组的 price * quantity 总和
        }
      },
      {
        $sort: { totalRevenue: -1 } // 按总销售额降序排序
      }
    ])
    ```
    输出示例：
    ```json
    [
      { "_id": "apple", "totalQuantity": 12, "totalRevenue": 60 },
      { "_id": "banana", "totalQuantity": 15, "totalRevenue": 30 },
      { "_id": "orange", "totalQuantity": 5, "totalRevenue": 15 }
    ]
    ```

2.  **筛选出2024年1月16日之后的订单，并计算这些订单的总金额**:
    ```javascript
    db.orders.aggregate([
      {
        $match: {
          date: { $gt: ISODate("2024-01-16T00:00:00Z") } // 筛选日期大于2024-01-16的订单
        }
      },
      {
        $group: {
          _id: null, // 不按任何字段分组，计算总和
          grandTotalRevenue: { $sum: { $multiply: ["$price", "$quantity"] } }
        }
      }
    ])
    ```

# 七、MongoDB 安全性

确保MongoDB部署的安全性至关重要。主要的安全措施包括：

## （一）认证 (Authentication)

启用认证可以确保只有授权用户才能访问数据库。MongoDB支持多种认证机制，最常见的是SCRAM (Salted Challenge Response Authentication Mechanism)。

1.  **创建管理员用户 (在 `admin` 数据库中)**:
    ```javascript
    use admin
    db.createUser({
      user: "myAdminUser",
      pwd: passwordPrompt(), // 或者直接输入密码字符串，但不推荐
      roles: [ { role: "userAdminAnyDatabase", db: "admin" }, "readWriteAnyDatabase" ]
    })
    ```
2.  **修改配置文件启用认证**:
    编辑MongoDB的配置文件 (通常是 `mongod.conf`)，添加或修改安全设置：
    ```yaml
    security:
      authorization: enabled
    ```
3.  **重启MongoDB服务**。
4.  **使用用户名和密码连接**:
    ```shell
    mongosh --port 27017 --authenticationDatabase "admin" -u "myAdminUser" -p
    ```

## （二）授权 (Authorization / Role-Based Access Control)

MongoDB使用基于角色的访问控制 (RBAC) 来管理用户权限。用户被授予角色，每个角色包含一组权限。

*   **内置角色**: MongoDB提供了多种内置角色，如 `read`, `readWrite`, `dbAdmin`, `userAdmin`, `root` 等。
*   **自定义角色**: 可以创建自定义角色以满足特定的权限需求。

## （三）网络安全

*   **绑定IP (Bind IP)**: 默认情况下，MongoDB可能只监听本地回环地址 (127.0.0.1)。在生产环境中，应配置 `net.bindIp` 以限制MongoDB实例监听的网络接口。
*   **防火墙**: 使用防火墙限制对MongoDB端口 (默认为27017) 的访问，只允许受信任的主机连接。
*   **TLS/SSL加密**: 配置TLS/SSL可以加密客户端与服务器之间的通信，以及副本集和分片集群成员之间的通信。

## （四）审计 (Auditing)

MongoDB企业版提供审计功能，可以记录数据库的各种操作，如认证尝试、DDL操作、CRUD操作等，用于安全分析和合规性检查。

# 八、MongoDB 应用场景

MongoDB的灵活性和可扩展性使其适用于多种应用场景：

1.  **内容管理系统 (CMS) 和博客平台**：存储文章、评论、用户信息等，动态模式非常适合内容的多样性。
2.  **实时分析和物联网 (IoT)**：处理大量传感器数据、日志数据，并进行实时分析。
3.  **移动应用后端**：存储用户数据、偏好设置、社交图谱等。
4.  **游戏应用**：存储玩家档案、游戏状态、排行榜等。
5.  **产品目录和电子商务**：存储商品信息、库存、用户评论等，灵活的模式可以方便地添加新属性。
6.  **大数据应用**：作为大数据处理流程中的数据存储层。

**不适合的场景**：
*   需要复杂事务和高度关系完整性的应用 (尽管MongoDB从4.0版本开始支持多文档ACID事务，但其设计初衷和优势仍在于非关系型场景)。
*   数据模型高度稳定且关系复杂的系统，传统关系型数据库可能更合适。

# 九、总结

MongoDB作为一款功能强大的文档型NoSQL数据库，以其高性能、高可用性、灵活的数据模型和易于扩展的特性，在现代应用开发中扮演着越来越重要的角色。通过本文的介绍，笔者希望能帮助读者对MongoDB有一个全面的了解，并能将其有效地应用于实际项目中。掌握MongoDB的基本操作、索引优化、聚合查询以及安全配置，是成为一名优秀MongoDB开发者的关键。

# 十、参考资料

*   MongoDB官方文档: [https://www.mongodb.com/docs/](https://www.mongodb.com/docs/)
*   MongoDB中文手册: [https://docs.mongoing.com/](https://docs.mongoing.com/)
*   《MongoDB从入门到实战之MongoDB简介》 - 追逐时光者: [https://www.cnblogs.com/Can-daydayup/p/16797608.html](https://www.cnblogs.com/Can-daydayup/p/16797608.html)
*   《MongoDB从零开始详细教程(超详细讲解)》 - BaretH: [https://blog.csdn.net/qq_45173404/article/details/114260970](https://blog.csdn.net/qq_45173404/article/details/114260970) 