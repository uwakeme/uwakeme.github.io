---
title: 【LINUX】在一台空服务器上部署网页系统
categories: LINUX
tags:
  - 虚拟机
  - 部署
  - LINUX
  - Java
  - NGINX
date: 2024-12-16
---
## 一、准备环境
+ 首先要看服务器是什么系统，笔者所用的是Centos7系统，所以以下也是在Centos7下的操作。
+ 如果是Ubantu可以参考最后的链接
+ 查看服务器信息

  ```shell
  uname -a          # 查看系统内核信息
  lsb_release -a    # 如果是 Linux 系统，查看发行版本
  df -h             # 查看磁盘空间
  free -m           # 查看内存使用情况
  ```

+ 虽然说是空环境，但是在服务器上面可能还有很多东西需要配置、安装，比如yum配置源等。

+ 检查软件安装状态：

  ```shell
  mysql --version    # 检查 MySQL 是否已安装
  nginx -v           # 检查 Nginx 是否已安装
  java -version      # 检查 Java 是否已安装
  ```

## 二、安装部署所需的软件

+ 本次部署的服务器可以连接互联网，所以本次部署采用的安装也是**在线安装**。
+ 如果发现yum安装依赖时连接失败或安装错误，可以查询一下看看是不是yum源没有配置。
### （一）MySQL

+ MySQL是一个关系型数据库管理系统，是网站系统中常用的数据库软件。

1. 安装MySQL服务器

```shell
# 安装MySQL官方的yum源
wget https://dev.mysql.com/get/mysql80-community-release-el7-3.noarch.rpm

# 安装rpm包
rpm -ivh mysql80-community-release-el7-3.noarch.rpm

# 安装MySQL服务器
yum install -y mysql-server

# 离线安装步骤（适用于无网络环境）
# 1. 在有网络的机器下载所需rpm包：
# repotrack mysql-server mysql-client
# 2. 将rpm包传输到服务器
# 3. 创建本地yum源：
# mkdir /local_repo
# cp *.rpm /local_repo
# createrepo /local_repo
# 4. 配置本地源：
# cat > /etc/yum.repos.d/mysql-local.repo << EOF
# [mysql-local]
# name=MySQL Local Repo
# baseurl=file:///local_repo
# enabled=1
# gpgcheck=0
# EOF
# 5. 清除缓存并安装：
# yum clean all
# yum install -y mysql-server

# 启动MySQL服务
systemctl start mysqld

# 设置开机自启动
systemctl enable mysqld

# 查看MySQL状态
systemctl status mysqld
```

2. 配置MySQL

```shell
# 查看MySQL初始密码
grep 'temporary password' /var/log/mysqld.log

# 登录MySQL
mysql -uroot -p

# 修改密码（在MySQL命令行中执行）
ALTER USER 'root'@'localhost' IDENTIFIED BY '新密码';

# 创建远程访问用户（在MySQL命令行中执行）
CREATE USER '用户名'@'%' IDENTIFIED BY '密码';
GRANT ALL PRIVILEGES ON *.* TO '用户名'@'%';
FLUSH PRIVILEGES;
```

3. 配置MySQL安全设置

```shell
# 运行安全配置脚本
mysql_secure_installation
```

按照提示进行配置：
- 设置root密码复杂度
- 删除匿名用户
- 禁止root远程登录
- 删除测试数据库
- 重新加载权限表

4. 调整MySQL配置文件

```shell
# 编辑配置文件
vi /etc/my.cnf
```

添加或修改以下配置：

```
[mysqld]
character-set-server=utf8mb4
collation-server=utf8mb4_unicode_ci
default-storage-engine=INNODB
max_connections=1000
innodb_buffer_pool_size=1G
```

重启MySQL使配置生效：

```shell
systemctl restart mysqld
```

### （二）NGINX

+ Nginx是一个高性能的HTTP和反向代理服务器，常用于部署前端应用和反向代理后端服务。

#### 1. 本地仓库安装（推荐批量部署）

1. 安装Nginx

