---
title: 【学习】C语言文件操作与数据持久化：构建实用程序
categories: 学习
date: 2025-08-11 15:00:00
tags:
  - C语言
  - 文件操作
  - 数据持久化
  - I/O编程
  - 文件系统
series: C语言系统学习
---

{% note info %}
**C语言系统学习系列 - 第6篇**
深入探讨C语言文件操作和数据持久化技术，学会构建能够保存和读取数据的实用程序。
{% endnote %}

# 前言

到目前为止，我们编写的程序在运行结束后，所有数据都会丢失。在实际应用中，我们经常需要将数据保存到文件中，以便程序重新启动时能够恢复之前的状态。文件操作是构建实用程序的基础技能，也是数据持久化的核心技术。

**为什么需要文件操作？**

在现实应用中，文件操作无处不在：
- **配置管理**：保存程序设置和用户偏好
- **数据存储**：保存用户数据、日志记录
- **数据交换**：与其他程序或系统交换数据
- **备份恢复**：数据备份和灾难恢复

**本文学习目标：**
- 掌握文本文件和二进制文件的操作
- 学会错误处理和异常情况的处理
- 理解文件指针和随机访问
- 掌握CSV、JSON等常见格式的处理
- 学会构建完整的数据持久化系统

{% btn '/2025/08/10/学习/【学习】C语言结构体与联合体：复杂数据的组织艺术/', 上一篇：结构体与联合体, far fa-hand-point-left, green %}

# 一、文件操作基础

## （一）文本文件操作

### 1. 基本文件操作函数

```c
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <errno.h>

void demonstrate_basic_file_operations(void) {
    printf("=== 基本文件操作演示 ===\n");
    
    const char* filename = "test_output.txt";
    FILE* file;
    
    // 写入文件
    printf("1. 写入文件:\n");
    file = fopen(filename, "w");  // 以写入模式打开文件
    if (file == NULL) {
        printf("无法创建文件: %s\n", strerror(errno));
        return;
    }
    
    // 使用fprintf写入格式化数据
    fprintf(file, "这是第一行文本\n");
    fprintf(file, "数字: %d, 浮点数: %.2f\n", 42, 3.14159);
    fprintf(file, "字符串: %s\n", "Hello, World!");
    
    // 使用fputs写入字符串
    fputs("这是使用fputs写入的行\n", file);
    
    // 使用fputc写入单个字符
    fputc('A', file);
    fputc('\n', file);
    
    fclose(file);  // 关闭文件
    printf("文件写入完成\n");
    
    // 读取文件
    printf("\n2. 读取文件:\n");
    file = fopen(filename, "r");  // 以读取模式打开文件
    if (file == NULL) {
        printf("无法打开文件: %s\n", strerror(errno));
        return;
    }
    
    char buffer[256];
    int line_number = 1;
    
    // 逐行读取文件
    while (fgets(buffer, sizeof(buffer), file) != NULL) {
        printf("第%d行: %s", line_number++, buffer);
    }
    
    fclose(file);
    
    // 追加到文件
    printf("\n3. 追加到文件:\n");
    file = fopen(filename, "a");  // 以追加模式打开文件
    if (file != NULL) {
        fprintf(file, "这是追加的内容\n");
        fprintf(file, "当前时间戳: %ld\n", time(NULL));
        fclose(file);
        printf("内容追加完成\n");
    }
    
    // 再次读取文件查看追加结果
    printf("\n4. 追加后的文件内容:\n");
    file = fopen(filename, "r");
    if (file != NULL) {
        line_number = 1;
        while (fgets(buffer, sizeof(buffer), file) != NULL) {
            printf("第%d行: %s", line_number++, buffer);
        }
        fclose(file);
    }
    
    // 删除测试文件
    if (remove(filename) == 0) {
        printf("\n测试文件已删除\n");
    } else {
        printf("\n删除文件失败: %s\n", strerror(errno));
    }
}

// 安全的文件操作函数
FILE* safe_fopen(const char* filename, const char* mode) {
    FILE* file = fopen(filename, mode);
    if (file == NULL) {
        fprintf(stderr, "错误: 无法打开文件 '%s' (模式: %s): %s\n", 
                filename, mode, strerror(errno));
    }
    return file;
}

void safe_fclose(FILE* file) {
    if (file != NULL) {
        if (fclose(file) != 0) {
            fprintf(stderr, "警告: 关闭文件时出错: %s\n", strerror(errno));
        }
    }
}

// 文件复制函数
bool copy_file(const char* source, const char* destination) {
    FILE* src = safe_fopen(source, "rb");
    if (src == NULL) return false;
    
    FILE* dst = safe_fopen(destination, "wb");
    if (dst == NULL) {
        safe_fclose(src);
        return false;
    }
    
    char buffer[4096];
    size_t bytes_read;
    bool success = true;
    
    while ((bytes_read = fread(buffer, 1, sizeof(buffer), src)) > 0) {
        if (fwrite(buffer, 1, bytes_read, dst) != bytes_read) {
            fprintf(stderr, "写入文件时出错: %s\n", strerror(errno));
            success = false;
            break;
        }
    }
    
    if (ferror(src)) {
        fprintf(stderr, "读取文件时出错: %s\n", strerror(errno));
        success = false;
    }
    
    safe_fclose(src);
    safe_fclose(dst);
    
    return success;
}

void demonstrate_file_utilities(void) {
    printf("\n=== 文件工具函数演示 ===\n");
    
    // 创建源文件
    const char* source_file = "source.txt";
    const char* dest_file = "destination.txt";
    
    FILE* file = safe_fopen(source_file, "w");
    if (file != NULL) {
        fprintf(file, "这是要复制的文件内容\n");
        fprintf(file, "包含多行文本\n");
        fprintf(file, "用于测试文件复制功能\n");
        safe_fclose(file);
    }
    
    // 复制文件
    if (copy_file(source_file, dest_file)) {
        printf("文件复制成功\n");
        
        // 验证复制结果
        FILE* copied = safe_fopen(dest_file, "r");
        if (copied != NULL) {
            printf("复制的文件内容:\n");
            char buffer[256];
            while (fgets(buffer, sizeof(buffer), copied) != NULL) {
                printf("  %s", buffer);
            }
            safe_fclose(copied);
        }
    } else {
        printf("文件复制失败\n");
    }
    
    // 清理测试文件
    remove(source_file);
    remove(dest_file);
}

int main(void) {
    demonstrate_basic_file_operations();
    demonstrate_file_utilities();
    return 0;
}
```

