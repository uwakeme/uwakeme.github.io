---
title: 【数据库】Redis从入门到精通
categories: 数据库
tags:
  - Redis
  - 数据库
  - NoSQL
  - 缓存
  - 消息队列
  - 分布式锁
---

# 前言

Redis (Remote Dictionary Server) 是一个开源的、使用C语言编写的、支持网络、可基于内存亦可持久化的日志型、Key-Value（键值对）存储数据库，并提供多种语言的API。它通常被称为**数据结构服务器**，因为值（value）可以是字符串(String)、哈希(Hash)、列表(List)、集合(Set)、有序集合(Sorted Set)等多种复杂的数据结构。凭借其超高的性能、丰富的数据类型以及灵活的应用场景，Redis已成为现代应用架构中不可或缺的组件，广泛应用于缓存、消息队列、排行榜、分布式锁等场景。本笔记旨在帮助读者系统地学习Redis的核心概念、主要特性和典型应用。

# 一、Redis核心概念

## （一）键值存储 (Key-Value Store)

Redis的核心是一个键值存储系统。每个键都是一个字符串，而值可以是多种数据类型。这种简单的模型使得Redis非常易于理解和使用。

## （二）数据结构服务器

与传统的关系型数据库不同，Redis的值不仅限于简单的字符串或数字，它可以是复杂的数据结构，如列表、集合、哈希表等。这使得开发者可以直接在数据库层面操作这些数据结构，而无需在应用层进行序列化和反序列化，从而大大简化了开发并提高了效率。

## （三）内存数据库 (In-Memory Database)

Redis主要将数据存储在内存中，这使得其读写速度非常快，通常可以达到每秒数十万次的QPS（Queries Per Second）。当然，Redis也支持数据持久化，可以将内存中的数据异步写入磁盘，保证数据的可靠性。

## （四）单线程模型

Redis的网络IO和键值对读写是由一个单线程来完成的，这也是Redis能够保持极高吞吐量的重要原因之一。单线程避免了多线程上下文切换和锁竞争带来的开销。需要注意的是，Redis的单线程主要指的是其处理客户端请求的线程是单线程的，而一些后台操作（如持久化、AOF重写、异步删除等）可能会由额外的线程执行。

# 二、Redis数据类型与常用命令

Redis支持多种数据类型，每种类型都有其特定的应用场景和操作命令。

## （一）字符串 (String)

字符串是Redis中最基本的数据类型，可以存储任何形式的字符串，包括文本、序列化的对象、JSON、甚至是二进制数据。一个字符串类型的值最大可以存储512MB。

**常用命令:**

*   `SET key value [EX seconds] [PX milliseconds] [NX|XX]`：设置指定key的值。
    *   `EX seconds`：设置key的过期时间，单位为秒。
    *   `PX milliseconds`：设置key的过期时间，单位为毫秒。
    *   `NX`：只在key不存在时，才对key进行设置操作。
    *   `XX`：只在key已经存在时，才对key进行设置操作。
*   `GET key`：获取指定key的值。
*   `GETSET key value`：将给定key的值设为value，并返回key的旧值。
*   `MSET key value [key value ...]`：同时设置一个或多个key-value对。
*   `MGET key [key ...]`：获取所有给定key的值。
*   `INCR key`：将key中储存的数字值增一。如果key不存在，则key的值会被初始化为0，然后再执行INCR操作。
*   `DECR key`：将key中储存的数字值减一。
*   `INCRBY key increment`：将key所储存的值加上给定的增量值（increment）。
*   `DECRBY key decrement`：将key所储存的值减去给定的减量值（decrement）。
*   `APPEND key value`：如果key已经存在并且是一个字符串，APPEND命令将指定的value追加到该key原来值的末尾。
*   `STRLEN key`：返回key所储存的字符串值的长度。

**应用场景:**

*   缓存：存储热点数据，如用户信息、配置信息等。
*   计数器：如网站访问量、文章阅读量等。
*   分布式锁：利用`SETNX` (SET if Not eXists) 实现。

```shell
# 设置一个字符串键
127.0.0.1:6379> SET user:1 '{"name":"Alice", "age":30}'
OK
# 获取键的值
127.0.0.1:6379> GET user:1
"{"name":"Alice", "age":30}"
# 增加计数器
127.0.0.1:6379> INCR page_views:article:123
(integer) 1
```

## （二）哈希 (Hash)

哈希是一个键值对集合，可以看作是存储了一个对象的多个字段和对应的值。非常适合用于存储对象。

**常用命令:**

*   `HSET key field value [field value ...]`：将哈希表key中的字段field的值设为value。
*   `HGET key field`：获取存储在哈希表中指定字段的值。
*   `HMSET key field value [field value ...]`：同时将多个field-value对设置到哈希表key中。(Redis 4.0.0开始不推荐使用，可直接使用HSET)
*   `HMGET key field [field ...]`：获取所有给定字段的值。
*   `HGETALL key`：获取在哈希表中指定key的所有字段和值。
*   `HDEL key field [field ...]`：删除一个或多个哈希表字段。
*   `HLEN key`：获取哈希表中字段的数量。
*   `HEXISTS key field`：查看哈希表key中，指定的字段是否存在。
*   `HKEYS key`：获取哈希表中的所有字段。
*   `HVALS key`：获取哈希表中的所有值。
*   `HINCRBY key field increment`：为哈希表key中的指定字段的整数值加上增量increment。

**应用场景:**

*   存储对象：比将对象序列化成JSON字符串存储在String类型中更节省空间，且方便对单个字段进行操作。
*   购物车：用户ID为key，商品ID为field，商品数量为value。

```shell
# 存储用户信息
127.0.0.1:6379> HSET user:profile:1 name "Bob" age 25 city "New York"
(integer) 3
# 获取用户年龄
127.0.0.1:6379> HGET user:profile:1 age
"25"
# 获取所有字段和值
127.0.0.1:6379> HGETALL user:profile:1
1) "name"
2) "Bob"
3) "age"
4) "25"
5) "city"
6) "New York"
```

## （三）列表 (List)

列表是简单的字符串列表，按照插入顺序排序。可以添加一个元素到列表的头部（左边）或者尾部（右边）。列表的最大长度是 2^32 - 1 个元素 (4294967295, 每个列表超过40亿个元素)。

