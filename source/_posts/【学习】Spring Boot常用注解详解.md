---
title: 【学习】Spring Boot常用注解详解
categories: 学习
tags:
  - Spring Boot
  - Java
  - 后端开发
---

# 前言

Spring Boot 通过其"约定优于配置"的理念，极大地简化了 Spring 应用的搭建和开发过程。其中，注解（Annotations）扮演了至关重要的角色，它们使得开发者能够以声明式的方式配置组件、定义行为、管理依赖。本文旨在详细梳理 Spring Boot 中常用的注解，帮助开发者更好地理解和运用它们，提高开发效率。

# 一、核心注解

## （一）`@SpringBootApplication`

这是 Spring Boot 项目的启动类注解，通常标记在主类上。它是一个组合注解，包含了以下三个核心注解：

1.  **`@EnableAutoConfiguration`**: 启用 Spring Boot 的自动配置机制，尝试根据项目中添加的依赖自动配置 Spring 应用。
2.  **`@ComponentScan`**: 启用组件扫描，让 Spring Boot 能够发现和注册带有 `@Component`、`@Service`、`@Repository`、`@Controller` 等注解的类。默认扫描该注解所在类及其子包。
3.  **`@SpringBootConfiguration`**: 继承自 `@Configuration`，表明该类是一个配置类，允许在上下文中注册额外的 bean 或导入其他配置类。实质上，它就是 `@Configuration` 的一个特殊形式。

```java
// 示例：
package com.example.demo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication // 核心启动注解
public class DemoApplication {

    public static void main(String[] args) {
        SpringApplication.run(DemoApplication.class, args);
    }
}
```

## （二）`@Configuration`

声明当前类是一个配置类，它会包含一个或多个被 `@Bean` 注解的方法。Spring 容器会处理这些被 `@Bean` 注解的方法，并将返回的对象注册为 Bean。

```java
// 示例：
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration // 声明这是一个配置类
public class AppConfig {

    @Bean // 将方法返回的对象注册为Bean
    public MyService myService() {
        return new MyServiceImpl();
    }
}
```

## （三）`@Bean`

用于方法级别，声明该方法返回一个对象，并且这个对象要注册为 Spring 应用上下文中的 Bean。通常与 `@Configuration` 注解一起使用。 

# 二、Web开发常用注解

## （一）`@Controller`

标记一个类作为Spring MVC的控制器，用于处理HTTP请求。通常与`@RequestMapping`等注解配合使用。

## （二）`@RestController`

是一个组合注解，相当于`@Controller` + `@ResponseBody`。表示类中的所有方法返回的是数据（如JSON、XML等），而不是视图名。常用于构建RESTful API。

```java
// 示例：
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController // 声明这是一个RESTful控制器
public class HelloController {

    @GetMapping("/hello") // 处理GET请求
    public String sayHello() {
        return "Hello, Spring Boot!";
    }
}
```

## （三）`@RequestMapping`

用于将特定的HTTP请求路径映射到控制器中的处理方法上。可以指定请求方法（GET, POST, PUT, DELETE等）、路径、参数、头部信息等。

-   `@GetMapping`: `@RequestMapping(method = RequestMethod.GET)`的简写。
-   `@PostMapping`: `@RequestMapping(method = RequestMethod.POST)`的简写。
-   `@PutMapping`: `@RequestMapping(method = RequestMethod.PUT)`的简写。
-   `@DeleteMapping`: `@RequestMapping(method = RequestMethod.DELETE)`的简写。
-   `@PatchMapping`: `@RequestMapping(method = RequestMethod.PATCH)`的简写。

## （四）`@PathVariable`

用于从请求URL中提取路径变量的值，并将其绑定到方法的参数上。

```java
// 示例：
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class UserController {

    @GetMapping("/users/{id}") // URL中的{id}是路径变量
    public String getUserById(@PathVariable Long id) { // @PathVariable将id绑定到方法参数
        return "Fetching user with ID: " + id;
    }
}
```

## （五）`@RequestParam`

用于从HTTP请求的查询参数（query parameter）或表单数据中获取值，并将其绑定到方法的参数上。

```java
// 示例： /greet?name=World
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class GreetingController {

    @GetMapping("/greet")
    public String greet(@RequestParam(name = "name", defaultValue = "Guest") String name) {
        return "Hello, " + name + "!";
    }
}
```

