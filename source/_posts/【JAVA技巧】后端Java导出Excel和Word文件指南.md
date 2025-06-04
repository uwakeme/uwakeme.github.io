---
title: 【JAVA技巧】后端Java导出Excel和Word文件指南
categories: JAVA技巧
tags:
  - JAVA
  - Excel
  - Word
  - Apache POI
  - EasyExcel
  - poi-tl
  - 后端
---

# 前言

在后端开发中，生成和导出Excel、Word等办公文档是一项常见的需求，例如报表导出、数据汇总、合同生成等。Java生态系统提供了多种强大的库来帮助我们完成这些任务。本文将重点介绍使用Apache POI、EasyExcel导出Excel文件，以及使用Apache POI (XWPF)和poi-tl导出Word文件的方法。

# 一、导出Excel文件

Excel文件因其强大的数据组织和分析能力，在企业应用中广泛使用。下面介绍两种主流的Java库进行Excel导出的方法。

## （一）使用 Apache POI 导出 Excel

Apache POI 是一个非常成熟和功能强大的库，可以操作Microsoft Office格式的文件，包括Excel (`.xls` 和 `.xlsx`)。

### 1. 添加依赖 (Maven)

```xml
<dependency>
    <groupId>org.apache.poi</groupId>
    <artifactId>poi</artifactId>
    <version>5.2.5</version> <!-- 请使用最新稳定版本 -->
</dependency>
<dependency>
    <groupId>org.apache.poi</groupId>
    <artifactId>poi-ooxml</artifactId>
    <version>5.2.5</version> <!-- 请使用最新稳定版本 -->
</dependency>
```

- `poi`: 核心API，支持老的 `.xls` 格式 (HSSF)。
- `poi-ooxml`: 支持新的 `.xlsx` 格式 (XSSF)，推荐使用。

### 2. 导出步骤

导出Excel的基本步骤如下：

a. 创建工作簿 (Workbook)
   - `HSSFWorkbook` 用于 `.xls` 文件。
   - `XSSFWorkbook` 用于 `.xlsx` 文件。
   - `SXSSFWorkbook` 用于大数据量的 `.xlsx` 文件，它是一种流式API，可以有效减少内存占用。

b. 创建工作表 (Sheet)

c. 创建行 (Row)

d. 创建单元格 (Cell)

e. 设置单元格内容和样式 (可选)

f. 将工作簿写入输出流 (例如 `HttpServletResponse.getOutputStream()`)

### 3. 示例代码 (导出 `.xlsx`)

```java
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.apache.poi.xssf.streaming.SXSSFWorkbook;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.OutputStream;
import java.util.List;

// 假设我们有一个 UserDto 类
class UserDto {
    private Long id;
    private String username;
    private String email;
    // getters and setters

    public UserDto(Long id, String username, String email) {
        this.id = id;
        this.username = username;
        this.email = email;
    }

    public Long getId() { return id; }
    public String getUsername() { return username; }
    public String getEmail() { return email; }
}

public class ExcelExportService {

    public void exportUsersToExcel(List<UserDto> users, HttpServletResponse response) throws IOException {
        // 1. 创建 Workbook (SXSSFWorkbook 适合大数据量)
        // Workbook workbook = new XSSFWorkbook(); // 普通XSSF
        SXSSFWorkbook workbook = new SXSSFWorkbook(100); // 内存中保留 100 行，超出部分写入临时文件
        workbook.setCompressTempFiles(true); // 压缩临时文件

        // 2. 创建 Sheet
        Sheet sheet = workbook.createSheet("用户信息");

        // 3. 创建表头行
        Row headerRow = sheet.createRow(0);
        String[] headers = {"ID", "用户名", "邮箱"};
        CellStyle headerStyle = workbook.createCellStyle();
        Font headerFont = workbook.createFont();
        headerFont.setBold(true);
        headerStyle.setFont(headerFont);
        // headerStyle.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
        // headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

        for (int i = 0; i < headers.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(headerStyle);
        }

        // 4. 填充数据行
        int rowNum = 1;
        for (UserDto user : users) {
            Row row = sheet.createRow(rowNum++);
            row.createCell(0).setCellValue(user.getId());
            row.createCell(1).setCellValue(user.getUsername());
            row.createCell(2).setCellValue(user.getEmail());
            // 可以为数据单元格设置样式
        }

        // 5. 自动调整列宽 (可选，对SXSSF可能影响性能，大数据量时慎用或部分列调整)
        for (int i = 0; i < headers.length; i++) {
            sheet.autoSizeColumn(i);
        }

        // 6. 设置HTTP响应头并写入输出流
        response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        response.setHeader("Content-Disposition", "attachment; filename=\"users.xlsx\"");

        OutputStream outputStream = response.getOutputStream();
        workbook.write(outputStream);

        // 7. 关闭和清理资源
        outputStream.close();
        workbook.close(); // 关闭 SXSSFWorkbook 会清理临时文件
        if (workbook instanceof SXSSFWorkbook) {
            ((SXSSFWorkbook) workbook).dispose(); // 确保临时文件被删除
        }
    }
}
```

