---
title: 【MySQL】查询组织结构表中所有子组织
categories: 数据库
tags:
  - MySQL
  - 递归查询
  - CTE
  - 组织结构
---

# 【MySQL】查询组织结构表中所有子组织

## 一、需求背景

在企业应用系统中，组织结构通常采用树形结构存储，一个常见的需求是查询某个组织及其所有下级组织的信息。例如，查询某部门及其所有子部门的ID列表，或者查询某区域及其所有下辖区域的数据。

本文将介绍在MySQL中查询组织结构表中某个组织及其所有子组织的几种方法，特别是使用MySQL 8.0引入的CTE(公共表表达式)和递归查询功能。

## 二、表结构介绍

以下是组织结构表的DDL定义：

```sql
CREATE TABLE `sys_stru` (
  `STRU_ID` bigint(20) NOT NULL COMMENT '机构编码',
  `STRU_TYPE` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '机构类型',
  `ORGAN_ID` bigint(20) DEFAULT NULL COMMENT '组织编码',
  `ORGAN_ALIAS` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '组织别名',
  `PARENT_ID` bigint(20) DEFAULT NULL COMMENT '上级机构编码',
  `PRINCIPAL_ID` bigint(20) DEFAULT NULL COMMENT '负责人组织编码',
  `CORPORATION_ID` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '所属法人组织编码',
  `STRU_LEVEL` int(11) DEFAULT NULL COMMENT '级别',
  `STRU_FID` varchar(1024) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '全主键ID',
  `STRU_SEQ` varchar(1024) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '全排序编号',
  `STRU_PATH` varchar(1024) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '树形编码',
  `STRU_ORDER` int(11) DEFAULT NULL COMMENT '成员局部排序值',
  `GLOBAL_ORDER` int(11) DEFAULT NULL COMMENT '成员全局排序值',
  `IS_LEAF` char(1) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '是否是叶子节点',
  `DEL_FLAG` char(1) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '使用标识',
  /* 其他字段省略 */
  PRIMARY KEY (`STRU_ID`) USING BTREE,
  KEY `SYS_STRU_ORGAN_ID_IDX` (`ORGAN_ID`) USING BTREE,
  KEY `SYS_STRU_PARENT_ID_IDX` (`PARENT_ID`) USING BTREE,
  KEY `SYS_STRU_PRINCIPAL_ID_IDX` (`PRINCIPAL_ID`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci ROW_FORMAT=DYNAMIC COMMENT='组织结构';
```

这个表中，关键字段说明：
- `STRU_ID`：主键，机构编码
- `PARENT_ID`：上级机构编码，通过此字段建立树形结构
- `STRU_PATH`：树形编码，记录了从根节点到当前节点的路径
- `IS_LEAF`：是否是叶子节点，可用于优化查询
- `DEL_FLAG`：使用标识，通常用于逻辑删除

## 三、查询方法

### 1. 使用递归CTE（MySQL 8.0+）

MySQL 8.0版本引入了对CTE(公共表表达式)的支持，包括递归CTE，这是解决树形结构查询的最佳方法。

```sql
-- 查询ID为100的组织及其所有子组织的STRU_ID
WITH RECURSIVE org_tree AS (
    -- 锚点成员：选择初始节点
    SELECT STRU_ID, PARENT_ID, STRU_TYPE, ORGAN_ALIAS, 0 AS level
    FROM sys_stru
    WHERE STRU_ID = 100 
    AND DEL_FLAG = '0'
    
    UNION ALL
    
    -- 递归成员：通过PARENT_ID与STRU_ID的关联获取子节点
    SELECT s.STRU_ID, s.PARENT_ID, s.STRU_TYPE, s.ORGAN_ALIAS, ot.level + 1
    FROM sys_stru s
    JOIN org_tree ot ON s.PARENT_ID = ot.STRU_ID
    WHERE s.DEL_FLAG = '0'
)
-- 最终查询结果
SELECT STRU_ID
FROM org_tree
ORDER BY level, STRU_ID;
```

这个查询的工作原理：
1. 先查询指定的组织节点（这里是ID为100的组织）
2. 然后通过递归，不断查找以该节点为父节点的子组织
3. 递归过程会一直持续到找不到更多子节点为止

如果只需要组织ID列表，可以简化查询：

```sql
WITH RECURSIVE org_tree AS (
    SELECT STRU_ID, PARENT_ID FROM sys_stru WHERE STRU_ID = 100 AND DEL_FLAG = '0'
    UNION ALL
    SELECT s.STRU_ID, s.PARENT_ID FROM sys_stru s
    JOIN org_tree ot ON s.PARENT_ID = ot.STRU_ID
    WHERE s.DEL_FLAG = '0'
)
SELECT STRU_ID FROM org_tree;
```

### 2. 利用STRU_PATH字段（如果已存储路径信息）

如果表中的`STRU_PATH`字段存储了完整的树形编码，可以使用模糊查询更高效地获取所有子组织：

```sql
-- 先获取目标组织的STRU_PATH
SET @target_path = (SELECT STRU_PATH FROM sys_stru WHERE STRU_ID = 100);

-- 查询目标组织及其所有子组织
SELECT STRU_ID
FROM sys_stru
WHERE STRU_PATH = @target_path  -- 目标组织自身
   OR STRU_PATH LIKE CONCAT(@target_path, ',%')  -- 所有子组织
AND DEL_FLAG = '0'
ORDER BY STRU_LEVEL, STRU_ID;
```

