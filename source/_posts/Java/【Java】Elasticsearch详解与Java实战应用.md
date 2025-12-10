---
title: 【Java】Elasticsearch详解与Java实战应用
date: 2025-12-10
categories:
  - Java
tags:
  - Elasticsearch
  - ES
  - 搜索引擎
  - Java
  - 全文检索
  - 分布式搜索
---

## 前言

Elasticsearch（简称ES）是一个基于Lucene的分布式搜索和分析引擎，以其强大的全文检索能力、实时性、可扩展性而广受欢迎。本文将全面介绍Elasticsearch的核心概念、使用方法，以及在Java项目中的集成和实战应用，帮助您快速掌握ES的开发技能。

## 1. Elasticsearch基础概念

### 1.1 什么是Elasticsearch

**Elasticsearch**是一个开源的分布式搜索和分析引擎，具有以下特点：

- **分布式**：支持集群部署，自动分片和副本
- **实时性**：近实时搜索和分析
- **RESTful API**：通过HTTP接口操作
- **全文检索**：基于Lucene，支持复杂的搜索查询
- **JSON文档**：使用JSON格式存储数据
- **高可用**：自动故障转移和恢复

### 1.2 核心概念

#### 与关系型数据库的对比

| Elasticsearch | MySQL | 说明 |
|--------------|-------|------|
| Index（索引） | Database（数据库） | 数据的容器 |
| Type（类型，7.x已废弃） | Table（表） | 数据的分类 |
| Document（文档） | Row（行） | 一条数据记录 |
| Field（字段） | Column（列） | 数据的属性 |
| Mapping（映射） | Schema（模式） | 数据结构定义 |
| DSL查询 | SQL | 查询语言 |

#### 基本概念详解

**1. 索引（Index）**
```
索引是文档的容器，类似于数据库
例如：user_index（用户索引）、product_index（商品索引）
```

**2. 文档（Document）**
```json
{
  "id": 1,
  "name": "张三",
  "age": 25,
  "email": "zhangsan@example.com"
}
```

**3. 映射（Mapping）**
```json
{
  "properties": {
    "name": { "type": "text" },
    "age": { "type": "integer" },
    "email": { "type": "keyword" }
  }
}
```

**4. 分片（Shard）**
- **主分片（Primary Shard）**：索引数据被分成多个分片
- **副本分片（Replica Shard）**：主分片的备份，提高可用性和查询性能

**5. 节点（Node）**
- **主节点（Master Node）**：管理集群状态
- **数据节点（Data Node）**：存储数据，执行搜索
- **协调节点（Coordinating Node）**：路由请求

### 1.3 数据类型

| 类型 | 说明 | 示例 |
|------|------|------|
| **text** | 全文检索字段，会分词 | 文章内容、商品描述 |
| **keyword** | 精确匹配字段，不分词 | 邮箱、ID、标签 |
| **integer/long** | 整数 | 年龄、数量 |
| **float/double** | 浮点数 | 价格、评分 |
| **boolean** | 布尔值 | 是否上架 |
| **date** | 日期 | 创建时间 |
| **object** | 对象 | 嵌套的JSON对象 |
| **nested** | 嵌套对象数组 | 订单明细 |
| **geo_point** | 地理位置 | 经纬度 |

## 2. Elasticsearch安装与配置

### 2.1 Docker安装（推荐）

```bash
# 拉取Elasticsearch镜像
docker pull elasticsearch:8.11.0

# 创建网络
docker network create elastic

# 启动Elasticsearch（单节点）
docker run -d \
  --name elasticsearch \
  --net elastic \
  -p 9200:9200 \
  -p 9300:9300 \
  -e "discovery.type=single-node" \
  -e "xpack.security.enabled=false" \
  -e "ES_JAVA_OPTS=-Xms512m -Xmx512m" \
  elasticsearch:8.11.0

# 启动Kibana（可视化工具）
docker run -d \
  --name kibana \
  --net elastic \
  -p 5601:5601 \
  -e "ELASTICSEARCH_HOSTS=http://elasticsearch:9200" \
  kibana:8.11.0

# 验证安装
curl http://localhost:9200
```

### 2.2 传统安装

**Linux/macOS：**
```bash
# 下载
wget https://artifacts.elastic.co/downloads/elasticsearch/elasticsearch-8.11.0-linux-x86_64.tar.gz

# 解压
tar -xzf elasticsearch-8.11.0-linux-x86_64.tar.gz

# 启动
cd elasticsearch-8.11.0
./bin/elasticsearch
```

**Windows：**
```bash
# 下载zip包并解压
# 运行
bin\elasticsearch.bat
```

### 2.3 配置文件（elasticsearch.yml）

```yaml
# 集群名称
cluster.name: my-application

# 节点名称
node.name: node-1

# 数据和日志路径
path.data: /var/lib/elasticsearch
path.logs: /var/log/elasticsearch

# 网络配置
network.host: 0.0.0.0
http.port: 9200

# 集群发现
discovery.seed_hosts: ["host1", "host2"]
cluster.initial_master_nodes: ["node-1", "node-2"]

# 内存设置（jvm.options）
-Xms2g
-Xmx2g
```

## 3. RESTful API基础操作

### 3.1 索引操作

