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

1.  **更新软件包列表**

    ```shell
    sudo apt update
    ```

2.  **安装MySQL服务器** <mcreference link="https://ubuntu.com/server/docs/install-and-configure-a-mysql-server" index="1">1</mcreference> <mcreference link="https://www.digitalocean.com/community/tutorials/how-to-install-mysql-on-ubuntu-20-04" index="2">2</mcreference> <mcreference link="https://phoenixnap.com/kb/install-mysql-ubuntu-22-04" index="4">4</mcreference>

    ```shell
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