### 2. 文件指针和随机访问

```c
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

// 学生记录结构（用于演示随机访问）
typedef struct {
    int id;
    char name[50];
    float gpa;
    int age;
} StudentRecord;

void demonstrate_file_positioning(void) {
    printf("=== 文件定位和随机访问演示 ===\n");
    
    const char* filename = "students.dat";
    FILE* file;
    
    // 创建测试数据
    StudentRecord students[] = {
        {1001, "张三", 3.8f, 20},
        {1002, "李四", 3.6f, 21},
        {1003, "王五", 3.9f, 19},
        {1004, "赵六", 3.7f, 22},
        {1005, "钱七", 3.5f, 20}
    };
    int student_count = sizeof(students) / sizeof(students[0]);
    
    // 写入学生记录
    file = fopen(filename, "wb");
    if (file == NULL) {
        printf("无法创建文件\n");
        return;
    }
    
    fwrite(students, sizeof(StudentRecord), student_count, file);
    fclose(file);
    printf("已写入 %d 条学生记录\n", student_count);
    
    // 随机访问演示
    file = fopen(filename, "rb");
    if (file == NULL) {
        printf("无法打开文件\n");
        return;
    }
    
    // 获取文件大小
    fseek(file, 0, SEEK_END);
    long file_size = ftell(file);
    printf("文件大小: %ld 字节\n", file_size);
    printf("记录数量: %ld\n", file_size / sizeof(StudentRecord));
    
    // 读取第3条记录（索引为2）
    printf("\n读取第3条记录:\n");
    fseek(file, 2 * sizeof(StudentRecord), SEEK_SET);
    StudentRecord record;
    if (fread(&record, sizeof(StudentRecord), 1, file) == 1) {
        printf("ID: %d, 姓名: %s, GPA: %.1f, 年龄: %d\n",
               record.id, record.name, record.gpa, record.age);
    }
    
    // 读取最后一条记录
    printf("\n读取最后一条记录:\n");
    fseek(file, -sizeof(StudentRecord), SEEK_END);
    if (fread(&record, sizeof(StudentRecord), 1, file) == 1) {
        printf("ID: %d, 姓名: %s, GPA: %.1f, 年龄: %d\n",
               record.id, record.name, record.gpa, record.age);
    }
    
    // 从当前位置向前移动
    printf("\n从当前位置向前读取:\n");
    fseek(file, -2 * sizeof(StudentRecord), SEEK_CUR);
    if (fread(&record, sizeof(StudentRecord), 1, file) == 1) {
        printf("ID: %d, 姓名: %s, GPA: %.1f, 年龄: %d\n",
               record.id, record.name, record.gpa, record.age);
    }
    
    // 显示当前文件位置
    long current_pos = ftell(file);
    printf("当前文件位置: %ld 字节\n", current_pos);
    printf("当前记录索引: %ld\n", current_pos / sizeof(StudentRecord));
    
    fclose(file);
    
    // 修改特定记录
    printf("\n修改第2条记录的GPA:\n");
    file = fopen(filename, "r+b");  // 读写模式
    if (file != NULL) {
        // 定位到第2条记录
        fseek(file, 1 * sizeof(StudentRecord), SEEK_SET);
        
        // 读取记录
        if (fread(&record, sizeof(StudentRecord), 1, file) == 1) {
            printf("修改前: ID: %d, GPA: %.1f\n", record.id, record.gpa);
            
            // 修改GPA
            record.gpa = 4.0f;
            
            // 回到记录开始位置
            fseek(file, -sizeof(StudentRecord), SEEK_CUR);
            
            // 写回修改后的记录
            fwrite(&record, sizeof(StudentRecord), 1, file);
            printf("修改后: ID: %d, GPA: %.1f\n", record.id, record.gpa);
        }
        
        fclose(file);
    }
    
    // 验证修改结果
    printf("\n验证修改结果 - 所有记录:\n");
    file = fopen(filename, "rb");
    if (file != NULL) {
        int index = 0;
        while (fread(&record, sizeof(StudentRecord), 1, file) == 1) {
            printf("记录%d: ID=%d, 姓名=%s, GPA=%.1f, 年龄=%d\n",
                   index++, record.id, record.name, record.gpa, record.age);
        }
        fclose(file);
    }
    
    // 清理测试文件
    remove(filename);
}

int main(void) {
    demonstrate_file_positioning();
    return 0;
}
```