### 4. 注意事项
- **内存管理**: 对于大量数据，务必使用 `SXSSFWorkbook` 来避免内存溢出。
- **样式**: 过多的不同样式对象会增加内存消耗和文件大小。尽量复用 `CellStyle` 对象。
- **错误处理**: 确保在 `finally` 块中关闭流和工作簿。
- **并发**: 如果多个用户同时请求导出，确保导出逻辑是线程安全的，或者为每个请求创建独立的 `Workbook` 实例。

## （二）使用 EasyExcel (Alibaba) 导出 Excel

EasyExcel 是阿里巴巴开源的一个Java库，它在Apache POI的基础上进行了封装，旨在简化Excel的读写操作，并着重解决了内存消耗大的问题。

### 1. 添加依赖 (Maven)

```xml
<dependency>
    <groupId>com.alibaba</groupId>
    <artifactId>easyexcel</artifactId>
    <version>3.3.3</version> <!-- 请使用最新稳定版本 -->
</dependency>
```
EasyExcel 会自动传递依赖 Apache POI 相关的包。

### 2. 导出步骤

EasyExcel 的导出通常更加简洁：

a. 定义数据模型 (一个Java类)，并使用注解 (如 `@ExcelProperty`) 映射到Excel列。
b. 调用 `EasyExcel.write()` 方法指定输出流和数据模型类。
c. 通过 `.sheet()` 指定工作表名称。
d. 调用 `.doWrite()` 执行写入操作，传入数据列表。

### 3. 示例代码

首先，定义数据模型：

```java
import com.alibaba.excel.annotation.ExcelProperty;
import com.alibaba.excel.annotation.write.style.ColumnWidth;
import com.alibaba.excel.annotation.write.style.HeadFontStyle;
import com.alibaba.excel.annotation.write.style.HeadRowHeight;

@HeadRowHeight(20) // 表头行高
@ColumnWidth(25)   // 全局列宽
@HeadFontStyle(fontHeightInPoints = 12, bold = true) // 表头字体
public class UserExcelDto {

    @ExcelProperty("用户ID") // Excel列名
    @ColumnWidth(15)        // 当前列宽度
    private Long id;

    @ExcelProperty("登录名")
    private String username;

    @ExcelProperty("电子邮箱")
    @ColumnWidth(30)
    private String email;

    // 构造函数、Getters 和 Setters
    public UserExcelDto(Long id, String username, String email) {
        this.id = id;
        this.username = username;
        this.email = email;
    }
    // getters and setters...
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
}
```

然后是导出服务：

```java
import com.alibaba.excel.EasyExcel;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.net.URLEncoder;
import java.util.List;
import java.util.stream.Collectors;

public class EasyExcelExportService {

    public void exportUsersWithEasyExcel(List<UserDto> users, HttpServletResponse response) throws IOException {
        // 将 UserDto 转换为 UserExcelDto (如果需要不同的模型或注解)
        List<UserExcelDto> excelUsers = users.stream()
                .map(user -> new UserExcelDto(user.getId(), user.getUsername(), user.getEmail()))
                .collect(Collectors.toList());

        response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        response.setCharacterEncoding("utf-8");
        // 防止中文文件名乱码
        String fileName = URLEncoder.encode("用户信息", "UTF-8").replaceAll("\\+", "%20");
        response.setHeader("Content-disposition", "attachment;filename*=" + "UTF-8''" + fileName + ".xlsx");

        // 直接写入响应输出流
        EasyExcel.write(response.getOutputStream(), UserExcelDto.class)
                 .sheet("用户列表") // 指定sheet名称
                 // .registerWriteHandler(new CustomSheetWriteHandler()) // 注册自定义样式处理器 (可选)
                 // .registerWriteHandler(new CustomCellWriteHandler()) // 注册自定义单元格样式处理器 (可选)
                 .doWrite(excelUsers);
    }
}
```

### 4. 优势与特点
- **简洁API**: 相较于POI，API更加简单易用，上手快。
- **低内存消耗**: 内部优化了内存使用，特别适合大数据量导出，不易OOM。
- **注解驱动**: 通过注解定义Excel的列名、宽度、样式等，代码更清晰。
- **灵活的拦截器/处理器**: 支持通过 `WriteHandler` 自定义样式、合并单元格等复杂操作。

# 二、导出Word文件

Word文档通常用于生成格式化的报告、合同、通知等。Java中操作Word文档也主要依赖Apache POI，或者使用基于POI的模板引擎。