```shell
# 安装Nginx的yum源
cat > /etc/yum.repos.d/nginx.repo << EOF
[nginx]
name=nginx repo
baseurl=https://nginx.org/packages/centos/7/\$basearch/
gpgcheck=0
enabled=1
EOF

# 安装Nginx
yum install -y nginx

# 离线安装方法（适用于无网络环境）：
# 1. 在有网络的设备下载完整rpm包：
# reposync --repoid=nginx -p /path/to/download
# 2. 创建本地仓库：
# createrepo /path/to/download/nginx
# 3. 配置本地源：
# cat > /etc/yum.repos.d/nginx-local.repo << EOF
# [nginx-local]
# name=nginx local repository
# baseurl=file:///path/to/download/nginx
# enabled=1
# gpgcheck=0
# EOF
# 4. 清除缓存并安装：
# yum clean all
# yum install -y nginx

# 启动Nginx
systemctl start nginx

# 设置开机自启动
systemctl enable nginx

# 查看Nginx状态
systemctl status nginx
```

#### 2. 离线安装Nginx（使用tar.gz包）

```shell
# 准备工作：在有网络的机器上下载Nginx
# 下载地址：http://nginx.org/download/nginx-1.20.2.tar.gz

# 1. 安装编译所需的依赖包
yum install -y gcc gcc-c++ make pcre pcre-devel zlib zlib-devel openssl openssl-devel

# 2. 将下载好的nginx-1.20.2.tar.gz上传到服务器

# 3. 解压安装包
tar -zxvf nginx-1.20.2.tar.gz
cd nginx-1.20.2

# 4. 配置安装选项
./configure --prefix=/usr/local/nginx \
--with-http_ssl_module \
            --with-http_stub_status_module \
--with-http_gzip_static_module

# 5. 编译安装
make && make install

# 6. 创建软链接
ln -s /usr/local/nginx/sbin/nginx /usr/bin/nginx

# 7. 创建systemd服务文件
cat > /etc/systemd/system/nginx.service << EOF
[Unit]
Description=The NGINX HTTP and reverse proxy server
After=network.target remote-fs.target nss-lookup.target

[Service]
Type=forking
PIDFile=/usr/local/nginx/logs/nginx.pid
ExecStartPre=/usr/local/nginx/sbin/nginx -t
ExecStart=/usr/local/nginx/sbin/nginx
ExecReload=/usr/local/nginx/sbin/nginx -s reload
ExecStop=/bin/kill -s QUIT \$MAINPID
PrivateTmp=true

[Install]
WantedBy=multi-user.target
EOF

# 8. 重新加载systemd配置
systemctl daemon-reload

# 9. 启动Nginx
systemctl start nginx

# 10. 设置开机自启动
systemctl enable nginx

# 11. 查看Nginx状态
systemctl status nginx
```

2. 配置防火墙（如果开启了防火墙）

```shell
# 开放80端口
firewall-cmd --permanent --add-port=80/tcp

# 开放443端口（如果需要HTTPS）
firewall-cmd --permanent --add-port=443/tcp

# 重新加载防火墙配置
firewall-cmd --reload
```

3. 配置Nginx

```shell
# 编辑Nginx主配置文件
vi /etc/nginx/nginx.conf
```

基本配置示例：

```
user  nginx;
worker_processes  auto;

error_log  /var/log/nginx/error.log warn;
pid        /var/run/nginx.pid;

events {
    worker_connections  1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    log_format  main  '$remote_addr - $remote_user [$time_local] "$request" '
                      '$status $body_bytes_sent "$http_referer" '
                      '"$http_user_agent" "$http_x_forwarded_for"';

    access_log  /var/log/nginx/access.log  main;

    sendfile        on;
    tcp_nopush      on;
    tcp_nodelay     on;
    keepalive_timeout  65;
    types_hash_max_size 2048;
    gzip  on;

    include /etc/nginx/conf.d/*.conf;
}
```

4. 创建网站配置文件

```shell
# 创建网站配置文件
vi /etc/nginx/conf.d/mywebsite.conf
```

配置示例：

```
server {
    listen       80;
    server_name  example.com www.example.com;

    # 前端静态文件目录
    location / {
        root   /usr/share/nginx/html/mywebsite;
        index  index.html index.htm;
        try_files $uri $uri/ /index.html;
    }

    # 后端API代理
    location /api/ {
        proxy_pass http://localhost:8080/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # 错误页面
    error_page   500 502 503 504  /50x.html;
    location = /50x.html {
        root   /usr/share/nginx/html;
    }
}
```

