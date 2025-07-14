---
title: 【学习】SpringBoot集成积木报表JimuReport实践
categories: 学习
tags:
  - SpringBoot
  - JimuReport
  - 报表
  - 数据可视化
  - Java
---

# 前言

在企业级应用开发中，报表系统是不可或缺的一环，用于数据展示、分析和决策支持。积木报表（JimuReport）是一款开源免费、功能强大、基于Web的报表设计与生成工具，它采用拖拽式设计，支持多种数据源，可以快速制作各种复杂报表、图表、仪表盘甚至大屏。本文将介绍如何在Spring Boot项目中集成积木报表，并进行基本的使用。

# 一、积木报表简介

## （一）主要特性

- **在线设计**：提供类Excel操作风格的Web报表设计器，通过拖拽即可完成报表设计。
- **多种数据源支持**：支持MySQL, Oracle, SQLServer, PostgreSQL等主流关系型数据库，以及API、JSON、Excel等多种数据源。
- **丰富的功能**：涵盖数据报表、打印设计、图表报表、大屏设计、仪表盘等。
- **灵活部署**：可以与Spring Boot项目快速集成。
- **免费开源**：功能免费，可以商用，但代码不开放（指核心设计器部分，集成starter是开源的）。

## （二）适用场景

- 快速开发各类业务报表。
- 制作数据可视化大屏和仪表盘。
- 需要复杂打印设计的场景（如套打）。
- 替代部分商业BI工具，降低成本。

# 二、Spring Boot项目集成积木报表

以下步骤基于积木报表官方文档，指导如何在Spring Boot项目中集成积木报表。

## （一）添加Maven依赖

首先，在您的Spring Boot项目的 `pom.xml` 文件中添加积木报表的依赖。

```xml
<properties>
    <!-- 根据您的项目JDK版本设置 -->
    <java.version>1.8</java.version>
    <!-- 积木报表版本，请从官网或Maven中央仓库查询最新稳定版 -->
    <jimureport.version>1.6.5</jimureport.version>
</properties>

<!-- 配置远程仓库，如果Maven中央仓库下载慢或找不到，可以尝试阿里云或官方仓库 -->
<repositories>
    <repository>
        <id>aliyun</id>
        <name>aliyun Repository</name>
        <url>https://maven.aliyun.com/repository/public</url>
        <snapshots>
            <enabled>false</enabled>
        </snapshots>
    </repository>
    <repository>
        <id>jeecg</id>
        <name>jeecg Repository</name>
        <url>https://maven.jeecg.org/nexus/content/repositories/jeecg</url>
        <snapshots>
            <enabled>false</enabled>
        </snapshots>
    </repository>
</repositories>

<dependencies>
    <!-- Spring Boot Web Starter (通常已有) -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    <!-- Spring Boot Freemarker Starter (积木报表可能需要) -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-freemarker</artifactId>
    </dependency>

    <!-- JimuReport 核心依赖 -->
    <dependency>
        <groupId>org.jeecgframework.jimureport</groupId>
        <artifactId>jimureport-spring-boot-starter</artifactId>
        <version>${jimureport.version}</version>
    </dependency>

    <!-- 数据库驱动 (根据您项目连接的数据库选择添加) -->
    <!-- MySQL -->
    <dependency>
        <groupId>mysql</groupId>
        <artifactId>mysql-connector-java</artifactId>
        <!-- <version>8.0.28</version> 根据实际情况选择版本 -->
        <scope>runtime</scope>
    </dependency>
    <!-- Oracle (示例) -->
    <!--
    <dependency>
        <groupId>com.oracle.database.jdbc</groupId>
        <artifactId>ojdbc8</artifactId>
        <scope>runtime</scope>
    </dependency>
    -->
    <!-- SQL Server (示例) -->
    <!--
    <dependency>
        <groupId>com.microsoft.sqlserver</groupId>
        <artifactId>mssql-jdbc</artifactId>
        <scope>runtime</scope>
    </dependency>
    -->

    <!-- 文件上传可能需要的MinIO依赖 (如果使用MinIO作为文件存储) -->
    <dependency>
        <groupId>io.minio</groupId>
        <artifactId>minio</artifactId>
        <version>8.4.3</version> <!-- 请使用与积木报表兼容的版本 -->
        <optional>true</optional>
    </dependency>
</dependencies>
```
**注意**：请访问积木报表官方文档或Maven中央仓库确认最新的 `jimureport.version` 和其他相关依赖的版本。

## （二）数据库初始化

积木报表需要自己的数据库表来存储报表定义、数据源配置等信息。
1.  从积木报表官网下载最新的SQL初始化脚本（通常名为 `jimureport.sql` 或类似）。
2.  在您的业务数据库或者为积木报表单独准备一个数据库中执行此脚本，创建所需的表结构。

## （三）配置文件 (`application.yml` 或 `application.properties`)

配置数据库连接以及积木报表的相关参数。

