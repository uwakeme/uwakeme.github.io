# Uwakeme 技术博客

一个基于 Hexo 框架的个人技术博客项目，专注于分享技术知识、学习心得和生活感悟。

## 项目简介

本项目是一个使用 Hexo 搭建的静态博客网站，主题采用 Fluid，部署在 GitHub Pages 上。博客内容主要涵盖 Web 开发、后端技术、编程语言学习、算法解析等技术领域，旨在记录个人学习过程并分享技术经验。

## 功能特点

- **内容丰富**：涵盖前端、后端、算法、AI、数据库等多个技术领域
- **分类清晰**：按照【分类】标题格式组织文章，便于查找和阅读
- **美观易用**：采用 Fluid 主题，界面简洁美观，阅读体验良好
- **搜索功能**：支持本地搜索，快速查找所需内容
- **图表支持**：集成 Mermaid 图表功能，支持绘制流程图、时序图等
- **SEO 优化**：针对搜索引擎进行了优化设置，提高博客可见性

## 技术栈

- **框架**：Hexo 7.3.0
- **主题**：Fluid 1.9.8
- **部署**：GitHub Pages
- **渲染**：EJS、Marked、Stylus
- **其他**：支持 Mermaid 图表、本地搜索等功能

## 目录结构

```
hexo_blog/
├── source/             # 博客文章源文件
│   ├── _posts/         # 博客文章 Markdown 文件
│   └── ...
├── themes/             # 主题文件
│   └── fluid/          # Fluid 主题
├── scaffolds/          # 模板文件
├── _config.yml         # Hexo 配置文件
├── _config.fluid.yml   # Fluid 主题配置文件
├── package.json        # 依赖包配置
├── hexo.sh             # 快速部署脚本
├── new_note.sh         # 快速创建笔记脚本
└── ...
```

## 安装与使用

### 环境要求

- Node.js (推荐 12.0 以上版本)
- Git

### 安装步骤

1. 克隆仓库

```bash
git clone https://github.com/uwakeme/hexo_blog.git
cd hexo_blog
```

2. 安装依赖

```bash
npm install
# 或使用 Yarn
yarn install
```

3. 本地预览

```bash
hexo clean && hexo server
# 或使用脚本
./hexo.sh
```

4. 访问 `http://localhost:4000` 查看效果

### 创建新文章

```bash
# 使用 Hexo 命令
hexo new "文章标题"

# 或使用脚本（交互式）
./new_note.sh
```

### 部署到 GitHub Pages

```bash
# 一键部署
./hexo.sh
```

## 博客内容分类

本博客包含以下主要分类：

- **【前端】**：Vue、React、Angular 等前端框架和技术
- **【后端】**：Java、Python、Node.js 等后端开发技术
- **【算法】**：算法学习笔记和解析
- **【学习】**：各种技术学习笔记和指南
- **【学习路线】**：各编程语言和技术栈的学习路线
- **【Java】**：Java 相关技术和工具类
- **【AI】**：人工智能相关技术和应用
- **【BUG】**：常见问题和解决方案
- **【求职】**：技术面试和求职相关内容

## 自定义配置

### 修改站点信息

编辑 `_config.yml` 文件：

```yaml
title: Uwakeme
subtitle: '一起学习，一起进步'
description: 'Wake的个人技术博客，专注分享技术知识、学习心得和生活感悟。'
keywords: 技术博客, Web开发, 后端开发, Java, Python, 人工智能, 编程学习, 技术分享
author: Wake
```

### 修改主题配置

编辑 `_config.fluid.yml` 文件，根据需要调整主题外观和功能。

## 贡献指南

欢迎对本项目提出建议和改进：

1. Fork 本仓库
2. 创建您的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交您的更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启一个 Pull Request

## 许可证

本项目采用 MIT 许可证 - 详情请参阅 [LICENSE](LICENSE) 文件

## 联系方式

- 博客：[https://uwakeme.top](https://uwakeme.top)
- GitHub：[https://github.com/uwakeme](https://github.com/uwakeme)

## 致谢

- [Hexo](https://hexo.io/)：强大的静态博客框架
- [Fluid](https://github.com/fluid-dev/hexo-theme-fluid)：优秀的 Hexo 主题
- 所有博客文章中引用的参考资料和开源项目 