这种方法的优势是查询效率高，前提是`STRU_PATH`字段必须正确维护，且格式为以逗号分隔的ID路径，如"1,5,100"表示ID为100的组织的父节点是5，祖父节点是1。

### 3. 利用STRU_FID字段（全主键字段）

如果`STRU_FID`字段存储了从根节点到当前节点的所有主键，可以：

```sql
-- 获取目标组织的STRU_FID
SET @target_fid = (SELECT STRU_FID FROM sys_stru WHERE STRU_ID = 100);

-- 查询包含目标组织ID的所有组织
SELECT STRU_ID
FROM sys_stru
WHERE STRU_FID = @target_fid  -- 精确匹配
   OR STRU_FID LIKE CONCAT(@target_fid, ',%')  -- 子组织
AND DEL_FLAG = '0'
ORDER BY STRU_LEVEL, STRU_ID;
```

### 4. 多次自连接查询（适用于已知层级深度）

对于层级固定且较少的情况，可以使用多次自连接：

```sql
-- 查询最多3层的组织结构
SELECT DISTINCT s1.STRU_ID
FROM sys_stru s1
LEFT JOIN sys_stru s2 ON s1.STRU_ID = s2.PARENT_ID AND s2.DEL_FLAG = '0'
LEFT JOIN sys_stru s3 ON s2.STRU_ID = s3.PARENT_ID AND s3.DEL_FLAG = '0'
LEFT JOIN sys_stru s4 ON s3.STRU_ID = s4.PARENT_ID AND s4.DEL_FLAG = '0'
WHERE s1.STRU_ID = 100 AND s1.DEL_FLAG = '0';
```

这种方法适合层级较少的情况，但不适合深度未知的树形结构。

## 四、性能优化建议

1. **创建合适的索引**：确保`PARENT_ID`字段有索引，如果经常使用`STRU_PATH`查询，也应为其创建索引。

2. **使用`IS_LEAF`字段优化**：如果表中有`IS_LEAF`字段，可以在查询中使用此字段减少不必要的递归：

```sql
WITH RECURSIVE org_tree AS (
    SELECT STRU_ID, PARENT_ID, IS_LEAF FROM sys_stru 
    WHERE STRU_ID = 100 AND DEL_FLAG = '0'
    
    UNION ALL
    
    SELECT s.STRU_ID, s.PARENT_ID, s.IS_LEAF FROM sys_stru s
    JOIN org_tree ot ON s.PARENT_ID = ot.STRU_ID
    WHERE s.DEL_FLAG = '0' AND ot.IS_LEAF = '0'  -- 只有非叶子节点才继续递归
)
SELECT STRU_ID FROM org_tree;
```

3. **限制递归深度**：对于非常大的树结构，可以限制递归深度以避免性能问题：

```sql
WITH RECURSIVE org_tree AS (
    SELECT STRU_ID, PARENT_ID, 1 AS depth FROM sys_stru 
    WHERE STRU_ID = 100 AND DEL_FLAG = '0'
    
    UNION ALL
    
    SELECT s.STRU_ID, s.PARENT_ID, ot.depth + 1 FROM sys_stru s
    JOIN org_tree ot ON s.PARENT_ID = ot.STRU_ID
    WHERE s.DEL_FLAG = '0' AND ot.depth < 10  -- 限制最大深度为10
)
SELECT STRU_ID FROM org_tree;
```

## 五、应用场景示例

### 1. 获取某部门的所有员工

```sql
-- 先获取部门及其所有子部门
WITH RECURSIVE dept_tree AS (
    SELECT STRU_ID FROM sys_stru WHERE STRU_ID = 100 AND DEL_FLAG = '0'
    UNION ALL
    SELECT s.STRU_ID FROM sys_stru s
    JOIN dept_tree dt ON s.PARENT_ID = dt.STRU_ID
    WHERE s.DEL_FLAG = '0'
)
-- 然后查询这些部门中的所有员工
SELECT e.* FROM employee e
JOIN dept_tree dt ON e.department_id = dt.STRU_ID
WHERE e.status = 'active';
```

### 2. 按层级展示组织结构

```sql
WITH RECURSIVE org_tree AS (
    SELECT STRU_ID, PARENT_ID, ORGAN_ALIAS, 0 AS level
    FROM sys_stru
    WHERE STRU_ID = 100 AND DEL_FLAG = '0'
    
    UNION ALL
    
    SELECT s.STRU_ID, s.PARENT_ID, s.ORGAN_ALIAS, ot.level + 1
    FROM sys_stru s
    JOIN org_tree ot ON s.PARENT_ID = ot.STRU_ID
    WHERE s.DEL_FLAG = '0'
)
SELECT 
    STRU_ID,
    CONCAT(REPEAT('    ', level), ORGAN_ALIAS) AS hierarchical_name,
    level
FROM org_tree
ORDER BY level, STRU_ID;
```

## 六、小结

在MySQL 8.0及以上版本中，递归CTE是查询树形结构数据的最佳方案。对于早期版本，可以考虑使用存储过程或应用程序代码实现递归逻辑，或者利用预先计算的路径字段（如`STRU_PATH`）进行查询。

对于大型组织结构，应当注意查询性能优化，合理设计索引，并考虑使用缓存机制减轻数据库负担。在实际应用中，还需根据具体业务需求选择合适的查询方法和优化策略。 