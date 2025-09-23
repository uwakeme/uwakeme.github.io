---
title: 【大数据】Elasticsearch 8.x 进阶指南：复杂查询与聚合分析
categories: 大数据
date: 2025-01-19 18:10:00
tags:
  - Elasticsearch
  - 复杂查询
  - 聚合分析
  - 性能优化
  - 布尔查询
  - 全文搜索
series: Elasticsearch系列
cover: 
---

# 前言

在掌握了Elasticsearch的基础概念和简单操作后，本文将深入探讨复杂查询、聚合分析和性能优化等进阶主题。这些技能是构建高效搜索应用的关键，适合有一定Elasticsearch基础的开发者学习。

> **系列文章导航**
> - 🟢 [入门级：基础概念与环境搭建](./【大数据】Elasticsearch%208.x%20入门指南：基础概念与环境搭建.md)
> - 🟡 **进阶级**：复杂查询与聚合分析（本文）
> - 🔴 [高级：集群管理与企业级应用](./【大数据】Elasticsearch%208.x%20高级指南：集群管理与企业级应用.md)

# 一、复杂查询技术

## （一）布尔查询

### 1. 布尔查询基础

布尔查询是Elasticsearch中最强大的查询类型，允许组合多个查询条件。

```java
@Service
public class AdvancedSearchService {
    
    @Autowired
    private ElasticsearchClient client;
    
    /**
     * 布尔查询示例
     * 组合多个查询条件
     */
    public List<Document> booleanSearch(String indexName, SearchParams params) throws IOException {
        SearchRequest request = SearchRequest.of(s -> s
            .index(indexName)
            .query(q -> q
                .bool(b -> b
                    // must: 必须匹配（参与评分）
                    .must(must -> must
                        .multiMatch(m -> m
                            .query(params.getKeyword())
                            .fields("title^2", "content")  // title权重为2
                            .type(TextQueryType.BestFields)
                        )
                    )
                    // filter: 必须匹配（不参与评分，可缓存）
                    .filter(filter -> filter
                        .range(r -> r
                            .field("createTime")
                            .gte(JsonData.of(params.getStartTime()))
                            .lte(JsonData.of(params.getEndTime()))
                        )
                    )
                    // should: 应该匹配（可选条件，影响评分）
                    .should(should -> should
                        .terms(t -> t
                            .field("tags")
                            .terms(TermsQueryField.of(tf -> tf.value(
                                params.getTags().stream()
                                    .map(FieldValue::of)
                                    .collect(Collectors.toList())
                            )))
                        )
                    )
                    // must_not: 必须不匹配
                    .mustNot(mustNot -> mustNot
                        .term(t -> t
                            .field("status")
                            .value("deleted")
                        )
                    )
                    .minimumShouldMatch("1")  // 至少匹配一个should条件
                )
            )
            .sort(so -> so
                .score(sc -> sc.order(SortOrder.Desc))
                .field(f -> f.field("createTime").order(SortOrder.Desc))
            )
            .size(20)
        );
        
        SearchResponse<Document> response = client.search(request, Document.class);
        return response.hits().hits().stream()
                .map(Hit::source)
                .collect(Collectors.toList());
    }
}
```

### 2. 查询参数类

```java
/**
 * 搜索参数封装类
 */
public class SearchParams {
    private String keyword;
    private String startTime;
    private String endTime;
    private List<String> tags;
    private String category;
    private Integer from = 0;
    private Integer size = 20;
    
    // 构造函数
    public SearchParams() {}
    
    public SearchParams(String keyword) {
        this.keyword = keyword;
    }
    
    // Getter和Setter方法
    public String getKeyword() { return keyword; }
    public void setKeyword(String keyword) { this.keyword = keyword; }
    
    public String getStartTime() { return startTime; }
    public void setStartTime(String startTime) { this.startTime = startTime; }
    
    public String getEndTime() { return endTime; }
    public void setEndTime(String endTime) { this.endTime = endTime; }
    
    public List<String> getTags() { return tags != null ? tags : new ArrayList<>(); }
    public void setTags(List<String> tags) { this.tags = tags; }
    
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    
    public Integer getFrom() { return from; }
    public void setFrom(Integer from) { this.from = from; }
    
    public Integer getSize() { return size; }
    public void setSize(Integer size) { this.size = size; }
}
```