**常用命令:**

*   `LPUSH key element [element ...]`：将一个或多个值插入到列表头部。
*   `RPUSH key element [element ...]`：将一个或多个值插入到列表尾部。
*   `LPOP key [count]`：移除并获取列表的第一个元素（从左边）。
*   `RPOP key [count]`：移除并获取列表的最后一个元素（从右边）。
*   `LRANGE key start stop`：获取列表指定范围内的元素。start和stop都是从0开始的下标。
*   `LLEN key`：获取列表的长度。
*   `LINDEX key index`：通过索引获取列表中的元素。
*   `LSET key index element`：通过索引设置列表元素的值。
*   `LINSERT key BEFORE|AFTER pivot element`：在列表的元素pivot之前或之后插入element。
*   `LTRIM key start stop`：对一个列表进行修剪(trim)，就是说，让列表只保留指定区间内的元素，不在指定区间之内的元素都将被删除。
*   `BLPOP key [key ...] timeout`：移出并获取列表的第一个元素， 如果列表没有元素会阻塞列表直到等待超时或发现可弹出元素为止。
*   `BRPOP key [key ...] timeout`：移出并获取列表的最后一个元素，如果列表没有元素会阻塞列表直到等待超时或发现可弹出元素为止。

**应用场景:**

*   消息队列：利用`LPUSH`生产消息，`RPOP`消费消息 (或反之)。`BRPOP`可实现阻塞式消费。
*   时间线/最新动态：例如微博用户的关注动态列表。
*   任务队列。

```shell
# 向任务队列添加任务
127.0.0.1:6379> LPUSH tasks "process_video:1001"
(integer) 1
127.0.0.1:6379> LPUSH tasks "send_email:user_abc"
(integer) 2
# 查看任务列表
127.0.0.1:6379> LRANGE tasks 0 -1
1) "send_email:user_abc"
2) "process_video:1001"
# 处理一个任务
127.0.0.1:6379> RPOP tasks
"process_video:1001"
```

## （四）集合 (Set)

集合是字符串类型的无序集合。集合成员是唯一的，这就意味着集合中不能出现重复的数据。

**常用命令:**

*   `SADD key member [member ...]`：向集合添加一个或多个成员。
*   `SREM key member [member ...]`：移除集合中一个或多个成员。
*   `SMEMBERS key`：返回集合中的所有成员。
*   `SISMEMBER key member`：判断member元素是否是集合key的成员。
*   `SCARD key`：获取集合的成员数。
*   `SPOP key [count]`：移除并返回集合中的一个或多个随机元素。
*   `SRANDMEMBER key [count]`：返回集合中一个或多个随机数。
*   `SUNION key [key ...]`：返回所有给定集合的并集。
*   `SINTER key [key ...]`：返回所有给定集合的交集。
*   `SDIFF key [key ...]`：返回第一个集合与其他集合之间的差集。
*   `SUNIONSTORE destination key [key ...]`：将给定集合的并集存储在指定的集合destination中。
*   `SINTERSTORE destination key [key ...]`：将给定集合的交集存储在指定的集合destination中。
*   `SDIFFSTORE destination key [key ...]`：将给定集合的差集存储在指定的集合destination中。

**应用场景:**

*   标签系统：例如给用户打标签，给文章打标签。
*   共同好友/共同关注：利用交集操作。
*   抽奖系统：利用`SRANDMEMBER`或`SPOP`随机抽取。
*   去重：利用集合成员的唯一性。

```shell
# 添加标签到文章
127.0.0.1:6379> SADD article:100:tags "redis" "database" "nosql"
(integer) 3
# 查看文章所有标签
127.0.0.1:6379> SMEMBERS article:100:tags
1) "nosql"
2) "redis"
3) "database"
# 判断文章是否有某个标签
127.0.0.1:6379> SISMEMBER article:100:tags "java"
(integer) 0
# 用户A和用户B的共同关注
127.0.0.1:6379> SADD user:A:following "user:C" "user:D" "user:E"
(integer) 3
127.0.0.1:6379> SADD user:B:following "user:D" "user:E" "user:F"
(integer) 3
127.0.0.1:6379> SINTER user:A:following user:B:following
1) "user:D"
2) "user:E"
```

## （五）有序集合 (Sorted Set / ZSet)

有序集合和集合一样也是字符串类型元素的集合，且不允许重复的成员。不同的是每个元素都会关联一个double类型的分数（score）。Redis正是通过分数来为集合中的成员进行从小到大的排序。有序集合的成员是唯一的,但分数(score)却可以重复。

**常用命令:**

*   `ZADD key [NX|XX] [CH] [INCR] score member [score member ...]`：向有序集合添加一个或多个成员，或者更新已存在成员的分数。
*   `ZREM key member [member ...]`：移除有序集合中的一个或多个成员。
*   `ZRANGE key start stop [WITHSCORES]`：通过索引区间返回有序集合成指定区间内的成员（默认按分数从小到大）。
*   `ZREVRANGE key start stop [WITHSCORES]`：返回有序集中指定区间内的成员，通过索引，分数从高到低。
*   `ZRANGEBYSCORE key min max [WITHSCORES] [LIMIT offset count]`：通过分数区间返回有序集合指定区间内的成员。
*   `ZREVRANGEBYSCORE key max min [WITHSCORES] [LIMIT offset count]`：返回有序集中指定分数区间内的成员，分数从高到低排序。
*   `ZCARD key`：获取有序集合的成员数。
*   `ZSCORE key member`：返回有序集合中，成员member的分数。
*   `ZCOUNT key min max`：计算在有序集合中指定区间分数的成员数。
*   `ZINCRBY key increment member`：有序集合中对指定成员的分数加上增量increment。
*   `ZRANK key member`：返回有序集合中指定成员的排名（按分数从小到大）。
*   `ZREVRANK key member`：返回有序集合中指定成员的排名（按分数从大到小）。
*   `ZPOPMIN key [count]`：移除并返回有序集合中分数最低的count个成员。
*   `ZPOPMAX key [count]`：移除并返回有序集合中分数最高的count个成员。

**应用场景:**

