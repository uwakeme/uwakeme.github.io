---
title: 【大数据】Elasticsearch 8.x 高级指南：集群管理与企业级应用
categories: 大数据
date: 2025-01-19 18:15:00
tags:
  - Elasticsearch
  - 集群管理
  - 企业级应用
  - 性能调优
  - 安全配置
  - 监控运维
series: Elasticsearch系列
cover: 
---

# 前言

本文是Elasticsearch系列的高级教程，面向有丰富Elasticsearch使用经验的开发者和运维工程师。将深入探讨集群架构设计、性能深度调优、企业级安全配置、监控运维等高级主题，帮助您构建生产级的Elasticsearch解决方案。

> **系列文章导航**
> - 🟢 [入门级：基础概念与环境搭建](./【大数据】Elasticsearch%208.x%20入门指南：基础概念与环境搭建.md)
> - 🟡 [进阶级：复杂查询与聚合分析](./【大数据】Elasticsearch%208.x%20进阶指南：复杂查询与聚合分析.md)
> - 🔴 **高级**：集群管理与企业级应用（本文）

# 一、集群架构设计

## （一）集群规划与设计

### 1. 节点角色规划

```yaml
# master-eligible节点配置
# elasticsearch.yml
cluster.name: production-cluster
node.name: master-node-1
node.roles: [master]
discovery.seed_hosts: ["master-node-1", "master-node-2", "master-node-3"]
cluster.initial_master_nodes: ["master-node-1", "master-node-2", "master-node-3"]

# 网络配置
network.host: 0.0.0.0
http.port: 9200
transport.port: 9300

# 内存配置
bootstrap.memory_lock: true

# 安全配置
xpack.security.enabled: true
xpack.security.transport.ssl.enabled: true
xpack.security.http.ssl.enabled: true
```

```yaml
# 数据节点配置
# elasticsearch.yml
cluster.name: production-cluster
node.name: data-node-1
node.roles: [data, data_content, data_hot, data_warm, data_cold]
discovery.seed_hosts: ["master-node-1", "master-node-2", "master-node-3"]

# 数据路径配置
path.data: ["/data1/elasticsearch", "/data2/elasticsearch"]
path.logs: "/var/log/elasticsearch"

# 内存和性能配置
bootstrap.memory_lock: true
indices.memory.index_buffer_size: 30%
indices.breaker.total.limit: 70%
```

```yaml
# 协调节点配置
# elasticsearch.yml
cluster.name: production-cluster
node.name: coordinating-node-1
node.roles: []  # 仅作为协调节点
discovery.seed_hosts: ["master-node-1", "master-node-2", "master-node-3"]

# 网络配置
network.host: 0.0.0.0
http.port: 9200

# 搜索线程池配置
thread_pool.search.size: 16
thread_pool.search.queue_size: 1000
```

### 2. 硬件资源规划

```bash
# 生产环境硬件推荐配置

# Master节点
# CPU: 4-8核
# 内存: 8-16GB
# 存储: SSD 100GB+
# 网络: 1Gbps+

# 数据节点
# CPU: 16-32核
# 内存: 64-128GB (堆内存不超过32GB)
# 存储: SSD 1TB+ (多磁盘RAID配置)
# 网络: 10Gbps+

# 协调节点
# CPU: 8-16核
# 内存: 32-64GB
# 存储: SSD 200GB+
# 网络: 10Gbps+
```

## （二）集群部署与管理

### 1. Docker Compose集群部署

```yaml
# docker-compose.yml
version: '3.8'

services:
  es-master-1:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.12.0
    container_name: es-master-1
    environment:
      - node.name=es-master-1
      - cluster.name=production-cluster
      - node.roles=master
      - discovery.seed_hosts=es-master-1,es-master-2,es-master-3
      - cluster.initial_master_nodes=es-master-1,es-master-2,es-master-3
      - bootstrap.memory_lock=true
      - "ES_JAVA_OPTS=-Xms4g -Xmx4g"
      - xpack.security.enabled=false
    ulimits:
      memlock:
        soft: -1
        hard: -1
    volumes:
      - master1_data:/usr/share/elasticsearch/data
      - ./config/elasticsearch.yml:/usr/share/elasticsearch/config/elasticsearch.yml
    ports:
      - "9201:9200"
    networks:
      - elastic

  es-master-2:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.12.0
    container_name: es-master-2
    environment:
      - node.name=es-master-2
      - cluster.name=production-cluster
      - node.roles=master
      - discovery.seed_hosts=es-master-1,es-master-2,es-master-3
      - cluster.initial_master_nodes=es-master-1,es-master-2,es-master-3
      - bootstrap.memory_lock=true
      - "ES_JAVA_OPTS=-Xms4g -Xmx4g"
      - xpack.security.enabled=false
    ulimits:
      memlock:
        soft: -1
        hard: -1
    volumes:
      - master2_data:/usr/share/elasticsearch/data
    ports:
      - "9202:9200"
    networks:
      - elastic

  es-master-3:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.12.0
    container_name: es-master-3
    environment:
      - node.name=es-master-3
      - cluster.name=production-cluster
      - node.roles=master
      - discovery.seed_hosts=es-master-1,es-master-2,es-master-3
      - cluster.initial_master_nodes=es-master-1,es-master-2,es-master-3
      - bootstrap.memory_lock=true
      - "ES_JAVA_OPTS=-Xms4g -Xmx4g"
      - xpack.security.enabled=false
    ulimits:
      memlock:
        soft: -1
        hard: -1
    volumes:
      - master3_data:/usr/share/elasticsearch/data
    ports:
      - "9203:9200"
    networks:
      - elastic

  es-data-1:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.12.0
    container_name: es-data-1
    environment:
      - node.name=es-data-1
      - cluster.name=production-cluster
      - node.roles=data,data_content,data_hot,data_warm
      - discovery.seed_hosts=es-master-1,es-master-2,es-master-3
      - bootstrap.memory_lock=true
      - "ES_JAVA_OPTS=-Xms16g -Xmx16g"
      - xpack.security.enabled=false
    ulimits:
      memlock:
        soft: -1
        hard: -1
    volumes:
      - data1_data:/usr/share/elasticsearch/data
    networks:
      - elastic

  es-data-2:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.12.0
    container_name: es-data-2
    environment:
      - node.name=es-data-2
      - cluster.name=production-cluster
      - node.roles=data,data_content,data_hot,data_warm
      - discovery.seed_hosts=es-master-1,es-master-2,es-master-3
      - bootstrap.memory_lock=true
      - "ES_JAVA_OPTS=-Xms16g -Xmx16g"
      - xpack.security.enabled=false
    ulimits:
      memlock:
        soft: -1
        hard: -1
    volumes:
      - data2_data:/usr/share/elasticsearch/data
    networks:
      - elastic

  kibana:
    image: docker.elastic.co/kibana/kibana:8.12.0
    container_name: kibana
    environment:
      - ELASTICSEARCH_HOSTS=http://es-master-1:9200,http://es-master-2:9200,http://es-master-3:9200
      - SERVER_NAME=kibana
      - SERVER_HOST=0.0.0.0
    ports:
      - "5601:5601"
    networks:
      - elastic
    depends_on:
      - es-master-1
      - es-master-2
      - es-master-3

volumes:
  master1_data:
  master2_data:
  master3_data:
  data1_data:
  data2_data:

networks:
  elastic:
    driver: bridge
```

### 2. 集群管理API

```java
@Service
public class ClusterManagementService {
    
    @Autowired
    private ElasticsearchClient client;
    
    /**
     * 获取集群健康状态
     */
    public ClusterHealthResponse getClusterHealth() throws IOException {
        ClusterHealthRequest request = ClusterHealthRequest.of(h -> h
            .waitForStatus(HealthStatus.Yellow)
            .timeout(t -> t.time("30s"))
        );
        
        return client.cluster().health(request);
    }
    
    /**
     * 获取集群统计信息
     */
    public ClusterStatsResponse getClusterStats() throws IOException {
        ClusterStatsRequest request = ClusterStatsRequest.of(s -> s);
        return client.cluster().stats(request);
    }
    
    /**
     * 获取节点信息
     */
    public NodesInfoResponse getNodesInfo() throws IOException {
        NodesInfoRequest request = NodesInfoRequest.of(n -> n
            .metric(NodeInfoMetric.Os, NodeInfoMetric.Process, NodeInfoMetric.Jvm)
        );
        
        return client.nodes().info(request);
    }
    
    /**
     * 获取节点统计信息
     */
    public NodesStatsResponse getNodesStats() throws IOException {
        NodesStatsRequest request = NodesStatsRequest.of(n -> n
            .metric(NodeStatsMetric.Os, NodeStatsMetric.Process, NodeStatsMetric.Jvm, 
                   NodeStatsMetric.Indices, NodeStatsMetric.ThreadPool)
        );
        
        return client.nodes().stats(request);
    }
    
    /**
     * 集群设置管理
     */
    public void updateClusterSettings(Map<String, String> persistentSettings, 
                                    Map<String, String> transientSettings) throws IOException {
        ClusterPutSettingsRequest request = ClusterPutSettingsRequest.of(s -> s
            .persistent(persistentSettings)
            .transient_(transientSettings)
        );
        
        ClusterPutSettingsResponse response = client.cluster().putSettings(request);
        System.out.println("集群设置更新结果: " + response.acknowledged());
    }
}
```

