---
title: 【Java】Java后端导出PDF文件指南
categories: Java
tags:
  - Java
  - PDF
  - iText
  - Apache PDFBox
  - Flying Saucer
  - 文件导出
---

# 前言

在企业级应用和Web服务中，后端动态生成并导出PDF文件的需求非常普遍。PDF（Portable Document Format）因其跨平台性、固定的版式以及良好的打印支持，成为电子文档分发和归档的理想格式。常见的应用场景包括生成报告、发票、证书、电子书、合同文档等。本文旨在为Java后端开发者提供一个关于如何选择合适的PDF生成库、实现PDF导出功能以及相关最佳实践的全面指南。

# 一、选择PDF生成库

Java生态系统中有多个成熟的库可以帮助开发者生成PDF文件。选择哪个库取决于项目的具体需求，如功能复杂度、许可协议、社区支持和性能要求。

## （一）常用Java PDF库

1.  **iText (iText 7 Core)**:
    *   **特点**：功能非常强大且全面的PDF操作库，支持创建、编辑、加密、签名PDF等。iText 7是其最新主要版本，API设计现代。
    *   **许可**：iText 7采用AGPLv3开源许可。如果你的项目是开源的并且遵循AGPL，那么可以免费使用。对于商业闭源项目，需要购买商业许可。对于一些开发者而言，这是一个重要的考虑因素。
    *   **适用场景**：对PDF功能有复杂需求的场景，如表单填充、数字签名、高级排版等。

2.  **OpenPDF**:
    *   **特点**：OpenPDF是iText库较早版本（iText 4）的一个开源分支，它在LGPL和MPL许可下维护。这意味着在商业项目中可以更自由地使用它，而无需担心AGPL的传染性。
    *   **许可**：LGPL 和 MPL。
    *   **适用场景**：需要一个免费且功能相对完整的PDF生成库，且对iText 4的API较为熟悉或可接受的项目。

3.  **Apache PDFBox**:
    *   **特点**：Apache基金会下的开源项目，主要用于处理PDF文档，包括创建新PDF、修改现有PDF、提取内容、打印等。它的API相对底层一些，但功能也相当强大。
    *   **许可**：Apache License 2.0，非常宽松的开源许可。
    *   **适用场景**：需要对PDF内容进行细致控制，或者希望集成到Apache生态系统中的项目。创建复杂布局可能比iText更繁琐一些。

## （二）从HTML生成PDF

对于许多Web应用来说，开发者更熟悉HTML和CSS的布局方式。因此，通过将HTML内容转换为PDF也是一种流行的方法。

1.  **Flying Saucer (xhtmlrenderer)**:
    *   **特点**：一个纯Java库，用于将符合XHTML/CSS2.1规范的HTML内容渲染为PDF。它通常与iText（旧版或OpenPDF）或Apache PDFBox（通过扩展）结合使用作为PDF的底层输出引擎。
    *   **许可**：LGPL。
    *   **适用场景**：希望通过HTML/CSS设计PDF模板，然后动态填充数据生成PDF。非常适合报告、发票等样式相对固定的文档。

2.  **wkhtmltopdf**:
    *   **特点**：一个命令行工具，使用WebKit渲染引擎将HTML页面转换为PDF。可以通过Java的`ProcessBuilder`来调用。
    *   **许可**：LGPLv3。
    *   **适用场景**：对HTML5/CSS3支持要求较高，或者希望利用现有Web页面直接生成PDF的场景。缺点是需要在服务器上安装该工具，且进程调用可能带来额外开销。

# 二、使用 iText 7 生成PDF

iText 7 是一个功能强大的库，下面是如何使用它来生成一个简单的PDF文档。

## （一）添加依赖 (Maven)

```xml
<dependency>
    <groupId>com.itextpdf</groupId>
    <artifactId>itext7-core</artifactId>
    <version>7.2.5</version> <!-- 请检查并使用最新版本 -->
    <type>pom</type>
</dependency>

<!-- 如果需要处理中文字符，通常需要layout模块和font-asian模块 -->
<dependency>
    <groupId>com.itextpdf</groupId>
    <artifactId>layout</artifactId>
    <version>7.2.5</version> <!-- 与itext7-core版本一致 -->
</dependency>
<dependency>
    <groupId>com.itextpdf</groupId>
    <artifactId>font-asian</artifactId>
    <version>7.2.5</version> <!-- 与itext7-core版本一致 -->
</dependency>
<!-- 对于PDF/A或高级排版，可能还需要其他模块 -->
```
**注意**：iText 7 的`itext7-core`是一个pom类型的依赖，它会引入多个核心jar。如果只需要特定功能，可以单独引入如`kernel`, `io`, `layout`等模块。

