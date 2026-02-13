---
title: 【算法】字符串匹配算法深入解析：KMP算法原理与实现
categories: 算法
date: 2026-02-13 17:06:00
tags:
  - 算法
  - 字符串匹配
  - KMP
  - 数据结构
cover: 
---

## 一、引言：字符串匹配问题

在计算机科学中，字符串匹配是一个基础而重要的问题。简单来说，就是在一个较长的文本（主串）中查找某个特定的模式（模式串）是否出现，以及出现的位置。这个问题在文本编辑器搜索、搜索引擎索引、生物信息学DNA序列比对等场景中都有广泛应用。

笔者在学习和工作中多次遇到这个问题，最初使用暴力匹配时总是遇到性能瓶颈，直到深入理解了KMP算法，才真正领略到算法设计的精妙之处。本文将详细介绍KMP算法的原理、实现以及优化思路。

## 二、暴力匹配的问题

在深入KMP之前，我们先来看看最简单的暴力匹配算法是如何工作的。

### 2.1 暴力匹配思路

暴力匹配（Brute Force）的思想非常直观：从主串的第一个字符开始，与模式串逐一比较。如果当前字符匹配成功，则继续比较下一个字符；如果匹配失败，则将主串的起始位置向后移动一位，重新从模式串的第一个字符开始比较。

```java
/**
 * 暴力匹配算法
 * @param text 主串，待搜索的文本
 * @param pattern 模式串，要查找的字符串
 * @return 模式串在主串中首次匹配的位置，未找到返回-1
 */
public static int bruteForceMatch(String text, String pattern) {
    // 获取主串和模式串的长度
    int n = text.length();
    int m = pattern.length();
    
    // 特判：模式串为空或长度大于主串
    if (m == 0 || m > n) {
        return -1;
    }
    
    // i遍历主串，j遍历模式串
    for (int i = 0; i <= n - m; i++) {
        int j = 0;
        // 从主串的当前位置开始，逐一比较模式串的每个字符
        while (j < m && text.charAt(i + j) == pattern.charAt(j)) {
            j++;
        }
        // 如果j等于模式串长度，说明完全匹配成功
        if (j == m) {
            return i;  // 返回匹配位置
        }
    }
    
    // 遍历完主串都未找到匹配
    return -1;
}
```

### 2.2 暴力匹配的性能问题

让我们分析一下暴力匹配的时间复杂度。在最坏情况下，例如主串为"AAAAAAAAB"，模式串为"AAAAB"，每次匹配失败后，主串的起始位置只移动一位，而模式串需要回退到开头重新比较。

**最坏情况的时间复杂度为 O(n × m)**，其中 n 为主串长度，m 为模式串长度。这是因为：
- 外层循环最多执行 n - m + 1 次
- 内层循环最多执行 m 次
- 在某些极端情况下，每次匹配都需要比较到模式串的最后一个字符才失败

笔者认为，暴力匹配最大的问题在于：**当匹配失败时，之前已经匹配的信息被完全丢弃了**。这意味着我们做了大量重复工作，而这些工作本可以避免。

## 三、KMP算法核心思想

KMP算法由 Donald Knuth、Vaughan Pratt 和 James H. Morris 三人共同发明，因此以三人姓氏的首字母命名。算法的核心思想是：**利用已经匹配的信息，避免不必要的回溯**。

### 3.1 灵感的来源

让我们通过一个具体的例子来理解KMP的灵感来源。假设主串为"ABABABC"，模式串为"ABABC"：

```
第一次匹配：
主串：A B A B A B C
模式串：A B A B C
       ↑ 匹配到第5个字符时失败

第二次匹配（暴力算法）：
主串：A B A B A B C
模式串：   A B A B C  // 从位置1重新开始
                ↑ 仍然失败
```

笔者注意到一个关键点：在第一次匹配中，我们已经知道主串的前4个字符是"ABAB"，模式串的前4个字符也是"ABAB"。这意味着模式串的前缀"AB"与主串的对应后缀"AB"相同。

**KMP算法的核心洞察**：当匹配失败时，我们可以利用这个信息，直接将模式串移动到合适的位置，而不需要回退主串的指针。

### 3.2 最长公共前后缀

