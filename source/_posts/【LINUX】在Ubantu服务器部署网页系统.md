---
title: 【LINUX】在Ubuntu服务器部署网页系统
categories: LINUX
tags:
  - 部署
  - LINUX
  - UBUNTU
date: 2025-04-10
---

# 【LINUX】在Ubuntu服务器部署网页系统

## 前言

本文档旨在详细介绍如何在Ubuntu服务器上部署一个典型的网页系统。部署过程涵盖了从环境准备、所需软件（如MySQL、Nginx、JDK、MongoDB、Redis等）的安装与配置，到前端和后端应用的打包、部署及最终的调试验证。笔者将以第一人称视角，结合实际操作经验，提供清晰、可执行的步骤指导，希望能帮助读者顺利完成部署任务。无论是初次接触服务器部署的新手，还是有一定经验的开发者，都可以从本文中获取有价值的信息。
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

1.  **更新软件包列表**

    ```shell
    sudo apt update
    ```

2.  **安装MySQL服务器** <mcreference link="https://ubuntu.com/server/docs/install-and-configure-a-mysql-server" index="1">1</mcreference> <mcreference link="https://www.digitalocean.com/community/tutorials/how-to-install-mysql-on-ubuntu-20-04" index="2">2</mcreference> <mcreference link="https://phoenixnap.com/kb/install-mysql-ubuntu-22-04" index="4">4</mcreference>

    ```shell
    sudo apt install mysql-server
    ```

3.  **离线安装** <mcreference link="https://dev.mysql.com/doc/mysql-installation-excerpt/8.0/en/linux-installation-debian.html" index="5">5</mcreference>

    当服务器无法连接互联网时，可按照以下步骤进行离线安装：
    ```shell
    # 在有网络的机器上下载deb包
    wget https://dev.mysql.com/get/mysql-apt-config_0.8.24-1_all.deb

    # 将deb包传输到服务器
    scp mysql-apt-config_0.8.24-1_all.deb user@server:/tmp

    # 在服务器上配置本地源
    sudo dpkg -i /tmp/mysql-apt-config_0.8.24-1_all.deb
    sudo apt update

    # 安装依赖（需提前下载传输）
    sudo dpkg -i libaio1_*.deb libmecab2_*.deb

    # 安装MySQL服务
    sudo apt install mysql-server
    ```

3.  **验证安装** <mcreference link="https://ubuntu.com/server/docs/install-and-configure-a-mysql-server" index="1">1</mcreference> <mcreference link="https://phoenixnap.com/kb/install-mysql-ubuntu-22-04" index="4">4</mcreference>

    ```shell
    mysql --version
    ```
    或者查看服务状态：
    ```shell
    sudo systemctl status mysql
    ```

4.  **安全配置** <mcreference link="https://www.digitalocean.com/community/tutorials/how-to-install-mysql-on-ubuntu-20-04" index="2">2</mcreference> <mcreference link="https://phoenixnap.com/kb/install-mysql-ubuntu-22-04" index="4">4</mcreference>

    运行安全脚本以提高MySQL安装的安全性：
    ```shell
    sudo mysql_secure_installation
    ```
    根据提示进行设置，例如设置root密码、删除匿名用户、禁止root远程登录、删除测试数据库等。

5.  **（可选）配置远程访问** <mcreference link="https://ubuntu.com/server/docs/install-and-configure-a-mysql-server" index="1">1</mcreference>

    如果需要允许远程连接，需要修改MySQL配置文件。通常是 `/etc/mysql/mysql.conf.d/mysqld.cnf` 文件。
    找到 `bind-address` 配置项，将其值从 `127.0.0.1` 修改为 `0.0.0.0` 或者服务器的IP地址。
    ```ini
    bind-address            = 0.0.0.0
    ```
    修改后重启MySQL服务：
    ```shell
    sudo systemctl restart mysql.service
    ```

6.  **登录MySQL** <mcreference link="https://phoenixnap.com/kb/install-mysql-ubuntu-22-04" index="4">4</mcreference>

    ```shell
    sudo mysql -u root -p
    ```
    然后输入之前设置的root密码。

### （二）NGINX

