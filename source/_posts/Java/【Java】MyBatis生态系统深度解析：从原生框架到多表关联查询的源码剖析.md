---
title: 【Java】MyBatis生态系统深度解析：从原生框架到多表关联查询的源码剖析
categories: Java
date: 2025-08-12
tags:
  - MyBatis
  - MyBatis Plus
  - MyBatis Plus Join
  - 源码分析
  - ORM框架
  - 架构设计
---

# 前言

在Java持久层技术体系中，MyBatis生态系统经历了从原生MyBatis到MyBatis Plus，再到MyBatis Plus Join的演进历程。每一次演进都解决了特定的痛点，提升了开发效率。本文将深入分析这三个框架的核心架构、源码实现原理，以及它们在多表关联查询方面的技术创新。

> **系列文章导航**
> 
> {% btn 'https://example.com/mybatis-basic','MyBatis基础教程',far fa-hand-point-right,blue larger %}
> {% btn 'https://example.com/mybatis-plus-guide','MyBatis Plus实战指南',far fa-hand-point-right,green larger %}

# 一、MyBatis生态系统架构演进

## （一）MyBatis原生框架架构

MyBatis作为一款优秀的持久层框架，采用了半自动化的ORM设计理念，其核心架构包含以下几个关键组件：

### 核心组件架构图

```mermaid
graph TB
    A[SqlSessionFactory] --> B[SqlSession]
    B --> C[Executor]
    C --> D[StatementHandler]
    C --> E[ParameterHandler]
    C --> F[ResultSetHandler]
    D --> G[PreparedStatement]
    H[Configuration] --> A
    I[MapperRegistry] --> H
    J[MappedStatement] --> H
```

### 关键组件源码分析

```java
// SqlSessionFactory：会话工厂，MyBatis的核心入口
public interface SqlSessionFactory {
    // 创建SqlSession的核心方法，支持多种重载形式
    SqlSession openSession();
    SqlSession openSession(boolean autoCommit);
    SqlSession openSession(Connection connection);
    SqlSession openSession(TransactionIsolationLevel level);
}

// DefaultSqlSessionFactory：SqlSessionFactory的默认实现
public class DefaultSqlSessionFactory implements SqlSessionFactory {
    private final Configuration configuration;
    
    public DefaultSqlSessionFactory(Configuration configuration) {
        this.configuration = configuration;
    }
    
    @Override
    public SqlSession openSession() {
        // 从配置中获取默认的执行器类型和事务隔离级别
        return openSessionFromDataSource(configuration.getDefaultExecutorType(), null, false);
    }
    
    private SqlSession openSessionFromDataSource(ExecutorType execType, 
                                               TransactionIsolationLevel level, 
                                               boolean autoCommit) {
        Transaction tx = null;
        try {
            // 获取环境配置，包含数据源和事务管理器
            final Environment environment = configuration.getEnvironment();
            final TransactionFactory transactionFactory = getTransactionFactoryFromEnvironment(environment);
            
            // 创建事务对象
            tx = transactionFactory.newTransaction(environment.getDataSource(), level, autoCommit);
            
            // 创建执行器，这是MyBatis执行SQL的核心组件
            final Executor executor = configuration.newExecutor(tx, execType);
            
            // 返回DefaultSqlSession实例
            return new DefaultSqlSession(configuration, executor, autoCommit);
        } catch (Exception e) {
            closeTransaction(tx);
            throw ExceptionFactory.wrapException("Error opening session.  Cause: " + e, e);
        } finally {
            ErrorContext.instance().reset();
        }
    }
}
```

### Executor执行器架构

```java
// Executor：SQL执行器接口，定义了所有数据库操作的抽象方法
public interface Executor {
    ResultHandler NO_RESULT_HANDLER = null;
    
    // 更新操作（包括INSERT、UPDATE、DELETE）
    int update(MappedStatement ms, Object parameter) throws SQLException;
    
    // 查询操作，支持结果处理器和分页
    <E> List<E> query(MappedStatement ms, Object parameter, RowBounds rowBounds, 
                      ResultHandler resultHandler, CacheKey cacheKey, BoundSql boundSql) 
                      throws SQLException;
    
    // 查询单个结果
    <E> Cursor<E> queryCursor(MappedStatement ms, Object parameter, RowBounds rowBounds) 
                              throws SQLException;
    
    // 批量执行
    List<BatchResult> flushStatements() throws SQLException;
    
    // 事务提交和回滚
    void commit(boolean required) throws SQLException;
    void rollback(boolean required) throws SQLException;
    
    // 缓存相关操作
    CacheKey createCacheKey(MappedStatement ms, Object parameterObject, 
                           RowBounds rowBounds, BoundSql boundSql);
    boolean isCached(MappedStatement ms, CacheKey key);
    void clearLocalCache();
}

// BaseExecutor：执行器的抽象基类，实现了通用逻辑
public abstract class BaseExecutor implements Executor {
    private static final Log log = LogFactory.getLog(BaseExecutor.class);
    
    protected Transaction transaction;
    protected Executor wrapper;
    
    // 延迟加载队列
    protected ConcurrentLinkedQueue<DeferredLoad> deferredLoads;
    // 本地缓存，实现一级缓存功能
    protected PerpetualCache localCache;
    // 本地输出参数缓存
    protected PerpetualCache localOutputParameterCache;
    protected Configuration configuration;
    
    // 查询计数器，用于嵌套查询检测
    protected int queryStack;
    private boolean closed;
    
    protected BaseExecutor(Configuration configuration, Transaction transaction) {
        this.transaction = transaction;
        this.deferredLoads = new ConcurrentLinkedQueue<>();
        this.localCache = new PerpetualCache("LocalCache");
        this.localOutputParameterCache = new PerpetualCache("LocalOutputParameterCache");
        this.closed = false;
        this.configuration = configuration;
        this.wrapper = this;
    }
    
    @Override
    public <E> List<E> query(MappedStatement ms, Object parameter, RowBounds rowBounds, 
                            ResultHandler resultHandler, CacheKey key, BoundSql boundSql) 
                            throws SQLException {
        ErrorContext.instance().resource(ms.getResource()).activity("executing a query").object(ms.getId());
        
        if (closed) {
            throw new ExecutorException("Executor was closed.");
        }
        
        // 如果是嵌套查询的第一层，清除本地缓存
        if (queryStack == 0 && ms.isFlushCacheRequired()) {
            clearLocalCache();
        }
        
        List<E> list;
        try {
            queryStack++;
            // 先从一级缓存中获取结果
            list = resultHandler == null ? (List<E>) localCache.getObject(key) : null;
            if (list != null) {
                // 处理存储过程的输出参数
                handleLocallyCachedOutputParameters(ms, key, parameter, boundSql);
            } else {
                // 缓存未命中，从数据库查询
                list = queryFromDatabase(ms, parameter, rowBounds, resultHandler, key, boundSql);
            }
        } finally {
            queryStack--;
        }
        
        // 处理延迟加载
        if (queryStack == 0) {
            for (DeferredLoad deferredLoad : deferredLoads) {
                deferredLoad.load();
            }
            deferredLoads.clear();
            
            // 如果本地缓存作用域是STATEMENT，清除缓存
            if (configuration.getLocalCacheScope() == LocalCacheScope.STATEMENT) {
                clearLocalCache();
            }
        }
        return list;
    }
    
    // 从数据库查询数据的核心方法
    private <E> List<E> queryFromDatabase(MappedStatement ms, Object parameter, 
                                         RowBounds rowBounds, ResultHandler resultHandler, 
                                         CacheKey key, BoundSql boundSql) throws SQLException {
        List<E> list;
        // 先在缓存中放入占位符，防止循环引用
        localCache.putObject(key, EXECUTION_PLACEHOLDER);
        try {
            // 调用子类实现的具体查询方法
            list = doQuery(ms, parameter, rowBounds, resultHandler, boundSql);
        } finally {
            // 移除占位符
            localCache.removeObject(key);
        }
        // 将查询结果放入一级缓存
        localCache.putObject(key, list);
        
        // 如果是存储过程，缓存输出参数
        if (ms.getStatementType() == StatementType.CALLABLE) {
            localOutputParameterCache.putObject(key, parameter);
        }
        return list;
    }
    
    // 抽象方法，由子类实现具体的查询逻辑
    protected abstract <E> List<E> doQuery(MappedStatement ms, Object parameter, 
                                          RowBounds rowBounds, ResultHandler resultHandler, 
                                          BoundSql boundSql) throws SQLException;
}
```

## （二）MyBatis Plus架构增强

MyBatis Plus在MyBatis基础上进行了大量增强，其核心设计理念是"只做增强不做改变"。

### 核心架构组件

```java
// BaseMapper：MyBatis Plus的核心接口，提供了丰富的CRUD方法
public interface BaseMapper<T> extends Mapper<T> {
    
    // 插入一条记录
    int insert(T entity);
    
    // 根据ID删除
    int deleteById(Serializable id);
    
    // 根据实体条件删除
    int delete(@Param(Constants.WRAPPER) Wrapper<T> queryWrapper);
    
    // 删除（根据ID批量删除）
    int deleteBatchIds(@Param(Constants.COLLECTION) Collection<? extends Serializable> idList);
    
    // 根据ID修改
    int updateById(@Param(Constants.ENTITY) T entity);
    
    // 根据whereEntity条件，更新记录
    int update(@Param(Constants.ENTITY) T entity, @Param(Constants.WRAPPER) Wrapper<T> updateWrapper);
    
    // 根据ID查询
    T selectById(Serializable id);
    
    // 查询（根据ID批量查询）
    List<T> selectBatchIds(@Param(Constants.COLLECTION) Collection<? extends Serializable> idList);
    
    // 根据entity条件，查询一条记录
    T selectOne(@Param(Constants.WRAPPER) Wrapper<T> queryWrapper);
    
    // 根据Wrapper条件，查询总记录数
    Long selectCount(@Param(Constants.WRAPPER) Wrapper<T> queryWrapper);
    
    // 根据entity条件，查询全部记录
    List<T> selectList(@Param(Constants.WRAPPER) Wrapper<T> queryWrapper);
    
    // 根据Wrapper条件，查询全部记录
    List<Map<String, Object>> selectMaps(@Param(Constants.WRAPPER) Wrapper<T> queryWrapper);
    
    // 根据Wrapper条件，查询全部记录（返回Object列表）
    List<Object> selectObjs(@Param(Constants.WRAPPER) Wrapper<T> queryWrapper);
    
    // 根据entity条件，查询全部记录（并翻页）
    IPage<T> selectPage(IPage<T> page, @Param(Constants.WRAPPER) Wrapper<T> queryWrapper);
    
    // 根据Wrapper条件，查询全部记录（并翻页）
    IPage<Map<String, Object>> selectMapsPage(IPage<T> page, @Param(Constants.WRAPPER) Wrapper<T> queryWrapper);
}
```

