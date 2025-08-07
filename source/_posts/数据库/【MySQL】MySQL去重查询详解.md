---
title: 【MySQL】MySQL去重查询详解
categories: MySQL
date: 2025-08-06
tags:
  - MySQL
  - 数据库
cover: https://cdn.jsdelivr.net/gh/uwakeme/personal-image-repository/images/mysql.jpeg
---

# 前言

在日常的数据库操作中，数据去重是一个非常常见的需求。无论是查询结果去重、数据清洗，还是统计分析，我们都需要掌握MySQL中的各种去重技术。本文将详细介绍MySQL中常用的去重关键字和操作方法，结合实际业务场景，帮助大家更好地理解和应用这些技术。

MySQL提供了多种去重方式，主要包括DISTINCT关键字、GROUP BY子句、以及一些高级的去重技巧。每种方法都有其适用场景和性能特点，选择合适的去重方式对于提高查询效率至关重要。

# 一、DISTINCT关键字详解

## （一）基本语法和用法

DISTINCT是MySQL中最常用的去重关键字，它可以去除查询结果中的重复行。DISTINCT关键字必须放在SELECT语句的最前面，它会对整个查询结果进行去重。

```sql
-- 基本语法
SELECT DISTINCT column1, column2, ... FROM table_name;

-- 单列去重：查询所有不重复的城市
SELECT DISTINCT city FROM customers;

-- 多列组合去重：查询不重复的城市和省份组合
SELECT DISTINCT city, province FROM customers;

-- 结合WHERE条件的去重查询
SELECT DISTINCT department_id 
FROM employees 
WHERE salary > 5000;
```

## （二）DISTINCT的工作原理

DISTINCT的工作原理是对查询结果进行排序和比较，去除完全相同的行。需要注意的是：

```sql
-- 示例数据表：products
-- id | name     | category | price
-- 1  | iPhone   | 手机     | 6999
-- 2  | iPad     | 平板     | 3999
-- 3  | MacBook  | 电脑     | 9999
-- 4  | iPhone   | 手机     | 6999
-- 5  | Samsung  | 手机     | 5999

-- 单列去重：只返回不重复的分类
SELECT DISTINCT category FROM products;
-- 结果：手机、平板、电脑

-- 多列去重：name和category的组合必须完全相同才会被去重
SELECT DISTINCT name, category FROM products;
-- 结果：iPhone-手机、iPad-平板、MacBook-电脑、Samsung-手机
-- 注意：即使有两个iPhone，但它们的完整记录相同，所以只返回一条
```

## （三）DISTINCT的性能考虑

DISTINCT操作需要对结果集进行排序和比较，在大数据量情况下可能影响性能：

```sql
-- 性能优化建议：

-- 1. 在有索引的列上使用DISTINCT效果更好
SELECT DISTINCT customer_id FROM orders;  -- customer_id有索引

-- 2. 尽量减少DISTINCT的列数
SELECT DISTINCT city FROM customers;  -- 好于下面的写法
-- SELECT DISTINCT city, address FROM customers;  -- 如果不必要，避免多列

-- 3. 结合LIMIT使用，避免处理过多数据
SELECT DISTINCT category FROM products LIMIT 10;

-- 4. 使用EXISTS替代DISTINCT IN子查询（某些情况下性能更好）
-- 不推荐：
SELECT * FROM customers WHERE city IN (SELECT DISTINCT city FROM stores);
-- 推荐：
SELECT * FROM customers c WHERE EXISTS (SELECT 1 FROM stores s WHERE s.city = c.city);
```

# 二、GROUP BY去重操作

## （一）GROUP BY基本去重

GROUP BY不仅可以用于分组统计，也是一种强大的去重工具。相比DISTINCT，GROUP BY提供了更多的灵活性：

