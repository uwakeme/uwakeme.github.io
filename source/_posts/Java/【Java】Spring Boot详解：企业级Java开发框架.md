---
title: 【Java】Spring Boot详解：企业级Java开发框架
tags: 
    - 后端
    - Java
    - Spring Boot
    - 微服务
    - 框架
categories: Java
description: 深入解析Spring Boot框架，包括核心概念、自动配置、起步依赖、微服务开发、数据访问、安全认证等企业级Java开发的核心技术
date: 2025-07-05
---

# 引言

Spring Boot是由Pivotal团队提供的全新框架，其设计目的是用来简化Spring应用的初始搭建以及开发过程。它基于Spring框架，通过约定优于配置的理念，大大简化了Spring应用的配置工作，让开发者能够快速构建独立的、生产级别的Spring应用程序。

# 一、Spring Boot核心概念

## （一）设计理念

### 1. 约定优于配置（Convention over Configuration）
- **默认配置**：提供合理的默认配置，减少配置工作
- **标准化结构**：统一的项目结构和命名规范
- **自动装配**：基于类路径自动配置Bean

### 2. 开箱即用（Out of the Box）
- **内嵌服务器**：无需外部容器，直接运行
- **起步依赖**：简化依赖管理
- **生产就绪**：内置监控、健康检查等功能

### 3. 微服务友好
- **轻量级**：快速启动，资源占用少
- **独立部署**：每个服务独立运行
- **云原生**：支持容器化和云部署

## （二）核心特性

### 1. 自动配置（Auto Configuration）
```java
// Spring Boot自动配置示例
@SpringBootApplication
public class Application {
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}

// 自动配置类示例
@Configuration
@ConditionalOnClass(DataSource.class)
@EnableConfigurationProperties(DataSourceProperties.class)
public class DataSourceAutoConfiguration {
    
    @Bean
    @ConditionalOnMissingBean
    public DataSource dataSource(DataSourceProperties properties) {
        return DataSourceBuilder.create()
                .driverClassName(properties.getDriverClassName())
                .url(properties.getUrl())
                .username(properties.getUsername())
                .password(properties.getPassword())
                .build();
    }
}
```

### 2. 起步依赖（Starter Dependencies）
```xml
<!-- pom.xml 起步依赖示例 -->
<dependencies>
    <!-- Web开发起步依赖 -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    
    <!-- 数据访问起步依赖 -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-jpa</artifactId>
    </dependency>
    
    <!-- 安全起步依赖 -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-security</artifactId>
    </dependency>
    
    <!-- 测试起步依赖 -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-test</artifactId>
        <scope>test</scope>
    </dependency>
</dependencies>
```

### 3. 内嵌服务器
```java
// 自定义内嵌服务器配置
@Configuration
public class ServerConfiguration {
    
    @Bean
    public WebServerFactoryCustomizer<TomcatServletWebServerFactory> 
            tomcatCustomizer() {
        return factory -> {
            factory.setPort(8080);
            factory.setContextPath("/api");
            factory.addConnectorCustomizers(connector -> {
                connector.setMaxPostSize(10485760); // 10MB
            });
        };
    }
}

// application.yml 服务器配置
server:
  port: 8080
  servlet:
    context-path: /api
  tomcat:
    max-post-size: 10MB
    threads:
      max: 200
      min-spare: 10
```

# 二、项目结构与配置

## （一）标准项目结构

```
src/
├── main/
│   ├── java/
│   │   └── com/
│   │       └── example/
│   │           └── demo/
│   │               ├── DemoApplication.java          # 主启动类
│   │               ├── controller/                   # 控制器层
│   │               │   └── UserController.java
│   │               ├── service/                      # 服务层
│   │               │   ├── UserService.java
│   │               │   └── impl/
│   │               │       └── UserServiceImpl.java
│   │               ├── repository/                   # 数据访问层
│   │               │   └── UserRepository.java
│   │               ├── entity/                       # 实体类
│   │               │   └── User.java
│   │               ├── dto/                          # 数据传输对象
│   │               │   ├── UserDTO.java
│   │               │   └── CreateUserRequest.java
│   │               ├── config/                       # 配置类
│   │               │   ├── DatabaseConfig.java
│   │               │   └── SecurityConfig.java
│   │               └── exception/                    # 异常处理
│   │                   ├── GlobalExceptionHandler.java
│   │                   └── BusinessException.java
│   └── resources/
│       ├── application.yml                           # 主配置文件
│       ├── application-dev.yml                       # 开发环境配置
│       ├── application-prod.yml                      # 生产环境配置
│       ├── static/                                   # 静态资源
│       └── templates/                                # 模板文件
└── test/
    └── java/
        └── com/
            └── example/
                └── demo/
                    ├── DemoApplicationTests.java     # 集成测试
                    ├── controller/                   # 控制器测试
                    │   └── UserControllerTest.java
                    └── service/                      # 服务测试
                        └── UserServiceTest.java
```

## （二）配置文件详解

### 1. application.yml 主配置
```yaml
# 应用基本配置
spring:
  application:
    name: demo-application
  profiles:
    active: dev
  
  # 数据源配置
  datasource:
    url: jdbc:mysql://localhost:3306/demo?useUnicode=true&characterEncoding=utf8&useSSL=false&serverTimezone=UTC
    username: ${DB_USERNAME:root}
    password: ${DB_PASSWORD:password}
    driver-class-name: com.mysql.cj.jdbc.Driver
    hikari:
      maximum-pool-size: 20
      minimum-idle: 5
      connection-timeout: 30000
      idle-timeout: 600000
      max-lifetime: 1800000
  
  # JPA配置
  jpa:
    hibernate:
      ddl-auto: update
    show-sql: true
    properties:
      hibernate:
        dialect: org.hibernate.dialect.MySQL8Dialect
        format_sql: true
  
  # Redis配置
  redis:
    host: localhost
    port: 6379
    password: ${REDIS_PASSWORD:}
    timeout: 2000ms
    lettuce:
      pool:
        max-active: 8
        max-idle: 8
        min-idle: 0
        max-wait: -1ms
  
  # 缓存配置
  cache:
    type: redis
    redis:
      time-to-live: 600000

# 服务器配置
server:
  port: 8080
  servlet:
    context-path: /api
  compression:
    enabled: true
    mime-types: text/html,text/xml,text/plain,text/css,text/javascript,application/javascript,application/json
    min-response-size: 1024

# 日志配置
logging:
  level:
    com.example.demo: DEBUG
    org.springframework.web: DEBUG
    org.hibernate.SQL: DEBUG
    org.hibernate.type.descriptor.sql.BasicBinder: TRACE
  pattern:
    console: "%d{yyyy-MM-dd HH:mm:ss} [%thread] %-5level %logger{36} - %msg%n"
    file: "%d{yyyy-MM-dd HH:mm:ss} [%thread] %-5level %logger{36} - %msg%n"
  file:
    name: logs/application.log
    max-size: 10MB
    max-history: 30

# 管理端点配置
management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics,prometheus
  endpoint:
    health:
      show-details: always
  metrics:
    export:
      prometheus:
        enabled: true

# 自定义配置
app:
  jwt:
    secret: ${JWT_SECRET:mySecretKey}
    expiration: 86400000 # 24小时
  upload:
    path: ${UPLOAD_PATH:/tmp/uploads}
    max-file-size: 10MB
```