## （三）分片管理与路由

### 1. 分片分配策略

```java
/**
 * 分片分配管理服务
 */
@Service
public class ShardAllocationService {
    
    @Autowired
    private ElasticsearchClient client;
    
    /**
     * 设置分片分配策略
     */
    public void configureShardAllocation() throws IOException {
        Map<String, String> settings = new HashMap<>();
        
        // 分片分配策略
        settings.put("cluster.routing.allocation.enable", "all");
        settings.put("cluster.routing.allocation.node_concurrent_recoveries", "4");
        settings.put("cluster.routing.allocation.cluster_concurrent_rebalance", "2");
        
        // 磁盘水位线设置
        settings.put("cluster.routing.allocation.disk.threshold_enabled", "true");
        settings.put("cluster.routing.allocation.disk.watermark.low", "85%");
        settings.put("cluster.routing.allocation.disk.watermark.high", "90%");
        settings.put("cluster.routing.allocation.disk.watermark.flood_stage", "95%");
        
        // 分片大小限制
        settings.put("cluster.routing.allocation.total_shards_per_node", "1000");
        
        ClusterPutSettingsRequest request = ClusterPutSettingsRequest.of(s -> s
            .persistent(settings)
        );
        
        client.cluster().putSettings(request);
    }
    
    /**
     * 手动分片重分配
     */
    public void reallocateShards(String indexName, int shardNumber, String fromNode, String toNode) throws IOException {
        ClusterRerouteRequest request = ClusterRerouteRequest.of(r -> r
            .commands(c -> c
                .move(m -> m
                    .index(indexName)
                    .shard(shardNumber)
                    .fromNode(fromNode)
                    .toNode(toNode)
                )
            )
        );
        
        ClusterRerouteResponse response = client.cluster().reroute(request);
        System.out.println("分片重分配结果: " + response.acknowledged());
    }
    
    /**
     * 获取分片分配解释
     */
    public void explainShardAllocation(String indexName, int shardNumber, boolean primary) throws IOException {
        ClusterAllocationExplainRequest request = ClusterAllocationExplainRequest.of(e -> e
            .index(indexName)
            .shard(shardNumber)
            .primary(primary)
        );
        
        ClusterAllocationExplainResponse response = client.cluster().allocationExplain(request);
        System.out.println("分片分配解释: " + response);
    }
}
```

### 2. 自定义路由策略

```java
/**
 * 自定义路由服务
 */
@Service
public class CustomRoutingService {
    
    @Autowired
    private ElasticsearchClient client;
    
    /**
     * 基于用户ID的路由索引
     */
    public void indexWithCustomRouting(String indexName, Document document, String userId) throws IOException {
        IndexRequest<Document> request = IndexRequest.of(i -> i
            .index(indexName)
            .id(document.getId())
            .routing(userId)  // 使用用户ID作为路由
            .document(document)
        );
        
        IndexResponse response = client.index(request);
        System.out.println("文档索引结果: " + response.result());
    }
    
    /**
     * 基于路由的搜索
     */
    public List<Document> searchWithRouting(String indexName, String query, String routing) throws IOException {
        SearchRequest request = SearchRequest.of(s -> s
            .index(indexName)
            .routing(routing)  // 指定路由，只搜索特定分片
            .query(q -> q
                .multiMatch(m -> m
                    .query(query)
                    .fields("title", "content")
                )
            )
        );
        
        SearchResponse<Document> response = client.search(request, Document.class);
        return response.hits().hits().stream()
                .map(Hit::source)
                .collect(Collectors.toList());
    }
    
    /**
     * 创建带路由的索引模板
     */
    public void createRoutingTemplate() throws IOException {
        PutIndexTemplateRequest request = PutIndexTemplateRequest.of(t -> t
            .name("user_data_template")
            .indexPatterns("user_data_*")
            .template(template -> template
                .settings(s -> s
                    .numberOfShards("6")
                    .numberOfReplicas("1")
                    .routingPartitionSize(2)  // 路由分区大小
                )
                .mappings(m -> m
                    .properties("userId", p -> p.keyword(k -> k))
                    .properties("title", p -> p.text(t2 -> t2))
                    .properties("content", p -> p.text(t2 -> t2))
                    .properties("createTime", p -> p.date(d -> d))
                    .routing(r -> r.required(true))  // 要求必须提供路由
                )
            )
        );
        
        PutIndexTemplateResponse response = client.indices().putIndexTemplate(request);
        System.out.println("索引模板创建结果: " + response.acknowledged());
    }
}
```

# 二、深度性能调优

## （一）JVM调优

### 1. JVM参数配置

```bash
# jvm.options
# 堆内存设置（不超过32GB，推荐物理内存的50%）
-Xms16g
-Xmx16g

# 垃圾回收器设置（推荐G1GC）
-XX:+UseG1GC
-XX:G1HeapRegionSize=16m
-XX:+G1UseAdaptiveIHOP
-XX:G1MixedGCCountTarget=8
-XX:G1MixedGCLiveThresholdPercent=85

# GC日志配置
-Xlog:gc*,gc+heap=info,safepoint:gc.log:time,level,tags
-XX:+UseGCLogFileRotation
-XX:NumberOfGCLogFiles=32
-XX:GCLogFileSize=64m

# 内存映射设置
-XX:+AlwaysPreTouch
-Djava.awt.headless=true

# 网络设置
-Djava.net.preferIPv4Stack=true

# 临时目录
-Djava.io.tmpdir=/tmp

# 错误处理
-XX:+HeapDumpOnOutOfMemoryError
-XX:HeapDumpPath=/var/lib/elasticsearch
-XX:ErrorFile=/var/log/elasticsearch/hs_err_pid%p.log
```

### 2. JVM监控服务

```java
@Service
public class JVMMonitoringService {
    
    @Autowired
    private ElasticsearchClient client;
    
    /**
     * 获取JVM统计信息
     */
    public JVMStats getJVMStats() throws IOException {
        NodesStatsRequest request = NodesStatsRequest.of(n -> n
            .metric(NodeStatsMetric.Jvm)
        );
        
        NodesStatsResponse response = client.nodes().stats(request);
        
        JVMStats jvmStats = new JVMStats();
        
        response.nodes().forEach((nodeId, nodeStats) -> {
            if (nodeStats.jvm() != null) {
                JvmStats jvm = nodeStats.jvm();
                
                // 堆内存信息
                if (jvm.mem() != null && jvm.mem().heapUsed() != null) {
                    jvmStats.addHeapUsed(nodeId, jvm.mem().heapUsed().bytes());
                    jvmStats.addHeapMax(nodeId, jvm.mem().heapMax().bytes());
                }
                
                // GC信息
                if (jvm.gc() != null && jvm.gc().collectors() != null) {
                    jvm.gc().collectors().forEach((gcName, gcStats) -> {
                        jvmStats.addGCCount(nodeId, gcName, gcStats.collectionCount());
                        jvmStats.addGCTime(nodeId, gcName, gcStats.collectionTime().millis());
                    });
                }
                
                // 线程池信息
                if (nodeStats.threadPool() != null) {
                    nodeStats.threadPool().forEach((poolName, poolStats) -> {
                        jvmStats.addThreadPoolStats(nodeId, poolName, 
                            poolStats.active(), poolStats.queue(), poolStats.rejected());
                    });
                }
            }
        });
        
        return jvmStats;
    }
    
    /**
     * JVM性能分析
     */
    public JVMPerformanceReport analyzeJVMPerformance() throws IOException {
        JVMStats stats = getJVMStats();
        JVMPerformanceReport report = new JVMPerformanceReport();
        
        // 分析堆内存使用率
        stats.getHeapUsage().forEach((nodeId, usage) -> {
            double usagePercent = (double) usage.getUsed() / usage.getMax() * 100;
            if (usagePercent > 85) {
                report.addWarning(nodeId, "堆内存使用率过高: " + String.format("%.2f%%", usagePercent));
            }
        });
        
        // 分析GC频率
        stats.getGcStats().forEach((nodeId, gcStats) -> {
            gcStats.forEach((gcName, gcInfo) -> {
                if (gcInfo.getCount() > 100) {  // 假设阈值
                    report.addWarning(nodeId, gcName + " GC次数过多: " + gcInfo.getCount());
                }
                if (gcInfo.getTime() > 10000) {  // 假设阈值10秒
                    report.addWarning(nodeId, gcName + " GC时间过长: " + gcInfo.getTime() + "ms");
                }
            });
        });
        
        return report;
    }
}
```

## （二）索引性能优化

### 1. 索引模板优化