## （二）基本步骤

1.  **创建 `PdfWriter`**：指定PDF文件的输出路径或输出流。
2.  **创建 `PdfDocument`**：代表PDF文档本身，与`PdfWriter`关联。
3.  **创建 `Document`**：这是用于添加高级内容（如段落、表格）的入口点，与`PdfDocument`关联。
4.  **添加内容**：使用`Document`对象添加文本、图片、表格等元素。
5.  **关闭 `Document`**：这将完成PDF的生成并刷新所有内容到输出流。

## （三）示例代码：生成简单PDF

```java
import com.itextpdf.kernel.font.PdfFont;
import com.itextpdf.kernel.font.PdfFontFactory;
import com.itextpdf.kernel.geom.PageSize;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.property.UnitValue;
import com.itextpdf.io.font.constants.StandardFonts;

import java.io.FileNotFoundException;
import java.io.IOException;

public class IText7SimplePdf {

    public static final String DEST = "./target/itext7_simple_report.pdf";

    public static void main(String[] args) {
        try {
            createPdf(DEST);
            System.out.println("PDF Created at: " + DEST);
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    public static void createPdf(String dest) throws IOException {
        // 1. 创建 PdfWriter
        PdfWriter writer = new PdfWriter(dest);

        // 2. 创建 PdfDocument
        PdfDocument pdf = new PdfDocument(writer);

        // 3. 创建 Document (A4页面)
        Document document = new Document(pdf, PageSize.A4);

        // 设置字体 (对于英文，可以使用标准字体)
        PdfFont font = PdfFontFactory.createFont(StandardFonts.HELVETICA);
        document.setFont(font).setFontSize(12);

        // 4. 添加内容
        // 添加段落
        document.add(new Paragraph("Hello World - iText 7 Report").setBold().setFontSize(18));
        document.add(new Paragraph("This is a simple PDF generated using iText 7."));
        document.add(new Paragraph("Date: " + java.time.LocalDate.now().toString()));

        // 添加空行
        document.add(new Paragraph("\n"));

        // 添加表格
        Table table = new Table(UnitValue.createPercentArray(new float[]{1, 3, 3}));
        table.setWidth(UnitValue.createPercentValue(100)); // 表格宽度100%

        table.addHeaderCell("ID");
        table.addHeaderCell("Name");
        table.addHeaderCell("Role");

        table.addCell("1");
        table.addCell("Alice Wonderland");
        table.addCell("Administrator");

        table.addCell("2");
        table.addCell("Bob The Builder");
        table.addCell("Developer");

        table.addCell("3");
        table.addCell("Charlie Chaplin");
        table.addCell("Tester");

        document.add(table);

        // 5. 关闭 Document
        document.close(); // 非常重要！确保所有内容写入并且PDF结构完整
    }
}
```

## （四）中文字符处理和字体嵌入

要正确显示中文字符，需要使用支持中文的字体，并且通常需要将该字体嵌入到PDF中，以确保在任何环境下都能正确显示。

1.  **获取中文字体文件**：例如 `.ttf` (TrueType Font) 或 `.otf` (OpenType Font) 格式的字体，如"思源黑体" (Source Han Sans / Noto Sans CJK)、"微软雅黑"等。
2.  **加载并使用字体**：