## （一）使用 Apache POI (XWPF) 导出 Word (`.docx`)

Apache POI的 `XWPF` 组件用于处理 `.docx` 格式的Word文档。

### 1. 添加依赖 (Maven)

(同Excel的 `poi-ooxml` 依赖，它已包含操作Word所需的基本组件)

```xml
<dependency>
    <groupId>org.apache.poi</groupId>
    <artifactId>poi-ooxml</artifactId>
    <version>5.2.5</version> <!-- 请使用最新稳定版本 -->
</dependency>
```

### 2. 导出步骤

a. 创建文档对象 (`XWPFDocument`)
b. 创建段落 (`XWPFParagraph`)
c. 创建文本运行 (`XWPFRun`) 并设置内容和样式
d. 创建表格 (`XWPFTable`)、图片等 (可选)
e. 将文档写入输出流

### 3. 示例代码

```java
import org.apache.poi.xwpf.usermodel.*;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.OutputStream;
import java.math.BigInteger;

public class WordExportService {

    public void exportSimpleWord(HttpServletResponse response) throws IOException {
        // 1. 创建文档
        XWPFDocument document = new XWPFDocument();

        // 2. 创建标题段落
        XWPFParagraph titleParagraph = document.createParagraph();
        titleParagraph.setAlignment(ParagraphAlignment.CENTER);
        XWPFRun titleRun = titleParagraph.createRun();
        titleRun.setText("这是一个示例Word文档标题");
        titleRun.setBold(true);
        titleRun.setFontSize(20);
        titleRun.addBreak(); // 换行

        // 3. 创建普通文本段落
        XWPFParagraph contentParagraph = document.createParagraph();
        XWPFRun contentRun = contentParagraph.createRun();
        contentRun.setText("这是第一段内容。Apache POI 提供了丰富的API来操作Word文档，包括设置字体、颜色、对齐方式等。");
        contentRun.addBreak();
        XWPFRun contentRun2 = contentParagraph.createRun();
        contentRun2.setText("这是同一段落的第二句话，可以设置不同样式。");
        contentRun2.setItalic(true);
        contentRun2.setColor("0070C0"); // 蓝色

        // 4. 创建一个简单表格
        XWPFTable table = document.createTable(3, 3); // 3行3列
        // 设置表格宽度 (可选)
        // table.setWidth("100%");

        // 表头
        table.getRow(0).getCell(0).setText("表头1");
        table.getRow(0).getCell(1).setText("表头2");
        table.getRow(0).getCell(2).setText("表头3");

        // 数据行
        table.getRow(1).getCell(0).setText("数据A1");
        table.getRow(1).getCell(1).setText("数据B1");
        table.getRow(1).getCell(2).setText("数据C1");

        table.getRow(2).getCell(0).setText("数据A2");
        table.getRow(2).getCell(1).setText("数据B2");
        table.getRow(2).getCell(2).setText("数据C2");

        // 5. 设置响应头并写入输出流
        response.setContentType("application/vnd.openxmlformats-officedocument.wordprocessingml.document");
        response.setHeader("Content-Disposition", "attachment; filename=\"sample.docx\"");

        OutputStream outputStream = response.getOutputStream();
        document.write(outputStream);

        // 6. 关闭资源
        outputStream.close();
        document.close();
    }
}
```

### 4. 注意事项
- **API复杂度**: POI XWPF的API相对底层，生成复杂格式的文档可能需要较多代码。
- **样式控制**: 字体、段落格式、表格样式等都需要通过API精细控制。
- **性能**: 对于非常复杂的文档或大量文档生成，性能可能需要关注。

## （二）使用 poi-tl (Poi-template-language) 导出 Word

`poi-tl` 是一个基于Apache POI的Word模板引擎，它允许你创建Word模板 (`.docx`格式)，在模板中使用特定的标签语法 (如 `{{name}}`, `{#list}`), 然后在Java代码中用数据填充这些标签，从而生成最终的Word文档。这极大地简化了复杂格式Word文档的生成。

### 1. 添加依赖 (Maven)

```xml
<dependency>
    <groupId>com.deepoove</groupId>
    <artifactId>poi-tl</artifactId>
    <version>1.12.1</version> <!-- 请使用最新稳定版本 -->
</dependency>
```
`poi-tl` 会自动依赖 Apache POI。

### 2. 创建Word模板

创建一个 `.docx` 文件作为模板。在需要动态填充数据的地方使用 `poi-tl` 的标签语法：
- 简单文本: `{{variableName}}`
- 图片: `{{@image_variable}}` (变量需要是 `Pictures.ofLocal("path/to/image.png").size(width, height).create()`) 
- 表格行循环: `{#list_variable}` 开始循环, `{{item_property}}` 访问列表项属性, `{/list_variable}` 结束循环。
- ...更多高级标签，如条件判断、嵌套循环等，请参考官方文档。

