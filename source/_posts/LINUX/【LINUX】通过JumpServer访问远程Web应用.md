---
title: 【LINUX】通过JumpServer访问远程Web应用
categories: LINUX
tags:
  - Linux
  - JumpServer
  - 远程访问
  - 端口转发
  - Web应用
---

# 【LINUX】通过JumpServer访问远程Web应用

## 一、前言

在企业环境中，我们经常需要通过堡垒机（如JumpServer）连接和管理客户的远程服务器。在部署完Web应用后，由于网络隔离或安全策略限制，我们常常无法直接从本地浏览器访问这些应用。本文将介绍几种通过JumpServer访问远程Web应用的方法，帮助运维人员和开发者解决此类问题。

## 二、基本原理

要通过JumpServer访问远程Web应用，本质上是建立一个从本地机器到远程服务器的安全通道，主要依靠以下技术：

### （一）SSH端口转发

SSH端口转发（又称SSH隧道）是最常用的方法，分为以下几种：

1. **本地端口转发**：将本地端口的流量转发到远程服务器
2. **远程端口转发**：将远程端口的流量转发到本地服务器
3. **动态端口转发**：创建一个SOCKS代理服务器

### （二）JumpServer的Web文件管理器

一些JumpServer版本提供了文件管理器功能，可以下载远程服务器上的文件到本地。

## 三、通过SSH端口转发访问远程Web应用

### （一）本地端口转发

本地端口转发是最常用的方法，适用于需要从本地访问远程Web应用的场景。

#### 1. 命令格式

```shell
ssh -L [本地IP:]本地端口:目标主机:目标端口 跳板机用户名@跳板机地址
```

#### 2. 具体步骤

假设远程Web应用运行在目标服务器的8080端口，通过JumpServer访问的步骤如下：

```shell
# 建立SSH隧道，将本地8888端口转发到远程服务器的8080端口
ssh -L 8888:远程服务器IP:8080 用户名@jumpserver地址
```

成功建立连接后，打开本地浏览器，访问`http://localhost:8888`即可访问远程Web应用。

#### 3. 在JumpServer Web终端中使用

如果只能通过JumpServer的Web界面访问远程服务器，可以：

1. 登录JumpServer Web界面
2. 连接到远程服务器
3. 在终端执行SSH端口转发命令：

```shell
ssh -L 8888:127.0.0.1:8080 用户名@127.0.0.1
```

### （二）使用ProxyCommand实现多级跳转

当需要通过多个跳板机访问目标服务器时，可以使用ProxyCommand：

```shell
ssh -L 8888:最终目标IP:8080 -o ProxyCommand="ssh -W %h:%p 用户名@jumpserver地址" 用户名@最终目标IP
```

### （三）远程端口转发

如果JumpServer无法直接访问你的本地机器，但你需要将远程Web应用"带回"本地，可以使用远程端口转发：

```shell
ssh -R 8888:localhost:8080 用户名@jumpserver地址
```

这会在JumpServer上监听8888端口，并将访问该端口的流量转发到本地的8080端口。

## 四、使用图形化工具实现端口转发

### （一）使用MobaXterm

1. 打开MobaXterm
2. 创建新的SSH会话，连接到JumpServer
3. 在"Tunneling"选项卡中，添加新的端口转发规则：
   - 选择"Local port forwarding"
   - 本地端口：8888
   - 远程服务器：远程服务器IP
   - 远程端口：8080
4. 启动会话
5. 在本地浏览器访问`http://localhost:8888`

### （二）使用Xshell

1. 打开Xshell
2. 创建新的会话，连接到JumpServer
3. 在会话属性的"隧道"选项卡中，添加新的转发规则：
   - 类型：本地(入)
   - 源主机：127.0.0.1
   - 监听端口：8888
   - 目标主机：远程服务器IP
   - 目标端口：8080
4. 连接会话
5. 在本地浏览器访问`http://localhost:8888`

## 五、使用JumpServer的内置功能

### （一）使用JumpServer的Web终端执行curl命令

如果只需要简单检查Web应用是否正常运行，可以在JumpServer的Web终端中执行：

```shell
curl http://localhost:8080
```

这会显示Web应用返回的HTML内容。

### （二）使用JumpServer的文件管理器下载应用日志

1. 在JumpServer界面中，选择"文件管理"功能
2. 导航到Web应用的日志目录
3. 下载日志文件进行分析

## 六、使用浏览器插件和代理

### （一）配置SwitchyOmega代理插件

1. 在Chrome浏览器安装SwitchyOmega插件
2. 创建SSH动态代理：

```shell
ssh -D 1080 用户名@jumpserver地址
```

3. 在SwitchyOmega中配置SOCKS代理：
   - 代理协议：SOCKS5
   - 服务器：127.0.0.1
   - 端口：1080
4. 激活代理后访问远程Web应用

## 七、持久化配置

### （一）创建SSH配置文件

为避免每次都输入复杂的SSH命令，可以在`~/.ssh/config`中添加配置：

```shell
Host jumpserver
    HostName jumpserver地址
    User 用户名
    
Host webserver
    HostName 远程服务器IP
    User 用户名
    ProxyJump jumpserver
    LocalForward 8888 127.0.0.1:8080
```

配置完成后，只需执行：

```shell
ssh webserver
```

即可自动建立端口转发。

### （二）创建自动化脚本

创建一个便捷的脚本来启动SSH隧道：

