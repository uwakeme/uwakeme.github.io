---
title: 【大数据】Elasticsearch 8.x 入门指南：基础概念与环境搭建
categories: 大数据
date: 2025-01-19 18:00:00
tags:
  - Elasticsearch
  - 搜索引擎
  - 入门教程
  - Docker
  - Java客户端
series: Elasticsearch系列
cover: 
---

# 前言

Elasticsearch是一个基于Apache Lucene构建的分布式搜索和分析引擎，为全文搜索、结构化搜索、分析提供了强大的解决方案。本文是Elasticsearch 8.x系列教程的入门篇，将帮助初学者快速理解核心概念并搭建开发环境。

> **系列文章导航**
> - 🟢 **入门级**：基础概念与环境搭建（本文）
> - 🟡 [进阶级：复杂查询与聚合分析](./【大数据】Elasticsearch%208.x%20进阶指南：复杂查询与聚合分析.md)
> - 🔴 [高级：集群管理与企业级应用](./【大数据】Elasticsearch%208.x%20高级指南：集群管理与企业级应用.md)

# 一、核心概念与架构

## （一）基础概念

### 1. 核心组件

**集群（Cluster）**
- 一个或多个节点的集合
- 共同提供索引和搜索功能
- 具有唯一的集群名称

**节点（Node）**
- 集群中的单个服务器
- 存储数据并参与索引和搜索
- 每个节点都有唯一的名称

**索引（Index）**
- 具有相似特征的文档集合
- 类似于关系数据库中的数据库
- 索引名称必须是小写字母

**文档（Document）**
- 可被索引的基础信息单元
- 以JSON格式表示
- 类似于关系数据库中的行

**分片（Shard）**
- 索引的水平分割
- 提供分布式存储和并行处理能力
- 分为主分片和副本分片

### 2. 应用场景

**主要应用场景：**

- **网站搜索** - 电商商品搜索、内容搜索
- **日志分析** - 系统日志、应用日志分析  
- **实时分析** - 业务指标监控、用户行为分析
- **全文搜索** - 文档检索、知识库搜索

## （二）Elasticsearch 8.x 新特性

### 1. 主要改进

- **新的Java客户端**：Elasticsearch Java API Client替代已废弃的RestHighLevelClient
- **增强的安全性**：默认启用安全功能，改进的身份验证和授权
- **向量搜索**：原生支持kNN搜索，适用于AI和机器学习场景
- **性能优化**：改进的索引和查询性能，更好的内存管理

### 2. 客户端变化

```java
// 8.x 推荐使用新的 Java API Client
ElasticsearchClient client = new ElasticsearchClient(transport);

// 替代已废弃的 RestHighLevelClient（7.x）
// RestHighLevelClient client = new RestHighLevelClient(...);
```

# 二、环境搭建与配置

## （一）Docker安装（推荐）

### 1. 安装Elasticsearch

```bash
# 拉取Elasticsearch 8.x镜像
docker pull docker.elastic.co/elasticsearch/elasticsearch:8.12.0

# 运行单节点集群（开发环境）
docker run -d \
  --name elasticsearch \
  -p 9200:9200 \
  -p 9300:9300 \
  -e "discovery.type=single-node" \
  -e "xpack.security.enabled=false" \
  -e "ES_JAVA_OPTS=-Xms512m -Xmx512m" \
  docker.elastic.co/elasticsearch/elasticsearch:8.12.0
```

### 2. 验证安装

```bash
# 检查Elasticsearch是否启动成功
curl http://localhost:9200

# 预期返回结果
{
  "name" : "node-1",
  "cluster_name" : "docker-cluster",
  "cluster_uuid" : "...",
  "version" : {
    "number" : "8.12.0",
    "build_flavor" : "default",
    "build_type" : "docker",
    "build_hash" : "...",
    "build_date" : "...",
    "build_snapshot" : false,
    "lucene_version" : "9.8.0",
    "minimum_wire_compatibility_version" : "7.17.0",
    "minimum_index_compatibility_version" : "7.0.0"
  },
  "tagline" : "You Know, for Search"
}
```

### 3. 基础配置

```yaml
# elasticsearch.yml 核心配置
cluster.name: my-elasticsearch-cluster
node.name: node-1
path.data: /var/lib/elasticsearch
path.logs: /var/log/elasticsearch
network.host: 0.0.0.0
http.port: 9200
discovery.type: single-node

# 内存设置
bootstrap.memory_lock: true
```

