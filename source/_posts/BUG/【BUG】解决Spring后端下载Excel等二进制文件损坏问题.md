---
title: 【BUG】解决Spring后端下载Excel等二进制文件损坏问题
categories: BUG
date: 2025-11-05 11:21:54
tags:
  - Spring Boot
  - Maven
  - 文件下载
  - 二进制文件损坏
series:
cover: https://cdn.jsdelivr.net/gh/uwakeme/personal-image-repository/images/20251105112910196.png
---

# 一、问题背景

笔者在开发一个Spring Boot项目时，遇到了一个棘手的问题：通过后端接口下载位于`src/main/resources`目录下的Excel（`.xlsx`）文件，前端接收到的文件总是损坏的，无法正常打开。检查发现，下载后的文件大小与原始文件不一致，这表明文件内容在传输或处理过程中被修改了。

经过反复排查代码，从`Controller`层的文件读取和响应头设置，到`Service`层的业务逻辑，均未发现明显错误。然而，问题依旧存在，这让我不得不将目光投向项目构建工具——Maven。

# 二、问题根源分析

经过一番探索和查阅资料，笔者最终定位到问题根源在于Maven的资源过滤（resource filtering）机制。

## （一）Maven资源过滤机制

Maven在构建项目时，默认会开启资源过滤功能。它会扫描`src/main/resources`目录下的所有文件，并尝试替换其中用`${...}`包裹的占位符。这个功能在处理`application.properties`或`application.yml`等文本配置文件时非常有用，可以方便地实现动态配置。

然而，当这个机制应用于**二进制文件**（如Excel、Word、PDF、图片、压缩包等）时，就会引发灾难。Maven会错误地将这些二进制文件当作文本文件处理，扫描其中的字节流。一旦文件中的某些字节序列恰好符合`${...}`的模式，Maven就会尝试进行替换，从而破坏文件的原始二进制结构，导致文件损坏。

这就是为什么下载后的文件大小会发生变化，并且无法正常打开的原因。

## （二）问题复现

为了更直观地理解这个问题，我们可以设想一个场景：

一个`.xlsx`文件的二进制内容中，可能存在一个字节序列恰好是`24 7b 61 70 70 2e 6e 61 6d 65 7d`，这在ASCII编码中恰好对应字符串`${app.name}`。如果你的`pom.xml`或`application.properties`中定义了`app.name`属性，Maven就会用该属性的值去替换这个字节序列，从而导致Excel文件结构被破坏。

# 三、解决方案

既然问题出在Maven的资源过滤上，那么解决方案就是**阻止Maven对特定的二进制文件进行过滤**。

我们可以通过配置`maven-resources-plugin`插件来实现这一目标。在`pom.xml`文件的`<build>` -> `<plugins>`标签下，添加或修改以下配置：

```xml
<build>
    <plugins>
        <!-- Maven资源插件 -->
        <plugin>
            <groupId>org.apache.maven.plugins</groupId>
            <artifactId>maven-resources-plugin</artifactId>
            <version>2.6</version> <!-- 建议使用较新版本，但2.6版本已足够解决此问题 -->
            <configuration>
                <!-- 指定项目编码 -->
                <encoding>UTF-8</encoding>
                <!-- 
                  配置不需要被Maven过滤的文件扩展名
                  这部分是解决问题的关键！
                -->
                <nonFilteredFileExtensions>
                    <!-- Excel 2007及以上版本 -->
                    <nonFilteredFileExtension>xlsx</nonFilteredFileExtension>
                    <!-- Excel 97-2003版本 -->
                    <nonFilteredFileExtension>xls</nonFilteredFileExtension>
                    <!-- Word文档 -->
                    <nonFilteredFileExtension>doc</nonFilteredFileExtension>
                    <nonFilteredFileExtension>docx</nonFilteredFileExtension>
                    <!-- PDF文档 -->
                    <nonFilteredFileExtension>pdf</nonFilteredFileExtension>
                    <!-- 常见图片格式 -->
                    <nonFilteredFileExtension>png</nonFilteredFileExtension>
                    <nonFilteredFileExtension>gif</nonFilteredFileExtension>
                    <nonFilteredFileExtension>jpg</nonFilteredFileExtension>
                    <nonFilteredFileExtension>jpeg</nonFilteredFileExtension>
                    <!-- 压缩文件 -->
                    <nonFilteredFileExtension>zip</nonFilteredFileExtension>
                    <nonFilteredFileExtension>rar</nonFilteredFileExtension>
                </nonFilteredFileExtensions>
            </configuration>
        </plugin>
    </plugins>
</build>
```

