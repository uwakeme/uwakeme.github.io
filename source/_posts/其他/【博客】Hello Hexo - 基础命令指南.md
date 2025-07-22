---
title: 【博客】Hello Hexo - 基础命令指南
categories: 博客
tags:
  - HEXO
  - 博客
date: 2024/8/25
---

# Hexo博客常用命令指南

Hexo是一个快速、简洁且高效的博客框架，使用Markdown解析文章，可以在几秒内生成静态网页。本文将介绍Hexo的常用命令。

## 文章管理

### 创建一篇新文章

``` bash
$ hexo new "文章标题"
# 或简写为
$ hexo n "文章标题"
```

这将在`source/_posts/`目录下创建一个新的Markdown文件。

> 更多信息: [Writing](https://hexo.io/docs/writing.html)

### 创建一篇新草稿

``` bash
$ hexo new draft "草稿标题"
```

草稿会被保存在`source/_drafts/`目录下，默认情况下不会显示在网站上。

### 将草稿发布为正式文章

```bash
$ hexo publish "草稿标题"
# 或简写为
$ hexo p "草稿标题"
```

这将把草稿从`_drafts`目录移动到`_posts`目录，使其成为正式发布的文章。

## 站点管理

### 启动本地服务器预览

``` bash
$ hexo server
# 或简写为
$ hexo s
```

启动后可通过浏览器访问`http://localhost:4000`预览网站效果。

常用选项：
- `--draft`：显示草稿
- `--port=5000`：指定端口
- `--watch`：监视文件变动并自动刷新

> 更多信息: [Server](https://hexo.io/docs/server.html)

### 生成静态文件

``` bash
$ hexo generate
# 或简写为
$ hexo g
```

这会将Markdown文件及主题生成为静态HTML文件，保存在`public`目录。

常用选项：
- `-d, --deploy`：生成后立即部署
- `-w, --watch`：监视文件变动并自动重新生成

> 更多信息: [Generating](https://hexo.io/docs/generating.html)

### 部署至远程服务器

``` bash
$ hexo deploy
# 或简写为
$ hexo d
```

将生成的静态文件部署到远程服务器（如GitHub Pages）。
需要先在`_config.yml`中配置`deploy`部分。

> 更多信息: [Deployment](https://hexo.io/docs/one-command-deployment.html)

### 清除缓存和生成的文件

```bash
$ hexo clean
```

清除缓存文件(`db.json`)和已生成的静态文件(`public`目录)。
当遇到生成问题时，建议先运行此命令。

### 常用组合命令

```bash
# 清除缓存、生成静态文件并启动服务器
$ hexo clean && hexo g && hexo s

# 清除缓存、生成静态文件并部署
$ hexo clean && hexo g && hexo d
```

## 其他实用命令

### 显示网站信息

```bash
$ hexo info
```

### 列出网站中的所有分类

```bash
$ hexo list categories
```

### 列出网站中的所有标签

```bash
$ hexo list tags
```

### 列出网站中的所有文章

```bash
$ hexo list post
```

## 参考资料

- [Hexo官方文档](https://hexo.io/zh-cn/docs/)
- [Hexo GitHub仓库](https://github.com/hexojs/hexo)
