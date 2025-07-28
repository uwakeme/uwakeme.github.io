---
title: 【AI】如何搭建n8n AI工作流平台
categories: AI
tags:
  - AI
  - n8n
  - 工作流
  - 自动化
  - 集成平台
cover: https://cdn.jsdelivr.net/gh/uwakeme/personal-image-repository/images/n8n.jpg
---

# 一、n8n工作流平台概述

n8n是一个功能强大的开源工作流自动化平台，允许用户通过可视化界面连接不同的应用程序、服务和API，实现数据流转和自动化操作。与其他自动化平台如Zapier、IFTTT相比，n8n最大的优势在于它可以自托管，确保数据隐私和安全，同时提供了更灵活的定制能力。

## （一）n8n的核心特点

1. **开源免费**：n8n的核心功能完全开源，可以免费使用。
2. **自托管**：可以在自己的服务器上部署，保证数据隐私。
3. **节点丰富**：提供200+预构建节点，支持与各种服务的集成。
4. **可视化编辑器**：通过拖拽方式创建工作流，无需编程经验。
5. **灵活的执行模式**：支持定时触发、webhook触发或手动执行。
6. **JavaScript函数**：允许使用JavaScript编写自定义逻辑。

## （二）应用场景

1. **数据同步**：在不同系统间同步数据。
2. **内容自动化**：自动发布内容到社交媒体或网站。
3. **通知系统**：基于特定事件触发邮件、短信或消息通知。
4. **数据处理**：收集、转换和分析数据。
5. **API集成**：连接不同的API，构建复合服务。

# 二、搭建环境准备

## （一）系统要求

n8n可以在多种环境中运行，基本系统要求如下：

1. **操作系统**：Linux、macOS或Windows
2. **Node.js**：14.x或更高版本
3. **内存**：最低2GB RAM（推荐4GB以上）
4. **存储**：至少1GB可用空间
5. **网络**：稳定的互联网连接

## （二）安装方式选择

n8n提供多种安装方式，可以根据自己的需求选择：

1. **Docker部署**：最简单的方式，适合有Docker环境的用户
2. **NPM安装**：通过Node.js的npm包管理器安装
3. **桌面应用**：适合本地测试和个人使用
4. **云服务**：使用n8n.cloud托管服务（付费）

# 三、Docker方式安装n8n

Docker是部署n8n最简单、最推荐的方式，可以避免环境依赖问题。

## （一）安装Docker

如果系统中尚未安装Docker，请先安装Docker：

### Linux系统（Ubuntu/Debian）：

```shell
# 更新包索引
sudo apt update

# 安装必要的依赖
sudo apt install -y apt-transport-https ca-certificates curl software-properties-common

# 添加Docker的官方GPG密钥
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -

# 添加Docker APT仓库
sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"

# 更新包索引
sudo apt update

# 安装Docker CE
sudo apt install -y docker-ce

# 启动Docker服务
sudo systemctl start docker

# 设置Docker开机自启
sudo systemctl enable docker

# 验证Docker安装
docker --version
```

### CentOS系统：

```shell
# 安装必要的依赖
sudo yum install -y yum-utils device-mapper-persistent-data lvm2

# 添加Docker仓库
sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo

# 安装Docker CE
sudo yum install -y docker-ce

# 启动Docker服务
sudo systemctl start docker

# 设置Docker开机自启
sudo systemctl enable docker

# 验证Docker安装
docker --version
```

## （二）使用Docker运行n8n

### 1. 基本运行命令

```shell
docker run -it --rm \
  --name n8n \
  -p 5678:5678 \
  -v ~/.n8n:/home/node/.n8n \
  n8nio/n8n
```

这个命令会：
- 创建一个名为"n8n"的容器
- 将容器的5678端口映射到主机的5678端口
- 将n8n数据存储在主机的~/.n8n目录

### 2. 使用Docker Compose（推荐）

创建`docker-compose.yml`文件：

```shell
mkdir -p ~/n8n && cd ~/n8n
nano docker-compose.yml
```

在文件中添加以下内容：

```yaml
version: '3'

services:
  n8n:
    image: n8nio/n8n
    restart: always
    ports:
      - "5678:5678"
    volumes:
      - ~/.n8n:/home/node/.n8n
    environment:
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=admin
      - N8N_BASIC_AUTH_PASSWORD=password
      - N8N_HOST=localhost
      - N8N_PORT=5678
      - N8N_PROTOCOL=http
      - NODE_ENV=production
```