```java
/**
 * 高性能索引模板服务
 */
@Service
public class OptimizedIndexTemplateService {
    
    @Autowired
    private ElasticsearchClient client;
    
    /**
     * 创建高性能索引模板
     */
    public void createHighPerformanceTemplate() throws IOException {
        PutIndexTemplateRequest request = PutIndexTemplateRequest.of(t -> t
            .name("high_performance_template")
            .indexPatterns("logs-*", "metrics-*")
            .template(template -> template
                .settings(s -> s
                    // 分片设置
                    .numberOfShards("3")
                    .numberOfReplicas("1")
                    
                    // 刷新设置
                    .refreshInterval(t2 -> t2.time("30s"))  // 降低刷新频率
                    
                    // 合并设置
                    .put("index.merge.policy.max_merge_at_once", JsonData.of(5))
                    .put("index.merge.policy.segments_per_tier", JsonData.of(5))
                    .put("index.merge.policy.max_merged_segment", JsonData.of("5gb"))
                    
                    // 存储设置
                    .put("index.store.type", JsonData.of("fs"))
                    .put("index.store.fs.fs_lock", JsonData.of("simple"))
                    
                    // 缓存设置
                    .put("index.queries.cache.enabled", JsonData.of(true))
                    .put("index.requests.cache.enable", JsonData.of(true))
                    
                    // 压缩设置
                    .put("index.codec", JsonData.of("best_compression"))
                    
                    // 事务日志设置
                    .put("index.translog.flush_threshold_size", JsonData.of("1gb"))
                    .put("index.translog.sync_interval", JsonData.of("30s"))
                    .put("index.translog.durability", JsonData.of("async"))
                )
                .mappings(m -> m
                    // 动态映射设置
                    .dynamic(DynamicMapping.Strict)
                    
                    // 字段映射
                    .properties("timestamp", p -> p.date(d -> d
                        .format("yyyy-MM-dd HH:mm:ss")
                        .store(false)
                    ))
                    .properties("level", p -> p.keyword(k -> k
                        .store(false)
                        .docValues(true)
                    ))
                    .properties("message", p -> p.text(t2 -> t2
                        .analyzer("standard")
                        .store(false)
                        .norms(false)  // 禁用评分规范化
                    ))
                    .properties("host", p -> p.keyword(k -> k
                        .store(false)
                        .docValues(true)
                    ))
                    .properties("service", p -> p.keyword(k -> k
                        .store(false)
                        .docValues(true)
                    ))
                    
                    // 元数据字段设置
                    .source(src -> src.enabled(true).compress(true))
                    .fieldNames(fn -> fn.enabled(false))  // 禁用_field_names
                )
            )
            .priority(100L)
        );
        
        PutIndexTemplateResponse response = client.indices().putIndexTemplate(request);
        System.out.println("高性能索引模板创建结果: " + response.acknowledged());
    }
    
    /**
     * 创建时间序列数据模板
     */
    public void createTimeSeriesTemplate() throws IOException {
        PutIndexTemplateRequest request = PutIndexTemplateRequest.of(t -> t
            .name("timeseries_template")
            .indexPatterns("timeseries-*")
            .template(template -> template
                .settings(s -> s
                    .numberOfShards("1")  // 时间序列数据通常单分片
                    .numberOfReplicas("1")
                    
                    // 时间序列优化设置
                    .put("index.mode", JsonData.of("time_series"))
                    .put("index.routing_path", JsonData.of(List.of("host", "service")))
                    .put("index.time_series.start_time", JsonData.of("2024-01-01T00:00:00Z"))
                    .put("index.time_series.end_time", JsonData.of("2024-12-31T23:59:59Z"))
                    
                    // 性能优化
                    .refreshInterval(t2 -> t2.time("60s"))
                    .put("index.translog.durability", JsonData.of("async"))
                    .put("index.translog.sync_interval", JsonData.of("60s"))
                )
                .mappings(m -> m
                    .properties("@timestamp", p -> p.date(d -> d
                        .format("strict_date_optional_time")
                    ))
                    .properties("host", p -> p.keyword(k -> k
                        .timeSeriesDimension(true)  // 时间序列维度
                    ))
                    .properties("service", p -> p.keyword(k -> k
                        .timeSeriesDimension(true)
                    ))
                    .properties("cpu_usage", p -> p.double_(d -> d
                        .timeSeriesMetric(TimeSeriesMetricType.Gauge)  // 时间序列指标
                    ))
                    .properties("memory_usage", p -> p.double_(d -> d
                        .timeSeriesMetric(TimeSeriesMetricType.Gauge)
                    ))
                )
            )
        );
        
        client.indices().putIndexTemplate(request);
    }
}
```

### 2. 批量操作优化

```java
/**
 * 高性能批量操作服务
 */
@Service
public class HighPerformanceBulkService {
    
    @Autowired
    private ElasticsearchClient client;
    
    private final ExecutorService executorService = Executors.newFixedThreadPool(10);
    
    /**
     * 并行批量索引
     */
    public CompletableFuture<BulkResult> parallelBulkIndex(String indexName, 
                                                          List<Document> documents) {
        return CompletableFuture.supplyAsync(() -> {
            try {
                return performOptimizedBulk(indexName, documents);
            } catch (IOException e) {
                throw new RuntimeException("批量索引失败", e);
            }
        }, executorService);
    }
    
    private BulkResult performOptimizedBulk(String indexName, List<Document> documents) throws IOException {
        final int OPTIMAL_BATCH_SIZE = 1000;  // 优化的批次大小
        final int MAX_BULK_SIZE_MB = 10;      // 最大批次大小（MB）
        
        BulkResult result = new BulkResult();
        
        // 分批处理
        for (int i = 0; i < documents.size(); i += OPTIMAL_BATCH_SIZE) {
            int endIndex = Math.min(i + OPTIMAL_BATCH_SIZE, documents.size());
            List<Document> batch = documents.subList(i, endIndex);
            
            // 检查批次大小
            long batchSizeBytes = estimateBatchSize(batch);
            if (batchSizeBytes > MAX_BULK_SIZE_MB * 1024 * 1024) {
                // 如果批次过大，进一步分割
                processBatchBySize(indexName, batch, MAX_BULK_SIZE_MB * 1024 * 1024, result);
            } else {
                processSingleBatch(indexName, batch, result);
            }
            
            // 批次间休息，避免过载
            if (endIndex < documents.size()) {
                try {
                    Thread.sleep(50);
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    break;
                }
            }
        }
        
        return result;
    }
    
    private void processSingleBatch(String indexName, List<Document> batch, BulkResult result) throws IOException {
        BulkRequest.Builder bulkBuilder = new BulkRequest.Builder()
            .timeout(t -> t.time("60s"))
            .refresh(Refresh.False);  // 不立即刷新
        
        for (Document doc : batch) {
            bulkBuilder.operations(op -> op
                .index(idx -> idx
                    .index(indexName)
                    .id(doc.getId())
                    .document(doc)
                )
            );
        }
        
        BulkResponse response = client.bulk(bulkBuilder.build());
        
        result.addProcessed(batch.size());
        
        if (response.errors()) {
            int errorCount = 0;
            for (BulkResponseItem item : response.items()) {
                if (item.error() != null) {
                    errorCount++;
                    result.addError(item.error().reason());
                }
            }
            result.addErrors(errorCount);
        }
        
        result.addSuccessful(batch.size() - (response.errors() ? 
            (int) response.items().stream().filter(item -> item.error() != null).count() : 0));
    }
    
    private long estimateBatchSize(List<Document> batch) {
        // 简单估算批次大小
        return batch.stream()
                .mapToLong(doc -> {
                    // 估算文档大小（字节）
                    return (doc.getTitle() != null ? doc.getTitle().length() : 0) +
                           (doc.getContent() != null ? doc.getContent().length() : 0) +
                           100; // 其他字段估算
                })
                .sum();
    }
    
    private void processBatchBySize(String indexName, List<Document> batch, 
                                  long maxSizeBytes, BulkResult result) throws IOException {
        List<Document> currentBatch = new ArrayList<>();
        long currentSize = 0;
        
        for (Document doc : batch) {
            long docSize = estimateDocumentSize(doc);
            
            if (currentSize + docSize > maxSizeBytes && !currentBatch.isEmpty()) {
                processSingleBatch(indexName, currentBatch, result);
                currentBatch.clear();
                currentSize = 0;
            }
            
            currentBatch.add(doc);
            currentSize += docSize;
        }
        
        if (!currentBatch.isEmpty()) {
            processSingleBatch(indexName, currentBatch, result);
        }
    }
    
    private long estimateDocumentSize(Document doc) {
        return (doc.getTitle() != null ? doc.getTitle().length() : 0) +
               (doc.getContent() != null ? doc.getContent().length() : 0) +
               100;
    }
}

/**
 * 批量操作结果
 */
public class BulkResult {
    private int processed = 0;
    private int successful = 0;
    private int errors = 0;
    private List<String> errorMessages = new ArrayList<>();
    
    public void addProcessed(int count) { this.processed += count; }
    public void addSuccessful(int count) { this.successful += count; }
    public void addErrors(int count) { this.errors += count; }
    public void addError(String message) { this.errorMessages.add(message); }
    
    // Getter方法
    public int getProcessed() { return processed; }
    public int getSuccessful() { return successful; }
    public int getErrors() { return errors; }
    public List<String> getErrorMessages() { return errorMessages; }
    public double getSuccessRate() { 
        return processed > 0 ? (double) successful / processed * 100 : 0; 
    }
}
```

## （三）查询性能优化

### 1. 查询缓存优化