## （六）`@RequestBody`

用于将HTTP请求体的内容（通常是JSON或XML格式的数据）绑定到方法的参数上。Spring会自动进行反序列化。

## （七）`@ResponseBody`

用于方法级别，指示该方法的返回值应直接作为HTTP响应体的内容，而不是视图名称。`@RestController`注解已经包含了此注解。

## （八）`@ResponseStatus`

用于标记方法或异常类，以指定当该方法成功返回或抛出特定异常时，HTTP响应应该具有的状态码和原因。

```java
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(value = HttpStatus.NOT_FOUND, reason = "Resource not found")
public class ResourceNotFoundException extends RuntimeException {
    // ...
}
```

# 三、数据持久化常用注解

## （一）`@Entity` (JPA)

标记一个类为JPA实体，表示它映射到数据库中的一张表。

## （二）`@Table` (JPA)

指定实体类映射的数据库表名以及其他表相关的属性。

## （三）`@Id` (JPA)

标记实体类中的一个属性为主键。

## （四）`@GeneratedValue` (JPA)

指定主键的生成策略，如自增、UUID等。

## （五）`@Column` (JPA)

指定实体属性映射到数据库表中的列名以及其他列相关的属性。

## （六）`@Transient` (JPA)

标记实体类中的某个属性不需要持久化到数据库。

## （七）`@Repository`

标记一个类为数据访问层（DAO）组件。Spring会自动处理该注解标记的类中抛出的特定于持久化技术的异常，并将其转换为Spring统一的数据访问异常。

```java
// 示例 (JPA):
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;

@Entity // 标记为JPA实体
@Table(name = "products") // 映射到products表
public class Product {

    @Id // 标记为主键
    @GeneratedValue(strategy = GenerationType.IDENTITY) // 主键自增
    private Long id;

    private String name;
    private double price;

    // getters and setters
}
```

```java
// 示例 (Spring Data JPA Repository):
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository // 标记为数据访问层组件
public interface ProductRepository extends JpaRepository<Product, Long> {
    // Spring Data JPA 会自动生成基本的CRUD方法
    // 也可以定义自定义查询方法
}
```

## （八）`@Transactional`

用于声明事务的边界。可以应用于类级别或方法级别。当应用于类级别时，该类中的所有公共方法都将具有指定的事务属性。当应用于方法级别时，会覆盖类级别的事务设置。

# 四、依赖注入与Bean管理注解

## （一）`@Component`

通用的组件注解，标记一个类为Spring管理的组件。它是`@Service`、`@Repository`、`@Controller`等注解的父注解。

## （二）`@Service`

标记一个类为业务逻辑层（Service）组件。

## （三）`@Autowired`

自动装配（注入）依赖。可以用在构造器、字段、setter方法或者配置方法上。Spring会尝试按照类型（byType）进行匹配和注入。

```java
// 示例：
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class OrderService {

    private final ProductRepository productRepository; // 依赖ProductRepository

    @Autowired // 通过构造器注入
    public OrderService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    // ... 业务方法
}
```

## （四）`@Qualifier`

当有多个相同类型的Bean时，`@Autowired`可能无法确定注入哪一个。此时可以使用`@Qualifier`注解，通过名称指定要注入的Bean。

```java
// 示例：
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;

interface MessageService {
    String getMessage();
}

@Component("emailService")
class EmailService implements MessageService {
    public String getMessage() { return "Email message"; }
}

@Component("smsService")
class SmsService implements MessageService {
    public String getMessage() { return "SMS message"; }
}

@Component
public class NotificationService {

    private final MessageService messageService;

    @Autowired
    public NotificationService(@Qualifier("smsService") MessageService messageService) {
        this.messageService = messageService;
    }

    public void sendNotification() {
        System.out.println(messageService.getMessage());
    }
}
```

## （五）`@Value`

用于注入配置文件（如`application.properties`或`application.yml`）中的值到类的属性中。支持SpEL（Spring Expression Language）。

```java
// application.properties:
// app.name=My Spring Boot App
// app.version=1.0.0

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class AppInfo {

    @Value("${app.name}") // 注入属性值
    private String appName;

    @Value("${app.version}")
    private String appVersion;

    // ...
}
```

## （六）`@Scope`