*   排行榜：例如游戏积分榜、热门商品榜。
*   带权重的任务队列：分数可以作为优先级。
*   范围查找：例如查找某个分数段的用户。

```shell
# 添加玩家得分
127.0.0.1:6379> ZADD leaderboard 1000 "player1" 1500 "player2" 800 "player3"
(integer) 3
# 获取Top N玩家 (分数从高到低)
127.0.0.1:6379> ZREVRANGE leaderboard 0 1 WITHSCORES
1) "player2"
2) "1500"
3) "player1"
4) "1000"
# 获取玩家排名
127.0.0.1:6379> ZREVRANK leaderboard "player3"
(integer) 2
# 增加玩家分数
127.0.0.1:6379> ZINCRBY leaderboard 300 "player3"
"1100"
```

## （六）流 (Stream)

Stream是Redis 5.0版本引入的新的强大的支持多播的可持久化的消息队列。它借鉴了 Kafka 的设计思想，弥补了之前基于List或Pub/Sub实现消息队列的不足。

**核心概念:**

*   **Consumer Groups (消费组)**：允许多个消费者消费同一个Stream中的消息，并且每个消息只会被同一消费组内的一个消费者处理。
*   **Message Persistence (消息持久化)**：Stream中的消息是持久化的。
*   **Message ID (消息ID)**：每个消息都有一个唯一的ID，通常由时间戳和序列号组成，保证了消息的有序性。
*   **Pending Entries List (PEL, 待处理条目列表)**：记录了被客户端读取但尚未确认(ACK)的消息。

**常用命令:**

*   `XADD key [NOMKSTREAM] [MAXLEN|MINID [=|~] threshold [LIMIT count]] *|id field value [field value ...]`：添加消息到Stream末尾。
*   `XREAD [COUNT count] [BLOCK milliseconds] STREAMS key [key ...] id [id ...]`：从一个或多个Stream中读取消息。
*   `XGROUP CREATE key groupname id [MKSTREAM]`：创建消费者组。
*   `XREADGROUP GROUP group consumer [COUNT count] [BLOCK milliseconds] [NOACK] STREAMS key [key ...] id [id ...]`：从消费者组读取消息。
*   `XACK key group id [id ...]`：向消费者组确认消息已处理。
*   `XPENDING key group [start end count] [consumer]`：查看待处理的消息列表。
*   `XCLAIM key group consumer min-idle-time id [id ...]`：转移待处理消息的所有权。

**应用场景:**

*   功能完善的消息队列：替代 RabbitMQ、Kafka 等，用于日志收集、事件通知等。
*   实时数据流处理。

```shell
# 向 stream:orders 添加消息
127.0.0.1:6379> XADD stream:orders * product_id 1001 quantity 2 customer_id 555
"1700000000000-0" # 返回消息ID (时间戳-序列号)

# 创建消费者组
127.0.0.1:6379> XGROUP CREATE stream:orders group1 0 MKSTREAM
OK

# 消费者c1从组group1读取消息
127.0.0.1:6379> XREADGROUP GROUP group1 c1 COUNT 1 BLOCK 2000 STREAMS stream:orders >
1) 1) "stream:orders"
   2) 1) 1) "1700000000000-0"
         2) 1) "product_id"
            2) "1001"
            3) "quantity"
            4) "2"
            5) "customer_id"
            6) "555"

# 消费者c1确认消息
127.0.0.1:6379> XACK stream:orders group1 "1700000000000-0"
(integer) 1
```

## （七）HyperLogLog

HyperLogLog是一种概率数据结构，用于对唯一事物进行计数（技术上称为估算集合的基数）。通常情况下，对唯一项进行计数需要使用与要计数的项数成比例的内存量，因为需要记住过去已经看过的元素，以避免多次计数它们。然而，一系列算法以内存换取精度：它们返回带有标准错误的估计度量，在Redis实现中，标准错误小于1%。这种算法的奇妙之处在于，不再需要使用与计数项目数量成比例的内存量，而是可以使用恒定的内存量！在最坏的情况下为12k字节，如果HyperLogLog（从现在开始简称为HLL）看到的元素很少，则内存要少得多。

**常用命令:**

*   `PFADD key element [element ...]`：添加指定元素到 HyperLogLog 中。
*   `PFCOUNT key [key ...]`：返回给定 HyperLogLog 的基数估算值。
*   `PFMERGE destkey sourcekey [sourcekey ...]`：将多个 HyperLogLog 合并为一个 HyperLogLog。

**应用场景:**

*   统计网站独立访客数 (UV)。
*   统计用户搜索的独立词条数。
*   大数据去重计数。

```shell
# 记录访问页面的用户ID
127.0.0.1:6379> PFADD page:home:uv user1 user2 user3 user1
(integer) 1 # 返回1表示至少有一个元素的内部表示被修改
127.0.0.1:6379> PFADD page:home:uv user4 user5
(integer) 1
# 获取首页UV估算值
127.0.0.1:6379> PFCOUNT page:home:uv
(integer) 5
```

## （八）位图 (Bitmap)

位图不是实际的数据类型，而是在字符串类型上定义的一组面向位的操作。由于字符串是二进制安全的blob，并且它们的最大长度是512 MB，所以它们适合设置多达2^32个不同的位。位操作分为两组：常量时间单个位操作，如将位设置为1或0，或获取其值；以及对位组的操作，例如计算给定范围位中设置位（人口计数）的数量。位图的最大优点之一是它们在存储信息时通常非常节省空间。

**常用命令:**

*   `SETBIT key offset value`：对key所储存的字符串值，设置或清除指定偏移量上的位(bit)。
*   `GETBIT key offset`：对key所储存的字符串值，获取指定偏移量上的位(bit)。
*   `BITCOUNT key [start end]`：计算给定字符串中，被设置为1的比特位的数量。
*   `BITPOS key bit [start end]`：返回字符串里面第一个被设置为1或者0的bit位。
*   `BITOP operation destkey key [key ...]`：对一个或多个保存二进制位的字符串key进行位元操作，并将结果保存到destkey上。支持AND, OR, XOR, NOT。

**应用场景:**

*   用户签到统计：一个月最多31天，用一个很小的字符串就能表示。
*   用户在线状态。
*   统计活跃用户。
*   实现布隆过滤器。