## （二）全文搜索优化

### 1. 多字段搜索

```java
/**
 * 高级全文搜索
 * 支持多字段、权重、高亮等功能
 */
public SearchResult advancedFullTextSearch(String indexName, String keyword, int page, int size) throws IOException {
    SearchRequest request = SearchRequest.of(s -> s
        .index(indexName)
        .query(q -> q
            .bool(b -> b
                .should(should -> should
                    // 精确匹配标题（最高权重）
                    .match(m -> m
                        .field("title")
                        .query(keyword)
                        .boost(3.0f)
                    )
                )
                .should(should -> should
                    // 模糊匹配标题
                    .match(m -> m
                        .field("title")
                        .query(keyword)
                        .fuzziness("AUTO")
                        .boost(2.0f)
                    )
                )
                .should(should -> should
                    // 内容匹配
                    .match(m -> m
                        .field("content")
                        .query(keyword)
                        .boost(1.0f)
                    )
                )
                .should(should -> should
                    // 短语匹配（更高权重）
                    .matchPhrase(mp -> mp
                        .field("content")
                        .query(keyword)
                        .boost(2.5f)
                    )
                )
                .minimumShouldMatch("1")
            )
        )
        .highlight(h -> h
            .fields("title", hf -> hf
                .preTags("<mark>")
                .postTags("</mark>")
                .numberOfFragments(1)
            )
            .fields("content", hf -> hf
                .preTags("<mark>")
                .postTags("</mark>")
                .fragmentSize(150)
                .numberOfFragments(3)
            )
        )
        .from(page * size)
        .size(size)
        .sort(so -> so
            .score(sc -> sc.order(SortOrder.Desc))
        )
    );
    
    SearchResponse<Document> response = client.search(request, Document.class);
    
    // 构建搜索结果
    List<SearchResultItem> items = new ArrayList<>();
    for (Hit<Document> hit : response.hits().hits()) {
        SearchResultItem item = new SearchResultItem();
        item.setDocument(hit.source());
        item.setScore(hit.score());
        
        // 处理高亮
        if (hit.highlight() != null) {
            Map<String, List<String>> highlights = new HashMap<>();
            hit.highlight().forEach((field, fragments) -> {
                highlights.put(field, fragments);
            });
            item.setHighlights(highlights);
        }
        
        items.add(item);
    }
    
    return new SearchResult(
        items,
        response.hits().total().value(),
        page,
        size
    );
}
```

### 2. 搜索结果封装

```java
/**
 * 搜索结果项
 */
public class SearchResultItem {
    private Document document;
    private Double score;
    private Map<String, List<String>> highlights;
    
    // 构造函数和Getter/Setter方法
    public SearchResultItem() {}
    
    public Document getDocument() { return document; }
    public void setDocument(Document document) { this.document = document; }
    
    public Double getScore() { return score; }
    public void setScore(Double score) { this.score = score; }
    
    public Map<String, List<String>> getHighlights() { return highlights; }
    public void setHighlights(Map<String, List<String>> highlights) { this.highlights = highlights; }
}

/**
 * 搜索结果封装
 */
public class SearchResult {
    private List<SearchResultItem> items;
    private Long total;
    private Integer page;
    private Integer size;
    
    public SearchResult(List<SearchResultItem> items, Long total, Integer page, Integer size) {
        this.items = items;
        this.total = total;
        this.page = page;
        this.size = size;
    }
    
    // Getter方法
    public List<SearchResultItem> getItems() { return items; }
    public Long getTotal() { return total; }
    public Integer getPage() { return page; }
    public Integer getSize() { return size; }
    public Integer getTotalPages() { return (int) Math.ceil((double) total / size); }
}
```