## （二）Spring Boot 3 集成

### 1. 项目依赖

```xml
<!-- pom.xml -->
<dependencies>
    <!-- Spring Boot 3 -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
        <version>3.2.0</version>
    </dependency>
    
    <!-- Elasticsearch Java API Client -->
    <dependency>
        <groupId>co.elastic.clients</groupId>
        <artifactId>elasticsearch-java</artifactId>
        <version>8.12.0</version>
    </dependency>
    
    <!-- Jackson JSON处理 -->
    <dependency>
        <groupId>com.fasterxml.jackson.core</groupId>
        <artifactId>jackson-databind</artifactId>
    </dependency>
    
    <!-- Apache HTTP Client -->
    <dependency>
        <groupId>org.apache.httpcomponents.client5</groupId>
        <artifactId>httpclient5</artifactId>
    </dependency>
</dependencies>
```

### 2. 客户端配置

```java
@Configuration
public class ElasticsearchConfig {
    
    @Value("${elasticsearch.host:localhost}")
    private String host;
    
    @Value("${elasticsearch.port:9200}")
    private int port;
    
    /**
     * 配置Elasticsearch客户端
     * 使用新的Java API Client，替代已废弃的RestHighLevelClient
     */
    @Bean
    public ElasticsearchClient elasticsearchClient() {
        // 创建低级别REST客户端
        RestClient restClient = RestClient.builder(
            new HttpHost(host, port, "http")
        ).build();
        
        // 创建传输层，使用Jackson进行JSON序列化
        ElasticsearchTransport transport = new RestClientTransport(
            restClient, new JacksonJsonpMapper()
        );
        
        // 创建高级别客户端
        return new ElasticsearchClient(transport);
    }
}
```

### 3. 应用配置

```yaml
# application.yml
elasticsearch:
  host: localhost
  port: 9200

spring:
  application:
    name: elasticsearch-demo
  
logging:
  level:
    co.elastic.clients: DEBUG  # 开启Elasticsearch客户端日志
```

# 三、基础索引操作

## （一）索引管理

### 1. 创建简单索引

```java
@Service
public class IndexService {
    
    @Autowired
    private ElasticsearchClient client;
    
    /**
     * 创建简单索引
     */
    public void createSimpleIndex(String indexName) throws IOException {
        // 检查索引是否已存在
        if (indexExists(indexName)) {
            System.out.println("索引 " + indexName + " 已存在");
            return;
        }
        
        // 创建索引请求
        CreateIndexRequest request = CreateIndexRequest.of(i -> i
            .index(indexName)
            .settings(s -> s
                .numberOfShards("1")      // 主分片数量
                .numberOfReplicas("0")    // 副本数量（单节点设为0）
            )
        );
        
        // 执行创建
        CreateIndexResponse response = client.indices().create(request);
        System.out.println("索引创建结果: " + response.acknowledged());
    }
    
    /**
     * 检查索引是否存在
     */
    public boolean indexExists(String indexName) throws IOException {
        ExistsRequest request = ExistsRequest.of(e -> e.index(indexName));
        return client.indices().exists(request).value();
    }
    
    /**
     * 删除索引
     */
    public void deleteIndex(String indexName) throws IOException {
        DeleteIndexRequest request = DeleteIndexRequest.of(d -> d.index(indexName));
        DeleteIndexResponse response = client.indices().delete(request);
        System.out.println("索引删除结果: " + response.acknowledged());
    }
}
```

### 2. 带映射的索引创建

```java
/**
 * 创建带映射的索引
 */
public void createIndexWithMapping(String indexName) throws IOException {
    // 定义索引映射
    TypeMapping mapping = TypeMapping.of(m -> m
        .properties("id", Property.of(p -> p.keyword(k -> k)))
        .properties("title", Property.of(p -> p.text(t -> t
            .analyzer("standard")  // 使用标准分析器
        )))
        .properties("content", Property.of(p -> p.text(t -> t
            .analyzer("standard")
        )))
        .properties("createTime", Property.of(p -> p.date(d -> d
            .format("yyyy-MM-dd HH:mm:ss")
        )))
        .properties("tags", Property.of(p -> p.keyword(k -> k)))
    );
    
    // 创建索引请求
    CreateIndexRequest request = CreateIndexRequest.of(i -> i
        .index(indexName)
        .mappings(mapping)
        .settings(s -> s
            .numberOfShards("1")
            .numberOfReplicas("0")
        )
    );
    
    // 执行创建
    CreateIndexResponse response = client.indices().create(request);
    System.out.println("带映射的索引创建结果: " + response.acknowledged());
}
```

