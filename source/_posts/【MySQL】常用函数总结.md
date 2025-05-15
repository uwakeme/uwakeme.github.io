---
title: 【MySQL】常用函数总结
categories: 数据库
tags:
  - MySQL
  - 函数
  - 数据处理
---

# 【MySQL】常用函数总结

## 一、字符串处理函数

### 1. 字符串连接函数

#### CONCAT()

将多个字符串连接成一个字符串：

```sql
-- 基本用法
SELECT CONCAT('Hello', ' ', 'World') AS greeting;
-- 结果: Hello World

-- 连接列值
SELECT CONCAT(first_name, ' ', last_name) AS full_name FROM employees;

-- 与其他表达式混用
SELECT CONCAT('ID: ', id, ', Name: ', name) FROM products;
```

#### CONCAT_WS()

使用指定的分隔符连接多个字符串，比CONCAT更方便：

```sql
-- 基本语法: CONCAT_WS(separator, string1, string2, ...)

-- 使用逗号连接
SELECT CONCAT_WS(',', 'Apple', 'Banana', 'Orange') AS fruits;
-- 结果: Apple,Banana,Orange

-- 在查询中使用
SELECT CONCAT_WS(' - ', id, name, category) AS product_info FROM products;

-- 忽略NULL值
SELECT CONCAT_WS(',', 'Apple', NULL, 'Orange') AS fruits;
-- 结果: Apple,Orange
```

#### GROUP_CONCAT()

将分组中的值连接成一个字符串，常用于一对多关系的数据汇总：

```sql
-- 基本语法: GROUP_CONCAT([DISTINCT] expr [ORDER BY clause] [SEPARATOR str_val])

-- 将每个部门的员工姓名连接成一个逗号分隔的列表
SELECT 
    department_id,
    GROUP_CONCAT(employee_name) AS employees
FROM employees
GROUP BY department_id;

-- 使用自定义分隔符
SELECT 
    department_id,
    GROUP_CONCAT(employee_name SEPARATOR ' | ') AS employees
FROM employees
GROUP BY department_id;

-- 先排序再连接
SELECT 
    department_id,
    GROUP_CONCAT(employee_name ORDER BY salary DESC SEPARATOR ', ') AS employees_by_salary
FROM employees
GROUP BY department_id;

-- 结合DISTINCT去重
SELECT 
    product_id,
    GROUP_CONCAT(DISTINCT tag_name ORDER BY tag_name ASC) AS tags
FROM product_tags
GROUP BY product_id;
```

注意：GROUP_CONCAT的默认最大长度是1024字节，可以通过修改系统变量来调整：

```sql
SET SESSION group_concat_max_len = 1000000;
```

### 2. 子串处理函数

#### SUBSTRING()

提取字符串的一部分：

```sql
-- 基本语法: SUBSTRING(str, pos, len)

-- 从第4个字符开始，提取3个字符
SELECT SUBSTRING('Hello World', 4, 3) AS substr;
-- 结果: 'lo '

-- 从第4个字符开始到结尾
SELECT SUBSTRING('Hello World', 4) AS substr;
-- 结果: 'lo World'

-- 从倒数第5个字符开始，提取3个字符
SELECT SUBSTRING('Hello World', -5, 3) AS substr;
-- 结果: 'Wor'
```

#### LEFT() 和 RIGHT()

从字符串左侧或右侧提取指定数量的字符：

```sql
-- 从左侧提取5个字符
SELECT LEFT('Hello World', 5) AS left_str;
-- 结果: 'Hello'

-- 从右侧提取5个字符
SELECT RIGHT('Hello World', 5) AS right_str;
-- 结果: 'World'
```

#### TRIM(), LTRIM(), RTRIM()

去除字符串两端或单端的空格或指定字符：

```sql
-- 移除两端空格
SELECT TRIM('  Hello World  ') AS trimmed_str;
-- 结果: 'Hello World'

-- 仅移除左侧空格
SELECT LTRIM('  Hello World  ') AS ltrimmed_str;
-- 结果: 'Hello World  '

-- 仅移除右侧空格
SELECT RTRIM('  Hello World  ') AS rtrimmed_str;
-- 结果: '  Hello World'

-- 移除两端特定字符
SELECT TRIM(BOTH 'x' FROM 'xxxHello Worldxxx') AS trimmed_chars;
-- 结果: 'Hello World'
```

## 二、数值处理函数

### 1. 舍入函数