### 2. 环境特定配置
```yaml
# application-dev.yml 开发环境
spring:
  datasource:
    url: jdbc:h2:mem:testdb
    driver-class-name: org.h2.Driver
    username: sa
    password: 
  h2:
    console:
      enabled: true
  jpa:
    hibernate:
      ddl-auto: create-drop

logging:
  level:
    root: INFO
    com.example.demo: DEBUG

---
# application-prod.yml 生产环境
spring:
  datasource:
    url: jdbc:mysql://${DB_HOST}:${DB_PORT}/${DB_NAME}
    username: ${DB_USERNAME}
    password: ${DB_PASSWORD}
    hikari:
      maximum-pool-size: 50
  jpa:
    hibernate:
      ddl-auto: validate
    show-sql: false

logging:
  level:
    root: WARN
    com.example.demo: INFO
  file:
    name: /var/log/application.log

server:
  port: 80
```

# 三、Web开发

## （一）RESTful API开发

### 1. 实体类设计
```java
// User.java
package com.example.demo.entity;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import javax.persistence.*;
import javax.validation.constraints.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false, length = 50)
    @NotBlank(message = "用户名不能为空")
    @Size(min = 3, max = 50, message = "用户名长度必须在3-50之间")
    private String username;
    
    @Column(nullable = false, length = 100)
    @NotBlank(message = "邮箱不能为空")
    @Email(message = "邮箱格式不正确")
    private String email;
    
    @Column(name = "phone_number", length = 20)
    @Pattern(regexp = "^1[3-9]\\d{9}$", message = "手机号格式不正确")
    private String phoneNumber;
    
    @Column(name = "full_name", length = 100)
    private String fullName;
    
    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;
    
    @Column(name = "created_at")
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Order> orders;
    
    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
```

### 2. 数据传输对象（DTO）
```java
// UserDTO.java
package com.example.demo.dto;

import lombok.Data;
import lombok.Builder;
import com.fasterxml.jackson.annotation.JsonFormat;

import java.time.LocalDateTime;

@Data
@Builder
public class UserDTO {
    private Long id;
    private String username;
    private String email;
    private String phoneNumber;
    private String fullName;
    private Boolean isActive;
    
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdAt;
    
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime updatedAt;
}

// CreateUserRequest.java
package com.example.demo.dto;

import lombok.Data;
import javax.validation.constraints.*;

@Data
public class CreateUserRequest {
    
    @NotBlank(message = "用户名不能为空")
    @Size(min = 3, max = 50, message = "用户名长度必须在3-50之间")
    private String username;
    
    @NotBlank(message = "邮箱不能为空")
    @Email(message = "邮箱格式不正确")
    private String email;
    
    @Pattern(regexp = "^1[3-9]\\d{9}$", message = "手机号格式不正确")
    private String phoneNumber;
    
    private String fullName;
}

// UpdateUserRequest.java
package com.example.demo.dto;

import lombok.Data;
import javax.validation.constraints.*;

@Data
public class UpdateUserRequest {
    
    @Size(min = 3, max = 50, message = "用户名长度必须在3-50之间")
    private String username;
    
    @Email(message = "邮箱格式不正确")
    private String email;
    
    @Pattern(regexp = "^1[3-9]\\d{9}$", message = "手机号格式不正确")
    private String phoneNumber;
    
    private String fullName;
    
    private Boolean isActive;
}
```

### 3. 数据访问层
```java
// UserRepository.java
package com.example.demo.repository;

import com.example.demo.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    // 根据用户名查找用户
    Optional<User> findByUsername(String username);
    
    // 根据邮箱查找用户
    Optional<User> findByEmail(String email);
    
    // 查找活跃用户
    List<User> findByIsActiveTrue();
    
    // 分页查找活跃用户
    Page<User> findByIsActiveTrue(Pageable pageable);
    
    // 根据用户名模糊查询
    @Query("SELECT u FROM User u WHERE u.username LIKE %:username%")
    List<User> findByUsernameContaining(@Param("username") String username);
    
    // 查找指定时间段内创建的用户
    @Query("SELECT u FROM User u WHERE u.createdAt BETWEEN :startDate AND :endDate")
    List<User> findByCreatedAtBetween(
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate
    );
    
    // 统计活跃用户数量
    @Query("SELECT COUNT(u) FROM User u WHERE u.isActive = true")
    long countActiveUsers();
    
    // 检查用户名是否存在
    boolean existsByUsername(String username);
    
    // 检查邮箱是否存在
    boolean existsByEmail(String email);
}
```

