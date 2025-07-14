---
title: 【Java】详解对象属性变化比较工具类BeanCompareUtils
categories: Java
tags:
  - Java
  - 工具类
  - 对象比较
  - 属性差异
  - 反射
  - 自定义工具类
  - 审计
---

# 前言

在许多Java应用中，跟踪对象状态的变化至关重要。例如，在数据持久化之前记录哪些字段被修改用于审计日志，或者在用户界面上高亮显示已更改的数据，亦或是在数据同步过程中仅传输变更部分。为了实现这些功能，我们需要一个能够比较两个对象并找出其属性值差异的工具。虽然有一些成熟的库（如JaVers、Apache Commons Lang的`DiffBuilder`）提供了强大的对象审计和比较功能，但有时我们可能需要一个更轻量级、更易于定制的解决方案。本文将探讨如何设计和实现一个自定义的`BeanCompareUtils`工具类来比较对象属性的变化。

本工具类的设计也将遵循[《【Java】编写自定义通用工具类指南》](/【Java】编写自定义通用工具类指南.md)中提出的各项原则。

# 一、为何需要自定义对象属性比较工具？

1.  **特定场景定制**：可以根据具体业务需求定制比较逻辑，例如如何格式化差异报告、如何处理特定类型的属性（如加密字段、大型文本字段）。
2.  **轻量级集成**：对于简单的比较需求，引入功能全面的大型审计库可能过于重型。
3.  **细粒度控制**：完全掌控哪些属性参与比较、如何比较（例如，字符串比较是否忽略大小写、日期比较的精度等）。
4.  **学习与理解**：通过自行实现，可以深入理解对象比较的复杂性以及Java反射的应用。

# 二、现有解决方案概览

在着手自定义之前，了解一些现有工具是明智的：

*   **Apache Commons Lang `DiffBuilder`**：`org.apache.commons.lang3.builder.DiffBuilder` 允许你为对象的每个字段追加比较，并生成一个包含所有差异的 `DiffResult`。它非常灵活，但需要为每个字段显式调用 `append` 方法。
*   **JaVers**：一个功能完备的Java对象审计和差异比较库。它能够自动发现对象图的更改，支持集合、Map、嵌套对象等复杂结构的比较，并能生成详细的变更历史。适用于需要完整审计追踪的场景。
*   **`java-obj-diff` (openquartz)**：一个GitHub上的开源项目，基于Commons Lang的`DiffBuilder`进行了增强，支持注解忽略字段、自定义比较器、别名、格式化等，并优化了反射性能。
*   **`object-equator` (JING-START)**：另一个GitHub项目，通过注解标记需要比较的字段，支持嵌套对象和集合的比较。
*   **`ez-compare` (vincemann)**：提供流式API进行对象比较，可配置性强，但主要进行浅比较。

这些库各有侧重，从简单的工具类到复杂的审计框架都有覆盖。

# 三、自定义 `BeanCompareUtils` 设计考量

设计一个自定义的对象属性比较工具类时，需要考虑以下关键点：

1.  **输入参数**：通常是两个待比较的对象，一般称之为"旧对象"（old/original）和"新对象"（new/current）。它们应该是同一类型，或者是可以相互比较的类型。
2.  **输出结果**：比较的结果应该清晰地表明哪些属性发生了变化。一个常见的做法是返回一个差异列表，其中每个差异项包含：
    *   属性名 (Field Name)
    *   属性的易读名称/别名 (Optional, for friendly reports)
    *   旧值 (Old Value)
    *   新值 (New Value)
3.  **比较逻辑**：
    *   **基本类型与包装类**：直接使用 `equals()` 方法或 `==` (对于基本类型，需注意自动装箱拆箱)。
    *   **对象类型**：默认使用对象的 `equals()` 方法。如果需要深入比较对象内部属性（即深比较或递归比较），则逻辑会更复杂。
    *   **数组/集合/Map**：比较这类属性时，不仅要考虑引用是否变化，还可能需要比较其内容（元素/键值对）是否有增删改。这通常需要更复杂的逻辑。
    *   **`null` 值处理**：如何定义一个属性从 `null` 变为非 `null`，或从非 `null` 变为 `null`，或者两个都是 `null` 的情况。