1.  **更新软件包列表**

    ```shell
    sudo apt update
    ```

2.  **安装Nginx** <mcreference link="https://ubuntu.com/tutorials/install-and-configure-nginx" index="1">1</mcreference> <mcreference link="https://www.digitalocean.com/community/tutorials/how-to-install-nginx-on-ubuntu-20-04" index="2">2</mcreference> <mcreference link="https://docs.nginx.com/nginx/admin-guide/installing-nginx/installing-nginx-open-source/" index="3">3</mcreference>

    ```shell
    sudo apt install nginx
    ```

3.  **离线安装** <mcreference link="https://nginx.org/en/linux_packages.html" index="6">6</mcreference>

    离线环境安装步骤：
    ```shell
    # 在有网络的设备下载安装包
    wget http://nginx.org/packages/ubuntu/pool/nginx/n/nginx/nginx_1.18.0-0ubuntu1_amd64.deb

    # 传输deb包到服务器
    scp nginx_1.18.0-0ubuntu1_amd64.deb user@server:/tmp

    # 安装依赖（需提前下载）
    sudo dpkg -i libpcre3_*.deb zlib1g_*.deb openssl_*.deb

    # 安装Nginx
    sudo dpkg -i /tmp/nginx_1.18.0-0ubuntu1_amd64.deb

    # 修复依赖关系
    sudo apt --fix-broken install
    ```

3.  **验证安装**

    检查Nginx服务状态：
    ```shell
    sudo systemctl status nginx
    ```
    或者通过访问服务器IP地址在浏览器中查看Nginx欢迎页面。

4.  **配置防火墙** <mcreference link="https://www.digitalocean.com/community/tutorials/how-to-install-nginx-on-ubuntu-20-04" index="2">2</mcreference>

    如果启用了UFW防火墙，需要允许Nginx的HTTP和HTTPS流量：
    ```shell
    sudo ufw allow 'Nginx HTTP'
    sudo ufw allow 'Nginx HTTPS'
    sudo ufw status
    ```

5.  **Nginx常用命令**

    ```shell
    sudo systemctl stop nginx       # 停止Nginx服务
    sudo systemctl start nginx      # 启动Nginx服务
    sudo systemctl restart nginx    # 重启Nginx服务
    sudo systemctl reload nginx     # 重新加载配置（不中断服务）
    sudo systemctl enable nginx     # 设置开机自启动
    sudo systemctl disable nginx    # 禁止开机自启动
    nginx -t                       # 测试Nginx配置文件语法
    ```

6.  **Nginx配置文件**

    主要的Nginx配置文件位于 `/etc/nginx/nginx.conf`。
    服务器块（虚拟主机）配置文件通常位于 `/etc/nginx/sites-available/` 目录下，并通过软链接到 `/etc/nginx/sites-enabled/` 目录来启用。
    默认的服务器块配置文件是 `/etc/nginx/sites-available/default`。

### （三）JDK

在Ubuntu上安装JDK，推荐使用OpenJDK，它是Java的开源实现，并且Ubuntu的官方仓库中提供了易于安装的包。 <mcreference link="https://ubuntu.com/tutorials/install-jre" index="1">1</mcreference> <mcreference link="https://www.digitalocean.com/community/tutorials/how-to-install-java-with-apt-on-ubuntu-22-04" index="2">2</mcreference>

1.  **更新软件包列表**

    ```shell
    sudo apt update
    ```

2.  **安装默认的JDK (OpenJDK)** <mcreference link="https://www.digitalocean.com/community/tutorials/how-to-install-java-with-apt-on-ubuntu-22-04" index="2">2</mcreference> <mcreference link="https://www.theserverside.com/video/5-steps-for-an-easy-JDK-13-install-on-Ubuntu" index="4">4</mcreference>

    这将安装一个推荐的LTS（长期支持）版本的OpenJDK。
    ```shell
    sudo apt install default-jdk
    ```