定义Bean的作用域。常见的作用域有：

-   `singleton` (默认): 在整个Spring IoC容器中，一个Bean定义只有一个实例。
-   `prototype`: 每次请求（注入或通过`getBean()`调用）时都会创建一个新的Bean实例。
-   `request`: （仅Web应用）每次HTTP请求都会创建一个新的Bean实例。该Bean仅在当前HTTP Request内有效。
-   `session`: （仅Web应用）每次HTTP Session都会创建一个新的Bean实例。该Bean仅在当前HTTP Session内有效。
-   `application`: （仅Web应用）在ServletContext的生命周期中创建一个Bean实例。

## （七）`@Lazy`

标记Bean为延迟初始化。默认情况下，Spring容器在启动时会实例化所有的单例Bean。使用`@Lazy`注解后，该Bean只在第一次被请求时才会被创建。

## （八）`@Primary`

当存在多个相同类型的Bean时，`@Primary`注解用于指定首选的Bean。如果`@Autowired`时没有使用`@Qualifier`，则会优先注入被`@Primary`标记的Bean。

# 五、条件注解 (Conditional Annotations)

Spring Boot提供了丰富的条件注解，允许开发者根据特定的条件来决定是否创建某个Bean或加载某个配置。

## （一）`@ConditionalOnProperty`

根据配置文件中是否存在某个属性以及该属性的值来决定是否加载Bean或配置。

```java
// 示例：只有当 notification.service.enabled=true 时才创建 EmailNotificationService
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class NotificationConfig {

    @Bean
    @ConditionalOnProperty(name = "notification.service.enabled", havingValue = "true", matchIfMissing = false)
    public NotificationService emailNotificationService() {
        return new EmailNotificationServiceImpl();
    }
}
```

## （二）`@ConditionalOnClass`

当类路径下存在指定的类时，才会加载Bean或配置。

## （三）`@ConditionalOnMissingClass`

当类路径下不存在指定的类时，才会加载Bean或配置。

## （四）`@ConditionalOnBean`

当Spring容器中已经存在指定的Bean时，才会加载Bean或配置。

## （五）`@ConditionalOnMissingBean`

当Spring容器中不存在指定的Bean时，才会加载Bean或配置。常用于提供默认实现。

## （六）`@ConditionalOnExpression`

基于SpEL表达式的计算结果来决定是否加载Bean或配置。

## （七）`@ConditionalOnJava`

根据JVM的版本来决定是否加载Bean或配置。

## （八）`@ConditionalOnResource`

当类路径下存在指定的资源文件时，才会加载Bean或配置。

## （九）`@ConditionalOnWebApplication`

判断当前应用是否是一个Web应用 (例如，是否存在 `WebApplicationContext`)。

## （十）`@ConditionalOnNotWebApplication`

判断当前应用是否不是一个Web应用。

# 六、测试常用注解

## （一）`@SpringBootTest`

用于Spring Boot应用的集成测试。它会加载完整的ApplicationContext，可以指定启动类、运行环境、配置文件等。

## （二）`@WebMvcTest`

用于测试Spring MVC控制器层。它只会初始化与MVC相关的组件（如`@Controller`, `@ControllerAdvice`等），而不会加载完整的ApplicationContext。通常与`@MockBean`配合使用来模拟依赖。

```java
// 示例：
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.mockito.BDDMockito.given;

@WebMvcTest(GreetingController.class) // 只测试GreetingController
public class GreetingControllerTest {

    @Autowired
    private MockMvc mockMvc; // 用于模拟HTTP请求

    @MockBean // 模拟GreetingService依赖
    private GreetingService greetingService;

    @Test
    public void testGreet() throws Exception {
        given(greetingService.greet("Test")).willReturn("Hello, Test!");

        mockMvc.perform(get("/greet").param("name", "Test"))
                .andExpect(status().isOk())
                .andExpect(content().string("Hello, Test!"));
    }
}
```

## （三）`@DataJpaTest`

用于测试JPA相关的组件，如Repository。它会配置一个内存数据库（默认H2），并只加载与JPA相关的配置和Bean。事务默认开启并在测试结束后回滚。

## （四）`@MockBean`

用于在测试上下文中添加一个Mock对象（通常使用Mockito）。这个Mock对象会替换掉应用上下文中同类型的真实Bean。常用于`@SpringBootTest`和`@WebMvcTest`中。