```shell
# 记录用户ID为100在2024年3月15日的签到 (假设每月第一天offset为0)
127.0.0.1:6379> SETBIT user:sign:100:202403 14 1  # 15号对应offset 14
(integer) 0 # 返回该位原来的值
# 检查用户是否在3月15日签到
127.0.0.1:6379> GETBIT user:sign:100:202403 14
(integer) 1
# 统计用户3月份签到次数
127.0.0.1:6379> BITCOUNT user:sign:100:202403
(integer) 1
```

## （九）地理空间索引 (Geospatial)

Redis Geospatial索引允许存储坐标并将它们组织成可以查询半径或边界框的索引。这个功能对于查找给定地理区域内的点非常有用。Redis使用一个有序集合来存储地理空间数据，其中元素是地理位置的成员名，分数是其地理哈希编码。

**常用命令:**

*   `GEOADD key [NX|XX] [CH] longitude latitude member [longitude latitude member ...]`：将指定的地理空间位置（纬度、经度、名称）添加到指定的key中。
*   `GEOPOS key member [member ...]`：从key里返回所有给定位置元素的位置（经度和纬度）。
*   `GEODIST key member1 member2 [unit]`：返回两个给定位置之间的距离。单位可以是m（米）、km（千米）、mi（英里）、ft（英尺）。
*   `GEORADIUS key longitude latitude radius m|km|ft|mi [WITHCOORD] [WITHDIST] [WITHHASH] [COUNT count] [ASC|DESC] [STORE key] [STOREDIST key]`：以给定的经纬度为中心， 返回键包含的位置元素当中， 与中心的距离不超过给定最大距离的所有位置元素。（Redis 6.2后推荐使用GEOSEARCH）
*   `GEORADIUSBYMEMBER key member radius m|km|ft|mi [WITHCOORD] [WITHDIST] [WITHHASH] [COUNT count] [ASC|DESC] [STORE key] [STOREDIST key]`：这个命令和 GEORADIUS 命令一样， 都可以找出位于指定范围内的元素， 但是 GEORADIUSBYMEMBER 的中心点是由给定的位置元素决定的， 而不是使用输入的经度和纬度来决定中心点。（Redis 6.2后推荐使用GEOSEARCH）
*   `GEOSEARCH key [FROMMEMBER member | FROMLONLAT longitude latitude] [BYRADIUS radius m|km|ft|mi | BYBOX width height m|km|ft|mi] [ASC|DESC] [COUNT count [ANY]] [WITHCOORD] [WITHDIST] [WITHHASH]`：在指定的地理空间索引中搜索成员。
*   `GEOSEARCHSTORE destination source [FROMMEMBER member | FROMLONLAT longitude latitude] [BYRADIUS radius m|km|ft|mi | BYBOX width height m|km|ft|mi] [ASC|DESC] [COUNT count [ANY]] [STOREDIST]`：与GEOSEARCH类似，但会将结果存储到destination键。

**应用场景:**

*   查找附近的人/地点。
*   基于位置的服务 (LBS)。

```shell
# 添加城市坐标
127.0.0.1:6379> GEOADD cities 116.40 39.90 "Beijing" 121.47 31.23 "Shanghai"
(integer) 2
# 获取北京的坐标
127.0.0.1:6379> GEOPOS cities "Beijing"
1) 1) "116.4000016450881958"  # 经度
   2) "39.90000009167015552"  # 纬度
# 计算北京到上海的距离 (单位：千米)
127.0.0.1:6379> GEODIST cities "Beijing" "Shanghai" km
"1067.5500"
# 查找上海附近200公里内的城市 (使用GEOSEARCH)
127.0.0.1:6379> GEOSEARCH cities FROMLONLAT 121.47 31.23 BYRADIUS 200 km WITHDIST
1) 1) "Shanghai"
   2) "0.0000"
```

# 三、Redis特性

## （一）持久化 (Persistence)

Redis提供了两种主要的持久化机制，可以将内存中的数据保存到磁盘，防止数据丢失。

### 1. RDB (Redis Database)

RDB持久化是在指定的时间间隔内生成数据集的时间点快照（point-in-time snapshot）。

**工作原理：**

当满足触发条件时（例如，`save 900 1`表示900秒内至少有1个key被修改），Redis会单独创建一个子进程（fork），子进程负责将当前内存中的数据写入到一个临时的RDB文件中。当子进程完成写入后，会用这个临时文件替换掉上一次持久化生成的RDB文件。

**优点：**

*   RDB是一个非常紧凑的文件，它保存了某个时间点的数据集，非常适用于备份。
*   对于灾难恢复而言，RDB是一个理想的选择。因为你可以轻松地将不同版本的数据集恢复到不同的服务器上。
*   性能最大化。对于Redis的服务进程而言，在开始持久化时，它唯一需要做的只是fork出一个子进程，之后再由子进程完成这些持久化的工作，这样主进程就不会进行任何IO操作。
*   相比于AOF，在恢复大数据集的时候，RDB方式会更快一些。

**缺点：**

*   如果你需要尽量避免在服务器故障时丢失数据，那么RDB不适合你。在最后一次RDB快照之后到服务器宕机前的数据可能会丢失。
*   RDB需要经常fork子进程来保存数据集到硬盘上，当数据集比较大的时候，fork的过程可能会非常耗时，造成服务器在一段时间内停止处理客户端的请求（毫秒级到秒级）。

**配置:**

在`redis.conf`文件中配置`save`指令：

```conf
save 900 1   # 900秒内至少有1个key被修改则进行快照
save 300 10  # 300秒内至少有10个key被修改则进行快照
save 60 10000 # 60秒内至少有10000个key被修改则进行快照

dbfilename dump.rdb # RDB文件名
dir ./             # RDB文件保存目录
```

可以使用`SAVE`（阻塞）或`BGSAVE`（非阻塞，后台执行）命令手动触发RDB快照。

### 2. AOF (Append Only File)

AOF持久化记录服务器执行的所有写操作命令，并在服务器启动时，通过重新执行这些命令来还原数据集。AOF文件中的命令全部以Redis协议的格式来保存，新命令会被追加到文件的末尾。Redis还可以在后台对AOF文件进行重写（rewrite），使得AOF文件的体积不会超出保存数据集状态所需的实际大小。

