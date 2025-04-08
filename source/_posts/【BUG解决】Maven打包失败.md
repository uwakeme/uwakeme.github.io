---
title: 【BUG解决】Maven打包失败
categories: BUG解决
tags:
  - 打包
  - 后端
  - JAVA
  - MAVEN
date: 2025-04-07
---

# 插件版本不一致问题
+ 报错信息
```
[INFO] hussar-cloud-module ................................ SUCCESS [  0.010 s]
[INFO] hussar-cloud-module-example-api .................... SUCCESS [  5.644 s]
[INFO] hussar-cloud-module-example-feign .................. SUCCESS [  1.507 s]
[INFO] hussar-cloud-module-example-server ................. SUCCESS [  1.842 s]
[INFO] hussar-cloud-module-example-application ............ FAILURE [  2.512 s]
[INFO] ------------------------------------------------------------------------
[INFO] BUILD FAILURE
[INFO] ------------------------------------------------------------------------
[INFO] Total time:  12.210 s
[INFO] Finished at: 2025-04-07T11:36:57+08:00
[INFO] ------------------------------------------------------------------------
[ERROR] Failed to execute goal org.apache.maven.plugins:maven-resources-plugin:3.2.0:resources (default-resources) on project hussar-cloud-module-example-application: Input length = 1 -> [Help 1]
[ERROR]
[ERROR] To see the full stack trace of the errors, re-run Maven with the -e switch.
[ERROR] Re-run Maven using the -X switch to enable full debug logging.
[ERROR]
[ERROR] For more information about the errors and possible solutions, please read the following articles:
[ERROR] [Help 1] http://cwiki.apache.org/confluence/display/MAVEN/MojoExecutionException
[ERROR]
[ERROR] After correcting the problems, you can resume the build with the command
[ERROR]   mvn <args> -rf :hussar-cloud-module-example-application
```
+ 可能原因：插件版本兼容性问题 ：maven-resources-plugin 3.2.0版本可能与项目配置存在兼容性问题
+ 解决办法，降低maven-resources-plugin版本
```pom
<plugin>  
    <groupId>org.apache.maven.plugins</groupId>  
    <artifactId>maven-resources-plugin</artifactId>  
    <version>3.1.0</version>
</plugin>
```