### 4. 服务层
```java
// UserService.java
package com.example.demo.service;

import com.example.demo.dto.*;
import com.example.demo.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface UserService {
    
    // 创建用户
    UserDTO createUser(CreateUserRequest request);
    
    // 根据ID获取用户
    UserDTO getUserById(Long id);
    
    // 根据用户名获取用户
    UserDTO getUserByUsername(String username);
    
    // 获取所有用户
    List<UserDTO> getAllUsers();
    
    // 分页获取用户
    Page<UserDTO> getUsers(Pageable pageable);
    
    // 更新用户
    UserDTO updateUser(Long id, UpdateUserRequest request);
    
    // 删除用户
    void deleteUser(Long id);
    
    // 激活/禁用用户
    UserDTO toggleUserStatus(Long id);
    
    // 搜索用户
    List<UserDTO> searchUsers(String keyword);
}

// UserServiceImpl.java
package com.example.demo.service.impl;

import com.example.demo.dto.*;
import com.example.demo.entity.User;
import com.example.demo.exception.BusinessException;
import com.example.demo.repository.UserRepository;
import com.example.demo.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class UserServiceImpl implements UserService {
    
    private final UserRepository userRepository;
    
    @Override
    @Transactional
    public UserDTO createUser(CreateUserRequest request) {
        log.info("Creating user with username: {}", request.getUsername());
        
        // 检查用户名是否已存在
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new BusinessException("用户名已存在: " + request.getUsername());
        }
        
        // 检查邮箱是否已存在
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BusinessException("邮箱已存在: " + request.getEmail());
        }
        
        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .phoneNumber(request.getPhoneNumber())
                .fullName(request.getFullName())
                .build();
        
        User savedUser = userRepository.save(user);
        log.info("User created successfully with ID: {}", savedUser.getId());
        
        return convertToDTO(savedUser);
    }
    
    @Override
    @Cacheable(value = "users", key = "#id")
    public UserDTO getUserById(Long id) {
        log.debug("Getting user by ID: {}", id);
        
        User user = userRepository.findById(id)
                .orElseThrow(() -> new BusinessException("用户不存在: " + id));
        
        return convertToDTO(user);
    }
    
    @Override
    @Cacheable(value = "users", key = "#username")
    public UserDTO getUserByUsername(String username) {
        log.debug("Getting user by username: {}", username);
        
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new BusinessException("用户不存在: " + username));
        
        return convertToDTO(user);
    }
    
    @Override
    public List<UserDTO> getAllUsers() {
        log.debug("Getting all users");
        
        return userRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    public Page<UserDTO> getUsers(Pageable pageable) {
        log.debug("Getting users with pagination: {}", pageable);
        
        return userRepository.findAll(pageable)
                .map(this::convertToDTO);
    }
    
    @Override
    @Transactional
    @CacheEvict(value = "users", key = "#id")
    public UserDTO updateUser(Long id, UpdateUserRequest request) {
        log.info("Updating user with ID: {}", id);
        
        User user = userRepository.findById(id)
                .orElseThrow(() -> new BusinessException("用户不存在: " + id));
        
        // 检查用户名是否被其他用户使用
        if (request.getUsername() != null && 
            !request.getUsername().equals(user.getUsername()) &&
            userRepository.existsByUsername(request.getUsername())) {
            throw new BusinessException("用户名已存在: " + request.getUsername());
        }
        
        // 检查邮箱是否被其他用户使用
        if (request.getEmail() != null && 
            !request.getEmail().equals(user.getEmail()) &&
            userRepository.existsByEmail(request.getEmail())) {
            throw new BusinessException("邮箱已存在: " + request.getEmail());
        }
        
        // 更新用户信息
        if (request.getUsername() != null) {
            user.setUsername(request.getUsername());
        }
        if (request.getEmail() != null) {
            user.setEmail(request.getEmail());
        }
        if (request.getPhoneNumber() != null) {
            user.setPhoneNumber(request.getPhoneNumber());
        }
        if (request.getFullName() != null) {
            user.setFullName(request.getFullName());
        }
        if (request.getIsActive() != null) {
            user.setIsActive(request.getIsActive());
        }
        
        User updatedUser = userRepository.save(user);
        log.info("User updated successfully: {}", updatedUser.getId());
        
        return convertToDTO(updatedUser);
    }
    
    @Override
    @Transactional
    @CacheEvict(value = "users", key = "#id")
    public void deleteUser(Long id) {
        log.info("Deleting user with ID: {}", id);
        
        if (!userRepository.existsById(id)) {
            throw new BusinessException("用户不存在: " + id);
        }
        
        userRepository.deleteById(id);
        log.info("User deleted successfully: {}", id);
    }
    
    @Override
    @Transactional
    @CacheEvict(value = "users", key = "#id")
    public UserDTO toggleUserStatus(Long id) {
        log.info("Toggling user status for ID: {}", id);
        
        User user = userRepository.findById(id)
                .orElseThrow(() -> new BusinessException("用户不存在: " + id));
        
        user.setIsActive(!user.getIsActive());
        User updatedUser = userRepository.save(user);
        
        log.info("User status toggled: {} -> {}", id, updatedUser.getIsActive());
        return convertToDTO(updatedUser);
    }
    
    @Override
    public List<UserDTO> searchUsers(String keyword) {
        log.debug("Searching users with keyword: {}", keyword);
        
        return userRepository.findByUsernameContaining(keyword).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    private UserDTO convertToDTO(User user) {
        return UserDTO.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .phoneNumber(user.getPhoneNumber())
                .fullName(user.getFullName())
                .isActive(user.getIsActive())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }
}
```

