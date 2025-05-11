---
title: 【JAVA技巧】字符串操作工具——StringUtils
categories: JAVA技巧
tags:
  - JAVA
  - 后端
---

# 【JAVA技巧】字符串操作工具——StringUtils

## 一、前言

在Java开发中，字符串操作是最常见的需求之一。虽然Java提供了String类，但其API在某些场景下显得不够丰富和便捷。为了解决这个问题，Apache Commons Lang包提供了StringUtils工具类，它包含了丰富的字符串处理方法，能有效简化代码并提高开发效率。本文将详细介绍StringUtils的常用功能及使用技巧。

## 二、StringUtils简介

### （一）什么是StringUtils

StringUtils是Apache Commons Lang包中的一个工具类，提供了丰富的静态方法用于字符串操作。它补充了Java标准库中String类的不足，特别是在处理null值和空字符串方面更加安全便捷。

### （二）添加依赖

Maven项目中添加依赖：

```xml
<dependency>
    <groupId>org.apache.commons</groupId>
    <artifactId>commons-lang3</artifactId>
    <version>3.12.0</version>
</dependency>
```

Gradle项目中添加依赖：

```groovy
implementation 'org.apache.commons:commons-lang3:3.12.0'
```

## 三、常用方法详解

### （一）空值检查

```java
// 检查字符串是否为空或null
boolean isEmpty = StringUtils.isEmpty(null);       // true
boolean isEmpty = StringUtils.isEmpty("");         // true
boolean isEmpty = StringUtils.isEmpty(" ");        // false

// 检查字符串是否为空、空白或null
boolean isBlank = StringUtils.isBlank(null);       // true
boolean isBlank = StringUtils.isBlank("");         // true
boolean isBlank = StringUtils.isBlank(" \t\n");    // true

// 检查字符串是否不为空且不为null
boolean isNotEmpty = StringUtils.isNotEmpty("abc"); // true

// 检查字符串是否不为空、不为空白且不为null
boolean isNotBlank = StringUtils.isNotBlank("abc"); // true
```

### （二）字符串修剪与操作

```java
// 去除字符串两端空白
String trimmed = StringUtils.trim("  Hello  ");    // "Hello"

// 去除字符串两端空白，如果为null则返回null
String trimmed = StringUtils.trim(null);           // null

// 截断字符串
String truncated = StringUtils.truncate("Hello, World!", 5);  // "Hello"

// 左填充
String leftPad = StringUtils.leftPad("123", 5, '0');  // "00123"

// 右填充
String rightPad = StringUtils.rightPad("abc", 5, 'x');  // "abcxx"
```

### （三）字符串比较与查找

```java
// 忽略大小写比较
boolean equals = StringUtils.equalsIgnoreCase("abc", "ABC");  // true

// 检查字符串是否包含子串
boolean contains = StringUtils.contains("abc", "b");          // true

// 忽略大小写检查包含关系
boolean contains = StringUtils.containsIgnoreCase("abc", "B"); // true

// 查找子串出现位置
int index = StringUtils.indexOf("abcabc", "b");               // 1

// 统计子串出现次数
int count = StringUtils.countMatches("abcabc", "a");          // 2
```

### （四）字符串替换

```java
// 替换字符串中的内容
String replaced = StringUtils.replace("abcabc", "a", "x");    // "xbcxbc"

// 替换一次
String replaced = StringUtils.replaceOnce("abcabc", "a", "x");  // "xbcabc"

// 使用正则表达式替换
String replaced = StringUtils.replacePattern("ABCabc123", "[A-Z]", "_");  // "_BCabc123"
```

### （五）字符串转换

```java
// 首字母大写
String capitalized = StringUtils.capitalize("hello");  // "Hello"

// 首字母小写
String uncapitalized = StringUtils.uncapitalize("Hello");  // "hello"

// 交换大小写
String swapCase = StringUtils.swapCase("Hello World");  // "hELLO wORLD"

// 重复字符串
String repeated = StringUtils.repeat("a", 3);  // "aaa"
```

### （六）null安全的字符串操作

```java
// null安全的toString
String str = StringUtils.defaultString(null);         // 返回""
String str = StringUtils.defaultString(null, "N/A");  // 返回"N/A"

// null安全的比较
int result = StringUtils.compare(null, "abc");  // -1

// null安全的连接
String joined = StringUtils.join(new String[]{"a", null, "c"}, ",");  // "a,,c"
```

## 四、实际应用场景

### （一）参数校验

```java
public void processUser(String username, String email) {
    if (StringUtils.isBlank(username)) {
        throw new IllegalArgumentException("用户名不能为空");
    }
    
    if (StringUtils.isBlank(email) || !StringUtils.contains(email, "@")) {
        throw new IllegalArgumentException("无效的邮箱地址");
    }
    
    // 处理业务逻辑...
}
```

### （二）日志记录

```java
public void logUserAction(String userId, String action) {
    String logMessage = String.format("用户操作: %s执行了%s",
            StringUtils.defaultIfBlank(userId, "未知用户"),
            StringUtils.defaultIfBlank(action, "未知操作"));
    
    logger.info(logMessage);
}
```

### （三）数据清洗

```java
public String cleanUserInput(String input) {
    if (StringUtils.isBlank(input)) {
        return "";
    }
    
    // 去除两端空白
    String cleaned = StringUtils.trim(input);
    
    // 移除多余空格
    cleaned = StringUtils.normalizeSpace(cleaned);
    
    // 移除特殊字符
    cleaned = StringUtils.replacePattern(cleaned, "[^a-zA-Z0-9\\s]", "");
    
    return cleaned;
}
```

## 五、性能考虑

StringUtils虽然功能强大，但在高性能要求的场景下，笔者建议注意以下几点：

1. 避免在循环中频繁调用StringUtils方法，特别是复杂的正则表达式操作
2. 对于简单的null检查，可以直接使用`==`或`!=`操作符
3. 如果需要频繁拼接字符串，考虑使用StringBuilder
4. 某些StringUtils方法内部使用了正则表达式，在性能敏感场景可能需要替代方案

## 六、总结

StringUtils工具类极大地简化了Java中的字符串操作，特别是在处理null值和空字符串方面提供了安全便捷的方法。合理使用StringUtils可以编写出更加简洁、健壮的代码，提高开发效率。

在日常开发中，建议开发者熟悉StringUtils的常用方法，在适当的场景下使用它来替代繁琐的手动字符串处理逻辑。然而，也要注意不要过度依赖，在简单场景下使用Java内置的String方法可能更加直接高效。

希望本文对大家理解和使用StringUtils有所帮助，让字符串处理变得更加轻松愉快。

