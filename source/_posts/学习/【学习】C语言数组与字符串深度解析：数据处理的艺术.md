---
title: 【学习】C语言数组与字符串深度解析：数据处理的艺术
categories: 学习
date: 2025-08-11 12:00:00
tags:
  - C语言
  - 数组
  - 字符串
  - 数据结构
  - 内存管理
series: C语言系统学习
---

{% note info %}
**C语言系统学习系列 - 第3篇**
深入探讨C语言中数组和字符串的高级用法，掌握高效的数据处理技巧和内存管理策略。
{% endnote %}

# 前言

数组和字符串是C语言中最基础也最重要的数据结构。它们不仅是存储数据的容器，更是理解C语言内存模型和指针概念的关键。掌握数组和字符串的深层原理，对于编写高效、安全的C程序至关重要。

**为什么深入学习数组和字符串？**

在实际编程中，我们经常需要处理大量的数据：
- **科学计算**：处理实验数据、统计分析
- **文本处理**：解析配置文件、处理用户输入
- **图像处理**：像素数据的存储和操作
- **网络编程**：数据包的组装和解析

**本文学习目标：**
- 深入理解数组的内存布局和访问机制
- 掌握多维数组的使用和优化技巧
- 精通字符串处理的各种技术
- 学会高效的字符串算法实现
- 理解数组与指针的深层关系

{% btn '/2025/08/10/学习/【学习】C语言函数与模块化编程：构建可维护的代码/', 上一篇：函数与模块化编程, far fa-hand-point-left, green %}

# 一、数组深度解析

## （一）数组的内存模型

### 1. 数组在内存中的布局

```c
#include <stdio.h>
#include <stdint.h>

void analyze_array_memory(void) {
    printf("=== 数组内存布局分析 ===\n");
    
    // 一维数组
    int arr1d[5] = {10, 20, 30, 40, 50};
    
    printf("一维数组内存分析:\n");
    printf("数组名地址: %p\n", (void*)arr1d);
    printf("数组大小: %zu 字节\n", sizeof(arr1d));
    printf("元素大小: %zu 字节\n", sizeof(arr1d[0]));
    printf("元素个数: %zu\n", sizeof(arr1d) / sizeof(arr1d[0]));
    
    // 打印每个元素的地址和值
    for (int i = 0; i < 5; i++) {
        printf("arr1d[%d]: 地址=%p, 值=%d, 偏移=%ld字节\n", 
               i, (void*)&arr1d[i], arr1d[i], 
               (char*)&arr1d[i] - (char*)arr1d);
    }
    
    // 二维数组
    printf("\n二维数组内存分析:\n");
    int arr2d[3][4] = {
        {1, 2, 3, 4},
        {5, 6, 7, 8},
        {9, 10, 11, 12}
    };
    
    printf("二维数组大小: %zu 字节\n", sizeof(arr2d));
    printf("行大小: %zu 字节\n", sizeof(arr2d[0]));
    
    // 打印二维数组的内存布局
    for (int i = 0; i < 3; i++) {
        for (int j = 0; j < 4; j++) {
            printf("arr2d[%d][%d]: 地址=%p, 值=%2d\n", 
                   i, j, (void*)&arr2d[i][j], arr2d[i][j]);
        }
    }
    
    // 验证数组的连续性
    printf("\n内存连续性验证:\n");
    int* ptr = (int*)arr2d;  // 将二维数组视为一维数组
    for (int i = 0; i < 12; i++) {
        printf("ptr[%2d] = %2d (地址: %p)\n", i, ptr[i], (void*)&ptr[i]);
    }
}

// 数组作为函数参数的退化
void print_array_info(int arr[], int size) {
    printf("\n函数内数组参数分析:\n");
    printf("参数arr的大小: %zu 字节 (实际是指针)\n", sizeof(arr));
    printf("参数arr的地址: %p\n", (void*)arr);
    printf("传入的size: %d\n", size);
}

int main(void) {
    analyze_array_memory();
    
    int test_array[10] = {0};
    printf("\n主函数中数组大小: %zu 字节\n", sizeof(test_array));
    print_array_info(test_array, 10);
    
    return 0;
}
```

### 2. 数组初始化的高级技巧

```c
#include <stdio.h>
#include <string.h>

void advanced_array_initialization(void) {
    printf("=== 数组初始化高级技巧 ===\n");
    
    // C99指定初始化器
    int sparse_array[10] = {
        [0] = 1,      // 第0个元素为1
        [4] = 5,      // 第4个元素为5
        [9] = 10      // 第9个元素为10
    };                // 其他元素自动初始化为0
    
    printf("稀疏数组初始化:\n");
    for (int i = 0; i < 10; i++) {
        printf("sparse_array[%d] = %d\n", i, sparse_array[i]);
    }
    
    // 结构体数组的指定初始化
    typedef struct {
        int id;
        char name[20];
        float score;
    } Student;
    
    Student students[] = {
        {.id = 1001, .name = "Alice", .score = 95.5},
        {.id = 1002, .name = "Bob", .score = 87.0},
        {.id = 1003, .name = "Charlie", .score = 92.5}
    };
    
    printf("\n结构体数组:\n");
    int student_count = sizeof(students) / sizeof(students[0]);
    for (int i = 0; i < student_count; i++) {
        printf("ID: %d, Name: %s, Score: %.1f\n", 
               students[i].id, students[i].name, students[i].score);
    }
    
    // 字符数组的不同初始化方式
    char str1[] = "Hello";           // 自动计算大小，包含'\0'
    char str2[10] = "World";         // 指定大小，剩余位置填0
    char str3[] = {'H', 'i', '\0'};  // 字符列表初始化
    char str4[5] = {'T', 'e', 's', 't'}; // 不包含'\0'，需要注意
    
    printf("\n字符数组初始化:\n");
    printf("str1: \"%s\" (大小: %zu)\n", str1, sizeof(str1));
    printf("str2: \"%s\" (大小: %zu)\n", str2, sizeof(str2));
    printf("str3: \"%s\" (大小: %zu)\n", str3, sizeof(str3));
    printf("str4: \"");
    for (int i = 0; i < 5; i++) {
        printf("%c", str4[i]);
    }
    printf("\" (大小: %zu, 无终止符)\n", sizeof(str4));
}

int main(void) {
    advanced_array_initialization();
    return 0;
}
```