```sql
-- 四舍五入到整数
SELECT ROUND(123.456) AS rounded;  -- 结果: 123

-- 四舍五入到指定小数位
SELECT ROUND(123.456, 1) AS rounded;  -- 结果: 123.5
SELECT ROUND(123.456, 2) AS rounded;  -- 结果: 123.46

-- 向上取整
SELECT CEILING(123.456) AS ceil;  -- 结果: 124

-- 向下取整
SELECT FLOOR(123.456) AS floor;  -- 结果: 123

-- 截断小数（不进行四舍五入）
SELECT TRUNCATE(123.456, 1) AS trunc;  -- 结果: 123.4
SELECT TRUNCATE(123.456, 2) AS trunc;  -- 结果: 123.45
```

### 2. 格式化函数

```sql
-- 格式化数值，加千位分隔符
SELECT FORMAT(1234567.89, 2) AS formatted;  
-- 结果: '1,234,567.89'

-- 控制小数位数
SELECT FORMAT(1234.5678, 3) AS formatted;  
-- 结果: '1,234.568'
```

## 三、日期和时间函数

### 1. 获取当前日期和时间

```sql
-- 当前日期
SELECT CURDATE();  -- 2024-01-15

-- 当前时间
SELECT CURTIME();  -- 15:30:45

-- 当前日期时间
SELECT NOW();      -- 2024-01-15 15:30:45
```

### 2. 日期格式化与提取

```sql
-- 格式化日期
SELECT DATE_FORMAT(NOW(), '%Y-%m-%d %H:%i:%s') AS formatted_date;
-- 结果: '2024-01-15 15:30:45'

-- 常用格式符:
-- %Y - 四位年份 (2024)
-- %y - 两位年份 (24)
-- %m - 月份数字，补零 (01-12)
-- %c - 月份数字，不补零 (1-12)
-- %d - 日期数字，补零 (01-31)
-- %e - 日期数字，不补零 (1-31)
-- %H - 24小时制小时数 (00-23)
-- %h - 12小时制小时数 (01-12)
-- %i - 分钟 (00-59)
-- %s - 秒 (00-59)
-- %W - 星期几全称 (Sunday-Saturday)
-- %a - 星期几缩写 (Sun-Sat)

-- 提取日期部分
SELECT EXTRACT(YEAR FROM '2024-01-15') AS year;  -- 2024
SELECT EXTRACT(MONTH FROM '2024-01-15') AS month;  -- 1
SELECT EXTRACT(DAY FROM '2024-01-15') AS day;  -- 15
```

### 3. 日期计算

```sql
-- 日期加减
SELECT DATE_ADD('2024-01-15', INTERVAL 1 DAY) AS tomorrow;  -- 2024-01-16
SELECT DATE_SUB('2024-01-15', INTERVAL 1 MONTH) AS prev_month;  -- 2023-12-15

-- 支持的时间单位:
-- SECOND, MINUTE, HOUR, DAY, WEEK, MONTH, QUARTER, YEAR

-- 日期差值
SELECT DATEDIFF('2024-01-15', '2023-12-25') AS days_diff;  -- 21
```

## 四、条件函数

### 1. IF()

```sql
-- 基本语法: IF(condition, value_if_true, value_if_false)

SELECT IF(1 > 2, 'Yes', 'No') AS result;  -- 'No'

-- 实际应用
SELECT 
    product_name,
    price,
    IF(price > 100, 'Expensive', 'Affordable') AS price_category
FROM products;
```

### 2. IFNULL()

```sql
-- 处理NULL值
SELECT IFNULL(NULL, 'Not Available') AS result;  -- 'Not Available'

-- 实际应用
SELECT 
    product_name,
    IFNULL(description, 'No description available') AS description
FROM products;
```

### 3. CASE 表达式

```sql
-- 简单CASE
SELECT 
    product_name,
    CASE category
        WHEN 'Electronics' THEN 'Tech'
        WHEN 'Clothing' THEN 'Fashion'
        ELSE 'Other'
    END AS simplified_category
FROM products;

-- 搜索CASE
SELECT 
    product_name,
    price,
    CASE 
        WHEN price < 50 THEN 'Budget'
        WHEN price < 100 THEN 'Mid-range'
        WHEN price < 200 THEN 'Premium'
        ELSE 'Luxury'
    END AS price_range
FROM products;
```

## 五、聚合函数

### 1. 基本聚合函数

```sql
-- 计算总数
SELECT COUNT(*) FROM orders;

-- 计算非NULL值总数
SELECT COUNT(shipping_address) FROM orders;

-- 求和
SELECT SUM(total_amount) FROM orders;

-- 平均值
SELECT AVG(total_amount) FROM orders;

-- 最大/最小值
SELECT 
    MAX(total_amount) AS highest_order,
    MIN(total_amount) AS lowest_order
FROM orders;
```

