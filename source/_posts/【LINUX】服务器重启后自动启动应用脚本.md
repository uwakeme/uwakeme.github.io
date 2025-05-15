---
title: 【LINUX】服务器重启后自动启动应用脚本
categories: LINUX
tags:
  - Linux
  - Shell
  - 运维
---

# 【LINUX】服务器重启后自动启动应用脚本

## 一、前言

服务器重启后，通常需要手动启动各种应用服务，如Nginx、Java应用、数据库等。这不仅繁琐，而且可能因为人为疏忽导致某些服务未能及时启动。本文将介绍如何编写一个自动启动脚本，使服务器重启后能自动启动所需的各种应用服务，提高系统的可用性和运维效率。

## 二、实现方式

在Linux系统中，有多种方式可以实现应用的自动启动：

### （一）systemd服务方式

这是现代Linux发行版（如CentOS 7+、Ubuntu 16.04+）推荐的方式。

1. 为每个应用创建systemd服务单元文件
2. 启用服务自启动

### （二）crontab定时任务方式

使用`@reboot`指令，在系统重启时执行指定脚本。

### （三）rc.local方式

在`/etc/rc.d/rc.local`或`/etc/rc.local`文件中添加启动命令。

本文将重点介绍这几种方式的具体实现。

## 三、systemd服务方式

systemd是现代Linux系统的初始化系统和服务管理器，是实现应用自启动的首选方式。

### （一）systemd服务单元文件详解

systemd服务单元文件通常由三个主要部分组成：[Unit]、[Service]和[Install]。每个部分包含特定的指令，用于定义服务的行为和特性。

#### 1. [Unit]部分

[Unit]部分包含服务的通用信息和依赖关系：

- `Description`：服务的描述信息，在systemctl status命令输出中显示
- `Documentation`：指向文档的URL
- `After`：指定本服务应在哪些服务之后启动
- `Requires`：指定本服务依赖的其他服务，如果这些服务未启动，则本服务不会启动
- `Wants`：类似于Requires，但依赖服务启动失败不会影响本服务
- `Before`：指定本服务应在哪些服务之前启动

#### 2. [Service]部分

[Service]部分定义了服务的具体行为：

- `Type`：服务的类型，常见值有：
  - `simple`：默认值，主进程由ExecStart启动
  - `forking`：服务进程会fork一个子进程，然后父进程退出
  - `oneshot`：类似simple，但进程必须在启动下一个服务之前退出
  - `notify`：类似simple，但进程会在启动完成后发送通知
- `User`/`Group`：指定运行服务的用户/组
- `WorkingDirectory`：指定工作目录
- `ExecStart`：启动服务的命令
- `ExecStartPre`：服务启动前执行的命令
- `ExecStartPost`：服务启动后执行的命令
- `ExecStop`：停止服务的命令
- `ExecReload`：重载服务的命令
- `Restart`：服务退出时是否重启，常见值有：
  - `no`：不重启（默认）
  - `on-success`：仅在正常退出时重启
  - `on-failure`：仅在异常退出时重启
  - `on-abnormal`：在异常信号或超时时重启
  - `on-abort`：在收到未处理信号时重启
  - `on-watchdog`：在watchdog超时时重启
  - `always`：总是重启
- `RestartSec`：重启前等待的秒数
- `TimeoutStartSec`：启动超时时间
- `TimeoutStopSec`：停止超时时间
- `Environment`：设置环境变量

#### 3. [Install]部分

[Install]部分定义了服务的安装信息，主要关注服务何时启动：

- `WantedBy`：指定服务被哪些目标（target）依赖，最常用的是`multi-user.target`（对应于运行级别3）
- `RequiredBy`：指定服务被哪些目标强制依赖
- `Also`：安装本服务时，同时安装其他指定服务
- `Alias`：服务的别名

下面是一个nginx服务单元文件的示例解析：