```sql
-- 使用GROUP BY实现去重
SELECT city FROM customers GROUP BY city;

-- 等价于DISTINCT的写法
SELECT DISTINCT city FROM customers;

-- GROUP BY的优势：可以同时进行统计
SELECT city, COUNT(*) as customer_count 
FROM customers 
GROUP BY city;

-- 多列分组去重
SELECT department_id, job_title, COUNT(*) as employee_count
FROM employees 
GROUP BY department_id, job_title;
```

## （二）GROUP BY与聚合函数结合

GROUP BY的真正威力在于与聚合函数的结合使用：

```sql
-- 统计每个分类的产品数量和平均价格
SELECT 
    category,
    COUNT(*) as product_count,           -- 统计每个分类的产品数量
    AVG(price) as avg_price,            -- 计算平均价格
    MIN(price) as min_price,            -- 最低价格
    MAX(price) as max_price             -- 最高价格
FROM products 
GROUP BY category;

-- 查找每个部门薪资最高的员工信息
SELECT 
    department_id,
    MAX(salary) as max_salary,
    COUNT(*) as employee_count
FROM employees 
GROUP BY department_id;

-- 统计每个客户的订单数量和总金额
SELECT 
    customer_id,
    COUNT(order_id) as order_count,     -- 订单数量
    SUM(total_amount) as total_spent,   -- 总消费金额
    AVG(total_amount) as avg_order      -- 平均订单金额
FROM orders 
GROUP BY customer_id
HAVING total_spent > 10000;            -- 只显示消费超过1万的客户
```

## （三）HAVING子句过滤分组结果

HAVING子句用于过滤GROUP BY的结果，类似于WHERE，但作用于分组后的数据：

```sql
-- 查找订单数量超过5个的客户
SELECT 
    customer_id,
    COUNT(*) as order_count
FROM orders 
GROUP BY customer_id
HAVING COUNT(*) > 5;

-- 查找平均薪资超过8000的部门
SELECT 
    department_id,
    AVG(salary) as avg_salary,
    COUNT(*) as employee_count
FROM employees 
GROUP BY department_id
HAVING AVG(salary) > 8000;

-- 复杂的HAVING条件：多个聚合函数条件
SELECT 
    category,
    COUNT(*) as product_count,
    AVG(price) as avg_price
FROM products 
GROUP BY category
HAVING COUNT(*) >= 3 AND AVG(price) > 1000;
```

# 三、高级去重技巧

## （一）什么是窗口函数

在介绍ROW_NUMBER()之前，我们先了解一下什么是窗口函数。

**窗口函数就像是透过一个"窗口"来观察和处理数据。** 想象一下你站在楼里透过窗户看外面的风景，这个"窗户"就是你观察的范围，你可以看到窗户范围内的所有景物并对它们进行分析。

在数据库中：
- **窗口** = 数据的观察范围（可以是整个表，也可以是按某个字段分组的数据）
- **窗口函数** = 在这个范围内进行计算的函数
- **关键特点** = 不会减少行数，每一行都会保留，只是在每行上添加计算结果

### 窗口函数与聚合函数的区别

```sql
-- 普通聚合函数：会合并数据，减少行数
SELECT department_id, COUNT(*) as emp_count
FROM employees
GROUP BY department_id;
-- 结果：如果有3个部门，只返回3行数据

-- 窗口函数：保持原有行数，在每行上添加计算结果
SELECT
    department_id,
    employee_name,
    salary,
    COUNT(*) OVER (PARTITION BY department_id) as dept_emp_count
FROM employees;
-- 结果：如果有100个员工，仍然返回100行，但每行都知道自己部门有多少人
```

**生活中的比喻：班级排名**
- **传统GROUP BY方式**：把学生按班级分组，只告诉你每个班有多少人
- **窗口函数方式**：每个学生都知道自己在班级中的排名，同时保留所有学生的完整信息

## （二）使用ROW_NUMBER()进行去重

ROW_NUMBER()是MySQL的窗口函数，可以为每个分组内的行分配一个唯一的序号，常用于复杂的去重场景。