4.  **递归比较（深比较）**：如果对象的属性本身也是复杂对象，是否需要递归地比较这些嵌套对象的属性。这需要处理潜在的循环引用问题。
5.  **可配置性**：
    *   **忽略属性**：允许通过名称列表或注解（如 `@CompareIgnore`）指定不参与比较的属性（例如ID、创建时间、最后更新时间等元数据字段）。
    *   **属性别名**：支持为属性指定一个更易读的名称（如通过 `@CompareAlias("用户年龄")`），用于生成的差异报告中。
    *   **自定义比较器**：对于特定属性或特定类型，允许提供自定义的比较逻辑。
6.  **错误处理**：在反射获取属性或值时可能发生异常，需要妥善处理。

# 四、自定义 `BeanCompareUtils` 实现详解

我们将首先实现一个基础版本，能够比较两个对象的直接属性（浅比较），并记录差异。后续可以逐步扩展。

## （一）定义属性差异类 `PropertyDifference`

这个类用于封装单个属性的变更信息。

```java
package com.example.project.util;

import java.util.Objects;

public class PropertyDifference {
    private String propertyName; // 属性名
    private String propertyAlias; // 属性别名 (可选)
    private Object oldValue;      // 旧值
    private Object newValue;      // 新值

    public PropertyDifference(String propertyName, Object oldValue, Object newValue) {
        this(propertyName, propertyName, oldValue, newValue);
    }

    public PropertyDifference(String propertyName, String propertyAlias, Object oldValue, Object newValue) {
        this.propertyName = Objects.requireNonNull(propertyName);
        this.propertyAlias = Objects.requireNonNull(propertyAlias);
        this.oldValue = oldValue;
        this.newValue = newValue;
    }

    public String getPropertyName() {
        return propertyName;
    }

    public String getPropertyAlias() {
        return propertyAlias;
    }

    public Object getOldValue() {
        return oldValue;
    }

    public Object getNewValue() {
        return newValue;
    }

    @Override
    public String toString() {
        return "PropertyDifference{" +
                "propertyAlias='" + propertyAlias + '\'' +
                ", oldValue=" + oldValue +
                ", newValue=" + newValue +
                '}';
    }

    // hashCode and equals can be implemented if these objects are stored in Sets, etc.
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        PropertyDifference that = (PropertyDifference) o;
        return propertyName.equals(that.propertyName) &&
                Objects.equals(propertyAlias, that.propertyAlias) &&
                Objects.equals(oldValue, that.oldValue) &&
                Objects.equals(newValue, that.newValue);
    }

    @Override
    public int hashCode() {
        return Objects.hash(propertyName, propertyAlias, oldValue, newValue);
    }
}
```

## （二）`BeanCompareUtils` 核心实现

```java
package com.example.project.util;

import java.lang.reflect.Field;
import java.lang.reflect.Modifier;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
// 可选：用于注解支持
// import java.lang.annotation.ElementType;
// import java.lang.annotation.Retention;
// import java.lang.annotation.RetentionPolicy;
// import java.lang.annotation.Target;

/**
 * 对象属性变化比较工具类
 */
public final class BeanCompareUtils {

    private BeanCompareUtils() {
        throw new UnsupportedOperationException("This is a utility class and cannot be instantiated");
    }

    // 定义注解 (可选, 用于后续扩展)
    // @Retention(RetentionPolicy.RUNTIME)
    // @Target(ElementType.FIELD)
    // public @interface CompareIgnore {}

    // @Retention(RetentionPolicy.RUNTIME)
    // @Target(ElementType.FIELD)
    // public @interface CompareAlias {
    //     String value();
    // }

    /**
     * 比较两个对象的属性，并返回差异列表。
     * 注意：此基础版本进行的是浅比较，且要求两个对象是同一类型。
     *
     * @param oldBean 旧对象
     * @param newBean 新对象
     * @return 属性差异列表。如果没有差异，则返回空列表。
     * @throws IllegalArgumentException 如果oldBean或newBean为null，或者它们不是同一类型。
     */
    public static List<PropertyDifference> compare(final Object oldBean, final Object newBean) {
        if (oldBean == null || newBean == null) {
            throw new IllegalArgumentException("Old bean and new bean cannot be null.");
        }
        if (!oldBean.getClass().equals(newBean.getClass())) {
            throw new IllegalArgumentException("Old bean and new bean must be of the same class.");
        }

        List<PropertyDifference> differences = new ArrayList<>();
        Class<?> clazz = oldBean.getClass();
        Field[] fields = clazz.getDeclaredFields();

        for (Field field : fields) {
            // 忽略静态字段和transient字段 (通常transient字段不参与状态比较)
            if (Modifier.isStatic(field.getModifiers()) || Modifier.isTransient(field.getModifiers())) {
                continue;
            }

            // 可选：检查 @CompareIgnore 注解
            // if (field.isAnnotationPresent(CompareIgnore.class)) {
            //     continue;
            // }

            field.setAccessible(true); // 允许访问私有字段

            try {
                Object oldValue = field.get(oldBean);
                Object newValue = field.get(newBean);

                if (!Objects.equals(oldValue, newValue)) {
                    String propertyName = field.getName();
                    String propertyAlias = propertyName; // 默认别名即属性名

                    // 可选：检查 @CompareAlias 注解
                    // if (field.isAnnotationPresent(CompareAlias.class)) {
                    //     propertyAlias = field.getAnnotation(CompareAlias.class).value();
                    // }
                    differences.add(new PropertyDifference(propertyName, propertyAlias, oldValue, newValue));
                }
            } catch (IllegalAccessException e) {
                // Log or handle this error appropriately
                System.err.println("Error accessing field " + field.getName() + ": " + e.getMessage());
                // Depending on policy, you might re-throw or add to a list of errors
            }
        }
        return differences;
    }
}
```