```java
/**
 * 查询缓存优化服务
 */
@Service
public class QueryCacheOptimizationService {
    
    @Autowired
    private ElasticsearchClient client;
    
    /**
     * 优化的缓存查询
     */
    public SearchResult optimizedCachedSearch(SearchParams params) throws IOException {
        SearchRequest request = SearchRequest.of(s -> s
            .index(params.getIndexName())
            .query(q -> q
                .bool(b -> b
                    // 使用filter进行可缓存的过滤
                    .filter(filter -> filter
                        .bool(fb -> {
                            BoolQuery.Builder filterBuilder = new BoolQuery.Builder();
                            
                            // 时间范围过滤（高缓存命中率）
                            if (params.getStartTime() != null || params.getEndTime() != null) {
                                filterBuilder.must(must -> must
                                    .range(r -> {
                                        RangeQuery.Builder rangeBuilder = new RangeQuery.Builder()
                                            .field("createTime");
                                        if (params.getStartTime() != null) {
                                            rangeBuilder.gte(JsonData.of(params.getStartTime()));
                                        }
                                        if (params.getEndTime() != null) {
                                            rangeBuilder.lte(JsonData.of(params.getEndTime()));
                                        }
                                        return rangeBuilder.build();
                                    })
                                );
                            }
                            
                            // 分类过滤（高缓存命中率）
                            if (StringUtils.hasText(params.getCategory())) {
                                filterBuilder.must(must -> must
                                    .term(t -> t
                                        .field("category.keyword")
                                        .value(params.getCategory())
                                    )
                                );
                            }
                            
                            // 标签过滤（中等缓存命中率）
                            if (params.getTags() != null && !params.getTags().isEmpty()) {
                                filterBuilder.must(must -> must
                                    .terms(t -> t
                                        .field("tags")
                                        .terms(TermsQueryField.of(tf -> tf.value(
                                            params.getTags().stream()
                                                .map(FieldValue::of)
                                                .collect(Collectors.toList())
                                        )))
                                    )
                                );
                            }
                            
                            return filterBuilder.build();
                        })
                    )
                    
                    // 使用must进行评分查询（不缓存）
                    .must(must -> must
                        .multiMatch(m -> m
                            .query(params.getKeyword())
                            .fields("title^3", "content")
                            .type(TextQueryType.BestFields)
                            .minimumShouldMatch("75%")
                        )
                    )
                )
            )
            .sort(so -> so
                .score(sc -> sc.order(SortOrder.Desc))
                .field(f -> f.field("createTime").order(SortOrder.Desc))
            )
            .from(params.getFrom())
            .size(params.getSize())
            .source(src -> src
                .filter(f -> f
                    .includes("id", "title", "summary", "createTime", "category", "tags")
                    .excludes("content")  // 排除大字段
                )
            )
            .requestCache(true)  // 启用请求缓存
        );
        
        SearchResponse<Document> response = client.search(request, Document.class);
        
        List<SearchResultItem> items = response.hits().hits().stream()
                .map(hit -> {
                    SearchResultItem item = new SearchResultItem();
                    item.setDocument(hit.source());
                    item.setScore(hit.score());
                    return item;
                })
                .collect(Collectors.toList());
        
        return new SearchResult(
            items,
            response.hits().total().value(),
            params.getFrom() / params.getSize(),
            params.getSize()
        );
    }
    
    /**
     * 预热查询缓存
     */
    public void warmupQueryCache(String indexName) throws IOException {
        // 常用的过滤查询预热
        List<String> commonCategories = Arrays.asList("tech", "business", "science");
        List<String> commonTimeRanges = Arrays.asList("now-1d", "now-7d", "now-30d");
        
        for (String category : commonCategories) {
            for (String timeRange : commonTimeRanges) {
                SearchRequest warmupRequest = SearchRequest.of(s -> s
                    .index(indexName)
                    .size(0)  // 不返回结果，只预热缓存
                    .query(q -> q
                        .bool(b -> b
                            .filter(filter -> filter
                                .term(t -> t
                                    .field("category.keyword")
                                    .value(category)
                                )
                            )
                            .filter(filter -> filter
                                .range(r -> r
                                    .field("createTime")
                                    .gte(JsonData.of(timeRange))
                                )
                            )
                        )
                    )
                    .requestCache(true)
                );
                
                client.search(warmupRequest, Void.class);
            }
        }
        
        System.out.println("查询缓存预热完成");
    }
}
```

# 三、企业级安全配置

## （一）身份认证与授权

### 1. 用户和角色管理

```java
/**
 * 安全管理服务
 */
@Service
public class SecurityManagementService {
    
    @Autowired
    private ElasticsearchClient client;
    
    /**
     * 创建用户
     */
    public void createUser(String username, String password, List<String> roles) throws IOException {
        PutUserRequest request = PutUserRequest.of(u -> u
            .username(username)
            .password(password)
            .roles(roles)
            .enabled(true)
            .fullName(username)
        );
        
        PutUserResponse response = client.security().putUser(request);
        System.out.println("用户创建结果: " + response.created());
    }
    
    /**
     * 创建角色
     */
    public void createRole(String roleName, List<String> clusterPrivileges, 
                          List<IndexPrivileges> indexPrivileges) throws IOException {
        PutRoleRequest request = PutRoleRequest.of(r -> r
            .name(roleName)
            .cluster(clusterPrivileges)
            .indices(indexPrivileges)
        );
        
        PutRoleResponse response = client.security().putRole(request);
        System.out.println("角色创建结果: " + response.role().created());
    }
    
    /**
     * 创建API密钥
     */
    public ApiKeyResponse createApiKey(String name, List<String> roleDescriptors, 
                                     String expiration) throws IOException {
        CreateApiKeyRequest request = CreateApiKeyRequest.of(k -> k
            .name(name)
            .expiration(t -> t.time(expiration))
            .roleDescriptors(roleDescriptors.stream()
                .collect(Collectors.toMap(
                    role -> role,
                    role -> RoleDescriptor.of(rd -> rd
                        .cluster(List.of("monitor"))
                        .indices(List.of(IndexPrivileges.of(ip -> ip
                            .names("logs-*")
                            .privileges("read", "view_index_metadata")
                        )))
                    )
                ))
            )
        );
        
        return client.security().createApiKey(request);
    }
    
    /**
     * 获取用户权限
     */
    public GetUserPrivilegesResponse getUserPrivileges() throws IOException {
        GetUserPrivilegesRequest request = GetUserPrivilegesRequest.of(p -> p);
        return client.security().getUserPrivileges(request);
    }
}
```

### 2. SSL/TLS配置

```yaml
# elasticsearch.yml SSL配置
xpack.security.enabled: true

# HTTP SSL配置
xpack.security.http.ssl.enabled: true
xpack.security.http.ssl.keystore.path: certs/elastic-certificates.p12
xpack.security.http.ssl.truststore.path: certs/elastic-certificates.p12

# 传输层SSL配置
xpack.security.transport.ssl.enabled: true
xpack.security.transport.ssl.verification_mode: certificate
xpack.security.transport.ssl.keystore.path: certs/elastic-certificates.p12
xpack.security.transport.ssl.truststore.path: certs/elastic-certificates.p12

# 审计日志配置
xpack.security.audit.enabled: true
xpack.security.audit.logfile.events.include: 
  - access_granted
  - access_denied
  - anonymous_access_denied
  - authentication_failed
  - connection_granted
  - connection_denied
  - tampered_request
  - run_as_granted
  - run_as_denied
```

## （二）数据加密与审计

### 1. 字段级加密