## （二）二进制文件操作

### 1. 结构体的序列化和反序列化

```c
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <time.h>

// 复杂的数据结构
typedef struct {
    int year, month, day;
    int hour, minute, second;
} DateTime;

typedef struct {
    int id;
    char name[100];
    char email[100];
    DateTime created_at;
    DateTime last_login;
    float balance;
    int transaction_count;
    bool is_active;
} UserAccount;

// 文件头结构
typedef struct {
    char signature[8];      // 文件签名
    int version;           // 文件格式版本
    int record_count;      // 记录数量
    DateTime created_at;   // 文件创建时间
    char description[64];  // 文件描述
} FileHeader;

// 获取当前时间
DateTime get_current_time(void) {
    time_t now = time(NULL);
    struct tm* tm_info = localtime(&now);
    
    DateTime dt = {
        .year = tm_info->tm_year + 1900,
        .month = tm_info->tm_mon + 1,
        .day = tm_info->tm_mday,
        .hour = tm_info->tm_hour,
        .minute = tm_info->tm_min,
        .second = tm_info->tm_sec
    };
    
    return dt;
}

// 保存用户账户到二进制文件
bool save_user_accounts(const char* filename, UserAccount accounts[], int count) {
    FILE* file = fopen(filename, "wb");
    if (file == NULL) {
        printf("无法创建文件: %s\n", filename);
        return false;
    }
    
    // 写入文件头
    FileHeader header = {
        .signature = "USRDATA",
        .version = 1,
        .record_count = count,
        .created_at = get_current_time()
    };
    strcpy(header.description, "User Account Database");
    
    if (fwrite(&header, sizeof(FileHeader), 1, file) != 1) {
        printf("写入文件头失败\n");
        fclose(file);
        return false;
    }
    
    // 写入用户账户数据
    if (fwrite(accounts, sizeof(UserAccount), count, file) != count) {
        printf("写入用户数据失败\n");
        fclose(file);
        return false;
    }
    
    fclose(file);
    printf("成功保存 %d 个用户账户到 %s\n", count, filename);
    return true;
}

// 从二进制文件加载用户账户
UserAccount* load_user_accounts(const char* filename, int* count) {
    FILE* file = fopen(filename, "rb");
    if (file == NULL) {
        printf("无法打开文件: %s\n", filename);
        return NULL;
    }
    
    // 读取文件头
    FileHeader header;
    if (fread(&header, sizeof(FileHeader), 1, file) != 1) {
        printf("读取文件头失败\n");
        fclose(file);
        return NULL;
    }
    
    // 验证文件签名
    if (strcmp(header.signature, "USRDATA") != 0) {
        printf("无效的文件格式\n");
        fclose(file);
        return NULL;
    }
    
    printf("文件信息:\n");
    printf("  签名: %s\n", header.signature);
    printf("  版本: %d\n", header.version);
    printf("  记录数: %d\n", header.record_count);
    printf("  创建时间: %d-%02d-%02d %02d:%02d:%02d\n",
           header.created_at.year, header.created_at.month, header.created_at.day,
           header.created_at.hour, header.created_at.minute, header.created_at.second);
    printf("  描述: %s\n", header.description);
    
    // 分配内存
    UserAccount* accounts = malloc(header.record_count * sizeof(UserAccount));
    if (accounts == NULL) {
        printf("内存分配失败\n");
        fclose(file);
        return NULL;
    }
    
    // 读取用户数据
    if (fread(accounts, sizeof(UserAccount), header.record_count, file) != header.record_count) {
        printf("读取用户数据失败\n");
        free(accounts);
        fclose(file);
        return NULL;
    }
    
    fclose(file);
    *count = header.record_count;
    printf("成功加载 %d 个用户账户\n", *count);
    return accounts;
}

// 打印用户账户信息
void print_user_account(const UserAccount* account) {
    printf("用户账户:\n");
    printf("  ID: %d\n", account->id);
    printf("  姓名: %s\n", account->name);
    printf("  邮箱: %s\n", account->email);
    printf("  余额: %.2f\n", account->balance);
    printf("  交易次数: %d\n", account->transaction_count);
    printf("  状态: %s\n", account->is_active ? "活跃" : "非活跃");
    printf("  创建时间: %d-%02d-%02d %02d:%02d:%02d\n",
           account->created_at.year, account->created_at.month, account->created_at.day,
           account->created_at.hour, account->created_at.minute, account->created_at.second);
    printf("  最后登录: %d-%02d-%02d %02d:%02d:%02d\n",
           account->last_login.year, account->last_login.month, account->last_login.day,
           account->last_login.hour, account->last_login.minute, account->last_login.second);
    printf("\n");
}

void demonstrate_binary_serialization(void) {
    printf("=== 二进制序列化演示 ===\n");
    
    // 创建测试用户账户
    UserAccount accounts[] = {
        {
            .id = 1001,
            .name = "张三",
            .email = "zhangsan@example.com",
            .created_at = {2023, 1, 15, 10, 30, 0},
            .last_login = {2024, 8, 10, 14, 25, 30},
            .balance = 1250.75f,
            .transaction_count = 45,
            .is_active = true
        },
        {
            .id = 1002,
            .name = "李四",
            .email = "lisi@example.com",
            .created_at = {2023, 3, 22, 16, 45, 0},
            .last_login = {2024, 8, 9, 9, 15, 20},
            .balance = 890.50f,
            .transaction_count = 23,
            .is_active = true
        },
        {
            .id = 1003,
            .name = "王五",
            .email = "wangwu@example.com",
            .created_at = {2023, 6, 8, 11, 20, 0},
            .last_login = {2024, 7, 28, 20, 10, 45},
            .balance = 0.00f,
            .transaction_count = 12,
            .is_active = false
        }
    };
    
    int account_count = sizeof(accounts) / sizeof(accounts[0]);
    const char* filename = "user_accounts.dat";
    
    // 保存到文件
    if (save_user_accounts(filename, accounts, account_count)) {
        // 从文件加载
        int loaded_count;
        UserAccount* loaded_accounts = load_user_accounts(filename, &loaded_count);
        
        if (loaded_accounts != NULL) {
            printf("\n加载的用户账户:\n");
            for (int i = 0; i < loaded_count; i++) {
                printf("--- 用户 %d ---\n", i + 1);
                print_user_account(&loaded_accounts[i]);
            }
            
            free(loaded_accounts);
        }
    }
    
    // 清理测试文件
    remove(filename);
}

int main(void) {
    demonstrate_binary_serialization();
    return 0;
}
```