**创建索引：**
```bash
# 创建索引
PUT http://localhost:9200/user_index

# 创建索引并指定映射
PUT http://localhost:9200/user_index
{
  "mappings": {
    "properties": {
      "name": {
        "type": "text",
        "analyzer": "ik_max_word"
      },
      "age": {
        "type": "integer"
      },
      "email": {
        "type": "keyword"
      },
      "createTime": {
        "type": "date",
        "format": "yyyy-MM-dd HH:mm:ss"
      }
    }
  },
  "settings": {
    "number_of_shards": 3,
    "number_of_replicas": 1
  }
}
```

**查看索引：**
```bash
# 查看所有索引
GET http://localhost:9200/_cat/indices?v

# 查看索引详情
GET http://localhost:9200/user_index

# 查看索引映射
GET http://localhost:9200/user_index/_mapping
```

**删除索引：**
```bash
DELETE http://localhost:9200/user_index
```

### 3.2 文档操作

**创建文档：**
```bash
# 指定ID创建
PUT http://localhost:9200/user_index/_doc/1
{
  "name": "张三",
  "age": 25,
  "email": "zhangsan@example.com",
  "createTime": "2025-12-10 10:00:00"
}

# 自动生成ID
POST http://localhost:9200/user_index/_doc
{
  "name": "李四",
  "age": 30,
  "email": "lisi@example.com"
}
```

**查询文档：**
```bash
# 根据ID查询
GET http://localhost:9200/user_index/_doc/1

# 查询所有文档
GET http://localhost:9200/user_index/_search
```

**更新文档：**
```bash
# 全量更新（覆盖）
PUT http://localhost:9200/user_index/_doc/1
{
  "name": "张三",
  "age": 26,
  "email": "zhangsan@example.com"
}

# 部分更新
POST http://localhost:9200/user_index/_update/1
{
  "doc": {
    "age": 26
  }
}
```

**删除文档：**
```bash
DELETE http://localhost:9200/user_index/_doc/1
```

### 3.3 批量操作

```bash
# 批量操作
POST http://localhost:9200/_bulk
{"index":{"_index":"user_index","_id":"1"}}
{"name":"张三","age":25,"email":"zhangsan@example.com"}
{"index":{"_index":"user_index","_id":"2"}}
{"name":"李四","age":30,"email":"lisi@example.com"}
{"update":{"_index":"user_index","_id":"1"}}
{"doc":{"age":26}}
{"delete":{"_index":"user_index","_id":"3"}}
```

## 4. 查询DSL

### 4.1 基础查询

**查询所有（match_all）：**
```json
GET /user_index/_search
{
  "query": {
    "match_all": {}
  }
}
```

**精确匹配（term）：**
```json
GET /user_index/_search
{
  "query": {
    "term": {
      "email": "zhangsan@example.com"
    }
  }
}
```

**全文检索（match）：**
```json
GET /user_index/_search
{
  "query": {
    "match": {
      "name": "张三"
    }
  }
}
```

**多字段查询（multi_match）：**
```json
GET /user_index/_search
{
  "query": {
    "multi_match": {
      "query": "张三",
      "fields": ["name", "email"]
    }
  }
}
```

### 4.2 复合查询

**布尔查询（bool）：**
```json
GET /user_index/_search
{
  "query": {
    "bool": {
      "must": [
        { "match": { "name": "张三" } }
      ],
      "filter": [
        { "range": { "age": { "gte": 20, "lte": 30 } } }
      ],
      "should": [
        { "term": { "email": "zhangsan@example.com" } }
      ],
      "must_not": [
        { "term": { "status": "deleted" } }
      ]
    }
  }
}
```

**布尔查询说明：**
- `must`：必须匹配，影响评分
- `filter`：必须匹配，不影响评分（性能更好）
- `should`：可选匹配，影响评分
- `must_not`：必须不匹配，不影响评分

### 4.3 范围查询

```json
GET /product_index/_search
{
  "query": {
    "range": {
      "price": {
        "gte": 100,
        "lte": 500
      }
    }
  }
}
```

### 4.4 模糊查询

**前缀查询（prefix）：**
```json
GET /user_index/_search
{
  "query": {
    "prefix": {
      "name": "张"
    }
  }
}
```

**通配符查询（wildcard）：**
```json
GET /user_index/_search
{
  "query": {
    "wildcard": {
      "name": "张*"
    }
  }
}
```

**模糊查询（fuzzy）：**
```json
GET /user_index/_search
{
  "query": {
    "fuzzy": {
      "name": {
        "value": "张三",
        "fuzziness": 1
      }
    }
  }
}
```

### 4.5 排序、分页、高亮

```json
GET /user_index/_search
{
  "query": {
    "match": {
      "name": "张三"
    }
  },
  "sort": [
    { "age": "desc" },
    { "_score": "desc" }
  ],
  "from": 0,
  "size": 10,
  "highlight": {
    "fields": {
      "name": {}
    },
    "pre_tags": "<em>",
    "post_tags": "</em>"
  }
}
```

### 4.6 聚合查询

**统计聚合：**
```json
GET /product_index/_search
{
  "size": 0,
  "aggs": {
    "avg_price": {
      "avg": { "field": "price" }
    },
    "max_price": {
      "max": { "field": "price" }
    },
    "min_price": {
      "min": { "field": "price" }
    },
    "sum_price": {
      "sum": { "field": "price" }
    }
  }
}
```