```java
/**
 * 数据加密服务
 */
@Service
public class DataEncryptionService {
    
    private final AESUtil aesUtil = new AESUtil();
    
    /**
     * 加密敏感数据
     */
    public Document encryptSensitiveFields(Document document) {
        Document encryptedDoc = new Document();
        
        // 复制非敏感字段
        encryptedDoc.setId(document.getId());
        encryptedDoc.setTitle(document.getTitle());
        encryptedDoc.setCreateTime(document.getCreateTime());
        
        // 加密敏感字段
        if (document.getEmail() != null) {
            encryptedDoc.setEmail(aesUtil.encrypt(document.getEmail()));
        }
        
        if (document.getPhone() != null) {
            encryptedDoc.setPhone(aesUtil.encrypt(document.getPhone()));
        }
        
        if (document.getIdCard() != null) {
            encryptedDoc.setIdCard(aesUtil.encrypt(document.getIdCard()));
        }
        
        return encryptedDoc;
    }
    
    /**
     * 解密敏感数据
     */
    public Document decryptSensitiveFields(Document encryptedDocument) {
        Document decryptedDoc = new Document();
        
        // 复制非敏感字段
        decryptedDoc.setId(encryptedDocument.getId());
        decryptedDoc.setTitle(encryptedDocument.getTitle());
        decryptedDoc.setCreateTime(encryptedDocument.getCreateTime());
        
        // 解密敏感字段
        if (encryptedDocument.getEmail() != null) {
            decryptedDoc.setEmail(aesUtil.decrypt(encryptedDocument.getEmail()));
        }
        
        if (encryptedDocument.getPhone() != null) {
            decryptedDoc.setPhone(aesUtil.decrypt(encryptedDocument.getPhone()));
        }
        
        if (encryptedDocument.getIdCard() != null) {
            decryptedDoc.setIdCard(aesUtil.decrypt(encryptedDocument.getIdCard()));
        }
        
        return decryptedDoc;
    }
}

/**
 * AES加密工具类
 */
public class AESUtil {
    private static final String ALGORITHM = "AES/GCM/NoPadding";
    private static final String KEY_ALGORITHM = "AES";
    private static final int GCM_IV_LENGTH = 12;
    private static final int GCM_TAG_LENGTH = 16;
    
    private final SecretKey secretKey;
    
    public AESUtil() {
        this.secretKey = generateKey();
    }
    
    private SecretKey generateKey() {
        try {
            KeyGenerator keyGenerator = KeyGenerator.getInstance(KEY_ALGORITHM);
            keyGenerator.init(256);
            return keyGenerator.generateKey();
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("AES密钥生成失败", e);
        }
    }
    
    public String encrypt(String plainText) {
        try {
            Cipher cipher = Cipher.getInstance(ALGORITHM);
            
            byte[] iv = new byte[GCM_IV_LENGTH];
            SecureRandom.getInstanceStrong().nextBytes(iv);
            GCMParameterSpec parameterSpec = new GCMParameterSpec(GCM_TAG_LENGTH * 8, iv);
            
            cipher.init(Cipher.ENCRYPT_MODE, secretKey, parameterSpec);
            
            byte[] encryptedData = cipher.doFinal(plainText.getBytes(StandardCharsets.UTF_8));
            
            byte[] encryptedWithIv = new byte[iv.length + encryptedData.length];
            System.arraycopy(iv, 0, encryptedWithIv, 0, iv.length);
            System.arraycopy(encryptedData, 0, encryptedWithIv, iv.length, encryptedData.length);
            
            return Base64.getEncoder().encodeToString(encryptedWithIv);
        } catch (Exception e) {
            throw new RuntimeException("加密失败", e);
        }
    }
    
    public String decrypt(String encryptedText) {
        try {
            byte[] decodedData = Base64.getDecoder().decode(encryptedText);
            
            byte[] iv = new byte[GCM_IV_LENGTH];
            System.arraycopy(decodedData, 0, iv, 0, iv.length);
            
            byte[] encryptedData = new byte[decodedData.length - GCM_IV_LENGTH];
            System.arraycopy(decodedData, GCM_IV_LENGTH, encryptedData, 0, encryptedData.length);
            
            Cipher cipher = Cipher.getInstance(ALGORITHM);
            GCMParameterSpec parameterSpec = new GCMParameterSpec(GCM_TAG_LENGTH * 8, iv);
            cipher.init(Cipher.DECRYPT_MODE, secretKey, parameterSpec);
            
            byte[] decryptedData = cipher.doFinal(encryptedData);
            
            return new String(decryptedData, StandardCharsets.UTF_8);
        } catch (Exception e) {
            throw new RuntimeException("解密失败", e);
        }
    }
}
```

### 2. 审计日志分析

```java
/**
 * 审计日志分析服务
 */
@Service
public class AuditLogAnalysisService {
    
    @Autowired
    private ElasticsearchClient client;
    
    private static final String AUDIT_INDEX = ".security-audit-*";
    
    /**
     * 分析登录失败事件
     */
    public List<SecurityEvent> analyzeFailedLogins(String timeRange) throws IOException {
        SearchRequest request = SearchRequest.of(s -> s
            .index(AUDIT_INDEX)
            .query(q -> q
                .bool(b -> b
                    .must(must -> must
                        .term(t -> t
                            .field("event_type")
                            .value("authentication_failed")
                        )
                    )
                    .filter(filter -> filter
                        .range(r -> r
                            .field("@timestamp")
                            .gte(JsonData.of(timeRange))
                        )
                    )
                )
            )
            .aggregations("failed_by_user", a -> a
                .terms(t -> t
                    .field("user.name")
                    .size(20)
                )
            )
            .aggregations("failed_by_ip", a -> a
                .terms(t -> t
                    .field("origin.address")
                    .size(20)
                )
            )
            .sort(so -> so
                .field(f -> f.field("@timestamp").order(SortOrder.Desc))
            )
            .size(100)
        );
        
        SearchResponse<SecurityEvent> response = client.search(request, SecurityEvent.class);
        
        return response.hits().hits().stream()
                .map(Hit::source)
                .collect(Collectors.toList());
    }
    
    /**
     * 检测异常访问模式
     */
    public List<AnomalousActivity> detectAnomalousActivity() throws IOException {
        List<AnomalousActivity> anomalies = new ArrayList<>();
        
        // 检测短时间内大量失败登录
        SearchRequest failedLoginsRequest = SearchRequest.of(s -> s
            .index(AUDIT_INDEX)
            .size(0)
            .query(q -> q
                .bool(b -> b
                    .must(must -> must
                        .term(t -> t
                            .field("event_type")
                            .value("authentication_failed")
                        )
                    )
                    .filter(filter -> filter
                        .range(r -> r
                            .field("@timestamp")
                            .gte(JsonData.of("now-1h"))
                        )
                    )
                )
            )
            .aggregations("failed_by_ip", a -> a
                .terms(t -> t
                    .field("origin.address")
                    .size(50)
                    .minDocCount(10)  // 至少10次失败
                )
            )
        );
        
        SearchResponse<Void> failedResponse = client.search(failedLoginsRequest, Void.class);
        
        StringTermsAggregate failedByIp = failedResponse.aggregations()
                .get("failed_by_ip")
                .sterms();
        
        for (StringTermsBucket bucket : failedByIp.buckets().array()) {
            if (bucket.docCount() >= 10) {
                anomalies.add(new AnomalousActivity(
                    "BRUTE_FORCE_ATTACK",
                    "IP地址 " + bucket.key().stringValue() + " 在1小时内失败登录 " + bucket.docCount() + " 次",
                    bucket.key().stringValue(),
                    "HIGH"
                ));
            }
        }
        
        // 检测异常时间访问
        SearchRequest offHoursRequest = SearchRequest.of(s -> s
            .index(AUDIT_INDEX)
            .size(0)
            .query(q -> q
                .bool(b -> b
                    .must(must -> must
                        .term(t -> t
                            .field("event_type")
                            .value("access_granted")
                        )
                    )
                    .filter(filter -> filter
                        .range(r -> r
                            .field("@timestamp")
                            .gte(JsonData.of("now-24h"))
                        )
                    )
                    .filter(filter -> filter
                        .script(sc -> sc
                            .source("doc['@timestamp'].value.getHour() < 6 || doc['@timestamp'].value.getHour() > 22")
                        )
                    )
                )
            )
            .aggregations("off_hours_by_user", a -> a
                .terms(t -> t
                    .field("user.name")
                    .size(20)
                    .minDocCount(5)
                )
            )
        );
        
        SearchResponse<Void> offHoursResponse = client.search(offHoursRequest, Void.class);
        
        StringTermsAggregate offHoursByUser = offHoursResponse.aggregations()
                .get("off_hours_by_user")
                .sterms();
        
        for (StringTermsBucket bucket : offHoursByUser.buckets().array()) {
            anomalies.add(new AnomalousActivity(
                "OFF_HOURS_ACCESS",
                "用户 " + bucket.key().stringValue() + " 在非工作时间访问系统 " + bucket.docCount() + " 次",
                bucket.key().stringValue(),
                "MEDIUM"
            ));
        }
        
        return anomalies;
    }
    
    /**
     * 生成安全报告
     */
    public SecurityReport generateSecurityReport(String timeRange) throws IOException {
        SecurityReport report = new SecurityReport();
        
        // 统计总体访问情况
        SearchRequest totalAccessRequest = SearchRequest.of(s -> s
            .index(AUDIT_INDEX)
            .size(0)
            .query(q -> q
                .bool(b -> b
                    .filter(filter -> filter
                        .range(r -> r
                            .field("@timestamp")
                            .gte(JsonData.of(timeRange))
                        )
                    )
                )
            )
            .aggregations("by_event_type", a -> a
                .terms(t -> t
                    .field("event_type")
                    .size(20)
                )
            )
        );
        
        SearchResponse<Void> response = client.search(totalAccessRequest, Void.class);
        
        StringTermsAggregate byEventType = response.aggregations()
                .get("by_event_type")
                .sterms();
        
        Map<String, Long> eventCounts = new HashMap<>();
        for (StringTermsBucket bucket : byEventType.buckets().array()) {
            eventCounts.put(bucket.key().stringValue(), bucket.docCount());
        }
        
        report.setEventCounts(eventCounts);
        report.setAnomalousActivities(detectAnomalousActivity());
        report.setGeneratedAt(LocalDateTime.now());
        
        return report;
    }
}
```

# 四、监控与运维

## （一）集群监控

### 1. 监控指标收集