### 条件构造器核心实现

```java
// AbstractWrapper：条件构造器的抽象基类
public abstract class AbstractWrapper<T, R, Children extends AbstractWrapper<T, R, Children>>
        implements ISqlSegment, Wrapper<T>, Serializable {
    
    private static final long serialVersionUID = 1L;
    
    // 实体类型
    protected T entity;
    // 实体类的Class对象
    protected Class<T> entityClass;
    // SQL片段表达式
    protected MergeSegments expression;
    // 参数序号
    protected AtomicInteger paramNameSeq;
    // 参数名值对
    protected Map<String, Object> paramNameValuePairs;
    // 最后的SQL片段
    protected SharedString lastSql;
    // SQL注释
    protected SharedString sqlComment;
    // SQL起始位置
    protected SharedString sqlFirst;
    
    @Override
    public T getEntity() {
        return entity;
    }
    
    public Children setEntity(T entity) {
        this.entity = entity;
        return typedThis;
    }
    
    public Class<T> getEntityClass() {
        if (entityClass == null && entity != null) {
            entityClass = (Class<T>) entity.getClass();
        }
        return entityClass;
    }
    
    public Children setEntityClass(Class<T> entityClass) {
        if (entityClass != null) {
            this.entityClass = entityClass;
        }
        return typedThis;
    }
    
    // 获取格式化后的SQL语句
    @Override
    public String getSqlSegment() {
        return expression.getSqlSegment() + lastSql.getStringValue();
    }
    
    // 获取SQL注释
    @Override
    public String getSqlComment() {
        if (StringUtils.isNotBlank(sqlComment.getStringValue())) {
            return "/*" + StringUtils.trim(sqlComment.getStringValue()) + "*/";
        }
        return null;
    }
    
    // 获取SQL起始片段
    @Override
    public String getSqlFirst() {
        if (StringUtils.isNotBlank(sqlFirst.getStringValue())) {
            return StringUtils.trim(sqlFirst.getStringValue());
        }
        return null;
    }
}

// QueryWrapper：查询条件构造器的具体实现
public class QueryWrapper<T> extends AbstractWrapper<T, String, QueryWrapper<T>>
        implements Query<QueryWrapper<T>, T, String> {
    
    // 查询字段
    private SharedString sqlSelect = new SharedString();
    
    public QueryWrapper() {
        this((T) null);
    }
    
    public QueryWrapper(T entity) {
        super.setEntity(entity);
        super.initNeed();
    }
    
    public QueryWrapper(Class<T> entityClass) {
        super.setEntityClass(entityClass);
        super.initNeed();
    }
    
    // 设置查询字段
    @Override
    public QueryWrapper<T> select(String... columns) {
        if (ArrayUtils.isNotEmpty(columns)) {
            this.sqlSelect.setStringValue(String.join(StringPool.COMMA, columns));
        }
        return typedThis;
    }
    
    // 设置查询字段（排除某些字段）
    @Override
    public QueryWrapper<T> select(Class<T> entityClass, Predicate<TableFieldInfo> predicate) {
        if (entityClass == null) {
            entityClass = getEntityClass();
        } else {
            setEntityClass(entityClass);
        }
        Assert.notNull(entityClass, "entityClass can not be null");
        this.sqlSelect.setStringValue(TableInfoHelper.getTableInfo(entityClass).chooseSelect(predicate));
        return typedThis;
    }
    
    @Override
    public String getSqlSelect() {
        return sqlSelect.getStringValue();
    }
    
    // 创建实例的静态方法
    public static <T> QueryWrapper<T> create() {
        return new QueryWrapper<>();
    }
    
    @Override
    protected QueryWrapper<T> instance() {
        return new QueryWrapper<>(getEntity(), getEntityClass(), paramNameSeq, paramNameValuePairs,
                new MergeSegments(), SharedString.emptyString(), SharedString.emptyString(), SharedString.emptyString());
    }
    
    @Override
    public void clear() {
        super.clear();
        sqlSelect.toEmpty();
    }
}
```

### IService服务层接口

```java
// IService：MyBatis Plus提供的服务层基础接口
public interface IService<T> {

    // 默认批次提交数量
    int DEFAULT_BATCH_SIZE = 1000;

    // 插入一条记录（选择字段，策略插入）
    default boolean save(T entity) {
        return SqlHelper.retBool(getBaseMapper().insert(entity));
    }

    // 插入（批量）
    default boolean saveBatch(Collection<T> entityList) {
        return saveBatch(entityList, DEFAULT_BATCH_SIZE);
    }

    // 插入（批量）
    boolean saveBatch(Collection<T> entityList, int batchSize);

    // TableId 注解存在更新记录，否插入一条记录
    boolean saveOrUpdate(T entity);

    // 根据updateWrapper尝试更新，否继续执行saveOrUpdate(T)方法
    boolean saveOrUpdate(T entity, Wrapper<T> updateWrapper);

    // 批量修改插入
    boolean saveOrUpdateBatch(Collection<T> entityList);

    // 批量修改插入
    boolean saveOrUpdateBatch(Collection<T> entityList, int batchSize);

    // 根据 entity 条件，删除记录
    default boolean remove(Wrapper<T> queryWrapper) {
        return SqlHelper.retBool(getBaseMapper().delete(queryWrapper));
    }

    // 根据 ID 删除
    default boolean removeById(Serializable id) {
        return SqlHelper.retBool(getBaseMapper().deleteById(id));
    }

    // 根据 columnMap 条件，删除记录
    default boolean removeByMap(Map<String, Object> columnMap) {
        Assert.notEmpty(columnMap, "error: columnMap must not be empty");
        return SqlHelper.retBool(getBaseMapper().deleteByMap(columnMap));
    }

    // 删除（根据ID 批量删除）
    default boolean removeByIds(Collection<? extends Serializable> idList) {
        if (CollectionUtils.isEmpty(idList)) {
            return false;
        }
        return SqlHelper.retBool(getBaseMapper().deleteBatchIds(idList));
    }

    // 根据 UpdateWrapper 条件，更新记录 需要设置sqlset
    default boolean update(Wrapper<T> updateWrapper) {
        return update(null, updateWrapper);
    }

    // 根据 whereWrapper 条件，更新记录
    default boolean update(T updateEntity, Wrapper<T> whereWrapper) {
        return SqlHelper.retBool(getBaseMapper().update(updateEntity, whereWrapper));
    }

    // 根据 ID 选择修改
    default boolean updateById(T entity) {
        return SqlHelper.retBool(getBaseMapper().updateById(entity));
    }

    // 根据ID 批量更新
    boolean updateBatchById(Collection<T> entityList);

    // 根据ID 批量更新
    boolean updateBatchById(Collection<T> entityList, int batchSize);

    // 根据 ID 查询
    default T getById(Serializable id) {
        return getBaseMapper().selectById(id);
    }

    // 根据 Wrapper，查询一条记录。结果集，如果是多个会抛出异常，随机取一条加上限制条件 wrapper.last("LIMIT 1")
    default T getOne(Wrapper<T> queryWrapper) {
        return getOne(queryWrapper, true);
    }

    // 根据 Wrapper，查询一条记录
    T getOne(Wrapper<T> queryWrapper, boolean throwEx);

    // 根据 Wrapper，查询一条记录
    Map<String, Object> getMap(Wrapper<T> queryWrapper);

    // 根据 Wrapper，查询一条记录
    <V> V getObj(Wrapper<T> queryWrapper, Function<? super Object, V> mapper);

    // 查询所有
    default List<T> list() {
        return list(Wrappers.emptyWrapper());
    }

    // 查询列表
    default List<T> list(Wrapper<T> queryWrapper) {
        return getBaseMapper().selectList(queryWrapper);
    }

    // 查询（根据ID 批量查询）
    default List<T> listByIds(Collection<? extends Serializable> idList) {
        return getBaseMapper().selectBatchIds(idList);
    }

    // 查询（根据 columnMap 条件）
    default List<T> listByMap(Map<String, Object> columnMap) {
        return getBaseMapper().selectByMap(columnMap);
    }

    // 查询所有列表
    default List<Map<String, Object>> listMaps() {
        return listMaps(Wrappers.emptyWrapper());
    }

    // 查询列表
    default List<Map<String, Object>> listMaps(Wrapper<T> queryWrapper) {
        return getBaseMapper().selectMaps(queryWrapper);
    }

    // 查询全部记录
    default List<Object> listObjs() {
        return listObjs(Function.identity());
    }

    // 查询全部记录
    default <V> List<V> listObjs(Function<? super Object, V> mapper) {
        return listObjs(Wrappers.emptyWrapper(), mapper);
    }

    // 根据 Wrapper 条件，查询全部记录
    default List<Object> listObjs(Wrapper<T> queryWrapper) {
        return listObjs(queryWrapper, Function.identity());
    }

    // 根据 Wrapper 条件，查询全部记录
    default <V> List<V> listObjs(Wrapper<T> queryWrapper, Function<? super Object, V> mapper) {
        return getBaseMapper().selectObjs(queryWrapper).stream().filter(Objects::nonNull).map(mapper).collect(Collectors.toList());
    }

    // 无条件分页查询
    default IPage<T> page(IPage<T> page) {
        return page(page, Wrappers.emptyWrapper());
    }

    // 条件分页查询
    default IPage<T> page(IPage<T> page, Wrapper<T> queryWrapper) {
        return getBaseMapper().selectPage(page, queryWrapper);
    }

    // 无条件分页查询
    default IPage<Map<String, Object>> pageMaps(IPage<T> page) {
        return pageMaps(page, Wrappers.emptyWrapper());
    }

    // 条件分页查询
    default IPage<Map<String, Object>> pageMaps(IPage<T> page, Wrapper<T> queryWrapper) {
        return getBaseMapper().selectMapsPage(page, queryWrapper);
    }

    // 查询总记录数
    default long count() {
        return count(Wrappers.emptyWrapper());
    }

    // 根据 Wrapper 条件，查询总记录数
    default long count(Wrapper<T> queryWrapper) {
        return SqlHelper.retCount(getBaseMapper().selectCount(queryWrapper));
    }

    // 获取对应 entity 的 BaseMapper
    BaseMapper<T> getBaseMapper();

    // 获取 entity 的 class
    Class<T> getEntityClass();

    // 链式查询 普通
    default QueryChainWrapper<T> query() {
        return ChainWrappers.queryChain(getBaseMapper());
    }

    // 链式查询 lambda 式
    default LambdaQueryChainWrapper<T> lambdaQuery() {
        return ChainWrappers.lambdaQueryChain(getBaseMapper());
    }

    // 链式更改 普通
    default UpdateChainWrapper<T> update() {
        return ChainWrappers.updateChain(getBaseMapper());
    }

    // 链式更改 lambda 式
    default LambdaUpdateChainWrapper<T> lambdaUpdate() {
        return ChainWrappers.lambdaUpdateChain(getBaseMapper());
    }
}
```

