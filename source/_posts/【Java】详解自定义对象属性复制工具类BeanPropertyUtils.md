---
title: 【Java】详解自定义对象属性复制工具类BeanPropertyUtils
categories: Java
tags:
  - JAVA
  - 工具类
  - 对象属性复制
  - BeanUtils
  - 反射
  - 自定义工具类
---

# 前言

在Java应用程序开发中，经常需要在不同的对象之间传递数据，特别是当处理数据传输对象（DTOs）、视图对象（VOs）、领域模型（Entities/Models）等分层对象时，属性的复制成为一项常见任务。虽然存在许多优秀的第三方库（如Apache Commons BeanUtils, Spring Framework BeanUtils, MapStruct等）来简化这一过程，但在某些情况下，我们可能需要更细粒度的控制、避免引入额外的重型依赖，或者仅仅是为了学习和理解其内部机制，这时编写一个自定义的对象属性复制工具类就显得很有价值。本文将详细探讨如何设计和实现一个自定义的 `BeanPropertyUtils` 工具类。

本工具类的设计也将遵循[《【Java】编写自定义通用工具类指南》](/【Java】编写自定义通用工具类指南.md)中提出的各项原则。

# 一、为何需要自定义对象属性复制工具？

1.  **细粒度控制**：自定义实现可以让我们完全控制复制逻辑，例如：
    *   如何处理 `null` 值（是跳过、赋 `null` 还是抛异常）。
    *   当源和目标属性名称或类型不完全匹配时如何处理。
    *   是否复制静态或瞬态（`transient`）字段。
    *   在复制前后执行自定义逻辑（钩子方法）。
2.  **轻量级**：如果项目对依赖大小敏感，或者仅需简单的属性复制功能，引入一个功能全面的大型库可能显得冗余。
3.  **特定需求**：有时项目有非常特殊的复制规则，通用库难以满足或配置复杂。
4.  **学习目的**：通过自己实现，可以更深入地理解Java反射机制及其在对象操作中的应用。

# 二、现有解决方案概览

在着手自定义之前，了解一些成熟的解决方案是必要的：

*   **Apache Commons BeanUtils**：提供了 `copyProperties(Object dest, Object orig)` 方法，能够进行属性复制，并支持一定的类型转换。但其性能相对较低（因为大量使用反射且早期版本有一些性能问题），且对于不存在的属性会抛出异常。
*   **Spring Framework BeanUtils**：同样提供了 `copyProperties(Object source, Object target)` 方法，是Spring框架的一部分。它比Apache Commons BeanUtils更简洁，性能也相对较好，通常只进行浅拷贝，且当属性名和类型匹配时才复制。
*   **MapStruct**：一个编译时代码生成器，通过定义接口和注解来生成类型安全、高性能的Bean映射代码。它避免了运行时的反射开销，配置灵活，支持复杂的映射逻辑。是目前推荐的高性能解决方案。
*   **ModelMapper, Dozer, Orika**：其他流行的映射库，各有特点，提供不同程度的配置灵活性和性能表现。

# 三、自定义 `BeanPropertyUtils` 设计原则

在自定义 `BeanPropertyUtils` 时，除了通用工具类的设计原则外，还需特别关注：

1.  **明确的复制策略**：
    *   **属性匹配**：是基于名称完全相同，还是可以忽略大小写，或者支持注解指定别名？
    *   **类型兼容性**：如果类型不完全匹配，是否尝试进行类型转换（如 `int` 到 `Integer`，`String` 到 `enum`）？如何处理不兼容的类型？
    *   **Null值处理**：源对象的 `null` 属性是否复制到目标对象？或者目标对象对应的属性保持不变？
    *   **目标对象实例化**：工具类是否负责创建目标对象实例？还是要求调用者传入已实例化的目标对象？（通常后者更灵活）
