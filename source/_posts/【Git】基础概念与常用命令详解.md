---
title: 【Git】基础概念与常用命令详解
date: 2025-07-15
categories:
  - Git
tags:
  - Git
  - 版本控制
  - 命令行
---

# Git基础概念与常用命令详解

Git是当今最流行的分布式版本控制系统，用于跟踪文件的变化并协调多人协作开发。本文将详细介绍Git的基础概念和常用命令，帮助您高效地使用Git进行项目管理。

## 1. Git的核心概念

### 1.1 分布式版本控制

与集中式版本控制系统（如SVN）不同，Git是一个分布式版本控制系统，这意味着：

- 每个开发者都拥有完整的代码仓库副本
- 大多数操作都是本地执行，不需要联网
- 提供更好的分支管理和合并功能
- 更适合团队协作开发

### 1.2 Git的三个区域

Git项目有三个主要区域：

- **工作区（Working Directory）**：实际文件所在的目录
- **暂存区（Staging Area）**：临时保存你的改动
- **仓库（Repository）**：保存项目的所有历史版本

### 1.3 Git的文件状态

Git中文件的四种状态：

- **Untracked**：未被Git跟踪的新文件
- **Modified**：已修改但未暂存的文件
- **Staged**：已暂存准备提交的文件
- **Committed**：已提交到本地仓库的文件

## 2. 安装与配置Git

### 2.1 安装Git

**Windows**:
```bash
# 下载并安装Git for Windows
# https://git-scm.com/download/win
```

**macOS**:
```bash
# 使用Homebrew安装
brew install git
```

**Linux (Ubuntu/Debian)**:
```bash
sudo apt-get update
sudo apt-get install git
```

### 2.2 初始配置

```bash
# 设置用户名和邮箱（全局）
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# 设置默认编辑器
git config --global core.editor "vim"

# 查看所有全局配置
git config --global --list
```

## 3. Git仓库的创建与克隆

### 3.1 初始化新仓库

```bash
# 在当前目录初始化Git仓库
git init

# 在指定目录初始化Git仓库
git init <directory>
```

### 3.2 克隆现有仓库

```bash
# 克隆远程仓库到当前目录
git clone <repository-url>

# 克隆远程仓库到指定目录
git clone <repository-url> <directory>

# 克隆特定分支
git clone -b <branch-name> <repository-url>
```

## 4. 基本的Git工作流

### 4.1 查看状态与差异

```bash
# 查看仓库状态
git status

# 查看工作区与暂存区的差异
git diff

# 查看暂存区与最后一次提交的差异
git diff --staged
```

### 4.2 添加与暂存文件

```bash
# 添加指定文件到暂存区
git add <file-name>

# 添加多个文件到暂存区
git add <file1> <file2>

# 添加所有修改的文件到暂存区
git add .

# 交互式添加
git add -i
```

### 4.3 提交更改

```bash
# 提交暂存区的更改
git commit -m "提交信息"

# 跳过暂存区，直接提交所有已跟踪文件的更改
git commit -a -m "提交信息"

# 修改上一次提交
git commit --amend
```

### 4.4 撤销更改

```bash
# 撤销工作区的修改（未暂存）
git checkout -- <file-name>

# Git 2.23+新语法
git restore <file-name>

# 撤销暂存区的修改（已暂存未提交）
git reset HEAD <file-name>
# 或使用新语法
git restore --staged <file-name>

# 撤销最后一次提交（保留更改）
git reset --soft HEAD^

# 撤销最后一次提交（放弃更改）
git reset --hard HEAD^
```

## 5. 查看历史记录

```bash
# 查看提交历史
git log

# 简洁模式查看历史
git log --oneline

# 图形化显示分支历史
git log --graph --oneline --all

# 查看特定文件的历史
git log --follow <file-name>

# 查看每次提交的详细差异
git log -p

# 显示统计信息
git log --stat
```

## 6. 忽略文件

Git使用`.gitignore`文件来指定不需要跟踪的文件：

```
# .gitignore文件示例

# 忽略所有.log文件
*.log

# 忽略build目录
build/

# 忽略node_modules目录
node_modules/

# 忽略特定文件
config.ini
secrets.json

# 忽略所有.tmp文件，但不忽略important.tmp
*.tmp
!important.tmp
```

## 7. Git别名

创建命令别名以提高效率：

```bash
# 创建别名
git config --global alias.co checkout
git config --global alias.br branch
git config --global alias.ci commit
git config --global alias.st status

# 使用别名
git co main  # 等同于 git checkout main
```

## 8. 总结

本文介绍了Git的基础概念和常用命令，包括：

- Git的核心概念和工作区域
- Git的安装与初始配置
- 创建和克隆仓库
- 基本的Git工作流（添加、提交、撤销）
- 查看历史记录
- 使用.gitignore忽略文件
- 创建Git命令别名

掌握这些基础命令和概念，您就可以开始高效地使用Git进行日常开发工作。在下一篇文章中，我们将深入探讨Git分支管理和工作流策略。

## 参考资源

- [Git官方文档](https://git-scm.com/doc)
- [Pro Git书籍](https://git-scm.com/book/zh/v2)
- [Git Cheat Sheet](https://education.github.com/git-cheat-sheet-education.pdf) 