---
title: 【LINUX】Linux系统上安装Redis完整教程
categories: LINUX
date: 2024-12-19 15:30:00
tags:
  - Redis
  - Linux
  - 安装教程
  - 数据库
  - 缓存
series: LINUX软件安装教程
cover: 
---

# 一、Redis简介与环境准备

## （一）什么是Redis

Redis（Remote Dictionary Server）是一个开源的、内存中的数据结构存储系统，常用作数据库、缓存和消息代理。它支持多种数据结构，如字符串、哈希、列表、集合、有序集合等，具有高性能、高可用性和丰富的功能特性。

> Redis的特点：
> - 内存存储，读写性能极高
> - 支持多种数据结构
> - 支持数据持久化
> - 支持主从复制和集群模式
> - 支持发布订阅消息模式

## （二）系统环境要求

在开始安装前，请确保您的Linux系统满足以下要求：

- **操作系统**：CentOS 7/8、Ubuntu 18.04/20.04/22.04、Debian 9/10/11
- **内存**：至少1GB（建议2GB以上）
- **磁盘空间**：至少500MB可用空间
- **网络连接**：能够访问互联网以下载软件包

# 二、安装方式选择

## （一）源码编译安装（推荐）

源码编译安装是最灵活的方式，可以自定义配置和优化参数。

### 1. 安装依赖包

**CentOS/RHEL系统：**
```bash
# 更新系统软件包
sudo yum update -y

# 安装编译工具和依赖
sudo yum install -y gcc gcc-c++ make wget tcl

# 安装jemalloc内存分配器（可选，提高性能）
sudo yum install -y jemalloc-devel
```

**Ubuntu/Debian系统：**
```bash
# 更新软件包列表
sudo apt update

# 安装编译工具和依赖
sudo apt install -y build-essential wget tcl

# 安装jemalloc内存分配器
sudo apt install -y libjemalloc-dev
```

### 2. 下载Redis源码

```bash
# 进入/usr/local/src目录
cd /usr/local/src

# 下载最新稳定版Redis（以7.2.4为例）
sudo wget http://download.redis.io/releases/redis-7.2.4.tar.gz

# 解压源码包
sudo tar xzf redis-7.2.4.tar.gz

# 进入解压后的目录
cd redis-7.2.4
```

### 3. 编译安装

```bash
# 编译源码（使用jemalloc内存分配器）
sudo make MALLOC=jemalloc

# 运行测试（可选，验证编译是否成功）
sudo make test

# 安装Redis到系统
sudo make install

# 创建Redis用户（安全考虑）
sudo useradd -r -s /bin/false redis
```

### 4. 创建必要的目录

```bash
# 创建配置目录
sudo mkdir /etc/redis

# 创建数据目录
sudo mkdir /var/lib/redis

# 创建日志目录
sudo mkdir /var/log/redis

# 设置目录权限
sudo chown redis:redis /var/lib/redis
sudo chown redis:redis /var/log/redis
sudo chmod 750 /var/lib/redis
sudo chmod 750 /var/log/redis
```

## （二）包管理器安装

### 1. CentOS/RHEL系统

**使用Remi仓库安装最新版：**
```bash
# 安装EPEL仓库
sudo yum install -y epel-release

# 安装Remi仓库
sudo yum install -y https://rpms.remirepo.net/enterprise/remi-release-7.rpm

# 启用Remi仓库的Redis模块
sudo yum module enable -y redis:remi-7.2

# 安装Redis
sudo yum install -y redis
```

**使用默认仓库安装：**
```bash
# 直接安装（版本可能较旧）
sudo yum install -y redis
```

### 2. Ubuntu/Debian系统

```bash
# 更新软件包列表
sudo apt update

# 安装Redis
sudo apt install -y redis-server

# 检查安装版本
redis-server --version
```

# 三、Redis配置详解

## （一）配置文件说明

### 1. 复制配置文件

```bash
# 从源码目录复制配置文件到/etc/redis
sudo cp /usr/local/src/redis-7.2.4/redis.conf /etc/redis/redis.conf

# 备份原始配置文件
sudo cp /etc/redis/redis.conf /etc/redis/redis.conf.backup
```

### 2. 关键配置参数

**基本配置：**
```bash
# 绑定IP地址（默认只监听本地）
bind 127.0.0.1

# 监听端口
port 6379

# 是否以守护进程方式运行
daemonize yes

# 进程ID文件位置
pidfile /var/run/redis_6379.pid
```

**内存和性能配置：**
```bash
# 最大内存限制（根据服务器内存调整）
maxmemory 1gb

# 内存淘汰策略（当内存满时的处理策略）
maxmemory-policy allkeys-lru

# 数据库数量
databases 16
```

**持久化配置：**
```bash
# RDB持久化（快照）
save 900 1      # 900秒内至少有1个key被修改则保存
save 300 10     # 300秒内至少有10个key被修改则保存
save 60 10000   # 60秒内至少有10000个key被修改则保存

# AOF持久化（追加日志）
appendonly yes
appendfilename "appendonly.aof"
appendfsync everysec  # 每秒同步一次
```

