---
title: 【JAVA】利用stream流对List列表对象进行操作
categories: JAVA
tags:
  - JAVA
  - 后端
---

# 【Java】利用stream流对List列表对象进行操作

## 前言

在JAVA中，处理List对象的时候，经常需要对List进行遍历、筛选符合条件的数据，或者对符合某些条件的数据进行操作。传统的做法是使用for循环或者迭代器进行遍历，但这种方式代码冗长且不够直观。Java 8引入的Stream API提供了一种更加简洁、高效的方式来处理集合，使代码更加清晰易读。本文将介绍如何利用Stream流对List进行各种操作。

## Stream流的基本概念

Stream是Java 8引入的新成员，它允许以声明性方式处理数据集合。简单来说，Stream是数据渠道，用于操作数据源（集合、数组等）所生成的元素序列。

### Stream流的特点

1. **不存储数据**：Stream不是数据结构，它只是某种数据源的一个视图。
2. **函数式编程**：Stream提供了函数式编程的支持，可以使用Lambda表达式来处理数据。
3. **惰性执行**：Stream操作是延迟执行的，只有在需要结果的时候才会执行。
4. **可消费性**：Stream只能被消费一次，一旦遍历完成，就不能再次使用。
5. **并行处理**：Stream可以并行执行操作，提高处理效率。

### Stream流的创建方式

```java
// 1. 从集合创建
List<String> list = Arrays.asList("a", "b", "c");
Stream<String> stream1 = list.stream();

// 2. 从数组创建
String[] array = {"a", "b", "c"};
Stream<String> stream2 = Arrays.stream(array);

// 3. 使用Stream.of()方法
Stream<String> stream3 = Stream.of("a", "b", "c");

// 4. 创建无限流
Stream<Integer> stream4 = Stream.iterate(0, n -> n + 1); // 从0开始的无限整数流
Stream<Double> stream5 = Stream.generate(Math::random); // 无限随机数流
```

## Stream流的常用操作

Stream API提供了丰富的操作方法，可以分为两类：中间操作和终端操作。

### 中间操作

中间操作会返回一个新的Stream，可以进行链式调用。常用的中间操作有：

#### 1. filter - 过滤元素

```java
List<Integer> numbers = Arrays.asList(1, 2, 3, 4, 5, 6, 7, 8, 9, 10);
// 筛选出偶数
List<Integer> evenNumbers = numbers.stream()
                                  .filter(n -> n % 2 == 0)
                                  .collect(Collectors.toList());
// 结果: [2, 4, 6, 8, 10]
```

#### 2. map - 转换元素

```java
List<String> words = Arrays.asList("hello", "world");
// 转换为大写
List<String> upperCaseWords = words.stream()
                                 .map(String::toUpperCase)
                                 .collect(Collectors.toList());
// 结果: ["HELLO", "WORLD"]
```

#### 3. flatMap - 扁平化处理

```java
List<List<Integer>> nestedList = Arrays.asList(
    Arrays.asList(1, 2, 3),
    Arrays.asList(4, 5, 6),
    Arrays.asList(7, 8, 9)
);
// 将嵌套列表扁平化为单个列表
List<Integer> flatList = nestedList.stream()
                                 .flatMap(Collection::stream)
                                 .collect(Collectors.toList());
// 结果: [1, 2, 3, 4, 5, 6, 7, 8, 9]
```

#### 4. distinct - 去重

```java
List<Integer> numbers = Arrays.asList(1, 2, 2, 3, 3, 3, 4, 5);
// 去除重复元素
List<Integer> distinctNumbers = numbers.stream()
                                     .distinct()
                                     .collect(Collectors.toList());
// 结果: [1, 2, 3, 4, 5]
```

#### 5. sorted - 排序

```java
List<Integer> numbers = Arrays.asList(5, 3, 8, 1, 9, 2);
// 自然排序
List<Integer> sortedNumbers = numbers.stream()
                                   .sorted()
                                   .collect(Collectors.toList());
// 结果: [1, 2, 3, 5, 8, 9]

// 自定义排序（降序）
List<Integer> reverseSortedNumbers = numbers.stream()
                                         .sorted(Comparator.reverseOrder())
                                         .collect(Collectors.toList());
// 结果: [9, 8, 5, 3, 2, 1]
```