## （二）多维数组的高级应用

### 1. 动态二维数组的实现

```c
#include <stdio.h>
#include <stdlib.h>
#include <time.h>

// 方法1：使用指针数组实现动态二维数组
int** create_2d_array_v1(int rows, int cols) {
    // 分配指针数组
    int** array = malloc(rows * sizeof(int*));
    if (array == NULL) return NULL;
    
    // 为每一行分配内存
    for (int i = 0; i < rows; i++) {
        array[i] = malloc(cols * sizeof(int));
        if (array[i] == NULL) {
            // 如果分配失败，释放已分配的内存
            for (int j = 0; j < i; j++) {
                free(array[j]);
            }
            free(array);
            return NULL;
        }
    }
    
    return array;
}

void free_2d_array_v1(int** array, int rows) {
    if (array == NULL) return;
    
    for (int i = 0; i < rows; i++) {
        free(array[i]);
    }
    free(array);
}

// 方法2：使用连续内存块实现动态二维数组
typedef struct {
    int* data;
    int rows;
    int cols;
} Matrix;

Matrix* create_matrix(int rows, int cols) {
    Matrix* matrix = malloc(sizeof(Matrix));
    if (matrix == NULL) return NULL;
    
    matrix->data = malloc(rows * cols * sizeof(int));
    if (matrix->data == NULL) {
        free(matrix);
        return NULL;
    }
    
    matrix->rows = rows;
    matrix->cols = cols;
    
    return matrix;
}

void free_matrix(Matrix* matrix) {
    if (matrix != NULL) {
        free(matrix->data);
        free(matrix);
    }
}

// 矩阵元素访问宏
#define MATRIX_GET(matrix, row, col) \
    ((matrix)->data[(row) * (matrix)->cols + (col)])

#define MATRIX_SET(matrix, row, col, value) \
    ((matrix)->data[(row) * (matrix)->cols + (col)] = (value))

// 矩阵运算函数
void fill_matrix_random(Matrix* matrix) {
    for (int i = 0; i < matrix->rows; i++) {
        for (int j = 0; j < matrix->cols; j++) {
            MATRIX_SET(matrix, i, j, rand() % 100);
        }
    }
}

void print_matrix(const Matrix* matrix) {
    printf("Matrix %dx%d:\n", matrix->rows, matrix->cols);
    for (int i = 0; i < matrix->rows; i++) {
        for (int j = 0; j < matrix->cols; j++) {
            printf("%3d ", MATRIX_GET(matrix, i, j));
        }
        printf("\n");
    }
}

Matrix* matrix_multiply(const Matrix* a, const Matrix* b) {
    if (a->cols != b->rows) {
        printf("错误：矩阵维度不匹配\n");
        return NULL;
    }
    
    Matrix* result = create_matrix(a->rows, b->cols);
    if (result == NULL) return NULL;
    
    // 矩阵乘法：C[i][j] = Σ(A[i][k] * B[k][j])
    for (int i = 0; i < a->rows; i++) {
        for (int j = 0; j < b->cols; j++) {
            int sum = 0;
            for (int k = 0; k < a->cols; k++) {
                sum += MATRIX_GET(a, i, k) * MATRIX_GET(b, k, j);
            }
            MATRIX_SET(result, i, j, sum);
        }
    }
    
    return result;
}

void demonstrate_dynamic_arrays(void) {
    printf("=== 动态二维数组演示 ===\n");
    
    srand((unsigned int)time(NULL));
    
    // 方法1演示
    printf("方法1：指针数组实现\n");
    int** arr2d = create_2d_array_v1(3, 4);
    if (arr2d != NULL) {
        // 填充数据
        for (int i = 0; i < 3; i++) {
            for (int j = 0; j < 4; j++) {
                arr2d[i][j] = i * 4 + j + 1;
            }
        }
        
        // 打印数组
        for (int i = 0; i < 3; i++) {
            for (int j = 0; j < 4; j++) {
                printf("%3d ", arr2d[i][j]);
            }
            printf("\n");
        }
        
        free_2d_array_v1(arr2d, 3);
    }
    
    // 方法2演示
    printf("\n方法2：连续内存块实现\n");
    Matrix* matrix_a = create_matrix(2, 3);
    Matrix* matrix_b = create_matrix(3, 2);
    
    if (matrix_a != NULL && matrix_b != NULL) {
        fill_matrix_random(matrix_a);
        fill_matrix_random(matrix_b);
        
        printf("矩阵A:\n");
        print_matrix(matrix_a);
        
        printf("\n矩阵B:\n");
        print_matrix(matrix_b);
        
        Matrix* result = matrix_multiply(matrix_a, matrix_b);
        if (result != NULL) {
            printf("\n矩阵A × 矩阵B:\n");
            print_matrix(result);
            free_matrix(result);
        }
    }
    
    free_matrix(matrix_a);
    free_matrix(matrix_b);
}

int main(void) {
    demonstrate_dynamic_arrays();
    return 0;
}
```

