---
title: 【AI】为Cursor配置MCP服务器
categories: AI
tags:
  - Cursor
  - MCP
  - AI编程
  - 开发工具
---

# 一、Cursor与MCP服务简介

Cursor是一款AI驱动的代码编辑器，通过集成大型语言模型（LLM）帮助开发者更高效地编写代码。而MCP（Model Control Protocol）服务器允许Cursor连接到自托管的AI模型，让您可以使用本地或私有部署的AI模型，而不是依赖默认的云端模型。

配置自己的MCP服务器主要有以下优势：
- 数据隐私：代码和提示不会发送到第三方服务器
- 降低延迟：本地模型可提供更快的响应时间
- 自定义模型：可以使用自己训练或微调的模型
- 离线工作：不依赖互联网连接

# 二、准备工作

## 1. 系统要求

运行MCP服务器的最低配置要求：
- CPU：至少8核心
- 内存：至少16GB RAM（推荐32GB以上）
- 存储：至少20GB可用空间
- GPU：推荐使用NVIDIA GPU（至少8GB显存）
- 操作系统：Windows 10/11、macOS或Linux

## 2. 安装必要工具

确保已安装以下工具：
- Python 3.8+
- pip或uv包管理工具
- Git（可选，用于拉取示例配置）

# 三、安装MCP服务器

## 1. 创建虚拟环境

使用UV工具创建虚拟环境（推荐）：

```bash
# 安装UV（如果尚未安装）
pip install uv

# 创建虚拟环境
uv venv cursor-mcp
```

或使用传统的venv：

```bash
# 创建虚拟环境
python -m venv cursor-mcp
```

## 2. 激活虚拟环境

Windows:
```bash
cursor-mcp\Scripts\activate
```

Linux/macOS:
```bash
source cursor-mcp/bin/activate
```

## 3. 安装MCP服务器

```bash
# 使用UV安装（推荐）
uv pip install cursor-mcp-server

# 或使用pip安装
pip install cursor-mcp-server
```

# 四、MCP服务器配置

## 1. 创建配置目录

```bash
mkdir -p ~/.cursor/mcp
cd ~/.cursor/mcp
```

## 2. 创建配置文件

创建`config.yaml`文件，内容如下：

```yaml
server:
  host: 127.0.0.1  # 本地访问
  port: 8765       # 默认MCP端口
  workers: 2       # 根据CPU核心数调整

model:
  # 本地模型配置
  provider: "openai"  # 可以是 "openai", "anthropic", "ollama" 等
  name: "gpt-4"       # 模型名称
  
  # 如果使用Ollama
  # provider: "ollama"
  # base_url: "http://localhost:11434"
  # name: "llama3"
  
  # 如果使用本地OpenAI兼容API
  # provider: "openai"
  # base_url: "http://localhost:1234/v1"
  # api_key: "sk-your-key-here"
  
  # 模型参数调整
  parameters:
    temperature: 0.1
    max_tokens: 2000
    top_p: 0.95

logging:
  level: "info"
  file: "~/.cursor/mcp/logs/mcp.log"
```

## 3. 配置模型

根据您的需求选择以下一种方式配置模型：

### 选项A：使用Ollama（简单易用）

1. 安装Ollama：
   ```bash
   # 安装Ollama
   curl -fsSL https://ollama.com/install.sh | sh
   ```

2. 拉取模型：
   ```bash
   # 拉取模型，例如llama3
   ollama pull llama3
   ```

3. 修改MCP配置：
   ```yaml
   model:
     provider: "ollama"
     base_url: "http://localhost:11434"
     name: "llama3"
   ```

### 选项B：使用本地部署的OpenAI兼容API

如果您有自己部署的OpenAI兼容API服务（如LM Studio、text-generation-webui等）：

```yaml
model:
  provider: "openai"
  base_url: "http://localhost:5000/v1"  # 替换为您的API地址
  api_key: "sk-any-key"                 # 如果需要API密钥
  name: "local-model"                   # 模型名称
```

## 4. 配置安全设置（可选）

如果您的MCP服务器需要通过网络访问，建议添加安全配置：