3.  **离线安装** <mcreference link="https://openjdk.org/install/" index="7">7</mcreference>

    离线环境安装步骤：
    ```shell
    # 在有网络的机器下载deb包
    wget https://download.java.net/openjdk/jdk11/ri/openjdk-11+28_linux-x64_bin.deb

    # 传输文件到服务器
    scp openjdk-11+28_linux-x64_bin.deb user@server:/tmp

    # 安装依赖（需提前下载）
    sudo dpkg -i libc6_*.deb libstdc++6_*.deb

    # 安装JDK
    sudo dpkg -i /tmp/openjdk-11+28_linux-x64_bin.deb

    # 配置环境变量
    sudo update-alternatives --config java
    ```

    如果你需要安装特定版本的OpenJDK，例如OpenJDK 11，可以使用：
    ```shell
    sudo apt install openjdk-11-jdk
    ```
    或者OpenJDK 17：
    ```shell
    sudo apt install openjdk-17-jdk
    ```

3.  **验证安装** <mcreference link="https://ubuntu.com/tutorials/install-jre" index="1">1</mcreference> <mcreference link="https://www.digitalocean.com/community/tutorials/how-to-install-java-with-apt-on-ubuntu-22-04" index="2">2</mcreference>

    检查Java编译器版本：
    ```shell
    javac -version
    ```
    检查Java运行时版本：
    ```shell
    java -version
    ```

4.  **（可选）配置JAVA_HOME环境变量** <mcreference link="https://www.theserverside.com/video/5-steps-for-an-easy-JDK-13-install-on-Ubuntu" index="4">4</mcreference>

    虽然许多现代Java应用程序不需要显式设置`JAVA_HOME`，但某些旧版应用程序或构建工具可能仍需要它。

    首先，找到Java的安装路径。对于`default-jdk`，它通常是一个指向具体OpenJDK版本的符号链接。可以通过以下命令找到实际路径：
    ```shell
    update-alternatives --config java
    ```
    输出会列出可用的Java版本及其路径。例如，路径可能是 `/usr/lib/jvm/java-11-openjdk-amd64/bin/java`。那么 `JAVA_HOME` 应该是 `/usr/lib/jvm/java-11-openjdk-amd64`。

    编辑 `/etc/environment` 文件来全局设置环境变量：
    ```shell
    sudo nano /etc/environment
    ```
    在文件末尾添加以下行（根据你的实际路径修改）：
    ```
    JAVA_HOME="/usr/lib/jvm/java-11-openjdk-amd64"
    ```
    保存并关闭文件。然后，重新加载环境变量：
    ```shell
    source /etc/environment
    ```
    验证`JAVA_HOME`是否设置成功：
    ```shell
    echo $JAVA_HOME
    ```

5.  **（可选）管理多个Java版本** <mcreference link="https://www.digitalocean.com/community/tutorials/how-to-install-java-with-apt-on-ubuntu-22-04" index="2">2</mcreference>

    如果安装了多个Java版本，可以使用 `update-alternatives` 命令来切换默认版本：
    ```shell
    sudo update-alternatives --config java
    sudo update-alternatives --config javac
    ```
    根据提示选择你想要设置为默认的版本号。

### （四）MongoDB（如有必要）

MongoDB是一个基于分布式文件存储的NoSQL数据库。以下是在Ubuntu上安装MongoDB Community Edition的步骤。 <mcreference link="https://www.mongodb.com/docs/manual/tutorial/install-mongodb-on-ubuntu/" index="1">1</mcreference> <mcreference link="https://www.digitalocean.com/community/tutorials/how-to-install-mongodb-on-ubuntu-20-04" index="2">2</mcreference>

1.  **导入MongoDB的GPG密钥** <mcreference link="https://www.mongodb.com/docs/manual/tutorial/install-mongodb-on-ubuntu/" index="1">1</mcreference> <mcreference link="https://www.mongodb.com/docs/mongodb-shell/install/" index="5">5</mcreference>

    ```shell
    sudo apt-get install gnupg
    curl -fsSL https://pgp.mongodb.com/server-8.0.asc | \
       sudo gpg -o /usr/share/keyrings/mongodb-server-8.0.gpg \
       --dearmor
    ```
    *注意：请根据MongoDB官方文档检查最新的GPG密钥和版本。*

