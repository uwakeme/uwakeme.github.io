---
title: 【AI】常用MCP服务器详解与应用指南
categories: AI
tags:
  - MCP
  - AI编程
  - 开发工具
  - Cursor
  - 工具集成
---

# 一、MCP服务器概述

MCP（Model Context Protocol）服务器是连接AI模型与外部工具、数据和系统的桥梁。通过MCP服务器，AI模型能够获取外部信息、执行特定任务并将结果返回，极大扩展了AI在编程和其他领域的能力范围。

## （一）MCP服务器的基本原理

MCP服务器基于一种标准化协议工作，该协议由Anthropic推出，允许AI模型：
- 识别可用工具及其功能
- 发送工具调用请求
- 接收工具执行结果
- 基于结果提供更准确的回应

## （二）MCP服务器的分类

根据功能和用途，MCP服务器主要分为以下几类：

1. **信息检索类**：如Web搜索、文档检索
2. **文件操作类**：如文件系统访问、代码分析
3. **开发工具类**：如GitHub集成、代码执行
4. **自动化类**：如浏览器自动化、UI测试
5. **数据处理类**：如数据库访问、数据分析
6. **辅助思考类**：如顺序思考工具、问题分解工具

# 二、常用MCP服务器详解

## （一）文件系统服务器

