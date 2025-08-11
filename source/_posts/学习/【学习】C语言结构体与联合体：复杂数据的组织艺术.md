---
title: 【学习】C语言结构体与联合体：复杂数据的组织艺术
categories: 学习
date: 2025-08-11 14:00:00
tags:
  - C语言
  - 结构体
  - 联合体
  - 数据组织
  - 内存对齐
series: C语言系统学习
---

{% note info %}
**C语言系统学习系列 - 第5篇**
深入探讨C语言中复杂数据类型的组织方式，掌握结构体、联合体和位域的高级用法。
{% endnote %}

# 前言

在前面的学习中，我们掌握了基本数据类型、数组和指针。但在实际编程中，我们经常需要处理更复杂的数据结构。结构体（struct）和联合体（union）是C语言提供的强大工具，让我们能够将相关的数据组织在一起，形成逻辑上的整体。

**为什么需要复杂数据类型？**

现实世界中的对象往往具有多个属性：
- **学生信息**：姓名、学号、年龄、成绩等
- **图形对象**：坐标、颜色、大小、形状等
- **网络数据包**：源地址、目标地址、数据长度、校验和等
- **文件信息**：文件名、大小、创建时间、权限等

**本文学习目标：**
- 深入理解结构体的定义和使用
- 掌握联合体的特性和应用场景
- 学会位域的使用和内存优化
- 理解内存对齐和填充机制
- 掌握复杂数据结构的设计模式

{% btn '/2025/08/10/学习/【学习】C语言指针与内存管理：掌握底层编程的核心/', 上一篇：指针与内存管理, far fa-hand-point-left, green %}

# 一、结构体深度解析

## （一）结构体基础与高级特性

### 1. 结构体的定义和初始化

```c
#include <stdio.h>
#include <string.h>
#include <stdbool.h>

// 基本结构体定义
struct Student {
    int id;                 // 学号
    char name[50];          // 姓名
    int age;                // 年龄
    float gpa;              // 平均绩点
    bool is_graduate;       // 是否毕业
};

// 使用typedef简化结构体名称
typedef struct {
    double x, y;            // 坐标
    char color[20];         // 颜色
    float radius;           // 半径
} Circle;

// 嵌套结构体
typedef struct {
    int year;
    int month;
    int day;
} Date;

typedef struct {
    char title[100];
    char author[50];
    Date publish_date;      // 嵌套结构体
    float price;
    int pages;
} Book;

void demonstrate_struct_basics(void) {
    printf("=== 结构体基础演示 ===\n");
    
    // 结构体初始化的不同方式
    
    // 方式1：声明后逐个赋值
    struct Student student1;
    student1.id = 1001;
    strcpy(student1.name, "张三");
    student1.age = 20;
    student1.gpa = 3.8f;
    student1.is_graduate = false;
    
    // 方式2：初始化列表
    struct Student student2 = {1002, "李四", 21, 3.6f, false};
    
    // 方式3：指定成员初始化（C99特性）
    struct Student student3 = {
        .id = 1003,
        .name = "王五",
        .age = 22,
        .gpa = 3.9f,
        .is_graduate = true
    };
    
    // 方式4：部分初始化
    struct Student student4 = {1004, "赵六"};  // 其他成员自动初始化为0
    
    printf("学生信息:\n");
    printf("学生1: ID=%d, 姓名=%s, 年龄=%d, GPA=%.1f, 毕业=%s\n",
           student1.id, student1.name, student1.age, student1.gpa,
           student1.is_graduate ? "是" : "否");
    
    printf("学生2: ID=%d, 姓名=%s, 年龄=%d, GPA=%.1f, 毕业=%s\n",
           student2.id, student2.name, student2.age, student2.gpa,
           student2.is_graduate ? "是" : "否");
    
    printf("学生3: ID=%d, 姓名=%s, 年龄=%d, GPA=%.1f, 毕业=%s\n",
           student3.id, student3.name, student3.age, student3.gpa,
           student3.is_graduate ? "是" : "否");
    
    printf("学生4: ID=%d, 姓名=%s, 年龄=%d, GPA=%.1f, 毕业=%s\n",
           student4.id, student4.name, student4.age, student4.gpa,
           student4.is_graduate ? "是" : "否");
    
    // 嵌套结构体演示
    printf("\n嵌套结构体演示:\n");
    Book book = {
        .title = "C语言程序设计",
        .author = "谭浩强",
        .publish_date = {2020, 3, 15},  // 嵌套结构体初始化
        .price = 45.50f,
        .pages = 380
    };
    
    printf("书籍信息:\n");
    printf("书名: %s\n", book.title);
    printf("作者: %s\n", book.author);
    printf("出版日期: %d年%d月%d日\n", 
           book.publish_date.year, book.publish_date.month, book.publish_date.day);
    printf("价格: %.2f元\n", book.price);
    printf("页数: %d页\n", book.pages);
}

// 结构体作为函数参数
void print_student_by_value(struct Student s) {
    printf("按值传递 - 学生信息: ID=%d, 姓名=%s\n", s.id, s.name);
    s.id = 9999;  // 修改不会影响原结构体
}

void print_student_by_pointer(const struct Student* s) {
    if (s == NULL) return;
    printf("按指针传递 - 学生信息: ID=%d, 姓名=%s\n", s->id, s->name);
    // s->id = 9999;  // 由于const限制，不能修改
}

void update_student_gpa(struct Student* s, float new_gpa) {
    if (s != NULL) {
        s->gpa = new_gpa;
    }
}

void demonstrate_struct_parameters(void) {
    printf("\n=== 结构体参数传递 ===\n");
    
    struct Student student = {1001, "测试学生", 20, 3.5f, false};
    
    printf("原始学生信息: ID=%d, GPA=%.1f\n", student.id, student.gpa);
    
    // 按值传递
    print_student_by_value(student);
    printf("按值传递后: ID=%d (未改变)\n", student.id);
    
    // 按指针传递
    print_student_by_pointer(&student);
    
    // 通过指针修改
    update_student_gpa(&student, 3.8f);
    printf("更新GPA后: GPA=%.1f\n", student.gpa);
}

int main(void) {
    demonstrate_struct_basics();
    demonstrate_struct_parameters();
    return 0;
}
```