# 二、高级文件操作

## （一）CSV文件处理

### 1. CSV读写实现

```c
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <stdbool.h>

#define MAX_FIELD_LENGTH 256
#define MAX_FIELDS 20

// CSV记录结构
typedef struct {
    char** fields;
    int field_count;
} CSVRecord;

// CSV文件结构
typedef struct {
    CSVRecord* records;
    int record_count;
    int capacity;
    char** headers;
    int header_count;
} CSVFile;

// 创建CSV文件对象
CSVFile* csv_create(void) {
    CSVFile* csv = malloc(sizeof(CSVFile));
    if (csv == NULL) return NULL;
    
    csv->records = NULL;
    csv->record_count = 0;
    csv->capacity = 0;
    csv->headers = NULL;
    csv->header_count = 0;
    
    return csv;
}

// 解析CSV行
CSVRecord parse_csv_line(const char* line) {
    CSVRecord record = {NULL, 0};
    
    char* fields[MAX_FIELDS];
    int field_count = 0;
    
    char* line_copy = malloc(strlen(line) + 1);
    strcpy(line_copy, line);
    
    char* token = strtok(line_copy, ",");
    while (token != NULL && field_count < MAX_FIELDS) {
        // 去除前后空格
        while (*token == ' ') token++;
        char* end = token + strlen(token) - 1;
        while (end > token && *end == ' ') *end-- = '\0';
        
        // 处理引号
        if (*token == '"' && *end == '"') {
            token++;
            *end = '\0';
        }
        
        fields[field_count] = malloc(strlen(token) + 1);
        strcpy(fields[field_count], token);
        field_count++;
        
        token = strtok(NULL, ",");
    }
    
    if (field_count > 0) {
        record.fields = malloc(field_count * sizeof(char*));
        for (int i = 0; i < field_count; i++) {
            record.fields[i] = fields[i];
        }
        record.field_count = field_count;
    }
    
    free(line_copy);
    return record;
}

// 读取CSV文件
bool csv_read_file(CSVFile* csv, const char* filename) {
    if (csv == NULL) return false;
    
    FILE* file = fopen(filename, "r");
    if (file == NULL) {
        printf("无法打开CSV文件: %s\n", filename);
        return false;
    }
    
    char line[1024];
    bool first_line = true;
    
    while (fgets(line, sizeof(line), file) != NULL) {
        // 移除换行符
        char* newline = strchr(line, '\n');
        if (newline) *newline = '\0';
        
        CSVRecord record = parse_csv_line(line);
        if (record.field_count == 0) continue;
        
        if (first_line) {
            // 第一行作为标题
            csv->headers = record.fields;
            csv->header_count = record.field_count;
            first_line = false;
        } else {
            // 扩展记录数组
            if (csv->record_count >= csv->capacity) {
                int new_capacity = csv->capacity == 0 ? 10 : csv->capacity * 2;
                CSVRecord* new_records = realloc(csv->records, 
                                                new_capacity * sizeof(CSVRecord));
                if (new_records == NULL) {
                    fclose(file);
                    return false;
                }
                csv->records = new_records;
                csv->capacity = new_capacity;
            }
            
            csv->records[csv->record_count] = record;
            csv->record_count++;
        }
    }
    
    fclose(file);
    printf("成功读取CSV文件: %d条记录\n", csv->record_count);
    return true;
}

// 写入CSV文件
bool csv_write_file(const CSVFile* csv, const char* filename) {
    if (csv == NULL) return false;
    
    FILE* file = fopen(filename, "w");
    if (file == NULL) {
        printf("无法创建CSV文件: %s\n", filename);
        return false;
    }
    
    // 写入标题行
    if (csv->headers != NULL) {
        for (int i = 0; i < csv->header_count; i++) {
            fprintf(file, "%s", csv->headers[i]);
            if (i < csv->header_count - 1) {
                fprintf(file, ",");
            }
        }
        fprintf(file, "\n");
    }
    
    // 写入数据行
    for (int i = 0; i < csv->record_count; i++) {
        const CSVRecord* record = &csv->records[i];
        for (int j = 0; j < record->field_count; j++) {
            // 如果字段包含逗号或空格，用引号包围
            if (strchr(record->fields[j], ',') != NULL || 
                strchr(record->fields[j], ' ') != NULL) {
                fprintf(file, "\"%s\"", record->fields[j]);
            } else {
                fprintf(file, "%s", record->fields[j]);
            }
            
            if (j < record->field_count - 1) {
                fprintf(file, ",");
            }
        }
        fprintf(file, "\n");
    }
    
    fclose(file);
    printf("成功写入CSV文件: %d条记录\n", csv->record_count);
    return true;
}

// 打印CSV内容
void csv_print(const CSVFile* csv) {
    if (csv == NULL) return;
    
    // 打印标题
    if (csv->headers != NULL) {
        printf("标题: ");
        for (int i = 0; i < csv->header_count; i++) {
            printf("%-15s", csv->headers[i]);
        }
        printf("\n");
        
        for (int i = 0; i < csv->header_count * 15; i++) {
            printf("-");
        }
        printf("\n");
    }
    
    // 打印数据
    for (int i = 0; i < csv->record_count; i++) {
        const CSVRecord* record = &csv->records[i];
        for (int j = 0; j < record->field_count; j++) {
            printf("%-15s", record->fields[j]);
        }
        printf("\n");
    }
}

// 释放CSV内存
void csv_free(CSVFile* csv) {
    if (csv == NULL) return;
    
    // 释放标题
    if (csv->headers != NULL) {
        for (int i = 0; i < csv->header_count; i++) {
            free(csv->headers[i]);
        }
        free(csv->headers);
    }
    
    // 释放记录
    if (csv->records != NULL) {
        for (int i = 0; i < csv->record_count; i++) {
            CSVRecord* record = &csv->records[i];
            if (record->fields != NULL) {
                for (int j = 0; j < record->field_count; j++) {
                    free(record->fields[j]);
                }
                free(record->fields);
            }
        }
        free(csv->records);
    }
    
    free(csv);
}

void demonstrate_csv_processing(void) {
    printf("=== CSV文件处理演示 ===\n");
    
    const char* filename = "students.csv";
    
    // 创建示例CSV文件
    FILE* file = fopen(filename, "w");
    if (file != NULL) {
        fprintf(file, "学号,姓名,专业,年龄,GPA\n");
        fprintf(file, "2021001,张三,计算机科学,20,3.8\n");
        fprintf(file, "2021002,李四,电子工程,21,3.6\n");
        fprintf(file, "2021003,王五,数学,19,3.9\n");
        fprintf(file, "2021004,赵六,物理,22,3.7\n");
        fprintf(file, "2021005,\"钱七, Jr.\",化学,20,3.5\n");
        fclose(file);
        printf("创建示例CSV文件\n");
    }
    
    // 读取CSV文件
    CSVFile* csv = csv_create();
    if (csv_read_file(csv, filename)) {
        printf("\nCSV文件内容:\n");
        csv_print(csv);
        
        // 修改数据并保存
        if (csv->record_count > 0) {
            // 修改第一条记录的GPA
            free(csv->records[0].fields[4]);
            csv->records[0].fields[4] = malloc(10);
            strcpy(csv->records[0].fields[4], "4.0");
        }
        
        const char* output_file = "students_modified.csv";
        csv_write_file(csv, output_file);
        
        printf("\n修改后的CSV文件已保存到: %s\n", output_file);
        
        // 清理
        remove(output_file);
    }
    
    csv_free(csv);
    remove(filename);
}

int main(void) {
    demonstrate_csv_processing();
    return 0;
}
```