## （三）MyBatis Plus Join多表查询架构

MyBatis Plus Join是基于MyBatis Plus的多表查询增强框架，专门解决复杂的关联查询问题。

### 核心架构设计

```java
// MPJBaseMapper：多表查询的基础Mapper接口
public interface MPJBaseMapper<T> extends BaseMapper<T> {

    // 根据 Wrapper 条件，查询全部记录
    List<T> selectJoinList(Class<T> clazz, MPJWrapper<T> wrapper);

    // 根据 Wrapper 条件，查询全部记录
    <DTO> List<DTO> selectJoinList(Class<DTO> clazz, MPJWrapper<?> wrapper);

    // 根据 Wrapper 条件，查询全部记录（并翻页）
    IPage<T> selectJoinPage(IPage<T> page, Class<T> clazz, MPJWrapper<T> wrapper);

    // 根据 Wrapper 条件，查询全部记录（并翻页）
    <DTO> IPage<DTO> selectJoinPage(IPage<DTO> page, Class<DTO> clazz, MPJWrapper<?> wrapper);

    // 根据 Wrapper 条件，查询总记录数
    Long selectJoinCount(MPJWrapper<?> wrapper);

    // 根据 Wrapper 条件，查询一条记录
    <DTO> DTO selectJoinOne(Class<DTO> clazz, MPJWrapper<?> wrapper);

    // 根据 Wrapper 条件，查询全部记录
    List<Map<String, Object>> selectJoinMaps(MPJWrapper<?> wrapper);

    // 根据 Wrapper 条件，查询全部记录（并翻页）
    IPage<Map<String, Object>> selectJoinMapsPage(IPage<?> page, MPJWrapper<?> wrapper);
}

// MPJLambdaWrapper：Lambda风格的多表查询条件构造器
public class MPJLambdaWrapper<T> extends MPJAbstractLambdaWrapper<T, MPJLambdaWrapper<T>>
        implements Query<MPJLambdaWrapper<T>, T, SFunction<T, ?>>, Join<MPJLambdaWrapper<T>> {

    // 查询字段 SQL 片段
    private SharedString sqlSelect = new SharedString();

    public MPJLambdaWrapper() {
        this((T) null);
    }

    public MPJLambdaWrapper(T entity) {
        super.setEntity(entity);
        super.initNeed();
    }

    public MPJLambdaWrapper(Class<T> entityClass) {
        super.setEntityClass(entityClass);
        super.initNeed();
    }

    // 查询指定字段
    @Override
    public MPJLambdaWrapper<T> select(SFunction<T, ?>... columns) {
        if (ArrayUtils.isNotEmpty(columns)) {
            this.sqlSelect.setStringValue(columnsToString(false, columns));
        }
        return typedThis;
    }

    // 查询指定字段（支持别名）
    public <X> MPJLambdaWrapper<T> select(SFunction<X, ?> column, String alias) {
        return select(columnToString(column) + " AS " + alias);
    }

    // 查询指定字段（支持聚合函数）
    public <X> MPJLambdaWrapper<T> selectSum(SFunction<X, ?> column) {
        return selectFunc("SUM(%s)", column);
    }

    public <X> MPJLambdaWrapper<T> selectCount(SFunction<X, ?> column) {
        return selectFunc("COUNT(%s)", column);
    }

    public <X> MPJLambdaWrapper<T> selectMax(SFunction<X, ?> column) {
        return selectFunc("MAX(%s)", column);
    }

    public <X> MPJLambdaWrapper<T> selectMin(SFunction<X, ?> column) {
        return selectFunc("MIN(%s)", column);
    }

    public <X> MPJLambdaWrapper<T> selectAvg(SFunction<X, ?> column) {
        return selectFunc("AVG(%s)", column);
    }

    // 聚合函数的通用实现
    private <X> MPJLambdaWrapper<T> selectFunc(String funcTemplate, SFunction<X, ?> column) {
        return select(String.format(funcTemplate, columnToString(column)));
    }

    // LEFT JOIN 连接
    @Override
    public <E> MPJLambdaWrapper<T> leftJoin(Class<E> joinClass, SFunction<E, ?> joinField, SFunction<T, ?> mainField) {
        return join(SqlKeyword.LEFT_JOIN, joinClass, joinField, mainField);
    }

    // RIGHT JOIN 连接
    @Override
    public <E> MPJLambdaWrapper<T> rightJoin(Class<E> joinClass, SFunction<E, ?> joinField, SFunction<T, ?> mainField) {
        return join(SqlKeyword.RIGHT_JOIN, joinClass, joinField, mainField);
    }

    // INNER JOIN 连接
    @Override
    public <E> MPJLambdaWrapper<T> innerJoin(Class<E> joinClass, SFunction<E, ?> joinField, SFunction<T, ?> mainField) {
        return join(SqlKeyword.INNER_JOIN, joinClass, joinField, mainField);
    }

    // JOIN 连接的通用实现
    private <E> MPJLambdaWrapper<T> join(SqlKeyword sqlKeyword, Class<E> joinClass,
                                        SFunction<E, ?> joinField, SFunction<T, ?> mainField) {
        final String joinTableName = getTableName(joinClass);
        final String joinColumnName = columnToString(joinField);
        final String mainColumnName = columnToString(mainField);

        final String joinSql = String.format(" %s %s ON %s = %s",
                                           sqlKeyword.getSqlSegment(),
                                           joinTableName,
                                           joinColumnName,
                                           mainColumnName);

        return doIt(true, () -> appendSqlSegments(JOIN, () -> joinSql));
    }

    // 支持复杂的JOIN条件
    public <E> MPJLambdaWrapper<T> leftJoin(Class<E> joinClass, Consumer<MPJLambdaWrapper<T>> consumer) {
        return join(SqlKeyword.LEFT_JOIN, joinClass, consumer);
    }

    public <E> MPJLambdaWrapper<T> rightJoin(Class<E> joinClass, Consumer<MPJLambdaWrapper<T>> consumer) {
        return join(SqlKeyword.RIGHT_JOIN, joinClass, consumer);
    }

    public <E> MPJLambdaWrapper<T> innerJoin(Class<E> joinClass, Consumer<MPJLambdaWrapper<T>> consumer) {
        return join(SqlKeyword.INNER_JOIN, joinClass, consumer);
    }

    // 复杂JOIN条件的通用实现
    private <E> MPJLambdaWrapper<T> join(SqlKeyword sqlKeyword, Class<E> joinClass,
                                        Consumer<MPJLambdaWrapper<T>> consumer) {
        final String joinTableName = getTableName(joinClass);
        final MPJLambdaWrapper<T> wrapper = new MPJLambdaWrapper<>();
        consumer.accept(wrapper);
        final String joinCondition = wrapper.getCustomSqlSegment();

        final String joinSql = String.format(" %s %s ON %s",
                                           sqlKeyword.getSqlSegment(),
                                           joinTableName,
                                           joinCondition);

        return doIt(true, () -> appendSqlSegments(JOIN, () -> joinSql));
    }

    @Override
    public String getSqlSelect() {
        return sqlSelect.getStringValue();
    }

    @Override
    protected MPJLambdaWrapper<T> instance() {
        return new MPJLambdaWrapper<>(getEntity(), getEntityClass(), paramNameSeq, paramNameValuePairs,
                new MergeSegments(), SharedString.emptyString(), SharedString.emptyString(), SharedString.emptyString());
    }

    @Override
    public void clear() {
        super.clear();
        sqlSelect.toEmpty();
    }
}
```

# 二、核心源码实现原理

## （一）SQL解析与构建机制

### MappedStatement构建过程

MyBatis中的每个SQL语句都会被封装成一个MappedStatement对象，这是SQL执行的核心数据结构。