### 5. 控制器层
```java
// UserController.java
package com.example.demo.controller;

import com.example.demo.dto.*;
import com.example.demo.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import javax.validation.constraints.Min;
import java.util.List;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@Slf4j
@Validated
@Tag(name = "用户管理", description = "用户相关的API接口")
public class UserController {
    
    private final UserService userService;
    
    @PostMapping
    @Operation(summary = "创建用户", description = "创建新的用户")
    public ResponseEntity<ApiResponse<UserDTO>> createUser(
            @Valid @RequestBody CreateUserRequest request) {
        log.info("Creating user: {}", request.getUsername());
        
        UserDTO user = userService.createUser(request);
        
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(user, "用户创建成功"));
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "获取用户", description = "根据ID获取用户信息")
    public ResponseEntity<ApiResponse<UserDTO>> getUserById(
            @Parameter(description = "用户ID") 
            @PathVariable @Min(1) Long id) {
        log.debug("Getting user by ID: {}", id);
        
        UserDTO user = userService.getUserById(id);
        
        return ResponseEntity.ok(ApiResponse.success(user));
    }
    
    @GetMapping
    @Operation(summary = "获取用户列表", description = "分页获取用户列表")
    public ResponseEntity<ApiResponse<Page<UserDTO>>> getUsers(
            @Parameter(description = "页码，从0开始") 
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @Parameter(description = "每页大小") 
            @RequestParam(defaultValue = "10") @Min(1) int size,
            @Parameter(description = "排序字段") 
            @RequestParam(defaultValue = "id") String sortBy,
            @Parameter(description = "排序方向") 
            @RequestParam(defaultValue = "asc") String sortDir) {
        
        log.debug("Getting users - page: {}, size: {}, sortBy: {}, sortDir: {}", 
                page, size, sortBy, sortDir);
        
        Sort sort = sortDir.equalsIgnoreCase("desc") ? 
                Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<UserDTO> users = userService.getUsers(pageable);
        
        return ResponseEntity.ok(ApiResponse.success(users));
    }
    
    @PutMapping("/{id}")
    @Operation(summary = "更新用户", description = "更新用户信息")
    public ResponseEntity<ApiResponse<UserDTO>> updateUser(
            @Parameter(description = "用户ID") 
            @PathVariable @Min(1) Long id,
            @Valid @RequestBody UpdateUserRequest request) {
        
        log.info("Updating user: {}", id);
        
        UserDTO user = userService.updateUser(id, request);
        
        return ResponseEntity.ok(ApiResponse.success(user, "用户更新成功"));
    }
    
    @DeleteMapping("/{id}")
    @Operation(summary = "删除用户", description = "删除指定用户")
    public ResponseEntity<ApiResponse<Void>> deleteUser(
            @Parameter(description = "用户ID") 
            @PathVariable @Min(1) Long id) {
        
        log.info("Deleting user: {}", id);
        
        userService.deleteUser(id);
        
        return ResponseEntity.ok(ApiResponse.success(null, "用户删除成功"));
    }
    
    @PatchMapping("/{id}/toggle-status")
    @Operation(summary = "切换用户状态", description = "激活或禁用用户")
    public ResponseEntity<ApiResponse<UserDTO>> toggleUserStatus(
            @Parameter(description = "用户ID") 
            @PathVariable @Min(1) Long id) {
        
        log.info("Toggling user status: {}", id);
        
        UserDTO user = userService.toggleUserStatus(id);
        
        return ResponseEntity.ok(ApiResponse.success(user, "用户状态更新成功"));
    }
    
    @GetMapping("/search")
    @Operation(summary = "搜索用户", description = "根据关键词搜索用户")
    public ResponseEntity<ApiResponse<List<UserDTO>>> searchUsers(
            @Parameter(description = "搜索关键词") 
            @RequestParam String keyword) {
        
        log.debug("Searching users with keyword: {}", keyword);
        
        List<UserDTO> users = userService.searchUsers(keyword);
        
        return ResponseEntity.ok(ApiResponse.success(users));
    }
}
```

### 6. 统一响应格式
```java
// ApiResponse.java
package com.example.demo.dto;

import lombok.Data;
import lombok.Builder;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonFormat;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ApiResponse<T> {
    
    private boolean success;
    private String message;
    private T data;
    private String errorCode;
    
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    @Builder.Default
    private LocalDateTime timestamp = LocalDateTime.now();
    
    public static <T> ApiResponse<T> success(T data) {
        return ApiResponse.<T>builder()
                .success(true)
                .data(data)
                .message("操作成功")
                .build();
    }
    
    public static <T> ApiResponse<T> success(T data, String message) {
        return ApiResponse.<T>builder()
                .success(true)
                .data(data)
                .message(message)
                .build();
    }
    
    public static <T> ApiResponse<T> error(String message) {
        return ApiResponse.<T>builder()
                .success(false)
                .message(message)
                .build();
    }
    
    public static <T> ApiResponse<T> error(String message, String errorCode) {
        return ApiResponse.<T>builder()
                .success(false)
                .message(message)
                .errorCode(errorCode)
                .build();
    }
}
```

# 四、数据访问与持久化

## （一）Spring Data JPA

### 1. 高级查询
```java
// 自定义Repository接口
package com.example.demo.repository;

import com.example.demo.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface UserRepository extends JpaRepository<User, Long>, 
        JpaSpecificationExecutor<User> {
    
    // 原生SQL查询
    @Query(value = "SELECT * FROM users u WHERE u.created_at >= :startDate", 
           nativeQuery = true)
    List<User> findUsersCreatedAfter(@Param("startDate") LocalDateTime startDate);
    
    // 批量更新
    @Modifying
    @Query("UPDATE User u SET u.isActive = :status WHERE u.id IN :ids")
    int updateUserStatus(@Param("ids") List<Long> ids, @Param("status") Boolean status);
    
    // 复杂查询
    @Query("SELECT u FROM User u WHERE " +
           "(:username IS NULL OR u.username LIKE %:username%) AND " +
           "(:email IS NULL OR u.email LIKE %:email%) AND " +
           "(:isActive IS NULL OR u.isActive = :isActive)")
    Page<User> findUsersWithFilters(
        @Param("username") String username,
        @Param("email") String email,
        @Param("isActive") Boolean isActive,
        Pageable pageable
    );
}

// 动态查询规范
package com.example.demo.specification;

import com.example.demo.entity.User;
import org.springframework.data.jpa.domain.Specification;

import javax.persistence.criteria.Predicate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class UserSpecification {
    
    public static Specification<User> withFilters(
            String username, String email, Boolean isActive, 
            LocalDateTime startDate, LocalDateTime endDate) {
        
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();
            
            if (username != null && !username.trim().isEmpty()) {
                predicates.add(criteriaBuilder.like(
                    criteriaBuilder.lower(root.get("username")),
                    "%" + username.toLowerCase() + "%"
                ));
            }
            
            if (email != null && !email.trim().isEmpty()) {
                predicates.add(criteriaBuilder.like(
                    criteriaBuilder.lower(root.get("email")),
                    "%" + email.toLowerCase() + "%"
                ));
            }
            
            if (isActive != null) {
                predicates.add(criteriaBuilder.equal(root.get("isActive"), isActive));
            }
            
            if (startDate != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(
                    root.get("createdAt"), startDate
                ));
            }
            
            if (endDate != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(
                    root.get("createdAt"), endDate
                ));
            }
            
            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }
}
```

### 2. 事务管理
```java
// 事务配置
package com.example.demo.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.orm.jpa.JpaTransactionManager;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.annotation.EnableTransactionManagement;

import javax.persistence.EntityManagerFactory;

@Configuration
@EnableTransactionManagement
public class TransactionConfig {
    
    @Bean
    public PlatformTransactionManager transactionManager(
            EntityManagerFactory entityManagerFactory) {
        return new JpaTransactionManager(entityManagerFactory);
    }
}

// 事务服务示例
package com.example.demo.service.impl;

import com.example.demo.entity.User;
import com.example.demo.entity.Order;
import com.example.demo.repository.UserRepository;
import com.example.demo.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class OrderService {
    
    private final UserRepository userRepository;
    private final OrderRepository orderRepository;
    
    @Transactional(
        propagation = Propagation.REQUIRED,
        isolation = Isolation.READ_COMMITTED,
        rollbackFor = Exception.class,
        timeout = 30
    )
    public Order createOrder(Long userId, OrderRequest request) {
        // 查找用户
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException("用户不存在"));
        
        // 创建订单
        Order order = Order.builder()
                .user(user)
                .amount(request.getAmount())
                .status(OrderStatus.PENDING)
                .build();
        
        // 保存订单
        Order savedOrder = orderRepository.save(order);
        
        // 发送通知（如果失败，整个事务回滚）
        notificationService.sendOrderNotification(savedOrder);
        
        return savedOrder;
    }
    
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void logOrderActivity(Long orderId, String activity) {
        // 独立事务，不受外部事务影响
        OrderLog log = OrderLog.builder()
                .orderId(orderId)
                .activity(activity)
                .timestamp(LocalDateTime.now())
                .build();
        
        orderLogRepository.save(log);
    }
}
```