**分组聚合：**
```json
GET /product_index/_search
{
  "size": 0,
  "aggs": {
    "group_by_category": {
      "terms": {
        "field": "category",
        "size": 10
      },
      "aggs": {
        "avg_price": {
          "avg": { "field": "price" }
        }
      }
    }
  }
}
```

## 5. Java客户端集成

### 5.1 添加依赖

**Maven依赖（Spring Boot）：**
```xml
<dependencies>
    <!-- Spring Boot Starter -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-elasticsearch</artifactId>
    </dependency>
    
    <!-- Elasticsearch Java Client（推荐） -->
    <dependency>
        <groupId>co.elastic.clients</groupId>
        <artifactId>elasticsearch-java</artifactId>
        <version>8.11.0</version>
    </dependency>
    
    <!-- Jakarta JSON -->
    <dependency>
        <groupId>jakarta.json</groupId>
        <artifactId>jakarta.json-api</artifactId>
        <version>2.0.1</version>
    </dependency>
    
    <!-- Lombok（可选） -->
    <dependency>
        <groupId>org.projectlombok</groupId>
        <artifactId>lombok</artifactId>
        <optional>true</optional>
    </dependency>
</dependencies>
```

### 5.2 配置文件

**application.yml：**
```yaml
spring:
  elasticsearch:
    uris: http://localhost:9200
    username: elastic
    password: password
    connection-timeout: 5s
    socket-timeout: 60s

# 自定义配置
elasticsearch:
  index:
    prefix: myapp_
    number-of-shards: 3
    number-of-replicas: 1
```

### 5.3 配置类

```java
import co.elastic.clients.elasticsearch.ElasticsearchClient;
import co.elastic.clients.json.jackson.JacksonJsonpMapper;
import co.elastic.clients.transport.ElasticsearchTransport;
import co.elastic.clients.transport.rest_client.RestClientTransport;
import org.apache.http.HttpHost;
import org.elasticsearch.client.RestClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class ElasticsearchConfig {
    
    @Value("${spring.elasticsearch.uris}")
    private String esUrl;
    
    @Bean
    public RestClient restClient() {
        return RestClient.builder(
            HttpHost.create(esUrl)
        ).build();
    }
    
    @Bean
    public ElasticsearchTransport elasticsearchTransport(RestClient restClient) {
        return new RestClientTransport(
            restClient,
            new JacksonJsonpMapper()
        );
    }
    
    @Bean
    public ElasticsearchClient elasticsearchClient(ElasticsearchTransport transport) {
        return new ElasticsearchClient(transport);
    }
}
```

### 5.4 实体类

```java
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.elasticsearch.annotations.Document;
import org.springframework.data.elasticsearch.annotations.Field;
import org.springframework.data.elasticsearch.annotations.FieldType;
import org.springframework.data.elasticsearch.annotations.DateFormat;

import java.util.Date;

@Data
@Document(indexName = "user_index")
public class User {
    
    @Id
    private String id;
    
    @Field(type = FieldType.Text, analyzer = "ik_max_word")
    private String name;
    
    @Field(type = FieldType.Integer)
    private Integer age;
    
    @Field(type = FieldType.Keyword)
    private String email;
    
    @Field(type = FieldType.Text, analyzer = "ik_max_word")
    private String address;
    
    @Field(type = FieldType.Date, format = DateFormat.date_time)
    private Date createTime;
    
    @Field(type = FieldType.Keyword)
    private String status;
}
```

### 5.5 Repository接口

```java
import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserRepository extends ElasticsearchRepository<User, String> {
    
    // 根据名称查询
    List<User> findByName(String name);
    
    // 根据年龄范围查询
    List<User> findByAgeBetween(Integer minAge, Integer maxAge);
    
    // 根据邮箱查询
    User findByEmail(String email);
    
    // 根据名称模糊查询
    List<User> findByNameLike(String name);
    
    // 根据状态查询
    List<User> findByStatus(String status);
}
```

### 5.6 Service层实现