**工作原理：**

每当Redis执行一个改变数据集的命令时，这个命令就会被追加到AOF文件的末尾。当AOF文件体积过大时，Redis会fork一个子进程在后台对AOF进行重写，生成一个新的、更小的AOF文件。重写过程是安全的，Redis会继续将新的写命令追加到旧的AOF文件的一个内存缓冲区中，当子进程完成重写后，会将这个缓冲区的内容追加到新的AOF文件末尾，然后用新的AOF文件替换旧的。

**优点：**

*   数据更不容易丢失。你可以配置不同的`appendfsync`策略，例如每秒同步一次（默认），这样最多只会丢失1秒的数据。
*   AOF文件是一个只进行追加操作的日志文件，因此对AOF文件的写入不需要进行seek，即使由于某些原因（例如磁盘空间已满）未执行完整的写入命令，也很容易使用`redis-check-aof`工具来修复。
*   当AOF文件体积变得过大时，Redis能够在后台自动重写AOF文件。重写后的新AOF文件包含了恢复当前数据集所需的最小命令集合。

**缺点：**

*   对于相同的数据集来说，AOF文件的体积通常要大于RDB文件的体积。
*   根据所使用的`fsync`策略，AOF的速度可能会慢于RDB。在一般情况下，每秒`fsync`的性能依然非常高，而关闭`fsync`可以让AOF的速度和RDB一样快，即使在高负荷之下也是如此。不过，和RDB持久化一样，写入AOF也需要fork子进程，在大数据量下可能会有阻塞风险。
*   AOF在过去曾经出现过一些bug（例如在重写期间由于某些命令的特殊性导致数据不一致）。

**配置:**

在`redis.conf`文件中配置：

```conf
appendonly yes # 开启AOF

appendfilename "appendonly.aof" # AOF文件名

# appendfsync
# no: 不进行fsync，由操作系统决定何时同步。速度最快，但最不安全。
# always: 每个写命令都立即fsync。速度最慢，但最安全。
# everysec: 每秒fsync一次。默认配置，兼顾性能和安全。
appendfsync everysec

# AOF重写配置
auto-aof-rewrite-percentage 100 # 当前AOF文件大小超过上次重写后AOF文件大小的百分之多少时触发重写。
auto-aof-rewrite-min-size 64mb  # 触发重写的AOF文件最小体积。
```

### 3. RDB与AOF的选择与混合持久化

*   **如果只追求性能，且可以容忍少量数据丢失**，可以选择RDB。
*   **如果追求数据的完整性，不希望丢失数据**，AOF是更好的选择。
*   **官方推荐同时使用两种持久化功能**。这样当Redis重启时，会优先使用AOF文件来恢复数据集，因为它通常包含更新的数据。

Redis 4.0开始支持**RDB-AOF混合持久化**。这种模式下，AOF重写时，不再是简单地将内存中的数据转换为RESP命令写入AOF文件，而是将RDB快照内容和增量的AOF修改命令存在一起，写入到新的AOF文件。这样，在加载数据时，可以先加载RDB部分，然后再加载增量AOF部分，结合了RDB的快速加载和AOF的数据完整性优势。

配置混合持久化：
```conf
aof-use-rdb-preamble yes
```

## （二）复制 (Replication)

Redis复制功能允许从服务器（slave/replica）成为主服务器（master/primary）的精确副本。

**工作原理：**

1.  从服务器连接到主服务器，发送`PSYNC`命令。
2.  如果是初次连接，主服务器会启动一个后台进程生成RDB快照，并将快照发送给从服务器。从服务器接收并载入这个RDB文件。
3.  在RDB发送期间，主服务器会将所有新的写命令缓存在内存中。当RDB发送完毕后，主服务器会将这些缓存的命令发送给从服务器。
4.  之后，主服务器每执行一个写命令，都会异步地发送给所有从服务器。
5.  如果连接断开重连，会尝试进行部分重同步（增量复制），如果不行则进行全量重同步。

**优点：**

*   **读写分离**：主服务器负责写操作，从服务器负责读操作，分担主服务器的压力，提高整体性能。
*   **数据冗余/高可用**：当主服务器宕机时，可以将一个从服务器提升为新的主服务器，继续提供服务。

**配置：**

在从服务器的`redis.conf`中配置：
```conf
replicaof <masterip> <masterport>
# 或者 slaveof <masterip> <masterport> (旧版命令)

masterauth <master-password> # 如果主服务器设置了密码
```
也可以在`redis-cli`中使用`REPLICAOF`命令。

## （三）哨兵 (Sentinel)

Redis Sentinel是一个分布式系统，用于对Redis主从复制集群进行监控、通知和自动故障转移。

**主要功能：**

1.  **监控 (Monitoring)**：Sentinel会不断地检查主服务器和从服务器是否运作正常。
2.  **通知 (Notification)**：当被监控的某个Redis服务器出现问题时，Sentinel可以通过API向管理员或者其他应用程序发送通知。
3.  **自动故障转移 (Automatic Failover)**：当一个主服务器不能正常工作时，Sentinel会开始一次自动故障转移操作，它会将失效主服务器的其中一个从服务器升级为新的主服务器，并让失效主服务器的其他从服务器改为复制新的主服务器；当客户端试图连接失效的主服务器时，集群也会向客户端返回新主服务器的地址。
4.  **配置提供者 (Configuration Provider)**：客户端可以连接Sentinel询问当前Redis集群的主服务器地址。

**工作原理：**

*   Sentinel以集群模式运行，多个Sentinel进程协同工作，通过Gossip协议相互通信。
*   每个Sentinel进程都会独立地监控Redis实例。
*   当一个Sentinel认为主服务器下线（主观下线 SDown），它会向其他Sentinel发送消息，如果足够数量的Sentinel（达到配置的quorum）都认为主服务器下线，则该主服务器被标记为客观下线（ODown）。
*   之后，Sentinel集群会选举出一个领头的Sentinel来执行故障转移操作。

**配置：**