```ini
[Unit]
# 服务描述
Description=The NGINX HTTP and reverse proxy server
# 在网络、远程文件系统和DNS查找服务启动后启动
After=network.target remote-fs.target nss-lookup.target

[Service]
# 服务类型为forking，表示nginx会fork子进程并让父进程退出
Type=forking
# 指定PID文件位置
PIDFile=/run/nginx.pid
# 启动前执行的命令，检查配置文件语法
ExecStartPre=/usr/sbin/nginx -t -c /etc/nginx/nginx.conf
# 启动命令
ExecStart=/usr/sbin/nginx -c /etc/nginx/nginx.conf
# 重载命令
ExecReload=/usr/sbin/nginx -s reload
# 停止命令，使用QUIT信号优雅停止
ExecStop=/bin/kill -s QUIT $MAINPID
# 使用私有/tmp目录
PrivateTmp=true

[Install]
# 指定服务在多用户模式下自动启动
WantedBy=multi-user.target
```

### （二）为Nginx创建systemd服务

1. 创建服务单元文件：

```shell
sudo vim /etc/systemd/system/nginx.service
```

2. 添加以下内容：

```ini
[Unit]
Description=The NGINX HTTP and reverse proxy server
After=network.target remote-fs.target nss-lookup.target

[Service]
Type=forking
PIDFile=/run/nginx.pid
ExecStartPre=/usr/sbin/nginx -t -c /etc/nginx/nginx.conf
ExecStart=/usr/sbin/nginx -c /etc/nginx/nginx.conf
ExecReload=/usr/sbin/nginx -s reload
ExecStop=/bin/kill -s QUIT $MAINPID
PrivateTmp=true

[Install]
WantedBy=multi-user.target
```

3. 启用Nginx服务自启动：

```shell
sudo systemctl enable nginx
sudo systemctl start nginx
```

### （二）为Java应用创建systemd服务

1. 创建服务单元文件：

```shell
sudo vim /etc/systemd/system/myapp.service
```

2. 添加以下内容：

```ini
[Unit]
# 服务描述
Description=My Java Application
# 在网络服务启动后启动
After=network.target

[Service]
# 服务类型为simple，表示ExecStart启动的进程就是主进程
Type=simple
# 指定运行服务的用户
User=appuser  # 替换为运行应用的用户
# 指定工作目录
WorkingDirectory=/path/to/your/app  # 替换为应用目录
# 启动命令
ExecStart=/usr/bin/java -jar /path/to/your/app/myapp.jar
# 将143（SIGTERM+128）视为成功退出码，Java应用通常在接收到SIGTERM时返回此值
SuccessExitStatus=143
# 服务异常退出时自动重启
Restart=on-failure
# 重启前等待10秒
RestartSec=10

[Install]
# 指定服务在多用户模式下自动启动
WantedBy=multi-user.target
```

3. 启用Java应用服务自启动：

```shell
sudo systemctl enable myapp
sudo systemctl start myapp
```

### （三）为MySQL数据库创建systemd服务

MySQL通常在安装时已经配置了systemd服务，但如果需要手动配置：

```shell
sudo systemctl enable mysqld  # 或 mysql，取决于Linux发行版
sudo systemctl start mysqld
```

## 四、crontab定时任务方式

如果不想使用systemd，可以使用crontab的`@reboot`指令。

### （一）创建启动脚本

1. 创建一个启动脚本：

```shell
vim /home/username/startup.sh
```

2. 添加以下内容：

```shell
#!/bin/bash
# 启动Nginx
/usr/sbin/nginx

# 启动Java应用
cd /path/to/your/app
nohup java -jar myapp.jar > app.log 2>&1 &

# 启动其他服务
# ...

# 记录启动日志
echo "Services started at $(date)" >> /var/log/startup.log
```

3. 赋予脚本执行权限：

```shell
chmod +x /home/username/startup.sh
```

### （二）添加到crontab

1. 编辑当前用户的crontab：

```shell
crontab -e
```

2. 添加以下行：

```
@reboot /home/username/startup.sh
```

## 五、rc.local方式

在一些Linux系统中，可以使用rc.local文件来添加启动命令。

1. 编辑rc.local文件：

```shell
sudo vim /etc/rc.d/rc.local
```
或
```shell
sudo vim /etc/rc.local
```