## （二）多数据源配置

### 1. 多数据源配置
```java
// 数据源配置
package com.example.demo.config;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.orm.jpa.JpaTransactionManager;
import org.springframework.orm.jpa.LocalContainerEntityManagerFactoryBean;
import org.springframework.orm.jpa.vendor.HibernateJpaVendorAdapter;
import org.springframework.transaction.PlatformTransactionManager;

import javax.persistence.EntityManagerFactory;
import javax.sql.DataSource;
import java.util.Properties;

@Configuration
public class DatabaseConfig {
    
    // 主数据源
    @Primary
    @Bean(name = "primaryDataSource")
    @ConfigurationProperties(prefix = "spring.datasource.primary")
    public DataSource primaryDataSource() {
        return DataSourceBuilder.create().build();
    }
    
    // 从数据源
    @Bean(name = "secondaryDataSource")
    @ConfigurationProperties(prefix = "spring.datasource.secondary")
    public DataSource secondaryDataSource() {
        return DataSourceBuilder.create().build();
    }
    
    // 主EntityManagerFactory
    @Primary
    @Bean(name = "primaryEntityManagerFactory")
    public LocalContainerEntityManagerFactoryBean primaryEntityManagerFactory(
            @Qualifier("primaryDataSource") DataSource dataSource) {
        
        LocalContainerEntityManagerFactoryBean em = new LocalContainerEntityManagerFactoryBean();
        em.setDataSource(dataSource);
        em.setPackagesToScan("com.example.demo.entity.primary");
        
        HibernateJpaVendorAdapter vendorAdapter = new HibernateJpaVendorAdapter();
        em.setJpaVendorAdapter(vendorAdapter);
        
        Properties properties = new Properties();
        properties.setProperty("hibernate.hbm2ddl.auto", "update");
        properties.setProperty("hibernate.dialect", "org.hibernate.dialect.MySQL8Dialect");
        em.setJpaProperties(properties);
        
        return em;
    }
    
    // 从EntityManagerFactory
    @Bean(name = "secondaryEntityManagerFactory")
    public LocalContainerEntityManagerFactoryBean secondaryEntityManagerFactory(
            @Qualifier("secondaryDataSource") DataSource dataSource) {
        
        LocalContainerEntityManagerFactoryBean em = new LocalContainerEntityManagerFactoryBean();
        em.setDataSource(dataSource);
        em.setPackagesToScan("com.example.demo.entity.secondary");
        
        HibernateJpaVendorAdapter vendorAdapter = new HibernateJpaVendorAdapter();
        em.setJpaVendorAdapter(vendorAdapter);
        
        Properties properties = new Properties();
        properties.setProperty("hibernate.hbm2ddl.auto", "update");
        properties.setProperty("hibernate.dialect", "org.hibernate.dialect.MySQL8Dialect");
        em.setJpaProperties(properties);
        
        return em;
    }
    
    // 主事务管理器
    @Primary
    @Bean(name = "primaryTransactionManager")
    public PlatformTransactionManager primaryTransactionManager(
            @Qualifier("primaryEntityManagerFactory") EntityManagerFactory entityManagerFactory) {
        return new JpaTransactionManager(entityManagerFactory);
    }
    
    // 从事务管理器
    @Bean(name = "secondaryTransactionManager")
    public PlatformTransactionManager secondaryTransactionManager(
            @Qualifier("secondaryEntityManagerFactory") EntityManagerFactory entityManagerFactory) {
        return new JpaTransactionManager(entityManagerFactory);
    }
}

// 主数据源Repository配置
@Configuration
@EnableJpaRepositories(
    basePackages = "com.example.demo.repository.primary",
    entityManagerFactoryRef = "primaryEntityManagerFactory",
    transactionManagerRef = "primaryTransactionManager"
)
public class PrimaryDataSourceConfig {
}

// 从数据源Repository配置
@Configuration
@EnableJpaRepositories(
    basePackages = "com.example.demo.repository.secondary",
    entityManagerFactoryRef = "secondaryEntityManagerFactory",
    transactionManagerRef = "secondaryTransactionManager"
)
public class SecondaryDataSourceConfig {
}
```

### 2. 读写分离配置
```yaml
# application.yml 多数据源配置
spring:
  datasource:
    primary:
      url: jdbc:mysql://master-db:3306/demo
      username: ${DB_USERNAME}
      password: ${DB_PASSWORD}
      driver-class-name: com.mysql.cj.jdbc.Driver
      hikari:
        maximum-pool-size: 20
        minimum-idle: 5
    secondary:
      url: jdbc:mysql://slave-db:3306/demo
      username: ${DB_USERNAME}
      password: ${DB_PASSWORD}
      driver-class-name: com.mysql.cj.jdbc.Driver
      hikari:
        maximum-pool-size: 10
        minimum-idle: 2
```

# 五、安全与认证

## （一）Spring Security配置

### 1. 基础安全配置
```java
// SecurityConfig.java
package com.example.demo.config;

import com.example.demo.security.JwtAuthenticationEntryPoint;
import com.example.demo.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
@EnableGlobalMethodSecurity(prePostEnabled = true)
@RequiredArgsConstructor
public class SecurityConfig {
    
    private final JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;
    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
    
    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.cors().and().csrf().disable()
                .exceptionHandling()
                .authenticationEntryPoint(jwtAuthenticationEntryPoint)
                .and()
                .sessionManagement()
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                .and()
                .authorizeHttpRequests(authz -> authz
                    // 公开端点
                    .antMatchers("/api/v1/auth/**").permitAll()
                    .antMatchers("/api/v1/public/**").permitAll()
                    .antMatchers("/swagger-ui/**", "/v3/api-docs/**").permitAll()
                    .antMatchers("/actuator/health", "/actuator/info").permitAll()
                    
                    // 管理员端点
                    .antMatchers("/api/v1/admin/**").hasRole("ADMIN")
                    
                    // 用户端点
                    .antMatchers("/api/v1/users/**").hasAnyRole("USER", "ADMIN")
                    
                    // 其他端点需要认证
                    .anyRequest().authenticated()
                );
        
        http.addFilterBefore(jwtAuthenticationFilter, 
                UsernamePasswordAuthenticationFilter.class);
        
        return http.build();
    }
    
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(Arrays.asList("*"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
```

