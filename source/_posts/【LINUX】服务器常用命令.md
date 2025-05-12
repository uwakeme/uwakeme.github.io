---
title: 【LINUX】服务器常用命令
categories: LINUX
tags:
  - 部署
  - 工作
  - LINUX
  - SHELL
---

# 后端常用命令

## 启动jar包命令

- 直接启动

```
nohup java -jar web.jar > web.out 2>&1 &
```

- 在jar包同级创建文件夹config，然后用config中的配置文件启动

```
nohup java -Dfile.encoding=UTF-8 -jar web.jar --spring.config.location=file:./config/ > web.out 2>&1 &
```

# 数据库常用命令

## 导出/备份MYSQL数据库

- 先cd到要存储备份文件的文件夹
- 然后执行备份命令

### （一）基本备份命令

```shell
# 导出整个数据库
mysqldump -u [用户名] -p [数据库名] > [导出文件名].sql

# 示例：导出名为 mydb 的数据库到 backup.sql
mysqldump -u root -p mydb > mydb_backup.sql
```

- 输入密码后即可导出数据

### （二）导出特定表

```shell
# 导出数据库中的特定表
mysqldump -u [用户名] -p [数据库名] [表名1] [表名2] > [导出文件名].sql

# 示例：导出 mydb 数据库中的 users 和 orders 表
mysqldump -u root -p mydb users orders > mydb_tables_backup.sql
```

### （三）仅导出数据库结构（不含数据）

```shell
# 仅导出数据库结构，不包含数据
mysqldump -u [用户名] -p --no-data [数据库名] > [导出文件名]_structure.sql

# 示例：仅导出 mydb 数据库结构
mysqldump -u root -p --no-data mydb > mydb_structure.sql
```

### （四）仅导出数据（不含结构）

```shell
# 仅导出数据，不包含表结构
mysqldump -u [用户名] -p --no-create-info [数据库名] > [导出文件名]_data.sql

# 示例：仅导出 mydb 数据库数据
mysqldump -u root -p --no-create-info mydb > mydb_data.sql
```

### （五）导出带条件的数据

```shell
# 使用 WHERE 条件导出特定数据
mysqldump -u [用户名] -p [数据库名] [表名] --where="[条件]" > [导出文件名].sql

# 示例：导出 users 表中 id 大于 1000 的记录
mysqldump -u root -p mydb users --where="id > 1000" > users_filtered.sql
```

### （六）导出时添加额外选项

```shell
# 添加 DROP TABLE 语句（如果表存在则先删除）
mysqldump -u [用户名] -p --add-drop-table [数据库名] > [导出文件名].sql

# 导出存储过程和函数
mysqldump -u [用户名] -p --routines [数据库名] > [导出文件名].sql

# 导出触发器
mysqldump -u [用户名] -p --triggers [数据库名] > [导出文件名].sql

# 导出事件
mysqldump -u [用户名] -p --events [数据库名] > [导出文件名].sql

# 完整备份（包含存储过程、函数、触发器和事件）
mysqldump -u [用户名] -p --routines --triggers --events [数据库名] > [导出文件名]_full.sql
```

## 恢复/导入MYSQL数据库

- 先cd到备份文件的目录

### （一）基本恢复命令

```shell
# 创建数据库（如果不存在）
mysql -u root -p -e "CREATE DATABASE mydb;"

# 恢复整个数据库
mysql -u [用户名] -p [数据库名] < [备份文件].sql

# 示例：恢复 mydb_backup.sql 到 mydb 数据库
mysql -u root -p mydb < mydb_backup.sql
```

### （二）导入时指定字符集

```shell
# 指定字符集导入数据
mysql -u [用户名] -p --default-character-set=utf8mb4 [数据库名] < [备份文件].sql

# 示例：使用 utf8mb4 字符集导入数据
mysql -u root -p --default-character-set=utf8mb4 mydb < mydb_backup.sql
```

### （三）导入大型数据库的优化方法

```shell
# 对于大型数据库，可以使用以下方式提高导入速度
mysql -u [用户名] -p [数据库名] --init-command="SET autocommit=0;" < [备份文件].sql

# 或者在导入前禁用外键检查
mysql -u [用户名] -p -e "SET GLOBAL foreign_key_checks=0;" && \
mysql -u [用户名] -p [数据库名] < [备份文件].sql && \
mysql -u [用户名] -p -e "SET GLOBAL foreign_key_checks=1;"
```

### （四）使用source命令导入

```shell
# 先登录到MySQL
mysql -u [用户名] -p

# 然后在MySQL命令行中执行
mysql> USE [数据库名];
mysql> SOURCE [备份文件].sql;

# 示例
mysql> USE mydb;
mysql> SOURCE /path/to/mydb_backup.sql;
```

### （五）导入特定表数据

如果备份文件只包含特定表的数据，可以直接导入到目标数据库：

```shell
# 导入包含特定表的备份文件
mysql -u [用户名] -p [数据库名] < [特定表备份文件].sql

# 示例：导入只包含users表的备份
mysql -u root -p mydb < users_backup.sql
```

### （六）导入时显示进度

对于大型数据库，可以使用pv工具显示导入进度：

```shell
# 先安装pv工具
apt-get install pv  # Debian/Ubuntu
# 或
yum install pv      # CentOS/RHEL

# 使用pv显示导入进度
pv [备份文件].sql | mysql -u [用户名] -p [数据库名]

# 示例
pv mydb_backup.sql | mysql -u root -p mydb
```