启动Sentinel需要一个配置文件，例如`sentinel.conf`:
```conf
# sentinel monitor <master-name> <ip> <port> <quorum>
# <master-name>: 主服务器的名称，自定义
# <ip> <port>: 主服务器的IP和端口
# <quorum>: 判断主服务器客观下线所需的Sentinel数量
sentinel monitor mymaster 127.0.0.1 6379 2

# sentinel down-after-milliseconds <master-name> <milliseconds>
# 主服务器被判定为主观下线的时间阈值 (毫秒)
sentinel down-after-milliseconds mymaster 30000

# sentinel parallel-syncs <master-name> <numslaves>
# 在故障转移后，同时向新的主服务器发起同步的从服务器数量
sentinel parallel-syncs mymaster 1

# sentinel failover-timeout <master-name> <milliseconds>
# 故障转移的超时时间
sentinel failover-timeout mymaster 180000
```
启动Sentinel: `redis-sentinel /path/to/sentinel.conf`

## （四）集群 (Cluster)

Redis Cluster提供了在多个Redis节点之间进行数据分片（sharding）的功能，从而实现了高可用性和可扩展性。

**核心概念：**

*   **数据分片 (Sharding)**：Redis Cluster将整个数据集划分为16384个哈希槽（hash slots）。每个主节点负责处理一部分哈希槽。当一个键被存储或请求时，Redis会根据键名计算出它属于哪个哈希槽，然后将命令转发到负责该哈希槽的节点。
*   **节点 (Node)**：一个Redis Cluster通常由多个节点组成。每个节点可以是主节点（master）或从节点（replica）。
*   **主从复制 (Master-Replica)**：每个主节点可以有零个或多个从节点。如果某个主节点发生故障，其一个从节点会被选举为新的主节点，保证集群的可用性。
*   **Gossip协议**：节点之间通过Gossip协议交换信息，如节点状态、哈希槽分配等。
*   **无需中心节点 (Decentralized)**：Redis Cluster的设计是去中心化的，客户端可以连接到集群中的任意节点，节点会自动处理命令的转发。

**优点：**

*   **水平扩展**：可以通过增加节点来扩展集群的存储能力和吞吐量。
*   **高可用性**：通过主从复制和自动故障转移，保证了集群在部分节点故障时仍能继续服务。

**配置与搭建：**
搭建Redis Cluster相对复杂，通常需要准备多个Redis实例（至少3主3从以保证高可用），并使用`redis-cli --cluster create`命令来创建集群。

**客户端路由：**
客户端连接到集群时，如果访问的键不属于当前连接的节点，节点会返回一个`MOVED`或`ASK`重定向错误，告知客户端正确的节点地址。智能客户端库能够缓存哈希槽与节点的映射关系，并直接将命令发送到正确的节点。

## （五）事务 (Transactions)

Redis通过`MULTI`, `EXEC`, `DISCARD`和`WATCH`命令来实现事务功能。

**工作原理：**

1.  **`MULTI`**：标记一个事务块的开始。之后客户端发送的命令会被放入一个队列中，而不会立即执行。
2.  **`EXEC`**：原子性地执行队列中的所有命令。如果在`MULTI`之前有命令被`WATCH`监视，并且在`EXEC`执行前这些键被修改，则事务失败（返回nil），队列中的命令不会被执行。
3.  **`DISCARD`**：取消事务，清空命令队列。
4.  **`WATCH key [key ...]`**：监视一个或多个key，如果在事务执行之前这些key被其他命令所改动，那么事务将被打断。`WATCH`命令可以用于实现乐观锁。

**ACID特性讨论：**

*   **原子性 (Atomicity)**：Redis事务保证队列中的命令要么全部执行，要么全部不执行。如果某个命令在入队时出错（例如语法错误），则整个事务在`EXEC`时会被拒绝执行。如果在`EXEC`执行期间某个命令出错（例如对一个String类型执行List操作），则其他命令仍然会执行，Redis不会进行回滚。
*   **一致性 (Consistency)**：由开发者保证。如果事务中的命令逻辑正确，数据最终会达到一致状态。
*   **隔离性 (Isolation)**：Redis是单线程处理命令的，因此在事务执行期间，不会有其他客户端的命令插入到事务命令序列中。
*   **持久性 (Durability)**：取决于Redis的持久化配置。如果开启了持久化，事务执行成功后对数据的修改会被保存到磁盘。

**示例：**
```shell
127.0.0.1:6379> MULTI
OK
127.0.0.1:6379> INCR counter
QUEUED
127.0.0.1:6379> SET another_key "hello"
QUEUED
127.0.0.1:6379> EXEC
1) (integer) 1  # INCR counter 的结果
2) OK           # SET another_key 的结果
```

**使用`WATCH`实现乐观锁：**
```shell
127.0.0.1:6379> SET balance 100
OK
127.0.0.1:6379> WATCH balance # 监视balance
OK
127.0.0.1:6379> MULTI
OK
127.0.0.1:6379> DECRBY balance 10 # 尝试扣减余额
QUEUED
# 假设此时另一个客户端执行了 SET balance 50
127.0.0.1:6379> EXEC
(nil) # 事务失败，因为balance被修改了
```

## （六）发布/订阅 (Pub/Sub)

Redis的发布/订阅功能允许客户端订阅特定的频道（channel），并接收发送到这些频道的消息。

**工作原理：**

*   **`SUBSCRIBE channel [channel ...]`**：客户端订阅一个或多个频道。
*   **`UNSUBSCRIBE [channel [channel ...]]`**：客户端退订指定的频道，如果没有指定频道则退订所有频道。
*   **`PUBLISH channel message`**：客户端向指定的频道发布一条消息。所有订阅该频道的客户端都会收到这条消息。
*   **`PSUBSCRIBE pattern [pattern ...]`**：客户端订阅一个或多个模式匹配的频道。例如 `PSUBSCRIBE news.*` 会订阅所有以 `news.` 开头的频道。
*   **`PUNSUBSCRIBE [pattern [pattern ...]]`**：退订模式。

**特点：**

*   **解耦**：生产者（发布者）和消费者（订阅者）之间没有直接的联系。
*   **多对多**：一个消息可以被多个订阅者接收，一个订阅者也可以订阅多个频道。
*   **非持久化**：如果订阅者不在线，它将错过发布的消息。对于需要消息持久化的场景，应使用Stream或其他消息队列。

**应用场景:**

*   实时消息系统，如聊天室。
*   事件通知。
*   构建实时数据看板。