```java
import co.elastic.clients.elasticsearch.ElasticsearchClient;
import co.elastic.clients.elasticsearch._types.query_dsl.Query;
import co.elastic.clients.elasticsearch.core.*;
import co.elastic.clients.elasticsearch.core.search.Hit;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {
    
    private final ElasticsearchClient esClient;
    private final UserRepository userRepository;
    
    private static final String INDEX_NAME = "user_index";
    
    /**
     * 创建索引
     */
    public void createIndex() throws IOException {
        esClient.indices().create(c -> c
            .index(INDEX_NAME)
            .mappings(m -> m
                .properties("name", p -> p.text(t -> t.analyzer("ik_max_word")))
                .properties("age", p -> p.integer(i -> i))
                .properties("email", p -> p.keyword(k -> k))
                .properties("address", p -> p.text(t -> t.analyzer("ik_max_word")))
                .properties("createTime", p -> p.date(d -> d.format("yyyy-MM-dd HH:mm:ss")))
                .properties("status", p -> p.keyword(k -> k))
            )
            .settings(s -> s
                .numberOfShards("3")
                .numberOfReplicas("1")
            )
        );
        log.info("索引创建成功: {}", INDEX_NAME);
    }
    
    /**
     * 删除索引
     */
    public void deleteIndex() throws IOException {
        esClient.indices().delete(d -> d.index(INDEX_NAME));
        log.info("索引删除成功: {}", INDEX_NAME);
    }
    
    /**
     * 添加文档
     */
    public void addUser(User user) throws IOException {
        IndexResponse response = esClient.index(i -> i
            .index(INDEX_NAME)
            .id(user.getId())
            .document(user)
        );
        log.info("文档添加成功, ID: {}", response.id());
    }
    
    /**
     * 批量添加文档
     */
    public void batchAddUsers(List<User> users) throws IOException {
        BulkRequest.Builder br = new BulkRequest.Builder();
        
        for (User user : users) {
            br.operations(op -> op
                .index(idx -> idx
                    .index(INDEX_NAME)
                    .id(user.getId())
                    .document(user)
                )
            );
        }
        
        BulkResponse response = esClient.bulk(br.build());
        
        if (response.errors()) {
            log.error("批量添加失败");
        } else {
            log.info("批量添加成功, 数量: {}", users.size());
        }
    }
    
    /**
     * 根据ID查询
     */
    public User getUserById(String id) throws IOException {
        GetResponse<User> response = esClient.get(g -> g
            .index(INDEX_NAME)
            .id(id),
            User.class
        );
        
        return response.found() ? response.source() : null;
    }
    
    /**
     * 更新文档
     */
    public void updateUser(String id, User user) throws IOException {
        esClient.update(u -> u
            .index(INDEX_NAME)
            .id(id)
            .doc(user),
            User.class
        );
        log.info("文档更新成功, ID: {}", id);
    }
    
    /**
     * 删除文档
     */
    public void deleteUser(String id) throws IOException {
        esClient.delete(d -> d
            .index(INDEX_NAME)
            .id(id)
        );
        log.info("文档删除成功, ID: {}", id);
    }
    
    /**
     * 查询所有
     */
    public List<User> searchAll() throws IOException {
        SearchResponse<User> response = esClient.search(s -> s
            .index(INDEX_NAME)
            .query(q -> q.matchAll(m -> m)),
            User.class
        );
        
        return response.hits().hits().stream()
            .map(Hit::source)
            .collect(Collectors.toList());
    }
    
    /**
     * 根据名称查询
     */
    public List<User> searchByName(String name) throws IOException {
        SearchResponse<User> response = esClient.search(s -> s
            .index(INDEX_NAME)
            .query(q -> q
                .match(m -> m
                    .field("name")
                    .query(name)
                )
            ),
            User.class
        );
        
        return response.hits().hits().stream()
            .map(Hit::source)
            .collect(Collectors.toList());
    }
    
    /**
     * 复合查询（布尔查询）
     */
    public List<User> searchByConditions(String name, Integer minAge, Integer maxAge) 
            throws IOException {
        
        List<Query> mustQueries = new ArrayList<>();
        
        // 名称匹配
        if (name != null && !name.isEmpty()) {
            mustQueries.add(Query.of(q -> q
                .match(m -> m.field("name").query(name))
            ));
        }
        
        // 年龄范围
        if (minAge != null || maxAge != null) {
            mustQueries.add(Query.of(q -> q
                .range(r -> {
                    var range = r.field("age");
                    if (minAge != null) range.gte(minAge.doubleValue());
                    if (maxAge != null) range.lte(maxAge.doubleValue());
                    return range;
                })
            ));
        }
        
        SearchResponse<User> response = esClient.search(s -> s
            .index(INDEX_NAME)
            .query(q -> q
                .bool(b -> b.must(mustQueries))
            ),
            User.class
        );
        
        return response.hits().hits().stream()
            .map(Hit::source)
            .collect(Collectors.toList());
    }
    
    /**
     * 分页查询
     */
    public PageResult<User> searchByPage(String keyword, int page, int size) 
            throws IOException {
        
        SearchResponse<User> response = esClient.search(s -> s
            .index(INDEX_NAME)
            .query(q -> q
                .multiMatch(m -> m
                    .fields("name", "address")
                    .query(keyword)
                )
            )
            .from((page - 1) * size)
            .size(size)
            .sort(so -> so.field(f -> f.field("createTime").order(SortOrder.Desc))),
            User.class
        );
        
        List<User> users = response.hits().hits().stream()
            .map(Hit::source)
            .collect(Collectors.toList());
        
        long total = response.hits().total().value();
        
        return new PageResult<>(users, total, page, size);
    }
    
    /**
     * 高亮查询
     */
    public List<User> searchWithHighlight(String keyword) throws IOException {
        SearchResponse<User> response = esClient.search(s -> s
            .index(INDEX_NAME)
            .query(q -> q
                .match(m -> m.field("name").query(keyword))
            )
            .highlight(h -> h
                .fields("name", hf -> hf
                    .preTags("<em>")
                    .postTags("</em>")
                )
            ),
            User.class
        );
        
        List<User> users = new ArrayList<>();
        for (Hit<User> hit : response.hits().hits()) {
            User user = hit.source();
            // 获取高亮内容
            if (hit.highlight().containsKey("name")) {
                String highlightName = String.join("", hit.highlight().get("name"));
                user.setName(highlightName);
            }
            users.add(user);
        }
        
        return users;
    }
    
    /**
     * 聚合查询 - 统计年龄分布
     */
    public Map<String, Long> aggregateByAge() throws IOException {
        SearchResponse<User> response = esClient.search(s -> s
            .index(INDEX_NAME)
            .size(0)
            .aggregations("age_distribution", a -> a
                .terms(t -> t.field("age"))
            ),
            User.class
        );
        
        Map<String, Long> result = new HashMap<>();
        response.aggregations()
            .get("age_distribution")
            .lterms()
            .buckets()
            .array()
            .forEach(bucket -> {
                result.put(bucket.key().toString(), bucket.docCount());
            });
        
        return result;
    }
}
```

