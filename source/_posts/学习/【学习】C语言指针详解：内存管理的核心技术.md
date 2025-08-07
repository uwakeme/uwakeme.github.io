---
title: 【学习】C语言指针详解：内存管理的核心技术
categories: 学习
date: 2025-08-07
tags:
  - C语言
  - 指针
  - 内存管理
  - 动态内存
  - 编程进阶
---

# 前言

在掌握了数组和字符串的基础上，我们现在要学习C语言中最重要也最具挑战性的概念——指针。指针是C语言的核心特性，也是区别于其他高级编程语言的重要特征。

**指针的本质：**
指针本质上是一个变量，但它存储的不是普通的数值，而是内存地址。通过这个地址，我们可以访问和操作存储在该地址上的数据。

**为什么需要指针？**
- **内存效率**：直接操作内存地址，避免数据复制，提高程序效率
- **动态内存管理**：在程序运行时动态分配和释放内存
- **数据结构实现**：链表、树、图等复杂数据结构的基础
- **函数参数传递**：实现函数对外部变量的直接修改
- **系统级编程**：操作系统、驱动程序等底层开发的必备工具

**学习指针的关键点：**
- 理解内存地址的概念
- 掌握指针的声明和初始化
- 学会指针的解引用操作
- 理解指针与数组的关系
- 掌握动态内存分配

**学习建议：**
指针概念相对抽象，建议通过大量的代码实例和内存图示来加深理解。不要急于求成，循序渐进地掌握每个概念。

# 一、指针基础概念

## （一）什么是指针

### 1. 指针的基本概念

指针是一个特殊的变量，它存储的是另一个变量的内存地址。可以将指针理解为"指向某个内存位置的标识"。

**内存地址的概念：**
计算机内存可以想象成一排带编号的储物柜，每个柜子都有唯一的编号（地址），可以存放数据。指针就是记录这些编号的变量。

```c
#include <stdio.h>

int main() {
    int num = 42;           // 定义一个整数变量
    int *ptr;               // 定义一个指向整数的指针
    
    ptr = &num;             // 将num的地址赋给指针ptr
    
    // 输出变量和指针的信息
    printf("变量num的值: %d\n", num);
    printf("变量num的地址: %p\n", &num);
    printf("指针ptr的值(存储的地址): %p\n", ptr);
    printf("指针ptr指向的值: %d\n", *ptr);  // 解引用操作
    printf("指针ptr本身的地址: %p\n", &ptr);
    
    // 通过指针修改变量的值
    *ptr = 100;
    printf("通过指针修改后，num的值: %d\n", num);
    
    return 0;
}
```

### 2. 指针的基本操作

```c
#include <stdio.h>

int main() {
    int a = 10, b = 20;
    int *p1, *p2;
    
    // 指针赋值
    p1 = &a;                // p1指向变量a
    p2 = &b;                // p2指向变量b
    
    printf("初始状态:\n");
    printf("a = %d, b = %d\n", a, b);
    printf("*p1 = %d, *p2 = %d\n", *p1, *p2);
    
    // 通过指针交换两个变量的值
    int temp = *p1;         // temp = a的值
    *p1 = *p2;              // a = b的值
    *p2 = temp;             // b = temp(原来a的值)
    
    printf("\n交换后:\n");
    printf("a = %d, b = %d\n", a, b);
    printf("*p1 = %d, *p2 = %d\n", *p1, *p2);
    
    // 指针重新赋值
    p1 = p2;                // 现在p1和p2都指向变量b
    printf("\np1 = p2后:\n");
    printf("*p1 = %d, *p2 = %d\n", *p1, *p2);
    printf("p1和p2指向同一个地址: %s\n", (p1 == p2) ? "是" : "否");
    
    return 0;
}
```

## （二）指针与数组

### 1. 数组名作为指针

```c
#include <stdio.h>

int main() {
    int arr[5] = {10, 20, 30, 40, 50};
    int *ptr = arr;         // 数组名arr等价于&arr[0]
    
    printf("数组元素及其地址:\n");
    for (int i = 0; i < 5; i++) {
        printf("arr[%d] = %d, 地址: %p\n", i, arr[i], &arr[i]);
    }
    
    printf("\n通过指针访问数组:\n");
    for (int i = 0; i < 5; i++) {
        printf("*(ptr + %d) = %d, 地址: %p\n", i, *(ptr + i), ptr + i);
    }
    
    printf("\n指针算术运算:\n");
    printf("ptr指向: %p, 值: %d\n", ptr, *ptr);
    ptr++;                  // 指针向前移动一个int的大小
    printf("ptr++后指向: %p, 值: %d\n", ptr, *ptr);
    ptr += 2;               // 指针向前移动两个int的大小
    printf("ptr+=2后指向: %p, 值: %d\n", ptr, *ptr);
    
    return 0;
}
```