## （七）Lua脚本

Redis允许用户通过Lua脚本在服务器端执行复杂的原子性操作。

**优点：**

*   **原子性**：整个脚本作为一个原子操作执行，不会被其他命令中断。
*   **减少网络开销**：将多个命令组合在一个脚本中，一次性发送给服务器执行，减少了网络往返次数。
*   **复用性**：脚本可以被缓存和复用。

**执行脚本命令:**

*   **`EVAL script numkeys key [key ...] arg [arg ...]`**：执行Lua脚本。
    *   `script`：Lua脚本字符串。
    *   `numkeys`：指定后续参数中有多少个是键名(key)。
    *   `key [key ...]`：脚本中用`KEYS[i]`访问的键名参数。
    *   `arg [arg ...]`：脚本中用`ARGV[i]`访问的附加参数。
*   **`SCRIPT LOAD script`**：将脚本上传到服务器并返回脚本的SHA1校验和，但不立即执行。
*   **`EVALSHA sha1 numkeys key [key ...] arg [arg ...]`**：通过脚本的SHA1校验和来执行已缓存的脚本。
*   **`SCRIPT EXISTS sha1 [sha1 ...]`**：检查指定的脚本是否存在于脚本缓存中。
*   **`SCRIPT FLUSH [ASYNC|SYNC]`**：清空服务器的Lua脚本缓存。
*   **`SCRIPT KILL`**：杀死当前正在运行的 Lua 脚本（如果该脚本没有执行过任何写操作）。

**示例：实现一个原子性的读取并重置计数器的操作**
```lua
-- Lua脚本: get_and_reset_counter.lua
local currentValue = redis.call('GET', KEYS[1])
if currentValue == false then
  return 0
else
  redis.call('SET', KEYS[1], 0)
  return tonumber(currentValue)
end
```
在`redis-cli`中执行：
```shell
127.0.0.1:6379> SET mycounter 10
OK
127.0.0.1:6379> EVAL "local currentValue = redis.call('GET', KEYS[1]) if currentValue == false then return 0 else redis.call('SET', KEYS[1], 0) return tonumber(currentValue) end" 1 mycounter
(integer) 10
127.0.0.1:6379> GET mycounter
"0"
```

# 四、Redis应用场景

凭借其丰富的数据类型和高性能，Redis在各种应用场景中都发挥着重要作用。

1.  **缓存 (Caching)**：
    *   **页面缓存**：缓存动态生成的HTML页面。
    *   **对象缓存**：缓存数据库查询结果、用户信息、配置信息等。
    *   **热点数据缓存**：缓存频繁访问的数据，减轻数据库压力。
    *   利用过期策略（如LRU, LFU）和数据淘汰机制。

2.  **会话存储 (Session Store)**：
    *   存储Web应用的会话信息，实现分布式会话共享。

3.  **消息队列 (Message Queue)**：
    *   **List**：简单的消息队列，支持阻塞式读取。
    *   **Pub/Sub**：发布/订阅模式，用于实时消息广播。
    *   **Stream**：功能完善的消息队列，支持消费组、持久化、消息确认等。

4.  **排行榜 (Leaderboards)**：
    *   利用**Sorted Set**存储用户积分和排名。

5.  **计数器 (Counters)**：
    *   利用**String**的`INCR`、`DECR`命令实现各种计数，如网站PV/UV、点赞数、分享数。
    *   **HyperLogLog**用于基数估算，如统计独立访客数。

6.  **分布式锁 (Distributed Locks)**：
    *   利用**String**的`SETNX`命令或更完善的Redlock算法实现。

7.  **实时数据分析 (Real-time Analytics)**：
    *   **Bitmap**：用户签到、在线状态、活跃用户统计。
    *   **Stream**：收集和处理实时事件流。

8.  **地理空间服务 (Geospatial Services)**：
    *   利用**Geospatial**索引实现查找附近的人、地点等LBS功能。

9.  **限流 (Rate Limiting)**：
    *   利用**String**的`INCR`和过期时间，或**Sorted Set**实现滑动窗口限流。

10. **最新列表/动态 (Latest Items/Feeds)**：
    *   利用**List**存储用户动态、新闻Feed等，`LPUSH`添加新条目，`LTRIM`保持列表长度。

# 五、Redis安装与配置

## （一）安装

Redis的安装方式有多种，这里以Linux系统下从源码编译安装为例。