5. 测试配置并重启Nginx

```shell
# 测试配置文件语法
nginx -t

# 重新加载配置
systemctl reload nginx
```

### （三）JDK

+ JDK（Java Development Kit）是Java开发工具包，用于运行Java应用程序。

#### 1. 在线安装OpenJDK（推荐）

```shell
# 查看可用的JDK版本
yum list available java*

# 安装JDK 11（推荐版本）
yum install -y java-11-openjdk-devel

# 验证安装
java -version
javac -version
```

#### 2. 离线安装JDK（使用tar.gz包）

```shell
# 准备工作：在Oracle官网下载JDK安装包
# 下载地址：https://www.oracle.com/java/technologies/javase-downloads.html
# 选择JDK 11或JDK 8的Linux x64 tar.gz版本

# 1. 将下载好的jdk-11.0.14_linux-x64_bin.tar.gz上传到服务器

# 2. 创建安装目录
mkdir -p /usr/local/java

# 3. 解压JDK到安装目录
tar -zxvf jdk-11.0.14_linux-x64_bin.tar.gz -C /usr/local/java/

# 4. 设置环境变量
cat > /etc/profile.d/java.sh << EOF
export JAVA_HOME=/usr/local/java/jdk-11.0.14
export PATH=\$PATH:\$JAVA_HOME/bin
export CLASSPATH=.:\$JAVA_HOME/lib/dt.jar:\$JAVA_HOME/lib/tools.jar
EOF

# 5. 使环境变量生效
source /etc/profile.d/java.sh

# 6. 验证安装
java -version
javac -version

# 7. 设置系统默认Java
alternatives --install /usr/bin/java java \$JAVA_HOME/bin/java 1
alternatives --install /usr/bin/javac javac \$JAVA_HOME/bin/javac 1
alternatives --install /usr/bin/jar jar \$JAVA_HOME/bin/jar 1
```

2. 配置Java环境变量

```shell
# 编辑环境变量配置文件
vi /etc/profile.d/java.sh
```

添加以下内容：

```shell
export JAVA_HOME=$(dirname $(dirname $(readlink -f $(which java))))
export PATH=$PATH:$JAVA_HOME/bin
export CLASSPATH=.:$JAVA_HOME/lib/dt.jar:$JAVA_HOME/lib/tools.jar
```

使环境变量生效：

```shell
source /etc/profile.d/java.sh
```

3. 验证环境变量

```shell
echo $JAVA_HOME
java -version
```

### （四）MongoDB（如有必要）

+ MongoDB是一个基于分布式文件存储的NoSQL数据库。

1. 安装MongoDB

```shell
# 创建MongoDB的yum源
cat > /etc/yum.repos.d/mongodb-org.repo << EOF
[mongodb-org-4.4]
name=MongoDB Repository
baseurl=https://repo.mongodb.org/yum/redhat/7/mongodb-org/4.4/x86_64/
gpgcheck=1
enabled=1
gpgkey=https://www.mongodb.org/static/pgp/server-4.4.asc
EOF

# 安装MongoDB
yum install -y mongodb-org

# 启动MongoDB服务
systemctl start mongod

# 设置开机自启动
systemctl enable mongod

# 查看MongoDB状态
systemctl status mongod
```

2. 配置MongoDB

```shell
# 编辑MongoDB配置文件
vi /etc/mongod.conf
```

修改以下配置：

```yaml
# 网络设置
net:
  port: 27017
  bindIp: 127.0.0.1  # 改为0.0.0.0允许远程连接

# 安全设置
security:
  authorization: enabled  # 启用访问控制
```

3. 创建管理员用户

```shell
# 连接到MongoDB
mongo

# 在MongoDB shell中执行
use admin
db.createUser(
  {
    user: "adminUser",
    pwd: "password",
    roles: [ { role: "userAdminAnyDatabase", db: "admin" }, "readWriteAnyDatabase" ]
  }
)
```

4. 重启MongoDB使配置生效

```shell
systemctl restart mongod
```

### （五）Redis（如有必要）

+ Redis是一个开源的内存数据库，常用于缓存、会话存储等场景。

1. 安装Redis