```java
/**
 * 集群监控服务
 */
@Service
public class ClusterMonitoringService {
    
    @Autowired
    private ElasticsearchClient client;
    
    /**
     * 收集集群健康指标
     */
    public ClusterHealthMetrics collectHealthMetrics() throws IOException {
        ClusterHealthResponse health = client.cluster().health(
            ClusterHealthRequest.of(h -> h.timeout(t -> t.time("30s")))
        );
        
        ClusterStatsResponse stats = client.cluster().stats(
            ClusterStatsRequest.of(s -> s)
        );
        
        NodesStatsResponse nodesStats = client.nodes().stats(
            NodesStatsRequest.of(n -> n
                .metric(NodeStatsMetric.Os, NodeStatsMetric.Process, 
                       NodeStatsMetric.Jvm, NodeStatsMetric.Indices)
            )
        );
        
        ClusterHealthMetrics metrics = new ClusterHealthMetrics();
        
        // 集群健康状态
        metrics.setClusterStatus(health.status().toString());
        metrics.setActiveShards(health.activeShards());
        metrics.setRelocatingShards(health.relocatingShards());
        metrics.setInitializingShards(health.initializingShards());
        metrics.setUnassignedShards(health.unassignedShards());
        metrics.setNumberOfNodes(health.numberOfNodes());
        metrics.setNumberOfDataNodes(health.numberOfDataNodes());
        
        // 集群统计
        if (stats.indices() != null) {
            metrics.setTotalDocuments(stats.indices().count().longValue());
            metrics.setTotalIndexSize(stats.indices().store().sizeInBytes());
        }
        
        // 节点统计
        Map<String, NodeMetrics> nodeMetrics = new HashMap<>();
        nodesStats.nodes().forEach((nodeId, nodeStats) -> {
            NodeMetrics nodeMetric = new NodeMetrics();
            nodeMetric.setNodeId(nodeId);
            nodeMetric.setNodeName(nodeStats.name());
            
            // JVM指标
            if (nodeStats.jvm() != null) {
                JvmStats jvm = nodeStats.jvm();
                if (jvm.mem() != null) {
                    nodeMetric.setHeapUsedPercent(jvm.mem().heapUsedPercent());
                    nodeMetric.setHeapUsed(jvm.mem().heapUsed().bytes());
                    nodeMetric.setHeapMax(jvm.mem().heapMax().bytes());
                }
                
                if (jvm.gc() != null && jvm.gc().collectors() != null) {
                    long totalGcTime = jvm.gc().collectors().values().stream()
                            .mapToLong(gc -> gc.collectionTime().millis())
                            .sum();
                    nodeMetric.setGcTime(totalGcTime);
                }
            }
            
            // 操作系统指标
            if (nodeStats.os() != null) {
                OsStats os = nodeStats.os();
                if (os.cpu() != null) {
                    nodeMetric.setCpuPercent(os.cpu().percent());
                }
                if (os.mem() != null) {
                    nodeMetric.setMemoryUsedPercent(os.mem().usedPercent());
                }
            }
            
            // 索引指标
            if (nodeStats.indices() != null) {
                IndicesStats indices = nodeStats.indices();
                if (indices.indexing() != null) {
                    nodeMetric.setIndexingRate(indices.indexing().indexTotal());
                }
                if (indices.search() != null) {
                    nodeMetric.setSearchRate(indices.search().queryTotal());
                }
            }
            
            nodeMetrics.put(nodeId, nodeMetric);
        });
        
        metrics.setNodeMetrics(nodeMetrics);
        metrics.setTimestamp(LocalDateTime.now());
        
        return metrics;
    }
    
    /**
     * 检查集群健康状况
     */
    public List<HealthAlert> checkClusterHealth() throws IOException {
        List<HealthAlert> alerts = new ArrayList<>();
        ClusterHealthMetrics metrics = collectHealthMetrics();
        
        // 检查集群状态
        if ("red".equals(metrics.getClusterStatus())) {
            alerts.add(new HealthAlert(
                "CLUSTER_RED",
                "集群状态为红色，存在不可用的主分片",
                "CRITICAL"
            ));
        } else if ("yellow".equals(metrics.getClusterStatus())) {
            alerts.add(new HealthAlert(
                "CLUSTER_YELLOW",
                "集群状态为黄色，存在未分配的副本分片",
                "WARNING"
            ));
        }
        
        // 检查未分配分片
        if (metrics.getUnassignedShards() > 0) {
            alerts.add(new HealthAlert(
                "UNASSIGNED_SHARDS",
                "存在 " + metrics.getUnassignedShards() + " 个未分配的分片",
                "WARNING"
            ));
        }
        
        // 检查节点健康
        metrics.getNodeMetrics().forEach((nodeId, nodeMetric) -> {
            // 检查堆内存使用率
            if (nodeMetric.getHeapUsedPercent() > 85) {
                alerts.add(new HealthAlert(
                    "HIGH_HEAP_USAGE",
                    "节点 " + nodeMetric.getNodeName() + " 堆内存使用率过高: " + 
                    nodeMetric.getHeapUsedPercent() + "%",
                    nodeMetric.getHeapUsedPercent() > 95 ? "CRITICAL" : "WARNING"
                ));
            }
            
            // 检查CPU使用率
            if (nodeMetric.getCpuPercent() > 80) {
                alerts.add(new HealthAlert(
                    "HIGH_CPU_USAGE",
                    "节点 " + nodeMetric.getNodeName() + " CPU使用率过高: " + 
                    nodeMetric.getCpuPercent() + "%",
                    "WARNING"
                ));
            }
            
            // 检查内存使用率
            if (nodeMetric.getMemoryUsedPercent() > 90) {
                alerts.add(new HealthAlert(
                    "HIGH_MEMORY_USAGE",
                    "节点 " + nodeMetric.getNodeName() + " 内存使用率过高: " + 
                    nodeMetric.getMemoryUsedPercent() + "%",
                    "WARNING"
                ));
            }
        });
        
        return alerts;
    }
}

/**
 * 集群健康指标
 */
public class ClusterHealthMetrics {
    private String clusterStatus;
    private int activeShards;
    private int relocatingShards;
    private int initializingShards;
    private int unassignedShards;
    private int numberOfNodes;
    private int numberOfDataNodes;
    private long totalDocuments;
    private long totalIndexSize;
    private Map<String, NodeMetrics> nodeMetrics;
    private LocalDateTime timestamp;
    
    // Getter和Setter方法
    public String getClusterStatus() { return clusterStatus; }
    public void setClusterStatus(String clusterStatus) { this.clusterStatus = clusterStatus; }
    
    public int getActiveShards() { return activeShards; }
    public void setActiveShards(int activeShards) { this.activeShards = activeShards; }
    
    public int getUnassignedShards() { return unassignedShards; }
    public void setUnassignedShards(int unassignedShards) { this.unassignedShards = unassignedShards; }
    
    public Map<String, NodeMetrics> getNodeMetrics() { return nodeMetrics; }
    public void setNodeMetrics(Map<String, NodeMetrics> nodeMetrics) { this.nodeMetrics = nodeMetrics; }
    
    // 其他getter/setter方法...
}

/**
 * 节点指标
 */
public class NodeMetrics {
    private String nodeId;
    private String nodeName;
    private int heapUsedPercent;
    private long heapUsed;
    private long heapMax;
    private long gcTime;
    private int cpuPercent;
    private int memoryUsedPercent;
    private long indexingRate;
    private long searchRate;
    
    // Getter和Setter方法
    public String getNodeName() { return nodeName; }
    public void setNodeName(String nodeName) { this.nodeName = nodeName; }
    
    public int getHeapUsedPercent() { return heapUsedPercent; }
    public void setHeapUsedPercent(int heapUsedPercent) { this.heapUsedPercent = heapUsedPercent; }
    
    public int getCpuPercent() { return cpuPercent; }
    public void setCpuPercent(int cpuPercent) { this.cpuPercent = cpuPercent; }
    
    public int getMemoryUsedPercent() { return memoryUsedPercent; }
    public void setMemoryUsedPercent(int memoryUsedPercent) { this.memoryUsedPercent = memoryUsedPercent; }
    
    // 其他getter/setter方法...
}

/**
 * 健康告警
 */
public class HealthAlert {
    private String type;
    private String message;
    private String severity;
    private LocalDateTime timestamp;
    
    public HealthAlert(String type, String message, String severity) {
        this.type = type;
        this.message = message;
        this.severity = severity;
        this.timestamp = LocalDateTime.now();
    }
    
    // Getter方法
    public String getType() { return type; }
    public String getMessage() { return message; }
    public String getSeverity() { return severity; }
    public LocalDateTime getTimestamp() { return timestamp; }
}
```

### 2. 性能监控与告警