1.  **下载源码并解压**：
    从Redis官网 (https://redis.io/download/) 下载最新的稳定版源码包。
    ```shell
    wget http://download.redis.io/releases/redis-stable.tar.gz
    tar xzf redis-stable.tar.gz
    cd redis-stable
    ```

2.  **编译和安装**：
    确保系统中已安装`gcc`和`make`。
    ```shell
    make
    # (可选) 运行测试
    # make test
    sudo make install
    ```
    默认情况下，Redis的可执行文件会被安装到`/usr/local/bin`目录下，包括：
    *   `redis-server`：Redis服务器
    *   `redis-cli`：Redis命令行客户端
    *   `redis-benchmark`：Redis性能测试工具
    *   `redis-check-aof`：AOF文件检查和修复工具
    *   `redis-check-rdb`：RDB文件检查工具
    *   `redis-sentinel`：Redis Sentinel服务器

3.  **（推荐）创建配置文件目录和数据目录**：
    ```shell
    sudo mkdir /etc/redis
    sudo mkdir /var/lib/redis
    sudo cp redis.conf /etc/redis/ # 将源码包中的redis.conf复制过去
    ```

4.  **修改配置文件** (`/etc/redis/redis.conf`)：
    根据需求修改配置，常见的配置项包括：
    *   `bind 127.0.0.1`：绑定IP地址，默认只允许本地访问。若需远程访问，可改为`bind 0.0.0.0`（注意安全）或特定IP。
    *   `port 6379`：监听端口。
    *   `daemonize yes`：以守护进程方式运行。
    *   `pidfile /var/run/redis_6379.pid`：PID文件路径。
    *   `logfile /var/log/redis_6379.log`：日志文件路径。
    *   `dir /var/lib/redis`：RDB和AOF文件的工作目录。
    *   `requirepass yourpassword`：设置访问密码。

5.  **启动Redis服务**：
    ```shell
    redis-server /etc/redis/redis.conf
    ```

6.  **连接测试**：
    ```shell
    redis-cli
    127.0.0.1:6379> PING
    PONG
    # 如果设置了密码
    127.0.0.1:6379> AUTH yourpassword
    OK
    ```

## （二）重要配置项

`redis.conf` 文件中包含了大量配置项，以下是一些常用的和重要的配置：

*   **网络相关**
    *   `bind <ip_address>`: 绑定的IP地址。
    *   `port <port_number>`: 监听的端口号。
    *   `tcp-keepalive <seconds>`: TCP keepalive 设置，用于检测死连接。
    *   `timeout <seconds>`: 客户端闲置多少秒后关闭连接，0表示禁用。

*   **通用**
    *   `daemonize yes|no`: 是否以守护进程模式运行。
    *   `pidfile /path/to/redis.pid`: PID 文件路径。
    *   `loglevel notice|verbose|debug|warning`: 日志级别。
    *   `logfile /path/to/redis.log`: 日志文件路径。
    *   `databases 16`: 数据库数量，默认为16个（0-15）。

*   **安全**
    *   `requirepass <password>`: 设置客户端连接密码。
    *   `rename-command CONFIG ""` : 重命名或禁用危险命令，如`CONFIG`、`FLUSHALL`。

*   **持久化 (RDB & AOF)**: (前面已详细介绍)
    *   `save <seconds> <changes>`
    *   `dbfilename dump.rdb`
    *   `dir /path/to/data`
    *   `appendonly yes|no`
    *   `appendfilename "appendonly.aof"`
    *   `appendfsync everysec|always|no`
    *   `auto-aof-rewrite-percentage 100`
    *   `auto-aof-rewrite-min-size 64mb`
    *   `aof-use-rdb-preamble yes`

*   **内存管理**
    *   `maxmemory <bytes>`: 设置Redis最大使用内存。
    *   `maxmemory-policy <policy>`: 内存达到上限时的淘汰策略，常见的有：
        *   `noeviction`: 不淘汰，新写入操作会报错。
        *   `allkeys-lru`: 从所有key中使用LRU算法淘汰。
        *   `volatile-lru`: 从设置了过期时间的key中使用LRU算法淘汰。
        *   `allkeys-random`: 从所有key中随机淘汰。
        *   `volatile-random`: 从设置了过期时间的key中随机淘汰。
        *   `volatile-ttl`: 从设置了过期时间的key中，选择剩余时间最短的淘汰。
        *   `allkeys-lfu`: (Redis 4.0+) 从所有key中使用LFU算法淘汰。
        *   `volatile-lfu`: (Redis 4.0+) 从设置了过期时间的key中使用LFU算法淘汰。

*   **复制**
    *   `replicaof <masterip> <masterport>`
    *   `masterauth <master-password>`
    *   `repl-diskless-sync no|yes`: 是否使用无盘复制。

*   **客户端**
    *   `maxclients <number>`: 最大客户端连接数。

# 六、基本管理命令

*   `PING`: 测试服务器是否仍在运行。
*   `ECHO "message"`: 返回输入的字符串。
*   `SELECT <index>`: 切换到指定的数据库，数据库索引号index用数字值指定，以0作为起始索引值。
*   `DBSIZE`: 返回当前数据库的key的数量。
*   `FLUSHDB`: 清空当前数据库中的所有key。
*   `FLUSHALL`: 清空所有数据库中的所有key。
*   `INFO [section]`: 返回关于 Redis 服务器的各种信息和统计数值。
*   `MONITOR`: 实时打印出 Redis 服务器接收到的命令，调试用。
*   `CONFIG GET parameter`: 获取服务器配置参数的值。
*   `CONFIG SET parameter value`: 修改服务器配置参数的值（部分参数支持运行时修改）。
*   `CONFIG REWRITE`: 将通过`CONFIG SET`修改的配置持久化到`redis.conf`文件。
*   `SHUTDOWN [NOSAVE|SAVE]`: 关闭服务器。`NOSAVE`表示不进行持久化，`SAVE`表示在关闭前执行一次RDB快照。
*   `TIME`: 返回当前服务器时间，一个包含两个字符串的列表： 第一个字符串是当前时间(以 UNIX 时间戳格式表示)，而第二个字符串是当前这一秒钟已经逝去的微秒数。

# 七、总结

Redis以其卓越的性能、丰富的数据类型和灵活的功能，成为了现代应用架构中的关键组件。它不仅仅是一个缓存，更是一个强大的数据结构服务器，能够高效地解决各种复杂问题。深入理解Redis的各种数据类型、特性（如持久化、复制、哨兵、集群、事务）以及其适用场景，对于构建高性能、高可用的分布式系统至关重要。希望本笔记能够为您的Redis学习之路提供有益的帮助。

# 八、参考链接

*   **Redis官方网站**: [https://redis.io/](https://redis.io/)
*   **Redis官方文档**: [https://redis.io/documentation](https://redis.io/documentation)
*   **Redis中文文档 (非官方, 但较新)**: [http://www.redis.cn/documentation.html](http://www.redis.cn/documentation.html)
*   **《Redis设计与实现》**: [http://redisbook.com/](http://redisbook.com/) (黄健宏著，深入理解Redis内部原理的好书)
*   **菜鸟教程 - Redis教程**: [https://www.runoob.com/redis/redis-tutorial.html](https://www.runoob.com/redis/redis-tutorial.html)
*   **Java 全栈知识体系 - Redis详解**: [https://pdai.tech/md/db/nosql-redis/db-redis-overview.html](https://pdai.tech/md/db/nosql-redis/db-redis-overview.html)

# 十一、参考资料

*   Redis官方网站: [https://redis.io/](https://redis.io/)
*   Redis官方文档: [https://redis.io/documentation](https://redis.io/documentation)
*   Redis Github仓库: [https://github.com/redis/redis](https://github.com/redis/redis)
*   Redis中文网: [http://www.redis.cn/](http://www.redis.cn/)
*   《Redis设计与实现》黄健宏
*   **相关安装教程**: [【LINUX】在一台空服务器上部署网页系统](./【LINUX】在一台空服务器上部署网页系统.md)

--- 