```shell
# 安装EPEL源
yum install -y epel-release

# 安装Redis
yum install -y redis

# 启动Redis服务
systemctl start redis

# 设置开机自启动
systemctl enable redis

# 查看Redis状态
systemctl status redis
```

2. 配置Redis

```shell
# 编辑Redis配置文件
vi /etc/redis.conf
```

修改以下配置：

```
# 绑定地址（默认只允许本地访问）
bind 127.0.0.1

# 设置密码
requirepass yourpassword

# 持久化设置
save 900 1
save 300 10
save 60 10000

# 最大内存使用
maxmemory 256mb
maxmemory-policy allkeys-lru
```

3. 重启Redis使配置生效

```shell
systemctl restart redis
```

4. 测试Redis连接

```shell
redis-cli
auth yourpassword
ping  # 应返回PONG
```

### （六）RabbitMQ（如有必要）

+ RabbitMQ是一个开源的消息队列服务器，用于应用程序之间的通信。

1. 安装Erlang（RabbitMQ依赖）

```shell
# 查看EPEL仓库中可用的Erlang版本
yum info erlang

# 输出示例：
# Name        : erlang
# Arch        : x86_64
# Version     : R16B
# Release     : 03.18.el7
# ...
```

EPEL仓库提供的Erlang版本为R16B-03.18.el7，这个版本非常旧（发布于2013年左右），而现代版本的RabbitMQ（如3.10.0+）需要至少Erlang 23.2或更高版本。这就是为什么使用EPEL仓库安装的Erlang后，再安装RabbitMQ时会报错：`Requires: erlang >= 23.2`。

解决方案是完全卸载旧版本并安装新版本：

```shell
# 完全卸载旧版本Erlang
yum remove -y erlang erlang-*

# 方法二：使用RabbitMQ官方提供的Erlang仓库（推荐）
# 配置Erlang解决方案仓库
curl -s https://packagecloud.io/install/repositories/rabbitmq/erlang/script.rpm.sh | sudo bash

# 或者手动添加仓库
cat > /etc/yum.repos.d/rabbitmq-erlang.repo << EOF
[rabbitmq-erlang]
name=rabbitmq-erlang
baseurl=https://packagecloud.io/rabbitmq/erlang/el/7/\$basearch
gpgcheck=1
gpgkey=https://packagecloud.io/rabbitmq/erlang/gpgkey
repo_gpgcheck=0
enabled=1
EOF

# 导入所有相关GPG密钥（包括PackageCloud的主要密钥和特定仓库密钥）
rpm --import https://packagecloud.io/rabbitmq/erlang/gpgkey
rpm --import https://packagecloud.io/gpg.key
rpm --import https://github.com/rabbitmq/signing-keys/releases/download/2.0/rabbitmq-release-signing-key.asc

# 刷新yum缓存，使新添加的仓库生效
yum clean all
yum makecache

# 确认可安装的Erlang版本（应该会显示23.x或更高版本）
yum info erlang

# 安装新版Erlang
yum install -y erlang

# **推荐方案**：如果GPG密钥验证仍然出错，可以使用以下命令忽略GPG检查安装
yum install -y --nogpgcheck erlang

# 验证安装的Erlang版本（应该是23.x或更高版本）
erl -version

# 备选方案：如果仍然遇到问题，可以直接下载Erlang RPM包安装
# 下载特定版本的Erlang RPM包
wget https://github.com/rabbitmq/erlang-rpm/releases/download/v23.3.4.11/erlang-23.3.4.11-1.el7.x86_64.rpm

# 使用rpm命令直接安装，忽略依赖和GPG验证
rpm -ivh --nodeps erlang-23.3.4.11-1.el7.x86_64.rpm
```

2. 安装RabbitMQ

安装完新版Erlang后，可以继续安装RabbitMQ：