### 5.7 分页结果类

```java
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PageResult<T> {
    
    private List<T> data;
    private long total;
    private int page;
    private int size;
    
    public int getTotalPages() {
        return (int) Math.ceil((double) total / size);
    }
    
    public boolean hasNext() {
        return page < getTotalPages();
    }
    
    public boolean hasPrevious() {
        return page > 1;
    }
}
```

### 5.8 Controller层

```java
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {
    
    private final UserService userService;
    
    /**
     * 创建索引
     */
    @PostMapping("/index")
    public String createIndex() throws IOException {
        userService.createIndex();
        return "索引创建成功";
    }
    
    /**
     * 添加用户
     */
    @PostMapping
    public String addUser(@RequestBody User user) throws IOException {
        userService.addUser(user);
        return "用户添加成功";
    }
    
    /**
     * 批量添加用户
     */
    @PostMapping("/batch")
    public String batchAddUsers(@RequestBody List<User> users) throws IOException {
        userService.batchAddUsers(users);
        return "批量添加成功";
    }
    
    /**
     * 根据ID查询
     */
    @GetMapping("/{id}")
    public User getUserById(@PathVariable String id) throws IOException {
        return userService.getUserById(id);
    }
    
    /**
     * 更新用户
     */
    @PutMapping("/{id}")
    public String updateUser(@PathVariable String id, @RequestBody User user) 
            throws IOException {
        userService.updateUser(id, user);
        return "用户更新成功";
    }
    
    /**
     * 删除用户
     */
    @DeleteMapping("/{id}")
    public String deleteUser(@PathVariable String id) throws IOException {
        userService.deleteUser(id);
        return "用户删除成功";
    }
    
    /**
     * 查询所有
     */
    @GetMapping("/all")
    public List<User> searchAll() throws IOException {
        return userService.searchAll();
    }
    
    /**
     * 根据名称查询
     */
    @GetMapping("/search/name")
    public List<User> searchByName(@RequestParam String name) throws IOException {
        return userService.searchByName(name);
    }
    
    /**
     * 复合查询
     */
    @GetMapping("/search/conditions")
    public List<User> searchByConditions(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) Integer minAge,
            @RequestParam(required = false) Integer maxAge) throws IOException {
        return userService.searchByConditions(name, minAge, maxAge);
    }
    
    /**
     * 分页查询
     */
    @GetMapping("/search/page")
    public PageResult<User> searchByPage(
            @RequestParam String keyword,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) throws IOException {
        return userService.searchByPage(keyword, page, size);
    }
    
    /**
     * 高亮查询
     */
    @GetMapping("/search/highlight")
    public List<User> searchWithHighlight(@RequestParam String keyword) 
            throws IOException {
        return userService.searchWithHighlight(keyword);
    }
    
    /**
     * 聚合查询
     */
    @GetMapping("/aggregate/age")
    public Map<String, Long> aggregateByAge() throws IOException {
        return userService.aggregateByAge();
    }
}
```

## 6. 中文分词器（IK Analyzer）

### 6.1 安装IK分词器

```bash
# 进入ES容器
docker exec -it elasticsearch bash

# 安装IK分词器
./bin/elasticsearch-plugin install https://github.com/medcl/elasticsearch-analysis-ik/releases/download/v8.11.0/elasticsearch-analysis-ik-8.11.0.zip

# 重启ES
docker restart elasticsearch
```

### 6.2 IK分词器使用

**两种分词模式：**

1. **ik_max_word（最细粒度）**：会将文本做最细粒度的拆分
2. **ik_smart（智能分词）**：会做最粗粒度的拆分

**测试分词：**
```bash
# ik_max_word
POST http://localhost:9200/_analyze
{
  "analyzer": "ik_max_word",
  "text": "中华人民共和国国歌"
}

# 结果：中华人民共和国、中华人民、中华、华人、人民共和国、人民、共和国、共和、国、国歌

# ik_smart
POST http://localhost:9200/_analyze
{
  "analyzer": "ik_smart",
  "text": "中华人民共和国国歌"
}

# 结果：中华人民共和国、国歌
```

### 6.3 自定义词典

**创建自定义词典文件：**
```bash
# 进入IK配置目录
cd /usr/share/elasticsearch/plugins/ik/config

# 创建自定义词典
vim custom.dic
```

**添加自定义词：**
```
弹幕
鬼畜
二次元
```