**实现说明**：

*   `PropertyDifference` 类用于存储每个不同属性的名称、别名（当前简单实现为属性名）、旧值和新值。
*   `compare` 方法接收两个对象，首先检查 `null` 和类型一致性。
*   通过反射获取对象的所有声明字段 (`getDeclaredFields()`)。
*   遍历字段，忽略 `static` 和 `transient` 修饰的字段（这些通常不代表对象的可比较状态）。
*   通过 `field.setAccessible(true)` 允许访问私有字段。
*   使用 `field.get()` 获取旧对象和新对象中对应属性的值。
*   使用 `java.util.Objects.equals()` 来比较这两个值。这个方法能正确处理 `null` 情况（例如，一个为 `null` 另一个不是，或者两个都为 `null`）。
*   如果值不相等，就创建一个 `PropertyDifference` 对象并添加到结果列表中。
*   代码中注释掉了使用 `@CompareIgnore` 和 `@CompareAlias` 注解的初步设想，这些是后续扩展的方向。
*   当前的异常处理比较简单，实际应用中可能需要更完善的日志记录或错误传递机制。
*   **这是一个浅比较**：如果属性是对象类型，`Objects.equals()` 默认会调用该对象自身的 `equals()` 方法。如果该对象的 `equals()` 方法没有被重写以比较内容，那么这里比较的仍然是引用。对于集合、Map等，也是比较引用。

# 五、使用示例

```java
class User {
    private Long id;
    private String username;
    private int age;
    private String email;
    // @BeanCompareUtils.CompareAlias("激活状态") // 示例注解用法
    private boolean isActive;
    // @BeanCompareUtils.CompareIgnore // 示例注解用法
    private java.util.Date lastModified;

    public User(Long id, String username, int age, String email, boolean isActive) {
        this.id = id;
        this.username = username;
        this.age = age;
        this.email = email;
        this.isActive = isActive;
        this.lastModified = new java.util.Date();
    }
    // Getters and setters for simplicity, or use Lombok
    public void setUsername(String username) { this.username = username; }
    public void setAge(int age) { this.age = age; }
    public void setEmail(String email) { this.email = email; }
    public void setActive(boolean active) { isActive = active; }
    public void setLastModified(java.util.Date lastModified) { this.lastModified = lastModified; }

    @Override
    public String toString() { // For easy printing
        return "User{" + "id=" + id + ", username='" + username + '\'' +
               ", age=" + age + ", email='" + email + '\'' +
               ", isActive=" + isActive + ", lastModified=" + lastModified + '}';
    }
}

public class BeanCompareUtilsDemo {
    public static void main(String[] args) {
        User oldUser = new User(1L, "john.doe", 30, "john.doe@example.com", true);
        User newUser = new User(1L, "john.doe.new", 31, "john.new@example.com", false);
        
        // 模拟时间变化，如果lastModified不被忽略，它会成为一个差异点
        try { Thread.sleep(10); } catch (InterruptedException ignored) {}
        newUser.setLastModified(new java.util.Date());

        System.out.println("Old User: " + oldUser);
        System.out.println("New User: " + newUser);

        List<PropertyDifference> differences = BeanCompareUtils.compare(oldUser, newUser);

        if (differences.isEmpty()) {
            System.out.println("\nNo differences found.");
        } else {
            System.out.println("\nDifferences found:");
            for (PropertyDifference diff : differences) {
                System.out.println(" - Property: " + diff.getPropertyAlias() +
                                   ", Old: '" + diff.getOldValue() + "', New: '" + diff.getNewValue() + "'");
            }
        }
        
        User identicalUser = new User(1L, "john.doe.new", 31, "john.new@example.com", false);
        identicalUser.lastModified = newUser.lastModified; //确保一致
        List<PropertyDifference> noDifferences = BeanCompareUtils.compare(newUser, identicalUser);
        System.out.println("\nComparing newUser with identicalUser: " + (noDifferences.isEmpty() ? "No differences" : noDifferences.size() + " differences"));

    }
}
```