## （二）文档操作

### 1. 文档实体类

```java
/**
 * 简单文档实体类
 */
public class SimpleDocument {
    private String id;
    private String title;
    private String content;
    private String createTime;
    private List<String> tags;
    
    // 构造函数
    public SimpleDocument() {}
    
    public SimpleDocument(String id, String title, String content) {
        this.id = id;
        this.title = title;
        this.content = content;
        this.createTime = LocalDateTime.now().format(
            DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")
        );
        this.tags = new ArrayList<>();
    }
    
    // Getter和Setter方法
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    
    public String getCreateTime() { return createTime; }
    public void setCreateTime(String createTime) { this.createTime = createTime; }
    
    public List<String> getTags() { return tags; }
    public void setTags(List<String> tags) { this.tags = tags; }
}
```

### 2. 基础文档操作

```java
@Service
public class DocumentService {
    
    @Autowired
    private ElasticsearchClient client;
    
    /**
     * 添加文档
     */
    public void addDocument(String indexName, SimpleDocument document) throws IOException {
        IndexRequest<SimpleDocument> request = IndexRequest.of(i -> i
            .index(indexName)
            .id(document.getId())
            .document(document)
        );
        
        IndexResponse response = client.index(request);
        System.out.println("文档添加结果: " + response.result());
    }
    
    /**
     * 获取文档
     */
    public SimpleDocument getDocument(String indexName, String id) throws IOException {
        GetRequest request = GetRequest.of(g -> g
            .index(indexName)
            .id(id)
        );
        
        GetResponse<SimpleDocument> response = client.get(request, SimpleDocument.class);
        
        if (response.found()) {
            return response.source();
        }
        return null;
    }
    
    /**
     * 更新文档
     */
    public void updateDocument(String indexName, String id, SimpleDocument document) throws IOException {
        UpdateRequest<SimpleDocument, SimpleDocument> request = UpdateRequest.of(u -> u
            .index(indexName)
            .id(id)
            .doc(document)
        );
        
        UpdateResponse<SimpleDocument> response = client.update(request, SimpleDocument.class);
        System.out.println("文档更新结果: " + response.result());
    }
    
    /**
     * 删除文档
     */
    public void deleteDocument(String indexName, String id) throws IOException {
        DeleteRequest request = DeleteRequest.of(d -> d
            .index(indexName)
            .id(id)
        );
        
        DeleteResponse response = client.delete(request);
        System.out.println("文档删除结果: " + response.result());
    }
}
```

# 四、基础查询操作

## （一）简单查询

### 1. 查询所有文档

```java
@Service
public class SimpleSearchService {
    
    @Autowired
    private ElasticsearchClient client;
    
    /**
     * 查询所有文档
     */
    public List<SimpleDocument> searchAll(String indexName) throws IOException {
        SearchRequest request = SearchRequest.of(s -> s
            .index(indexName)
            .query(q -> q.matchAll(m -> m))
            .size(10)  // 限制返回数量
        );
        
        SearchResponse<SimpleDocument> response = client.search(request, SimpleDocument.class);
        
        return response.hits().hits().stream()
                .map(Hit::source)
                .collect(Collectors.toList());
    }
    
    /**
     * 根据标题搜索
     */
    public List<SimpleDocument> searchByTitle(String indexName, String title) throws IOException {
        SearchRequest request = SearchRequest.of(s -> s
            .index(indexName)
            .query(q -> q
                .match(m -> m
                    .field("title")
                    .query(title)
                )
            )
        );
        
        SearchResponse<SimpleDocument> response = client.search(request, SimpleDocument.class);
        
        return response.hits().hits().stream()
                .map(Hit::source)
                .collect(Collectors.toList());
    }
    
    /**
     * 精确匹配查询
     */
    public List<SimpleDocument> searchByTag(String indexName, String tag) throws IOException {
        SearchRequest request = SearchRequest.of(s -> s
            .index(indexName)
            .query(q -> q
                .term(t -> t
                    .field("tags")
                    .value(tag)
                )
            )
        );
        
        SearchResponse<SimpleDocument> response = client.search(request, SimpleDocument.class);
        
        return response.hits().hits().stream()
                .map(Hit::source)
                .collect(Collectors.toList());
    }
}
```