```shell
#!/bin/bash
# web-tunnel.sh

echo "正在建立到远程Web应用的隧道..."
ssh -L 8888:远程服务器IP:8080 -N 用户名@jumpserver地址 &
tunnel_pid=$!

echo "隧道已建立，请访问 http://localhost:8888"
echo "按任意键关闭隧道..."
read -n 1

kill $tunnel_pid
echo "隧道已关闭"
```

给脚本添加执行权限：

```shell
chmod +x web-tunnel.sh
```

## 八、常见问题及解决方案

### （一）无法建立端口转发

可能的原因：
1. SSH服务器配置禁止端口转发
2. 防火墙阻止了特定端口

解决方案：
1. 检查JumpServer的SSH配置，确保`AllowTcpForwarding`设置为`yes`
2. 尝试使用不同的本地端口
3. 联系网络管理员检查防火墙设置

### （二）转发成功但无法访问Web应用

可能的原因：
1. 远程Web应用绑定在127.0.0.1而不是0.0.0.0
2. 远程服务器防火墙阻止了Web应用端口

解决方案：
1. 修改Web应用配置，使其监听所有接口（0.0.0.0）
2. 在远程服务器上检查防火墙设置：

```shell
sudo iptables -L
```

### （三）连接经常断开

解决方案：
1. 在SSH命令中添加保持连接的选项：

```shell
ssh -L 8888:远程服务器IP:8080 -o ServerAliveInterval=60 用户名@jumpserver地址
```

2. 在`~/.ssh/config`文件中添加全局设置：

```shell
Host *
    ServerAliveInterval 60
    ServerAliveCountMax 3
```

### （四）使用JumpServer网页链接作为地址时的错误

可能的错误信息：
```
ssh: Could not resolve hostname http://jumpserver.example.com:9898/ui/#/profile/connection-token: 不知道这样的主机。
```

错误原因：
SSH命令需要使用服务器的域名或IP地址，而非完整的网页URL。当您复制JumpServer的Web界面地址时，不能直接用于SSH命令。

解决方案：
1. 从完整的JumpServer Web链接中提取实际的服务器地址，例如：
   - 错误：`ssh 用户名@http://jumpserver.example.com:9898/ui/#/profile/connection-token`
   - 正确：`ssh 用户名@jumpserver.example.com -p 9898`

2. 对于本地端口转发命令，正确的格式应为：
```shell
ssh -L 8888:目标服务器IP:8080 用户名@jumpserver服务器地址 -p SSH端口
```

3. 实际示例：
```shell
# 错误示例
ssh -L 8888:192.168.0.36:8081 zhaoguichao@http://cdg.enpower.com:9898/ui/#/profile/connection-token

# 正确示例
ssh -L 8888:192.168.0.36:8081 zhaoguichao@cdg.enpower.com -p 9898
```

4. 如果不确定JumpServer的SSH端口，通常可以：
   - 查看JumpServer管理员提供的文档
   - 尝试默认SSH端口22
   - 或询问系统管理员

### （五）连接被服务器关闭（Connection closed）

可能的错误信息：
```
Connection closed by xx.xx.xx.xx port xxxx
```

错误原因：
1. JumpServer可能不支持直接SSH访问，仅支持通过Web界面访问
2. SSH服务可能配置了特定的认证要求（如密钥认证）
3. 服务器可能有安全策略限制直接SSH连接
4. 账户可能没有SSH登录权限
5. 可能需要特殊的连接参数或认证方式

解决方案：
1. **使用JumpServer的Web终端**：
   - 登录JumpServer的Web界面
   - 通过Web终端连接到目标服务器
   - 在Web终端中执行本地端口转发命令

2. **确认是否需要密钥认证**：
   ```shell
   ssh -L 8888:192.168.0.36:8081 -i private_key.pem zhaoguichao@cdg.enpower.com -p 9898
   ```

3. **检查JumpServer使用手册**：
   - JumpServer可能有特定的连接方式
   - 可能需要使用JumpServer提供的命令行工具或客户端

4. **连接为专用服务器**：
   - 确认JumpServer的连接地址是否正确
   - 某些JumpServer实例可能设置了专门的SSH跳板机

5. **使用JumpServer提供的连接串**：
   - JumpServer界面上通常会提供正确的连接命令
   - 使用JumpServer提供的连接命令或参数

6. **使用其他图形化工具**：
   - 使用MobaXterm、Xshell等具有图形界面的工具
   - 按照JumpServer提供的说明配置连接参数

实际操作建议：
- 联系系统管理员，获取正确的连接方式和参数
- 查看JumpServer的帮助文档，了解特定环境下的连接要求
- 可能需要在JumpServer的Web界面上创建特定的授权规则后才能使用SSH连接

## 九、安全注意事项

1. **限制访问范围**：默认情况下，本地端口转发只绑定到127.0.0.1，如果你将其绑定到0.0.0.0，任何能访问你计算机的人都能使用此隧道
2. **使用临时端口**：避免长时间保持端口转发，用完即关
3. **设置连接超时**：避免空闲连接长时间占用资源
4. **遵循最小权限原则**：仅转发必要的端口，避免不必要的安全风险

## 十、总结

通过JumpServer访问远程Web应用，主要依靠SSH端口转发技术实现。根据具体的网络环境和JumpServer配置，可以选择本地端口转发、远程端口转发或动态端口转发等方式。为提高工作效率，可以创建SSH配置文件或编写自动化脚本。在使用过程中，需特别注意安全性，遵循最小权限原则，避免不必要的安全风险。

掌握本文介绍的方法后，即使在复杂的网络环境中，也能高效地通过JumpServer访问和测试远程Web应用，大大提高工作效率。 