### 2. JWT认证实现
```java
// JwtUtil.java
package com.example.demo.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;

@Component
@Slf4j
public class JwtUtil {
    
    @Value("${app.jwt.secret}")
    private String jwtSecret;
    
    @Value("${app.jwt.expiration}")
    private int jwtExpirationMs;
    
    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(jwtSecret.getBytes());
    }
    
    public String generateJwtToken(Authentication authentication) {
        UserDetails userPrincipal = (UserDetails) authentication.getPrincipal();
        
        return Jwts.builder()
                .setSubject(userPrincipal.getUsername())
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + jwtExpirationMs))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }
    
    public String generateJwtToken(String username) {
        return Jwts.builder()
                .setSubject(username)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + jwtExpirationMs))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }
    
    public String getUsernameFromJwtToken(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getSubject();
    }
    
    public boolean validateJwtToken(String authToken) {
        try {
            Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(authToken);
            return true;
        } catch (SecurityException e) {
            log.error("Invalid JWT signature: {}", e.getMessage());
        } catch (MalformedJwtException e) {
            log.error("Invalid JWT token: {}", e.getMessage());
        } catch (ExpiredJwtException e) {
            log.error("JWT token is expired: {}", e.getMessage());
        } catch (UnsupportedJwtException e) {
            log.error("JWT token is unsupported: {}", e.getMessage());
        } catch (IllegalArgumentException e) {
            log.error("JWT claims string is empty: {}", e.getMessage());
        }
        return false;
    }
    
    public Date getExpirationDateFromJwtToken(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getExpiration();
    }
}

// JwtAuthenticationFilter.java
package com.example.demo.security;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

@Component
@RequiredArgsConstructor
@Slf4j
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    
    private final JwtUtil jwtUtil;
    private final UserDetailsService userDetailsService;
    
    @Override
    protected void doFilterInternal(HttpServletRequest request, 
                                  HttpServletResponse response, 
                                  FilterChain filterChain) 
            throws ServletException, IOException {
        
        try {
            String jwt = parseJwt(request);
            if (jwt != null && jwtUtil.validateJwtToken(jwt)) {
                String username = jwtUtil.getUsernameFromJwtToken(jwt);
                
                UserDetails userDetails = userDetailsService.loadUserByUsername(username);
                UsernamePasswordAuthenticationToken authentication = 
                        new UsernamePasswordAuthenticationToken(
                                userDetails, null, userDetails.getAuthorities());
                authentication.setDetails(
                        new WebAuthenticationDetailsSource().buildDetails(request));
                
                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        } catch (Exception e) {
            log.error("Cannot set user authentication: {}", e.getMessage());
        }
        
        filterChain.doFilter(request, response);
    }
    
    private String parseJwt(HttpServletRequest request) {
        String headerAuth = request.getHeader("Authorization");
        
        if (StringUtils.hasText(headerAuth) && headerAuth.startsWith("Bearer ")) {
            return headerAuth.substring(7);
        }
        
        return null;
    }
}
```

### 3. 认证控制器
```java
// AuthController.java
package com.example.demo.controller;

import com.example.demo.dto.*;
import com.example.demo.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {
    
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final UserService userService;
    
    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequest.getUsername(),
                            loginRequest.getPassword()));
            
            SecurityContextHolder.getContext().setAuthentication(authentication);
            String jwt = jwtUtil.generateJwtToken(authentication);
            
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            List<String> roles = userDetails.getAuthorities().stream()
                    .map(item -> item.getAuthority())
                    .collect(Collectors.toList());
            
            return ResponseEntity.ok(new JwtResponse(jwt,
                    userDetails.getUsername(),
                    roles));
        } catch (BadCredentialsException e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("用户名或密码错误"));
        }
    }
    
    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody SignupRequest signUpRequest) {
        if (userService.existsByUsername(signUpRequest.getUsername())) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("用户名已存在"));
        }
        
        if (userService.existsByEmail(signUpRequest.getEmail())) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("邮箱已被使用"));
        }
        
        // 创建新用户
        User user = new User(signUpRequest.getUsername(),
                signUpRequest.getEmail(),
                passwordEncoder.encode(signUpRequest.getPassword()));
        
        userService.save(user);
        
        return ResponseEntity.ok(new MessageResponse("用户注册成功"));
    }
    
    @PostMapping("/refresh")
    public ResponseEntity<?> refreshToken(@Valid @RequestBody TokenRefreshRequest request) {
        String requestRefreshToken = request.getRefreshToken();
        
        return refreshTokenService.findByToken(requestRefreshToken)
                .map(refreshTokenService::verifyExpiration)
                .map(RefreshToken::getUser)
                .map(user -> {
                    String token = jwtUtil.generateJwtToken(user.getUsername());
                    return ResponseEntity.ok(new TokenRefreshResponse(token, requestRefreshToken));
                })
                .orElseThrow(() -> new TokenRefreshException(requestRefreshToken,
                        "刷新令牌不在数据库中"));
    }
    
    @PostMapping("/logout")
    public ResponseEntity<?> logoutUser() {
        UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();
        
        refreshTokenService.deleteByUserId(userDetails.getUsername());
        
        return ResponseEntity.ok(new MessageResponse("注销成功"));
    }
}

// DTO类定义
@Data
@NoArgsConstructor
@AllArgsConstructor
class LoginRequest {
    @NotBlank
    private String username;
    
    @NotBlank
    private String password;
}

@Data
@NoArgsConstructor
@AllArgsConstructor
class SignupRequest {
    @NotBlank
    @Size(min = 3, max = 20)
    private String username;
    
    @NotBlank
    @Size(max = 50)
    @Email
    private String email;
    
    @NotBlank
    @Size(min = 6, max = 40)
    private String password;
}

@Data
@NoArgsConstructor
@AllArgsConstructor
class JwtResponse {
    private String token;
    private String type = "Bearer";
    private String username;
    private List<String> roles;
    
    public JwtResponse(String accessToken, String username, List<String> roles) {
        this.token = accessToken;
        this.username = username;
        this.roles = roles;
    }
}

@Data
@NoArgsConstructor
@AllArgsConstructor
class MessageResponse {
    private String message;
}

@Data
@NoArgsConstructor
@AllArgsConstructor
class TokenRefreshRequest {
    @NotBlank
    private String refreshToken;
}

@Data
@NoArgsConstructor
@AllArgsConstructor
class TokenRefreshResponse {
    private String accessToken;
    private String refreshToken;
    private String tokenType = "Bearer";
    
    public TokenRefreshResponse(String accessToken, String refreshToken) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
    }
}
```