# 三、实践项目：个人财务管理系统

让我们创建一个完整的个人财务管理系统，展示文件操作的综合应用：

```c
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <time.h>
#include <stdbool.h>

#define MAX_DESCRIPTION 100
#define MAX_CATEGORY 50
#define DATA_FILE "finance.dat"
#define BACKUP_FILE "finance_backup.dat"

// 交易类型
typedef enum {
    TRANSACTION_INCOME,
    TRANSACTION_EXPENSE
} TransactionType;

// 交易记录
typedef struct {
    int id;
    TransactionType type;
    double amount;
    char description[MAX_DESCRIPTION];
    char category[MAX_CATEGORY];
    time_t timestamp;
} Transaction;

// 财务系统
typedef struct {
    Transaction* transactions;
    int count;
    int capacity;
    double balance;
} FinanceSystem;

// 创建财务系统
FinanceSystem* finance_create(void) {
    FinanceSystem* fs = malloc(sizeof(FinanceSystem));
    if (fs == NULL) return NULL;
    
    fs->transactions = NULL;
    fs->count = 0;
    fs->capacity = 0;
    fs->balance = 0.0;
    
    return fs;
}

// 添加交易
bool finance_add_transaction(FinanceSystem* fs, TransactionType type, 
                           double amount, const char* description, 
                           const char* category) {
    if (fs == NULL || amount <= 0) return false;
    
    // 扩展容量
    if (fs->count >= fs->capacity) {
        int new_capacity = fs->capacity == 0 ? 10 : fs->capacity * 2;
        Transaction* new_transactions = realloc(fs->transactions, 
                                              new_capacity * sizeof(Transaction));
        if (new_transactions == NULL) return false;
        
        fs->transactions = new_transactions;
        fs->capacity = new_capacity;
    }
    
    // 创建新交易
    Transaction* t = &fs->transactions[fs->count];
    t->id = fs->count + 1;
    t->type = type;
    t->amount = amount;
    strncpy(t->description, description, MAX_DESCRIPTION - 1);
    t->description[MAX_DESCRIPTION - 1] = '\0';
    strncpy(t->category, category, MAX_CATEGORY - 1);
    t->category[MAX_CATEGORY - 1] = '\0';
    t->timestamp = time(NULL);
    
    // 更新余额
    if (type == TRANSACTION_INCOME) {
        fs->balance += amount;
    } else {
        fs->balance -= amount;
    }
    
    fs->count++;
    return true;
}

// 保存到文件
bool finance_save(const FinanceSystem* fs, const char* filename) {
    if (fs == NULL) return false;
    
    FILE* file = fopen(filename, "wb");
    if (file == NULL) {
        printf("无法创建文件: %s\n", filename);
        return false;
    }
    
    // 写入文件头
    const char signature[] = "FINANCE1";
    fwrite(signature, sizeof(signature), 1, file);
    fwrite(&fs->count, sizeof(int), 1, file);
    fwrite(&fs->balance, sizeof(double), 1, file);
    
    // 写入交易记录
    if (fs->count > 0) {
        fwrite(fs->transactions, sizeof(Transaction), fs->count, file);
    }
    
    fclose(file);
    printf("财务数据已保存到: %s\n", filename);
    return true;
}

// 从文件加载
bool finance_load(FinanceSystem* fs, const char* filename) {
    if (fs == NULL) return false;
    
    FILE* file = fopen(filename, "rb");
    if (file == NULL) {
        printf("文件不存在，将创建新的财务记录\n");
        return true;  // 不是错误，只是文件不存在
    }
    
    // 读取文件头
    char signature[9];
    if (fread(signature, sizeof(signature), 1, file) != 1) {
        printf("读取文件签名失败\n");
        fclose(file);
        return false;
    }
    
    if (strcmp(signature, "FINANCE1") != 0) {
        printf("无效的文件格式\n");
        fclose(file);
        return false;
    }
    
    int count;
    double balance;
    if (fread(&count, sizeof(int), 1, file) != 1 ||
        fread(&balance, sizeof(double), 1, file) != 1) {
        printf("读取文件头失败\n");
        fclose(file);
        return false;
    }
    
    // 分配内存
    if (count > 0) {
        fs->transactions = malloc(count * sizeof(Transaction));
        if (fs->transactions == NULL) {
            printf("内存分配失败\n");
            fclose(file);
            return false;
        }
        
        // 读取交易记录
        if (fread(fs->transactions, sizeof(Transaction), count, file) != count) {
            printf("读取交易记录失败\n");
            free(fs->transactions);
            fs->transactions = NULL;
            fclose(file);
            return false;
        }
    }
    
    fs->count = count;
    fs->capacity = count;
    fs->balance = balance;
    
    fclose(file);
    printf("成功加载 %d 条交易记录，当前余额: %.2f\n", count, balance);
    return true;
}

// 导出为CSV
bool finance_export_csv(const FinanceSystem* fs, const char* filename) {
    if (fs == NULL) return false;
    
    FILE* file = fopen(filename, "w");
    if (file == NULL) {
        printf("无法创建CSV文件: %s\n", filename);
        return false;
    }
    
    // 写入CSV头
    fprintf(file, "ID,类型,金额,描述,类别,时间\n");
    
    // 写入交易记录
    for (int i = 0; i < fs->count; i++) {
        const Transaction* t = &fs->transactions[i];
        char time_str[64];
        struct tm* tm_info = localtime(&t->timestamp);
        strftime(time_str, sizeof(time_str), "%Y-%m-%d %H:%M:%S", tm_info);
        
        fprintf(file, "%d,%s,%.2f,\"%s\",\"%s\",%s\n",
                t->id,
                t->type == TRANSACTION_INCOME ? "收入" : "支出",
                t->amount,
                t->description,
                t->category,
                time_str);
    }
    
    fclose(file);
    printf("交易记录已导出到CSV文件: %s\n", filename);
    return true;
}

// 显示统计信息
void finance_show_statistics(const FinanceSystem* fs) {
    if (fs == NULL || fs->count == 0) {
        printf("暂无交易记录\n");
        return;
    }
    
    double total_income = 0.0;
    double total_expense = 0.0;
    
    for (int i = 0; i < fs->count; i++) {
        const Transaction* t = &fs->transactions[i];
        if (t->type == TRANSACTION_INCOME) {
            total_income += t->amount;
        } else {
            total_expense += t->amount;
        }
    }
    
    printf("\n=== 财务统计 ===\n");
    printf("总收入: %.2f\n", total_income);
    printf("总支出: %.2f\n", total_expense);
    printf("净收入: %.2f\n", total_income - total_expense);
    printf("当前余额: %.2f\n", fs->balance);
    printf("交易笔数: %d\n", fs->count);
}

// 显示最近交易
void finance_show_recent_transactions(const FinanceSystem* fs, int limit) {
    if (fs == NULL || fs->count == 0) {
        printf("暂无交易记录\n");
        return;
    }
    
    printf("\n=== 最近 %d 笔交易 ===\n", limit);
    printf("%-4s %-8s %-10s %-20s %-15s %-20s\n", 
           "ID", "类型", "金额", "描述", "类别", "时间");
    printf("--------------------------------------------------------------------------------\n");
    
    int start = (fs->count > limit) ? fs->count - limit : 0;
    for (int i = start; i < fs->count; i++) {
        const Transaction* t = &fs->transactions[i];
        char time_str[64];
        struct tm* tm_info = localtime(&t->timestamp);
        strftime(time_str, sizeof(time_str), "%m-%d %H:%M", tm_info);
        
        printf("%-4d %-8s %-10.2f %-20s %-15s %-20s\n",
               t->id,
               t->type == TRANSACTION_INCOME ? "收入" : "支出",
               t->amount,
               t->description,
               t->category,
               time_str);
    }
}

// 释放内存
void finance_free(FinanceSystem* fs) {
    if (fs != NULL) {
        free(fs->transactions);
        free(fs);
    }
}

// 主程序演示
void demonstrate_finance_system(void) {
    printf("=== 个人财务管理系统演示 ===\n");
    
    FinanceSystem* fs = finance_create();
    if (fs == NULL) {
        printf("系统创建失败\n");
        return;
    }
    
    // 加载现有数据
    finance_load(fs, DATA_FILE);
    
    // 添加一些示例交易
    finance_add_transaction(fs, TRANSACTION_INCOME, 5000.00, "工资", "薪资");
    finance_add_transaction(fs, TRANSACTION_EXPENSE, 1200.00, "房租", "住房");
    finance_add_transaction(fs, TRANSACTION_EXPENSE, 300.00, "超市购物", "食品");
    finance_add_transaction(fs, TRANSACTION_EXPENSE, 150.00, "加油", "交通");
    finance_add_transaction(fs, TRANSACTION_INCOME, 200.00, "兼职收入", "其他");
    finance_add_transaction(fs, TRANSACTION_EXPENSE, 80.00, "电话费", "通讯");
    
    // 显示统计信息
    finance_show_statistics(fs);
    
    // 显示最近交易
    finance_show_recent_transactions(fs, 5);
    
    // 保存数据
    finance_save(fs, DATA_FILE);
    
    // 创建备份
    finance_save(fs, BACKUP_FILE);
    
    // 导出CSV
    finance_export_csv(fs, "finance_export.csv");
    
    // 清理
    finance_free(fs);
    
    printf("\n演示完成！\n");
    printf("数据文件: %s\n", DATA_FILE);
    printf("备份文件: %s\n", BACKUP_FILE);
    printf("CSV导出: finance_export.csv\n");
}

int main(void) {
    demonstrate_finance_system();
    return 0;
}
```