```java
/**
 * 性能监控服务
 */
@Service
public class PerformanceMonitoringService {
    
    @Autowired
    private ElasticsearchClient client;
    
    /**
     * 监控索引性能
     */
    public IndexPerformanceMetrics monitorIndexPerformance(String indexName) throws IOException {
        IndicesStatsRequest request = IndicesStatsRequest.of(s -> s
            .index(indexName)
            .metric(IndicesStatsMetric.Indexing, IndicesStatsMetric.Search, 
                   IndicesStatsMetric.Store, IndicesStatsMetric.Merge)
        );
        
        IndicesStatsResponse response = client.indices().stats(request);
        
        IndexPerformanceMetrics metrics = new IndexPerformanceMetrics();
        metrics.setIndexName(indexName);
        
        if (response.indices().containsKey(indexName)) {
            IndexStats indexStats = response.indices().get(indexName);
            
            // 索引性能指标
            if (indexStats.total().indexing() != null) {
                IndexingStats indexing = indexStats.total().indexing();
                metrics.setIndexTotal(indexing.indexTotal());
                metrics.setIndexTimeInMillis(indexing.indexTimeInMillis());
                metrics.setIndexCurrent(indexing.indexCurrent());
                
                if (indexing.indexTotal() > 0) {
                    metrics.setAvgIndexTime(indexing.indexTimeInMillis() / indexing.indexTotal());
                }
            }
            
            // 搜索性能指标
            if (indexStats.total().search() != null) {
                SearchStats search = indexStats.total().search();
                metrics.setQueryTotal(search.queryTotal());
                metrics.setQueryTimeInMillis(search.queryTimeInMillis());
                metrics.setQueryCurrent(search.queryCurrent());
                
                if (search.queryTotal() > 0) {
                    metrics.setAvgQueryTime(search.queryTimeInMillis() / search.queryTotal());
                }
            }
            
            // 存储指标
            if (indexStats.total().store() != null) {
                StoreStats store = indexStats.total().store();
                metrics.setStoreSizeInBytes(store.sizeInBytes());
            }
            
            // 合并指标
            if (indexStats.total().merge() != null) {
                MergeStats merge = indexStats.total().merge();
                metrics.setMergeTotal(merge.total());
                metrics.setMergeTimeInMillis(merge.totalTimeInMillis());
                metrics.setMergeCurrent(merge.current());
            }
        }
        
        metrics.setTimestamp(LocalDateTime.now());
        return metrics;
    }
    
    /**
     * 检测性能异常
     */
    public List<PerformanceAlert> detectPerformanceAnomalies(String indexName) throws IOException {
        List<PerformanceAlert> alerts = new ArrayList<>();
        IndexPerformanceMetrics metrics = monitorIndexPerformance(indexName);
        
        // 检查平均索引时间
        if (metrics.getAvgIndexTime() > 1000) {  // 超过1秒
            alerts.add(new PerformanceAlert(
                "SLOW_INDEXING",
                "索引 " + indexName + " 平均索引时间过长: " + metrics.getAvgIndexTime() + "ms",
                "WARNING"
            ));
        }
        
        // 检查平均查询时间
        if (metrics.getAvgQueryTime() > 5000) {  // 超过5秒
            alerts.add(new PerformanceAlert(
                "SLOW_QUERY",
                "索引 " + indexName + " 平均查询时间过长: " + metrics.getAvgQueryTime() + "ms",
                "WARNING"
            ));
        }
        
        // 检查当前索引队列
        if (metrics.getIndexCurrent() > 100) {
            alerts.add(new PerformanceAlert(
                "HIGH_INDEX_QUEUE",
                "索引 " + indexName + " 当前索引队列过长: " + metrics.getIndexCurrent(),
                "WARNING"
            ));
        }
        
        // 检查当前查询队列
        if (metrics.getQueryCurrent() > 50) {
            alerts.add(new PerformanceAlert(
                "HIGH_QUERY_QUEUE",
                "索引 " + indexName + " 当前查询队列过长: " + metrics.getQueryCurrent(),
                "WARNING"
            ));
        }
        
        return alerts;
    }
}
```

## （二）日志管理与分析

### 1. 日志收集配置

```yaml
# filebeat.yml
filebeat.inputs:
- type: log
  enabled: true
  paths:
    - /var/log/elasticsearch/*.log
  fields:
    service: elasticsearch
    environment: production
  fields_under_root: true
  multiline.pattern: '^\['
  multiline.negate: true
  multiline.match: after

- type: log
  enabled: true
  paths:
    - /var/log/application/*.log
  fields:
    service: application
    environment: production
  fields_under_root: true

processors:
- add_host_metadata:
    when.not.contains.tags: forwarded
- add_docker_metadata: ~
- add_kubernetes_metadata: ~

output.elasticsearch:
  hosts: ["elasticsearch-master-1:9200", "elasticsearch-master-2:9200"]
  index: "logs-%{[service]}-%{+yyyy.MM.dd}"
  template.name: "logs"
  template.pattern: "logs-*"
  template.settings:
    index.number_of_shards: 3
    index.number_of_replicas: 1
    index.refresh_interval: "30s"

logging.level: info
logging.to_files: true
logging.files:
  path: /var/log/filebeat
  name: filebeat
  keepfiles: 7
  permissions: 0644
```

### 2. 日志分析服务

```java
/**
 * 日志分析服务
 */
@Service
public class LogAnalysisService {
    
    @Autowired
    private ElasticsearchClient client;
    
    /**
     * 分析错误日志
     */
    public ErrorLogAnalysis analyzeErrorLogs(String timeRange) throws IOException {
        SearchRequest request = SearchRequest.of(s -> s
            .index("logs-*")
            .query(q -> q
                .bool(b -> b
                    .must(must -> must
                        .terms(t -> t
                            .field("level")
                            .terms(TermsQueryField.of(tf -> tf.value(
                                List.of(FieldValue.of("ERROR"), FieldValue.of("FATAL"))
                            )))
                        )
                    )
                    .filter(filter -> filter
                        .range(r -> r
                            .field("@timestamp")
                            .gte(JsonData.of(timeRange))
                        )
                    )
                )
            )
            .aggregations("errors_by_service", a -> a
                .terms(t -> t
                    .field("service")
                    .size(20)
                )
                .aggregations("errors_over_time", sub -> sub
                    .dateHistogram(dh -> dh
                        .field("@timestamp")
                        .calendarInterval(CalendarInterval.Hour)
                    )
                )
            )
            .aggregations("top_error_messages", a -> a
                .terms(t -> t
                    .field("message.keyword")
                    .size(10)
                )
            )
            .size(100)
            .sort(so -> so
                .field(f -> f.field("@timestamp").order(SortOrder.Desc))
            )
        );
        
        SearchResponse<LogEntry> response = client.search(request, LogEntry.class);
        
        ErrorLogAnalysis analysis = new ErrorLogAnalysis();
        analysis.setTotalErrors(response.hits().total().value());
        analysis.setTimeRange(timeRange);
        
        // 按服务统计错误
        StringTermsAggregate errorsByService = response.aggregations()
                .get("errors_by_service")
                .sterms();
        
        Map<String, Long> serviceErrors = new HashMap<>();
        for (StringTermsBucket bucket : errorsByService.buckets().array()) {
            serviceErrors.put(bucket.key().stringValue(), bucket.docCount());
        }
        analysis.setErrorsByService(serviceErrors);
        
        // 热门错误消息
        StringTermsAggregate topErrorMessages = response.aggregations()
                .get("top_error_messages")
                .sterms();
        
        List<ErrorPattern> errorPatterns = new ArrayList<>();
        for (StringTermsBucket bucket : topErrorMessages.buckets().array()) {
            errorPatterns.add(new ErrorPattern(
                bucket.key().stringValue(),
                bucket.docCount()
            ));
        }
        analysis.setTopErrorPatterns(errorPatterns);
        
        // 最新错误日志
        List<LogEntry> recentErrors = response.hits().hits().stream()
                .map(Hit::source)
                .collect(Collectors.toList());
        analysis.setRecentErrors(recentErrors);
        
        return analysis;
    }
    
    /**
     * 性能日志分析
     */
    public PerformanceLogAnalysis analyzePerformanceLogs(String timeRange) throws IOException {
        SearchRequest request = SearchRequest.of(s -> s
            .index("logs-application-*")
            .query(q -> q
                .bool(b -> b
                    .must(must -> must
                        .exists(e -> e.field("response_time"))
                    )
                    .filter(filter -> filter
                        .range(r -> r
                            .field("@timestamp")
                            .gte(JsonData.of(timeRange))
                        )
                    )
                )
            )
            .aggregations("avg_response_time", a -> a
                .avg(avg -> avg.field("response_time"))
            )
            .aggregations("response_time_percentiles", a -> a
                .percentiles(p -> p
                    .field("response_time")
                    .percents(50.0, 90.0, 95.0, 99.0)
                )
            )
            .aggregations("slow_requests", a -> a
                .filter(f -> f
                    .range(r -> r
                        .field("response_time")
                        .gte(JsonData.of(5000))  // 超过5秒的请求
                    )
                )
                .aggregations("slow_by_endpoint", sub -> sub
                    .terms(t -> t
                        .field("endpoint.keyword")
                        .size(10)
                    )
                )
            )
            .aggregations("response_time_over_time", a -> a
                .dateHistogram(dh -> dh
                    .field("@timestamp")
                    .calendarInterval(CalendarInterval.Minute)
                )
                .aggregations("avg_response_time", sub -> sub
                    .avg(avg -> avg.field("response_time"))
                )
            )
            .size(0)
        );
        
        SearchResponse<Void> response = client.search(request, Void.class);
        
        PerformanceLogAnalysis analysis = new PerformanceLogAnalysis();
        
        // 平均响应时间
        AvgAggregate avgResponseTime = response.aggregations()
                .get("avg_response_time")
                .avg();
        analysis.setAverageResponseTime(avgResponseTime.value());
        
        // 响应时间百分位数
        PercentilesAggregate percentiles = response.aggregations()
                .get("response_time_percentiles")
                .percentiles();
        
        Map<String, Double> responseTimePercentiles = new HashMap<>();
        percentiles.values().forEach((key, value) -> {
            responseTimePercentiles.put("p" + key, value);
        });
        analysis.setResponseTimePercentiles(responseTimePercentiles);
        
        // 慢请求分析
        FilterAggregate slowRequests = response.aggregations()
                .get("slow_requests")
                .filter();
        analysis.setSlowRequestCount(slowRequests.docCount());
        
        if (slowRequests.aggregations().containsKey("slow_by_endpoint")) {
            StringTermsAggregate slowByEndpoint = slowRequests.aggregations()
                    .get("slow_by_endpoint")
                    .sterms();
            
            Map<String, Long> slowEndpoints = new HashMap<>();
            for (StringTermsBucket bucket : slowByEndpoint.buckets().array()) {
                slowEndpoints.put(bucket.key().stringValue(), bucket.docCount());
            }
            analysis.setSlowEndpoints(slowEndpoints);
        }
        
        return analysis;
    }
}
```