**日志配置：**
```bash
# 日志级别（debug、verbose、notice、warning）
loglevel notice

# 日志文件位置
logfile /var/log/redis/redis-server.log
```

**安全配置：**
```bash
# 设置访问密码（强烈建议设置）
requirepass your_strong_password

# 重命名危险命令（可选）
rename-command FLUSHDB ""
rename-command FLUSHALL ""
```

## （二）系统服务配置

### 1. 创建systemd服务文件

```bash
# 创建systemd服务文件
sudo tee /etc/systemd/system/redis.service > /dev/null <<EOF
[Unit]
Description=Redis In-Memory Data Store
After=network.target

[Service]
User=redis
Group=redis
ExecStart=/usr/local/bin/redis-server /etc/redis/redis.conf
ExecStop=/usr/local/bin/redis-cli shutdown
Restart=always

[Install]
WantedBy=multi-user.target
EOF
```

### 2. 启动并设置开机自启

```bash
# 重新加载systemd配置
sudo systemctl daemon-reload

# 启动Redis服务
sudo systemctl start redis

# 设置开机自启
sudo systemctl enable redis

# 检查服务状态
sudo systemctl status redis
```

# 四、Redis基本使用

## （一）连接Redis服务器

### 1. 本地连接

```bash
# 使用redis-cli连接本地Redis
redis-cli

# 如果设置了密码，连接后需要认证
redis-cli -a your_password

# 指定主机和端口连接
redis-cli -h 127.0.0.1 -p 6379
```

### 2. 测试连接

```bash
# 连接后执行ping命令
127.0.0.1:6379> ping
PONG

# 设置一个测试键值
127.0.0.1:6379> set test "Hello Redis"
OK

# 获取键值
127.0.0.1:6379> get test
"Hello Redis"

# 删除键
127.0.0.1:6379> del test
(integer) 1
```

## （二）常用命令示例

### 1. 字符串操作

```bash
# 设置字符串值
set username "admin"

# 获取字符串值
get username

# 设置带过期时间的键（60秒后过期）
setex session_token 60 "abc123"

# 原子递增
incr page_views
```

### 2. 哈希操作

```bash
# 设置哈希字段
hset user:1 name "张三" age 25 email "zhangsan@example.com"

# 获取哈希字段
hget user:1 name

# 获取所有字段
hgetall user:1
```

### 3. 列表操作

```bash
# 向列表左侧添加元素
lpush messages "Hello"
lpush messages "World"

# 获取列表范围
lrange messages 0 -1

# 从右侧弹出元素
rpop messages
```

# 五、安全配置与优化

## （一）安全加固

### 1. 防火墙配置

**CentOS/RHEL系统：**
```bash
# 开放Redis端口（仅允许特定IP访问）
sudo firewall-cmd --permanent --add-rich-rule='rule family="ipv4" source address="192.168.1.0/24" port protocol="tcp" port="6379" accept'
sudo firewall-cmd --reload
```

**Ubuntu/Debian系统：**
```bash
# 使用UFW配置防火墙
sudo ufw allow from 192.168.1.0/24 to any port 6379
```

### 2. 网络安全建议

- **绑定特定IP**：只监听内网IP，不要监听0.0.0.0
- **使用强密码**：设置复杂的访问密码
- **禁用危险命令**：重命名或禁用FLUSHDB、FLUSHALL等命令
- **使用SSL/TLS**：配置SSL加密传输（生产环境推荐）
- **网络隔离**：将Redis部署在内网，通过应用层访问

## （二）性能优化

### 1. 内存优化

```bash
# 配置最大内存限制
maxmemory 2gb

# 选择合适的淘汰策略
maxmemory-policy allkeys-lru  # 最近最少使用
# 其他策略：
# volatile-lru：从已设置过期时间的key中使用LRU算法淘汰
# allkeys-random：从所有key中随机淘汰
# volatile-random：从已设置过期时间的key中随机淘汰
# volatile-ttl：从已设置过期时间的key中，选择剩余时间短的淘汰
```

### 2. 持久化优化

```bash
# RDB优化
save 900 1
save 300 10
save 60 10000
stop-writes-on-bgsave-error yes
rdbcompression yes
rdbchecksum yes

# AOF优化
appendonly yes
appendfsync everysec  # 每秒同步，平衡性能和数据安全
no-appendfsync-on-rewrite yes
auto-aof-rewrite-percentage 100
auto-aof-rewrite-min-size 64mb
```

### 3. 网络优化

```bash
# TCP backlog设置
tcp-backlog 511

# TCP keepalive
tcp-keepalive 300

# 客户端超时时间
timeout 0  # 0表示永不超时
```

# 六、故障排查与监控

## （一）常见问题解决

### 1. 连接被拒绝

**问题现象：**
```
Could not connect to Redis at 127.0.0.1:6379: Connection refused
```

