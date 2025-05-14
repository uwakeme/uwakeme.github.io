---
title: 【AI】为Cursor配置MCP服务器
categories: AI
tags:
  - Cursor
  - MCP
  - AI编程
  - 开发工具
  - AI
---

# 一、Cursor与MCP服务简介

Cursor是一款AI驱动的代码编辑器，通过集成大型语言模型（LLM）帮助开发者更高效地编写代码。而MCP（Model Context Protocol）是由Anthropic推出的开放标准协议，它允许AI模型与外部工具、数据和系统无缝交互，极大扩展了AI在编程环境中的能力。

配置MCP服务器主要有以下优势：
- 功能扩展：让AI能够访问外部数据、API和工具
- 自动化工作流：通过工具可以自动化许多开发任务
- 定制化能力：根据特定需求定制AI助手的能力
- 数据隐私：某些MCP服务器可本地运行，数据不离开本地环境

# 二、理解MCP（Model Context Protocol）

## 1. MCP的工作原理

MCP是一种通信协议，它建立了AI模型与外部工具之间的桥梁：
- AI模型可以请求使用工具完成特定任务
- 工具执行任务并将结果返回给AI模型
- AI模型基于返回结果提供更准确的回应

## 2. MCP服务器类型

MCP服务器主要分为几类：
- 浏览器自动化（如web搜索、网页交互）
- 代码与开发工具（如GitHub集成、运行代码）
- 数据库访问（如查询SQL数据库）
- 文件系统操作（如读写本地文件）
- 通讯工具（如Slack、Email集成）
- 搜索引擎（如Brave搜索、Google搜索）

# 三、在Cursor中配置MCP服务器

## 1. 打开MCP设置

1. 打开Cursor编辑器
2. 点击左下角的设置图标(⚙️)
3. 在Settings界面中，导航至"Features"部分
4. 找到并点击"MCP Servers"选项

**注意**：与VS Code不同，Cursor的设置菜单无法通过`Ctrl+,`快捷键打开。请使用界面左下角的设置图标。

## 2. 添加新的MCP服务器

1. 点击"+ Add New MCP Server"按钮
2. 在配置窗口中选择传输类型：
   - `stdio`：用于基于命令行的服务器（最常用）
   - `sse`：用于基于服务器发送事件的服务器
3. 输入服务器名称（便于识别）
4. 根据传输类型，输入相应的命令或URL
5. 点击"Add"保存配置

## 3. 常用MCP服务器示例

以下是一些常用的MCP服务器配置命令：

### Web搜索（Brave Search）

```
npx -y @smithery/cli@latest run @smithery-ai/brave-search --config "{\"braveApiKey\":\"YOUR_BRAVE_API_KEY\"}"
```

### 文件系统访问

```
npx -y @modelcontextprotocol/server-filesystem
```

### GitHub工具

```
npx -y @modelcontextprotocol/server-github
```

### 浏览器自动化

```
npx -y @modelcontextprotocol/server-puppeteer
```

### 代码执行（Python）

```
npx -y @pydantic/mcp-run-python
```

# 四、使用MCP工具

## 1. 在Cursor中使用MCP工具

一旦配置完成MCP服务器后，你可以在Cursor的聊天界面中：

1. 直接询问相关任务，AI会自动选择并使用适当的工具
2. 明确指示AI使用特定工具，例如：
   - "使用Web搜索查找最新的React文档"
   - "通过GitHub工具查看我这个仓库的issues"
   - "使用文件系统工具读取项目中的配置文件"

## 2. 检查MCP工具状态

1. 在Cursor的MCP设置页面，你可以看到已配置服务器的状态：
   - 绿色：服务器正常运行
   - 黄色：服务器可能存在问题
   - 红色：服务器无法连接
2. 如果状态不正常，可以尝试刷新或重启服务器

# 五、从MCP市场获取更多服务器

## 1. MCP服务器资源

你可以从以下资源获取更多MCP服务器：

- [Smithery](https://smithery.ai)：提供大量现成的MCP服务器
- [Awesome-MCP-ZH](https://github.com/yzfly/Awesome-MCP-ZH)：中文MCP资源精选
- [MCP.so](https://mcp.so)：MCP服务器目录网站
- [Cursor官方仓库](https://github.com/modelcontextprotocol/servers)：提供参考实现

## 2. 安装第三方MCP服务器

大多数第三方MCP服务器可以通过NPM或Python包管理器安装：

```bash
# 通过NPM安装
npx -y @organization/server-name

# 通过Python安装
pip install mcp-server-name
```

# 六、故障排查

## 1. 常见问题及解决方案

### MCP服务器状态显示为黄色或红色
- 尝试刷新服务器状态
- 检查命令是否正确
- 重启Cursor IDE

### 无法找到或使用MCP工具
- 确保在Composer或Agent模式下使用
- 明确指示AI使用MCP工具
- 检查服务器状态是否为绿色

### 安装MCP服务器时遇到权限问题
- 尝试以管理员身份运行终端
- 确保Node.js或Python有足够的权限

## 2. 检查MCP服务器日志

许多MCP服务器会输出日志信息，可以帮助你诊断问题：
- 在终端中运行MCP服务器命令查看实时日志
- 检查Cursor的日志文件（通常在设置中可找到路径）

# 七、Cursor常用快捷键

Cursor有一些特定的快捷键，与其他编辑器可能不同：

- `Ctrl+K` 或 `Cmd+K`（Mac）：打开命令面板
- `Ctrl+L` 或 `Cmd+L`（Mac）：打开AI聊天窗口
- `Ctrl+I` 或 `Cmd+I`（Mac）：打开AI Composer
- `Ctrl+Shift+I` 或 `Cmd+Shift+I`（Mac）：打开扩展AI Composer界面

**注意**：Cursor的快捷键可能与其他编辑器（如VS Code或JetBrains IDE）有所不同，特别是Cursor为AI功能预留了一些特定快捷键。

# 八、高级使用技巧

## 1. 创建自定义MCP服务器

如果你有特定需求，可以创建自己的MCP服务器：

1. 使用官方模板创建基本框架
2. 定义工具和资源
3. 实现工具功能
4. 发布并在Cursor中使用

## 2. 管理多个MCP服务器

根据不同项目需求，你可以管理多个MCP服务器配置：
- 保持核心服务器（如文件系统、搜索）始终开启
- 根据当前任务启用特定服务器
- 为不同项目创建不同的服务器配置组合

# 九、MCP使用最佳实践

1. **按需添加服务器**：只添加当前任务需要的MCP服务器
2. **定期更新**：MCP生态系统发展迅速，定期检查更新
3. **注意API密钥安全**：对于需要API密钥的服务器，妥善保管密钥
4. **学习各工具功能**：了解每个MCP工具的能力和限制
5. **组合使用**：多个MCP工具组合使用可以实现复杂工作流

MCP为Cursor带来了强大的扩展能力，通过合理配置和使用MCP服务器，可以大幅提升AI辅助编程的效率和能力范围。随着更多MCP服务器的出现，Cursor的能力也将不断扩展。