```java
// ... (其他import)
import com.itextpdf.io.font.PdfEncodings;

// ...
// public static final String FONT_PATH = "path/to/your/chinese_font.ttf"; // 例如 C:/Windows/Fonts/msyh.ttc,0 (微软雅黑第一个字体)
public static final String FONT_PATH = "src/main/resources/fonts/SourceHanSansSC-Regular.ttf"; // 假设字体在资源目录

// ... (在createPdf方法中)
// 设置中文字体
// PdfFont chineseFont = PdfFontFactory.createFont(FONT_PATH, PdfEncodings.IDENTITY_H, PdfFontFactory.EmbeddingStrategy.PREFER_EMBEDDED);
// 更推荐的方式是使用FontProvider或直接在创建时指定编码和嵌入策略
PdfFont chineseFont = PdfFontFactory.createFont(FONT_PATH, PdfEncodings.IDENTITY_H, true);
document.setFont(chineseFont).setFontSize(12);

document.add(new Paragraph("iText 7 PDF 中文报告").setBold().setFontSize(18));
document.add(new Paragraph("这是一个简单的包含中文的PDF文档。"));
// ... (表格内容也可以是中文)
table.addCell("张三");
table.addCell("软件工程师");
// ...
```
*   `PdfEncodings.IDENTITY_H`：通常用于处理Unicode字符，包括CJK（中日韩）字符。
*   `PdfFontFactory.EmbeddingStrategy.PREFER_EMBEDDED` 或直接将 `createFont` 的第三个参数 `embedded` 设为 `true`：表示如果可能，则嵌入字体。嵌入字体会增加PDF文件的大小，但能保证显示一致性。

# 三、使用 Apache PDFBox 生成PDF

Apache PDFBox 也是一个流行的选择，特别是在需要更多底层控制或偏好Apache许可时。

## （一）添加依赖 (Maven)

```xml
<dependency>
    <groupId>org.apache.pdfbox</groupId>
    <artifactId>pdfbox</artifactId>
    <version>2.0.30</version> <!-- Apache PDFBox 2.x, 请检查并使用最新版本 -->
</dependency>
<!-- PDFBox 3.x 是一个重大更新，API有所不同 -->
<!--
<dependency>
    <groupId>org.apache.pdfbox</groupId>
    <artifactId>pdfbox-core</artifactId>
    <version>3.0.1</version>
</dependency>
<dependency>
    <groupId>org.apache.pdfbox</groupId>
    <artifactId>pdfbox-io</artifactId>
    <version>3.0.1</version>
</dependency>
-->
```
本示例将基于 PDFBox 2.x，因为其API在很多项目中仍被广泛使用。若使用3.x，API会有所调整。

## （二）基本步骤 (PDFBox 2.x)

1.  **创建 `PDDocument`**：代表一个新的PDF文档。
2.  **创建 `PDPage`**：代表文档中的一个页面，并将其添加到`PDDocument`中。
3.  **创建 `PDPageContentStream`**：用于向页面写入内容。
4.  **使用 `PDPageContentStream` 添加内容**：设置字体，定位文本，绘制形状等。
5.  **关闭 `PDPageContentStream`**。
6.  **保存 `PDDocument`** 到文件或流。
7.  **关闭 `PDDocument`**。

## （三）示例代码：生成简单PDF (PDFBox 2.x)