2.  **错误处理**：属性访问或类型转换失败时，是抛出异常（以及何种异常）还是静默忽略？或者提供一个错误处理器回调？
3.  **深拷贝 vs. 浅拷贝**：明确工具类执行的是浅拷贝（只复制引用）还是深拷贝（递归复制对象内容）。对于集合和自定义对象类型的属性，浅拷贝可能导致意外的共享状态。
4.  **性能意识**：反射操作相对直接方法调用有性能开销。对于性能敏感的场景，应考虑缓存反射信息（如 `Method` 对象）或采用其他技术。
5.  **可配置性与易用性**：提供简单易用的API，同时允许通过参数或配置对象定制复制行为。

# 四、自定义 `BeanPropertyUtils` 实现详解 (基于反射的浅拷贝)

下面我们提供一个简单的基于Java反射的 `BeanPropertyUtils` 实现，主要用于浅拷贝同名属性。

```java
package com.example.project.util;

import java.lang.reflect.Field;
import java.lang.reflect.Method;
import java.lang.reflect.Modifier;
import java.util.HashMap;
import java.util.Map;
import java.util.Objects;

/**
 * 自定义对象属性复制工具类 (基于反射的浅拷贝)
 */
public final class BeanPropertyUtils {

    private BeanPropertyUtils() {
        throw new UnsupportedOperationException("This is a utility class and cannot be instantiated");
    }

    /**
     * 将源对象的属性值复制到目标对象。
     * 只复制名称相同且类型兼容的属性。
     * 源对象属性值为null时，也会复制null到目标对象。
     *
     * @param source 源对象
     * @param target 目标对象
     * @throws NullPointerException 如果source或target为null
     * @throws RuntimeException 如果复制过程中发生反射相关的错误
     */
    public static void copyProperties(final Object source, final Object target) {
        Objects.requireNonNull(source, "Source object cannot be null");
        Objects.requireNonNull(target, "Target object cannot be null");

        Class<?> sourceClass = source.getClass();
        Class<?> targetClass = target.getClass();

        Field[] sourceFields = sourceClass.getDeclaredFields();

        for (Field sourceField : sourceFields) {
            // 忽略静态字段和final字段 (通常final字段在构造后不应被修改)
            if (Modifier.isStatic(sourceField.getModifiers()) || Modifier.isFinal(sourceField.getModifiers())) {
                continue;
            }

            try {
                // 尝试在目标对象中查找同名同类型的字段，或名称相同且类型兼容的setter方法
                Field targetField = findTargetField(targetClass, sourceField.getName(), sourceField.getType());

                if (targetField != null) {
                    sourceField.setAccessible(true); // 允许访问私有字段
                    targetField.setAccessible(true); // 允许访问私有字段
                    Object value = sourceField.get(source);
                    targetField.set(target, value); // 直接字段赋值
                } else {
                    // 如果直接字段找不到或类型不完全匹配，尝试通过getter/setter方法
                    // 为了简化，这里仅演示通过名称匹配，实际应用中类型检查和转换更复杂
                    String getterName = "get" + capitalize(sourceField.getName());
                    String setterName = "set" + capitalize(sourceField.getName());

                    try {
                        Method getterMethod = findGetter(sourceClass, getterName, sourceField.getName());
                        Method setterMethod = findSetter(targetClass, setterName, sourceField.getType());

                        if (getterMethod != null && setterMethod != null) {
                            // 确保getter的返回类型与setter的参数类型兼容
                            if (setterMethod.getParameterTypes()[0].isAssignableFrom(getterMethod.getReturnType())) {
                                Object value = getterMethod.invoke(source);
                                setterMethod.invoke(target, value);
                            }
                        }
                    } catch (NoSuchMethodException nsme) {
                        // 忽略：源对象没有对应的getter或目标对象没有对应的setter
                    }
                }
            } catch (IllegalAccessException e) {
                // Log or handle: 无法访问字段或方法
                System.err.println("Access error for field " + sourceField.getName() + ": " + e.getMessage());
            } catch (IllegalArgumentException e) {
                // Log or handle: 参数类型不匹配 (通常在setter调用时)
                System.err.println("Argument error for field " + sourceField.getName() + ": " + e.getMessage());
            } catch (Exception e) {
                // 其他反射异常，例如 InvocationTargetException
                throw new RuntimeException("Error copying property '" + sourceField.getName() + "'", e);
            }
        }
    }

    private static Field findTargetField(Class<?> targetClass, String fieldName, Class<?> fieldType) {
        try {
            Field field = targetClass.getDeclaredField(fieldName);
            // 简单类型匹配，实际场景可能需要更复杂的类型兼容性判断
            if (field.getType().equals(fieldType) || field.getType().isAssignableFrom(fieldType) || isPrimitiveWrapperMatch(field.getType(), fieldType)) {
                return field;
            }
        } catch (NoSuchFieldException e) {
            // 字段不存在
        }
        // 也可以向上查找父类字段
        if (targetClass.getSuperclass() != null) {
            return findTargetField(targetClass.getSuperclass(), fieldName, fieldType);
        }
        return null;
    }

    private static Method findGetter(Class<?> clazz, String methodName, String fieldName) throws NoSuchMethodException {
        try {
            return clazz.getMethod(methodName);
        } catch (NoSuchMethodException e) {
            // 尝试boolean类型的isXXX getter
            if (fieldName != null && (boolean.class.equals(clazz.getDeclaredField(fieldName).getType()) || Boolean.class.equals(clazz.getDeclaredField(fieldName).getType()))){
                 String booleanGetterName = "is" + capitalize(fieldName);
                 if (!booleanGetterName.equals(methodName)) { // 避免重复尝试
                    return clazz.getMethod(booleanGetterName);
                 }
            }
            throw e;
        }
    }

    private static Method findSetter(Class<?> clazz, String methodName, Class<?> paramType) throws NoSuchMethodException {
         // 遍历所有方法查找名称和参数类型都匹配的setter，更精确
        for (Method method : clazz.getMethods()) {
            if (method.getName().equals(methodName) && method.getParameterCount() == 1) {
                if (method.getParameterTypes()[0].isAssignableFrom(paramType) || 
                    isPrimitiveWrapperMatch(method.getParameterTypes()[0], paramType)) {
                    return method;
                }
            }
        }
        throw new NoSuchMethodException("No compatible setter found for " + methodName + " with param type " + paramType.getName());
    }

    private static String capitalize(String str) {
        if (str == null || str.isEmpty()) {
            return str;
        }
        return Character.toUpperCase(str.charAt(0)) + str.substring(1);
    }

    private static boolean isPrimitiveWrapperMatch(Class<?> type1, Class<?> type2) {
        if (type1.isPrimitive()) type1 = getWrapperClass(type1);
        if (type2.isPrimitive()) type2 = getWrapperClass(type2);
        return type1.equals(type2);
    }

    private static final Map<Class<?>, Class<?>> PRIMITIVE_TO_WRAPPER = new HashMap<>();
    static {
        PRIMITIVE_TO_WRAPPER.put(boolean.class, Boolean.class);
        PRIMITIVE_TO_WRAPPER.put(byte.class, Byte.class);
        PRIMITIVE_TO_WRAPPER.put(char.class, Character.class);
        PRIMITIVE_TO_WRAPPER.put(short.class, Short.class);
        PRIMITIVE_TO_WRAPPER.put(int.class, Integer.class);
        PRIMITIVE_TO_WRAPPER.put(long.class, Long.class);
        PRIMITIVE_TO_WRAPPER.put(float.class, Float.class);
        PRIMITIVE_TO_WRAPPER.put(double.class, Double.class);
    }

    private static Class<?> getWrapperClass(Class<?> primitiveClass) {
        return PRIMITIVE_TO_WRAPPER.getOrDefault(primitiveClass, primitiveClass);
    }

    // 还可以添加其他配置，例如：
    // public static void copyProperties(Object source, Object target, boolean ignoreNulls) { ... }
    // public static void copyProperties(Object source, Object target, String... ignoreProperties) { ... }
}
```