### 2. 数组算法优化技巧

```c
#include <stdio.h>
#include <stdlib.h>
#include <time.h>
#include <string.h>

// 高效的数组搜索算法
int linear_search(const int arr[], int size, int target) {
    for (int i = 0; i < size; i++) {
        if (arr[i] == target) {
            return i;
        }
    }
    return -1;
}

int binary_search(const int arr[], int size, int target) {
    int left = 0, right = size - 1;
    
    while (left <= right) {
        int mid = left + (right - left) / 2;  // 防止溢出
        
        if (arr[mid] == target) {
            return mid;
        } else if (arr[mid] < target) {
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }
    
    return -1;
}

// 高效的排序算法
void quick_sort(int arr[], int low, int high) {
    if (low < high) {
        int pivot = partition(arr, low, high);
        quick_sort(arr, low, pivot - 1);
        quick_sort(arr, pivot + 1, high);
    }
}

int partition(int arr[], int low, int high) {
    int pivot = arr[high];  // 选择最后一个元素作为基准
    int i = low - 1;        // 小于基准的元素的索引
    
    for (int j = low; j < high; j++) {
        if (arr[j] <= pivot) {
            i++;
            swap(&arr[i], &arr[j]);
        }
    }
    
    swap(&arr[i + 1], &arr[high]);
    return i + 1;
}

void swap(int* a, int* b) {
    int temp = *a;
    *a = *b;
    *b = temp;
}

// 归并排序（稳定排序）
void merge_sort(int arr[], int temp[], int left, int right) {
    if (left < right) {
        int mid = left + (right - left) / 2;
        
        merge_sort(arr, temp, left, mid);
        merge_sort(arr, temp, mid + 1, right);
        merge(arr, temp, left, mid, right);
    }
}

void merge(int arr[], int temp[], int left, int mid, int right) {
    // 复制数据到临时数组
    for (int i = left; i <= right; i++) {
        temp[i] = arr[i];
    }
    
    int i = left, j = mid + 1, k = left;
    
    // 合并两个有序子数组
    while (i <= mid && j <= right) {
        if (temp[i] <= temp[j]) {
            arr[k++] = temp[i++];
        } else {
            arr[k++] = temp[j++];
        }
    }
    
    // 复制剩余元素
    while (i <= mid) {
        arr[k++] = temp[i++];
    }
    while (j <= right) {
        arr[k++] = temp[j++];
    }
}

// 数组统计函数
typedef struct {
    int min;
    int max;
    double average;
    int sum;
} ArrayStats;

ArrayStats calculate_stats(const int arr[], int size) {
    ArrayStats stats = {arr[0], arr[0], 0.0, 0};
    
    for (int i = 0; i < size; i++) {
        if (arr[i] < stats.min) stats.min = arr[i];
        if (arr[i] > stats.max) stats.max = arr[i];
        stats.sum += arr[i];
    }
    
    stats.average = (double)stats.sum / size;
    return stats;
}

// 性能测试函数
void performance_test(void) {
    printf("=== 数组算法性能测试 ===\n");
    
    const int size = 100000;
    int* arr = malloc(size * sizeof(int));
    int* temp = malloc(size * sizeof(int));
    
    if (arr == NULL || temp == NULL) {
        printf("内存分配失败\n");
        return;
    }
    
    // 生成随机数据
    srand((unsigned int)time(NULL));
    for (int i = 0; i < size; i++) {
        arr[i] = rand() % 10000;
    }
    
    // 测试线性搜索
    clock_t start = clock();
    int target = arr[size / 2];  // 搜索中间的元素
    int index = linear_search(arr, size, target);
    clock_t end = clock();
    
    printf("线性搜索: 找到索引 %d, 耗时 %.2f ms\n", 
           index, ((double)(end - start) / CLOCKS_PER_SEC) * 1000);
    
    // 排序后测试二分搜索
    int* sorted_arr = malloc(size * sizeof(int));
    memcpy(sorted_arr, arr, size * sizeof(int));
    
    start = clock();
    merge_sort(sorted_arr, temp, 0, size - 1);
    end = clock();
    
    printf("归并排序: 耗时 %.2f ms\n", 
           ((double)(end - start) / CLOCKS_PER_SEC) * 1000);
    
    start = clock();
    index = binary_search(sorted_arr, size, target);
    end = clock();
    
    printf("二分搜索: 找到索引 %d, 耗时 %.2f ms\n", 
           index, ((double)(end - start) / CLOCKS_PER_SEC) * 1000);
    
    // 计算统计信息
    ArrayStats stats = calculate_stats(arr, size);
    printf("\n数组统计信息:\n");
    printf("最小值: %d\n", stats.min);
    printf("最大值: %d\n", stats.max);
    printf("平均值: %.2f\n", stats.average);
    printf("总和: %d\n", stats.sum);
    
    free(arr);
    free(temp);
    free(sorted_arr);
}

int main(void) {
    performance_test();
    return 0;
}
```