## （四）用户详情服务

```java
// UserDetailsServiceImpl.java
package com.example.demo.security;

import com.example.demo.entity.User;
import com.example.demo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {
    
    private final UserRepository userRepository;
    
    @Override
    @Transactional
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException(
                        "用户不存在: " + username));
        
        return UserPrincipal.create(user);
    }
}

// UserPrincipal.java
package com.example.demo.security;

import com.example.demo.entity.User;
import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserPrincipal implements UserDetails {
    
    private Long id;
    private String username;
    private String email;
    
    @JsonIgnore
    private String password;
    
    private Collection<? extends GrantedAuthority> authorities;
    
    public static UserPrincipal create(User user) {
        List<GrantedAuthority> authorities = user.getRoles().stream()
                .map(role -> new SimpleGrantedAuthority("ROLE_" + role.getName().name()))
                .collect(Collectors.toList());
        
        return new UserPrincipal(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getPassword(),
                authorities
        );
    }
    
    @Override
    public boolean isAccountNonExpired() {
        return true;
    }
    
    @Override
    public boolean isAccountNonLocked() {
        return true;
    }
    
    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }
    
    @Override
    public boolean isEnabled() {
        return true;
    }
    
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        UserPrincipal that = (UserPrincipal) o;
        return Objects.equals(id, that.id);
    }
    
    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}
```

# 十、微服务架构

## （一）Spring Cloud集成

### 1. 服务注册与发现
```java
// 添加依赖
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-netflix-eureka-client</artifactId>
</dependency>

// 启用服务发现
@SpringBootApplication
@EnableEurekaClient
public class Application {
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}

// 配置文件
spring:
  application:
    name: user-service
eureka:
  client:
    service-url:
      defaultZone: http://localhost:8761/eureka/
  instance:
    prefer-ip-address: true
```

### 2. 服务间通信
```java
// Feign客户端
@FeignClient(name = "order-service")
public interface OrderServiceClient {
    
    @GetMapping("/api/orders/user/{userId}")
    List<Order> getOrdersByUserId(@PathVariable("userId") Long userId);
    
    @PostMapping("/api/orders")
    Order createOrder(@RequestBody CreateOrderRequest request);
}

// 使用Feign客户端
@Service
@RequiredArgsConstructor
public class UserOrderService {
    
    private final OrderServiceClient orderServiceClient;
    
    public List<Order> getUserOrders(Long userId) {
        return orderServiceClient.getOrdersByUserId(userId);
    }
}
```

## （二）配置中心

```yaml
# bootstrap.yml
spring:
  application:
    name: user-service
  cloud:
    config:
      uri: http://localhost:8888
      profile: dev
      label: master
```

## （三）API网关

```java
// Gateway配置
@Configuration
public class GatewayConfig {
    
    @Bean
    public RouteLocator customRouteLocator(RouteLocatorBuilder builder) {
        return builder.routes()
                .route("user-service", r -> r.path("/api/users/**")
                        .uri("lb://user-service"))
                .route("order-service", r -> r.path("/api/orders/**")
                        .uri("lb://order-service"))
                .build();
    }
}
```

# 十一、部署与运维

## （一）Docker容器化

### 1. Dockerfile
```dockerfile
# 多阶段构建
FROM maven:3.8.4-openjdk-17 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

FROM openjdk:17-jre-slim
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

### 2. Docker Compose
```yaml
# docker-compose.yml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "8080:8080"
    environment:
      - SPRING_PROFILES_ACTIVE=docker
      - SPRING_DATASOURCE_URL=jdbc:mysql://db:3306/demo
    depends_on:
      - db
      - redis
  
  db:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: root
      MYSQL_DATABASE: demo
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql
  
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  mysql_data:
```

## （二）Kubernetes部署

### 1. Deployment配置
```yaml
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: spring-boot-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: spring-boot-app
  template:
    metadata:
      labels:
        app: spring-boot-app
    spec:
      containers:
      - name: app
        image: your-registry/spring-boot-app:latest
        ports:
        - containerPort: 8080
        env:
        - name: SPRING_PROFILES_ACTIVE
          value: "k8s"
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /actuator/health
            port: 8080
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /actuator/health/readiness
            port: 8080
          initialDelaySeconds: 5
          periodSeconds: 5
```

### 2. Service配置
```yaml
# service.yaml
apiVersion: v1
kind: Service
metadata:
  name: spring-boot-service
spec:
  selector:
    app: spring-boot-app
  ports:
  - protocol: TCP
    port: 80
    targetPort: 8080
  type: LoadBalancer
```

## （三）CI/CD流水线

### 1. GitHub Actions
```yaml
# .github/workflows/ci-cd.yml
name: CI/CD Pipeline

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    - name: Set up JDK 17
      uses: actions/setup-java@v3
      with:
        java-version: '17'
        distribution: 'temurin'
    - name: Run tests
      run: mvn test
  
  build-and-deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
    - uses: actions/checkout@v3
    - name: Set up JDK 17
      uses: actions/setup-java@v3
      with:
        java-version: '17'
        distribution: 'temurin'
    - name: Build with Maven
      run: mvn clean package
    - name: Build Docker image
      run: docker build -t ${{ secrets.DOCKER_REGISTRY }}/spring-boot-app:${{ github.sha }} .
    - name: Push to registry
      run: |
        echo ${{ secrets.DOCKER_PASSWORD }} | docker login -u ${{ secrets.DOCKER_USERNAME }} --password-stdin
        docker push ${{ secrets.DOCKER_REGISTRY }}/spring-boot-app:${{ github.sha }}
```

# 十二、性能优化

## （一）JVM调优

### 1. JVM参数配置
```bash
# 生产环境JVM参数
java -Xms2g -Xmx4g \
     -XX:+UseG1GC \
     -XX:MaxGCPauseMillis=200 \
     -XX:+HeapDumpOnOutOfMemoryError \
     -XX:HeapDumpPath=/logs/heapdump.hprof \
     -Dspring.profiles.active=prod \
     -jar app.jar