**示例模板 (`template.docx`) 内容：**

```
员工信息表

姓名：{{name}}
部门：{{department}}

技能列表：
{#skills}
  - {{skillName}} ({{level}})
{/skills}

备注：
{{remarks}}
```

### 3. 示例代码

```java
import com.deepoove.poi.XWPFTemplate;
import com.deepoove.poi.config.Configure;
import com.deepoove.poi.data.Pictures;
import com.deepoove.poi.data.Rows;
import com.deepoove.poi.data.TableRenderData;
import com.deepoove.poi.data.Tables;
import com.deepoove.poi.data.Texts;
import com.deepoove.poi.data.style.Style;

import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

class Skill {
    private String skillName;
    private String level;
    // constructor, getters, setters
    public Skill(String skillName, String level) { this.skillName = skillName; this.level = level; }
    public String getSkillName() { return skillName; }
    public String getLevel() { return level; }
}

public class PoiTlWordExportService {

    public void exportWordFromTemplate(HttpServletResponse response) throws IOException {
        Map<String, Object> data = new HashMap<>();
        data.put("name", "张三");
        data.put("department", "技术部");
        data.put("remarks", Texts.of("这是一段备注信息，\n可以包含换行。").color("FF0000").create()); // 支持富文本

        List<Skill> skills = Arrays.asList(
            new Skill("Java", "熟练"),
            new Skill("Spring Boot", "精通"),
            new Skill("Vue.js", "掌握")
        );
        data.put("skills", skills); // 对应模板中的 {#skills}

        // 假设模板在 classpath 下的 templates 目录
        InputStream templateInputStream = this.getClass().getClassLoader().getResourceAsStream("templates/template.docx");
        if (templateInputStream == null) {
            throw new IOException("模板文件未找到!");
        }

        // Configure config = Configure.builder().build(); // 可自定义配置，例如缺失标签的处理方式
        XWPFTemplate template = XWPFTemplate.compile(templateInputStream).render(data);

        response.setContentType("application/vnd.openxmlformats-officedocument.wordprocessingml.document");
        response.setHeader("Content-Disposition", "attachment; filename=\"employee_info.docx\"");

        OutputStream outputStream = response.getOutputStream();
        template.write(outputStream);
        outputStream.flush();
        outputStream.close();
        template.close();
    }
}
```

### 4. 优势与特点
- **模板驱动**: "所见即所得"，美工或业务人员可以设计Word模板，开发人员只需关注数据填充。
- **简单易用**: 相比直接操作POI API，代码量大大减少，逻辑更清晰。
- **功能丰富**: 支持文本、图片、表格、列表、超链接、脚注、尾注等多种元素渲染。
- **高度可定制**: 支持自定义插件和函数来扩展功能。

# 三、通用注意事项 (文件下载)

在Web应用中，后端生成文件后需要通过HTTP响应将其发送给客户端浏览器进行下载。

- **设置 `Content-Type`**: 根据文件类型设置正确的MIME类型。
  - Excel (`.xlsx`): `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
  - Word (`.docx`): `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
- **设置 `Content-Disposition`**:  通常设置为 `attachment; filename="your_filename.ext"` 来提示浏览器下载。
  - **文件名编码**: 对于包含中文或特殊字符的文件名，需要进行URL编码，并考虑不同浏览器的兼容性。推荐格式如：
    `response.setHeader("Content-Disposition", "attachment; filename*=UTF-8''" + URLEncoder.encode(fileName, "UTF-8"));`
- **关闭输出流**: 确保在操作完成后关闭 `OutputStream`，以释放资源并将所有缓冲数据刷到客户端。

# 四、总结

Java后端导出Excel和Word文件有多种选择。对于Excel：
- **Apache POI** 功能全面，适合需要精细控制的场景，但API较复杂，大数据量需注意内存。
- **EasyExcel** 简洁高效，内存友好，尤其适合大数据量和快速开发。

对于Word：
- **Apache POI (XWPF)** 是基础，可以直接操作DOCX内容，灵活但代码量可能较大。
- **poi-tl** 基于模板，极大简化了复杂格式Word的生成，是目前非常推荐的方式。

选择合适的库取决于具体需求，如文件复杂度、数据量大小、开发效率要求等。建议在项目中根据实际情况引入并封装相应的工具类，方便复用。

# 五、参考资料

- Apache POI官方网站: [https://poi.apache.org/](https://poi.apache.org/)
- EasyExcel GitHub: [https://github.com/alibaba/easyexcel](https://github.com/alibaba/easyexcel)
- poi-tl官方文档: [http://deepoove.com/poi-tl/](http://deepoove.com/poi-tl/)
--- 