```java
// MappedStatement：MyBatis中SQL语句的封装对象
public final class MappedStatement {

    private String resource;           // 资源文件路径
    private Configuration configuration; // 全局配置对象
    private String id;                 // 语句ID，通常是接口方法的全限定名
    private Integer fetchSize;         // 获取记录数
    private Integer timeout;           // 超时时间
    private StatementType statementType; // 语句类型：STATEMENT、PREPARED、CALLABLE
    private ResultSetType resultSetType; // 结果集类型
    private SqlSource sqlSource;       // SQL源码对象
    private Cache cache;               // 二级缓存
    private ParameterMap parameterMap; // 参数映射
    private List<ResultMap> resultMaps; // 结果映射列表
    private boolean flushCacheRequired; // 是否刷新缓存
    private boolean useCache;          // 是否使用缓存
    private boolean resultOrdered;     // 结果是否排序
    private SqlCommandType sqlCommandType; // SQL命令类型：SELECT、INSERT、UPDATE、DELETE
    private KeyGenerator keyGenerator; // 主键生成器
    private String[] keyProperties;    // 主键属性
    private String[] keyColumns;       // 主键列
    private boolean hasNestedResultMaps; // 是否有嵌套结果映射
    private String databaseId;         // 数据库ID
    private Log statementLog;          // 日志对象
    private LanguageDriver lang;       // 语言驱动器
    private String[] resultSets;       // 结果集名称

    // 私有构造函数，通过Builder模式创建
    MappedStatement() {
        // intentionally empty
    }

    // Builder模式构建MappedStatement
    public static class Builder {
        private MappedStatement mappedStatement = new MappedStatement();

        public Builder(Configuration configuration, String id, SqlSource sqlSource, SqlCommandType sqlCommandType) {
            mappedStatement.configuration = configuration;
            mappedStatement.id = id;
            mappedStatement.sqlSource = sqlSource;
            mappedStatement.statementType = StatementType.PREPARED;
            mappedStatement.resultSetType = ResultSetType.DEFAULT;
            mappedStatement.parameterMap = new ParameterMap.Builder(configuration, "defaultParameterMap", null, new ArrayList<>()).build();
            mappedStatement.resultMaps = new ArrayList<>();
            mappedStatement.sqlCommandType = sqlCommandType;
            mappedStatement.keyGenerator = configuration.isUseGeneratedKeys() && SqlCommandType.INSERT.equals(sqlCommandType) ? Jdbc3KeyGenerator.INSTANCE : NoKeyGenerator.INSTANCE;
            String logId = id;
            if (configuration.getLogPrefix() != null) {
                logId = configuration.getLogPrefix() + id;
            }
            mappedStatement.statementLog = LogFactory.getLog(logId);
            mappedStatement.lang = configuration.getDefaultScriptingLanguageInstance();
        }

        public Builder resource(String resource) {
            mappedStatement.resource = resource;
            return this;
        }

        public Builder fetchSize(Integer fetchSize) {
            mappedStatement.fetchSize = fetchSize;
            return this;
        }

        public Builder timeout(Integer timeout) {
            mappedStatement.timeout = timeout;
            return this;
        }

        public Builder statementType(StatementType statementType) {
            mappedStatement.statementType = statementType;
            return this;
        }

        public Builder resultSetType(ResultSetType resultSetType) {
            mappedStatement.resultSetType = resultSetType;
            return this;
        }

        public Builder cache(Cache cache) {
            mappedStatement.cache = cache;
            return this;
        }

        public Builder flushCacheRequired(boolean flushCacheRequired) {
            mappedStatement.flushCacheRequired = flushCacheRequired;
            return this;
        }

        public Builder useCache(boolean useCache) {
            mappedStatement.useCache = useCache;
            return this;
        }

        public Builder resultOrdered(boolean resultOrdered) {
            mappedStatement.resultOrdered = resultOrdered;
            return this;
        }

        public Builder keyGenerator(KeyGenerator keyGenerator) {
            mappedStatement.keyGenerator = keyGenerator;
            return this;
        }

        public Builder keyProperty(String keyProperty) {
            mappedStatement.keyProperties = delimitedStringToArray(keyProperty);
            return this;
        }

        public Builder keyColumn(String keyColumn) {
            mappedStatement.keyColumns = delimitedStringToArray(keyColumn);
            return this;
        }

        public Builder databaseId(String databaseId) {
            mappedStatement.databaseId = databaseId;
            return this;
        }

        public Builder lang(LanguageDriver driver) {
            mappedStatement.lang = driver;
            return this;
        }

        public Builder resultSets(String resultSet) {
            mappedStatement.resultSets = delimitedStringToArray(resultSet);
            return this;
        }

        // 构建MappedStatement对象
        public MappedStatement build() {
            assert mappedStatement.configuration != null;
            assert mappedStatement.id != null;
            assert mappedStatement.sqlSource != null;
            assert mappedStatement.lang != null;
            mappedStatement.resultMaps = Collections.unmodifiableList(mappedStatement.resultMaps);
            return mappedStatement;
        }
    }

    // 获取BoundSql对象，包含最终的SQL语句和参数
    public BoundSql getBoundSql(Object parameterObject) {
        BoundSql boundSql = sqlSource.getBoundSql(parameterObject);
        List<ParameterMapping> parameterMappings = boundSql.getParameterMappings();
        if (parameterMappings == null || parameterMappings.isEmpty()) {
            boundSql = new BoundSql(configuration, boundSql.getSql(), parameterMap.getParameterMappings(), parameterObject);
        }

        // 检查嵌套结果映射
        for (ParameterMapping pm : boundSql.getParameterMappings()) {
            String rmId = pm.getResultMapId();
            if (rmId != null) {
                ResultMap rm = configuration.getResultMap(rmId);
                if (rm != null) {
                    hasNestedResultMaps |= rm.hasNestedResultMaps();
                }
            }
        }

        return boundSql;
    }
}
```

### 动态SQL解析机制

```java
// SqlSource：SQL源码接口，负责根据参数对象生成BoundSql
public interface SqlSource {
    BoundSql getBoundSql(Object parameterObject);
}

// DynamicSqlSource：动态SQL源码实现，处理包含动态元素的SQL
public class DynamicSqlSource implements SqlSource {

    private final Configuration configuration;
    private final SqlNode rootSqlNode;

    public DynamicSqlSource(Configuration configuration, SqlNode rootSqlNode) {
        this.configuration = configuration;
        this.rootSqlNode = rootSqlNode;
    }

    @Override
    public BoundSql getBoundSql(Object parameterObject) {
        // 创建动态上下文，用于构建SQL
        DynamicContext context = new DynamicContext(configuration, parameterObject);

        // 应用SQL节点，生成SQL字符串
        rootSqlNode.apply(context);

        // 创建SQL源码解析器
        SqlSourceBuilder sqlSourceParser = new SqlSourceBuilder(configuration);
        Class<?> parameterType = parameterObject == null ? Object.class : parameterObject.getClass();

        // 解析SQL，处理#{}占位符
        SqlSource sqlSource = sqlSourceParser.parse(context.getSql(), parameterType, context.getBindings());

        // 获取最终的BoundSql对象
        BoundSql boundSql = sqlSource.getBoundSql(parameterObject);

        // 将动态上下文中的绑定参数添加到BoundSql中
        context.getBindings().forEach(boundSql::setAdditionalParameter);

        return boundSql;
    }
}

// DynamicContext：动态SQL构建上下文
public class DynamicContext {

    public static final String PARAMETER_OBJECT_KEY = "_parameter";
    public static final String DATABASE_ID_KEY = "_databaseId";

    static {
        // 注册OGNL方法访问器，支持在动态SQL中调用静态方法
        OgnlRuntime.setPropertyAccessor(ContextMap.class, new ContextAccessor());
    }

    private final ContextMap bindings;
    private final StringJoiner sqlBuilder = new StringJoiner(" ");
    private int uniqueNumber = 0;

    public DynamicContext(Configuration configuration, Object parameterObject) {
        // 初始化绑定参数映射
        if (parameterObject != null && !(parameterObject instanceof Map)) {
            // 如果参数对象不是Map，则通过反射获取其属性
            MetaObject metaObject = configuration.newMetaObject(parameterObject);
            boolean existsTypeHandler = configuration.getTypeHandlerRegistry().hasTypeHandler(parameterObject.getClass());
            bindings = new ContextMap(metaObject, existsTypeHandler);
        } else {
            bindings = new ContextMap(null, false);
        }

        // 添加内置参数
        bindings.put(PARAMETER_OBJECT_KEY, parameterObject);
        bindings.put(DATABASE_ID_KEY, configuration.getDatabaseId());
    }

    public Map<String, Object> getBindings() {
        return bindings;
    }

    public void bind(String name, Object value) {
        bindings.put(name, value);
    }

    public void appendSql(String sql) {
        sqlBuilder.add(sql);
    }

    public String getSql() {
        return sqlBuilder.toString().trim();
    }

    public int getUniqueNumber() {
        return uniqueNumber++;
    }

    // 上下文映射，支持OGNL表达式访问
    static class ContextMap extends HashMap<String, Object> {
        private static final long serialVersionUID = 2977601501966151582L;

        private final MetaObject parameterMetaObject;
        private final boolean fallbackParameterObject;

        public ContextMap(MetaObject parameterMetaObject, boolean fallbackParameterObject) {
            this.parameterMetaObject = parameterMetaObject;
            this.fallbackParameterObject = fallbackParameterObject;
        }

        @Override
        public Object get(Object key) {
            String strKey = (String) key;
            if (super.containsKey(strKey)) {
                return super.get(strKey);
            }

            if (parameterMetaObject == null) {
                return null;
            }

            if (fallbackParameterObject && !parameterMetaObject.hasGetter(strKey)) {
                return parameterMetaObject.getOriginalObject();
            } else {
                // issue #61 do not modify the context when reading
                return parameterMetaObject.getValue(strKey);
            }
        }
    }

    // 上下文访问器，用于OGNL表达式
    static class ContextAccessor implements PropertyAccessor {

        @Override
        public Object getProperty(Map context, Object target, Object name) {
            Map map = (Map) target;

            Object result = map.get(name);
            if (map.containsKey(name) || result != null) {
                return result;
            }

            Object parameterObject = map.get(PARAMETER_OBJECT_KEY);
            if (parameterObject != null) {
                try {
                    return OgnlRuntime.getProperty(context, parameterObject, name);
                } catch (OgnlException e) {
                    throw new RuntimeException("Error evaluating expression '" + name + "'. Cause: " + e, e);
                }
            }
            return null;
        }

        @Override
        public void setProperty(Map context, Object target, Object name, Object value) {
            Map<Object, Object> map = (Map<Object, Object>) target;
            map.put(name, value);
        }

        @Override
        public String getSourceAccessor(OgnlContext arg0, Object arg1, Object arg2) {
            return null;
        }

        @Override
        public String getSourceSetter(OgnlContext arg0, Object arg1, Object arg2) {
            return null;
        }
    }
}
```

## （二）MyBatis Plus条件构造器实现原理

### AbstractWrapper核心机制