```

### 2. GC监控
```java
// GC监控配置
@Component
@Slf4j
public class GCMonitor {
    
    @EventListener
    public void handleGCEvent(GarbageCollectionNotificationInfo info) {
        GcInfo gcInfo = info.getGcInfo();
        log.info("GC occurred: {} - Duration: {}ms", 
                info.getGcName(), gcInfo.getDuration());
    }
}
```

## （二）数据库优化

### 1. 连接池配置
```yaml
spring:
  datasource:
    hikari:
      maximum-pool-size: 20
      minimum-idle: 5
      connection-timeout: 30000
      idle-timeout: 600000
      max-lifetime: 1800000
      leak-detection-threshold: 60000
```

### 2. 查询优化
```java
// 分页查询优化
@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    @Query(value = "SELECT u FROM User u WHERE u.status = :status",
           countQuery = "SELECT count(u) FROM User u WHERE u.status = :status")
    Page<User> findByStatus(@Param("status") String status, Pageable pageable);
    
    // 使用索引优化查询
    @Query("SELECT u FROM User u WHERE u.email = :email")
    Optional<User> findByEmailOptimized(@Param("email") String email);
}
```

## （三）缓存策略

### 1. 多级缓存
```java
// L1缓存：本地缓存
@Service
public class UserCacheService {
    
    private final Cache<String, User> localCache = Caffeine.newBuilder()
            .maximumSize(1000)
            .expireAfterWrite(Duration.ofMinutes(10))
            .build();
    
    // L2缓存：Redis
    @Cacheable(value = "users", key = "#id")
    public User getUserById(Long id) {
        return userRepository.findById(id).orElse(null);
    }
}
```

# 十三、监控与日志

## （一）应用监控

### 1. Micrometer集成
```java
// 自定义指标
@Component
public class CustomMetrics {
    
    private final Counter userRegistrationCounter;
    private final Timer userLoginTimer;
    
    public CustomMetrics(MeterRegistry meterRegistry) {
        this.userRegistrationCounter = Counter.builder("user.registration")
                .description("用户注册计数")
                .register(meterRegistry);
        
        this.userLoginTimer = Timer.builder("user.login.duration")
                .description("用户登录耗时")
                .register(meterRegistry);
    }
    
    public void incrementUserRegistration() {
        userRegistrationCounter.increment();
    }
    
    public Timer.Sample startLoginTimer() {
        return Timer.start();
    }
}
```

### 2. 健康检查
```java
// 自定义健康检查
@Component
public class DatabaseHealthIndicator implements HealthIndicator {
    
    @Autowired
    private DataSource dataSource;
    
    @Override
    public Health health() {
        try (Connection connection = dataSource.getConnection()) {
            if (connection.isValid(1)) {
                return Health.up()
                        .withDetail("database", "Available")
                        .build();
            }
        } catch (Exception e) {
            return Health.down()
                    .withDetail("database", "Unavailable")
                    .withException(e)
                    .build();
        }
        return Health.down().build();
    }
}
```

## （二）日志管理

### 1. 结构化日志
```java
// 使用结构化日志
@Slf4j
@RestController
public class UserController {
    
    @PostMapping("/users")
    public ResponseEntity<User> createUser(@RequestBody User user) {
        MDC.put("operation", "createUser");
        MDC.put("userId", user.getId().toString());
        
        try {
            User savedUser = userService.save(user);
            log.info("User created successfully");
            return ResponseEntity.ok(savedUser);
        } catch (Exception e) {
            log.error("Failed to create user", e);
            throw e;
        } finally {
            MDC.clear();
        }
    }
}
```

### 2. 日志配置
```xml
<!-- logback-spring.xml -->
<configuration>
    <springProfile name="!prod">
        <appender name="CONSOLE" class="ch.qos.logback.core.ConsoleAppender">
            <encoder>
                <pattern>%d{HH:mm:ss.SSS} [%thread] %-5level %logger{36} - %msg%n</pattern>
            </encoder>
        </appender>
        <root level="INFO">
            <appender-ref ref="CONSOLE"/>
        </root>
    </springProfile>
    
    <springProfile name="prod">
        <appender name="FILE" class="ch.qos.logback.core.rolling.RollingFileAppender">
            <file>logs/application.log</file>
            <rollingPolicy class="ch.qos.logback.core.rolling.TimeBasedRollingPolicy">
                <fileNamePattern>logs/application.%d{yyyy-MM-dd}.%i.gz</fileNamePattern>
                <maxFileSize>100MB</maxFileSize>
                <maxHistory>30</maxHistory>
                <totalSizeCap>3GB</totalSizeCap>
            </rollingPolicy>
            <encoder class="net.logstash.logback.encoder.LoggingEventCompositeJsonEncoder">
                <providers>
                    <timestamp/>
                    <logLevel/>
                    <loggerName/>
                    <message/>
                    <mdc/>
                    <stackTrace/>
                </providers>
            </encoder>
        </appender>
        <root level="INFO">
            <appender-ref ref="FILE"/>
        </root>
    </springProfile>
</configuration>
```

# 总结

Spring Boot作为现代Java企业级应用开发的首选框架，具有以下核心优势：

## 核心优势

1. **开箱即用**：提供大量自动配置，减少样板代码
2. **生产就绪**：内置监控、健康检查、指标收集等功能
3. **微服务友好**：与Spring Cloud无缝集成
4. **社区活跃**：丰富的第三方集成和社区支持
5. **测试友好**：提供完善的测试支持和工具

## 适用场景

- **企业级Web应用**：复杂的业务逻辑和数据处理
- **微服务架构**：分布式系统和服务治理
- **RESTful API**：后端服务和接口开发
- **数据处理应用**：批处理和流处理
- **云原生应用**：容器化和Kubernetes部署

## 最佳实践

1. **遵循约定优于配置**：使用Spring Boot的默认配置
2. **合理使用自动配置**：理解自动配置原理，必要时自定义
3. **分层架构设计**：Controller、Service、Repository分离
4. **异常处理统一**：使用全局异常处理器
5. **安全第一**：实施适当的安全措施
6. **性能监控**：集成监控和日志系统
7. **测试驱动**：编写全面的单元测试和集成测试

Spring Boot为Java开发者提供了一个强大、灵活且易于使用的开发平台，是构建现代企业级应用的理想选择。通过合理运用其特性和最佳实践，可以显著提高开发效率和应用质量。