**实现说明**：

*   遍历源对象的所有声明字段（不包括继承的，可按需修改为 `getFields()` 或递归获取）。
*   忽略 `static` 和 `final` 字段。
*   优先尝试直接通过反射访问和设置同名同类型的字段 (`targetField.set(target, value)`)。这可以处理没有公共getter/setter但需要复制的字段（如果安全策略允许）。
*   如果直接字段访问不成功或类型不完全匹配，则尝试通过标准的getter/setter方法 (`getterMethod.invoke(source)`, `setterMethod.invoke(target, value)`)。这里对getter/setter名称做了简单约定 (`getXxx`/`isXxx` 和 `setXxx`)。
*   `capitalize` 是一个辅助方法，用于首字母大写以构造getter/setter名称。
*   `findTargetField`, `findGetter`, `findSetter` 是辅助方法，用于查找对应的字段和方法，并进行了简单的类型兼容性检查，包括基本类型和其包装类型的匹配 (`isPrimitiveWrapperMatch`)。
*   异常处理：简单打印了错误信息或抛出运行时异常，实际项目中应根据需求细化。
*   **这是一个浅拷贝实现**：如果属性是对象类型，复制的是引用，不是对象本身。

## （一）处理 `null` 值

当前实现会将源对象的 `null` 值复制到目标对象。如果希望忽略 `null` 值，可以在 `targetField.set()` 或 `setterMethod.invoke()` 之前添加判断：