2. 添加启动命令：

```shell
#!/bin/bash
# 启动Nginx
/usr/sbin/nginx

# 启动Java应用
cd /path/to/your/app
java -jar myapp.jar > /dev/null 2>&1 &

# 启动其他服务
# ...

exit 0
```

3. 给rc.local添加执行权限：

```shell
sudo chmod +x /etc/rc.d/rc.local
```

## 六、综合启动脚本示例

下面是一个更完整的启动脚本示例，可以用于systemd服务或crontab：

```shell
#!/bin/bash

# 日志文件
LOG_FILE="/var/log/startup.log"

# 启动函数，带错误处理
start_service() {
    echo "$(date) - 正在启动 $1..." >> $LOG_FILE
    
    if $2; then
        echo "$(date) - $1 启动成功" >> $LOG_FILE
    else
        echo "$(date) - $1 启动失败，退出代码: $?" >> $LOG_FILE
    fi
}

# 检查服务是否已运行
is_running() {
    pgrep -f "$1" > /dev/null
    return $?
}

# 确保日志目录存在
mkdir -p $(dirname $LOG_FILE)

echo "===========================================" >> $LOG_FILE
echo "$(date) - 开始启动服务" >> $LOG_FILE

# 1. 启动MySQL
if ! is_running "mysqld"; then
    start_service "MySQL" "systemctl start mysqld"
else
    echo "$(date) - MySQL 已经在运行" >> $LOG_FILE
fi

# 2. 启动Redis
if ! is_running "redis-server"; then
    start_service "Redis" "systemctl start redis"
else
    echo "$(date) - Redis 已经在运行" >> $LOG_FILE
fi

# 3. 启动Nginx
if ! is_running "nginx"; then
    start_service "Nginx" "/usr/sbin/nginx"
else
    echo "$(date) - Nginx 已经在运行" >> $LOG_FILE
fi

# 4. 启动Java应用
if ! is_running "myapp.jar"; then
    start_service "Java应用" "cd /path/to/your/app && nohup java -jar myapp.jar > app.log 2>&1 &"
else
    echo "$(date) - Java应用 已经在运行" >> $LOG_FILE
fi

echo "$(date) - 所有服务启动完成" >> $LOG_FILE
echo "===========================================" >> $LOG_FILE
```

## 七、监控和故障恢复

除了自动启动外，还可以添加监控和自动恢复功能。

### （一）使用systemd的自动重启

systemd服务配置中可以添加：

```ini
[Service]
Restart=on-failure
RestartSec=10
```

### （二）使用监控脚本定期检查

创建一个检查脚本，定期通过crontab运行：

```shell
#!/bin/bash
# 检查Nginx是否运行
if ! pgrep -x "nginx" > /dev/null; then
    systemctl start nginx
    echo "$(date) - Nginx 已重启" >> /var/log/service-monitor.log
fi

# 检查Java应用是否运行
if ! pgrep -f "myapp.jar" > /dev/null; then
    cd /path/to/your/app
    nohup java -jar myapp.jar > app.log 2>&1 &
    echo "$(date) - Java应用 已重启" >> /var/log/service-monitor.log
fi
```

将此脚本添加到crontab中定期运行：

```
*/5 * * * * /path/to/check-services.sh
```

## 八、总结

本文介绍了三种在Linux服务器中实现应用自动启动的方法：systemd服务方式、crontab定时任务方式和rc.local方式。对于现代Linux系统，推荐使用systemd服务方式，它提供了更好的服务管理和错误处理能力。

在实际应用中，还可以结合监控工具（如Supervisor、Monit等）提供更强大的应用监控和自动恢复功能，确保系统服务的持续可用性。

编写自启动脚本时，请注意以下几点：
1. 确保脚本有适当的错误处理
2. 添加启动日志以便于故障排查
3. 考虑启动顺序，确保依赖服务先启动
4. 定期测试启动脚本，确保其有效性

通过合理配置服务器自启动脚本，可以大大减少人工干预，提高系统稳定性和运维效率。 