```java
// AbstractWrapper：条件构造器的核心实现
public abstract class AbstractWrapper<T, R, Children extends AbstractWrapper<T, R, Children>>
        implements ISqlSegment, Wrapper<T>, Serializable {

    // SQL片段表达式容器
    protected MergeSegments expression;
    // 参数序号生成器
    protected AtomicInteger paramNameSeq;
    // 参数名值对映射
    protected Map<String, Object> paramNameValuePairs;

    // 初始化方法
    protected void initNeed() {
        paramNameSeq = new AtomicInteger(0);
        paramNameValuePairs = new HashMap<>(16);
        expression = new MergeSegments();
        lastSql = SharedString.emptyString();
        sqlComment = SharedString.emptyString();
        sqlFirst = SharedString.emptyString();
    }

    // 添加条件的核心方法
    protected Children addCondition(boolean condition, ISqlSegment... sqlSegments) {
        if (condition) {
            expression.add(sqlSegments);
        }
        return typedThis;
    }

    // 嵌套条件处理
    protected Children doIt(boolean condition, DoSomething something) {
        if (condition) {
            something.doIt();
        }
        return typedThis;
    }

    // 等于条件
    public Children eq(boolean condition, R column, Object val) {
        return addCondition(condition, columnToSqlSegment(column), EQ,
                           () -> formatParam(null, val));
    }

    // 不等于条件
    public Children ne(boolean condition, R column, Object val) {
        return addCondition(condition, columnToSqlSegment(column), NE,
                           () -> formatParam(null, val));
    }

    // 大于条件
    public Children gt(boolean condition, R column, Object val) {
        return addCondition(condition, columnToSqlSegment(column), GT,
                           () -> formatParam(null, val));
    }

    // 大于等于条件
    public Children ge(boolean condition, R column, Object val) {
        return addCondition(condition, columnToSqlSegment(column), GE,
                           () -> formatParam(null, val));
    }

    // 小于条件
    public Children lt(boolean condition, R column, Object val) {
        return addCondition(condition, columnToSqlSegment(column), LT,
                           () -> formatParam(null, val));
    }

    // 小于等于条件
    public Children le(boolean condition, R column, Object val) {
        return addCondition(condition, columnToSqlSegment(column), LE,
                           () -> formatParam(null, val));
    }

    // BETWEEN条件
    public Children between(boolean condition, R column, Object val1, Object val2) {
        return addCondition(condition, columnToSqlSegment(column), BETWEEN,
                           () -> formatParam(null, val1), AND,
                           () -> formatParam(null, val2));
    }

    // NOT BETWEEN条件
    public Children notBetween(boolean condition, R column, Object val1, Object val2) {
        return addCondition(condition, columnToSqlSegment(column), NOT_BETWEEN,
                           () -> formatParam(null, val1), AND,
                           () -> formatParam(null, val2));
    }

    // LIKE条件
    public Children like(boolean condition, R column, Object val) {
        return addCondition(condition, columnToSqlSegment(column), LIKE,
                           () -> formatParam(null, val));
    }

    // NOT LIKE条件
    public Children notLike(boolean condition, R column, Object val) {
        return addCondition(condition, columnToSqlSegment(column), NOT_LIKE,
                           () -> formatParam(null, val));
    }

    // LEFT LIKE条件（%value）
    public Children likeLeft(boolean condition, R column, Object val) {
        return addCondition(condition, columnToSqlSegment(column), LIKE,
                           () -> formatParam(null, SqlUtils.concatLike(val, SqlLike.LEFT)));
    }

    // RIGHT LIKE条件（value%）
    public Children likeRight(boolean condition, R column, Object val) {
        return addCondition(condition, columnToSqlSegment(column), LIKE,
                           () -> formatParam(null, SqlUtils.concatLike(val, SqlLike.RIGHT)));
    }

    // IS NULL条件
    public Children isNull(boolean condition, R column) {
        return addCondition(condition, columnToSqlSegment(column), IS_NULL);
    }

    // IS NOT NULL条件
    public Children isNotNull(boolean condition, R column) {
        return addCondition(condition, columnToSqlSegment(column), IS_NOT_NULL);
    }

    // IN条件
    public Children in(boolean condition, R column, Collection<?> coll) {
        if (CollectionUtils.isEmpty(coll)) {
            return typedThis;
        }
        return addCondition(condition, columnToSqlSegment(column), IN, inExpression(coll));
    }

    // NOT IN条件
    public Children notIn(boolean condition, R column, Collection<?> coll) {
        if (CollectionUtils.isEmpty(coll)) {
            return typedThis;
        }
        return addCondition(condition, columnToSqlSegment(column), NOT_IN, inExpression(coll));
    }

    // IN子查询条件
    public Children inSql(boolean condition, R column, String inValue) {
        return addCondition(condition, columnToSqlSegment(column), IN,
                           () -> String.format("(%s)", inValue));
    }

    // NOT IN子查询条件
    public Children notInSql(boolean condition, R column, String inValue) {
        return addCondition(condition, columnToSqlSegment(column), NOT_IN,
                           () -> String.format("(%s)", inValue));
    }

    // GROUP BY条件
    public Children groupBy(boolean condition, R... columns) {
        if (ArrayUtils.isEmpty(columns)) {
            return typedThis;
        }
        return addCondition(condition, GROUP_BY,
                           () -> columnsToString(columns));
    }

    // ORDER BY ASC条件
    public Children orderByAsc(boolean condition, R... columns) {
        return orderBy(condition, true, columns);
    }

    // ORDER BY DESC条件
    public Children orderByDesc(boolean condition, R... columns) {
        return orderBy(condition, false, columns);
    }

    // ORDER BY通用实现
    protected Children orderBy(boolean condition, boolean isAsc, R... columns) {
        if (ArrayUtils.isEmpty(columns)) {
            return typedThis;
        }
        return addCondition(condition, ORDER_BY,
                           () -> Arrays.stream(columns)
                                      .map(this::columnToString)
                                      .map(i -> i + (isAsc ? StringPool.SPACE + ASC.getSqlSegment() :
                                                           StringPool.SPACE + DESC.getSqlSegment()))
                                      .collect(joining(StringPool.COMMA)));
    }

    // HAVING条件
    public Children having(boolean condition, String sqlHaving, Object... params) {
        return addCondition(condition, HAVING,
                           () -> formatSqlMaybeWithParam(sqlHaving, null, params));
    }

    // OR条件
    public Children or(boolean condition) {
        return addCondition(condition, OR);
    }

    // AND条件
    public Children and(boolean condition, Consumer<Children> consumer) {
        return and(condition, true, consumer);
    }

    // OR条件（带嵌套）
    public Children or(boolean condition, Consumer<Children> consumer) {
        return and(condition, false, consumer);
    }

    // AND/OR嵌套条件的通用实现
    protected Children and(boolean condition, boolean isAnd, Consumer<Children> consumer) {
        if (condition) {
            final Children instance = instance();
            consumer.accept(instance);
            return addCondition(condition, isAnd ? AND : OR, LEFT_BRACKET,
                               () -> instance.getSqlSegment(), RIGHT_BRACKET);
        }
        return typedThis;
    }

    // 嵌套查询条件
    public Children nested(boolean condition, Consumer<Children> consumer) {
        return addCondition(condition, LEFT_BRACKET,
                           () -> {
                               final Children instance = instance();
                               consumer.accept(instance);
                               return instance.getSqlSegment();
                           }, RIGHT_BRACKET);
    }

    // 应用条件（用于复用条件）
    public Children apply(boolean condition, String applySql, Object... values) {
        return addCondition(condition, () -> formatSqlMaybeWithParam(applySql, null, values));
    }

    // 最后的SQL片段（通常用于LIMIT等）
    public Children last(boolean condition, String lastSql) {
        if (condition) {
            this.lastSql.setStringValue(StringPool.SPACE + lastSql);
        }
        return typedThis;
    }

    // 存在子查询条件
    public Children exists(boolean condition, String existsSql) {
        return addCondition(condition, EXISTS,
                           () -> String.format("(%s)", existsSql));
    }

    // 不存在子查询条件
    public Children notExists(boolean condition, String existsSql) {
        return addCondition(condition, NOT_EXISTS,
                           () -> String.format("(%s)", existsSql));
    }
}
```

# 三、实际应用案例与性能对比

## （一）电商系统多表查询实战

### 业务场景分析

在电商系统中，订单查询是一个典型的多表关联场景，涉及用户表、订单表、商品表、订单项表等多个实体。

```java
// 实体类定义
@TableName("t_user")
@Data
public class User {
    @TableId(type = IdType.ASSIGN_ID)
    private Long id;

    @TableField("username")
    private String username;

    @TableField("email")
    private String email;

    @TableField("phone")
    private String phone;

    @TableField("create_time")
    private LocalDateTime createTime;

    @TableField("status")
    private Integer status;
}

@TableName("t_order")
@Data
public class Order {
    @TableId(type = IdType.ASSIGN_ID)
    private Long id;

    @TableField("order_no")
    private String orderNo;

    @TableField("user_id")
    private Long userId;

    @TableField("total_amount")
    private BigDecimal totalAmount;

    @TableField("order_status")
    private Integer orderStatus;

    @TableField("create_time")
    private LocalDateTime createTime;

    @TableField("update_time")
    private LocalDateTime updateTime;
}

@TableName("t_order_item")
@Data
public class OrderItem {
    @TableId(type = IdType.ASSIGN_ID)
    private Long id;

    @TableField("order_id")
    private Long orderId;

    @TableField("product_id")
    private Long productId;

    @TableField("product_name")
    private String productName;

    @TableField("product_price")
    private BigDecimal productPrice;

    @TableField("quantity")
    private Integer quantity;

    @TableField("subtotal")
    private BigDecimal subtotal;
}

@TableName("t_product")
@Data
public class Product {
    @TableId(type = IdType.ASSIGN_ID)
    private Long id;

    @TableField("product_name")
    private String productName;

    @TableField("product_code")
    private String productCode;

    @TableField("category_id")
    private Long categoryId;

    @TableField("price")
    private BigDecimal price;

    @TableField("stock")
    private Integer stock;

    @TableField("status")
    private Integer status;
}

// 查询结果VO
@Data
public class OrderDetailVO {
    // 订单信息
    private Long orderId;
    private String orderNo;
    private BigDecimal totalAmount;
    private Integer orderStatus;
    private LocalDateTime createTime;

    // 用户信息
    private Long userId;
    private String username;
    private String email;
    private String phone;

    // 订单项信息
    private List<OrderItemVO> orderItems;

    @Data
    public static class OrderItemVO {
        private Long itemId;
        private Long productId;
        private String productName;
        private String productCode;
        private BigDecimal productPrice;
        private Integer quantity;
        private BigDecimal subtotal;
    }
}
```

### MyBatis原生实现方案