## （三）范围和模糊查询

### 1. 范围查询

```java
/**
 * 范围查询示例
 */
public List<Document> rangeSearch(String indexName, RangeParams params) throws IOException {
    SearchRequest request = SearchRequest.of(s -> s
        .index(indexName)
        .query(q -> q
            .bool(b -> {
                BoolQuery.Builder boolBuilder = new BoolQuery.Builder();
                
                // 数值范围查询
                if (params.getMinPrice() != null || params.getMaxPrice() != null) {
                    boolBuilder.filter(filter -> filter
                        .range(r -> {
                            RangeQuery.Builder rangeBuilder = new RangeQuery.Builder()
                                .field("price");
                            if (params.getMinPrice() != null) {
                                rangeBuilder.gte(JsonData.of(params.getMinPrice()));
                            }
                            if (params.getMaxPrice() != null) {
                                rangeBuilder.lte(JsonData.of(params.getMaxPrice()));
                            }
                            return rangeBuilder.build();
                        })
                    );
                }
                
                // 日期范围查询
                if (params.getStartDate() != null || params.getEndDate() != null) {
                    boolBuilder.filter(filter -> filter
                        .range(r -> {
                            RangeQuery.Builder rangeBuilder = new RangeQuery.Builder()
                                .field("createTime");
                            if (params.getStartDate() != null) {
                                rangeBuilder.gte(JsonData.of(params.getStartDate()));
                            }
                            if (params.getEndDate() != null) {
                                rangeBuilder.lte(JsonData.of(params.getEndDate()));
                            }
                            return rangeBuilder.build();
                        })
                    );
                }
                
                return boolBuilder.build();
            })
        )
        .sort(so -> so
            .field(f -> f.field("createTime").order(SortOrder.Desc))
        )
    );
    
    SearchResponse<Document> response = client.search(request, Document.class);
    return response.hits().hits().stream()
            .map(Hit::source)
            .collect(Collectors.toList());
}
```

### 2. 模糊查询

```java
/**
 * 模糊查询和通配符查询
 */
public List<Document> fuzzyAndWildcardSearch(String indexName, String keyword) throws IOException {
    SearchRequest request = SearchRequest.of(s -> s
        .index(indexName)
        .query(q -> q
            .bool(b -> b
                .should(should -> should
                    // 模糊查询
                    .fuzzy(f -> f
                        .field("title")
                        .value(keyword)
                        .fuzziness("AUTO")  // 自动模糊度
                        .boost(2.0f)
                    )
                )
                .should(should -> should
                    // 通配符查询
                    .wildcard(w -> w
                        .field("title")
                        .value("*" + keyword + "*")
                        .boost(1.5f)
                    )
                )
                .should(should -> should
                    // 前缀查询
                    .prefix(p -> p
                        .field("title")
                        .value(keyword)
                        .boost(1.0f)
                    )
                )
                .minimumShouldMatch("1")
            )
        )
    );
    
    SearchResponse<Document> response = client.search(request, Document.class);
    return response.hits().hits().stream()
            .map(Hit::source)
            .collect(Collectors.toList());
}
```

# 二、聚合分析

## （一）桶聚合

### 1. 词条聚合