### 窗口函数语法详解

```sql
-- 窗口函数的基本语法结构
ROW_NUMBER() OVER (
    PARTITION BY column1, column2, ...  -- 分组字段（可选）
    ORDER BY column3, column4, ...      -- 排序字段（必需）
)
```

**语法说明：**
- **OVER**：窗口函数的关键字，定义窗口的范围和规则
- **PARTITION BY**：类似于GROUP BY，将数据分成不同的组，在每个组内独立计算
- **ORDER BY**：在每个分组内按指定字段排序，ROW_NUMBER()根据这个顺序分配序号

### OVER子句详细说明

OVER子句是窗口函数的核心，它定义了函数的计算范围：

```sql
-- 1. 只有ORDER BY，没有PARTITION BY：对整个结果集排序编号
SELECT
    name,
    salary,
    ROW_NUMBER() OVER (ORDER BY salary DESC) as salary_rank
FROM employees;
-- 结果：所有员工按薪资从高到低编号 1,2,3,4,5...

-- 2. 有PARTITION BY和ORDER BY：分组内排序编号
SELECT
    department_id,
    name,
    salary,
    ROW_NUMBER() OVER (PARTITION BY department_id ORDER BY salary DESC) as dept_rank
FROM employees;
-- 结果：每个部门内的员工按薪资排序，每个部门都从1开始编号

```

**PARTITION BY与GROUP BY的区别：**

**GROUP BY：** 会合并行，减少结果集的行数
```sql
SELECT department_id, COUNT(*) FROM employees GROUP BY department_id;
```

**PARTITION BY：** 不会合并行，保持原有行数，只是在每个分组内计算
```sql
SELECT
    department_id,
    name,
    ROW_NUMBER() OVER (PARTITION BY department_id ORDER BY hire_date) as hire_order
FROM employees;
```

### 常用窗口函数对比

**示例数据：员工薪资表**
```
dept_id | name | salary
1       | 张三 | 8000
1       | 李四 | 9000
1       | 王五 | 9000
2       | 赵六 | 7000
```

**ROW_NUMBER()：** 连续唯一编号，相同值也会分配不同序号
```sql
SELECT
    dept_id, name, salary,
    ROW_NUMBER() OVER (PARTITION BY dept_id ORDER BY salary DESC) as row_num
FROM employees;
```
执行结果：李四=1, 王五=2, 张三=3（即使李四和王五薪资相同）

**RANK()：** 相同值分配相同排名，但会跳过后续排名
```sql
SELECT
    dept_id, name, salary,
    RANK() OVER (PARTITION BY dept_id ORDER BY salary DESC) as rank_num
FROM employees;
```
执行结果：李四=1, 王五=1, 张三=3（跳过了排名2）

**DENSE_RANK()：** 相同值分配相同排名，不跳过后续排名
```sql
SELECT
    dept_id, name, salary,
    DENSE_RANK() OVER (PARTITION BY dept_id ORDER BY salary DESC) as dense_rank
FROM employees;
```
执行结果：李四=1, 王五=1, 张三=2（不跳过排名）

### 实际应用示例

ROW_NUMBER()窗口函数可以为每个分组内的行分配一个唯一的序号，常用于复杂的去重场景：

```sql
-- 删除重复数据，保留ID最小的记录
-- 假设customers表中有重复的email记录

-- 1. 先查看重复数据
SELECT
    email,
    COUNT(*) as duplicate_count
FROM customers
GROUP BY email
HAVING COUNT(*) > 1;

-- 2. 使用ROW_NUMBER()标记重复数据
SELECT
    id,
    name,
    email,
    -- PARTITION BY email：按邮箱分组，相同邮箱的记录在同一组
    -- ORDER BY id：在每个邮箱组内按ID升序排列
    -- 结果：每个邮箱组内的记录被分配序号1,2,3...
    ROW_NUMBER() OVER (PARTITION BY email ORDER BY id) as row_num
FROM customers;

```