为了理解如何高效地移动模式串，我们需要引入**最长公共前后缀**的概念。

**前缀**：包含首字符但不包含尾字符的所有子串
**后缀**：包含尾字符但不包含首字符的所有子串
**最长公共前后缀**：既是模式串前缀，又是最长后缀的子串长度

以模式串"ABABC"为例：
- 前缀有：A、AB、ABA、ABAB
- 后缀有：C、BC、ABC、BABC
- 最长公共前后缀："AB"，长度为2

再以模式串"AAAA"为例：
- 前缀有：A、AA、AAA
- 后缀有：A、AA、AAA
- 最长公共前后缀："AAA"，长度为3

### 3.3 跳转到下一个匹配位置

有了最长公共前后缀的概念，我们就可以解释KMP的跳转逻辑了。

当模式串的第 j 个字符匹配失败时（0-indexed），我们已经成功匹配了模式串的前 j 个字符。此时：
- 如果模式串的前 j 个字符存在长度为 k 的最长公共前后缀
- 那么我们可以将模式串向右移动 j - k 位
- 新的待比较位置变为模式串的第 k 个字符（而不是第0个）

这样我们就避免了重复比较已经知道的匹配信息。

## 四、Next数组详解

Next数组（也叫失败函数）是KMP算法的核心数据结构，它存储了模式串每个位置的最长公共前后缀长度。

### 4.1 Next数组的定义

对于模式串 pattern[0...m-1]，next[j] 表示：
- 当模式串在位置 j 匹配失败时
- 已经匹配的模式串前缀为 pattern[0...j-1]
- next[j] 就是这个前缀的最长公共前后缀长度

形式化地定义：

```
next[j] = max{k | 0 < k < j 且 pattern[0...k-1] = pattern[j-k...j-1]}
```

即：满足前缀等于后缀的最大 k 值。

### 4.2 Next数组的计算

计算next数组的代码是KMP算法中最难理解的部分，笔者当年也是反复推敲才明白其原理。

```java
/**
 * 计算模式串的next数组（也称失败函数）
 * next[j]表示当模式串在位置j匹配失败时，
 * 已经匹配的前缀的最长公共前后缀长度
 * @param pattern 模式串
 * @return next数组
 */
public static int[] computeNext(String pattern) {
    int m = pattern.length();
    int[] next = new int[m];
    
    // next[0] 设为 -1 或 0，表示第一个字符匹配失败时没有公共前后缀
    // 这里使用 0 作为默认值
    next[0] = 0;
    
    // i 表示当前正在计算的位置，也是后缀的末尾
    // j 表示当前考虑的前缀长度
    int i = 1;
    int j = 0;
    
    while (i < m) {
        if (pattern.charAt(i) == pattern.charAt(j)) {
            // 如果字符匹配，说明可以继续扩展公共前后缀
            // j 表示当前公共前后缀的长度，加1后是新的长度
            next[i] = j + 1;
            i++;
            j++;
        } else {
            if (j == 0) {
                // 如果 j 已经回退到0，且当前字符不匹配
                // 则 next[i] 为0，表示没有公共前后缀
                next[i] = 0;
                i++;
            } else {
                // 如果匹配失败，但 j > 0
                // 则利用已计算的 next 信息进行回退
                // 这是KMP思想的核心应用
                j = next[j - 1];
            }
        }
    }
    
    return next;
}
```

### 4.3 Next数组的计算过程示例

让我们以模式串"ABABC"为例，详细跟踪next数组的计算过程：

```
初始状态：i=1, j=0, next[0]=0

i=1: pattern[1]='B', pattern[0]='A', 不匹配
     j=0，无法回退，next[1]=0, i=2

i=2: pattern[2]='A', pattern[0]='A', 匹配
     next[2]=j+1=1, i=3, j=1

i=3: pattern[3]='B', pattern[1]='B', 匹配
     next[3]=j+1=2, i=4, j=2

i=4: pattern[4]='C', pattern[2]='A', 不匹配
     j=2, 回退 j=next[1]=0

i=4: pattern[4]='C', pattern[0]='A', 不匹配
     j=0，无法回退，next[4]=0, i=5

计算完成：next = [0, 0, 1, 2, 0]
```