```java
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDType0Font;
// import org.apache.pdfbox.pdmodel.font.PDType1Font; // 对于标准字体
// import org.apache.pdfbox.pdmodel.font.Standard14Fonts; // PDFBox 3.x中的标准字体

import java.io.File;
import java.io.IOException;

public class PDFBoxSimplePdf {

    public static final String DEST = "./target/pdfbox_simple_report.pdf";
    // public static final String FONT_PATH = "C:/Windows/Fonts/simsun.ttc"; // 例如宋体，注意路径和系统
    public static final String FONT_PATH = "src/main/resources/fonts/SourceHanSansSC-Regular.ttf";

    public static void main(String[] args) {
        try {
            createPdf(DEST);
            System.out.println("PDF Created at: " + DEST);
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    public static void createPdf(String dest) throws IOException {
        try (PDDocument document = new PDDocument()) {
            PDPage page = new PDPage(PDRectangle.A4);
            document.addPage(page);

            // 加载字体 (对于中文，需要加载支持中文的TTF字体)
            // PDType1Font font = PDType1Font.HELVETICA_BOLD; // 标准字体，仅英文
            PDType0Font font = PDType0Font.load(document, new File(FONT_PATH));

            try (PDPageContentStream contentStream = new PDPageContentStream(document, page)) {
                contentStream.beginText();
                contentStream.setFont(font, 18);
                contentStream.newLineAtOffset(50, 750); // (x,y) from bottom-left
                contentStream.showText("Apache PDFBox 中文报告");
                contentStream.endText();

                contentStream.beginText();
                contentStream.setFont(font, 12);
                contentStream.newLineAtOffset(50, 700);
                contentStream.showText("这是一个用Apache PDFBox生成的简单PDF文档。");
                contentStream.newLine(); // 换行，但y坐标不变，需自行管理
                contentStream.showText("日期: " + java.time.LocalDate.now().toString());
                contentStream.endText();

                // 添加表格会更复杂，需要手动绘制线条和定位文本
                // 例如：绘制一个简单的矩形作为单元格边框
                float y = 650;
                float margin = 50;
                float tableWidth = page.getMediaBox().getWidth() - 2 * margin;
                float rowHeight = 20f;
                int cols = 3;
                float colWidth = tableWidth / cols;

                // 表头
                contentStream.setLineWidth(0.5f);
                contentStream.moveTo(margin, y);
                contentStream.lineTo(margin + tableWidth, y);
                contentStream.stroke();
                y -= rowHeight;

                contentStream.beginText();
                contentStream.setFont(font, 10);
                contentStream.newLineAtOffset(margin + 5, y + 5);
                contentStream.showText("ID");
                contentStream.newLineAtOffset(colWidth, 0);
                contentStream.showText("姓名");
                contentStream.newLineAtOffset(colWidth, 0);
                contentStream.showText("角色");
                contentStream.endText();

                contentStream.moveTo(margin, y);
                contentStream.lineTo(margin + tableWidth, y);
                contentStream.stroke();

                // PDFBox 中创建表格通常需要更多手动计算和绘制
            }

            document.save(dest);
        }
    }
}
```
在PDFBox中，处理表格等复杂布局通常比iText更手动，需要精确计算坐标和绘制线条。

# 四、从HTML模板生成PDF (以Flying Saucer为例)

这种方法允许开发者使用熟悉的HTML和CSS来设计PDF的样式，然后通过Java代码填充数据并渲染。

## （一）添加依赖 (Maven)

```xml
<dependency>
    <groupId>org.xhtmlrenderer</groupId>
    <artifactId>flying-saucer-pdf</artifactId>
    <version>9.1.22</version> <!-- 请检查最新版本 -->
</dependency>
<!-- Flying Saucer 依赖于 iText 的一个旧版本 (iText 2.x fork) -->
<!-- 如果你想使用 OpenPDF (LGPL/MPL fork of iText 4) -->
<!--
<dependency>
    <groupId>com.github.librepdf</groupId>
    <artifactId>openpdf</artifactId>
    <version>1.3.30</version>
</dependency>
-->
```
Flying Saucer 默认会拉取一个与iText 2.x兼容的库。如果你需要更现代的iText功能或有许可顾虑，可以配置其使用OpenPDF等。

## （二）基本步骤

1.  **创建HTML模板**：可以使用Thymeleaf, FreeMarker等模板引擎动态生成包含数据的HTML字符串或文件。
2.  **配置字体**：在Java代码中告诉Flying Saucer字体文件的位置，特别是对于中文字体。
3.  **使用 `ITextRenderer`**：
    *   创建`ITextRenderer`对象。
    *   使用`setDocumentFromString(htmlContent)`或`setDocument(File htmlFile)`加载HTML。
    *   （可选）添加字体：`renderer.getFontResolver().addFont("path/to/font.ttf", true);`
    *   调用`layout()`方法。
    *   调用`createPDF(outputStream)`方法生成PDF到输出流。

## （三）示例代码概要