```shell
# 添加RabbitMQ仓库
curl -s https://packagecloud.io/install/repositories/rabbitmq/rabbitmq-server/script.rpm.sh | sudo bash

# 或手动配置RabbitMQ仓库
cat > /etc/yum.repos.d/rabbitmq.repo << EOF
[rabbitmq_rabbitmq-server]
name=rabbitmq_rabbitmq-server
baseurl=https://packagecloud.io/rabbitmq/rabbitmq-server/el/7/\$basearch
gpgcheck=1
enabled=1
gpgkey=https://packagecloud.io/rabbitmq/rabbitmq-server/gpgkey
EOF

# 导入所有相关GPG密钥（包括PackageCloud的主要密钥和特定仓库密钥）
rpm --import https://packagecloud.io/rabbitmq/rabbitmq-server/gpgkey
rpm --import https://packagecloud.io/gpg.key
rpm --import https://github.com/rabbitmq/signing-keys/releases/download/2.0/rabbitmq-release-signing-key.asc

# 清除YUM缓存
yum clean all
# 重建缓存
yum makecache

# 安装RabbitMQ 3.8.x（与Erlang 23.x兼容性最好）
yum install -y rabbitmq-server-3.8.9

# **推荐方案**：如果GPG密钥验证仍然出错，可以使用以下命令忽略GPG检查安装
yum install -y --nogpgcheck rabbitmq-server-3.8.9

# 如果上述命令无法找到特定版本，可以使用以下命令列出可用版本
# yum list --showduplicates rabbitmq-server
```

3. 启动RabbitMQ服务并配置

```shell
# 启动RabbitMQ服务
systemctl start rabbitmq-server

# 设置开机自启动
systemctl enable rabbitmq-server

# 查看RabbitMQ状态
systemctl status rabbitmq-server
```

4. 启用RabbitMQ管理插件

```shell
# 启用RabbitMQ管理界面插件
rabbitmq-plugins enable rabbitmq_management

# 重启RabbitMQ服务以应用更改
systemctl restart rabbitmq-server
```

完成后，可以通过浏览器访问RabbitMQ管理界面：http://服务器IP:15672

5. 创建RabbitMQ管理用户

```shell
# 创建管理员用户（将 'admin' 和 'password' 替换为您想要的用户名和密码）
rabbitmqctl add_user admin password

# 设置用户角色为管理员
rabbitmqctl set_user_tags admin administrator

# 设置用户权限（允许访问所有虚拟主机）
rabbitmqctl set_permissions -p / admin ".*" ".*" ".*"

# 列出所有用户
rabbitmqctl list_users
```

6. 创建应用程序专用用户

```shell
# 创建应用程序使用的用户
rabbitmqctl add_user app_user app_password

# 设置为普通用户（不需要管理权限）
rabbitmqctl set_user_tags app_user

# 设置用户权限
rabbitmqctl set_permissions -p / app_user ".*" ".*" ".*"
```

7. 管理虚拟主机

```shell
# 创建新的虚拟主机
rabbitmqctl add_vhost my_vhost

# 为用户设置特定虚拟主机的权限
rabbitmqctl set_permissions -p my_vhost app_user ".*" ".*" ".*"

# 列出所有虚拟主机
rabbitmqctl list_vhosts
```

8. 常见命令和操作

```shell
# 查看RabbitMQ状态
rabbitmqctl status

# 查看集群状态
rabbitmqctl cluster_status

# 列出所有队列
rabbitmqctl list_queues

# 列出所有交换机
rabbitmqctl list_exchanges

# 列出所有绑定
rabbitmqctl list_bindings

# 查看特定虚拟主机中的所有队列
rabbitmqctl list_queues -p my_vhost

# 删除用户
rabbitmqctl delete_user username

# 修改用户密码
rabbitmqctl change_password username newpassword

# 删除虚拟主机
rabbitmqctl delete_vhost vhost_name

# 清除特定队列的消息
rabbitmqctl purge_queue queue_name
```

9. 设置防火墙规则（如果启用了防火墙）

```shell
# 开放RabbitMQ管理界面端口
firewall-cmd --permanent --add-port=15672/tcp

# 开放RabbitMQ消息传递端口
firewall-cmd --permanent --add-port=5672/tcp

# 重新加载防火墙配置
firewall-cmd --reload
```

10. 故障排查

```shell
# 查看RabbitMQ日志
tail -f /var/log/rabbitmq/rabbit@$(hostname -s).log

# 查看系统日志中的RabbitMQ相关条目
  journalctl -u rabbitmq-server
  
# 检查RabbitMQ进程
ps aux | grep rabbit

# 检查RabbitMQ的端口是否正在监听
ss -tunlp | grep 5672
  ss -tunlp | grep 15672
  ```