### 2. 指针数组与数组指针

```c
#include <stdio.h>

int main() {
    // 指针数组：数组的每个元素都是指针
    int a = 1, b = 2, c = 3;
    int *ptr_array[3] = {&a, &b, &c};  // 包含3个int*指针的数组
    
    printf("指针数组示例:\n");
    for (int i = 0; i < 3; i++) {
        printf("ptr_array[%d] 指向的值: %d\n", i, *ptr_array[i]);
    }
    
    // 数组指针：指向数组的指针
    int arr[4] = {10, 20, 30, 40};
    int (*array_ptr)[4] = &arr;        // 指向包含4个int的数组的指针
    
    printf("\n数组指针示例:\n");
    for (int i = 0; i < 4; i++) {
        printf("(*array_ptr)[%d] = %d\n", i, (*array_ptr)[i]);
    }
    
    // 字符串数组（指针数组的常见应用）
    char *names[] = {"张三", "李四", "王五", "赵六"};
    int name_count = sizeof(names) / sizeof(names[0]);
    
    printf("\n姓名列表:\n");
    for (int i = 0; i < name_count; i++) {
        printf("%d. %s\n", i + 1, names[i]);
    }
    
    return 0;
}
```

# 二、函数与指针

## （一）指针作为函数参数

### 1. 值传递与地址传递

```c
#include <stdio.h>

// 值传递：无法修改原变量
void swap_by_value(int x, int y) {
    int temp = x;
    x = y;
    y = temp;
    printf("函数内部: x = %d, y = %d\n", x, y);
}

// 地址传递：可以修改原变量
void swap_by_pointer(int *x, int *y) {
    int temp = *x;
    *x = *y;
    *y = temp;
    printf("函数内部: *x = %d, *y = %d\n", *x, *y);
}

int main() {
    int a = 10, b = 20;
    
    printf("交换前: a = %d, b = %d\n", a, b);
    
    // 值传递方式
    printf("\n使用值传递:\n");
    swap_by_value(a, b);
    printf("函数调用后: a = %d, b = %d\n", a, b);  // a和b没有改变
    
    // 地址传递方式
    printf("\n使用地址传递:\n");
    swap_by_pointer(&a, &b);
    printf("函数调用后: a = %d, b = %d\n", a, b);  // a和b已交换
    
    return 0;
}
```

### 2. 数组作为函数参数

```c
#include <stdio.h>

// 计算数组元素的和
int array_sum(int arr[], int size) {
    int sum = 0;
    for (int i = 0; i < size; i++) {
        sum += arr[i];
    }
    return sum;
}

// 查找数组中的最大值
int find_max(int *arr, int size) {
    int max = arr[0];
    for (int i = 1; i < size; i++) {
        if (arr[i] > max) {
            max = arr[i];
        }
    }
    return max;
}

// 修改数组元素（将所有元素乘以2）
void double_array(int arr[], int size) {
    for (int i = 0; i < size; i++) {
        arr[i] *= 2;
    }
}

// 打印数组
void print_array(int arr[], int size) {
    printf("数组内容: ");
    for (int i = 0; i < size; i++) {
        printf("%d ", arr[i]);
    }
    printf("\n");
}

int main() {
    int numbers[] = {3, 7, 1, 9, 4, 6, 2, 8, 5};
    int size = sizeof(numbers) / sizeof(numbers[0]);
    
    printf("原始数组:\n");
    print_array(numbers, size);
    
    // 计算数组和
    int sum = array_sum(numbers, size);
    printf("数组元素之和: %d\n", sum);
    
    // 查找最大值
    int max = find_max(numbers, size);
    printf("数组最大值: %d\n", max);
    
    // 修改数组
    printf("\n将数组元素翻倍:\n");
    double_array(numbers, size);
    print_array(numbers, size);
    
    return 0;
}
```