# 二、字符串深度解析

## （一）字符串的本质与内存管理

### 1. 字符串的内存表示

```c
#include <stdio.h>
#include <string.h>
#include <stdlib.h>

void analyze_string_memory(void) {
    printf("=== 字符串内存分析 ===\n");
    
    // 不同类型的字符串
    char str1[] = "Hello";           // 栈上的字符数组
    char* str2 = "World";            // 指向字符串字面量的指针
    char* str3 = malloc(20);         // 堆上分配的字符串
    strcpy(str3, "Dynamic");
    
    printf("字符串类型分析:\n");
    printf("str1 (数组): 地址=%p, 内容=\"%s\", 大小=%zu\n", 
           (void*)str1, str1, sizeof(str1));
    printf("str2 (指针): 地址=%p, 指向=%p, 内容=\"%s\"\n", 
           (void*)&str2, (void*)str2, str2);
    printf("str3 (堆): 地址=%p, 指向=%p, 内容=\"%s\"\n", 
           (void*)&str3, (void*)str3, str3);
    
    // 字符串字面量的特性
    char* literal1 = "Constant";
    char* literal2 = "Constant";
    
    printf("\n字符串字面量分析:\n");
    printf("literal1 指向: %p\n", (void*)literal1);
    printf("literal2 指向: %p\n", (void*)literal2);
    printf("是否指向同一地址: %s\n", 
           (literal1 == literal2) ? "是" : "否");
    
    // 字符串修改测试
    printf("\n字符串修改测试:\n");
    str1[0] = 'h';  // 可以修改数组
    printf("修改后的str1: %s\n", str1);
    
    // str2[0] = 'w';  // 错误！不能修改字符串字面量
    
    str3[0] = 'd';  // 可以修改堆上的字符串
    printf("修改后的str3: %s\n", str3);
    
    // 内存布局分析
    printf("\n内存布局分析:\n");
    for (int i = 0; str1[i] != '\0'; i++) {
        printf("str1[%d] = '%c' (ASCII: %d, 地址: %p)\n", 
               i, str1[i], str1[i], (void*)&str1[i]);
    }
    printf("str1终止符: '\\0' (ASCII: %d, 地址: %p)\n", 
           str1[strlen(str1)], (void*)&str1[strlen(str1)]);
    
    free(str3);
}

// 字符串长度计算的不同方法
size_t my_strlen(const char* str) {
    size_t len = 0;
    while (str[len] != '\0') {
        len++;
    }
    return len;
}

size_t my_strlen_pointer(const char* str) {
    const char* start = str;
    while (*str != '\0') {
        str++;
    }
    return str - start;
}

void string_length_comparison(void) {
    printf("\n=== 字符串长度计算比较 ===\n");
    
    const char* test_string = "Hello, World! 你好世界";
    
    printf("测试字符串: \"%s\"\n", test_string);
    printf("strlen(): %zu\n", strlen(test_string));
    printf("my_strlen(): %zu\n", my_strlen(test_string));
    printf("my_strlen_pointer(): %zu\n", my_strlen_pointer(test_string));
    
    // 注意：包含多字节字符时，字节长度与字符数量不同
    printf("字节数: %zu, 实际字符可能更少（包含多字节字符）\n", 
           strlen(test_string));
}

int main(void) {
    analyze_string_memory();
    string_length_comparison();
    return 0;
}
```

### 2. 安全的字符串操作