2.  **创建MongoDB的apt源列表文件** <mcreference link="https://www.mongodb.com/docs/manual/tutorial/install-mongodb-on-ubuntu/" index="1">1</mcreference>

    根据你的Ubuntu版本选择对应的命令。例如，对于Ubuntu 22.04 (Jammy Jellyfish)：
    ```shell
    echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-8.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/8.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-8.0.list
    ```
    对于其他Ubuntu版本，请参考MongoDB官方文档替换 `jammy` 部分。

3.  **更新软件包列表并安装MongoDB** <mcreference link="https://www.mongodb.com/docs/manual/tutorial/install-mongodb-on-ubuntu/" index="1">1</mcreference> <mcreference link="https://www.digitalocean.com/community/tutorials/how-to-install-mongodb-on-ubuntu-20-04" index="2">2</mcreference>

    ```shell
    sudo apt-get update
    sudo apt-get install -y mongodb-org
    ```

4.  **启动并验证MongoDB服务** <mcreference link="https://www.mongodb.com/docs/manual/tutorial/install-mongodb-on-ubuntu/" index="1">1</mcreference> <mcreference link="https://www.digitalocean.com/community/tutorials/how-to-install-mongodb-on-ubuntu-20-04" index="2">2</mcreference>

    启动MongoDB服务：
    ```shell
    sudo systemctl start mongod
    ```
    验证服务状态：
    ```shell
    sudo systemctl status mongod
    ```
    如果服务未启动，可以尝试：
    ```shell
    sudo systemctl enable mongod # 设置开机自启动
    sudo systemctl restart mongod
    ```

5.  **连接到MongoDB Shell** <mcreference link="https://www.mongodb.com/docs/manual/tutorial/install-mongodb-on-ubuntu/" index="1">1</mcreference>

    ```shell
    mongosh
    ```

6.  **（可选）配置MongoDB**

    MongoDB的配置文件位于 `/etc/mongod.conf`。你可以根据需要修改配置，例如绑定IP地址以允许远程连接、配置认证等。 <mcreference link="https://www.digitalocean.com/community/tutorials/how-to-install-mongodb-on-ubuntu-20-04" index="2">2</mcreference>
    例如，要允许所有IP连接，可以将 `net.bindIp` 修改为 `0.0.0.0`：
    ```yaml
    # network interfaces
    net:
      port: 27017
      bindIp: 0.0.0.0  # Listen to all interfaces
    ```
    修改配置后，需要重启MongoDB服务：
    ```shell
    sudo systemctl restart mongod
    ```
    *强烈建议在生产环境中启用认证并配置防火墙规则。*

### （五）Redis（如有必要）

Redis是一个开源的内存数据结构存储系统，可用作数据库、缓存和消息代理。 <mcreference link="https://www.digitalocean.com/community/tutorials/how-to-install-and-secure-redis-on-ubuntu-20-04" index="2">2</mcreference>

1.  **更新软件包列表**

    ```shell
    sudo apt update
    ```

2.  **安装Redis服务器** <mcreference link="https://redis.io/docs/latest/operate/oss_and_stack/install/archive/install-redis/install-redis-on-linux/" index="1">1</mcreference> <mcreference link="https://www.digitalocean.com/community/tutorials/how-to-install-and-secure-redis-on-ubuntu-20-04" index="2">2</mcreference>

    ```shell
    sudo apt install redis-server
    ```

3.  **验证安装**

    检查Redis服务状态：
    ```shell
    sudo systemctl status redis-server
    ```
    或者连接到Redis CLI：
    ```shell
    redis-cli
    ping
    ```
    如果返回 `PONG`，则表示连接成功。

4.  **（可选）配置Redis** <mcreference link="https://www.digitalocean.com/community/tutorials/how-to-install-and-secure-redis-on-ubuntu-20-04" index="2">2</mcreference> <mcreference link="https://phoenixnap.com/kb/install-redis-on-ubuntu-20-04" index="3">3</mcreference>

    Redis的配置文件位于 `/etc/redis/redis.conf`。
    一个重要的配置是 `supervised` 指令。由于Ubuntu使用systemd，建议将其设置为 `systemd`：
    ```conf
    supervised systemd
    ```
    修改配置后，重启Redis服务：
    ```shell
    sudo systemctl restart redis-server
    ```
    你还可以配置密码、绑定IP等以增强安全性。