## （二）函数指针

### 1. 函数指针的基本使用

```c
#include <stdio.h>

// 定义几个简单的数学函数
int add(int a, int b) {
    return a + b;
}

int subtract(int a, int b) {
    return a - b;
}

int multiply(int a, int b) {
    return a * b;
}

int divide(int a, int b) {
    if (b != 0) {
        return a / b;
    } else {
        printf("错误：除数不能为零！\n");
        return 0;
    }
}

int main() {
    // 声明函数指针
    int (*operation)(int, int);
    
    int x = 20, y = 5;
    int choice;
    
    printf("简单计算器\n");
    printf("请选择操作: 1.加法 2.减法 3.乘法 4.除法\n");
    printf("请输入选择(1-4): ");
    scanf("%d", &choice);
    
    // 根据选择设置函数指针
    switch (choice) {
        case 1:
            operation = add;
            printf("%d + %d = ", x, y);
            break;
        case 2:
            operation = subtract;
            printf("%d - %d = ", x, y);
            break;
        case 3:
            operation = multiply;
            printf("%d × %d = ", x, y);
            break;
        case 4:
            operation = divide;
            printf("%d ÷ %d = ", x, y);
            break;
        default:
            printf("无效选择！\n");
            return 1;
    }
    
    // 通过函数指针调用函数
    int result = operation(x, y);
    printf("%d\n", result);
    
    return 0;
}
```

### 2. 函数指针数组

```c
#include <stdio.h>
#include <string.h>

// 字符串处理函数
void to_upper(char *str) {
    while (*str) {
        if (*str >= 'a' && *str <= 'z') {
            *str = *str - 'a' + 'A';
        }
        str++;
    }
}

void to_lower(char *str) {
    while (*str) {
        if (*str >= 'A' && *str <= 'Z') {
            *str = *str - 'A' + 'a';
        }
        str++;
    }
}

void reverse_string(char *str) {
    int len = strlen(str);
    for (int i = 0; i < len / 2; i++) {
        char temp = str[i];
        str[i] = str[len - 1 - i];
        str[len - 1 - i] = temp;
    }
}

int main() {
    // 函数指针数组
    void (*string_operations[])(char*) = {to_upper, to_lower, reverse_string};
    char *operation_names[] = {"转换为大写", "转换为小写", "反转字符串"};
    
    char text[100];
    int choice;
    
    printf("字符串处理工具\n");
    printf("请输入一个字符串: ");
    fgets(text, sizeof(text), stdin);
    text[strcspn(text, "\n")] = '\0';  // 去除换行符
    
    printf("\n请选择操作:\n");
    for (int i = 0; i < 3; i++) {
        printf("%d. %s\n", i + 1, operation_names[i]);
    }
    
    printf("请输入选择(1-3): ");
    scanf("%d", &choice);
    
    if (choice >= 1 && choice <= 3) {
        printf("\n原字符串: %s\n", text);
        
        // 通过函数指针数组调用相应函数
        string_operations[choice - 1](text);
        
        printf("处理后: %s\n", text);
    } else {
        printf("无效选择！\n");
    }
    
    return 0;
}
```

# 三、动态内存分配

## （一）malloc和free

### 1. 基本的动态内存分配

```c
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

int main() {
    int n;
    
    printf("请输入要存储的整数个数: ");
    scanf("%d", &n);
    
    // 动态分配内存
    int *numbers = (int*)malloc(n * sizeof(int));
    
    // 检查内存分配是否成功
    if (numbers == NULL) {
        printf("内存分配失败！\n");
        return 1;
    }
    
    // 输入数据
    printf("请输入%d个整数:\n", n);
    for (int i = 0; i < n; i++) {
        printf("第%d个数: ", i + 1);
        scanf("%d", &numbers[i]);
    }
    
    // 计算平均值
    int sum = 0;
    for (int i = 0; i < n; i++) {
        sum += numbers[i];
    }
    double average = (double)sum / n;
    
    // 输出结果
    printf("\n输入的数字: ");
    for (int i = 0; i < n; i++) {
        printf("%d ", numbers[i]);
    }
    printf("\n平均值: %.2f\n", average);
    
    // 释放内存
    free(numbers);
    numbers = NULL;  // 避免悬空指针
    
    return 0;
}
```

### 2. 动态字符串处理