```c
#include <stdio.h>
#include <string.h>
#include <stdlib.h>
#include <stdbool.h>

// 安全的字符串复制函数
char* safe_strcpy(char* dest, size_t dest_size, const char* src) {
    if (dest == NULL || src == NULL || dest_size == 0) {
        return NULL;
    }
    
    size_t src_len = strlen(src);
    if (src_len >= dest_size) {
        // 源字符串太长，只复制能容纳的部分
        strncpy(dest, src, dest_size - 1);
        dest[dest_size - 1] = '\0';  // 确保以null结尾
    } else {
        strcpy(dest, src);
    }
    
    return dest;
}

// 安全的字符串连接函数
char* safe_strcat(char* dest, size_t dest_size, const char* src) {
    if (dest == NULL || src == NULL || dest_size == 0) {
        return NULL;
    }
    
    size_t dest_len = strlen(dest);
    size_t src_len = strlen(src);
    
    if (dest_len + src_len >= dest_size) {
        // 目标缓冲区空间不足
        size_t available = dest_size - dest_len - 1;
        strncat(dest, src, available);
    } else {
        strcat(dest, src);
    }
    
    return dest;
}

// 动态字符串结构
typedef struct {
    char* data;
    size_t length;
    size_t capacity;
} DynamicString;

DynamicString* ds_create(size_t initial_capacity) {
    DynamicString* ds = malloc(sizeof(DynamicString));
    if (ds == NULL) return NULL;
    
    ds->data = malloc(initial_capacity);
    if (ds->data == NULL) {
        free(ds);
        return NULL;
    }
    
    ds->data[0] = '\0';
    ds->length = 0;
    ds->capacity = initial_capacity;
    
    return ds;
}

void ds_destroy(DynamicString* ds) {
    if (ds != NULL) {
        free(ds->data);
        free(ds);
    }
}

bool ds_resize(DynamicString* ds, size_t new_capacity) {
    if (ds == NULL || new_capacity <= ds->length) {
        return false;
    }
    
    char* new_data = realloc(ds->data, new_capacity);
    if (new_data == NULL) {
        return false;
    }
    
    ds->data = new_data;
    ds->capacity = new_capacity;
    return true;
}

bool ds_append(DynamicString* ds, const char* str) {
    if (ds == NULL || str == NULL) {
        return false;
    }
    
    size_t str_len = strlen(str);
    size_t required_capacity = ds->length + str_len + 1;
    
    // 如果容量不足，扩展容量
    if (required_capacity > ds->capacity) {
        size_t new_capacity = ds->capacity * 2;
        if (new_capacity < required_capacity) {
            new_capacity = required_capacity;
        }
        
        if (!ds_resize(ds, new_capacity)) {
            return false;
        }
    }
    
    strcat(ds->data, str);
    ds->length += str_len;
    return true;
}

void demonstrate_safe_strings(void) {
    printf("=== 安全字符串操作演示 ===\n");
    
    // 安全复制演示
    char buffer[20];
    const char* long_string = "This is a very long string that exceeds buffer size";
    
    safe_strcpy(buffer, sizeof(buffer), long_string);
    printf("安全复制结果: \"%s\"\n", buffer);
    printf("缓冲区大小: %zu, 实际长度: %zu\n", sizeof(buffer), strlen(buffer));
    
    // 安全连接演示
    char dest[50] = "Hello, ";
    safe_strcat(dest, sizeof(dest), "World!");
    printf("安全连接结果: \"%s\"\n", dest);
    
    // 动态字符串演示
    printf("\n动态字符串演示:\n");
    DynamicString* ds = ds_create(10);
    if (ds != NULL) {
        printf("初始容量: %zu\n", ds->capacity);
        
        ds_append(ds, "Hello");
        printf("添加\"Hello\": \"%s\" (长度: %zu, 容量: %zu)\n", 
               ds->data, ds->length, ds->capacity);
        
        ds_append(ds, ", World!");
        printf("添加\", World!\": \"%s\" (长度: %zu, 容量: %zu)\n", 
               ds->data, ds->length, ds->capacity);
        
        ds_append(ds, " This is a longer string that will trigger reallocation.");
        printf("添加长字符串: \"%s\" (长度: %zu, 容量: %zu)\n", 
               ds->data, ds->length, ds->capacity);
        
        ds_destroy(ds);
    }
}

int main(void) {
    demonstrate_safe_strings();
    return 0;
}
```

## （二）字符串算法实现

### 1. 字符串匹配算法

```c
#include <stdio.h>
#include <string.h>
#include <stdlib.h>
#include <stdbool.h>

// 朴素字符串匹配算法
int naive_search(const char* text, const char* pattern) {
    int text_len = strlen(text);
    int pattern_len = strlen(pattern);
    
    for (int i = 0; i <= text_len - pattern_len; i++) {
        int j;
        for (j = 0; j < pattern_len; j++) {
            if (text[i + j] != pattern[j]) {
                break;
            }
        }
        if (j == pattern_len) {
            return i;  // 找到匹配
        }
    }
    
    return -1;  // 未找到
}

// KMP算法的前缀函数
void compute_lps(const char* pattern, int* lps) {
    int len = 0;  // 最长相等前后缀的长度
    int i = 1;
    int pattern_len = strlen(pattern);
    
    lps[0] = 0;  // lps[0]总是0
    
    while (i < pattern_len) {
        if (pattern[i] == pattern[len]) {
            len++;
            lps[i] = len;
            i++;
        } else {
            if (len != 0) {
                len = lps[len - 1];
            } else {
                lps[i] = 0;
                i++;
            }
        }
    }
}

// KMP字符串匹配算法
int kmp_search(const char* text, const char* pattern) {
    int text_len = strlen(text);
    int pattern_len = strlen(pattern);
    
    if (pattern_len == 0) return 0;
    
    // 计算LPS数组
    int* lps = malloc(pattern_len * sizeof(int));
    compute_lps(pattern, lps);
    
    int i = 0;  // text的索引
    int j = 0;  // pattern的索引
    
    while (i < text_len) {
        if (pattern[j] == text[i]) {
            i++;
            j++;
        }
        
        if (j == pattern_len) {
            free(lps);
            return i - j;  // 找到匹配
        } else if (i < text_len && pattern[j] != text[i]) {
            if (j != 0) {
                j = lps[j - 1];
            } else {
                i++;
            }
        }
    }
    
    free(lps);
    return -1;  // 未找到
}

// Boyer-Moore算法的坏字符表
void build_bad_char_table(const char* pattern, int* bad_char) {
    int pattern_len = strlen(pattern);
    
    // 初始化所有字符的偏移为-1
    for (int i = 0; i < 256; i++) {
        bad_char[i] = -1;
    }
    
    // 填充模式中出现的字符的最后位置
    for (int i = 0; i < pattern_len; i++) {
        bad_char[(unsigned char)pattern[i]] = i;
    }
}

// Boyer-Moore字符串匹配算法（简化版）
int boyer_moore_search(const char* text, const char* pattern) {
    int text_len = strlen(text);
    int pattern_len = strlen(pattern);
    
    int bad_char[256];
    build_bad_char_table(pattern, bad_char);
    
    int shift = 0;  // 模式相对于文本的偏移
    
    while (shift <= text_len - pattern_len) {
        int j = pattern_len - 1;
        
        // 从右到左匹配
        while (j >= 0 && pattern[j] == text[shift + j]) {
            j--;
        }
        
        if (j < 0) {
            return shift;  // 找到匹配
        } else {
            // 根据坏字符规则计算偏移
            int bad_char_shift = j - bad_char[(unsigned char)text[shift + j]];
            shift += (bad_char_shift > 1) ? bad_char_shift : 1;
        }
    }
    
    return -1;  // 未找到
}

// 字符串匹配性能测试
void string_matching_performance_test(void) {
    printf("=== 字符串匹配算法性能测试 ===\n");
    
    // 构造测试数据
    const char* text = "ABABDABACDABABCABCABCABCABC";
    const char* pattern = "ABABCABCABCABC";
    
    printf("文本: %s\n", text);
    printf("模式: %s\n", pattern);
    
    // 测试不同算法
    int result1 = naive_search(text, pattern);
    int result2 = kmp_search(text, pattern);
    int result3 = boyer_moore_search(text, pattern);
    
    printf("\n算法结果:\n");
    printf("朴素算法: %s (位置: %d)\n", 
           (result1 != -1) ? "找到" : "未找到", result1);
    printf("KMP算法: %s (位置: %d)\n", 
           (result2 != -1) ? "找到" : "未找到", result2);
    printf("Boyer-Moore算法: %s (位置: %d)\n", 
           (result3 != -1) ? "找到" : "未找到", result3);
    
    // 验证结果一致性
    if (result1 == result2 && result2 == result3) {
        printf("✓ 所有算法结果一致\n");
    } else {
        printf("✗ 算法结果不一致！\n");
    }
}

int main(void) {
    string_matching_performance_test();
    return 0;
}
```