#### 6. limit - 限制元素数量

```java
List<Integer> numbers = Arrays.asList(1, 2, 3, 4, 5, 6, 7, 8, 9, 10);
// 获取前5个元素
List<Integer> firstFive = numbers.stream()
                               .limit(5)
                               .collect(Collectors.toList());
// 结果: [1, 2, 3, 4, 5]
```

#### 7. skip - 跳过元素

```java
List<Integer> numbers = Arrays.asList(1, 2, 3, 4, 5, 6, 7, 8, 9, 10);
// 跳过前5个元素
List<Integer> afterFive = numbers.stream()
                               .skip(5)
                               .collect(Collectors.toList());
// 结果: [6, 7, 8, 9, 10]
```

### 终端操作

终端操作会消费Stream，产生一个结果。常用的终端操作有：

#### 1. collect - 收集结果

```java
List<String> fruits = Arrays.asList("apple", "banana", "orange", "grape");

// 收集为List
List<String> fruitList = fruits.stream().collect(Collectors.toList());

// 收集为Set
Set<String> fruitSet = fruits.stream().collect(Collectors.toSet());

// 收集为Map
Map<String, Integer> fruitMap = fruits.stream()
    .collect(Collectors.toMap(fruit -> fruit, String::length));
// 结果: {apple=5, banana=6, orange=6, grape=5}
```

#### 2. forEach - 遍历元素

```java
List<String> fruits = Arrays.asList("apple", "banana", "orange");
fruits.stream().forEach(System.out::println);
// 输出:
// apple
// banana
// orange
```

#### 3. reduce - 归约操作

```java
List<Integer> numbers = Arrays.asList(1, 2, 3, 4, 5);

// 求和
Optional<Integer> sum = numbers.stream().reduce((a, b) -> a + b);
// 或者使用内置方法引用
Optional<Integer> sum2 = numbers.stream().reduce(Integer::sum);
// 结果: 15

// 带初始值的归约
Integer sum3 = numbers.stream().reduce(0, Integer::sum);
// 结果: 15
```

#### 4. count, min, max, average - 统计操作

```java
List<Integer> numbers = Arrays.asList(1, 2, 3, 4, 5);

// 计数
long count = numbers.stream().count(); // 5

// 最小值
Optional<Integer> min = numbers.stream().min(Integer::compareTo); // 1

// 最大值
Optional<Integer> max = numbers.stream().max(Integer::compareTo); // 5

// 平均值（需要先转换为IntStream）
double avg = numbers.stream().mapToInt(Integer::intValue).average().orElse(0); // 3.0
```

#### 5. anyMatch, allMatch, noneMatch - 匹配操作

```java
List<Integer> numbers = Arrays.asList(1, 2, 3, 4, 5);

// 是否存在大于3的元素
boolean anyGreaterThan3 = numbers.stream().anyMatch(n -> n > 3); // true

// 是否所有元素都大于0
boolean allPositive = numbers.stream().allMatch(n -> n > 0); // true

// 是否没有元素等于0
boolean noZero = numbers.stream().noneMatch(n -> n == 0); // true
```

#### 6. findFirst, findAny - 查找操作

```java
List<Integer> numbers = Arrays.asList(1, 2, 3, 4, 5);

// 查找第一个元素
Optional<Integer> first = numbers.stream().findFirst(); // 1

// 查找任意一个元素（在并行流中更有意义）
Optional<Integer> any = numbers.stream().findAny(); // 通常是1，但在并行流中可能是任意元素
```

## 实际应用场景

### 场景一：对象列表的筛选和转换

```java
// 假设有一个用户列表
List<User> users = Arrays.asList(
    new User("Alice", 25, "female"),
    new User("Bob", 30, "male"),
    new User("Charlie", 35, "male"),
    new User("Diana", 40, "female")
);

// 筛选出年龄大于30的女性用户，并获取他们的名字
List<String> femaleNames = users.stream()
    .filter(user -> user.getAge() > 30)
    .filter(user -> "female".equals(user.getGender()))
    .map(User::getName)
    .collect(Collectors.toList());
// 结果: ["Diana"]
```

### 场景二：分组统计

