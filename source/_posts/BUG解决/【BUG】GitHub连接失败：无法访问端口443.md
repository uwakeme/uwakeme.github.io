---
title: 【BUG】GitHub连接失败Failed to connect to github.com port 443 after 21056 ms, Couldn't connect to server
date: 2025-07-15
categories:
  - BUG
tags:
  - Git
  - GitHub
  - 网络问题
---

## 一、问题描述

在使用Git操作时遇到以下错误：

```
fatal: unable to access 'https://github.com/username/repository.git/': Failed to connect to github.com port 443 after 21056 ms: Couldn't connect to server
```

## 二、原因分析

此错误通常由以下原因导致：
- 网络连接问题
- 防火墙或代理设置阻止了连接
- DNS解析问题
- GitHub服务暂时不可用
- SSL/TLS握手失败

## 三、解决方案

### （一）检查网络连接

确认您的计算机已连接到互联网，可以通过ping命令测试：

```bash
ping github.com
```

### （二）配置Git代理

如果您在使用代理上网，需要配置Git使用代理：

```bash
# 设置HTTP代理
git config --global http.proxy http://127.0.0.1:端口号

# 设置HTTPS代理
git config --global https.proxy http://127.0.0.1:端口号
```

如需取消代理设置：

```bash
git config --global --unset http.proxy
git config --global --unset https.proxy
```

### （三）修改远程URL使用SSH

将HTTPS连接方式改为SSH可能解决问题：

```bash
# 查看当前远程URL
git remote -v

# 修改为SSH方式
git remote set-url origin git@github.com:username/repository.git
```

### （四）更新SSL证书

更新系统的SSL证书：

```bash
# Windows (使用管理员权限运行PowerShell)
Update-SSLCerts

# Linux
sudo update-ca-certificates
```

### （五）修改DNS设置

尝试使用公共DNS服务器：
- Google DNS: 8.8.8.8, 8.8.4.4
- Cloudflare DNS: 1.1.1.1, 1.0.0.1

### （六）修改hosts文件

编辑hosts文件添加GitHub的IP地址：

```
# 可以通过ping github.com获取最新IP
140.82.114.4 github.com
```

hosts文件位置：
- Windows: C:\Windows\System32\drivers\etc\hosts
- Linux/Mac: /etc/hosts

### （七）增加Git操作超时时间

```bash
git config --global http.lowSpeedLimit 0
git config --global http.lowSpeedTime 999999
```

### （八）检查GitHub服务状态

访问 [GitHub Status](https://www.githubstatus.com/) 确认GitHub服务是否正常运行。

## 四、预防措施

1. 保持网络稳定性
2. 定期更新Git客户端
3. 配置适当的网络代理
4. 考虑使用SSH而非HTTPS进行连接
5. 在网络条件不稳定时使用离线工作模式

以上方法可逐一尝试，直到问题解决。

## 五、参考资料

- [Git官方文档](https://git-scm.com/doc)
- [GitHub帮助文档](https://docs.github.com/cn)
- [Stack Overflow相关问题](https://stackoverflow.com/questions/tagged/git) 