### 2. 字符串处理工具函数

```c
#include <stdio.h>
#include <string.h>
#include <stdlib.h>
#include <ctype.h>
#include <stdbool.h>

// 字符串反转
char* string_reverse(char* str) {
    if (str == NULL) return NULL;
    
    int len = strlen(str);
    for (int i = 0; i < len / 2; i++) {
        char temp = str[i];
        str[i] = str[len - 1 - i];
        str[len - 1 - i] = temp;
    }
    
    return str;
}

// 字符串去除空白字符
char* string_trim(char* str) {
    if (str == NULL) return NULL;
    
    // 去除开头的空白字符
    char* start = str;
    while (isspace(*start)) {
        start++;
    }
    
    // 如果字符串全是空白字符
    if (*start == '\0') {
        str[0] = '\0';
        return str;
    }
    
    // 去除结尾的空白字符
    char* end = start + strlen(start) - 1;
    while (end > start && isspace(*end)) {
        end--;
    }
    
    // 移动字符串到开头
    int len = end - start + 1;
    memmove(str, start, len);
    str[len] = '\0';
    
    return str;
}

// 字符串分割
typedef struct {
    char** tokens;
    int count;
    int capacity;
} StringArray;

StringArray* string_split(const char* str, const char* delimiter) {
    if (str == NULL || delimiter == NULL) return NULL;
    
    StringArray* result = malloc(sizeof(StringArray));
    if (result == NULL) return NULL;
    
    result->capacity = 10;
    result->tokens = malloc(result->capacity * sizeof(char*));
    result->count = 0;
    
    if (result->tokens == NULL) {
        free(result);
        return NULL;
    }
    
    // 复制字符串以便修改
    char* str_copy = malloc(strlen(str) + 1);
    strcpy(str_copy, str);
    
    char* token = strtok(str_copy, delimiter);
    while (token != NULL) {
        // 扩展数组容量
        if (result->count >= result->capacity) {
            result->capacity *= 2;
            char** new_tokens = realloc(result->tokens, 
                                      result->capacity * sizeof(char*));
            if (new_tokens == NULL) {
                // 清理已分配的内存
                for (int i = 0; i < result->count; i++) {
                    free(result->tokens[i]);
                }
                free(result->tokens);
                free(result);
                free(str_copy);
                return NULL;
            }
            result->tokens = new_tokens;
        }
        
        // 复制token
        result->tokens[result->count] = malloc(strlen(token) + 1);
        strcpy(result->tokens[result->count], token);
        result->count++;
        
        token = strtok(NULL, delimiter);
    }
    
    free(str_copy);
    return result;
}

void string_array_free(StringArray* arr) {
    if (arr != NULL) {
        for (int i = 0; i < arr->count; i++) {
            free(arr->tokens[i]);
        }
        free(arr->tokens);
        free(arr);
    }
}

// 字符串替换
char* string_replace(const char* str, const char* old_substr, const char* new_substr) {
    if (str == NULL || old_substr == NULL || new_substr == NULL) {
        return NULL;
    }
    
    int old_len = strlen(old_substr);
    int new_len = strlen(new_substr);
    int str_len = strlen(str);
    
    if (old_len == 0) return NULL;
    
    // 计算需要替换的次数
    int count = 0;
    const char* pos = str;
    while ((pos = strstr(pos, old_substr)) != NULL) {
        count++;
        pos += old_len;
    }
    
    if (count == 0) {
        // 没有找到要替换的子串，返回原字符串的副本
        char* result = malloc(str_len + 1);
        strcpy(result, str);
        return result;
    }
    
    // 计算新字符串的长度
    int new_str_len = str_len + count * (new_len - old_len);
    char* result = malloc(new_str_len + 1);
    if (result == NULL) return NULL;
    
    // 执行替换
    char* dest = result;
    const char* src = str;
    
    while ((pos = strstr(src, old_substr)) != NULL) {
        // 复制old_substr之前的部分
        int prefix_len = pos - src;
        memcpy(dest, src, prefix_len);
        dest += prefix_len;
        
        // 复制新的子串
        memcpy(dest, new_substr, new_len);
        dest += new_len;
        
        // 移动源指针
        src = pos + old_len;
    }
    
    // 复制剩余部分
    strcpy(dest, src);
    
    return result;
}

// 字符串工具函数演示
void demonstrate_string_utilities(void) {
    printf("=== 字符串工具函数演示 ===\n");
    
    // 字符串反转
    char str1[] = "Hello, World!";
    printf("原字符串: \"%s\"\n", str1);
    string_reverse(str1);
    printf("反转后: \"%s\"\n", str1);
    
    // 字符串去空白
    char str2[] = "   Hello, World!   ";
    printf("\n原字符串: \"%s\"\n", str2);
    string_trim(str2);
    printf("去空白后: \"%s\"\n", str2);
    
    // 字符串分割
    printf("\n字符串分割演示:\n");
    const char* csv = "apple,banana,orange,grape";
    printf("原字符串: \"%s\"\n", csv);
    
    StringArray* tokens = string_split(csv, ",");
    if (tokens != NULL) {
        printf("分割结果:\n");
        for (int i = 0; i < tokens->count; i++) {
            printf("  [%d]: \"%s\"\n", i, tokens->tokens[i]);
        }
        string_array_free(tokens);
    }
    
    // 字符串替换
    printf("\n字符串替换演示:\n");
    const char* original = "Hello World! Hello Universe!";
    printf("原字符串: \"%s\"\n", original);
    
    char* replaced = string_replace(original, "Hello", "Hi");
    if (replaced != NULL) {
        printf("替换后: \"%s\"\n", replaced);
        free(replaced);
    }
}

int main(void) {
    demonstrate_string_utilities();
    return 0;
}
```