```java
import org.xhtmlrenderer.pdf.ITextRenderer;
import com.lowagie.text.DocumentException; // 注意，这是旧iText的异常

import java.io.FileOutputStream;
import java.io.IOException;
import java.io.OutputStream;

public class FlyingSaucerHtmlToPdf {

    public static final String HTML_CONTENT = """
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>HTML to PDF Report</title>
                <style>
                    body { font-family: 'SimSun', sans-serif; } /* 尝试指定中文字体 */
                    h1 { color: navy; }
                    table { border-collapse: collapse; width: 100%; }
                    th, td { border: 1px solid black; padding: 8px; text-align: left; }
                    th { background-color: #f2f2f2; }
                </style>
            </head>
            <body>
                <h1>HTML 生成的PDF报告</h1>
                <p>这是一个通过Flying Saucer从HTML内容生成的PDF文档。</p>
                <p>日期: MARS_DATE_PLACEHOLDER</p>
                <table>
                    <thead>
                        <tr><th>ID</th><th>名称</th><th>部门</th></tr>
                    </thead>
                    <tbody>
                        <tr><td>1</td><td>爱丽丝</td><td>研发部</td></tr>
                        <tr><td>2</td><td>鲍勃</td><td>市场部</td></tr>
                    </tbody>
                </table>
            </body>
            </html>
            """;
    public static final String DEST = "./target/flyingsaucer_report.pdf";
    public static final String FONT_PATH = "src/main/resources/fonts/simsun.ttc"; // 宋体

    public static void main(String[] args) {
        try {
            // 实际应用中，HTML内容通常由模板引擎动态生成
            String dynamicHtml = HTML_CONTENT.replace("MARS_DATE_PLACEHOLDER", java.time.LocalDate.now().toString());
            createPdf(dynamicHtml, DEST);
            System.out.println("PDF Created at: " + DEST);
        } catch (IOException | DocumentException e) {
            e.printStackTrace();
        }
    }

    public static void createPdf(String htmlContent, String dest) throws IOException, DocumentException {
        try (OutputStream os = new FileOutputStream(dest)) {
            ITextRenderer renderer = new ITextRenderer();

            // 添加中文字体，如果CSS中已正确指定font-family且字体在系统路径或正确配置，可能不需要显式添加
            // 但为了保证可靠性，显式添加字体是一个好习惯
            renderer.getFontResolver().addFont(FONT_PATH, true); // true表示嵌入字体

            renderer.setDocumentFromString(htmlContent);
            renderer.layout();
            renderer.createPDF(os);
        }
    }
}
```
**注意**：Flying Saucer的CSS支持主要基于CSS 2.1，一些现代CSS3特性可能不支持或支持不佳。对于中文字体，确保HTML的`<meta charset="UTF-8">`和CSS中的`font-family`正确设置，并在Java中通过`addFont`添加字体。

# 五、后端HTTP响应设置

当后端生成PDF后，通常需要通过HTTP响应将其发送给客户端浏览器，使其能够下载或直接在浏览器中显示。

## （一）关键HTTP头

1.  **`Content-Type`**: 必须设置为 `application/pdf`。
    ```java
    response.setContentType("application/pdf");
    ```

2.  **`Content-Disposition`**: 控制浏览器如何处理文件。
    *   `inline; filename="filename.pdf"`: 尝试在浏览器中直接显示PDF（如果浏览器支持）。
    *   `attachment; filename="filename.pdf"`: 强制浏览器下载文件。
    ```java
    // 强制下载
    response.setHeader("Content-Disposition", "attachment; filename=\"report.pdf\"");
    // 尝试内联显示
    // response.setHeader("Content-Disposition", "inline; filename=\"report.pdf\"");
    ```
    文件名中的非ASCII字符（如中文名）需要进行URL编码，并指定编码方式，例如 `filename*=UTF-8''%E6%8A%A5%E5%91%8A.pdf`。

## （二）Servlet / Spring MVC 示例

**Servlet 示例:**
```java
// Inside a HttpServlet doGet/doPost method
// byte[] pdfBytes = ... // 调用上述方法生成PDF内容到字节数组
// response.setContentType("application/pdf");
// response.setHeader("Content-Disposition", "attachment; filename=\"report.pdf\"");
// response.setContentLength(pdfBytes.length);

// try (OutputStream out = response.getOutputStream()) {
//     out.write(pdfBytes);
// }
```

**Spring MVC Controller 示例:**
```java
@GetMapping("/download/report.pdf")
public ResponseEntity<byte[]> downloadPdfReport() throws IOException, DocumentException {
    // 假设 pdfGeneratorService.generateReportPdf() 返回PDF的字节数组
    // byte[] pdfBytes = pdfGeneratorService.generateReportPdf(); // (使用iText, PDFBox等生成)

    // 示例：直接在这里生成，实际应封装到服务层
    ByteArrayOutputStream baos = new ByteArrayOutputStream();
    // --- 使用iText7生成到baos ---
    PdfWriter writer = new PdfWriter(baos);
    PdfDocument pdf = new PdfDocument(writer);
    Document document = new Document(pdf, PageSize.A4);
    PdfFont font = PdfFontFactory.createFont(StandardFonts.HELVETICA);
    document.setFont(font).setFontSize(12);
    document.add(new Paragraph("Spring MVC PDF Report"));
    document.close();
    byte[] pdfBytes = baos.toByteArray();
    // --- 生成结束 ---

    HttpHeaders headers = new HttpHeaders();
    headers.setContentType(MediaType.APPLICATION_PDF);
    headers.setContentDispositionFormData("report", "generated_report.pdf"); // attachment
    // headers.add(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=report.pdf"); // 尝试内联
    headers.setContentLength(pdfBytes.length);

    return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);
}
```