让我们验证一下这个结果：
- j=1 时，前缀"AB"，没有公共前后缀，所以next[1]=0
- j=2 时，前缀"ABA"，公共前后缀为"A"，长度为1，所以next[2]=1
- j=3 时，前缀"ABAB"，公共前后缀为"AB"，长度为2，所以next[3]=2
- j=4 时，前缀"ABABC"，没有公共前后缀，所以next[4]=0

### 4.4 Next数组的优化版本

标准的next数组已经能够工作，但还有一个优化版本，可以让匹配失败时跳转到更优的位置。

```java
/**
 * 计算优化后的next数组
 * 在某些情况下可以减少不必要的比较
 * @param pattern 模式串
 * @return 优化后的next数组
 */
public static int[] computeNextOptimized(String pattern) {
    int m = pattern.length();
    int[] next = new int[m];
    
    next[0] = -1;  // 优化版本将next[0]设为-1
    
    int i = 0;
    int j = -1;  // j从-1开始
    
    while (i < m - 1) {
        // j == -1 表示已经回退到模式串开头
        // 或者当前字符匹配成功
        if (j == -1 || pattern.charAt(i) == pattern.charAt(j)) {
            i++;
            j++;
            // 优化：如果pattern[i] == pattern[j]，
            // 则next[i]应该等于next[j]，避免无效匹配
            if (pattern.charAt(i) != pattern.charAt(j)) {
                next[i] = j;
            } else {
                next[i] = next[j];
            }
        } else {
            // 匹配失败，回退到j的位置
            j = next[j];
        }
    }
    
    return next;
}
```

## 五、KMP算法完整实现

现在我们已经理解了KMP的核心思想，可以写出完整的KMP匹配算法了。

```java
/**
 * KMP字符串匹配算法实现
 */
public class KMPAlgorithm {
    
    /**
     * KMP主匹配算法
     * @param text 主串，待搜索的文本
     * @param pattern 模式串，要查找的字符串
     * @return 模式串在主串中首次匹配的位置，未找到返回-1
     */
    public static int kmpMatch(String text, String pattern) {
        // 边界条件处理
        if (text == null || pattern == null) {
            return -1;
        }
        
        int n = text.length();
        int m = pattern.length();
        
        if (m == 0 || m > n) {
            return -1;
        }
        
        // 计算模式串的next数组
        int[] next = computeNext(pattern);
        
        // i遍历主串，j遍历模式串
        int i = 0;
        int j = 0;
        
        while (i < n && j < m) {
            // j == -1 表示模式串第一个字符就不匹配
            // 或者当前字符匹配成功，继续比较下一个
            if (j == -1 || text.charAt(i) == pattern.charAt(j)) {
                i++;
                j++;
            } else {
                // 匹配失败，根据next数组将模式串向右移动
                // j位置的字符匹配失败，跳转到next[j]位置
                j = next[j];
            }
        }
        
        // 如果j等于模式串长度，说明完全匹配成功
        if (j == m) {
            return i - m;  // 返回匹配起始位置
        }
        
        // 匹配失败
        return -1;
    }
    
    /**
     * 计算模式串的next数组
     * 使用简化版本，next[0]=0
     */
    private static int[] computeNext(String pattern) {
        int m = pattern.length();
        int[] next = new int[m];
        
        next[0] = 0;
        
        int i = 1;
        int j = 0;
        
        while (i < m) {
            if (pattern.charAt(i) == pattern.charAt(j)) {
                next[i] = j + 1;
                i++;
                j++;
            } else {
                if (j == 0) {
                    next[i] = 0;
                    i++;
                } else {
                    j = next[j - 1];
                }
            }
        }
        
        return next;
    }
}
```

### 5.1 匹配过程示例

让我们通过一个完整的例子来理解KMP的匹配过程。

主串："ABABABC"，模式串："ABABC"，next数组：[0, 0, 1, 2, 0]

```
第一次匹配：
i=0, j=0: 'A' == 'A', i=1, j=1
i=1, j=1: 'B' == 'B', i=2, j=2
i=2, j=2: 'A' == 'A', i=3, j=3
i=3, j=3: 'B' == 'B', i=4, j=4
i=4, j=4: 'A' != 'C', 匹配失败
          j = next[4-1] = next[3] = 2

第二次匹配：
i=4, j=2: 'A' == 'A', i=5, j=3
i=5, j=3: 'B' == 'B', i=6, j=4
i=6, j=4: 'C' == 'C', 匹配成功！
返回位置 i-m = 6-4 = 2
```