### 2. 内存对齐和填充

```c
#include <stdio.h>
#include <stddef.h>

// 演示内存对齐的结构体
struct UnalignedStruct {
    char c1;        // 1字节
    int i;          // 4字节
    char c2;        // 1字节
    double d;       // 8字节
    short s;        // 2字节
};

struct AlignedStruct {
    double d;       // 8字节，最大对齐要求
    int i;          // 4字节
    short s;        // 2字节
    char c1;        // 1字节
    char c2;        // 1字节
    // 编译器会在末尾添加填充以满足对齐要求
};

// 使用#pragma pack控制对齐
#pragma pack(1)  // 1字节对齐
struct PackedStruct {
    char c1;
    int i;
    char c2;
    double d;
    short s;
};
#pragma pack()   // 恢复默认对齐

void demonstrate_memory_alignment(void) {
    printf("=== 内存对齐演示 ===\n");
    
    printf("基本类型对齐要求:\n");
    printf("char:   大小=%zu, 对齐=%zu\n", sizeof(char), _Alignof(char));
    printf("short:  大小=%zu, 对齐=%zu\n", sizeof(short), _Alignof(short));
    printf("int:    大小=%zu, 对齐=%zu\n", sizeof(int), _Alignof(int));
    printf("double: 大小=%zu, 对齐=%zu\n", sizeof(double), _Alignof(double));
    
    printf("\n结构体大小比较:\n");
    printf("UnalignedStruct: %zu 字节\n", sizeof(struct UnalignedStruct));
    printf("AlignedStruct:   %zu 字节\n", sizeof(struct AlignedStruct));
    printf("PackedStruct:    %zu 字节\n", sizeof(struct PackedStruct));
    
    // 分析UnalignedStruct的内存布局
    printf("\nUnalignedStruct成员偏移:\n");
    printf("c1 偏移: %zu\n", offsetof(struct UnalignedStruct, c1));
    printf("i  偏移: %zu\n", offsetof(struct UnalignedStruct, i));
    printf("c2 偏移: %zu\n", offsetof(struct UnalignedStruct, c2));
    printf("d  偏移: %zu\n", offsetof(struct UnalignedStruct, d));
    printf("s  偏移: %zu\n", offsetof(struct UnalignedStruct, s));
    
    printf("\nAlignedStruct成员偏移:\n");
    printf("d  偏移: %zu\n", offsetof(struct AlignedStruct, d));
    printf("i  偏移: %zu\n", offsetof(struct AlignedStruct, i));
    printf("s  偏移: %zu\n", offsetof(struct AlignedStruct, s));
    printf("c1 偏移: %zu\n", offsetof(struct AlignedStruct, c1));
    printf("c2 偏移: %zu\n", offsetof(struct AlignedStruct, c2));
    
    printf("\nPackedStruct成员偏移:\n");
    printf("c1 偏移: %zu\n", offsetof(struct PackedStruct, c1));
    printf("i  偏移: %zu\n", offsetof(struct PackedStruct, i));
    printf("c2 偏移: %zu\n", offsetof(struct PackedStruct, c2));
    printf("d  偏移: %zu\n", offsetof(struct PackedStruct, d));
    printf("s  偏移: %zu\n", offsetof(struct PackedStruct, s));
}

int main(void) {
    demonstrate_memory_alignment();
    return 0;
}
```