**配置IK：**
```xml
<!-- IKAnalyzer.cfg.xml -->
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE properties SYSTEM "http://java.sun.com/dtd/properties.dtd">
<properties>
    <comment>IK Analyzer 扩展配置</comment>
    <entry key="ext_dict">custom.dic</entry>
    <entry key="ext_stopwords">stopword.dic</entry>
</properties>
```

## 7. 实战案例

### 7.1 商品搜索系统

**商品实体类：**
```java
@Data
@Document(indexName = "product_index")
public class Product {
    
    @Id
    private String id;
    
    @Field(type = FieldType.Text, analyzer = "ik_max_word")
    private String name;
    
    @Field(type = FieldType.Text, analyzer = "ik_max_word")
    private String description;
    
    @Field(type = FieldType.Keyword)
    private String category;
    
    @Field(type = FieldType.Keyword)
    private String brand;
    
    @Field(type = FieldType.Double)
    private Double price;
    
    @Field(type = FieldType.Integer)
    private Integer stock;
    
    @Field(type = FieldType.Integer)
    private Integer sales;
    
    @Field(type = FieldType.Double)
    private Double rating;
    
    @Field(type = FieldType.Keyword)
    private List<String> tags;
    
    @Field(type = FieldType.Date)
    private Date createTime;
}
```

**商品搜索Service：**
```java
@Service
@RequiredArgsConstructor
public class ProductSearchService {
    
    private final ElasticsearchClient esClient;
    
    /**
     * 综合搜索（支持多条件、排序、分页）
     */
    public PageResult<Product> search(ProductSearchDTO searchDTO) throws IOException {
        
        List<Query> mustQueries = new ArrayList<>();
        List<Query> filterQueries = new ArrayList<>();
        
        // 关键词搜索
        if (StringUtils.hasText(searchDTO.getKeyword())) {
            mustQueries.add(Query.of(q -> q
                .multiMatch(m -> m
                    .fields("name^3", "description^2", "brand")  // ^表示权重
                    .query(searchDTO.getKeyword())
                    .fuzziness("AUTO")  // 模糊匹配
                )
            ));
        }
        
        // 分类筛选
        if (StringUtils.hasText(searchDTO.getCategory())) {
            filterQueries.add(Query.of(q -> q
                .term(t -> t.field("category").value(searchDTO.getCategory()))
            ));
        }
        
        // 品牌筛选
        if (StringUtils.hasText(searchDTO.getBrand())) {
            filterQueries.add(Query.of(q -> q
                .term(t -> t.field("brand").value(searchDTO.getBrand()))
            ));
        }
        
        // 价格范围
        if (searchDTO.getMinPrice() != null || searchDTO.getMaxPrice() != null) {
            filterQueries.add(Query.of(q -> q
                .range(r -> {
                    var range = r.field("price");
                    if (searchDTO.getMinPrice() != null) {
                        range.gte(searchDTO.getMinPrice());
                    }
                    if (searchDTO.getMaxPrice() != null) {
                        range.lte(searchDTO.getMaxPrice());
                    }
                    return range;
                })
            ));
        }
        
        // 评分筛选
        if (searchDTO.getMinRating() != null) {
            filterQueries.add(Query.of(q -> q
                .range(r -> r.field("rating").gte(searchDTO.getMinRating()))
            ));
        }
        
        // 标签筛选
        if (searchDTO.getTags() != null && !searchDTO.getTags().isEmpty()) {
            filterQueries.add(Query.of(q -> q
                .terms(t -> t.field("tags").terms(tv -> tv
                    .value(searchDTO.getTags().stream()
                        .map(FieldValue::of)
                        .collect(Collectors.toList()))
                ))
            ));
        }
        
        // 排序
        List<SortOptions> sortOptions = new ArrayList<>();
        if ("price_asc".equals(searchDTO.getSort())) {
            sortOptions.add(SortOptions.of(s -> s
                .field(f -> f.field("price").order(SortOrder.Asc))
            ));
        } else if ("price_desc".equals(searchDTO.getSort())) {
            sortOptions.add(SortOptions.of(s -> s
                .field(f -> f.field("price").order(SortOrder.Desc))
            ));
        } else if ("sales".equals(searchDTO.getSort())) {
            sortOptions.add(SortOptions.of(s -> s
                .field(f -> f.field("sales").order(SortOrder.Desc))
            ));
        } else if ("rating".equals(searchDTO.getSort())) {
            sortOptions.add(SortOptions.of(s -> s
                .field(f -> f.field("rating").order(SortOrder.Desc))
            ));
        }
        // 默认按相关度排序
        sortOptions.add(SortOptions.of(s -> s.score(sc -> sc.order(SortOrder.Desc))));
        
        // 执行搜索
        SearchResponse<Product> response = esClient.search(s -> {
            var search = s.index("product_index")
                .from((searchDTO.getPage() - 1) * searchDTO.getSize())
                .size(searchDTO.getSize())
                .sort(sortOptions);
            
            // 构建查询
            if (!mustQueries.isEmpty() || !filterQueries.isEmpty()) {
                search.query(q -> q.bool(b -> {
                    if (!mustQueries.isEmpty()) {
                        b.must(mustQueries);
                    }
                    if (!filterQueries.isEmpty()) {
                        b.filter(filterQueries);
                    }
                    return b;
                }));
            } else {
                search.query(q -> q.matchAll(m -> m));
            }
            
            // 高亮
            if (StringUtils.hasText(searchDTO.getKeyword())) {
                search.highlight(h -> h
                    .fields("name", hf -> hf.preTags("<em>").postTags("</em>"))
                    .fields("description", hf -> hf.preTags("<em>").postTags("</em>"))
                );
            }
            
            return search;
        }, Product.class);
        
        // 处理结果
        List<Product> products = response.hits().hits().stream()
            .map(hit -> {
                Product product = hit.source();
                // 设置高亮
                if (hit.highlight().containsKey("name")) {
                    product.setName(String.join("", hit.highlight().get("name")));
                }
                if (hit.highlight().containsKey("description")) {
                    product.setDescription(String.join("", hit.highlight().get("description")));
                }
                return product;
            })
            .collect(Collectors.toList());
        
        long total = response.hits().total().value();
        
        return new PageResult<>(products, total, searchDTO.getPage(), searchDTO.getSize());
    }
    
    /**
     * 搜索建议（自动补全）
     */
    public List<String> suggest(String prefix) throws IOException {
        // 实现搜索建议逻辑
        SearchResponse<Product> response = esClient.search(s -> s
            .index("product_index")
            .suggest(sg -> sg
                .suggesters("name_suggest", ss -> ss
                    .prefix(prefix)
                    .completion(c -> c.field("name.suggest"))
                )
            ),
            Product.class
        );
        
        // 提取建议结果
        return response.suggest().get("name_suggest").stream()
            .flatMap(suggest -> suggest.completion().options().stream())
            .map(option -> option.text())
            .collect(Collectors.toList());
    }
}
```

