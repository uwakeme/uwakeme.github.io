---
title: 【LINUX】MySQL服务器的安全配置
tags:
  - 部署
  - CentOS
  - LINUX
  - MYSQL
categories: LINUX
date: 2025-03-20 00:00:00
---

> 如果MySQL正常启动，本地可以正常登录连接，但是其他电脑连接不上的话，大概率就是MySQL服务器的安全配置导致不允许来自指定IP地址的连接

# 报错信息
```
1130 - Host '连接电脑IP' is not allowed to connect to this MySQL server
```

# 解决步骤
+ 通过本地服务器登录MySQL
```
mysql -u root -p
```
+ 查看当前主机权限，如果是localhost，说明MySQL只允许本地连接
```
SELECT host, user FROM mysql.user WHERE user = 'your_username';
```
+ 更新主机权限
```
// 设置为所有ip都可以连接
UPDATE mysql.user SET host = '%' WHERE user = 'your_username';
```
+ 刷新权限
```
FLUSH PRIVILEGES;
```