## （二）结构体数组和指针

### 1. 结构体数组的使用

```c
#include <stdio.h>
#include <string.h>
#include <stdlib.h>

typedef struct {
    int id;
    char name[30];
    float salary;
    int department_id;
} Employee;

// 比较函数，用于排序
int compare_by_salary(const void* a, const void* b) {
    const Employee* emp_a = (const Employee*)a;
    const Employee* emp_b = (const Employee*)b;
    
    if (emp_a->salary < emp_b->salary) return -1;
    if (emp_a->salary > emp_b->salary) return 1;
    return 0;
}

int compare_by_name(const void* a, const void* b) {
    const Employee* emp_a = (const Employee*)a;
    const Employee* emp_b = (const Employee*)b;
    return strcmp(emp_a->name, emp_b->name);
}

void print_employees(const Employee employees[], int count) {
    printf("员工列表:\n");
    printf("%-4s %-15s %-10s %-6s\n", "ID", "姓名", "薪资", "部门");
    printf("----------------------------------------\n");
    for (int i = 0; i < count; i++) {
        printf("%-4d %-15s %-10.2f %-6d\n",
               employees[i].id, employees[i].name,
               employees[i].salary, employees[i].department_id);
    }
    printf("\n");
}

void demonstrate_struct_arrays(void) {
    printf("=== 结构体数组演示 ===\n");
    
    // 初始化员工数组
    Employee employees[] = {
        {1001, "张三", 8500.0f, 1},
        {1002, "李四", 9200.0f, 2},
        {1003, "王五", 7800.0f, 1},
        {1004, "赵六", 10500.0f, 3},
        {1005, "钱七", 8900.0f, 2}
    };
    
    int emp_count = sizeof(employees) / sizeof(employees[0]);
    
    printf("原始员工数据:\n");
    print_employees(employees, emp_count);
    
    // 按薪资排序
    qsort(employees, emp_count, sizeof(Employee), compare_by_salary);
    printf("按薪资排序后:\n");
    print_employees(employees, emp_count);
    
    // 按姓名排序
    qsort(employees, emp_count, sizeof(Employee), compare_by_name);
    printf("按姓名排序后:\n");
    print_employees(employees, emp_count);
    
    // 查找特定员工
    Employee key = {0, "李四", 0, 0};
    Employee* found = bsearch(&key, employees, emp_count, 
                             sizeof(Employee), compare_by_name);
    
    if (found != NULL) {
        printf("找到员工: ID=%d, 姓名=%s, 薪资=%.2f\n",
               found->id, found->name, found->salary);
    } else {
        printf("未找到指定员工\n");
    }
}

int main(void) {
    demonstrate_struct_arrays();
    return 0;
}
```

# 二、联合体详解

## （一）联合体的特性和应用

### 1. 联合体基础概念