**解决方案：**
```bash
# 检查Redis服务状态
sudo systemctl status redis

# 检查端口监听
sudo netstat -tlnp | grep 6379

# 检查配置文件
sudo cat /etc/redis/redis.conf | grep bind
sudo cat /etc/redis/redis.conf | grep port
```

### 2. 内存不足

**问题现象：**
```
OOM command not allowed when used memory > 'maxmemory'
```

**解决方案：**
```bash
# 增加maxmemory限制
sudo vim /etc/redis/redis.conf
# 修改：maxmemory 2gb

# 重启Redis服务
sudo systemctl restart redis

# 清理无用数据
redis-cli flushall  # 谨慎使用，会清空所有数据
```

### 3. 权限问题

**问题现象：**
```
Can't open the log file: Permission denied
```

**解决方案：**
```bash
# 检查目录权限
sudo chown -R redis:redis /var/log/redis
sudo chown -R redis:redis /var/lib/redis
sudo chmod -R 750 /var/log/redis
sudo chmod -R 750 /var/lib/redis
```

## （二）监控与日志

### 1. 查看Redis信息

```bash
# 查看Redis服务器信息
redis-cli info

# 查看内存使用情况
redis-cli info memory

# 查看客户端连接
redis-cli info clients

# 查看统计信息
redis-cli info stats
```

### 2. 日志分析

```bash
# 查看实时日志
sudo tail -f /var/log/redis/redis-server.log

# 搜索错误日志
sudo grep -i error /var/log/redis/redis-server.log

# 查看系统日志中的Redis信息
sudo journalctl -u redis -f
```

# 七、高级配置与集群

## （一）主从复制配置

### 1. 配置主节点

主节点配置保持默认即可，确保以下配置：
```bash
# 主节点redis.conf
bind 0.0.0.0
port 6379
requirepass master_password
```

### 2. 配置从节点

```bash
# 从节点redis.conf
bind 0.0.0.0
port 6379
requirepass master_password

# 主从复制配置
replicaof 主节点IP 6379
masterauth master_password
```

## （二）Redis哨兵模式

### 1. 配置哨兵

```bash
# 创建哨兵配置文件
sudo tee /etc/redis/sentinel.conf > /dev/null <<EOF
port 26379
daemonize yes
pidfile /var/run/redis-sentinel.pid
logfile /var/log/redis/sentinel.log
dir /var/lib/redis

# 监控主节点
sentinel monitor mymaster 127.0.0.1 6379 2
sentinel auth-pass mymaster master_password
sentinel down-after-milliseconds mymaster 5000
sentinel failover-timeout mymaster 60000
sentinel parallel-syncs mymaster 1
EOF
```

### 2. 启动哨兵

```bash
# 启动哨兵进程
redis-sentinel /etc/redis/sentinel.conf
```

# 八、总结与最佳实践

## （一）安装总结

通过本教程，我们完成了Redis在Linux系统上的完整安装和配置过程，包括：

1. **源码编译安装**：获得最新版本和最大灵活性
2. **系统服务配置**：实现开机自启和进程管理
3. **安全配置**：密码保护、网络隔离、命令限制
4. **性能优化**：内存管理、持久化配置、网络调优
5. **监控维护**：日志分析、故障排查、状态监控

## （二）最佳实践建议

### 1. 生产环境建议

- **版本选择**：使用稳定版本，避免使用最新测试版
- **安全配置**：必须设置强密码，禁用危险命令
- **监控告警**：配置监控告警，及时发现异常
- **备份策略**：定期备份RDB和AOF文件
- **资源限制**：合理设置maxmemory，避免OOM

### 2. 性能调优建议

- **内存分配**：使用jemalloc提升内存分配效率
- **持久化策略**：根据业务需求选择合适的持久化方式
- **网络配置**：调整TCP参数，优化网络性能
- **数据结构**：合理使用Redis数据结构，避免大key

### 3. 维护建议

- **定期更新**：及时更新到最新稳定版本
- **日志监控**：定期检查日志，分析性能瓶颈
- **容量规划**：提前规划内存和存储需求
- **灾备演练**：定期进行故障恢复演练

> 📌 **温馨提示**：
> Redis虽然功能强大，但也需要合理的配置和维护。在生产环境中，建议配合监控工具（如Redis Exporter + Prometheus + Grafana）进行全方位监控，确保系统稳定运行。

---

# 参考资料

1. [Redis官方文档](https://redis.io/documentation)
2. [Redis配置详解](https://redis.io/docs/manual/config/)
3. [Redis持久化机制](https://redis.io/docs/manual/persistence/)
4. [Redis安全指南](https://redis.io/docs/manual/security/)
5. [Linux性能优化指南](https://www.redhat.com/sysadmin/linux-performance-tuning)
6. [Redis集群配置](https://redis.io/docs/manual/scaling/)

> 本教程基于Redis 7.2.4版本编写，不同版本可能存在配置差异，请根据实际情况调整配置参数。