启动n8n服务：

```shell
docker-compose up -d
```

停止服务：

```shell
docker-compose down
```

## （三）配置持久化存储

为了确保数据不会丢失，建议配置数据库进行持久化存储。n8n支持多种数据库，以下以PostgreSQL为例：

```yaml
version: '3'

services:
  n8n:
    image: n8nio/n8n
    restart: always
    ports:
      - "5678:5678"
    environment:
      - DB_TYPE=postgresdb
      - DB_POSTGRESDB_HOST=postgres
      - DB_POSTGRESDB_PORT=5432
      - DB_POSTGRESDB_DATABASE=n8n
      - DB_POSTGRESDB_USER=n8n
      - DB_POSTGRESDB_PASSWORD=n8n
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=admin
      - N8N_BASIC_AUTH_PASSWORD=password
    volumes:
      - ~/.n8n:/home/node/.n8n
    depends_on:
      - postgres
    
  postgres:
    image: postgres:13
    restart: always
    environment:
      - POSTGRES_USER=n8n
      - POSTGRES_PASSWORD=n8n
      - POSTGRES_DB=n8n
      - POSTGRES_NON_ROOT_USER=n8n_user
      - POSTGRES_NON_ROOT_PASSWORD=n8n_pass
    volumes:
      - postgres_data:/var/lib/postgresql/data
    
volumes:
  postgres_data:
```

# 四、NPM方式安装n8n

如果不想使用Docker，也可以通过NPM直接安装n8n。

## （一）安装Node.js

首先确保系统中安装了Node.js 14.x或更高版本：

### Linux系统（使用NVM安装Node.js）：

```shell
# 安装NVM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash

# 加载NVM
export NVM_DIR="$([ -z "${XDG_CONFIG_HOME-}" ] && printf %s "${HOME}/.nvm" || printf %s "${XDG_CONFIG_HOME}/nvm")"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# 安装Node.js LTS版本
nvm install --lts

# 验证Node.js安装
node --version
npm --version
```

## （二）全局安装n8n

```shell
# 安装n8n
npm install n8n -g

# 启动n8n
n8n start
```

## （三）配置系统服务

为了让n8n作为系统服务运行，可以创建一个systemd服务文件：

```shell
sudo nano /etc/systemd/system/n8n.service
```

添加以下内容：