```c
#include <stdio.h>
#include <string.h>

// 基本联合体定义
union Data {
    int i;
    float f;
    char str[20];
};

// 带标签的联合体（变体记录）
typedef enum {
    TYPE_INT,
    TYPE_FLOAT,
    TYPE_STRING
} DataType;

typedef struct {
    DataType type;      // 标签，指示当前存储的数据类型
    union {
        int i;
        float f;
        char str[20];
    } value;
} TaggedUnion;

void demonstrate_union_basics(void) {
    printf("=== 联合体基础演示 ===\n");
    
    union Data data;
    
    printf("联合体大小: %zu 字节\n", sizeof(union Data));
    printf("各成员地址:\n");
    printf("data.i   地址: %p\n", (void*)&data.i);
    printf("data.f   地址: %p\n", (void*)&data.f);
    printf("data.str 地址: %p\n", (void*)data.str);
    
    // 存储整数
    data.i = 42;
    printf("\n存储整数 42:\n");
    printf("data.i = %d\n", data.i);
    printf("data.f = %f (垃圾值)\n", data.f);
    printf("data.str = \"%s\" (垃圾值)\n", data.str);
    
    // 存储浮点数
    data.f = 3.14159f;
    printf("\n存储浮点数 3.14159:\n");
    printf("data.i = %d (垃圾值)\n", data.i);
    printf("data.f = %f\n", data.f);
    printf("data.str = \"%s\" (垃圾值)\n", data.str);
    
    // 存储字符串
    strcpy(data.str, "Hello");
    printf("\n存储字符串 \"Hello\":\n");
    printf("data.i = %d (垃圾值)\n", data.i);
    printf("data.f = %f (垃圾值)\n", data.f);
    printf("data.str = \"%s\"\n", data.str);
}

// 安全使用联合体的函数
void set_tagged_union_int(TaggedUnion* tu, int value) {
    tu->type = TYPE_INT;
    tu->value.i = value;
}

void set_tagged_union_float(TaggedUnion* tu, float value) {
    tu->type = TYPE_FLOAT;
    tu->value.f = value;
}

void set_tagged_union_string(TaggedUnion* tu, const char* value) {
    tu->type = TYPE_STRING;
    strncpy(tu->value.str, value, sizeof(tu->value.str) - 1);
    tu->value.str[sizeof(tu->value.str) - 1] = '\0';
}

void print_tagged_union(const TaggedUnion* tu) {
    switch (tu->type) {
        case TYPE_INT:
            printf("整数: %d\n", tu->value.i);
            break;
        case TYPE_FLOAT:
            printf("浮点数: %.2f\n", tu->value.f);
            break;
        case TYPE_STRING:
            printf("字符串: \"%s\"\n", tu->value.str);
            break;
        default:
            printf("未知类型\n");
    }
}

void demonstrate_tagged_union(void) {
    printf("\n=== 带标签联合体演示 ===\n");
    
    TaggedUnion tu;
    
    // 安全地使用联合体
    set_tagged_union_int(&tu, 100);
    print_tagged_union(&tu);
    
    set_tagged_union_float(&tu, 2.718f);
    print_tagged_union(&tu);
    
    set_tagged_union_string(&tu, "C语言");
    print_tagged_union(&tu);
}

int main(void) {
    demonstrate_union_basics();
    demonstrate_tagged_union();
    return 0;
}
```

### 2. 联合体的实际应用

```c
#include <stdio.h>
#include <stdint.h>

// 网络字节序转换
union ByteOrder {
    uint32_t value;
    uint8_t bytes[4];
};

// IP地址表示
union IPAddress {
    uint32_t addr;
    struct {
        uint8_t a, b, c, d;
    } octets;
};

// 颜色表示（RGB和十六进制）
union Color {
    uint32_t hex;
    struct {
        uint8_t blue;
        uint8_t green;
        uint8_t red;
        uint8_t alpha;
    } rgba;
};

void demonstrate_practical_unions(void) {
    printf("=== 联合体实际应用 ===\n");
    
    // 字节序检测
    union ByteOrder test = {0x12345678};
    printf("字节序检测:\n");
    printf("32位值: 0x%08X\n", test.value);
    printf("字节序列: ");
    for (int i = 0; i < 4; i++) {
        printf("0x%02X ", test.bytes[i]);
    }
    if (test.bytes[0] == 0x78) {
        printf("(小端序)\n");
    } else {
        printf("(大端序)\n");
    }
    
    // IP地址操作
    printf("\nIP地址操作:\n");
    union IPAddress ip = {0xC0A80101};  // 192.168.1.1
    printf("IP地址: %d.%d.%d.%d\n", 
           ip.octets.a, ip.octets.b, ip.octets.c, ip.octets.d);
    printf("32位表示: 0x%08X\n", ip.addr);
    
    // 颜色操作
    printf("\n颜色操作:\n");
    union Color color = {0xFF0080FF};  // 红色，半透明
    printf("颜色值: 0x%08X\n", color.hex);
    printf("RGBA: R=%d, G=%d, B=%d, A=%d\n",
           color.rgba.red, color.rgba.green, 
           color.rgba.blue, color.rgba.alpha);
    
    // 修改单个颜色分量
    color.rgba.green = 255;
    printf("修改绿色分量后: 0x%08X\n", color.hex);
    printf("新RGBA: R=%d, G=%d, B=%d, A=%d\n",
           color.rgba.red, color.rgba.green, 
           color.rgba.blue, color.rgba.alpha);
}

int main(void) {
    demonstrate_practical_unions();
    return 0;
}
```