**搜索DTO：**
```java
@Data
public class ProductSearchDTO {
    private String keyword;
    private String category;
    private String brand;
    private Double minPrice;
    private Double maxPrice;
    private Double minRating;
    private List<String> tags;
    private String sort;  // price_asc, price_desc, sales, rating
    private Integer page = 1;
    private Integer size = 20;
}
```

### 7.2 日志分析系统

```java
@Data
@Document(indexName = "log_index")
public class LogEntry {
    
    @Id
    private String id;
    
    @Field(type = FieldType.Keyword)
    private String level;  // INFO, WARN, ERROR
    
    @Field(type = FieldType.Text)
    private String message;
    
    @Field(type = FieldType.Keyword)
    private String service;
    
    @Field(type = FieldType.Keyword)
    private String host;
    
    @Field(type = FieldType.Date)
    private Date timestamp;
    
    @Field(type = FieldType.Keyword)
    private String traceId;
    
    @Field(type = FieldType.Object)
    private Map<String, Object> metadata;
}

@Service
public class LogAnalysisService {
    
    /**
     * 统计错误日志
     */
    public Map<String, Long> analyzeErrorLogs(Date startTime, Date endTime) 
            throws IOException {
        
        SearchResponse<LogEntry> response = esClient.search(s -> s
            .index("log_index")
            .size(0)
            .query(q -> q
                .bool(b -> b
                    .must(m -> m.term(t -> t.field("level").value("ERROR")))
                    .filter(f -> f.range(r -> r
                        .field("timestamp")
                        .gte(startTime.getTime())
                        .lte(endTime.getTime())
                    ))
                )
            )
            .aggregations("by_service", a -> a
                .terms(t -> t.field("service"))
            ),
            LogEntry.class
        );
        
        // 处理聚合结果
        return response.aggregations()
            .get("by_service")
            .sterms()
            .buckets()
            .array()
            .stream()
            .collect(Collectors.toMap(
                bucket -> bucket.key().stringValue(),
                bucket -> bucket.docCount()
            ));
    }
}
```

## 8. 性能优化

### 8.1 索引优化

**1. 合理设置分片数：**
```java
// 小索引：1-2个分片
// 中等索引：3-5个分片
// 大索引：根据数据量计算，每个分片20-50GB

PUT /my_index
{
  "settings": {
    "number_of_shards": 3,
    "number_of_replicas": 1
  }
}
```

**2. 禁用不需要的功能：**
```java
PUT /my_index
{
  "mappings": {
    "properties": {
      "description": {
        "type": "text",
        "index": false,  // 不需要搜索
        "norms": false   // 不需要评分
      }
    }
  }
}
```

**3. 使用批量操作：**
```java
// 批量索引，提高性能
BulkRequest.Builder br = new BulkRequest.Builder();
for (Document doc : documents) {
    br.operations(op -> op.index(idx -> idx
        .index("my_index")
        .document(doc)
    ));
}
esClient.bulk(br.build());
```

### 8.2 查询优化

**1. 使用filter代替query：**
```java
// filter不计算评分，性能更好
GET /my_index/_search
{
  "query": {
    "bool": {
      "must": [
        { "match": { "title": "elasticsearch" } }
      ],
      "filter": [  // 使用filter
        { "term": { "status": "published" } },
        { "range": { "date": { "gte": "2025-01-01" } } }
      ]
    }
  }
}
```

**2. 使用term查询代替match：**
```java
// keyword字段使用term查询
{ "term": { "category": "electronics" } }

// 而不是
{ "match": { "category": "electronics" } }
```