```java
@Service
public class AggregationService {
    
    @Autowired
    private ElasticsearchClient client;
    
    /**
     * 标签聚合统计
     */
    public Map<String, Long> getTagsAggregation(String indexName, int size) throws IOException {
        SearchRequest request = SearchRequest.of(s -> s
            .index(indexName)
            .size(0)  // 不返回文档，只返回聚合结果
            .aggregations("tags_agg", a -> a
                .terms(t -> t
                    .field("tags")
                    .size(size)
                    .order(NamedValue.of("_count", SortOrder.Desc))  // 按文档数量降序
                )
            )
        );
        
        SearchResponse<Void> response = client.search(request, Void.class);
        
        Map<String, Long> tagCounts = new LinkedHashMap<>();
        
        StringTermsAggregate tagsAgg = response.aggregations()
                .get("tags_agg")
                .sterms();
        
        for (StringTermsBucket bucket : tagsAgg.buckets().array()) {
            tagCounts.put(bucket.key().stringValue(), bucket.docCount());
        }
        
        return tagCounts;
    }
    
    /**
     * 分类聚合统计
     */
    public Map<String, Long> getCategoryAggregation(String indexName) throws IOException {
        SearchRequest request = SearchRequest.of(s -> s
            .index(indexName)
            .size(0)
            .aggregations("category_agg", a -> a
                .terms(t -> t
                    .field("category.keyword")  // 使用keyword字段进行聚合
                    .size(20)
                )
            )
        );
        
        SearchResponse<Void> response = client.search(request, Void.class);
        
        Map<String, Long> categoryCounts = new LinkedHashMap<>();
        
        StringTermsAggregate categoryAgg = response.aggregations()
                .get("category_agg")
                .sterms();
        
        for (StringTermsBucket bucket : categoryAgg.buckets().array()) {
            categoryCounts.put(bucket.key().stringValue(), bucket.docCount());
        }
        
        return categoryCounts;
    }
}
```

### 2. 日期直方图聚合

```java
/**
 * 日期直方图聚合
 * 按时间维度统计文档数量
 */
public Map<String, Long> getDateHistogram(String indexName, String interval) throws IOException {
    CalendarInterval calendarInterval;
    switch (interval.toLowerCase()) {
        case "day":
            calendarInterval = CalendarInterval.Day;
            break;
        case "week":
            calendarInterval = CalendarInterval.Week;
            break;
        case "month":
            calendarInterval = CalendarInterval.Month;
            break;
        default:
            calendarInterval = CalendarInterval.Day;
    }
    
    SearchRequest request = SearchRequest.of(s -> s
        .index(indexName)
        .size(0)
        .aggregations("date_histogram", a -> a
            .dateHistogram(d -> d
                .field("createTime")
                .calendarInterval(calendarInterval)
                .format("yyyy-MM-dd")
                .minDocCount(0)  // 包含文档数为0的桶
            )
        )
    );
    
    SearchResponse<Void> response = client.search(request, Void.class);
    
    Map<String, Long> dateCount = new LinkedHashMap<>();
    
    DateHistogramAggregate dateAgg = response.aggregations()
            .get("date_histogram")
            .dateHistogram();
    
    for (DateHistogramBucket bucket : dateAgg.buckets().array()) {
        dateCount.put(bucket.keyAsString(), bucket.docCount());
    }
    
    return dateCount;
}
```

## （二）指标聚合

### 1. 统计聚合

```java
/**
 * 数值字段统计聚合
 */
public StatisticsResult getStatistics(String indexName, String field) throws IOException {
    SearchRequest request = SearchRequest.of(s -> s
        .index(indexName)
        .size(0)
        .aggregations("stats", a -> a
            .stats(st -> st.field(field))
        )
        .aggregations("extended_stats", a -> a
            .extendedStats(es -> es.field(field))
        )
    );
    
    SearchResponse<Void> response = client.search(request, Void.class);
    
    // 基础统计
    StatsAggregate stats = response.aggregations()
            .get("stats")
            .stats();
    
    // 扩展统计
    ExtendedStatsAggregate extendedStats = response.aggregations()
            .get("extended_stats")
            .extendedStats();
    
    return new StatisticsResult(
        stats.count(),
        stats.sum(),
        stats.avg(),
        stats.min(),
        stats.max(),
        extendedStats.stdDeviation(),
        extendedStats.variance()
    );
}

/**
 * 统计结果封装类
 */
public class StatisticsResult {
    private long count;
    private double sum;
    private double avg;
    private double min;
    private double max;
    private double stdDeviation;
    private double variance;
    
    public StatisticsResult(long count, double sum, double avg, double min, double max, 
                          double stdDeviation, double variance) {
        this.count = count;
        this.sum = sum;
        this.avg = avg;
        this.min = min;
        this.max = max;
        this.stdDeviation = stdDeviation;
        this.variance = variance;
    }
    
    // Getter方法
    public long getCount() { return count; }
    public double getSum() { return sum; }
    public double getAvg() { return avg; }
    public double getMin() { return min; }
    public double getMax() { return max; }
    public double getStdDeviation() { return stdDeviation; }
    public double getVariance() { return variance; }
}
```