# 三、位域（Bit Fields）

## （一）位域的定义和使用

```c
#include <stdio.h>
#include <stdbool.h>

// 位域结构体
struct Flags {
    unsigned int is_visible : 1;    // 1位
    unsigned int is_enabled : 1;    // 1位
    unsigned int priority : 3;      // 3位 (0-7)
    unsigned int category : 4;      // 4位 (0-15)
    unsigned int reserved : 7;      // 7位保留
    // 总共16位，占用2字节
};

// 文件权限位域
struct FilePermissions {
    unsigned int owner_read : 1;
    unsigned int owner_write : 1;
    unsigned int owner_execute : 1;
    unsigned int group_read : 1;
    unsigned int group_write : 1;
    unsigned int group_execute : 1;
    unsigned int other_read : 1;
    unsigned int other_write : 1;
    unsigned int other_execute : 1;
    unsigned int : 7;  // 未命名位域，用于填充
};

// 网络数据包头部
struct PacketHeader {
    unsigned int version : 4;       // IP版本
    unsigned int header_length : 4; // 头部长度
    unsigned int type_of_service : 8; // 服务类型
    unsigned int total_length : 16;  // 总长度
    unsigned int identification : 16; // 标识
    unsigned int flags : 3;         // 标志
    unsigned int fragment_offset : 13; // 片偏移
    unsigned int ttl : 8;           // 生存时间
    unsigned int protocol : 8;      // 协议
    unsigned int checksum : 16;     // 校验和
};

void demonstrate_bit_fields(void) {
    printf("=== 位域演示 ===\n");
    
    printf("结构体大小:\n");
    printf("struct Flags: %zu 字节\n", sizeof(struct Flags));
    printf("struct FilePermissions: %zu 字节\n", sizeof(struct FilePermissions));
    printf("struct PacketHeader: %zu 字节\n", sizeof(struct PacketHeader));
    
    // 使用标志位域
    struct Flags flags = {0};
    flags.is_visible = 1;
    flags.is_enabled = 0;
    flags.priority = 5;
    flags.category = 12;
    
    printf("\n标志设置:\n");
    printf("可见: %s\n", flags.is_visible ? "是" : "否");
    printf("启用: %s\n", flags.is_enabled ? "是" : "否");
    printf("优先级: %u\n", flags.priority);
    printf("类别: %u\n", flags.category);
    
    // 文件权限演示
    struct FilePermissions perms = {0};
    perms.owner_read = 1;
    perms.owner_write = 1;
    perms.owner_execute = 1;
    perms.group_read = 1;
    perms.group_execute = 1;
    perms.other_read = 1;
    
    printf("\n文件权限 (类似 rwxr-xr--):\n");
    printf("所有者: %c%c%c\n",
           perms.owner_read ? 'r' : '-',
           perms.owner_write ? 'w' : '-',
           perms.owner_execute ? 'x' : '-');
    printf("组: %c%c%c\n",
           perms.group_read ? 'r' : '-',
           perms.group_write ? 'w' : '-',
           perms.group_execute ? 'x' : '-');
    printf("其他: %c%c%c\n",
           perms.other_read ? 'r' : '-',
           perms.other_write ? 'w' : '-',
           perms.other_execute ? 'x' : '-');
    
    // 网络包头演示
    struct PacketHeader packet = {0};
    packet.version = 4;          // IPv4
    packet.header_length = 5;    // 20字节
    packet.total_length = 1500;  // 1500字节
    packet.ttl = 64;            // 64跳
    packet.protocol = 6;         // TCP
    
    printf("\n网络包头信息:\n");
    printf("IP版本: %u\n", packet.version);
    printf("头部长度: %u (实际: %u字节)\n", packet.header_length, packet.header_length * 4);
    printf("总长度: %u字节\n", packet.total_length);
    printf("TTL: %u\n", packet.ttl);
    printf("协议: %u (TCP)\n", packet.protocol);
}

int main(void) {
    demonstrate_bit_fields();
    return 0;
}
```