```java
// ...
Object value = sourceField.get(source);
if (value != null) { // 或根据配置参数 decide whether to copy nulls
    targetField.set(target, value);
}
// 类似地修改setter调用
// ...
```

## （二）忽略特定属性

可以传递一个 `String` 数组或 `Set` 来指定哪些属性不需要复制：

```java
// 在 for 循环开始处添加：
// if (isIgnored(sourceField.getName(), ignoreProperties)) { continue; }
```

## （三）不同名属性映射

如果源和目标属性名称不同，简单的基于名称匹配的反射就行不通了。这时可以考虑：

*   **注解**：在字段或getter/setter上使用自定义注解指定映射关系，如 `@MapField("sourceFieldName")`。
*   **配置对象**：传递一个 `Map<String, String>` 来定义源字段名到目标字段名的映射。

这些会使实现变得更复杂。

## （四）深拷贝

实现通用的深拷贝非常复杂，因为需要处理循环引用、集合和数组的深拷贝、以及不可变对象的识别。
对于自定义对象，简单的深拷贝思路是：
1.  如果属性类型是自定义的可变对象，递归调用 `copyProperties` 创建新的目标属性实例。
2.  对于集合或数组，需要创建新的集合/数组实例，并对其中每个元素进行深拷贝（如果元素也是可变对象）。

更可靠的深拷贝通常依赖于序列化（如使用Jackson或Gson将对象转为JSON再转回来，前提是对象可序列化且无复杂引用）或者专门的深拷贝库。

# 五、使用示例