**执行结果示例：**
```
id | name  | email        | row_num
1  | 张三  | zhang@qq.com | 1
3  | 李四  | zhang@qq.com | 2      -- 相同邮箱的第2条记录
2  | 王五  | wang@qq.com  | 1
4  | 赵六  | zhao@qq.com  | 1

-- 3. 删除重复数据（保留row_num=1的记录）
DELETE c1 FROM customers c1
INNER JOIN (
    SELECT
        id,
        ROW_NUMBER() OVER (PARTITION BY email ORDER BY id) as row_num
    FROM customers
) c2 ON c1.id = c2.id
WHERE c2.row_num > 1;
```

## （三）获取每组最新记录的去重

这是业务中非常常见的去重场景：获取每个用户、每个分类等的最新一条记录。这种去重不是简单的删除重复，而是从每个分组中选择符合条件的特定记录：

```sql
-- 场景：查询每个用户的最新购买记录
-- 使用ROW_NUMBER()窗口函数（推荐方法）
SELECT
    user_id,
    user_name,
    order_id,
    product_name,
    order_date,
    amount
FROM (
    SELECT
        u.user_id,
        u.user_name,
        o.order_id,
        o.product_name,
        o.order_date,
        o.amount,
        -- PARTITION BY u.user_id：按用户ID分组，每个用户的记录独立编号
        -- ORDER BY o.order_date DESC：在每个用户组内按订单日期降序排列（最新的在前）
        -- 结果：每个用户的最新订单获得序号1，次新的获得序号2，以此类推
        ROW_NUMBER() OVER (PARTITION BY u.user_id ORDER BY o.order_date DESC) as rn
    FROM users u
    INNER JOIN orders o ON u.user_id = o.user_id
) ranked_orders
WHERE rn = 1;  -- 只取每个用户的第一条记录（最新的）

-- 处理同一时间多条记录的情况
SELECT
    user_id,
    user_name,
    order_id,
    product_name,
    order_date,
    amount
FROM (
    SELECT
        u.user_id,
        u.user_name,
        o.order_id,
        o.product_name,
        o.order_date,
        o.amount,
        -- PARTITION BY u.user_id：按用户分组
        -- ORDER BY多个字段：先按日期降序，再按订单ID降序
        -- 这样确保即使同一天有多个订单，也能选出唯一的"最新"记录
        ROW_NUMBER() OVER (
            PARTITION BY u.user_id
            ORDER BY o.order_date DESC, o.order_id DESC
        ) as rn
    FROM users u
    INNER JOIN orders o ON u.user_id = o.user_id
) ranked_orders
WHERE rn = 1;

-- 其他常见的最新记录查询场景：

-- 1. 查询每个商品的最新价格记录
SELECT
    product_id,
    product_name,
    price,
    effective_date
FROM (
    SELECT
        product_id,
        product_name,
        price,
        effective_date,
        ROW_NUMBER() OVER (PARTITION BY product_id ORDER BY effective_date DESC) as rn
    FROM product_price_history
) latest_prices
WHERE rn = 1;

-- 2. 查询每个部门最新入职的员工
SELECT
    department_id,
    employee_name,
    hire_date,
    salary
FROM (
    SELECT
        department_id,
        employee_name,
        hire_date,
        salary,
        ROW_NUMBER() OVER (PARTITION BY department_id ORDER BY hire_date DESC) as rn
    FROM employees
) latest_hires
WHERE rn = 1;
```

### 替代方法：使用相关子查询