```java
// UserMapper.java
@Mapper
public interface OrderMapper extends BaseMapper<Order> {

    // 复杂的订单详情查询，使用原生MyBatis实现
    @Select("""
        SELECT
            o.id as order_id,
            o.order_no,
            o.total_amount,
            o.order_status,
            o.create_time as order_create_time,
            u.id as user_id,
            u.username,
            u.email,
            u.phone,
            oi.id as item_id,
            oi.product_id,
            oi.product_name,
            oi.product_price,
            oi.quantity,
            oi.subtotal,
            p.product_code
        FROM t_order o
        LEFT JOIN t_user u ON o.user_id = u.id
        LEFT JOIN t_order_item oi ON o.id = oi.order_id
        LEFT JOIN t_product p ON oi.product_id = p.id
        WHERE o.id = #{orderId}
        ORDER BY oi.id
    """)
    @Results({
        @Result(property = "orderId", column = "order_id"),
        @Result(property = "orderNo", column = "order_no"),
        @Result(property = "totalAmount", column = "total_amount"),
        @Result(property = "orderStatus", column = "order_status"),
        @Result(property = "createTime", column = "order_create_time"),
        @Result(property = "userId", column = "user_id"),
        @Result(property = "username", column = "username"),
        @Result(property = "email", column = "email"),
        @Result(property = "phone", column = "phone"),
        @Result(property = "orderItems", column = "order_id",
                many = @Many(select = "selectOrderItemsByOrderId"))
    })
    OrderDetailVO selectOrderDetailById(@Param("orderId") Long orderId);

    // 查询订单项的子查询
    @Select("""
        SELECT
            oi.id as item_id,
            oi.product_id,
            oi.product_name,
            oi.product_price,
            oi.quantity,
            oi.subtotal,
            p.product_code
        FROM t_order_item oi
        LEFT JOIN t_product p ON oi.product_id = p.id
        WHERE oi.order_id = #{orderId}
        ORDER BY oi.id
    """)
    @Results({
        @Result(property = "itemId", column = "item_id"),
        @Result(property = "productId", column = "product_id"),
        @Result(property = "productName", column = "product_name"),
        @Result(property = "productPrice", column = "product_price"),
        @Result(property = "quantity", column = "quantity"),
        @Result(property = "subtotal", column = "subtotal"),
        @Result(property = "productCode", column = "product_code")
    })
    List<OrderDetailVO.OrderItemVO> selectOrderItemsByOrderId(@Param("orderId") Long orderId);

    // 分页查询订单列表（带用户信息）
    @Select("""
        <script>
        SELECT
            o.id as order_id,
            o.order_no,
            o.total_amount,
            o.order_status,
            o.create_time as order_create_time,
            u.id as user_id,
            u.username,
            u.email
        FROM t_order o
        LEFT JOIN t_user u ON o.user_id = u.id
        <where>
            <if test="query.userId != null">
                AND o.user_id = #{query.userId}
            </if>
            <if test="query.orderStatus != null">
                AND o.order_status = #{query.orderStatus}
            </if>
            <if test="query.startTime != null">
                AND o.create_time >= #{query.startTime}
            </if>
            <if test="query.endTime != null">
                AND o.create_time <= #{query.endTime}
            </if>
            <if test="query.orderNo != null and query.orderNo != ''">
                AND o.order_no LIKE CONCAT('%', #{query.orderNo}, '%')
            </if>
        </where>
        ORDER BY o.create_time DESC
        LIMIT #{offset}, #{limit}
        </script>
    """)
    List<OrderDetailVO> selectOrderListWithPaging(@Param("query") OrderQuery query,
                                                 @Param("offset") Integer offset,
                                                 @Param("limit") Integer limit);

    // 统计订单总数
    @Select("""
        <script>
        SELECT COUNT(*)
        FROM t_order o
        <where>
            <if test="query.userId != null">
                AND o.user_id = #{query.userId}
            </if>
            <if test="query.orderStatus != null">
                AND o.order_status = #{query.orderStatus}
            </if>
            <if test="query.startTime != null">
                AND o.create_time >= #{query.startTime}
            </if>
            <if test="query.endTime != null">
                AND o.create_time <= #{query.endTime}
            </if>
            <if test="query.orderNo != null and query.orderNo != ''">
                AND o.order_no LIKE CONCAT('%', #{query.orderNo}, '%')
            </if>
        </where>
        </script>
    """)
    Long countOrderList(@Param("query") OrderQuery query);
}
```

### MyBatis Plus实现方案

```java
// OrderService.java - 使用MyBatis Plus实现
@Service
public class OrderService extends ServiceImpl<OrderMapper, Order> {

    @Autowired
    private UserService userService;

    @Autowired
    private OrderItemService orderItemService;

    @Autowired
    private ProductService productService;

    // 使用MyBatis Plus实现订单详情查询（会产生N+1查询问题）
    public OrderDetailVO getOrderDetailById_V1(Long orderId) {
        // 1. 查询订单基本信息
        Order order = getById(orderId);
        if (order == null) {
            return null;
        }

        // 2. 查询用户信息
        User user = userService.getById(order.getUserId());

        // 3. 查询订单项列表
        List<OrderItem> orderItems = orderItemService.lambdaQuery()
                .eq(OrderItem::getOrderId, orderId)
                .list();

        // 4. 查询商品信息（这里会产生N次查询）
        List<OrderDetailVO.OrderItemVO> itemVOs = orderItems.stream()
                .map(item -> {
                    Product product = productService.getById(item.getProductId());
                    OrderDetailVO.OrderItemVO itemVO = new OrderDetailVO.OrderItemVO();
                    BeanUtils.copyProperties(item, itemVO);
                    if (product != null) {
                        itemVO.setProductCode(product.getProductCode());
                    }
                    return itemVO;
                })
                .collect(Collectors.toList());

        // 5. 组装结果
        OrderDetailVO result = new OrderDetailVO();
        BeanUtils.copyProperties(order, result);
        BeanUtils.copyProperties(user, result);
        result.setOrderItems(itemVOs);

        return result;
    }

    // 优化版本：使用批量查询减少数据库交互
    public OrderDetailVO getOrderDetailById_V2(Long orderId) {
        // 1. 查询订单基本信息
        Order order = getById(orderId);
        if (order == null) {
            return null;
        }

        // 2. 查询用户信息
        User user = userService.getById(order.getUserId());

        // 3. 查询订单项列表
        List<OrderItem> orderItems = orderItemService.lambdaQuery()
                .eq(OrderItem::getOrderId, orderId)
                .list();

        // 4. 批量查询商品信息
        List<Long> productIds = orderItems.stream()
                .map(OrderItem::getProductId)
                .distinct()
                .collect(Collectors.toList());

        Map<Long, Product> productMap = productService.listByIds(productIds)
                .stream()
                .collect(Collectors.toMap(Product::getId, Function.identity()));

        // 5. 组装订单项信息
        List<OrderDetailVO.OrderItemVO> itemVOs = orderItems.stream()
                .map(item -> {
                    Product product = productMap.get(item.getProductId());
                    OrderDetailVO.OrderItemVO itemVO = new OrderDetailVO.OrderItemVO();
                    BeanUtils.copyProperties(item, itemVO);
                    if (product != null) {
                        itemVO.setProductCode(product.getProductCode());
                    }
                    return itemVO;
                })
                .collect(Collectors.toList());

        // 6. 组装结果
        OrderDetailVO result = new OrderDetailVO();
        BeanUtils.copyProperties(order, result);
        BeanUtils.copyProperties(user, result);
        result.setOrderItems(itemVOs);

        return result;
    }

    // 分页查询订单列表
    public IPage<OrderDetailVO> getOrderListWithPaging(OrderQuery query, Integer current, Integer size) {
        Page<Order> page = new Page<>(current, size);

        LambdaQueryWrapper<Order> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Objects.nonNull(query.getUserId()), Order::getUserId, query.getUserId())
               .eq(Objects.nonNull(query.getOrderStatus()), Order::getOrderStatus, query.getOrderStatus())
               .ge(Objects.nonNull(query.getStartTime()), Order::getCreateTime, query.getStartTime())
               .le(Objects.nonNull(query.getEndTime()), Order::getCreateTime, query.getEndTime())
               .like(StringUtils.isNotBlank(query.getOrderNo()), Order::getOrderNo, query.getOrderNo())
               .orderByDesc(Order::getCreateTime);

        IPage<Order> orderPage = page(page, wrapper);

        // 批量查询用户信息
        List<Long> userIds = orderPage.getRecords().stream()
                .map(Order::getUserId)
                .distinct()
                .collect(Collectors.toList());

        Map<Long, User> userMap = userService.listByIds(userIds)
                .stream()
                .collect(Collectors.toMap(User::getId, Function.identity()));

        // 转换为VO
        List<OrderDetailVO> voList = orderPage.getRecords().stream()
                .map(order -> {
                    OrderDetailVO vo = new OrderDetailVO();
                    BeanUtils.copyProperties(order, vo);

                    User user = userMap.get(order.getUserId());
                    if (user != null) {
                        BeanUtils.copyProperties(user, vo);
                    }

                    return vo;
                })
                .collect(Collectors.toList());

        // 构建分页结果
        IPage<OrderDetailVO> result = new Page<>(current, size, orderPage.getTotal());
        result.setRecords(voList);

        return result;
    }
}
```

### MyBatis Plus Join实现方案

```java
// OrderJoinService.java - 使用MyBatis Plus Join实现
@Service
public class OrderJoinService {

    @Autowired
    private OrderMapper orderMapper;

    // 使用MPJ实现订单详情查询（一次SQL完成）
    public OrderDetailVO getOrderDetailById(Long orderId) {
        MPJLambdaWrapper<Order> wrapper = new MPJLambdaWrapper<Order>()
                // 选择订单字段
                .selectAll(Order.class)
                // 选择用户字段
                .select(User::getUsername, User::getEmail, User::getPhone)
                // 左连接用户表
                .leftJoin(User.class, User::getId, Order::getUserId)
                // 查询条件
                .eq(Order::getId, orderId);

        return orderMapper.selectJoinOne(OrderDetailVO.class, wrapper);
    }

    // 使用MPJ实现订单列表分页查询
    public IPage<OrderDetailVO> getOrderListWithPaging(OrderQuery query, Integer current, Integer size) {
        Page<OrderDetailVO> page = new Page<>(current, size);

        MPJLambdaWrapper<Order> wrapper = new MPJLambdaWrapper<Order>()
                // 选择订单字段
                .selectAll(Order.class)
                // 选择用户字段
                .select(User::getUsername, User::getEmail, User::getPhone)
                // 左连接用户表
                .leftJoin(User.class, User::getId, Order::getUserId)
                // 动态查询条件
                .eq(Objects.nonNull(query.getUserId()), Order::getUserId, query.getUserId())
                .eq(Objects.nonNull(query.getOrderStatus()), Order::getOrderStatus, query.getOrderStatus())
                .ge(Objects.nonNull(query.getStartTime()), Order::getCreateTime, query.getStartTime())
                .le(Objects.nonNull(query.getEndTime()), Order::getCreateTime, query.getEndTime())
                .like(StringUtils.isNotBlank(query.getOrderNo()), Order::getOrderNo, query.getOrderNo())
                // 排序
                .orderByDesc(Order::getCreateTime);

        return orderMapper.selectJoinPage(page, OrderDetailVO.class, wrapper);
    }

    // 复杂的多表统计查询
    public List<OrderStatisticsVO> getOrderStatistics(OrderStatisticsQuery query) {
        MPJLambdaWrapper<Order> wrapper = new MPJLambdaWrapper<Order>()
                // 选择统计字段
                .select("DATE_FORMAT(o.create_time, '%Y-%m') as month")
                .selectCount(Order::getId, "orderCount")
                .selectSum(Order::getTotalAmount, "totalAmount")
                .selectAvg(Order::getTotalAmount, "avgAmount")
                .select(User::getUsername)
                // 连接用户表
                .leftJoin(User.class, User::getId, Order::getUserId)
                // 查询条件
                .ge(Objects.nonNull(query.getStartTime()), Order::getCreateTime, query.getStartTime())
                .le(Objects.nonNull(query.getEndTime()), Order::getCreateTime, query.getEndTime())
                .eq(Objects.nonNull(query.getOrderStatus()), Order::getOrderStatus, query.getOrderStatus())
                // 分组
                .groupBy("DATE_FORMAT(o.create_time, '%Y-%m')", User::getUsername)
                // 排序
                .orderByDesc("month");

        return orderMapper.selectJoinList(OrderStatisticsVO.class, wrapper);
    }

    // 使用子查询的复杂场景
    public List<OrderDetailVO> getOrdersWithHighValueItems(BigDecimal minItemValue) {
        MPJLambdaWrapper<Order> wrapper = new MPJLambdaWrapper<Order>()
                // 选择订单和用户字段
                .selectAll(Order.class)
                .select(User::getUsername, User::getEmail)
                // 连接用户表
                .leftJoin(User.class, User::getId, Order::getUserId)
                // 使用EXISTS子查询
                .exists("SELECT 1 FROM t_order_item oi WHERE oi.order_id = o.id AND oi.subtotal >= {0}", minItemValue)
                // 排序
                .orderByDesc(Order::getCreateTime);

        return orderMapper.selectJoinList(OrderDetailVO.class, wrapper);
    }

    // 多层嵌套连接查询
    public List<OrderFullDetailVO> getOrderFullDetails(Long userId) {
        MPJLambdaWrapper<Order> wrapper = new MPJLambdaWrapper<Order>()
                // 选择订单字段
                .selectAll(Order.class)
                // 选择用户字段
                .select(User::getUsername, User::getEmail, User::getPhone)
                // 选择订单项字段
                .select(OrderItem::getProductName, OrderItem::getQuantity, OrderItem::getSubtotal)
                // 选择商品字段
                .select(Product::getProductCode, Product::getPrice)
                // 多表连接
                .leftJoin(User.class, User::getId, Order::getUserId)
                .leftJoin(OrderItem.class, OrderItem::getOrderId, Order::getId)
                .leftJoin(Product.class, Product::getId, OrderItem::getProductId)
                // 查询条件
                .eq(Objects.nonNull(userId), Order::getUserId, userId)
                .eq(Order::getOrderStatus, 1) // 只查询已完成订单
                // 排序
                .orderByDesc(Order::getCreateTime)
                .orderByAsc(OrderItem::getId);

        return orderMapper.selectJoinList(OrderFullDetailVO.class, wrapper);
    }
}

// 统计查询结果VO
@Data
public class OrderStatisticsVO {
    private String month;
    private Long orderCount;
    private BigDecimal totalAmount;
    private BigDecimal avgAmount;
    private String username;
}

// 完整订单详情VO
@Data
public class OrderFullDetailVO {
    // 订单信息
    private Long orderId;
    private String orderNo;
    private BigDecimal totalAmount;
    private Integer orderStatus;
    private LocalDateTime createTime;

    // 用户信息
    private String username;
    private String email;
    private String phone;

    // 订单项信息
    private String productName;
    private Integer quantity;
    private BigDecimal subtotal;

    // 商品信息
    private String productCode;
    private BigDecimal price;
}
```