## （二）实践示例

### 1. 完整的CRUD示例

```java
@RestController
@RequestMapping("/api/documents")
public class DocumentController {
    
    @Autowired
    private IndexService indexService;
    
    @Autowired
    private DocumentService documentService;
    
    @Autowired
    private SimpleSearchService searchService;
    
    private static final String INDEX_NAME = "my_documents";
    
    /**
     * 初始化索引
     */
    @PostMapping("/init")
    public ResponseEntity<String> initIndex() {
        try {
            indexService.createIndexWithMapping(INDEX_NAME);
            return ResponseEntity.ok("索引创建成功");
        } catch (IOException e) {
            return ResponseEntity.status(500).body("索引创建失败: " + e.getMessage());
        }
    }
    
    /**
     * 添加文档
     */
    @PostMapping
    public ResponseEntity<String> addDocument(@RequestBody SimpleDocument document) {
        try {
            documentService.addDocument(INDEX_NAME, document);
            return ResponseEntity.ok("文档添加成功");
        } catch (IOException e) {
            return ResponseEntity.status(500).body("文档添加失败: " + e.getMessage());
        }
    }
    
    /**
     * 获取文档
     */
    @GetMapping("/{id}")
    public ResponseEntity<SimpleDocument> getDocument(@PathVariable String id) {
        try {
            SimpleDocument document = documentService.getDocument(INDEX_NAME, id);
            if (document != null) {
                return ResponseEntity.ok(document);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (IOException e) {
            return ResponseEntity.status(500).build();
        }
    }
    
    /**
     * 搜索文档
     */
    @GetMapping("/search")
    public ResponseEntity<List<SimpleDocument>> searchDocuments(@RequestParam String title) {
        try {
            List<SimpleDocument> documents = searchService.searchByTitle(INDEX_NAME, title);
            return ResponseEntity.ok(documents);
        } catch (IOException e) {
            return ResponseEntity.status(500).build();
        }
    }
}
```

# 五、总结与下一步

## （一）本文总结

通过本文的学习，您已经掌握了：

1. **核心概念**：集群、节点、索引、文档、分片等基础概念
2. **环境搭建**：使用Docker快速搭建Elasticsearch开发环境
3. **Java集成**：在Spring Boot 3中集成Elasticsearch 8.x客户端
4. **基础操作**：索引的创建、文档的CRUD操作、简单查询

## （二）学习建议

**入门阶段重点：**
- 熟练掌握基础概念和术语
- 能够独立搭建开发环境
- 掌握基本的索引和文档操作
- 理解简单查询的使用方法

**实践建议：**
- 动手搭建本地环境并运行示例代码
- 尝试创建不同类型的索引和文档
- 练习各种基础查询操作
- 观察Elasticsearch的日志输出

## （三）下一步学习

完成入门学习后，建议继续学习：

🟡 **进阶级教程**：
- 复杂查询（布尔查询、范围查询、模糊查询）
- 聚合分析（桶聚合、指标聚合）
- 性能优化基础
- 实战案例开发

🔴 **高级教程**：
- 集群管理与运维
- 深度性能优化
- 企业级应用架构
- 安全配置与监控

## （四）参考资料

- [Elasticsearch官方文档](https://www.elastic.co/guide/en/elasticsearch/reference/8.12/index.html)
- [Elasticsearch Java API Client文档](https://www.elastic.co/guide/en/elasticsearch/client/java-api-client/8.12/index.html)
- [Spring Boot官方文档](https://spring.io/projects/spring-boot)

---

> **系列文章导航**
> - 🟢 **入门级**：基础概念与环境搭建（本文）
> - 🟡 [进阶级：复杂查询与聚合分析](./【大数据】Elasticsearch%208.x%20进阶指南：复杂查询与聚合分析.md)
> - 🔴 [高级：集群管理与企业级应用](./【大数据】Elasticsearch%208.x%20高级指南：集群管理与企业级应用.md)