# 四、实践项目：学生管理系统（完整版）

让我们创建一个使用结构体、联合体和位域的完整学生管理系统：

```c
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <stdbool.h>
#include <time.h>

#define MAX_NAME_LENGTH 50
#define MAX_STUDENTS 1000

// 日期结构体
typedef struct {
    int year;
    int month;
    int day;
} Date;

// 成绩联合体（支持不同评分系统）
typedef enum {
    GRADE_PERCENTAGE,   // 百分制
    GRADE_GPA,         // GPA制
    GRADE_LETTER       // 字母制
} GradeType;

typedef union {
    float percentage;   // 0-100
    float gpa;         // 0.0-4.0
    char letter;       // A, B, C, D, F
} GradeValue;

typedef struct {
    GradeType type;
    GradeValue value;
} Grade;

// 学生状态位域
struct StudentStatus {
    unsigned int is_active : 1;      // 是否在校
    unsigned int is_graduate : 1;    // 是否毕业
    unsigned int has_scholarship : 1; // 是否有奖学金
    unsigned int is_international : 1; // 是否国际学生
    unsigned int year : 4;           // 年级 (1-15)
    unsigned int semester : 4;       // 学期 (1-15)
    unsigned int : 4;               // 保留位
};

// 完整的学生结构体
typedef struct {
    int id;
    char name[MAX_NAME_LENGTH];
    Date birth_date;
    Date enrollment_date;
    Grade grades[10];               // 最多10门课程成绩
    int grade_count;
    struct StudentStatus status;
    char major[MAX_NAME_LENGTH];
    char email[MAX_NAME_LENGTH];
} Student;

// 学生管理系统
typedef struct {
    Student* students;
    int count;
    int capacity;
} StudentSystem;

// 创建学生管理系统
StudentSystem* create_student_system(int initial_capacity) {
    StudentSystem* system = malloc(sizeof(StudentSystem));
    if (system == NULL) return NULL;
    
    system->students = malloc(initial_capacity * sizeof(Student));
    if (system->students == NULL) {
        free(system);
        return NULL;
    }
    
    system->count = 0;
    system->capacity = initial_capacity;
    return system;
}

// 添加学生
bool add_student(StudentSystem* system, const Student* student) {
    if (system == NULL || student == NULL) return false;
    
    // 扩容检查
    if (system->count >= system->capacity) {
        int new_capacity = system->capacity * 2;
        Student* new_students = realloc(system->students, 
                                       new_capacity * sizeof(Student));
        if (new_students == NULL) return false;
        
        system->students = new_students;
        system->capacity = new_capacity;
    }
    
    system->students[system->count] = *student;
    system->count++;
    return true;
}

// 查找学生
Student* find_student_by_id(StudentSystem* system, int id) {
    if (system == NULL) return NULL;
    
    for (int i = 0; i < system->count; i++) {
        if (system->students[i].id == id) {
            return &system->students[i];
        }
    }
    return NULL;
}

// 打印成绩
void print_grade(const Grade* grade) {
    switch (grade->type) {
        case GRADE_PERCENTAGE:
            printf("%.1f%%", grade->value.percentage);
            break;
        case GRADE_GPA:
            printf("%.2f GPA", grade->value.gpa);
            break;
        case GRADE_LETTER:
            printf("%c", grade->value.letter);
            break;
    }
}

// 打印学生信息
void print_student(const Student* student) {
    if (student == NULL) return;
    
    printf("学生信息:\n");
    printf("  学号: %d\n", student->id);
    printf("  姓名: %s\n", student->name);
    printf("  专业: %s\n", student->major);
    printf("  邮箱: %s\n", student->email);
    printf("  出生日期: %d-%02d-%02d\n", 
           student->birth_date.year, student->birth_date.month, student->birth_date.day);
    printf("  入学日期: %d-%02d-%02d\n", 
           student->enrollment_date.year, student->enrollment_date.month, student->enrollment_date.day);
    
    printf("  状态: ");
    printf("%s", student->status.is_active ? "在校" : "离校");
    printf(", %s", student->status.is_graduate ? "已毕业" : "在读");
    printf(", %d年级", student->status.year);
    printf(", 第%d学期", student->status.semester);
    if (student->status.has_scholarship) printf(", 有奖学金");
    if (student->status.is_international) printf(", 国际学生");
    printf("\n");
    
    if (student->grade_count > 0) {
        printf("  成绩: ");
        for (int i = 0; i < student->grade_count; i++) {
            print_grade(&student->grades[i]);
            if (i < student->grade_count - 1) printf(", ");
        }
        printf("\n");
    }
    printf("\n");
}

// 演示函数
void demonstrate_student_system(void) {
    printf("=== 学生管理系统演示 ===\n");
    
    StudentSystem* system = create_student_system(10);
    if (system == NULL) {
        printf("系统创建失败\n");
        return;
    }
    
    // 创建示例学生
    Student student1 = {
        .id = 2021001,
        .name = "张三",
        .birth_date = {2000, 5, 15},
        .enrollment_date = {2021, 9, 1},
        .grade_count = 3,
        .grades = {
            {GRADE_PERCENTAGE, {.percentage = 85.5f}},
            {GRADE_GPA, {.gpa = 3.7f}},
            {GRADE_LETTER, {.letter = 'A'}}
        },
        .status = {
            .is_active = 1,
            .is_graduate = 0,
            .has_scholarship = 1,
            .is_international = 0,
            .year = 3,
            .semester = 1
        },
        .major = "计算机科学",
        .email = "zhangsan@university.edu"
    };
    
    Student student2 = {
        .id = 2021002,
        .name = "李四",
        .birth_date = {1999, 12, 3},
        .enrollment_date = {2021, 9, 1},
        .grade_count = 2,
        .grades = {
            {GRADE_PERCENTAGE, {.percentage = 92.0f}},
            {GRADE_GPA, {.gpa = 3.9f}}
        },
        .status = {
            .is_active = 1,
            .is_graduate = 0,
            .has_scholarship = 0,
            .is_international = 1,
            .year = 3,
            .semester = 1
        },
        .major = "电子工程",
        .email = "lisi@university.edu"
    };
    
    // 添加学生
    add_student(system, &student1);
    add_student(system, &student2);
    
    printf("系统中共有 %d 名学生\n\n", system->count);
    
    // 显示所有学生
    for (int i = 0; i < system->count; i++) {
        print_student(&system->students[i]);
    }
    
    // 查找特定学生
    Student* found = find_student_by_id(system, 2021001);
    if (found != NULL) {
        printf("找到学号为 2021001 的学生:\n");
        print_student(found);
    }
    
    // 清理内存
    free(system->students);
    free(system);
    printf("系统已清理\n");
}

int main(void) {
    demonstrate_student_system();
    return 0;
}
```