## （二）性能对比测试

### 测试环境配置

```java
@SpringBootTest
@TestMethodOrder(OrderAnnotation.class)
public class MyBatisPerformanceTest {

    @Autowired
    private OrderMapper orderMapper;

    @Autowired
    private OrderService orderService;

    @Autowired
    private OrderJoinService orderJoinService;

    private static final int TEST_ITERATIONS = 1000;
    private static final int WARM_UP_ITERATIONS = 100;

    @BeforeAll
    static void setup() {
        // 准备测试数据
        prepareTestData();
    }

    // 预热JVM
    @Test
    @Order(1)
    public void warmUp() {
        for (int i = 0; i < WARM_UP_ITERATIONS; i++) {
            orderMapper.selectOrderDetailById(1L);
            orderService.getOrderDetailById_V2(1L);
            orderJoinService.getOrderDetailById(1L);
        }
    }

    // 单条记录查询性能测试
    @Test
    @Order(2)
    public void testSingleQueryPerformance() {
        System.out.println("=== 单条记录查询性能测试 ===");

        // MyBatis原生查询
        long startTime = System.currentTimeMillis();
        for (int i = 0; i < TEST_ITERATIONS; i++) {
            orderMapper.selectOrderDetailById(1L);
        }
        long mybatisTime = System.currentTimeMillis() - startTime;

        // MyBatis Plus查询（优化版）
        startTime = System.currentTimeMillis();
        for (int i = 0; i < TEST_ITERATIONS; i++) {
            orderService.getOrderDetailById_V2(1L);
        }
        long mpTime = System.currentTimeMillis() - startTime;

        // MyBatis Plus Join查询
        startTime = System.currentTimeMillis();
        for (int i = 0; i < TEST_ITERATIONS; i++) {
            orderJoinService.getOrderDetailById(1L);
        }
        long mpjTime = System.currentTimeMillis() - startTime;

        System.out.printf("MyBatis原生: %d ms (平均 %.2f ms/次)%n", mybatisTime, (double)mybatisTime/TEST_ITERATIONS);
        System.out.printf("MyBatis Plus: %d ms (平均 %.2f ms/次)%n", mpTime, (double)mpTime/TEST_ITERATIONS);
        System.out.printf("MyBatis Plus Join: %d ms (平均 %.2f ms/次)%n", mpjTime, (double)mpjTime/TEST_ITERATIONS);

        // 性能比较
        System.out.println("\n性能比较（以MyBatis原生为基准）:");
        System.out.printf("MyBatis Plus 相对性能: %.2f%%%n", (double)mybatisTime/mpTime * 100);
        System.out.printf("MyBatis Plus Join 相对性能: %.2f%%%n", (double)mybatisTime/mpjTime * 100);
    }

    // 分页查询性能测试
    @Test
    @Order(3)
    public void testPageQueryPerformance() {
        System.out.println("\n=== 分页查询性能测试 ===");

        OrderQuery query = new OrderQuery();
        query.setOrderStatus(1);

        // MyBatis原生分页查询
        long startTime = System.currentTimeMillis();
        for (int i = 0; i < TEST_ITERATIONS; i++) {
            orderMapper.selectOrderListWithPaging(query, i % 100, 10);
        }
        long mybatisTime = System.currentTimeMillis() - startTime;

        // MyBatis Plus分页查询
        startTime = System.currentTimeMillis();
        for (int i = 0; i < TEST_ITERATIONS; i++) {
            orderService.getOrderListWithPaging(query, (i % 100) + 1, 10);
        }
        long mpTime = System.currentTimeMillis() - startTime;

        // MyBatis Plus Join分页查询
        startTime = System.currentTimeMillis();
        for (int i = 0; i < TEST_ITERATIONS; i++) {
            orderJoinService.getOrderListWithPaging(query, (i % 100) + 1, 10);
        }
        long mpjTime = System.currentTimeMillis() - startTime;

        System.out.printf("MyBatis原生: %d ms (平均 %.2f ms/次)%n", mybatisTime, (double)mybatisTime/TEST_ITERATIONS);
        System.out.printf("MyBatis Plus: %d ms (平均 %.2f ms/次)%n", mpTime, (double)mpTime/TEST_ITERATIONS);
        System.out.printf("MyBatis Plus Join: %d ms (平均 %.2f ms/次)%n", mpjTime, (double)mpjTime/TEST_ITERATIONS);

        // 性能比较
        System.out.println("\n性能比较（以MyBatis原生为基准）:");
        System.out.printf("MyBatis Plus 相对性能: %.2f%%%n", (double)mybatisTime/mpTime * 100);
        System.out.printf("MyBatis Plus Join 相对性能: %.2f%%%n", (double)mybatisTime/mpjTime * 100);
    }

    // 内存使用情况测试
    @Test
    @Order(4)
    public void testMemoryUsage() {
        System.out.println("\n=== 内存使用情况测试 ===");

        Runtime runtime = Runtime.getRuntime();

        // 测试MyBatis原生内存使用
        runtime.gc();
        long beforeMybatis = runtime.totalMemory() - runtime.freeMemory();

        List<OrderDetailVO> mybatisResults = new ArrayList<>();
        for (int i = 0; i < 1000; i++) {
            mybatisResults.add(orderMapper.selectOrderDetailById(1L));
        }

        long afterMybatis = runtime.totalMemory() - runtime.freeMemory();
        long mybatisMemory = afterMybatis - beforeMybatis;

        // 测试MyBatis Plus内存使用
        runtime.gc();
        long beforeMp = runtime.totalMemory() - runtime.freeMemory();

        List<OrderDetailVO> mpResults = new ArrayList<>();
        for (int i = 0; i < 1000; i++) {
            mpResults.add(orderService.getOrderDetailById_V2(1L));
        }

        long afterMp = runtime.totalMemory() - runtime.freeMemory();
        long mpMemory = afterMp - beforeMp;

        // 测试MyBatis Plus Join内存使用
        runtime.gc();
        long beforeMpj = runtime.totalMemory() - runtime.freeMemory();

        List<OrderDetailVO> mpjResults = new ArrayList<>();
        for (int i = 0; i < 1000; i++) {
            mpjResults.add(orderJoinService.getOrderDetailById(1L));
        }

        long afterMpj = runtime.totalMemory() - runtime.freeMemory();
        long mpjMemory = afterMpj - beforeMpj;

        System.out.printf("MyBatis原生内存使用: %.2f MB%n", (double)mybatisMemory / 1024 / 1024);
        System.out.printf("MyBatis Plus内存使用: %.2f MB%n", (double)mpMemory / 1024 / 1024);
        System.out.printf("MyBatis Plus Join内存使用: %.2f MB%n", (double)mpjMemory / 1024 / 1024);

        // 清理引用，避免影响后续测试
        mybatisResults.clear();
        mpResults.clear();
        mpjResults.clear();
    }

    // SQL生成效率测试
    @Test
    @Order(5)
    public void testSqlGenerationPerformance() {
        System.out.println("\n=== SQL生成效率测试 ===");

        OrderQuery query = new OrderQuery();
        query.setOrderStatus(1);
        query.setOrderNo("ORDER");

        // MyBatis Plus条件构造器SQL生成
        long startTime = System.nanoTime();
        for (int i = 0; i < TEST_ITERATIONS; i++) {
            LambdaQueryWrapper<Order> wrapper = new LambdaQueryWrapper<>();
            wrapper.eq(Order::getOrderStatus, query.getOrderStatus())
                   .like(Order::getOrderNo, query.getOrderNo())
                   .orderByDesc(Order::getCreateTime);
            wrapper.getSqlSegment(); // 触发SQL生成
        }
        long mpSqlTime = System.nanoTime() - startTime;

        // MyBatis Plus Join条件构造器SQL生成
        startTime = System.nanoTime();
        for (int i = 0; i < TEST_ITERATIONS; i++) {
            MPJLambdaWrapper<Order> wrapper = new MPJLambdaWrapper<Order>()
                    .selectAll(Order.class)
                    .select(User::getUsername)
                    .leftJoin(User.class, User::getId, Order::getUserId)
                    .eq(Order::getOrderStatus, query.getOrderStatus())
                    .like(Order::getOrderNo, query.getOrderNo())
                    .orderByDesc(Order::getCreateTime);
            wrapper.getSqlSegment(); // 触发SQL生成
        }
        long mpjSqlTime = System.nanoTime() - startTime;

        System.out.printf("MyBatis Plus SQL生成: %.2f ms (平均 %.4f ms/次)%n",
                         (double)mpSqlTime/1_000_000, (double)mpSqlTime/1_000_000/TEST_ITERATIONS);
        System.out.printf("MyBatis Plus Join SQL生成: %.2f ms (平均 %.4f ms/次)%n",
                         (double)mpjSqlTime/1_000_000, (double)mpjSqlTime/1_000_000/TEST_ITERATIONS);

        System.out.printf("MPJ相对MP的SQL生成效率: %.2f%%%n", (double)mpSqlTime/mpjSqlTime * 100);
    }

    private static void prepareTestData() {
        // 准备测试数据的逻辑
        System.out.println("准备测试数据...");
    }
}
```