```c
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

// 动态创建字符串副本
char* create_string_copy(const char* source) {
    if (source == NULL) {
        return NULL;
    }
    
    int len = strlen(source);
    char *copy = (char*)malloc((len + 1) * sizeof(char));
    
    if (copy != NULL) {
        strcpy(copy, source);
    }
    
    return copy;
}

// 动态连接两个字符串
char* concatenate_strings(const char* str1, const char* str2) {
    if (str1 == NULL || str2 == NULL) {
        return NULL;
    }
    
    int len1 = strlen(str1);
    int len2 = strlen(str2);
    char *result = (char*)malloc((len1 + len2 + 1) * sizeof(char));
    
    if (result != NULL) {
        strcpy(result, str1);
        strcat(result, str2);
    }
    
    return result;
}

int main() {
    char input1[100], input2[100];
    
    printf("请输入第一个字符串: ");
    fgets(input1, sizeof(input1), stdin);
    input1[strcspn(input1, "\n")] = '\0';
    
    printf("请输入第二个字符串: ");
    fgets(input2, sizeof(input2), stdin);
    input2[strcspn(input2, "\n")] = '\0';
    
    // 创建字符串副本
    char *copy1 = create_string_copy(input1);
    char *copy2 = create_string_copy(input2);
    
    if (copy1 && copy2) {
        printf("\n字符串副本:\n");
        printf("副本1: %s\n", copy1);
        printf("副本2: %s\n", copy2);
        
        // 连接字符串
        char *combined = concatenate_strings(copy1, copy2);
        if (combined) {
            printf("连接后: %s\n", combined);
            free(combined);
        }
    }
    
    // 释放内存
    free(copy1);
    free(copy2);
    
    return 0;
}
```

## （二）calloc和realloc

### 1. calloc的使用

```c
#include <stdio.h>
#include <stdlib.h>

int main() {
    int n = 5;
    
    // 使用malloc分配内存（内容未初始化）
    int *arr1 = (int*)malloc(n * sizeof(int));
    printf("malloc分配的内存内容:\n");
    for (int i = 0; i < n; i++) {
        printf("arr1[%d] = %d\n", i, arr1[i]);  // 可能包含垃圾值
    }
    
    // 使用calloc分配内存（内容初始化为0）
    int *arr2 = (int*)calloc(n, sizeof(int));
    printf("\ncalloc分配的内存内容:\n");
    for (int i = 0; i < n; i++) {
        printf("arr2[%d] = %d\n", i, arr2[i]);  // 全部为0
    }
    
    // 为数组赋值
    for (int i = 0; i < n; i++) {
        arr2[i] = (i + 1) * 10;
    }
    
    printf("\n赋值后的数组:\n");
    for (int i = 0; i < n; i++) {
        printf("arr2[%d] = %d\n", i, arr2[i]);
    }
    
    free(arr1);
    free(arr2);
    
    return 0;
}
```

### 2. realloc的使用

```c
#include <stdio.h>
#include <stdlib.h>

int main() {
    int capacity = 3;
    int size = 0;
    
    // 初始分配内存
    int *numbers = (int*)malloc(capacity * sizeof(int));
    if (numbers == NULL) {
        printf("内存分配失败！\n");
        return 1;
    }
    
    printf("动态数组演示（初始容量: %d）\n", capacity);
    
    int input;
    while (1) {
        printf("请输入一个整数（输入0结束）: ");
        scanf("%d", &input);
        
        if (input == 0) {
            break;
        }
        
        // 检查是否需要扩容
        if (size >= capacity) {
            capacity *= 2;  // 容量翻倍
            printf("数组已满，扩容到 %d\n", capacity);
            
            // 重新分配内存
            int *temp = (int*)realloc(numbers, capacity * sizeof(int));
            if (temp == NULL) {
                printf("内存重新分配失败！\n");
                free(numbers);
                return 1;
            }
            numbers = temp;
        }
        
        // 添加新元素
        numbers[size] = input;
        size++;
        
        // 显示当前数组内容
        printf("当前数组: ");
        for (int i = 0; i < size; i++) {
            printf("%d ", numbers[i]);
        }
        printf("(大小: %d, 容量: %d)\n", size, capacity);
    }
    
    printf("\n最终数组: ");
    for (int i = 0; i < size; i++) {
        printf("%d ", numbers[i]);
    }
    printf("\n");
    
    free(numbers);
    return 0;
}
```