### 2. 窗口函数(MySQL 8.0+)

```sql
-- 计算累计总和
SELECT 
    order_date,
    total_amount,
    SUM(total_amount) OVER (ORDER BY order_date) AS running_total
FROM orders;

-- 按分组计算累计总和
SELECT 
    order_date,
    customer_id,
    total_amount,
    SUM(total_amount) OVER (
        PARTITION BY customer_id 
        ORDER BY order_date
    ) AS customer_running_total
FROM orders;

-- 排名函数
SELECT 
    product_name,
    category,
    price,
    ROW_NUMBER() OVER (ORDER BY price DESC) AS price_rank,
    DENSE_RANK() OVER (PARTITION BY category ORDER BY price DESC) AS category_price_rank
FROM products;
```

## 六、实用案例

### 1. 构建带层级的组织结构树

```sql
-- 使用CONCAT和REPEAT构建层级缩进
WITH RECURSIVE org_tree AS (
    -- 锚点成员
    SELECT 
        org_id, 
        org_name, 
        parent_id, 
        0 AS level, 
        org_name AS path
    FROM organizations
    WHERE parent_id IS NULL
    
    UNION ALL
    
    -- 递归成员
    SELECT 
        o.org_id, 
        o.org_name, 
        o.parent_id, 
        ot.level + 1, 
        CONCAT(ot.path, ' > ', o.org_name)
    FROM organizations o
    JOIN org_tree ot ON o.parent_id = ot.org_id
)
SELECT 
    org_id,
    CONCAT(REPEAT('    ', level), org_name) AS hierarchical_name,
    path
FROM org_tree
ORDER BY path;
```

### 2. 将多行数据合并为单行JSON

```sql
-- 将每个客户的订单合并为JSON
SELECT 
    c.customer_id,
    c.customer_name,
    JSON_ARRAYAGG(
        JSON_OBJECT(
            'order_id', o.order_id,
            'order_date', DATE_FORMAT(o.order_date, '%Y-%m-%d'),
            'total_amount', o.total_amount
        )
    ) AS orders
FROM customers c
JOIN orders o ON c.customer_id = o.customer_id
GROUP BY c.customer_id, c.customer_name;
```

### 3. 枢轴查询(行转列)

```sql
-- 使用条件聚合实现行转列
SELECT 
    product_id,
    SUM(IF(quarter = 'Q1', sales, 0)) AS Q1_sales,
    SUM(IF(quarter = 'Q2', sales, 0)) AS Q2_sales,
    SUM(IF(quarter = 'Q3', sales, 0)) AS Q3_sales,
    SUM(IF(quarter = 'Q4', sales, 0)) AS Q4_sales,
    SUM(sales) AS total_sales
FROM sales
GROUP BY product_id;
```

### 4. 计算连续值的差异

```sql
-- 使用窗口函数计算每日销售额同比增长
SELECT 
    current_date,
    current_sales,
    previous_sales,
    ROUND((current_sales - previous_sales) / previous_sales * 100, 2) AS growth_percent
FROM (
    SELECT 
        sale_date AS current_date,
        total_sales AS current_sales,
        LAG(total_sales) OVER (ORDER BY sale_date) AS previous_sales
    FROM daily_sales
) t
WHERE previous_sales IS NOT NULL;
```

## 七、注意事项与性能建议

1. **字符串连接性能考虑**:
   - CONCAT通常比使用字符串运算符(+)更高效
   - 对于大量数据，GROUP_CONCAT可能需要增加其最大长度限制

2. **日期函数使用**:
   - 优先使用MySQL内置函数而非自定义实现
   - 日期计算应注意夏令时和闰年等特殊情况的处理

3. **索引考虑**:
   - 在函数中包装索引列通常会阻止使用索引(如`WHERE MONTH(date_column) = 1`)
   - 应该重写为不对索引列应用函数的形式(如`WHERE date_column BETWEEN '2024-01-01' AND '2024-01-31'`)

4. **NULL值处理**:
   - 聚合函数通常忽略NULL值(除了COUNT(*))
   - CONCAT函数遇到NULL值会返回NULL，而CONCAT_WS会忽略NULL值

通过合理使用MySQL提供的各种函数，可以在数据库层面高效完成复杂的数据处理任务，减少应用程序层面的处理逻辑，提高整体系统性能。在处理大数据量时，应当注意函数使用对查询性能的影响，合理使用索引和优化查询结构。 