```ini
[Unit]
Description=n8n workflow automation
After=network.target

[Service]
Type=simple
User=<your-user>
ExecStart=/usr/bin/n8n start
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

启用并启动服务：

```shell
sudo systemctl daemon-reload
sudo systemctl enable n8n
sudo systemctl start n8n
```

检查服务状态：

```shell
sudo systemctl status n8n
```

# 五、n8n基础配置

## （一）访问Web界面

安装完成后，可以通过浏览器访问n8n的Web界面：

```
http://your-server-ip:5678
```

首次访问时，会要求创建管理员账户。

## （二）环境变量配置

n8n可以通过环境变量进行配置，常用的环境变量包括：

| 环境变量 | 描述 | 示例值 |
|---------|------|-------|
| N8N_BASIC_AUTH_ACTIVE | 启用基本身份验证 | true |
| N8N_BASIC_AUTH_USER | 基本身份验证用户名 | admin |
| N8N_BASIC_AUTH_PASSWORD | 基本身份验证密码 | password |
| N8N_HOST | n8n主机名 | localhost |
| N8N_PORT | n8n端口 | 5678 |
| N8N_PROTOCOL | 协议（http或https） | http |
| N8N_ENCRYPTION_KEY | 用于加密凭证的密钥 | random-key |
| DB_TYPE | 数据库类型 | postgresdb |
| WEBHOOK_URL | Webhook的基本URL | http://your-domain.com:5678/ |

## （三）HTTPS配置

生产环境中，建议配置HTTPS以确保安全。可以使用Nginx作为反向代理，并配置SSL证书：

```nginx
server {
    listen 80;
    server_name n8n.yourdomain.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name n8n.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/n8n.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/n8n.yourdomain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:5678;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

# 六、创建第一个工作流

## （一）界面介绍

n8n的Web界面主要包括以下几个部分：

1. **工作流列表**：显示所有已创建的工作流
2. **工作流编辑器**：用于创建和编辑工作流
3. **节点面板**：显示可用的节点类型
4. **执行历史**：记录工作流的执行历史

## （二）创建简单工作流示例

下面创建一个简单的工作流，当收到HTTP请求时，发送一封邮件：

1. 点击"Create new workflow"创建新工作流
2. 为工作流命名，如"HTTP to Email"
3. 从节点面板中拖拽"Webhook"节点到编辑区
4. 配置Webhook节点：
   - 设置方法为"POST"
   - 路径保持默认（如/webhook）
   - 点击"Add Option"并选择"Response Mode"为"Last Node"
5. 添加"Send Email"节点并连接到Webhook节点
6. 配置Email节点：
   - 添加SMTP凭证
   - 设置收件人、主题和邮件内容
7. 点击"Save"保存工作流
8. 点击Webhook节点中的"Execute Node"获取Webhook URL
9. 使用工具如Postman发送POST请求到该URL测试工作流

## （三）使用表达式处理数据

n8n提供了强大的表达式功能，可以处理和转换数据：

1. 在任何字段中，点击"Add Expression"按钮
2. 使用表达式编辑器访问上游节点的数据
3. 示例表达式：
   - 获取上一个节点的数据：`{{ $json.data }}`
   - 格式化日期：`{{ $json.created_at.split('T')[0] }}`
   - 条件判断：`{{ $json.amount > 1000 ? "High value" : "Normal value" }}`

# 七、高级功能与最佳实践

## （一）使用子工作流

对于复杂的自动化任务，可以将工作流拆分为多个子工作流：

1. 创建一个执行特定功能的工作流
2. 在主工作流中使用"Execute Workflow"节点调用子工作流
3. 通过参数传递数据给子工作流

## （二）错误处理

为确保工作流的稳定性，应该添加错误处理机制：

1. 使用"Error Trigger"节点捕获错误
2. 配置节点的"Continue on Fail"选项
3. 添加条件分支处理不同情况

## （三）安全最佳实践

1. **凭证加密**：设置`N8N_ENCRYPTION_KEY`环境变量
2. **访问控制**：启用基本身份验证
3. **API密钥轮换**：定期更新集成服务的API密钥
4. **数据过滤**：仅处理必要的数据字段
5. **日志管理**：定期检查和清理日志

## （四）性能优化

1. **批处理**：处理大量数据时使用批处理模式
2. **缓存**：对频繁访问的数据进行缓存
3. **资源分配**：为n8n分配足够的CPU和内存资源
4. **数据库优化**：定期维护数据库，清理过期执行数据

# 八、常见问题与解决方案

## （一）Webhook无法触发

1. **检查网络连接**：确保服务器可以从互联网访问
2. **检查端口**：确认端口已正确开放
3. **检查URL**：验证Webhook URL是否正确
4. **检查防火墙**：确保防火墙未阻止入站请求

## （二）节点执行失败

1. **检查凭证**：确认API密钥或账号密码正确
2. **检查API限制**：某些服务可能有API调用限制
3. **检查数据格式**：确保数据格式符合目标服务的要求
4. **启用调试模式**：在节点设置中启用调试获取详细错误信息

## （三）数据库连接问题

1. **检查连接字符串**：确认数据库连接参数正确
2. **检查权限**：确保数据库用户有足够的权限
3. **检查数据库状态**：确认数据库服务正常运行

## （四）性能问题

1. **优化工作流**：减少不必要的节点和操作
2. **增加资源**：为n8n容器分配更多的CPU和内存
3. **使用缓存**：对频繁使用的数据进行缓存
4. **分解工作流**：将大型工作流拆分为多个小型工作流

# 九、总结与展望

n8n作为一个强大的开源工作流自动化平台，为个人和企业提供了灵活、安全的自动化解决方案。通过本文的指导，读者可以快速搭建自己的n8n实例，并开始创建各种自动化工作流。

随着自动化需求的增长，n8n社区也在不断发展，提供更多的节点和功能。未来，n8n有望在以下方面继续发展：

1. **更多集成**：支持更多第三方服务和API
2. **增强的AI功能**：集成更多AI和机器学习能力
3. **更友好的用户界面**：简化复杂工作流的创建和管理
4. **更强大的企业功能**：满足大型组织的需求

对于希望深入了解n8n的用户，建议关注官方文档和社区论坛，参与讨论并分享经验，共同推动这个优秀的开源项目的发展。

## 参考资源

- [n8n官方文档](https://docs.n8n.io/)
- [n8n GitHub仓库](https://github.com/n8n-io/n8n)
- [n8n社区论坛](https://community.n8n.io/)
- [Docker官方文档](https://docs.docker.com/)
- [Node.js官方文档](https://nodejs.org/en/docs/) 