## （三）备份与恢复

### 1. 快照备份策略

```java
/**
 * 备份恢复服务
 */
@Service
public class BackupRestoreService {
    
    @Autowired
    private ElasticsearchClient client;
    
    /**
     * 创建快照仓库
     */
    public void createSnapshotRepository(String repositoryName, String location) throws IOException {
        PutRepositoryRequest request = PutRepositoryRequest.of(r -> r
            .name(repositoryName)
            .type("fs")
            .settings(s -> s
                .put("location", JsonData.of(location))
                .put("compress", JsonData.of(true))
                .put("chunk_size", JsonData.of("1gb"))
                .put("max_restore_bytes_per_sec", JsonData.of("100mb"))
                .put("max_snapshot_bytes_per_sec", JsonData.of("100mb"))
            )
        );
        
        PutRepositoryResponse response = client.snapshot().createRepository(request);
        System.out.println("快照仓库创建结果: " + response.acknowledged());
    }
    
    /**
     * 创建快照
     */
    public void createSnapshot(String repositoryName, String snapshotName, 
                             List<String> indices) throws IOException {
        CreateSnapshotRequest request = CreateSnapshotRequest.of(s -> s
            .repository(repositoryName)
            .snapshot(snapshotName)
            .indices(indices)
            .ignoreUnavailable(true)
            .includeGlobalState(false)
            .waitForCompletion(false)  // 异步执行
            .metadata(Map.of(
                "created_by", "backup_service",
                "created_at", LocalDateTime.now().toString()
            ))
        );
        
        CreateSnapshotResponse response = client.snapshot().create(request);
        System.out.println("快照创建结果: " + response.snapshot().state());
    }
    
    /**
     * 恢复快照
     */
    public void restoreSnapshot(String repositoryName, String snapshotName, 
                              List<String> indices, String renamePattern, 
                              String renameReplacement) throws IOException {
        RestoreRequest request = RestoreRequest.of(r -> r
            .repository(repositoryName)
            .snapshot(snapshotName)
            .indices(indices)
            .ignoreUnavailable(true)
            .includeGlobalState(false)
            .renamePattern(renamePattern)
            .renameReplacement(renameReplacement)
            .waitForCompletion(false)
            .indexSettings(is -> is
                .put("index.number_of_replicas", JsonData.of(1))
            )
        );
        
        RestoreResponse response = client.snapshot().restore(request);
        System.out.println("快照恢复结果: " + response.snapshot().shards().successful());
    }
    
    /**
     * 自动备份调度
     */
    @Scheduled(cron = "0 0 2 * * ?")  // 每天凌晨2点执行
    public void scheduledBackup() {
        try {
            String repositoryName = "daily_backup";
            String snapshotName = "snapshot_" + LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy_MM_dd"));
            List<String> indices = List.of("logs-*", "metrics-*", "user_data-*");
            
            createSnapshot(repositoryName, snapshotName, indices);
            
            // 清理旧快照（保留30天）
            cleanupOldSnapshots(repositoryName, 30);
            
        } catch (IOException e) {
            System.err.println("自动备份失败: " + e.getMessage());
        }
    }
    
    /**
     * 清理旧快照
     */
    public void cleanupOldSnapshots(String repositoryName, int retentionDays) throws IOException {
        GetSnapshotRequest getRequest = GetSnapshotRequest.of(g -> g
            .repository(repositoryName)
            .snapshot("*")
        );
        
        GetSnapshotResponse getResponse = client.snapshot().get(getRequest);
        
        LocalDateTime cutoffDate = LocalDateTime.now().minusDays(retentionDays);
        
        for (SnapshotInfo snapshot : getResponse.snapshots()) {
            if (snapshot.startTime() != null) {
                LocalDateTime snapshotTime = LocalDateTime.ofInstant(
                    Instant.ofEpochMilli(snapshot.startTime()), 
                    ZoneId.systemDefault()
                );
                
                if (snapshotTime.isBefore(cutoffDate)) {
                    DeleteSnapshotRequest deleteRequest = DeleteSnapshotRequest.of(d -> d
                        .repository(repositoryName)
                        .snapshot(snapshot.snapshot())
                    );
                    
                    client.snapshot().delete(deleteRequest);
                    System.out.println("删除旧快照: " + snapshot.snapshot());
                }
            }
        }
    }
    
    /**
     * 获取快照状态
     */
    public List<SnapshotStatus> getSnapshotStatus(String repositoryName) throws IOException {
        SnapshotStatusRequest request = SnapshotStatusRequest.of(s -> s
            .repository(repositoryName)
        );
        
        SnapshotStatusResponse response = client.snapshot().status(request);
        
        return response.snapshots().stream()
                .map(snapshot -> {
                    SnapshotStatus status = new SnapshotStatus();
                    status.setSnapshotName(snapshot.snapshot());
                    status.setState(snapshot.state());
                    status.setStartTime(snapshot.stats().startTimeInMillis());
                    status.setTotalSize(snapshot.stats().totalSize());
                    status.setProcessedSize(snapshot.stats().processedSize());
                    return status;
                })
                .collect(Collectors.toList());
    }
}
```

# 五、总结与最佳实践

## （一）企业级部署最佳实践

**集群架构设计原则**
- 采用专用主节点架构，确保集群稳定性
- 合理规划数据节点和协调节点，避免单点故障
- 根据数据量和查询负载合理设置分片数量
- 实施冷热数据分离策略，优化存储成本

**性能优化策略**
- JVM堆内存不超过32GB，推荐设置为物理内存的50%
- 使用G1垃圾回收器，优化GC性能
- 合理设置刷新间隔和合并策略
- 实施查询缓存和请求缓存优化

**安全配置要点**
- 启用X-Pack安全功能，配置SSL/TLS加密
- 实施基于角色的访问控制（RBAC）
- 配置审计日志，监控安全事件
- 对敏感数据进行字段级加密

## （二）运维监控体系

**监控指标体系**
- 集群健康状态：红/黄/绿状态监控
- 节点资源监控：CPU、内存、磁盘使用率
- 性能指标监控：索引速度、查询延迟、吞吐量
- 业务指标监控：文档数量、索引大小、错误率

**告警策略**
- 设置多级告警阈值：警告、严重、紧急
- 实施智能告警，避免告警风暴
- 建立告警处理流程和升级机制
- 定期回顾和优化告警规则

**备份恢复策略**
- 实施定期自动备份，保留合理的备份周期
- 测试备份恢复流程，确保数据可恢复性
- 实施跨地域备份，提高灾难恢复能力
- 建立备份监控和告警机制

## （三）下一步学习建议

1. **深入学习Elasticsearch内核机制**
   - 理解Lucene底层原理
   - 掌握分片路由和分配算法
   - 学习查询执行计划优化

2. **扩展生态系统**
   - 学习ELK Stack完整解决方案
   - 掌握Beats数据采集工具
   - 了解Elastic APM应用性能监控

3. **云原生部署**
   - 学习Kubernetes上的Elasticsearch部署
   - 掌握Elastic Cloud服务
   - 了解容器化最佳实践

4. **机器学习和AI集成**
   - 学习Elasticsearch机器学习功能
   - 掌握异常检测和预测分析
   - 了解向量搜索和语义搜索

通过本系列教程的学习，您已经掌握了从Elasticsearch基础概念到企业级应用的完整知识体系。继续实践和深入学习，您将能够构建和维护大规模、高性能的Elasticsearch集群，为企业提供强大的搜索和分析能力。

---

> **相关文章**
> - [入门级：基础概念与环境搭建](./【大数据】Elasticsearch%208.x%20入门指南：基础概念与环境搭建.md)
> - [进阶级：复杂查询与聚合分析](./【大数据】Elasticsearch%208.x%20进阶指南：复杂查询与聚合分析.md)
> - [系列导航：Elasticsearch完整学习路径](./【大数据】Elasticsearch%208.x%20全面实战指南：从入门到企业级应用.md)