11. 解决常见登录问题

```shell
# 问题：User can only log in via localhost

# 这个问题通常发生在使用默认的guest用户远程登录时
# RabbitMQ 3.3.0及以后版本出于安全考虑，默认的guest用户只允许从localhost登录

# 解决方案1：创建新的管理员用户
rabbitmqctl add_user admin strong_password
rabbitmqctl set_user_tags admin administrator
rabbitmqctl set_permissions -p / admin ".*" ".*" ".*"

# 解决方案2：修改RabbitMQ配置允许guest用户远程登录（不推荐，安全风险）
# 编辑配置文件
vi /etc/rabbitmq/rabbitmq.conf
# 如果不存在此文件，则创建它
touch /etc/rabbitmq/rabbitmq.conf

# 添加以下配置行
# loopback_users = none

# 或者使用以下命令一次性创建/修改配置
cat > /etc/rabbitmq/rabbitmq.conf << EOF
loopback_users = none
EOF

# 重启RabbitMQ服务
systemctl restart rabbitmq-server
  
# 解决方案3：临时允许guest用户远程登录（不创建rabbitmq.conf文件）
rabbitmqctl eval 'application:set_env(rabbit, loopback_users, []).'
# 重启服务使更改生效
systemctl restart rabbitmq-server
```

## 三、准备部署所必需的资源
### （一）数据库

+ 在部署前，需要准备好数据库脚本，包括建库、建表和初始数据。

1. 准备SQL脚本文件

```shell
# 创建存放SQL脚本的目录
mkdir -p /opt/deploy/sql
```

2. 上传SQL脚本文件

可以使用SFTP工具（如FileZilla、WinSCP等）将本地的SQL脚本上传到服务器的`/opt/deploy/sql`目录。

3. 导入数据库脚本

```shell
# 登录MySQL
mysql -u用户名 -p密码

# 在MySQL命令行中执行
source /opt/deploy/sql/create_database.sql
source /opt/deploy/sql/create_tables.sql
source /opt/deploy/sql/init_data.sql
```

### （二）前端打包

+ 前端项目通常需要打包后部署到Nginx服务器上。

1. 准备前端打包文件

在本地开发环境中，使用构建工具（如npm、yarn等）打包前端项目：

```shell
# 在前端项目目录中执行
npm run build
```

2. 上传打包文件

使用SFTP工具将打包生成的文件（通常在dist或build目录）上传到服务器：

```shell
# 在服务器上创建存放前端文件的目录
mkdir -p /usr/share/nginx/html/mywebsite
```

3. 解压前端文件（如果是压缩包）

```shell
# 解压前端文件到Nginx目录
unzip frontend.zip -d /usr/share/nginx/html/mywebsite
```

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

2. 上传后端JAR文件

```shell
# 在服务器上创建存放后端文件的目录
mkdir -p /opt/deploy/backend
```

使用SFTP工具将JAR文件上传到服务器的`/opt/deploy/backend`目录。

3. 准备配置文件

```shell
# 创建配置文件目录
mkdir -p /opt/deploy/backend/config

# 创建应用配置文件
vi /opt/deploy/backend/config/application.yml
```

配置文件示例：

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
    password: redispassword
    database: 0
    
  # MongoDB配置（如果使用）
  data:
    mongodb:
      uri: mongodb://user:password@localhost:27017/mydb
      
  # RabbitMQ配置（如果使用）
  rabbitmq:
    host: localhost
    port: 5672
    username: admin
    password: password
    virtual-host: /
```

## 四、部署资源并调试
### （一）数据库

1. 验证数据库连接

```shell
# 连接MySQL数据库
mysql -u用户名 -p密码 -h数据库地址 数据库名

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

### （二）前端

1. 配置Nginx虚拟主机

确保Nginx配置文件已正确设置（参考前面的Nginx配置部分）。

2. 检查文件权限

```shell
# 确保Nginx用户有权限访问前端文件
chown -R nginx:nginx /usr/share/nginx/html/mywebsite
chmod -R 755 /usr/share/nginx/html/mywebsite
```

3. 重启Nginx服务

```shell
systemctl restart nginx
```

4. 测试前端访问