5.  **Redis常用命令**

    ```shell
    sudo systemctl stop redis-server       # 停止Redis服务
    sudo systemctl start redis-server      # 启动Redis服务
    sudo systemctl restart redis-server    # 重启Redis服务
    sudo systemctl enable redis-server     # 设置开机自启动
    sudo systemctl disable redis-server    # 禁止开机自启动
    ```



## 三、准备部署所必需的资源
### （一）数据库

+ 在部署前，需要准备好数据库脚本，包括建库、建表和初始数据。

1. 准备SQL脚本文件

   ```shell
   # 创建存放SQL脚本的目录 (可自定义)
   sudo mkdir -p /opt/deploy/sql
   ```

2. 上传SQL脚本文件

   使用SFTP工具（如FileZilla、WinSCP等）将本地的SQL脚本上传到服务器的`/opt/deploy/sql`目录。

3. 导入数据库脚本

   ```shell
   # 登录MySQL
   sudo mysql -u用户名 -p密码

   # 在MySQL命令行中执行 (假设数据库已创建，如果未创建，请先创建)
   USE 数据库名;
   SOURCE /opt/deploy/sql/create_tables.sql; # 假设这是建表脚本
   SOURCE /opt/deploy/sql/init_data.sql;   # 假设这是初始化数据脚本
   ```
   如果需要创建数据库：
   ```sql
   CREATE DATABASE 数据库名 CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

### （二）前端打包

+ 前端项目通常需要打包后部署到Nginx服务器上。

1. 准备前端打包文件

   在本地开发环境中，使用构建工具（如npm、yarn等）打包前端项目：

   ```shell
   # 在前端项目目录中执行
   npm run build  # 或 yarn build，具体命令根据项目配置
   ```

2. 上传打包文件

   使用SFTP工具将打包生成的文件（通常在`dist`或`build`目录）上传到服务器。

   ```shell
   # 在服务器上创建存放前端文件的目录 (可自定义，需与Nginx配置对应)
   sudo mkdir -p /var/www/html/mywebsite
   ```

3. 解压前端文件（如果是压缩包）

   ```shell
   # 假设上传的是 frontend.zip
   sudo apt install unzip # 如果没有unzip命令，先安装
   sudo unzip frontend.zip -d /var/www/html/mywebsite
   ```
   如果直接上传的是文件夹内容，则跳过解压步骤。

### （三）后端打包

+ 后端Java项目通常打包为JAR或WAR文件部署。

1. 准备后端打包文件

   在本地开发环境中，使用Maven或Gradle打包后端项目：

   ```shell
   # Maven打包
   mvn clean package -Dmaven.test.skip=true

   # 或Gradle打包
   gradle build -x test
   ```

2. 上传后端JAR/WAR文件

   ```shell
   # 在服务器上创建存放后端文件的目录 (可自定义)
   sudo mkdir -p /opt/deploy/backend
   ```
   使用SFTP工具将JAR或WAR文件上传到服务器的`/opt/deploy/backend`目录。

3. 准备配置文件

   ```shell
   # 创建配置文件目录
   sudo mkdir -p /opt/deploy/backend/config

   # 创建应用配置文件 (例如 application.yml 或 application.properties)
   sudo nano /opt/deploy/backend/config/application.yml
   ```

   配置文件示例 (`application.yml`)：

   ```yaml
   server:
     port: 8080

   spring:
     datasource:
       url: jdbc:mysql://localhost:3306/mydb?useUnicode=true&characterEncoding=utf8&serverTimezone=Asia/Shanghai
       username: dbuser
       password: dbpassword
       driver-class-name: com.mysql.cj.jdbc.Driver
     
     # Redis配置（如果使用）
     redis:
       host: localhost
       port: 6379
       # password: your_redis_password # 如果设置了密码
       database: 0
       
     # MongoDB配置（如果使用）
     data:
       mongodb:
         uri: mongodb://user:password@localhost:27017/mydb
         
     # RabbitMQ配置（如果使用，请先安装）
     # rabbitmq:
     #   host: localhost
     #   port: 5672
     #   username: admin
     #   password: password
     #   virtual-host: /
   ```

## 四、部署资源并调试
### （一）数据库

1. 验证数据库连接

   ```shell
   # 连接MySQL数据库
   sudo mysql -u用户名 -p密码 -h数据库主机(通常是localhost) 数据库名

   # 查看数据库表
   SHOW TABLES;

   # 查看表数据
   SELECT * FROM 表名 LIMIT 10;
   ```

2. 检查数据库字符集

   ```shell
   # 在MySQL命令行中执行
   SHOW VARIABLES LIKE 'character_set%';
   SHOW VARIABLES LIKE 'collation%';
   ```
   确保字符集设置正确（例如 `utf8mb4`），以避免乱码问题。

### （二）前端

1. 配置Nginx虚拟主机

   确保Nginx配置文件已正确设置（参考前面的Nginx安装与配置部分）。
   一个简单的Nginx配置示例，用于托管静态前端资源 (例如在 `/etc/nginx/sites-available/mywebsite`):
   ```nginx
   server {
       listen 80;
       server_name your_domain_or_ip; # 替换为你的域名或IP

       root /var/www/html/mywebsite; # 前端文件存放路径
       index index.html index.htm;

       location / {
           try_files $uri $uri/ /index.html;
       }

       # 可选：配置API反向代理 (如果后端服务在不同端口或主机)
       # location /api/ {
       #     proxy_pass http://localhost:8080/api/; # 后端API地址
       #     proxy_set_header Host $host;
       #     proxy_set_header X-Real-IP $remote_addr;
       #     proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
       #     proxy_set_header X-Forwarded-Proto $scheme;
       # }

       access_log /var/log/nginx/mywebsite.access.log;
       error_log /var/log/nginx/mywebsite.error.log;
   }
   ```
   创建软链接以启用配置：
   ```shell
   sudo ln -s /etc/nginx/sites-available/mywebsite /etc/nginx/sites-enabled/
   sudo nginx -t # 测试配置是否正确
   ```

2. 检查文件权限

   ```shell
   # 确保Nginx运行用户(通常是www-data)有权限访问前端文件
   sudo chown -R www-data:www-data /var/www/html/mywebsite
   sudo chmod -R 755 /var/www/html/mywebsite
   ```

3. 重启Nginx服务

   ```shell
   sudo systemctl restart nginx
   ```

4. 测试前端访问

   在浏览器中访问服务器IP或域名，检查前端页面是否正常显示。

### （三）后端 (以Java Spring Boot应用为例)

1. 创建启动脚本

   ```shell
   # 创建启动脚本 (例如 /opt/deploy/backend/start.sh)
   sudo nano /opt/deploy/backend/start.sh
   ```
   添加以下内容 (根据实际情况修改 `APP_NAME` 和路径)：
   ```bash
   #!/bin/bash
   JAVA_OPTS="-Xms512m -Xmx1024m -XX:MetaspaceSize=128m -XX:MaxMetaspaceSize=256m"
   APP_NAME="your-app-name.jar" # 替换为你的JAR文件名
   APP_PATH="/opt/deploy/backend"
   CONFIG_PATH="$APP_PATH/config/application.yml" # 配置文件路径
   LOG_FILE="$APP_PATH/app.log"
   PID_FILE="$APP_PATH/app.pid"

   cd $APP_PATH

   if [ -f $PID_FILE ]; then
       PID=$(cat $PID_FILE)
       if ps -p $PID > /dev/null; then
           echo "Application is already running with PID: $PID"
           exit 1
       else
           echo "PID file exists but process is not running. Removing PID file."
           rm -f $PID_FILE
       fi
   fi

   echo "Starting application $APP_NAME..."
   nohup java $JAVA_OPTS -jar $APP_NAME --spring.config.location=file:$CONFIG_PATH > $LOG_FILE 2>&1 &
   echo $! > $PID_FILE
   echo "Application started. PID: $(cat $PID_FILE). Log: $LOG_FILE"
   ```

2. 创建停止脚本

   ```shell
   # 创建停止脚本 (例如 /opt/deploy/backend/stop.sh)
   sudo nano /opt/deploy/backend/stop.sh
   ```
   添加以下内容：
   ```bash
   #!/bin/bash
   APP_PATH="/opt/deploy/backend"
   PID_FILE="$APP_PATH/app.pid"

   if [ ! -f "$PID_FILE" ]; then
       echo "PID file not found. Application may not be running."
       exit 1
   fi

   PID=$(cat $PID_FILE)
   if ! ps -p $PID > /dev/null; then
       echo "Process with PID $PID not found. Removing stale PID file."
       rm -f $PID_FILE
       exit 1
   fi

   echo "Stopping application with PID: $PID..."
   kill $PID

   # 等待进程停止
   count=0
   while ps -p $PID > /dev/null; do
       sleep 1
       count=$((count + 1))
       if [ $count -gt 10 ]; then # 最多等待10秒
           echo "Application did not stop gracefully after 10 seconds. Forcing kill..."
           kill -9 $PID
           break
       fi
   done

   if ! ps -p $PID > /dev/null; then
       echo "Application stopped successfully."
   else
       echo "Failed to stop application."
   fi

   rm -f $PID_FILE
   ```

3. 设置脚本权限

   ```shell
   sudo chmod +x /opt/deploy/backend/start.sh
   sudo chmod +x /opt/deploy/backend/stop.sh
   ```

4. 启动后端应用

   ```shell
   # 启动应用
   sudo /opt/deploy/backend/start.sh

   # 查看启动日志
   tail -f /opt/deploy/backend/app.log
   ```

### （四）调试

1. 检查应用状态

   ```shell
   # 检查后端应用进程
   ps -ef | grep java

   # 检查端口监听情况 (例如后端应用监听8080端口)
   sudo netstat -tulnp | grep 8080

   # 检查Nginx进程
   ps -ef | grep nginx

   # 检查Nginx端口 (通常是80或443)
   sudo netstat -tulnp | grep 80
   ```

2. 检查日志

   ```shell
   # 查看后端应用日志
   tail -f /opt/deploy/backend/app.log

   # 查看Nginx访问日志 (路径可能因配置而异)
   tail -f /var/log/nginx/mywebsite.access.log
   tail -f /var/log/nginx/access.log

   # 查看Nginx错误日志 (路径可能因配置而异)
   tail -f /var/log/nginx/mywebsite.error.log
   tail -f /var/log/nginx/error.log
   ```

3. 测试API接口

   ```shell
   # 使用curl测试后端API (假设后端运行在localhost:8080)
   curl -X GET http://localhost:8080/api/test

   # 带参数的POST请求
   curl -X POST -H "Content-Type: application/json" -d '{"key":"value"}' http://localhost:8080/api/data
   ```
   如果Nginx配置了反向代理，可以通过Nginx访问API：
   ```shell
   curl -X GET http://your_domain_or_ip/api/test
   ```

4. 常见问题排查

   - **前端访问404/50x**：检查Nginx配置、前端文件路径、文件权限、Nginx日志。
   - **后端无法启动**：检查Java版本、内存设置 (`JAVA_OPTS`)、配置文件路径和内容、后端应用日志。
   - **数据库连接失败**：检查后端配置文件中的数据库连接信息（地址、端口、用户名、密码、数据库名）、MySQL用户权限、MySQL服务是否运行、防火墙设置（如`ufw`是否允许3306端口）。
   - **API请求失败/无响应**：检查后端应用是否正常运行、端口是否监听、Nginx反向代理配置是否正确、后端日志是否有错误信息。
   - **跨域问题 (CORS)**：如果前端和后端部署在不同源（域名、端口），后端需要配置CORS策略，或者通过Nginx反向代理解决。
   - **防火墙**：确保服务器防火墙（如`ufw`）允许了Nginx (80, 443)、后端应用 (如8080)、数据库 (如3306) 等所需服务的端口。
     ```shell
     sudo ufw status # 查看防火墙状态和规则
     sudo ufw allow 80/tcp
     sudo ufw allow 443/tcp
     sudo ufw allow 8080/tcp # 示例后端端口
     sudo ufw enable # 启用防火墙 (如果未启用)
     sudo ufw reload # 重载规则
     ```

## 五、总结

本文详细介绍了在Ubuntu服务器上部署一个完整网页系统的主要步骤，从最初的环境准备，到核心软件MySQL、Nginx、JDK的安装与配置，再到可选的MongoDB和Redis的安装，最后覆盖了前后端资源的准备、部署和基础调试方法。笔者力求提供一套清晰、实用的操作指南。

部署过程中，务必注意各个软件版本之间的兼容性，以及配置文件中路径、端口、用户凭据的准确性。日志文件是排查问题的最重要工具，无论是Nginx的访问/错误日志，还是后端应用的运行日志，都能提供关键线索。

此外，安全是生产环境部署中不可忽视的一环。建议进一步配置防火墙规则、数据库安全策略、定期备份数据，并对应用进行安全加固。希望本笔记能为您的部署工作带来帮助。

## 六、参考链接

- [Ubuntu 官方文档](https://ubuntu.com/server/docs)
- [MySQL 官方文档](https://dev.mysql.com/doc/)
- [Nginx 官方文档](https://nginx.org/en/docs/)
- [OpenJDK 官方站点](https://openjdk.java.net/)
- [MongoDB 官方文档](https://www.mongodb.com/docs/)
- [Redis 官方文档](https://redis.io/docs/)

1. 检查应用状态

   ```shell
   # 检查后端应用进程
   ps -ef | grep java

   # 检查端口监听情况 (例如后端应用监听8080端口)
   sudo netstat -tulnp | grep 8080

   # 检查Nginx进程
   ps -ef | grep nginx

   # 检查Nginx端口 (通常是80或443)
   sudo netstat -tulnp | grep 80
   ```

2. 检查日志

   ```shell
   # 查看后端应用日志
   tail -f /opt/deploy/backend/app.log

   # 查看Nginx访问日志 (路径可能因配置而异)
   tail -f /var/log/nginx/mywebsite.access.log
   tail -f /var/log/nginx/access.log

   # 查看Nginx错误日志 (路径可能因配置而异)
   tail -f /var/log/nginx/mywebsite.error.log
   tail -f /var/log/nginx/error.log
   ```

3. 测试API接口

   ```shell
   # 使用curl测试后端API (假设后端运行在localhost:8080)
   curl -X GET http://localhost:8080/api/test

   # 带参数的POST请求
   curl -X POST -H "Content-Type: application/json" -d '{"key":"value"}' http://localhost:8080/api/data
   ```
   如果Nginx配置了反向代理，可以通过Nginx访问API：
   ```shell
   curl -X GET http://your_domain_or_ip/api/test
   ```

4. 常见问题排查

   - **前端访问404/50x**：检查Nginx配置、前端文件路径、文件权限、Nginx日志。
   - **后端无法启动**：检查Java版本、内存设置 (`JAVA_OPTS`)、配置文件路径和内容、后端应用日志。
   - **数据库连接失败**：检查后端配置文件中的数据库连接信息（地址、端口、用户名、密码、数据库名）、MySQL用户权限、MySQL服务是否运行、防火墙设置（如`ufw`是否允许3306端口）。
   - **API请求失败/无响应**：检查后端应用是否正常运行、端口是否监听、Nginx反向代理配置是否正确、后端日志是否有错误信息。
   - **跨域问题 (CORS)**：如果前端和后端部署在不同源（域名、端口），后端需要配置CORS策略，或者通过Nginx反向代理解决。
   - **防火墙**：确保服务器防火墙（如`ufw`）允许了Nginx (80, 443)、后端应用 (如8080)、数据库 (如3306) 等所需服务的端口。
     ```shell
     sudo ufw status # 查看防火墙状态和规则
     sudo ufw allow 80/tcp
     sudo ufw allow 443/tcp
     sudo ufw allow 8080/tcp # 示例后端端口
     sudo ufw enable # 启用防火墙 (如果未启用)
     sudo ufw reload # 重载规则
     ```