### 基本信息
- **名称**：File System MCP Server
- **功能**：提供本地文件系统访问能力
- **官方仓库**：[modelcontextprotocol/server-filesystem](https://github.com/modelcontextprotocol/servers/tree/main/src/filesystem)
- **安装命令**：

**NPX方式**：
```bash
npx -y @modelcontextprotocol/server-filesystem
```

**JSON配置（通用）**：
```json
{
  "mcpservers": {
    "filesystem": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem"
      ]
    }
  }
}
```

**Cursor配置**：
在Cursor中，导航至 Settings > Features > MCP Servers，点击"+ Add New MCP Server"，选择stdio类型，输入：
```
命令: npx -y @modelcontextprotocol/server-filesystem
```

**VS Code安装**：
```bash
code --install-mcp "{\"name\":\"filesystem\",\"command\":\"npx\",\"args\":[\"-y\",\"@modelcontextprotocol/server-filesystem\"]}"
```

**Claude Desktop配置**：
在Claude Desktop中，进入设置，添加新的MCP服务器，使用以下配置：
```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem"]
    }
  }
}
```

### 主要功能
- 读取文件内容
- 写入文件内容
- 列出目录内容
- 创建/删除文件和目录

### 使用场景
- 需要AI助手读取项目文件进行分析
- 需要AI助手创建或修改配置文件
- 需要AI助手管理文件系统

## （二）Web搜索服务器

### 基本信息
- **名称**：Brave Search MCP Server
- **功能**：提供网络搜索能力
- **官方仓库**：[smithery-ai/brave-search](https://github.com/smithery-ai/brave-search)
- **安装命令**：

**NPX方式**：
```bash
npx -y @smithery/cli@latest run @smithery-ai/brave-search --config "{\"braveApiKey\":\"YOUR_BRAVE_API_KEY\"}"
```

**JSON配置（通用）**：
```json
{
  "mcpservers": {
    "brave-search": {
      "command": "npx",
      "args": [
        "-y",
        "@smithery/cli@latest",
        "run",
        "@smithery-ai/brave-search",
        "--config",
        "{\"braveApiKey\":\"YOUR_BRAVE_API_KEY\"}"
      ]
    }
  }
}
```

**Cursor配置**：
在Cursor中，导航至 Settings > Features > MCP Servers，点击"+ Add New MCP Server"，选择stdio类型，输入：
```
命令: npx -y @smithery/cli@latest run @smithery-ai/brave-search --config "{\"braveApiKey\":\"YOUR_BRAVE_API_KEY\"}"
```

**VS Code安装**：
```bash
code --install-mcp "{\"name\":\"brave-search\",\"command\":\"npx\",\"args\":[\"-y\",\"@smithery/cli@latest\",\"run\",\"@smithery-ai/brave-search\",\"--config\",\"{\\\"braveApiKey\\\":\\\"YOUR_BRAVE_API_KEY\\\"}\"]}"
```

**Claude Desktop配置**：
在Claude Desktop中，进入设置，添加新的MCP服务器，使用以下配置：
```json
{
  "mcpServers": {
    "brave-search": {
      "command": "npx",
      "args": [
        "-y",
        "@smithery/cli@latest",
        "run",
        "@smithery-ai/brave-search",
        "--config",
        "{\"braveApiKey\":\"YOUR_BRAVE_API_KEY\"}"
      ]
    }
  }
}
```

### 主要功能
- 执行网络搜索查询
- 返回相关搜索结果
- 支持过滤和排序选项

### 使用场景
- 需要AI助手获取最新信息
- 需要AI助手查找特定主题的资料
- 需要AI助手验证事实或数据

## （三）GitHub集成服务器

### 基本信息
- **名称**：GitHub MCP Server
- **功能**：提供GitHub API集成能力
- **官方仓库**：[github/github-mcp-server](https://github.com/github/github-mcp-server)
- **安装命令**：

**Docker方式**：
```bash
docker run -i --rm -e GITHUB_PERSONAL_ACCESS_TOKEN=<your-token> ghcr.io/github/github-mcp-server
```

**JSON配置（通用）**：
```json
{
  "mcpservers": {
    "github": {
      "command": "docker",
      "args": [
        "run",
        "-i",
        "--rm",
        "-e",
        "GITHUB_PERSONAL_ACCESS_TOKEN",
        "ghcr.io/github/github-mcp-server"
      ],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "YOUR_GITHUB_TOKEN"
      }
    }
  }
}
```

**Cursor配置**：
在Cursor中，导航至 Settings > Features > MCP Servers，点击"+ Add New MCP Server"，选择stdio类型，输入：
```
命令: docker run -i --rm -e GITHUB_PERSONAL_ACCESS_TOKEN=<your-token> ghcr.io/github/github-mcp-server
```

**VS Code安装**：
```bash
code --install-mcp "{\"name\":\"github\",\"command\":\"docker\",\"args\":[\"run\",\"-i\",\"--rm\",\"-e\",\"GITHUB_PERSONAL_ACCESS_TOKEN\",\"ghcr.io/github/github-mcp-server\"],\"env\":{\"GITHUB_PERSONAL_ACCESS_TOKEN\":\"YOUR_GITHUB_TOKEN\"}}"
```

**Claude Desktop配置**：
在Claude Desktop中，进入设置，添加新的MCP服务器，使用以下配置：
```json
{
  "mcpServers": {
    "github": {
      "command": "docker",
      "args": [
        "run",
        "-i",
        "--rm",
        "-e",
        "GITHUB_PERSONAL_ACCESS_TOKEN",
        "ghcr.io/github/github-mcp-server"
      ],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "YOUR_GITHUB_TOKEN"
      }
    }
  }
}
```

### 主要功能
- 访问仓库内容
- 创建和更新文件
- 管理分支和提交
- 处理Issues和Pull Requests

### 使用场景
- 需要AI助手帮助管理GitHub仓库
- 需要AI助手分析代码变更
- 需要AI助手自动创建Issue或PR

## （四）Python代码执行服务器

### 基本信息
- **名称**：MCP Code Executor
- **功能**：提供Python代码执行环境
- **官方仓库**：[bazinga012/mcp_code_executor](https://github.com/bazinga012/mcp_code_executor)
- **安装命令**：

**NPX方式**：
```bash
npx -y mcp-code-executor
```

**JSON配置（通用）**：
```json
{
  "mcpservers": {
    "code-executor": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-code-executor"
      ],
      "env": {
        "CODE_STORAGE_DIR": "/path/to/code/storage",
        "ENV_TYPE": "conda",
        "CONDA_ENV_NAME": "your-conda-env"
      }
    }
  }
}
```

**Cursor配置**：
在Cursor中，导航至 Settings > Features > MCP Servers，点击"+ Add New MCP Server"，选择stdio类型，输入：
```
命令: npx -y mcp-code-executor
```

**VS Code安装**：
```bash
code --install-mcp "{\"name\":\"code-executor\",\"command\":\"npx\",\"args\":[\"-y\",\"mcp-code-executor\"],\"env\":{\"CODE_STORAGE_DIR\":\"/path/to/code/storage\",\"ENV_TYPE\":\"conda\",\"CONDA_ENV_NAME\":\"your-conda-env\"}}"
```

**Claude Desktop配置**：
在Claude Desktop中，进入设置，添加新的MCP服务器，使用以下配置：
```json
{
  "mcpServers": {
    "code-executor": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-code-executor"
      ],
      "env": {
        "CODE_STORAGE_DIR": "/path/to/code/storage",
        "ENV_TYPE": "conda",
        "CONDA_ENV_NAME": "your-conda-env"
      }
    }
  }
}
```

### 主要功能
- 执行Python代码
- 安装依赖包
- 检查已安装包
- 支持增量代码生成

### 使用场景
- 需要AI助手执行数据分析代码
- 需要AI助手测试和调试Python代码
- 需要AI助手生成可执行的代码示例

## （五）Puppeteer浏览器自动化服务器

### 基本信息
- **名称**：Puppeteer MCP Server
- **功能**：提供浏览器自动化能力
- **官方仓库**：[merajmehrabi/puppeteer-mcp-server](https://github.com/merajmehrabi/puppeteer-mcp-server)
- **安装命令**：

**NPX方式**：
```bash
npx -y puppeteer-mcp-server
```

**JSON配置（通用）**：
```json
{
  "mcpservers": {
    "puppeteer": {
      "command": "npx",
      "args": [
        "-y",
        "puppeteer-mcp-server"
      ]
    }
  }
}
```

**Cursor配置**：
在Cursor中，导航至 Settings > Features > MCP Servers，点击"+ Add New MCP Server"，选择stdio类型，输入：
```
命令: npx -y puppeteer-mcp-server
```

**VS Code安装**：
```bash
code --install-mcp "{\"name\":\"puppeteer\",\"command\":\"npx\",\"args\":[\"-y\",\"puppeteer-mcp-server\"]}"
```

**Claude Desktop配置**：
在Claude Desktop中，进入设置，添加新的MCP服务器，使用以下配置：
```json
{
  "mcpServers": {
    "puppeteer": {
      "command": "npx",
      "args": [
        "-y",
        "puppeteer-mcp-server"
      ]
    }
  }
}
```

### 主要功能
- 网页导航
- 截取屏幕截图
- 点击和填写表单
- 执行JavaScript代码
- 连接到现有Chrome实例

### 使用场景
- 需要AI助手自动化Web任务
- 需要AI助手测试网站功能
- 需要AI助手提取网页内容

## （六）Playwright浏览器自动化服务器

### 基本信息
- **名称**：Playwright MCP Server
- **功能**：提供跨浏览器自动化能力
- **官方仓库**：[microsoft/playwright-mcp](https://github.com/microsoft/playwright-mcp)
- **安装命令**：

**NPX方式**：
```bash
npx -y @playwright/mcp@latest
```

**JSON配置（通用）**：
```json
{
  "mcpservers": {
    "playwright": {
      "command": "npx",
      "args": [
        "-y",
        "@playwright/mcp@latest"
      ]
    }
  }
}
```

**Cursor配置**：
在Cursor中，导航至 Settings > Features > MCP Servers，点击"+ Add New MCP Server"，选择stdio类型，输入：
```
命令: npx -y @playwright/mcp@latest
```

**VS Code安装**：
```bash
code --install-mcp "{\"name\":\"playwright\",\"command\":\"npx\",\"args\":[\"-y\",\"@playwright/mcp@latest\"]}"
```

**Claude Desktop配置**：
在Claude Desktop中，进入设置，添加新的MCP服务器，使用以下配置：
```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": [
        "-y",
        "@playwright/mcp@latest"
      ]
    }
  }
}
```

### 主要功能
- 跨浏览器自动化（Chrome、Firefox、Safari）
- 页面快照和截图
- 元素交互（点击、输入、选择）
- 网络请求监控
- 支持无头和有头模式

### 使用场景
- 需要AI助手在多种浏览器中测试
- 需要AI助手分析网页结构
- 需要AI助手自动填写表单

## （七）顺序思考工具服务器

### 基本信息
- **名称**：Sequential Thinking MCP Server
- **功能**：提供结构化思考和问题分解能力
- **官方仓库**：[spences10/mcp-sequentialthinking-tools](https://github.com/spences10/mcp-sequentialthinking-tools)
- **安装命令**：

**NPX方式**：
```bash
npx -y mcp-sequentialthinking-tools
```

**JSON配置（通用）**：
```json
{
  "mcpservers": {
    "sequential-thinking": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-sequentialthinking-tools"
      ]
    }
  }
}
```

**Cursor配置**：
在Cursor中，导航至 Settings > Features > MCP Servers，点击"+ Add New MCP Server"，选择stdio类型，输入：
```
命令: npx -y mcp-sequentialthinking-tools
```

**VS Code安装**：
```bash
code --install-mcp "{\"name\":\"sequential-thinking\",\"command\":\"npx\",\"args\":[\"-y\",\"mcp-sequentialthinking-tools\"]}"
```

**Claude Desktop配置**：
在Claude Desktop中，进入设置，添加新的MCP服务器，使用以下配置：
```json
{
  "mcpServers": {
    "sequential-thinking": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-sequentialthinking-tools"
      ]
    }
  }
}
```

### 主要功能
- 分解复杂问题为可管理步骤
- 为每个步骤推荐合适的工具
- 提供信心评分和工具推荐理由
- 支持思考过程的分支和修订

### 使用场景
- 需要AI助手解决复杂问题
- 需要AI助手进行系统性分析
- 需要AI助手评估多种解决方案

# 三、MCP服务器的安装与配置

## （一）安装前准备

在安装MCP服务器之前，需要确保系统满足以下条件：

1. **Node.js环境**：大多数MCP服务器基于Node.js开发，需要安装Node.js和npm
2. **Docker**：某些MCP服务器提供Docker镜像，需要安装Docker
3. **Python环境**：Python相关的MCP服务器需要Python环境
4. **API密钥**：某些服务器（如搜索服务器）需要相应的API密钥

## （二）安装方法

MCP服务器的安装方法通常有以下几种：

### 1. 使用NPX直接运行

这是最简单的方法，无需本地安装，直接通过npx命令运行：

```bash
npx -y @modelcontextprotocol/server-filesystem
```

### 2. 使用Docker容器

对于提供Docker镜像的MCP服务器，可以通过Docker运行：

```bash
docker run -i --rm -e API_KEY=your_key image_name
```

### 3. 本地安装

先安装包，然后运行：

```bash
npm install -g package-name
package-name
```

## （三）配置方法

### 1. Claude Desktop配置

在Claude Desktop中配置MCP服务器：

1. 打开Claude Desktop
2. 进入设置
3. 添加新的MCP服务器
4. 输入配置信息（命令、参数和环境变量）

### 2. Cursor编辑器配置

在Cursor中配置MCP服务器：

1. 打开Cursor设置
2. 导航至Features > MCP Servers
3. 点击"+ Add New MCP Server"
4. 选择类型（通常是stdio）
5. 输入命令和参数

### 3. VS Code配置

在VS Code中配置MCP服务器：

1. 使用命令行安装MCP服务器
2. 或者在设置文件中添加配置

# 四、MCP服务器的应用实践

## （一）基本使用流程

使用MCP服务器的基本流程如下：

1. **安装和配置**：按照上述方法安装和配置MCP服务器
2. **启动AI助手**：打开支持MCP的AI助手（如Claude、Cursor中的Copilot）
3. **使用工具**：在对话中自然地描述需求，AI助手会自动调用相应的MCP工具
4. **审阅结果**：查看AI助手返回的结果，必要时提供反馈

## （二）常见应用场景

### 1. 代码开发场景

- 使用文件系统服务器读取和修改项目文件
- 使用GitHub服务器管理代码仓库
- 使用代码执行服务器测试代码片段

### 2. 信息检索场景

- 使用Web搜索服务器获取最新信息
- 使用浏览器自动化服务器提取特定网站内容

### 3. 自动化测试场景

- 使用Puppeteer或Playwright服务器进行UI自动化测试
- 结合代码执行服务器进行端到端测试

### 4. 问题解决场景

- 使用顺序思考工具服务器分解复杂问题
- 结合其他工具服务器实现完整解决方案

## （三）最佳实践

1. **组合使用**：将多个MCP服务器组合使用，发挥协同效应
2. **明确指令**：向AI助手提供明确的指令，帮助其选择合适的工具
3. **安全考虑**：对于敏感操作，设置适当的权限限制
4. **定期更新**：保持MCP服务器的版本更新，获取最新功能和安全修复

# 五、MCP服务器开发指南

## （一）开发环境设置

要开发自己的MCP服务器，需要准备以下环境：

1. **Node.js或Python**：根据偏好选择开发语言
2. **MCP SDK**：安装相应语言的MCP SDK
   - Node.js: `npm install @modelcontextprotocol/sdk`
   - Python: `pip install mcp`
3. **开发工具**：选择合适的IDE或编辑器

## （二）基本开发流程

1. **定义功能**：明确MCP服务器要提供的功能
2. **实现工具**：使用MCP SDK实现工具函数
3. **定义资源**：如果需要，实现资源访问功能
4. **测试**：使用MCP Inspector或AI助手测试服务器功能
5. **发布**：将MCP服务器发布为npm包或Python包

## （三）示例代码

### Node.js示例

```javascript
const { Server } = require('@modelcontextprotocol/sdk');

// 创建服务器
const server = new Server('example-server');

// 定义工具
server.registerTool({
  name: 'hello',
  description: '返回问候信息',
  parameters: {
    name: {
      type: 'string',
      description: '要问候的名字'
    }
  },
  handler: async (params) => {
    return `Hello, ${params.name}!`;
  }
});

// 启动服务器
server.start();
```

### Python示例

```python
from mcp.server.fastmcp import FastMCP

# 创建服务器
mcp = FastMCP("Example")

# 定义工具
@mcp.tool()
def hello(name: str) -> str:
    """返回问候信息"""
    return f"Hello, {name}!"

# 启动服务器
if __name__ == "__main__":
    mcp.run()
```

# 六、MCP服务器的未来发展

## （一）技术趋势

MCP服务器技术正在快速发展，未来可能会出现以下趋势：

1. **更多专业领域服务器**：针对特定行业或领域的专业MCP服务器
2. **更强的安全机制**：更完善的权限控制和安全审计
3. **更好的互操作性**：不同MCP服务器之间的协作能力
4. **更智能的工具推荐**：基于上下文自动推荐合适的工具

## （二）应用前景

MCP服务器在以下领域有广阔的应用前景：

1. **软件开发**：代码生成、测试、部署自动化
2. **数据分析**：数据获取、清洗、分析、可视化
3. **内容创作**：研究、写作、设计、发布
4. **知识管理**：信息检索、组织、总结、分享

## （三）参与贡献

如果你对MCP服务器感兴趣，可以通过以下方式参与贡献：

1. **使用现有服务器**：提供使用反馈和改进建议
2. **开发新服务器**：针对特定需求开发新的MCP服务器
3. **完善文档**：帮助改进MCP服务器的文档
4. **参与社区**：加入MCP相关的开发者社区

# 七、总结

MCP服务器作为AI模型与外部世界交互的桥梁，极大地扩展了AI助手的能力范围。通过本文介绍的七种常用MCP服务器，用户可以根据自己的需求选择合适的服务器，实现文件操作、网络搜索、代码执行、浏览器自动化等多种功能。

随着MCP技术的不断发展，我们可以期待更多功能强大、易于使用的MCP服务器出现，为AI助手提供更广泛的能力，帮助用户更高效地完成各种任务。

# 参考资料

1. [Model Context Protocol官方文档](https://modelcontextprotocol.io/)
2. [Anthropic Claude MCP指南](https://docs.anthropic.com/claude/docs/model-context-protocol-mcp)
3. [GitHub MCP Server文档](https://github.com/github/github-mcp-server)
4. [Awesome MCP Servers中文版](https://github.com/yzfly/Awesome-MCP-ZH) 