# 三、实践项目：文本分析器

让我们创建一个综合性的文本分析器项目，展示数组和字符串的高级应用：

```c
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <ctype.h>
#include <stdbool.h>

#define MAX_WORD_LENGTH 100
#define MAX_WORDS 10000

// 词频统计结构
typedef struct {
    char word[MAX_WORD_LENGTH];
    int frequency;
} WordFreq;

// 文本统计结构
typedef struct {
    int char_count;
    int word_count;
    int line_count;
    int sentence_count;
    WordFreq words[MAX_WORDS];
    int unique_words;
} TextStats;

// 将字符转换为小写
char to_lower(char c) {
    return (c >= 'A' && c <= 'Z') ? c + 32 : c;
}

// 检查字符是否为单词字符
bool is_word_char(char c) {
    return isalnum(c) || c == '\'' || c == '-';
}

// 标准化单词（转小写，去除标点）
void normalize_word(char* word) {
    int len = strlen(word);
    int write_pos = 0;
    
    for (int i = 0; i < len; i++) {
        if (is_word_char(word[i])) {
            word[write_pos++] = to_lower(word[i]);
        }
    }
    word[write_pos] = '\0';
}

// 添加或更新词频
void add_word(TextStats* stats, const char* word) {
    if (strlen(word) == 0) return;
    
    // 查找是否已存在
    for (int i = 0; i < stats->unique_words; i++) {
        if (strcmp(stats->words[i].word, word) == 0) {
            stats->words[i].frequency++;
            return;
        }
    }
    
    // 添加新单词
    if (stats->unique_words < MAX_WORDS) {
        strcpy(stats->words[stats->unique_words].word, word);
        stats->words[stats->unique_words].frequency = 1;
        stats->unique_words++;
    }
}

// 分析文本
TextStats analyze_text(const char* text) {
    TextStats stats = {0};
    
    int len = strlen(text);
    char current_word[MAX_WORD_LENGTH] = {0};
    int word_pos = 0;
    bool in_word = false;
    
    for (int i = 0; i <= len; i++) {  // 包括字符串结尾
        char c = (i < len) ? text[i] : '\0';
        
        // 字符计数（不包括结尾的null字符）
        if (i < len) {
            stats.char_count++;
        }
        
        // 行计数
        if (c == '\n') {
            stats.line_count++;
        }
        
        // 句子计数
        if (c == '.' || c == '!' || c == '?') {
            stats.sentence_count++;
        }
        
        // 单词处理
        if (is_word_char(c) && word_pos < MAX_WORD_LENGTH - 1) {
            current_word[word_pos++] = c;
            in_word = true;
        } else {
            if (in_word) {
                current_word[word_pos] = '\0';
                normalize_word(current_word);
                
                if (strlen(current_word) > 0) {
                    add_word(&stats, current_word);
                    stats.word_count++;
                }
                
                word_pos = 0;
                in_word = false;
            }
        }
    }
    
    // 如果文本不以换行符结尾，行数加1
    if (len > 0 && text[len - 1] != '\n') {
        stats.line_count++;
    }
    
    return stats;
}

// 词频排序比较函数
int compare_word_freq(const void* a, const void* b) {
    const WordFreq* wa = (const WordFreq*)a;
    const WordFreq* wb = (const WordFreq*)b;
    
    // 按频率降序排列
    if (wa->frequency != wb->frequency) {
        return wb->frequency - wa->frequency;
    }
    
    // 频率相同时按字母顺序排列
    return strcmp(wa->word, wb->word);
}

// 打印文本统计信息
void print_text_stats(const TextStats* stats) {
    printf("=== 文本分析结果 ===\n");
    printf("字符数: %d\n", stats->char_count);
    printf("单词数: %d\n", stats->word_count);
    printf("行数: %d\n", stats->line_count);
    printf("句子数: %d\n", stats->sentence_count);
    printf("唯一单词数: %d\n", stats->unique_words);
    
    if (stats->word_count > 0) {
        printf("平均单词长度: %.2f\n", 
               (double)stats->char_count / stats->word_count);
    }
    
    // 排序并显示词频统计
    WordFreq* sorted_words = malloc(stats->unique_words * sizeof(WordFreq));
    memcpy(sorted_words, stats->words, stats->unique_words * sizeof(WordFreq));
    
    qsort(sorted_words, stats->unique_words, sizeof(WordFreq), compare_word_freq);
    
    printf("\n=== 词频统计 (前20个) ===\n");
    int display_count = (stats->unique_words < 20) ? stats->unique_words : 20;
    
    for (int i = 0; i < display_count; i++) {
        printf("%2d. %-15s %d次\n", 
               i + 1, sorted_words[i].word, sorted_words[i].frequency);
    }
    
    free(sorted_words);
}

// 查找最长的单词
void find_longest_words(const TextStats* stats) {
    printf("\n=== 最长单词 ===\n");
    
    int max_length = 0;
    for (int i = 0; i < stats->unique_words; i++) {
        int len = strlen(stats->words[i].word);
        if (len > max_length) {
            max_length = len;
        }
    }
    
    printf("最长单词长度: %d\n", max_length);
    printf("最长单词:\n");
    
    for (int i = 0; i < stats->unique_words; i++) {
        if (strlen(stats->words[i].word) == max_length) {
            printf("  %s (出现 %d 次)\n", 
                   stats->words[i].word, stats->words[i].frequency);
        }
    }
}

// 文本分析器主函数
void text_analyzer_demo(void) {
    printf("=== 文本分析器演示 ===\n");
    
    const char* sample_text = 
        "Hello world! This is a sample text for analysis.\n"
        "The text contains multiple sentences and words.\n"
        "Some words appear multiple times in the text.\n"
        "This analyzer will count characters, words, lines, and sentences.\n"
        "It will also provide word frequency statistics.\n"
        "Hello again! The word 'the' appears frequently in English text.";
    
    printf("分析文本:\n");
    printf("----------------------------------------\n");
    printf("%s\n", sample_text);
    printf("----------------------------------------\n\n");
    
    TextStats stats = analyze_text(sample_text);
    print_text_stats(&stats);
    find_longest_words(&stats);
}

int main(void) {
    text_analyzer_demo();
    return 0;
}
```