### 2. 百分位聚合

```java
/**
 * 百分位聚合分析
 */
public Map<String, Double> getPercentiles(String indexName, String field) throws IOException {
    SearchRequest request = SearchRequest.of(s -> s
        .index(indexName)
        .size(0)
        .aggregations("percentiles", a -> a
            .percentiles(p -> p
                .field(field)
                .percents(25.0, 50.0, 75.0, 90.0, 95.0, 99.0)
            )
        )
    );
    
    SearchResponse<Void> response = client.search(request, Void.class);
    
    PercentilesAggregate percentiles = response.aggregations()
            .get("percentiles")
            .percentiles();
    
    Map<String, Double> result = new LinkedHashMap<>();
    for (Percentile percentile : percentiles.values().keyed().values()) {
        result.put("P" + percentile.percentile(), percentile.value());
    }
    
    return result;
}
```

## （三）嵌套聚合

### 1. 多级聚合

```java
/**
 * 多级聚合：按分类统计，每个分类下按标签统计
 */
public Map<String, Map<String, Long>> getNestedAggregation(String indexName) throws IOException {
    SearchRequest request = SearchRequest.of(s -> s
        .index(indexName)
        .size(0)
        .aggregations("category_agg", a -> a
            .terms(t -> t
                .field("category.keyword")
                .size(10)
            )
            .aggregations("tags_agg", subA -> subA
                .terms(t -> t
                    .field("tags")
                    .size(5)
                )
            )
        )
    );
    
    SearchResponse<Void> response = client.search(request, Void.class);
    
    Map<String, Map<String, Long>> result = new LinkedHashMap<>();
    
    StringTermsAggregate categoryAgg = response.aggregations()
            .get("category_agg")
            .sterms();
    
    for (StringTermsBucket categoryBucket : categoryAgg.buckets().array()) {
        String category = categoryBucket.key().stringValue();
        Map<String, Long> tagCounts = new LinkedHashMap<>();
        
        StringTermsAggregate tagsAgg = categoryBucket.aggregations()
                .get("tags_agg")
                .sterms();
        
        for (StringTermsBucket tagBucket : tagsAgg.buckets().array()) {
            tagCounts.put(tagBucket.key().stringValue(), tagBucket.docCount());
        }
        
        result.put(category, tagCounts);
    }
    
    return result;
}
```

# 三、性能优化基础

## （一）查询优化

### 1. 查询缓存优化

```java
/**
 * 优化的搜索服务
 * 使用过滤器、缓存和合适的查询类型
 */
@Service
public class OptimizedSearchService {
    
    @Autowired
    private ElasticsearchClient client;
    
    /**
     * 优化的搜索查询
     */
    public SearchResult optimizedSearch(SearchParams params) throws IOException {
        SearchRequest request = SearchRequest.of(s -> s
            .index(params.getIndexName())
            .query(q -> q
                .bool(b -> b
                    // 使用must查询进行评分
                    .must(must -> must
                        .multiMatch(m -> m
                            .query(params.getKeyword())
                            .fields("title^3", "content")
                            .type(TextQueryType.BestFields)
                            .minimumShouldMatch("75%")
                        )
                    )
                    // 使用filter进行精确过滤（不参与评分，可缓存）
                    .filter(filter -> filter
                        .terms(t -> t
                            .field("tags")
                            .terms(TermsQueryField.of(tf -> tf.value(
                                params.getTags().stream()
                                    .map(FieldValue::of)
                                    .collect(Collectors.toList())
                            )))
                        )
                    )
                    .filter(filter -> filter
                        .range(r -> r
                            .field("createTime")
                            .gte(JsonData.of(params.getStartTime()))
                            .lte(JsonData.of(params.getEndTime()))
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
                    .includes("id", "title", "summary", "createTime", "tags")  // 只返回需要的字段
                    .excludes("content")  // 排除大字段
                )
            )
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
}
```