# 四、实践项目：动态通讯录

```c
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

// 联系人结构体
typedef struct {
    char name[50];
    char phone[20];
    char email[50];
} Contact;

// 通讯录结构体
typedef struct {
    Contact *contacts;
    int size;
    int capacity;
} AddressBook;

// 函数声明
AddressBook* create_address_book();
void destroy_address_book(AddressBook *book);
int add_contact(AddressBook *book, const char *name, const char *phone, const char *email);
void display_contacts(const AddressBook *book);
int find_contact(const AddressBook *book, const char *name);
void delete_contact(AddressBook *book, int index);
void show_menu();

int main() {
    AddressBook *book = create_address_book();
    if (book == NULL) {
        printf("创建通讯录失败！\n");
        return 1;
    }
    
    int choice;
    char name[50], phone[20], email[50];
    
    printf("=== 动态通讯录系统 ===\n");
    
    while (1) {
        show_menu();
        printf("请选择操作: ");
        scanf("%d", &choice);
        
        // 清空输入缓冲区
        while (getchar() != '\n');
        
        switch (choice) {
            case 1:  // 添加联系人
                printf("请输入姓名: ");
                fgets(name, sizeof(name), stdin);
                name[strcspn(name, "\n")] = '\0';
                
                printf("请输入电话: ");
                fgets(phone, sizeof(phone), stdin);
                phone[strcspn(phone, "\n")] = '\0';
                
                printf("请输入邮箱: ");
                fgets(email, sizeof(email), stdin);
                email[strcspn(email, "\n")] = '\0';
                
                if (add_contact(book, name, phone, email)) {
                    printf("联系人添加成功！\n");
                } else {
                    printf("联系人添加失败！\n");
                }
                break;
                
            case 2:  // 显示所有联系人
                display_contacts(book);
                break;
                
            case 3:  // 查找联系人
                printf("请输入要查找的姓名: ");
                fgets(name, sizeof(name), stdin);
                name[strcspn(name, "\n")] = '\0';
                
                int index = find_contact(book, name);
                if (index != -1) {
                    printf("找到联系人:\n");
                    printf("姓名: %s\n", book->contacts[index].name);
                    printf("电话: %s\n", book->contacts[index].phone);
                    printf("邮箱: %s\n", book->contacts[index].email);
                } else {
                    printf("未找到该联系人！\n");
                }
                break;
                
            case 4:  // 删除联系人
                printf("请输入要删除的联系人姓名: ");
                fgets(name, sizeof(name), stdin);
                name[strcspn(name, "\n")] = '\0';
                
                index = find_contact(book, name);
                if (index != -1) {
                    delete_contact(book, index);
                    printf("联系人删除成功！\n");
                } else {
                    printf("未找到该联系人！\n");
                }
                break;
                
            case 0:  // 退出
                printf("感谢使用通讯录系统！\n");
                destroy_address_book(book);
                return 0;
                
            default:
                printf("无效选择，请重新输入！\n");
        }
        
        printf("\n按回车键继续...");
        getchar();
    }
    
    return 0;
}

// 创建通讯录
AddressBook* create_address_book() {
    AddressBook *book = (AddressBook*)malloc(sizeof(AddressBook));
    if (book == NULL) {
        return NULL;
    }
    
    book->capacity = 2;  // 初始容量
    book->size = 0;
    book->contacts = (Contact*)malloc(book->capacity * sizeof(Contact));
    
    if (book->contacts == NULL) {
        free(book);
        return NULL;
    }
    
    return book;
}

// 销毁通讯录
void destroy_address_book(AddressBook *book) {
    if (book != NULL) {
        free(book->contacts);
        free(book);
    }
}

// 添加联系人
int add_contact(AddressBook *book, const char *name, const char *phone, const char *email) {
    if (book == NULL || name == NULL || phone == NULL || email == NULL) {
        return 0;
    }
    
    // 检查是否需要扩容
    if (book->size >= book->capacity) {
        book->capacity *= 2;
        Contact *temp = (Contact*)realloc(book->contacts, book->capacity * sizeof(Contact));
        if (temp == NULL) {
            return 0;
        }
        book->contacts = temp;
        printf("通讯录已扩容到 %d\n", book->capacity);
    }
    
    // 添加新联系人
    strcpy(book->contacts[book->size].name, name);
    strcpy(book->contacts[book->size].phone, phone);
    strcpy(book->contacts[book->size].email, email);
    book->size++;
    
    return 1;
}

// 显示所有联系人
void display_contacts(const AddressBook *book) {
    if (book == NULL || book->size == 0) {
        printf("通讯录为空！\n");
        return;
    }
    
    printf("\n=== 通讯录列表 ===\n");
    for (int i = 0; i < book->size; i++) {
        printf("%d. 姓名: %s\n", i + 1, book->contacts[i].name);
        printf("   电话: %s\n", book->contacts[i].phone);
        printf("   邮箱: %s\n", book->contacts[i].email);
        printf("   ----------------\n");
    }
    printf("总共 %d 个联系人\n", book->size);
}

// 查找联系人
int find_contact(const AddressBook *book, const char *name) {
    if (book == NULL || name == NULL) {
        return -1;
    }
    
    for (int i = 0; i < book->size; i++) {
        if (strcmp(book->contacts[i].name, name) == 0) {
            return i;
        }
    }
    
    return -1;
}

// 删除联系人
void delete_contact(AddressBook *book, int index) {
    if (book == NULL || index < 0 || index >= book->size) {
        return;
    }
    
    // 将后面的联系人向前移动
    for (int i = index; i < book->size - 1; i++) {
        book->contacts[i] = book->contacts[i + 1];
    }
    
    book->size--;
}

// 显示菜单
void show_menu() {
    printf("\n=== 菜单 ===\n");
    printf("1. 添加联系人\n");
    printf("2. 显示所有联系人\n");
    printf("3. 查找联系人\n");
    printf("4. 删除联系人\n");
    printf("0. 退出\n");
}
```

