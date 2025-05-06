---
title: 【LINUX】在Ubantu服务器部署网页系统
categories: LINUX
tags:
  - 部署
  - LINUX
  - UBANTU
date: 2025-04-10
---
## 一、准备环境
+ 查看服务器信息

  ```shell
  uname -a          # 查看系统内核信息
  lsb_release -a    # 如果是 Linux 系统，查看发行版本
  df -h             # 查看磁盘空间
  free -m           # 查看内存使用情况
  ```

+ 检查软件安装状态：

  ```shell
  mysql --version    # 检查 MySQL 是否已安装
  nginx -v           # 检查 Nginx 是否已安装
  java -version      # 检查 Java 是否已安装
  ```

## 二、安装部署所需的软件

### （一）MYSQL

### （二）NGINX
+ 上传安装包
+ 解压安装包
+ 修改安装配置
+ 安装
+ 验证

### （三）JDK
+ 上传安装包
+ 解压安装包
+ 配置系统变量
+ 验证

### （四）MongoDB（如有必要）

### （五）Redis（如有必要）



## 三、准备部署所必需的资源
### （一）数据库

### （二）前端打包

### （三）后端打包

## 四、部署资源并调试
### （一）数据库
### （二）前端

### （三）后端

### （四）调试