### 2. 批量操作优化

```java
/**
 * 优化的批量操作服务
 */
@Service
public class OptimizedBulkService {
    
    @Autowired
    private ElasticsearchClient client;
    
    /**
     * 优化的批量插入
     */
    public void optimizedBulkInsert(String indexName, List<Document> documents) throws IOException {
        final int BATCH_SIZE = 1000;  // 每批1000个文档
        
        // 分批处理
        for (int i = 0; i < documents.size(); i += BATCH_SIZE) {
            int endIndex = Math.min(i + BATCH_SIZE, documents.size());
            List<Document> batch = documents.subList(i, endIndex);
            
            processBatch(indexName, batch);
            
            // 批次间短暂休息，避免过载
            if (endIndex < documents.size()) {
                try {
                    Thread.sleep(100);
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    break;
                }
            }
        }
    }
    
    private void processBatch(String indexName, List<Document> batch) throws IOException {
        BulkRequest.Builder bulkBuilder = new BulkRequest.Builder();
        
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
        
        if (response.errors()) {
            System.err.println("批次处理存在错误");
            for (BulkResponseItem item : response.items()) {
                if (item.error() != null) {
                    System.err.println("错误: " + item.error().reason());
                }
            }
        } else {
            System.out.println("成功处理批次，文档数量: " + batch.size());
        }
    }
}
```

## （二）索引优化

### 1. 索引设置优化

```yaml
# elasticsearch.yml 性能优化配置
# 内存设置
indices.memory.index_buffer_size: 20%
indices.memory.min_index_buffer_size: 96mb

# 刷新设置
index.refresh_interval: 30s  # 降低刷新频率

# 合并设置
index.merge.policy.max_merge_at_once: 5
index.merge.policy.segments_per_tier: 5
```

### 2. 映射优化

```java
/**
 * 优化的索引映射
 */
public void createOptimizedIndex(String indexName) throws IOException {
    TypeMapping mapping = TypeMapping.of(m -> m
        .properties("id", Property.of(p -> p.keyword(k -> k
            .store(false)  // 不存储，节省空间
        )))
        .properties("title", Property.of(p -> p.text(t -> t
            .analyzer("standard")
            .store(true)   // 存储用于高亮
            .fields("keyword", f -> f.keyword(k -> k))  // 多字段映射
        )))
        .properties("content", Property.of(p -> p.text(t -> t
            .analyzer("standard")
            .store(false)  // 大字段不存储
            .indexOptions(IndexOptions.Docs)  // 只索引文档，不索引位置
        )))
        .properties("createTime", Property.of(p -> p.date(d -> d
            .format("yyyy-MM-dd HH:mm:ss")
            .store(false)
        )))
        .properties("tags", Property.of(p -> p.keyword(k -> k
            .store(false)
        )))
        .properties("summary", Property.of(p -> p.text(t -> t
            .analyzer("standard")
            .store(true)   // 摘要字段存储用于显示
        )))
    );
    
    CreateIndexRequest request = CreateIndexRequest.of(i -> i
        .index(indexName)
        .mappings(mapping)
        .settings(s -> s
            .numberOfShards("3")
            .numberOfReplicas("1")
            .refreshInterval(t -> t.time("30s"))  // 降低刷新频率
            .maxResultWindow(50000)  // 增加最大结果窗口
        )
    );
    
    CreateIndexResponse response = client.indices().create(request);
    System.out.println("优化索引创建结果: " + response.acknowledged());
}
```

# 四、实战案例：电商搜索系统

## （一）商品搜索实现

### 1. 商品实体类