**预期输出（`lastModified` 如果不忽略，其值会不同）：**
```
Old User: User{id=1, username='john.doe', age=30, email='john.doe@example.com', isActive=true, lastModified=...}
New User: User{id=1, username='john.doe.new', age=31, email='john.new@example.com', isActive=false, lastModified=...}

Differences found:
 - Property: username, Old: 'john.doe', New: 'john.doe.new'
 - Property: age, Old: '30', New: '31'
 - Property: email, Old: 'john.doe@example.com', New: 'john.new@example.com'
 - Property: isActive, Old: 'true', New: 'false'
 - Property: lastModified, Old: '...', New: '...'

Comparing newUser with identicalUser: No differences
```
*(如果`lastModified`被注解`@CompareIgnore`忽略且代码支持了该注解，则该行不会出现在差异中)*

# 六、扩展方向

这个基础的 `BeanCompareUtils` 可以通过以下方式进行扩展：

1.  **注解支持**：
    *   `@CompareIgnore`: 在字段上添加此注解以在比较中忽略该字段。
    *   `@CompareAlias("中文名称")`: 为字段提供一个易读的别名，用于 `PropertyDifference`。
    *   `@DeepCompare`: 标记一个字段需要进行深比较（递归比较）。
2.  **深比较（递归比较）**：
    *   当检测到属性是自定义对象类型（并且可能标记了 `@DeepCompare`）时，递归调用 `compare` 方法。
    *   需要特别注意处理对象图中的循环引用，可以维护一个已访问对象的 `Set` 来避免无限递归。
3.  **集合与Map的比较**：
    *   **集合 (List, Set)**: 不仅比较集合对象本身的引用，还要比较集合内容。可能需要识别元素的增加、删除或（对于有序列表）顺序变化。对于元素是复杂对象的情况，还需递归比较元素。
    *   **Map**: 比较键值对。识别键的增加、删除，以及现有键对应值的变化。
4.  **自定义比较器**：允许为特定类型或特定属性注册自定义的比较逻辑。例如，日期比较可能需要忽略毫秒，或者字符串比较需要忽略大小写。
5.  **更灵活的类型处理**：允许比较不同类型但逻辑上相关的对象，可能需要配合属性名映射。
6.  **更友好的差异报告**：提供将 `List<PropertyDifference>` 格式化为易读字符串或JSON的方法。

# 七、性能与替代方案

*   **性能**：基于反射的比较在属性非常多或比较操作非常频繁时可能会有性能开销。可以通过缓存`Field`对象来略微优化。对于高性能要求的场景，编译时生成代码的库（如MapStruct的思路，但它是用于映射而非直接比较）或专门优化的比较库更佳。
*   **替代方案**：
    *   **Apache Commons Lang `ReflectionDiffBuilder`**: 与 `DiffBuilder` 类似，但使用反射自动发现字段。
    *   **JaVers**: 对于需要完整审计和复杂对象图比较的场景，JaVers是非常强大的选择。
    *   **手动实现 `equals()` 和自定义比较逻辑**：如果仅针对特定几个类，且比较逻辑固定，直接在类中实现详细的比较方法可能更直接。

# 八、总结

自定义 `BeanCompareUtils` 为对象属性变化检测提供了一种灵活且可控的方法。从一个简单的基于反射的浅比较工具开始，可以根据项目需求逐步添加更高级的功能，如注解支持、深比较、集合比较等。在选择自定义实现还是使用现有库时，应权衡项目的复杂度、性能要求以及开发和维护成本。

# 九、参考资料

-   [Comparing Objects in Java (baeldung.com)](https://www.baeldung.com/java-comparing-objects)
-   [Objects Utility Class - Sip of Java (inside.java)](https://inside.java/2023/05/28/sip078/)
-   [GitHub - openquartz/java-obj-diff](https://github.com/openquartz/java-obj-diff)
-   [GitHub - JING-START/object-equator](https://github.com/JING-START/object-equator)
-   [GitHub - vincemann/ez-compare](https://github.com/vincemann/ez-compare)

--- 