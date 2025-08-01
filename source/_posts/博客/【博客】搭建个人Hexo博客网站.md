---
title: 【博客】搭建个人Hexo博客网站
categories: 博客
tags:
  - 博客
  - HEXO
---

# 一、准备环境

## 1、安装node

+ 访问Node.js官网：https://nodejs.org/
+ 下载LTS (长期支持版本)
+ 安装时保持默认选项即可
+ 安装完成后，打开命令提示符验证安装：
  ```shell
  node -v
  ```

## 2、安装npm

+ npm已包含在Node.js安装包中，安装Node.js时会自动安装
+ 打开命令提示符验证安装：
  ```shell
  npm -v
  ```
+ 更新npm到最新版本（可选）：
  ```shell
  npm install -g npm
  ```

## 3、安装hexo

+ 打开命令提示符，以管理员身份运行以下命令
+ ```shell
  npm install -g hexo
  hexo -v
  ```



# 二、Git仓库准备

## 1、新建git仓库

+ 在GitHub/Gitee上创建一个新的仓库
+ 仓库名称建议设置为：`用户名.github.io`（使用GitHub Pages时）或自定义名称
+ 初始化时不需要添加README文件

## 2、本地同步git仓库

+ 在一个空白文件夹中，右键打开git bash，输入命令，将git仓库拉下来

  ```shell
  git clone 仓库地址
  ```
  > 如果使用SSH连接，请确保已配置SSH密钥




# 三、Hexo博客搭建

## 1、基础环境搭建

+ 进入到刚拉下来的文件夹中，打开cmd

+ 初始化指令

  ```shell 
  hexo init .
  ```
  > 注意：使用点号`.`表示在当前目录初始化，或者可以使用`hexo init myHexoBlob`创建新文件夹

  ![image-20240826170444846](/img/post/搭建博客网站.assets/image-20240826170444846.png)

  这样hexo的配置文件就初始化好了

+ 然后重新用管理员运行cmd，并切换到hexo新生成的文件夹中，安装依赖

  ![image-20240826170910180](/img/post/搭建博客网站.assets/image-20240826170910180.png)

## 2、启动hexo

```shell
# 每次更改数据后都要执行下面三个命令
# 清除缓存文件
hexo clean
# 生成静态文件 可简写为 hexo g
hexo generate   
# 启动服务器 可简写为 hexo s
hexo server
```

![image-20240826172804368](/img/post/搭建博客网站.assets/image-20240826172804368.png)

## 3、更换主题

+ 以管理员身份运行命令提示符，切换当前目录到 hexo项目 目录，运行命令安装Fluid主题

  ```shell
  npm install --save hexo-theme-fluid
  ```
  ![image-20240826173132910](/img/post/搭建博客网站.assets/image-20240826173132910.png)
+ 修改hexo的配置文件 `_config.yml`，找到theme字段，修改为：

  ```yaml
  theme: fluid
  ```

+ 在项目根目录下新建一个文件，命名为 `_config.fluid.yml`
  > 只要存在于 `_config.fluid.yml` 的配置都是高优先级，修改原 `_config.yml` 是无效的。以后我们就对 `_config.fluid.yml` 进行修改即可。

+ 可以从fluid主题的GitHub仓库中复制一份默认的配置文件：
  https://github.com/fluid-dev/hexo-theme-fluid/blob/master/_config.yml

+ 重新编译并重启项目即可

  ```shell
  hexo clean && hexo g && hexo s
  ```

## 4、自定义配置

+ 修改网站基本信息，编辑根目录的 `_config.yml`：

  ```yaml
  # 网站标题
  title: 您的博客标题
  
  # 网站描述
  description: 您的博客描述
  
  # 作者信息
  author: 您的名字
  
  # 网站语言
  language: zh-CN
  
  # 时区
  timezone: Asia/Shanghai
  ```

+ 修改主题配置，编辑 `_config.fluid.yml`：

  ```yaml
  # 首页标语
  index:
    slogan:
      enable: true
      text: "这是我的个人博客"
      
  # 导航菜单
  navbar:
    menu:
      - { key: "首页", link: "/" }
      - { key: "归档", link: "/archives/" }
      - { key: "分类", link: "/categories/" }
      - { key: "标签", link: "/tags/" }
      - { key: "关于", link: "/about/" }
  ```

## 5、部署到GitHub Pages
  ![image-20240826173132910](/img/post/搭建博客网站.assets/image-20240826173132910.png)
+ 安装部署插件

  ```shell
  npm install hexo-deployer-git --save
  ```

+ 修改根目录下的 `_config.yml` 文件，找到 `deploy` 部分，改为：

  ```yaml
  deploy:
    type: git
    repo: https://github.com/用户名/用户名.github.io.git
    branch: main
  ```

+ 部署命令

  ```shell
  hexo clean && hexo g && hexo deploy
  ```

+ 完成部署后，通常可以通过 `https://用户名.github.io` 访问您的博客

# 四、写作和管理文章

## 1、创建新文章

```shell
hexo new "文章标题"
```

## 2、创建草稿

```shell
hexo new draft "草稿标题"
```

## 3、预览草稿

```shell
hexo server --draft
```

## 4、发布草稿

```shell
hexo publish "草稿标题"
```

# 五、常见问题解决

1. 图片显示问题：建议将图片放在 `source/images` 目录下，然后在文章中使用相对路径引用。

2. 部署失败：确保Git配置正确，SSH密钥已配置（如果使用SSH）。

3. 主题更新：定期更新主题以获取新功能和修复。
   ```shell
   npm update hexo-theme-fluid
   ```

4. 备份：定期将整个博客目录备份，特别是 `source` 文件夹和配置文件。