```java
class SourceBean {
    private String name;
    private int age;
    private String email; // 源对象有，目标对象没有
    private NestedBean nested;

    public SourceBean(String name, int age, String email, NestedBean nested) {
        this.name = name;
        this.age = age;
        this.email = email;
        this.nested = nested;
    }
    // Getters and Setters...
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public int getAge() { return age; }
    public void setAge(int age) { this.age = age; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public NestedBean getNested() { return nested; }
    public void setNested(NestedBean nested) { this.nested = nested; }
}

class TargetBean {
    private String name;
    private Integer age; // 类型不同但兼容 (int -> Integer)
    private String address; // 目标对象有，源对象没有
    private NestedBean nested;

    // Getters and Setters...
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public Integer getAge() { return age; }
    public void setAge(Integer age) { this.age = age; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    public NestedBean getNested() { return nested; }
    public void setNested(NestedBean nested) { this.nested = nested; }

    @Override
    public String toString() {
        return "TargetBean{" +
                "name='" + name + '\'' +
                ", age=" + age +
                ", address='" + address + '\'' +
                ", nested=" + (nested != null ? nested.getValue() : null) +
                '}';
    }
}

class NestedBean {
    private String value;
    public NestedBean(String value) { this.value = value; }
    public String getValue() { return value; }
    public void setValue(String value) { this.value = value; }
}

public class BeanPropertyUtilsDemo {
    public static void main(String[] args) {
        NestedBean sourceNested = new NestedBean("SourceNestedValue");
        SourceBean source = new SourceBean("John Doe", 30, "john.doe@example.com", sourceNested);
        TargetBean target = new TargetBean();
        target.setAddress("Initial Address"); // 目标对象的初始值

        System.out.println("Target before copy: " + target);

        BeanPropertyUtils.copyProperties(source, target);

        System.out.println("Target after copy: " + target);
        System.out.println("Source nested hash: " + source.getNested().hashCode());
        System.out.println("Target nested hash: " + target.getNested().hashCode());
        System.out.println("Nested objects are same (shallow copy): " + (source.getNested() == target.getNested()));

        // 演示如果修改源的嵌套对象，目标也会变 (因为是浅拷贝)
        source.getNested().setValue("ModifiedSourceNestedValue");
        System.out.println("Target after modifying source nested: " + target);
    }
}

```
**预期输出** (部分，哈希值会变化):
```
Target before copy: TargetBean{name='null', age=null, address='Initial Address', nested=null}
Target after copy: TargetBean{name='John Doe', age=30, address='Initial Address', nested=SourceNestedValue}
Source nested hash: ...
Target nested hash: ...
Nested objects are same (shallow copy): true
Target after modifying source nested: TargetBean{name='John Doe', age=30, address='Initial Address', nested=ModifiedSourceNestedValue}
```

# 六、性能考虑与替代方案

基于反射的属性复制通常比直接的getter/setter调用慢。原因包括：
*   方法查找的开销。
*   安全检查。
*   参数打包/解包。

**优化技巧**：
*   **缓存反射对象**：对于频繁复制相同类型的对象，可以将 `Field`、`Method` 对象缓存起来（例如在 `Map<Class<?>, Map<String, Field>>` 中），避免重复查找。
*   **动态代码生成**：更高级的技术是使用字节码操作库（如 ASM, ByteBuddy）在运行时动态生成专门的复制类，其性能接近手动编写的代码。

**替代方案**：
*   **手动编写**：对于固定类型的、性能要求极高的复制，手动编写getter/setter调用是最快的。
*   **MapStruct**：如前所述，它在编译时生成映射代码，性能非常好，且类型安全。
*   **Cglib的 `BeanCopier`**：Cglib库提供了一个 `BeanCopier` 类，它通过动态生成字节码来实现属性复制，性能优于纯反射，但不如MapStruct类型安全，且配置不如MapStruct灵活。

# 七、总结

自定义 `BeanPropertyUtils` 可以在特定场景下提供灵活性和轻量级的解决方案。通过Java反射，我们可以实现基本的属性复制功能。然而，开发者需要仔细考虑复制策略、错误处理、尤其是浅拷贝和深拷贝的区别，以及反射带来的性能影响。对于大多数复杂的应用场景或对性能有较高要求的场景，优先考虑成熟的映射库如 MapStruct 通常是更佳的选择。自己实现此类工具更多的是为了应对特定简单需求或加深对底层机制的理解。

# 八、参考资料

-   [Advanced Java: Simplifying Object Property Copy and Manipulation with BeanUtil (dev.to)](https://dev.to/markyu/advanced-java-simplifying-object-property-copy-and-manipulation-with-beanutil-3l2n)
-   [How to Make a Deep Copy of an Object in Java (baeldung.com)](https://www.baeldung.com/java-deep-copy)
-   [GitHub - thehackersdeck/objutils (github.com)](https://github.com/thehackersdeck/objutils)

--- 