# 四、总结与下一步

## （一）本文重点回顾

通过本文的深入学习，您已经掌握了：

**文件操作基础：**
- 文本文件和二进制文件的读写
- 文件指针和随机访问技术
- 错误处理和异常情况处理

**高级文件技术：**
- 结构体的序列化和反序列化
- CSV文件的解析和生成
- 文件格式设计和版本控制

**实践应用：**
- 个人财务管理系统的完整实现
- 数据持久化的最佳实践
- 文件备份和数据导出功能

## （二）最佳实践

1. **错误处理**：始终检查文件操作的返回值
2. **资源管理**：及时关闭文件句柄，避免资源泄漏
3. **数据完整性**：使用文件头和校验和保证数据完整性
4. **版本兼容**：设计可扩展的文件格式
5. **备份策略**：定期备份重要数据

{% btn '/2025/08/10/学习/【学习】C语言高级特性与现代编程：提升代码质量/', 下一篇：高级特性与现代编程, far fa-hand-point-right, blue %}

---

**参考资料：**
- 《C程序设计语言》- Brian W. Kernighan & Dennis M. Ritchie
- 《UNIX环境高级编程》- W. Richard Stevens
- 《C语言接口与实现》- David R. Hanson
- 《文件系统设计与实现》- Marshall Kirk McKusick
- C语言文件I/O参考：https://en.cppreference.com/w/c/io