从结果可以看出，模式串"ABABC"在主串"ABABABC"中首次出现在位置2（0-indexed）。

### 5.2 查找所有匹配位置

在实际应用中，我们可能需要找出所有匹配的位置，而不仅仅是第一个。

```java
/**
 * 查找所有匹配位置
 * @param text 主串
 * @param pattern 模式串
 * @return 所有匹配位置的列表
 */
public static List<Integer> findAllMatches(String text, String pattern) {
    List<Integer> result = new ArrayList<>();
    
    if (text == null || pattern == null || pattern.isEmpty()) {
        return result;
    }
    
    int n = text.length();
    int m = pattern.length();
    
    if (m > n) {
        return result;
    }
    
    int[] next = computeNext(pattern);
    
    int i = 0;
    int j = 0;
    
    while (i < n) {
        if (j == -1 || text.charAt(i) == pattern.charAt(j)) {
            i++;
            j++;
            
            // 找到一个完整匹配
            if (j == m) {
                result.add(i - m);
                // 继续查找下一个匹配
                // j回退到next[j-1]位置继续匹配
                j = next[j - 1];
            }
        } else {
            j = next[j];
        }
    }
    
    return result;
}
```

## 六、时间与空间复杂度分析

### 6.1 时间复杂度

KMP算法的时间复杂度为 **O(n + m)**，其中 n 为主串长度，m 为模式串长度。

这是因为：
- 计算next数组需要 O(m) 时间
- 主匹配过程最多比较 n 次，每次比较要么使 i 增加，要么使 j 增加
- j 的增加总次数不超过 m，j 的减少总次数也不超过 m
- 因此总比较次数为 O(n + m)

与暴力匹配的 O(n × m) 相比，KMP在最坏情况下有显著的性能优势。

### 6.2 空间复杂度

KMP算法的空间复杂度为 **O(m)**，主要用于存储next数组。

- 标准的next数组需要 O(m) 空间
- 如果使用优化版本的next数组（next[0] = -1），空间复杂度不变
- 算法执行过程中只使用常数级别的额外空间

## 七、KMP算法的应用场景

KMP算法在实际工程中有广泛的应用，笔者总结了几个典型场景：

### 7.1 文本编辑器搜索

现代文本编辑器的查找功能通常使用KMP或其变体实现。当用户在几十MB甚至上百MB的文件中搜索关键词时，KMP能够保证快速响应。

### 7.2 日志分析

在处理大量日志文件时，经常需要搜索特定的错误模式或关键词。KMP的高效性使其成为日志分析工具的首选。

### 7.3 DNA序列比对

在生物信息学中，KMP算法用于在DNA序列中查找特定的基因片段。虽然实际应用会使用更复杂的变体，但核心思想源自KMP。

### 7.4 敏感词过滤

在内容审核系统中，需要在用户输入的文本中快速检测是否包含敏感词。KMP算法可以高效地完成这个任务。

## 八、总结

笔者认为，KMP算法最核心的价值在于**利用已匹配的信息来避免重复工作**。这个思想不仅体现在字符串匹配中，在很多其他算法问题中也能看到它的影子。

学习KMP算法的过程中，笔者最大的收获是理解了**预处理的重要性**。通过预先计算next数组（失败函数），我们在匹配阶段就能够快速决策，而不需要在每次失败时重新分析。这种空间换时间的思路，在算法设计中非常常见。

当然，KMP算法也有其局限性：
- 当模式串重复性很高时，next数组的优化效果有限
- 对于多模式匹配场景，可能需要其他算法（如AC自动机）
- 在某些现代硬件架构上，SIMD指令可能让暴力匹配更快

但对于理解字符串匹配的本质，KMP仍然是最好的入门算法。建议读者手动模拟几次匹配过程，亲自体会算法的精妙之处。

---

**参考资料：**
- 《算法导论》第32章：字符串匹配
- 《数据结构与算法Java实现》