```yaml
server:
  port: 8080 # 您的应用端口
spring:
  application:
    name: my-jimu-app
  # 配置积木报表使用的数据库连接信息 (通常与您业务数据源一致，或单独配置)
  datasource:
    url: jdbc:mysql://localhost:3306/your_database_for_jimureport?characterEncoding=UTF-8&useUnicode=true&useSSL=false&serverTimezone=Asia/Shanghai
    username: root
    password: your_password
    driver-class-name: com.mysql.cj.jdbc.Driver # 或 com.mysql.jdbc.Driver
    # HikariCP 连接池配置 (可选, Spring Boot 默认)
    # hikari:
    #   connection-timeout: 30000
    #   idle-timeout: 600000
    #   max-lifetime: 1800000
    #   maximum-pool-size: 10
    #   minimum-idle: 5

  # 配置静态资源访问路径 (如果需要)
  mvc:
    static-path-pattern: /static/**
  web:
    resources:
      static-locations: classpath:/static/

# JimuReport 相关配置
# minidao 配置 (积木报表内部使用)
minidao:
  base-package: org.jeecg.modules.jmreport.desreport.dao* # 默认扫描包路径
  db-type: mysql # 根据您的数据库类型配置: mysql, oracle, sqlserver, postgresql 等

# jeecg 配置 (积木报表相关)
jeecg:
  jmreport:
    # 设计器中报表自动保存配置
    autoSave: true # 是否开启自动保存 true/false
    interval: 300000 # 自动保存间隔时间，单位毫秒，默认5分钟 (5*60*1000)
    # 报表文件上传配置
    # uploadType: local # 文件存储类型: local (本地), minio (MinIO对象存储), alioss (阿里云OSS)
    # path: # 本地存储路径配置 (如果 uploadType 为 local)
    #   upload: D:/jimu_uploads # 自定义文件上传的基础路径
    # oss: # 阿里云OSS配置 (如果 uploadType 为 alioss)
    #   endpoint: oss-cn-beijing.aliyuncs.com
    #   accessKey: your_access_key
    #   secretKey: your_secret_key
    #   bucketName: your_bucket_name
    #   staticDomain: # 可选, 自定义CDN域名
    # minio: # MinIO配置 (如果 uploadType 为 minio)
    #   minio_url: http://localhost:9000
    #   minio_name: your_minio_access_key
    #   minio_pass: your_minio_secret_key
    #   bucketName: jmreport
    # token验证配置 (可选，用于API鉴权等)
    # token:
    #   header: x-access-token # header中token的名称
    #   secret: your_jwt_secret # jwt密钥
    #   expireTime: 7200 # token过期时间，单位秒
    #   custom: false # 是否开启自定义token验证逻辑

# 输出积木报表相关的SQL日志 (可选，便于调试)
logging:
  level:
    org.jeecg.modules.jmreport: debug
    # org.jeecg.common. கடல்.base.BaseMap DAO的SQL日志
    # org.jeecg.common. 海豚.base.dao: debug
```
请根据您的实际情况修改上述配置，特别是数据库连接信息和文件上传配置。

## （四）启动类配置

在Spring Boot的主启动类上，需要添加扫描积木报表相关包的注解。

```java
package com.example.demo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication(scanBasePackages = {"com.example.demo", "org.jeecg.modules.jmreport"})
// 如果您的项目包结构与 "com.example.demo" 不同，请相应修改
// 确保 "org.jeecg.modules.jmreport" 被扫描到，这是积木报表的核心包
public class DemoApplication {

    public static void main(String[] args) {
        SpringApplication.run(DemoApplication.class, args);
    }

}
```
如果您的启动类已经在根包下，`@SpringBootApplication` 默认会扫描其下所有子包，可能不需要显式添加 `org.jeecg.modules.jmreport`。但为了确保，可以显式指定。

## （五）访问积木报表设计器

启动您的Spring Boot应用后，可以通过以下URL访问积木报表的设计器界面：

`http://localhost:8080/jmreport/list`

（请将 `localhost:8080` 替换为您的实际应用访问地址和端口）

如果一切配置正确，您应该能看到积木报表的列表页面，并可以开始创建和设计报表。

# 三、基本使用步骤

1.  **配置数据源**：在积木报表设计器界面，首先需要配置数据源，即告诉积木报表从哪个数据库或API获取数据。
2.  **新建报表**：创建一个新的报表设计。
3.  **设计报表**：
    *   **数据集**：编写SQL查询语句或配置API来获取报表所需的数据。
    *   **布局设计**：在设计区拖拽字段、文本、图表等元素，设计报表的展现样式。
    *   **参数设置**：如果报表需要动态查询条件，可以设置参数。
4.  **预览与发布**：设计完成后，可以预览报表效果，确认无误后保存并发布。
5.  **集成到业务系统**：
    *   **iframe嵌入**：最简单的方式是将报表预览URL通过iframe嵌入到您的业务系统中。
    *   **API调用**：积木报表也提供API接口，可以通过API获取报表数据或进行更深度的集成。

# 四、常见问题与注意事项

1.  **依赖冲突**：集成第三方库时，可能会遇到版本冲突。请仔细检查 `pom.xml`，并使用Maven的依赖树分析工具 (`mvn dependency:tree`) 来排查。
2.  **数据库驱动**：确保项目中添加了对应数据库的正确JDBC驱动。
3.  **SQL方言**：积木报表的 `minidao.db-type` 配置需要与您使用的数据库类型匹配，以确保SQL语法的正确性。
4.  **文件上传路径**：如果使用本地存储 (`uploadType: local`)，确保配置的 `path.upload` 目录存在并且应用有写入权限。
5.  **版本兼容性**：积木报表版本更新较快，请留意官方的升级说明和版本兼容性。
6.  **安全性**：对于生产环境，务必考虑积木报表访问的安全性，例如通过Spring Security等框架进行权限控制。积木报表本身也提供了一些权限配置。
7.  **中文乱码**：确保数据库连接URL中正确设置了字符集（如 `characterEncoding=UTF-8`），以及服务器和数据库的字符集配置一致。

# 五、总结

积木报表为Spring Boot项目提供了一个快速、高效的报表解决方案。通过简单的配置和在线设计，可以大大提升报表开发效率。当然，深入使用其高级功能（如图表、大屏、复杂打印、权限集成等）还需要进一步学习官方文档和实践。

# 六、参考资料

-   积木报表官方文档: [http://report.jeecg.com/](http://report.jeecg.com/) (请查找最新官方文档地址)
-   积木报表GitHub或Gitee: (通常可以在官网找到链接)

--- 