# 四、总结与下一步

## （一）本文重点回顾

通过本文的深入学习，您已经掌握了：

**数组高级技巧：**
- 数组的内存模型和布局原理
- 动态多维数组的实现方法
- 高效的数组算法和优化技巧

**字符串深度理解：**
- 字符串的内存表示和管理
- 安全的字符串操作方法
- 经典字符串匹配算法实现

**实践应用：**
- 文本分析器的完整实现
- 词频统计和排序算法
- 综合性项目的设计思路

## （二）性能优化要点

1. **内存访问模式**：利用数组的连续性提高缓存命中率
2. **算法选择**：根据数据特点选择合适的搜索和排序算法
3. **内存管理**：合理使用动态内存，避免内存泄漏
4. **字符串处理**：使用高效的字符串算法，避免不必要的复制

## （三）学习建议

1. **深入理解内存模型**：这是掌握C语言的关键
2. **练习算法实现**：通过编写经典算法加深理解
3. **注意安全编程**：始终考虑缓冲区溢出等安全问题
4. **性能意识**：培养对算法时间复杂度的敏感性

{% btn '/2025/08/10/学习/【学习】C语言指针与内存管理：掌握底层编程的核心/', 下一篇：指针与内存管理, far fa-hand-point-right, blue %}

---

**参考资料：**
- 《算法导论》- Thomas H. Cormen等
- 《C和指针》- Kenneth A. Reek
- 《高质量C/C++编程指南》- 林锐
- 《字符串算法》- Maxime Crochemore等
- C语言字符串函数参考：https://en.cppreference.com/w/c/string