# 五、总结与进阶

## （一）指针编程的核心原则

**内存安全原则：**
1. **指针初始化**：声明指针时立即初始化，避免野指针
2. **边界检查**：访问内存前确保地址有效
3. **资源管理**：每个malloc都要有对应的free
4. **状态维护**：释放内存后将指针设为NULL

**代码质量要求：**
```c
// 推荐的指针使用模式
int *ptr = NULL;                    // 初始化为NULL
ptr = (int*)malloc(sizeof(int));    // 分配内存
if (ptr != NULL) {                  // 检查分配是否成功
    *ptr = 42;                      // 安全使用
    // ... 其他操作
    free(ptr);                      // 释放内存
    ptr = NULL;                     // 避免悬空指针
}
```

## （二）常见陷阱与解决方案

**内存管理错误：**
```c
// 错误示例及其修正
// 1. 内存泄漏
int *ptr = (int*)malloc(sizeof(int));
// ptr = NULL;  // 错误：直接赋值导致内存泄漏
free(ptr);      // 正确：先释放再赋值
ptr = NULL;

// 2. 悬空指针
int *ptr = (int*)malloc(sizeof(int));
free(ptr);
// *ptr = 10;   // 错误：使用已释放的内存
ptr = NULL;     // 正确：标记为无效

// 3. 重复释放
// free(ptr);   // 错误：重复释放同一块内存
if (ptr != NULL) {  // 正确：检查后释放
    free(ptr);
    ptr = NULL;
}
```

## （三）进阶学习路径

**技术深化方向：**
1. **高级数据结构**：链表、二叉树、哈希表的指针实现
2. **函数指针应用**：回调函数、状态机、插件系统
3. **内存管理策略**：内存池、对象池、智能指针模拟
4. **系统编程**：进程间通信、共享内存、内存映射

**实践项目建议：**
- 实现动态数组和字符串类
- 开发简单的内存分配器
- 构建基于指针的数据结构库
- 编写内存调试工具

**学习资源推荐：**
- 深入研究操作系统的内存管理机制
- 学习其他语言的内存管理模型
- 阅读优秀开源项目的指针使用方式
- 练习指针相关的算法题目

指针是C语言的精髓，掌握它不仅能提高编程能力，更能加深对计算机系统的理解。继续深入学习，您将能够开发出高效、可靠的系统级程序。

---

**参考资料：**
- 《C程序设计语言》- Brian W. Kernighan & Dennis M. Ritchie
- 《C和指针》- Kenneth A. Reek
- 《C专家编程》- Peter van der Linden
- 《深入理解计算机系统》- Randal E. Bryant