# 五、总结与下一步

## （一）本文重点回顾

通过本文的深入学习，您已经掌握了：

**结构体高级特性：**
- 结构体的定义、初始化和使用
- 内存对齐和填充机制
- 结构体数组和指针操作

**联合体应用：**
- 联合体的特性和内存共享
- 带标签联合体的安全使用
- 联合体在系统编程中的应用

**位域技术：**
- 位域的定义和使用
- 内存优化和位操作
- 在协议解析中的应用

**综合实践：**
- 复杂数据结构的设计
- 学生管理系统的完整实现
- 多种数据组织方式的结合使用

## （二）设计原则

1. **数据封装**：将相关数据组织在一起
2. **内存效率**：合理使用对齐和位域
3. **类型安全**：使用标签联合体避免错误
4. **可维护性**：清晰的结构设计和命名

{% btn '/2025/08/10/学习/【学习】C语言文件操作与数据持久化：构建实用程序/', 下一篇：文件操作与数据持久化, far fa-hand-point-right, blue %}

---

**参考资料：**
- 《C程序设计语言》- Brian W. Kernighan & Dennis M. Ritchie
- 《C和指针》- Kenneth A. Reek
- 《深入理解计算机系统》- Randal E. Bryant
- 《数据结构与算法分析》- Mark Allen Weiss
- C语言结构体参考：https://en.cppreference.com/w/c/language/struct