```yaml
security:
  authentication:
    enabled: true
    token: "your-secret-token-here"  # 创建一个强密码
  
  cors:
    enabled: true
    allowed_origins:
      - "https://cursor.sh"
      - "https://cursor.so"
```

# 五、启动MCP服务器

## 1. 启动服务

```bash
# 从虚拟环境中启动
cursor-mcp-server --config ~/.cursor/mcp/config.yaml
```

或创建一个启动脚本`start-mcp.sh`：

```bash
#!/bin/bash
source /path/to/cursor-mcp/bin/activate
cursor-mcp-server --config ~/.cursor/mcp/config.yaml
```

Windows批处理文件`start-mcp.bat`：

```batch
@echo off
call \path\to\cursor-mcp\Scripts\activate
cursor-mcp-server --config %USERPROFILE%\.cursor\mcp\config.yaml
```

## 2. 设置为系统服务（可选）

### Linux (systemd)

创建服务文件`/etc/systemd/system/cursor-mcp.service`：

```
[Unit]
Description=Cursor MCP Server
After=network.target

[Service]
Type=simple
User=yourusername
ExecStart=/path/to/cursor-mcp/bin/cursor-mcp-server --config /home/yourusername/.cursor/mcp/config.yaml
Restart=on-failure
RestartSec=5s

[Install]
WantedBy=multi-user.target
```

然后启用并启动服务：

```bash
sudo systemctl enable cursor-mcp
sudo systemctl start cursor-mcp
```

# 六、配置Cursor连接到MCP服务器

## 1. 打开Cursor设置

1. 打开Cursor编辑器
2. 点击右下角的⚙️图标或使用快捷键`Ctrl+,`（Windows/Linux）或`Cmd+,`（macOS）打开设置

## 2. 配置MCP服务器

1. 在设置中找到"AI"或"LLM"部分
2. 找到"MCP"或"自定义模型"设置
3. 启用MCP模式
4. 输入MCP服务器地址：`http://localhost:8765`（或您配置的其他地址）
5. 如果配置了认证，输入认证令牌
6. 保存设置

## 3. 验证连接

1. 重启Cursor
2. 尝试使用AI功能，如代码补全或命令
3. 检查MCP服务器日志确认请求已经通过本地模型处理

# 七、故障排查

## 1. MCP服务器启动问题

### 服务器无法启动
- 检查配置文件语法
- 确保端口未被占用：`netstat -ano | findstr 8765` (Windows) 或 `lsof -i:8765` (Linux/macOS)
- 检查日志文件

### 模型加载失败
- 确保模型名称正确
- 检查模型提供商是否正确配置
- 检查API密钥或路径是否有效

## 2. Cursor连接问题

### 无法连接到MCP服务器
- 确保MCP服务器已启动
- 验证Cursor中配置的URL是否正确
- 检查防火墙设置

### 连接成功但模型响应缓慢
- 考虑使用更轻量级的模型
- 检查GPU利用率和内存使用情况
- 调整配置文件中的`workers`数量

# 八、优化和最佳实践

1. **选择合适的模型**：根据您的硬件选择合适大小的模型，平衡性能和响应速度
2. **预热模型**：首次使用前先进行几次简单查询，提高后续响应速度
3. **定期更新**：定期更新MCP服务器和模型以获得最新功能和修复
4. **监控资源使用**：关注CPU、内存和GPU使用情况，必要时调整配置
5. **备份配置**：定期备份MCP配置文件
6. **设置自动重启**：配置服务在崩溃后自动重启

# 九、进阶功能

## 1. 使用自定义模型

如果您有自己微调的模型，可以在配置中指定：

```yaml
model:
  provider: "custom"
  path: "/path/to/your/custom/model"
  adapter: "ggml"  # 或其他适配器
```

## 2. 模型切换和多模型配置

创建多个配置文件，并根据需要启动不同的服务实例：

```bash
# 大模型配置（高质量但较慢）
cursor-mcp-server --config ~/.cursor/mcp/config-large.yaml --port 8765

# 小模型配置（快速但能力有限）
cursor-mcp-server --config ~/.cursor/mcp/config-small.yaml --port 8766
```

在Cursor中切换不同的MCP服务器地址即可使用不同模型。 