```java
/**
 * 商品实体类
 */
public class Product {
    private String id;
    private String name;
    private String description;
    private String category;
    private String brand;
    private Double price;
    private Integer stock;
    private List<String> tags;
    private Double rating;
    private Integer reviewCount;
    private String createTime;
    
    // 构造函数
    public Product() {}
    
    public Product(String id, String name, String category, String brand, Double price) {
        this.id = id;
        this.name = name;
        this.category = category;
        this.brand = brand;
        this.price = price;
        this.createTime = LocalDateTime.now().format(
            DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")
        );
        this.tags = new ArrayList<>();
    }
    
    // Getter和Setter方法（省略）
}
```

### 2. 商品搜索服务

```java
@Service
public class ProductSearchService {
    
    @Autowired
    private ElasticsearchClient client;
    
    private static final String PRODUCT_INDEX = "products";
    
    /**
     * 综合商品搜索
     */
    public SearchResult searchProducts(ProductSearchParams params) throws IOException {
        SearchRequest request = SearchRequest.of(s -> s
            .index(PRODUCT_INDEX)
            .query(q -> q
                .bool(b -> {
                    BoolQuery.Builder boolBuilder = new BoolQuery.Builder();
                    
                    // 关键词搜索
                    if (StringUtils.hasText(params.getKeyword())) {
                        boolBuilder.must(must -> must
                            .multiMatch(m -> m
                                .query(params.getKeyword())
                                .fields("name^3", "description", "brand^2")
                                .type(TextQueryType.BestFields)
                                .fuzziness("AUTO")
                            )
                        );
                    }
                    
                    // 分类过滤
                    if (StringUtils.hasText(params.getCategory())) {
                        boolBuilder.filter(filter -> filter
                            .term(t -> t
                                .field("category.keyword")
                                .value(params.getCategory())
                            )
                        );
                    }
                    
                    // 品牌过滤
                    if (params.getBrands() != null && !params.getBrands().isEmpty()) {
                        boolBuilder.filter(filter -> filter
                            .terms(t -> t
                                .field("brand.keyword")
                                .terms(TermsQueryField.of(tf -> tf.value(
                                    params.getBrands().stream()
                                        .map(FieldValue::of)
                                        .collect(Collectors.toList())
                                )))
                            )
                        );
                    }
                    
                    // 价格范围过滤
                    if (params.getMinPrice() != null || params.getMaxPrice() != null) {
                        boolBuilder.filter(filter -> filter
                            .range(r -> {
                                RangeQuery.Builder rangeBuilder = new RangeQuery.Builder()
                                    .field("price");
                                if (params.getMinPrice() != null) {
                                    rangeBuilder.gte(JsonData.of(params.getMinPrice()));
                                }
                                if (params.getMaxPrice() != null) {
                                    rangeBuilder.lte(JsonData.of(params.getMaxPrice()));
                                }
                                return rangeBuilder.build();
                            })
                        );
                    }
                    
                    // 评分过滤
                    if (params.getMinRating() != null) {
                        boolBuilder.filter(filter -> filter
                            .range(r -> r
                                .field("rating")
                                .gte(JsonData.of(params.getMinRating()))
                            )
                        );
                    }
                    
                    // 库存过滤
                    boolBuilder.filter(filter -> filter
                        .range(r -> r
                            .field("stock")
                            .gt(JsonData.of(0))
                        )
                    );
                    
                    return boolBuilder.build();
                })
            )
            .sort(so -> {
                // 排序逻辑
                switch (params.getSortBy()) {
                    case "price_asc":
                        return so.field(f -> f.field("price").order(SortOrder.Asc));
                    case "price_desc":
                        return so.field(f -> f.field("price").order(SortOrder.Desc));
                    case "rating":
                        return so.field(f -> f.field("rating").order(SortOrder.Desc));
                    case "newest":
                        return so.field(f -> f.field("createTime").order(SortOrder.Desc));
                    default:
                        return so.score(sc -> sc.order(SortOrder.Desc));
                }
            })
            .from(params.getFrom())
            .size(params.getSize())
            .highlight(h -> h
                .fields("name", hf -> hf
                    .preTags("<mark>")
                    .postTags("</mark>")
                )
                .fields("description", hf -> hf
                    .preTags("<mark>")
                    .postTags("</mark>")
                    .fragmentSize(100)
                    .numberOfFragments(2)
                )
            )
        );
        
        SearchResponse<Product> response = client.search(request, Product.class);
        
        // 构建搜索结果
        List<SearchResultItem> items = new ArrayList<>();
        for (Hit<Product> hit : response.hits().hits()) {
            SearchResultItem item = new SearchResultItem();
            item.setDocument(hit.source());
            item.setScore(hit.score());
            
            if (hit.highlight() != null) {
                Map<String, List<String>> highlights = new HashMap<>();
                hit.highlight().forEach((field, fragments) -> {
                    highlights.put(field, fragments);
                });
                item.setHighlights(highlights);
            }
            
            items.add(item);
        }
        
        return new SearchResult(
            items,
            response.hits().total().value(),
            params.getFrom() / params.getSize(),
            params.getSize()
        );
    }
    
    /**
     * 获取搜索建议（自动完成）
     */
    public List<String> getSuggestions(String prefix) throws IOException {
        SearchRequest request = SearchRequest.of(s -> s
            .index(PRODUCT_INDEX)
            .suggest(suggest -> suggest
                .suggesters("product_suggest", suggester -> suggester
                    .prefix(prefix)
                    .completion(c -> c
                        .field("name.suggest")
                        .size(10)
                    )
                )
            )
        );
        
        SearchResponse<Product> response = client.search(request, Product.class);
        
        List<String> suggestions = new ArrayList<>();
        if (response.suggest() != null) {
            CompletionSuggest completionSuggest = response.suggest()
                    .get("product_suggest")
                    .get(0)
                    .completion();
            
            for (CompletionSuggestOption option : completionSuggest.options()) {
                suggestions.add(option.text());
            }
        }
        
        return suggestions;
    }
}
```

