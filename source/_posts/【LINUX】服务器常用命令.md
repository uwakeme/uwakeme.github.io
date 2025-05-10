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

```
# 导出整个数据库
mysqldump -u [用户名] -p [数据库名] > [导出文件名].sql

# 示例：导出名为 mydb 的数据库到 backup.sql
mysqldump -u root -p mydb > mydb_backup.sql
```

- 输入密码后即可导出数据

## 恢复/导入MYSQL数据库

- 先cd到备份文件的目录

```
# 创建数据库（如果不存在）
mysql -u root -p -e "CREATE DATABASE mydb;"

# 恢复整个数据库
mysql -u [用户名] -p [数据库名] < [备份文件].sql

# 示例：恢复 mydb_backup.sql 到 mydb 数据库
mysql -u root -p mydb < mydb_backup.sql
```