```sql
-- 使用相关子查询实现相同功能（性能可能较差）
SELECT
    u.user_id,
    u.user_name,
    o.order_id,
    o.product_name,
    o.order_date,
    o.amount
FROM users u
INNER JOIN orders o ON u.user_id = o.user_id
WHERE o.order_date = (
    -- 子查询：找到该用户的最新订单日期
    SELECT MAX(order_date)
    FROM orders o2
    WHERE o2.user_id = u.user_id
);

-- 注意：如果同一天有多条记录，上述查询可能返回多条结果
-- 需要进一步处理：
SELECT
    u.user_id,
    u.user_name,
    o.order_id,
    o.product_name,
    o.order_date,
    o.amount
FROM users u
INNER JOIN orders o ON u.user_id = o.user_id
WHERE (o.order_date, o.order_id) = (
    -- 使用复合条件确保唯一性
    SELECT order_date, MAX(order_id)
    FROM orders o2
    WHERE o2.user_id = u.user_id
    AND o2.order_date = (
        SELECT MAX(order_date) FROM orders o3 WHERE o3.user_id = u.user_id
    )
);
```

## （四）使用UNION去重

UNION操作符会自动去除重复行，而UNION ALL则保留所有行：

```sql
-- UNION自动去重
SELECT city FROM customers_north
UNION
SELECT city FROM customers_south;

-- UNION ALL保留重复
SELECT city FROM customers_north
UNION ALL
SELECT city FROM customers_south;

-- 复杂的UNION去重查询
SELECT 'VIP客户' as customer_type, name, email FROM vip_customers
UNION
SELECT '普通客户' as customer_type, name, email FROM regular_customers
ORDER BY customer_type, name;
```

## （五）临时表去重方法

对于大量数据的去重操作，有时使用临时表会更高效：

```sql
-- 创建临时表存储去重结果
CREATE TEMPORARY TABLE temp_unique_customers AS
SELECT DISTINCT customer_id, name, email 
FROM customers;

-- 清空原表
TRUNCATE TABLE customers;

-- 将去重数据插入回原表
INSERT INTO customers (customer_id, name, email)
SELECT customer_id, name, email FROM temp_unique_customers;

-- 删除临时表
DROP TEMPORARY TABLE temp_unique_customers;
```

# 四、实际应用场景

## （一）电商系统中的去重应用

在电商系统中，去重操作非常常见，以下是一些典型场景：

```sql
-- 场景1：统计每个商品的销售情况（去重订单项）
SELECT 
    product_id,
    product_name,
    COUNT(DISTINCT order_id) as order_count,    -- 有多少个不同订单购买了此商品
    SUM(quantity) as total_sold,               -- 总销售数量
    SUM(quantity * price) as total_revenue     -- 总销售额
FROM order_items oi
JOIN products p ON oi.product_id = p.id
GROUP BY product_id, product_name
ORDER BY total_revenue DESC;

-- 场景2：查找活跃用户（去重登录记录）
SELECT 
    user_id,
    COUNT(DISTINCT DATE(login_time)) as active_days,  -- 活跃天数
    MIN(login_time) as first_login,                   -- 首次登录
    MAX(login_time) as last_login                     -- 最后登录
FROM user_login_logs 
WHERE login_time >= DATE_SUB(NOW(), INTERVAL 30 DAY)
GROUP BY user_id
HAVING active_days >= 10;  -- 30天内至少活跃10天的用户
```

## （二）数据分析中的去重统计

```sql
-- 场景3：网站流量分析（去重访问统计）
SELECT 
    DATE(visit_time) as visit_date,
    COUNT(*) as total_visits,                    -- 总访问次数（包含重复）
    COUNT(DISTINCT user_id) as unique_visitors,  -- 独立访客数
    COUNT(DISTINCT session_id) as unique_sessions -- 独立会话数
FROM website_visits 
WHERE visit_time >= DATE_SUB(NOW(), INTERVAL 7 DAY)
GROUP BY DATE(visit_time)
ORDER BY visit_date;

-- 场景4：用户行为分析（去重行为统计）
SELECT 
    user_id,
    COUNT(DISTINCT action_type) as action_types,     -- 用户执行了多少种不同行为
    COUNT(DISTINCT product_id) as viewed_products,   -- 查看了多少不同商品
    COUNT(*) as total_actions                        -- 总行为次数
FROM user_actions 
WHERE action_date >= DATE_SUB(NOW(), INTERVAL 30 DAY)
GROUP BY user_id
HAVING action_types >= 3;  -- 至少执行了3种不同行为的用户
```