### 配置解析

- **`<nonFilteredFileExtensions>`**：这个标签是整个解决方案的核心。它告诉Maven，在进行资源过滤时，跳过所有列出的文件扩展名。
- **`<nonFilteredFileExtension>`**：每个该标签定义一个不需要过滤的文件扩展名。

通过以上配置，Maven在打包时将不会处理`.xlsx`、`.xls`、`.pdf`等二进制文件，而是将它们原封不动地复制到目标目录（`target/classes`），从而保证了文件的完整性和正确性。

# 四、代码实现参考

虽然问题出在Maven配置，但一个健壮的文件下载接口代码同样重要。这里提供一个标准的Spring Boot文件下载接口实现，以供参考。

## （一）目录结构

```
src/main/resources/
└── templates/
    └── excel/
        └── user_template.xlsx
```

## （二）Controller代码

```java
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.URLEncoder;

@RestController
@RequestMapping("/api/download")
public class FileDownloadController {

    /**
     * 下载位于resources目录下的Excel模板文件
     * @param response HttpServletResponse对象，用于设置响应头
     */
    @GetMapping("/excel-template")
    public void downloadExcelTemplate(HttpServletResponse response) {
        ClassPathResource classPathResource = new ClassPathResource("/template/template.xlsx");

        // 验证文件是否存在
        if (!classPathResource.exists()) {
            response.sendError(HttpServletResponse.SC_NOT_FOUND, "Template file not found");
            return;
        }

        response.reset();
        // 设置响应头为二进制文件流
        response.setContentType("application/octet-stream");
        // 文件名（前端会重新设置）
        String filename = "template.xlsx";
        // 设置header，附件形式，方便下载
        response.addHeader("Content-Disposition", "attachment; filename=" + URLEncoder.encode(filename, "UTF-8"));
        // 设置文件长度头部
        response.setContentLengthLong(classPathResource.contentLength());

        InputStream is = null;
        BufferedInputStream inputStream = null;
        try {
            is = classPathResource.getInputStream();
            inputStream = new BufferedInputStream(is);
            // 获取响应的OutputStream
            ServletOutputStream outputStream = response.getOutputStream();
            byte[] b = new byte[1024];
            int len;
            // 从输入流中读取一定数量的字节，并将其存储在缓冲区字节数组中，读到末尾返回-1
            while ((len = inputStream.read(b)) > 0) {
                // 写入输出流中
                outputStream.write(b, 0, len);
            }
            outputStream.flush();
        } catch (IOException e) {
            e.printStackTrace();
            throw new IOException("模版下载失败");
        } finally {
            // 关闭外层输入流
            if (inputStream != null) {
                inputStream.close();
            }
            // 关闭内层输入流
            if (is != null) {
                is.close();
            }
        }
    }
}
```

# 五、总结

当遇到后端下载的二进制文件损坏时，应优先排查是否是Maven或Gradle等构建工具的资源过滤机制导致。在Spring Boot项目中，通过在`pom.xml`中配置`maven-resources-plugin`并指定`<nonFilteredFileExtensions>`，可以有效避免此类问题的发生。

这个小小的配置项，体现了项目构建过程中细节的重要性，也是每一位Java开发者都应该了解的知识点。