## （五）`@SpyBean`

与`@MockBean`类似，但它会创建一个Spy对象而不是Mock对象。Spy对象会包装真实的Bean实例，允许对真实Bean的方法进行部分模拟（stubbing），而未被模拟的方法会调用真实实现。

## （六）`@TestConfiguration`

用于在测试中定义额外的Bean或覆盖现有的Bean定义。被`@TestConfiguration`注解的类不会被组件扫描自动发现，需要通过`@Import`显式导入或作为`@SpringBootTest`的`classes`属性的一部分。

## （七）`@ActiveProfiles`

用于在测试时激活指定的Spring Profile。

# 七、其他重要注解

## （一）`@EnableCaching`

启用Spring的缓存支持。需要配合具体的缓存实现（如EhCache, Caffeine, Redis等）和缓存注解（如`@Cacheable`, `@CachePut`, `@CacheEvict`）使用。

## （二）`@Cacheable`

标记方法的返回结果是可缓存的。如果缓存中已存在，则直接返回缓存结果，否则执行方法并将结果存入缓存。

## （三）`@CachePut`

标记方法总是会执行，并且其返回结果会更新到缓存中。

## （四）`@CacheEvict`

标记方法用于从缓存中移除数据。

## （五）`@EnableScheduling`

启用Spring的定时任务调度功能。

## （六）`@Scheduled`

标记一个方法为定时任务，可以指定cron表达式、固定速率（fixedRate）、固定延迟（fixedDelay）等调度策略。

```java
// 示例：
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@EnableScheduling // 启用定时任务
public class MyScheduledTasks {

    @Scheduled(cron = "0 0 * * * ?") // 每小时执行一次
    public void hourlyTask() {
        System.out.println("Executing hourly task...");
    }

    @Scheduled(fixedRate = 5000) // 每5秒执行一次
    public void fixedRateTask() {
        System.out.println("Executing fixed rate task...");
    }
}
```

## （七）`@EnableAsync`

启用Spring的异步方法执行功能。

## （八）`@Async`

标记一个方法为异步执行。调用该方法会立即返回，方法的实际执行会在Spring管理的线程池中进行。

## （九）`@ConfigurationProperties`

用于将配置文件中的属性批量绑定到一个Java对象的字段上。常用于创建类型安全的配置类。

```java
// application.properties:
// mail.host=smtp.example.com
// mail.port=587
// mail.username=user
// mail.password=secret

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "mail") // 绑定前缀为mail的属性
public class MailProperties {
    private String host;
    private int port;
    private String username;
    private String password;

    // getters and setters
}
```

## （十）`@EnableConfigurationProperties`

用于启用`@ConfigurationProperties`注解的类的功能。通常用在配置类上，并指定哪个`@ConfigurationProperties`注解的类应该被注册为Bean。

```java
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableConfigurationProperties(MailProperties.class) // 启用MailProperties
public class AppPropertiesConfig {
}
```

## （十一）`@Order` / `@Priority`

用于定义Spring Bean的加载顺序或组件的执行顺序。`@Order`的值越小，优先级越高。`@Priority`是JSR-250定义的标准注解，功能类似。

# 总结

Spring Boot注解是其易用性和强大功能的核心。通过合理利用这些注解，开发者可以显著简化配置、提高开发效率、增强代码的可读性和可维护性。本文梳理了Spring Boot中常用的注解，涵盖了核心功能、Web开发、数据持久化、依赖注入、条件装配、测试以及其他重要方面。掌握这些注解的用法和原理，对于每一个Spring Boot开发者来说都是至关重要的。

由于Spring Boot生态系统不断发展，新的注解和功能也可能随之出现。建议读者持续关注官方文档，以获取最新的信息。

# 参考文献

-   Spring Boot Reference Documentation: [https://docs.spring.io/spring-boot/docs/current/reference/htmlsingle/](https://docs.spring.io/spring-boot/docs/current/reference/htmlsingle/)
-   Spring Framework Documentation: [https://docs.spring.io/spring-framework/docs/current/reference/html/](https://docs.spring.io/spring-framework/docs/current/reference/html/)
-   Baeldung - Spring Boot Annotations: (通常可以在Baeldung网站上找到相关文章)
-    മറ്റ് 相关技术博客和教程