# 五、性能优化建议

## （一）索引优化

合理的索引设计对去重操作的性能至关重要：

```sql
-- 为经常用于去重的列创建索引
CREATE INDEX idx_customer_email ON customers(email);
CREATE INDEX idx_product_category ON products(category);

-- 复合索引用于多列去重
CREATE INDEX idx_order_customer_date ON orders(customer_id, order_date);

-- 查看索引使用情况
EXPLAIN SELECT DISTINCT category FROM products;
```

## （二）查询优化技巧

```sql
-- 1. 使用EXISTS替代DISTINCT子查询
-- 不推荐：
SELECT * FROM products WHERE category IN (
    SELECT DISTINCT category FROM featured_products
);

-- 推荐：
SELECT * FROM products p WHERE EXISTS (
    SELECT 1 FROM featured_products fp WHERE fp.category = p.category
);

-- 2. 合理使用LIMIT
SELECT DISTINCT category FROM products LIMIT 20;

-- 3. 避免在大表上进行全表DISTINCT
-- 如果可能，先用WHERE条件过滤数据
SELECT DISTINCT customer_id 
FROM orders 
WHERE order_date >= '2024-01-01';
```

# 六、常见问题与解决方案

## （一）NULL值处理

在去重操作中，NULL值的处理需要特别注意：

```sql
-- DISTINCT会将NULL视为相同值
SELECT DISTINCT phone FROM customers;  -- 多个NULL只会返回一个NULL

-- 如果要排除NULL值
SELECT DISTINCT phone FROM customers WHERE phone IS NOT NULL;

-- GROUP BY也会将NULL归为一组
SELECT phone, COUNT(*) FROM customers GROUP BY phone;
```

## （二）性能问题排查

```sql
-- 使用EXPLAIN分析查询性能
EXPLAIN SELECT DISTINCT category FROM products;

-- 查看查询执行时间
SET profiling = 1;
SELECT DISTINCT customer_id FROM orders;
SHOW PROFILES;

-- 对于大数据量，考虑分批处理
SELECT DISTINCT customer_id FROM orders 
WHERE order_date BETWEEN '2024-01-01' AND '2024-01-31';
```

# 七、总结

MySQL中的去重操作是数据处理的基础技能，掌握不同去重方法的特点和适用场景非常重要：

1. **DISTINCT**：适用于简单的结果去重，语法简洁，但功能相对单一
2. **GROUP BY**：功能强大，可以结合聚合函数进行统计分析，是数据分析的利器
3. **窗口函数ROW_NUMBER()**：适用于复杂的去重场景，如删除重复数据、获取每组最新记录等
4. **UNION**：适用于合并多个查询结果并去重
5. **获取每组最新记录**：这是业务中最常见的去重需求，推荐使用ROW_NUMBER()窗口函数实现

在实际应用中，应该根据具体的业务需求和数据特点选择合适的去重方法，同时注意性能优化，合理使用索引，避免在大数据量上进行低效的去重操作。

通过本文的学习，相信大家对MySQL的去重操作有了更深入的理解，能够在实际工作中灵活运用这些技术，提高数据处理的效率和准确性。

---

## 参考资料

- [MySQL官方文档 - SELECT语句](https://dev.mysql.com/doc/refman/8.0/en/select.html)
- [MySQL官方文档 - GROUP BY优化](https://dev.mysql.com/doc/refman/8.0/en/group-by-optimization.html)
- [MySQL官方文档 - DISTINCT优化](https://dev.mysql.com/doc/refman/8.0/en/distinct-optimization.html)
- [MySQL性能优化最佳实践](https://dev.mysql.com/doc/refman/8.0/en/optimization.html)