```java
// 按性别分组
Map<String, List<User>> usersByGender = users.stream()
    .collect(Collectors.groupingBy(User::getGender));
// 结果: {female=[Alice, Diana], male=[Bob, Charlie]}

// 按性别统计人数
Map<String, Long> countByGender = users.stream()
    .collect(Collectors.groupingBy(User::getGender, Collectors.counting()));
// 结果: {female=2, male=2}

// 按性别计算平均年龄
Map<String, Double> avgAgeByGender = users.stream()
    .collect(Collectors.groupingBy(User::getGender, Collectors.averagingInt(User::getAge)));
// 结果: {female=32.5, male=32.5}
```

### 场景三：复杂对象的处理

```java
// 假设有一个订单列表，每个订单包含多个商品
List<Order> orders = getOrders(); // 获取订单列表

// 获取所有订单中的所有商品
List<Item> allItems = orders.stream()
    .flatMap(order -> order.getItems().stream())
    .collect(Collectors.toList());

// 计算所有订单的总金额
double totalAmount = orders.stream()
    .mapToDouble(Order::getAmount)
    .sum();

// 找出金额最高的订单
Optional<Order> maxOrder = orders.stream()
    .max(Comparator.comparing(Order::getAmount));
```

### 场景四：数据转换和聚合

```java
// 将用户列表转换为ID到用户的映射
Map<Long, User> userMap = users.stream()
    .collect(Collectors.toMap(User::getId, user -> user));

// 将用户列表转换为以逗号分隔的名字字符串
String names = users.stream()
    .map(User::getName)
    .collect(Collectors.joining(", "));
// 结果: "Alice, Bob, Charlie, Diana"
```

## Stream流与传统循环的对比

### 传统循环方式

```java
List<Integer> numbers = Arrays.asList(1, 2, 3, 4, 5, 6, 7, 8, 9, 10);
List<Integer> evenSquares = new ArrayList<>();

// 筛选出偶数并计算平方
for (Integer number : numbers) {
    if (number % 2 == 0) {
        evenSquares.add(number * number);
    }
}
```

### Stream流方式

```java
List<Integer> numbers = Arrays.asList(1, 2, 3, 4, 5, 6, 7, 8, 9, 10);

// 筛选出偶数并计算平方
List<Integer> evenSquares = numbers.stream()
    .filter(number -> number % 2 == 0)
    .map(number -> number * number)
    .collect(Collectors.toList());
```

可以看出，使用Stream流的方式更加简洁、直观，代码可读性更高。

## 性能注意事项

1. **避免过度使用Stream**：虽然Stream可以使代码更简洁，但并不意味着在所有场景下都比传统循环更高效。对于简单的操作，传统循环可能更快。

2. **合理使用并行流**：对于大数据量的处理，可以考虑使用并行流（parallelStream）来提高性能，但要注意线程安全问题。

   ```java
   List<Integer> numbers = Arrays.asList(1, 2, 3, 4, 5, 6, 7, 8, 9, 10);
   List<Integer> result = numbers.parallelStream()
       .filter(n -> n % 2 == 0)
       .map(n -> n * n)
       .collect(Collectors.toList());
   ```

3. **避免装箱和拆箱**：对于基本类型，尽量使用专门的Stream（IntStream, LongStream, DoubleStream）来避免装箱和拆箱的开销。

   ```java
   // 使用IntStream而不是Stream<Integer>
   int sum = IntStream.range(1, 1000)
       .filter(n -> n % 2 == 0)
       .sum();
   ```

4. **注意短路操作**：合理利用短路操作（如limit, findFirst, anyMatch等）可以提高性能。

   ```java
   // 找到第一个大于100的偶数平方
   Optional<Integer> result = numbers.stream()
       .filter(n -> n % 2 == 0)
       .map(n -> n * n)
       .filter(n -> n > 100)
       .findFirst();
   ```

## 总结

Java Stream API为集合处理提供了一种函数式编程的方式，使代码更加简洁、易读。通过本文的介绍，我们了解了Stream的基本概念、常用操作以及实际应用场景。在实际开发中，合理使用Stream可以大大提高代码质量和开发效率。但也要注意性能问题，在特定场景下选择合适的处理方式。

希望本文对你理解和使用Java Stream API有所帮助！