# 六、最佳实践与注意事项

1.  **性能考量**：
    *   对于大型或复杂PDF的生成，可能会消耗较多时间和内存。考虑将其作为异步任务处理（例如，使用消息队列和后台工作线程），避免阻塞HTTP请求线程。
    *   流式处理：尽可能使用流式API写入PDF，而不是先在内存中构建整个文档，特别是对于大文件。
2.  **字体管理**：
    *   确保服务器上有所需的字体文件，或者应用程序可以访问它们。
    *   为了跨平台显示的一致性，**强烈建议嵌入字体**到PDF中，尤其是对于非标准字体和国际化内容（如中文、日文、韩文等）。嵌入字体会增加文件大小。
    *   注意字体的许可协议，有些字体可能不允许嵌入或有特定使用限制。
3.  **资源管理**：
    *   务必在`finally`块中或使用try-with-resources语句及时关闭所有打开的`Document`、`PdfWriter`、`InputStream`、`OutputStream`等资源，防止资源泄漏。
4.  **错误处理**：
    *   妥善处理PDF生成过程中可能发生的各种异常（如`IOException`, `DocumentException`等）。
5.  **安全性**：
    *   如果PDF内容来源于用户输入（例如，用户填写的表单数据要生成PDF），需要对输入进行严格的校验和清理，以防止注入攻击（如HTML注入到模板中，或恶意内容影响PDF结构）。
    *   对于敏感信息，考虑对PDF进行加密和设置权限。
6.  **PDF/A规范**：如果PDF用于长期归档，考虑生成符合PDF/A（Archiving）标准的PDF。iText等库支持生成PDF/A文档。
7.  **模板填充 (AcroForms)**：如果已有PDF表单模板，可以使用iText或PDFBox填充表单域（AcroForms），而不是从头创建整个文档。这对于标准化文档非常高效。
8.  **模块化与可维护性**：将PDF生成的逻辑封装到单独的服务类或工具类中，使其与业务逻辑解耦，便于维护和测试。

# 七、总结

Java后端生成PDF文件有多种方案可选。iText 7功能强大但需注意AGPL许可；OpenPDF作为iText 4的开源分支提供了免费的选择；Apache PDFBox灵活且许可宽松，但布局可能更手动。对于熟悉HTML/CSS的开发者，Flying Saucer等库提供了从HTML模板生成PDF的便捷途径。选择合适的库并遵循最佳实践，可以高效、可靠地实现在Java后端导出PDF的功能，满足各种业务需求。

# 八、参考资料

*   iText 7 Official Documentation: [https://itextpdf.com/developers/documentation](https://itextpdf.com/developers/documentation)
*   OpenPDF GitHub Repository: [https://github.com/LibrePDF/OpenPDF](https://github.com/LibrePDF/OpenPDF)
*   Apache PDFBox Official Website: [https://pdfbox.apache.org/](https://pdfbox.apache.org/)
*   Flying Saucer GitHub Repository: [https://github.com/flyingsaucerproject/flyingsaucer](https://github.com/flyingsaucerproject/flyingsaucer)
*   Baeldung - Generating a PDF with iText in Java: [https://www.baeldung.com/java-pdf-creation-itext](https://www.baeldung.com/java-pdf-creation-itext)
*   Baeldung - Creating PDF in Java with Apache PDFBox: [https://www.baeldung.com/java-pdf-apache-pdfbox](https://www.baeldung.com/java-pdf-apache-pdfbox)
*   Baeldung - Convert HTML to PDF in Java with Flying Saucer: [https://www.baeldung.com/java-html-to-pdf-flying-saucer](https://www.baeldung.com/java-html-to-pdf-flying-saucer)

--- 