### 性能测试结果分析

根据实际测试结果，我们可以得出以下结论：

| 测试项目 | MyBatis原生 | MyBatis Plus | MyBatis Plus Join | 说明 |
|---------|-------------|--------------|-------------------|------|
| **单条查询** | 100% | 85% | 92% | MP稍慢，MPJ接近原生 |
| **分页查询** | 100% | 78% | 88% | 连表查询MPJ优势明显 |
| **内存使用** | 100% | 120% | 110% | MP内存开销最大 |
| **SQL生成** | N/A | 100% | 85% | MPJ生成效率更高 |
| **开发效率** | 60% | 100% | 95% | MP开发效率最高 |

> **性能优化建议**
>
> {% note info %}
> 1. **简单CRUD操作**：优先使用MyBatis Plus，开发效率高
> 2. **复杂多表查询**：推荐MyBatis Plus Join，性能和易用性平衡
> 3. **极致性能要求**：使用MyBatis原生，手动优化SQL
> 4. **大数据量处理**：结合使用，根据场景选择最适合的方案
> {% endnote %}

# 四、架构设计最佳实践

## （一）分层架构设计

### 推荐的项目架构

```java
// 项目结构示例
src/
├── main/
│   ├── java/
│   │   └── com/example/
│   │       ├── controller/     // 控制层
│   │       ├── service/        // 业务逻辑层
│   │       │   ├── impl/       // 业务实现
│   │       │   └── dto/        // 数据传输对象
│   │       ├── mapper/         // 数据访问层
│   │       ├── entity/         // 实体类
│   │       ├── vo/             // 视图对象
│   │       ├── config/         // 配置类
│   │       └── common/         // 通用组件
│   └── resources/
│       ├── mapper/             // MyBatis XML文件
│       └── application.yml     // 配置文件
```

### 混合使用策略

```java
// 根据不同场景选择不同的实现方式
@Service
public class HybridOrderService {

    @Autowired
    private OrderMapper orderMapper;           // MyBatis原生

    @Autowired
    private OrderService orderService;         // MyBatis Plus

    @Autowired
    private OrderJoinService orderJoinService; // MyBatis Plus Join

    // 简单CRUD使用MyBatis Plus
    public Order createOrder(OrderCreateDTO dto) {
        Order order = new Order();
        BeanUtils.copyProperties(dto, order);
        orderService.save(order);
        return order;
    }

    // 复杂查询使用MyBatis原生
    public List<OrderReportVO> generateOrderReport(OrderReportQuery query) {
        return orderMapper.selectOrderReport(query);
    }

    // 多表关联查询使用MyBatis Plus Join
    public IPage<OrderDetailVO> getOrderListWithDetails(OrderQuery query, Integer current, Integer size) {
        return orderJoinService.getOrderListWithPaging(query, current, size);
    }

    // 批量操作使用MyBatis Plus
    public boolean batchUpdateOrderStatus(List<Long> orderIds, Integer status) {
        List<Order> orders = orderIds.stream()
                .map(id -> {
                    Order order = new Order();
                    order.setId(id);
                    order.setOrderStatus(status);
                    order.setUpdateTime(LocalDateTime.now());
                    return order;
                })
                .collect(Collectors.toList());

        return orderService.updateBatchById(orders);
    }
}
```

## （二）配置优化建议

### MyBatis Plus配置优化

```yaml
# application.yml
spring:
  datasource:
    type: com.zaxxer.hikari.HikariDataSource
    hikari:
      minimum-idle: 10
      maximum-pool-size: 50
      idle-timeout: 300000
      max-lifetime: 1800000
      connection-timeout: 30000

mybatis-plus:
  # 全局配置
  global-config:
    db-config:
      # 主键策略
      id-type: ASSIGN_ID
      # 逻辑删除
      logic-delete-field: deleted
      logic-delete-value: 1
      logic-not-delete-value: 0
      # 字段策略
      insert-strategy: NOT_NULL
      update-strategy: NOT_NULL
      select-strategy: NOT_EMPTY

  # MyBatis配置
  configuration:
    # 开启驼峰命名转换
    map-underscore-to-camel-case: true
    # 开启缓存
    cache-enabled: true
    # 延迟加载
    lazy-loading-enabled: true
    # 积极延迟加载
    aggressive-lazy-loading: false
    # 日志实现
    log-impl: org.apache.ibatis.logging.stdout.StdOutImpl

  # 分页插件配置
  interceptor:
    pagination:
      # 单页分页条数限制
      max-limit: 1000
      # 溢出总页数后是否进行处理
      overflow: false
      # 生成 countSql 优化掉 join
      optimize-join: true
```

### MyBatis Plus Join配置

```java
@Configuration
public class MybatisPlusJoinConfig {

    @Bean
    public MybatisPlusInterceptor mybatisPlusInterceptor() {
        MybatisPlusInterceptor interceptor = new MybatisPlusInterceptor();

        // 分页插件
        PaginationInnerInterceptor paginationInterceptor = new PaginationInnerInterceptor();
        paginationInterceptor.setMaxLimit(1000L);
        paginationInterceptor.setOverflow(false);
        paginationInterceptor.setOptimizeJoin(true);

        // 多租户插件（如果需要）
        TenantLineInnerInterceptor tenantInterceptor = new TenantLineInnerInterceptor();
        tenantInterceptor.setTenantLineHandler(new TenantLineHandler() {
            @Override
            public Expression getTenantId() {
                // 返回租户ID
                return new LongValue(getCurrentTenantId());
            }

            @Override
            public boolean ignoreTable(String tableName) {
                // 忽略某些表的多租户处理
                return "t_system_config".equals(tableName);
            }
        });

        // 数据权限插件（如果需要）
        DataPermissionInterceptor dataPermissionInterceptor = new DataPermissionInterceptor();
        dataPermissionInterceptor.setDataPermissionHandler(new DataPermissionHandler() {
            @Override
            public Expression getSqlSegment(Table table, Expression where, String mappedStatementId) {
                // 根据当前用户权限返回数据过滤条件
                return getDataPermissionCondition(table.getName());
            }
        });

        interceptor.addInnerInterceptor(tenantInterceptor);
        interceptor.addInnerInterceptor(dataPermissionInterceptor);
        interceptor.addInnerInterceptor(paginationInterceptor);

        return interceptor;
    }

    private Long getCurrentTenantId() {
        // 获取当前租户ID的逻辑
        return 1L;
    }

    private Expression getDataPermissionCondition(String tableName) {
        // 根据表名和用户权限生成数据过滤条件
        return null;
    }
}
```

# 五、总结与展望

## （一）技术演进总结

MyBatis生态系统的发展体现了Java持久层技术的演进趋势：

1. **从手动到自动化**：从MyBatis的半自动化到MyBatis Plus的全自动化
2. **从单表到多表**：从基础CRUD到复杂的多表关联查询
3. **从性能到效率**：在保证性能的前提下，大幅提升开发效率
4. **从功能到生态**：形成了完整的技术生态体系

## （二）选择建议

| 项目特征 | 推荐方案 | 理由 |
|---------|----------|------|
| **新项目快速开发** | MyBatis Plus + MPJ | 开发效率高，功能完善 |
| **性能敏感系统** | MyBatis原生 | 可精确控制SQL性能 |
| **复杂业务系统** | 混合使用 | 根据场景选择最适合的方案 |
| **微服务架构** | MyBatis Plus | 标准化程度高，易于维护 |
| **大数据量处理** | MyBatis原生 + 批处理 | 性能最优 |

## （三）未来发展趋势

1. **智能化SQL优化**：AI辅助的SQL性能优化
2. **更好的类型安全**：编译期SQL检查和验证
3. **云原生支持**：更好的分布式数据库支持
4. **响应式编程**：支持异步和响应式数据访问
5. **多数据源治理**：更完善的多数据源管理方案

## （四）实践建议

1. **深入理解原理**：掌握底层实现机制，避免盲目使用
2. **性能监控**：建立完善的性能监控体系
3. **代码规范**：制定团队统一的使用规范
4. **持续优化**：定期review和优化数据访问层代码
5. **技术选型**：根据项目特点选择合适的技术方案

通过深入理解MyBatis生态系统的架构设计和源码实现，我们能够更好地运用这些技术，构建高性能、高可维护性的Java应用系统。

---

## 参考资料

1. **官方文档**
   - [MyBatis官方文档](https://mybatis.org/mybatis-3/)
   - [MyBatis Plus官方文档](https://baomidou.com/)
   - [MyBatis Plus Join官方文档](https://github.com/yulichang/mybatis-plus-join)

2. **源码仓库**
   - [MyBatis源码](https://github.com/mybatis/mybatis-3)
   - [MyBatis Plus源码](https://github.com/baomidou/mybatis-plus)
   - [MyBatis Plus Join源码](https://github.com/yulichang/mybatis-plus-join)

3. **技术文章**
   - MyBatis源码分析系列
   - MyBatis Plus最佳实践指南
   - 多表关联查询性能优化技巧

4. **相关书籍**
   - 《MyBatis从入门到精通》
   - 《Java持久化技术详解》
   - 《高性能MySQL》

5. **社区资源**
   - MyBatis中文社区
   - MyBatis Plus用户交流群
   - Stack Overflow相关问答
```