# 五、总结与下一步

## （一）本文总结

通过本文的学习，您已经掌握了：

1. **复杂查询**：布尔查询、全文搜索、范围查询、模糊查询等高级查询技术
2. **聚合分析**：桶聚合、指标聚合、嵌套聚合等数据分析方法
3. **性能优化**：查询优化、索引优化、批量操作优化等基础优化技术
4. **实战应用**：电商搜索系统的完整实现

## （二）学习建议

**进阶阶段重点：**
- 熟练掌握各种复杂查询的组合使用
- 理解聚合分析的原理和应用场景
- 掌握基础的性能优化技巧
- 能够设计和实现完整的搜索功能

**实践建议：**
- 构建完整的搜索应用项目
- 尝试不同的查询组合和聚合分析
- 测试和优化查询性能
- 学习使用Elasticsearch的监控工具

## （三）下一步学习

完成进阶学习后，建议继续学习：

🔴 **高级教程**：
- 集群架构设计与管理
- 深度性能调优和监控
- 企业级安全配置
- 大规模数据处理方案

## （四）参考资料

- [Elasticsearch Query DSL文档](https://www.elastic.co/guide/en/elasticsearch/reference/8.12/query-dsl.html)
- [Elasticsearch Aggregations文档](https://www.elastic.co/guide/en/elasticsearch/reference/8.12/search-aggregations.html)
- [Elasticsearch性能调优指南](https://www.elastic.co/guide/en/elasticsearch/reference/8.12/tune-for-search-speed.html)

---

> **系列文章导航**
> - 🟢 [入门级：基础概念与环境搭建](./【大数据】Elasticsearch%208.x%20入门指南：基础概念与环境搭建.md)
> - 🟡 **进阶级**：复杂查询与聚合分析（本文）
> - 🔴 [高级：集群管理与企业级应用](./【大数据】Elasticsearch%208.x%20高级指南：集群管理与企业级应用.md)