**3. 限制返回字段：**
```java
GET /my_index/_search
{
  "_source": ["id", "name", "price"],  // 只返回需要的字段
  "query": { "match_all": {} }
}
```

### 8.3 硬件优化

**1. 内存配置：**
```bash
# 堆内存设置为物理内存的50%，最大不超过32GB
-Xms16g
-Xmx16g
```

**2. 使用SSD：**
```
SSD比HDD快10-100倍
推荐使用SSD存储ES数据
```

**3. 增加节点：**
```
水平扩展：增加数据节点
垂直扩展：增加单个节点的资源
```

## 9. 监控与运维

### 9.1 集群健康检查

```bash
# 查看集群健康状态
GET /_cluster/health

# 查看节点信息
GET /_cat/nodes?v

# 查看索引状态
GET /_cat/indices?v

# 查看分片分配
GET /_cat/shards?v
```

### 9.2 常用监控指标

```java
@Service
public class ElasticsearchMonitorService {
    
    /**
     * 获取集群健康状态
     */
    public ClusterHealth getClusterHealth() throws IOException {
        return esClient.cluster().health().status();
    }
    
    /**
     * 获取节点统计信息
     */
    public NodesStatsResponse getNodesStats() throws IOException {
        return esClient.nodes().stats();
    }
    
    /**
     * 获取索引统计信息
     */
    public IndicesStatsResponse getIndicesStats() throws IOException {
        return esClient.indices().stats();
    }
}
```

### 9.3 备份与恢复

```bash
# 创建快照仓库
PUT /_snapshot/my_backup
{
  "type": "fs",
  "settings": {
    "location": "/mount/backups/my_backup"
  }
}

# 创建快照
PUT /_snapshot/my_backup/snapshot_1
{
  "indices": "index_1,index_2",
  "ignore_unavailable": true,
  "include_global_state": false
}

# 恢复快照
POST /_snapshot/my_backup/snapshot_1/_restore
{
  "indices": "index_1,index_2"
}
```

## 10. 最佳实践

### 10.1 索引设计

1. **合理规划索引结构**
   - 避免过度分片
   - 使用别名管理索引
   - 定期清理旧数据

2. **选择合适的数据类型**
   - 精确匹配用keyword
   - 全文检索用text
   - 数值范围查询用数值类型

3. **优化映射配置**
   - 禁用不需要的功能
   - 合理设置分词器
   - 使用动态模板

### 10.2 查询优化

1. **使用合适的查询类型**
   - 精确匹配用term
   - 全文检索用match
   - 多条件用bool

2. **利用缓存**
   - filter查询会被缓存
   - 常用查询使用filter

3. **分页优化**
   - 深度分页使用scroll或search_after
   - 避免使用from+size进行深度分页

### 10.3 安全建议

1. **启用安全认证**
```yaml
xpack.security.enabled: true
xpack.security.transport.ssl.enabled: true
```

2. **设置访问控制**
```bash
# 创建用户
POST /_security/user/my_user
{
  "password": "password",
  "roles": ["my_role"]
}
```

3. **限制网络访问**
```yaml
network.host: 127.0.0.1  # 只允许本地访问
```

## 11. 总结

### 11.1 关键要点

| 主题 | 要点 |
|------|------|
| **核心概念** | Index、Document、Mapping、Shard |
| **数据类型** | text、keyword、数值、日期等 |
| **查询DSL** | match、term、bool、range、聚合 |
| **Java集成** | Spring Data ES、Elasticsearch Java Client |
| **中文分词** | IK Analyzer（ik_max_word、ik_smart） |
| **性能优化** | 批量操作、filter查询、合理分片 |
| **监控运维** | 健康检查、备份恢复、性能监控 |

### 11.2 学习建议

1. **理解核心概念**：索引、文档、映射、分片
2. **掌握查询DSL**：各种查询类型和组合
3. **实践Java集成**：Spring Boot + ES
4. **学习性能优化**：索引设计、查询优化
5. **关注版本更新**：ES更新较快，关注新特性

### 11.3 推荐资源

**官方文档：**
- [Elasticsearch官方文档](https://www.elastic.co/guide/en/elasticsearch/reference/current/index.html)
- [Elasticsearch Java Client](https://www.elastic.co/guide/en/elasticsearch/client/java-api-client/current/index.html)

**书籍：**
- 《Elasticsearch权威指南》
- 《深入理解Elasticsearch》
- 《Elasticsearch实战》

**在线资源：**
- [Elastic中文社区](https://elasticsearch.cn/)
- [Elasticsearch GitHub](https://github.com/elastic/elasticsearch)

**工具：**
- Kibana：数据可视化和管理
- Logstash：数据采集和处理
- Beats：轻量级数据采集器

## 参考资源

- [Elasticsearch官方文档](https://www.elastic.co/guide/en/elasticsearch/reference/current/index.html)
- [Spring Data Elasticsearch](https://spring.io/projects/spring-data-elasticsearch)
- [IK中文分词器](https://github.com/medcl/elasticsearch-analysis-ik)
- [Elasticsearch Java API Client](https://www.elastic.co/guide/en/elasticsearch/client/java-api-client/current/index.html)