在浏览器中访问服务器IP或域名，检查前端页面是否正常显示。

### （三）后端

1. 创建启动脚本

```shell
# 创建启动脚本
vi /opt/deploy/backend/start.sh
```

添加以下内容：

```shell
#!/bin/bash
JAVA_OPTS="-Xms512m -Xmx1024m -XX:MetaspaceSize=128m -XX:MaxMetaspaceSize=256m"
APP_NAME="myapp.jar"
APP_PATH="/opt/deploy/backend"

cd $APP_PATH
nohup java $JAVA_OPTS -jar $APP_NAME --spring.config.location=file:./config/application.yml > app.log 2>&1 &
echo $! > app.pid
echo "应用已启动，进程ID：$(cat app.pid)"
```

2. 创建停止脚本

```shell
# 创建停止脚本
vi /opt/deploy/backend/stop.sh
```

添加以下内容：

```shell
#!/bin/bash
APP_PATH="/opt/deploy/backend"
PID_FILE="$APP_PATH/app.pid"

if [ -f "$PID_FILE" ]; then
    PID=$(cat $PID_FILE)
    if ps -p $PID > /dev/null; then
        echo "正在停止应用，进程ID：$PID"
        kill $PID
        sleep 5
        if ps -p $PID > /dev/null; then
            echo "应用未能正常停止，强制终止"
            kill -9 $PID
        fi
    else
        echo "应用未运行"
    fi
    rm -f $PID_FILE
else
    echo "PID文件不存在，应用可能未运行"
fi
echo "应用已停止"
```

3. 设置脚本权限

```shell
chmod +x /opt/deploy/backend/start.sh
chmod +x /opt/deploy/backend/stop.sh
```

4. 启动后端应用

```shell
# 启动应用
/opt/deploy/backend/start.sh

# 查看启动日志
tail -f /opt/deploy/backend/app.log
```

### （四）调试

1. 检查应用状态

```shell
# 检查后端应用进程
ps -ef | grep java

# 检查端口监听情况
netstat -tunlp | grep 8080

# 检查Nginx进程
ps -ef | grep nginx

# 检查Nginx端口
netstat -tunlp | grep 80
```

2. 检查日志

```shell
# 查看后端应用日志
tail -f /opt/deploy/backend/app.log

# 查看Nginx访问日志
tail -f /var/log/nginx/access.log

# 查看Nginx错误日志
tail -f /var/log/nginx/error.log
```

3. 测试API接口

```shell
# 使用curl测试后端API
curl -X GET http://localhost:8080/api/test

# 带参数的POST请求
curl -X POST -H "Content-Type: application/json" -d '{"key":"value"}' http://localhost:8080/api/data
```

4. 常见问题排查

- 前端访问404：检查Nginx配置和前端文件路径
- 后端无法启动：检查Java版本、内存设置和配置文件
- 数据库连接失败：检查数据库配置、用户权限和防火墙设置
- 跨域问题：检查Nginx代理配置和后端CORS设置
- RabbitMQ管理界面无法访问：
  ```shell
  # 检查服务状态
  systemctl status rabbitmq-server
  
  # 检查日志
  cat /var/log/rabbitmq/rabbit@$(hostname -s).log
  journalctl -u rabbitmq-server
  
  # 检查端口是否开放
  ss -tunlp | grep 15672
  ```

## 五、总结

本文详细介绍了在CentOS 7空服务器上部署网页系统的完整流程，包括环境准备、软件安装、资源准备和部署调试等步骤。通过按照本文的步骤操作，可以快速搭建一个包含前端、后端和数据库的完整网页系统。

在实际部署过程中，可能会遇到各种问题，建议根据具体情况灵活调整配置参数，并结合日志信息进行排查。同时，为了保证系统的安全性和稳定性，还应该考虑添加防火墙规则、设置定时备份、配置监控告警等措施。

## 六、参考链接

- [CentOS 官方文档](https://docs.centos.org/)
- [MySQL 官方文档](https://dev.mysql.com/doc/)
- [Nginx 官方文档](https://nginx.org/en/docs/)
- [Spring Boot 官方文档](https://spring.io/projects/spring-boot)
- [Vue.js 官方文档](https://vuejs.org/guide/introduction.html)