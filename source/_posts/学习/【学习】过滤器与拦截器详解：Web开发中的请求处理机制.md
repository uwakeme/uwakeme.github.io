---
title: 【学习】过滤器与拦截器详解：Web开发中的请求处理机制
categories: 学习
tags:
  - Java
  - Spring
  - Web开发
  - 后端
  - 过滤器
  - 拦截器
---

# 前言

在Web开发中，过滤器（Filter）和拦截器（Interceptor）是两个重要的概念，它们都可以在请求处理过程中进行拦截和处理，但在实现机制、作用范围和使用场景上存在显著差异。本文将详细介绍过滤器和拦截器的概念、区别、应用场景以及具体的实现方式，帮助开发者更好地理解和使用这两种技术。

# 一、过滤器（Filter）详解

## （一）过滤器的基本概念

过滤器是Java Servlet规范中定义的组件，它可以在请求到达Servlet之前或响应离开Servlet之后对请求和响应进行预处理和后处理。过滤器基于函数回调机制，是面向切面编程（AOP）思想的体现。

### 1. 过滤器的特点

- **基于Servlet规范**：过滤器是Servlet容器提供的功能
- **作用于整个Web应用**：可以拦截所有进入应用的请求
- **链式调用**：多个过滤器可以形成过滤器链
- **容器级别**：在Servlet容器层面工作

### 2. 过滤器的生命周期

```java
public interface Filter {
    // 初始化方法，容器启动时调用
    void init(FilterConfig filterConfig) throws ServletException;
    
    // 过滤方法，每次请求时调用
    void doFilter(ServletRequest request, ServletResponse response, 
                  FilterChain chain) throws IOException, ServletException;
    
    // 销毁方法，容器关闭时调用
    void destroy();
}
```

## （二）过滤器的实现方式

### 1. 传统Servlet方式实现

```java
// 字符编码过滤器示例
@WebFilter(urlPatterns = "/*", filterName = "encodingFilter")
public class EncodingFilter implements Filter {
    
    private String encoding = "UTF-8";
    
    @Override
    public void init(FilterConfig filterConfig) throws ServletException {
        // 从配置中获取编码格式
        String configEncoding = filterConfig.getInitParameter("encoding");
        if (configEncoding != null && !configEncoding.isEmpty()) {
            this.encoding = configEncoding;
        }
        System.out.println("EncodingFilter初始化，编码格式: " + encoding);
    }
    
    @Override
    public void doFilter(ServletRequest request, ServletResponse response, 
                        FilterChain chain) throws IOException, ServletException {
        
        System.out.println("EncodingFilter - 请求前处理");
        
        // 设置请求和响应的字符编码
        request.setCharacterEncoding(encoding);
        response.setCharacterEncoding(encoding);
        response.setContentType("text/html;charset=" + encoding);
        
        // 继续执行过滤器链
        chain.doFilter(request, response);
        
        System.out.println("EncodingFilter - 响应后处理");
    }
    
    @Override
    public void destroy() {
        System.out.println("EncodingFilter销毁");
    }
}
```

### 2. Spring Boot方式实现

```java
// 日志记录过滤器
@Component
public class LoggingFilter implements Filter {
    
    private static final Logger logger = LoggerFactory.getLogger(LoggingFilter.class);
    
    @Override
    public void doFilter(ServletRequest request, ServletResponse response, 
                        FilterChain chain) throws IOException, ServletException {
        
        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpServletResponse httpResponse = (HttpServletResponse) response;
        
        // 记录请求信息
        String requestURI = httpRequest.getRequestURI();
        String method = httpRequest.getMethod();
        String remoteAddr = httpRequest.getRemoteAddr();
        
        long startTime = System.currentTimeMillis();
        
        logger.info("请求开始 - URI: {}, Method: {}, IP: {}", requestURI, method, remoteAddr);
        
        try {
            // 继续执行过滤器链
            chain.doFilter(request, response);
        } finally {
            long endTime = System.currentTimeMillis();
            long duration = endTime - startTime;
            
            logger.info("请求结束 - URI: {}, Status: {}, Duration: {}ms", 
                       requestURI, httpResponse.getStatus(), duration);
        }
    }
}

// 过滤器配置类
@Configuration
public class FilterConfig {
    
    @Bean
    public FilterRegistrationBean<LoggingFilter> loggingFilter() {
        FilterRegistrationBean<LoggingFilter> registrationBean = new FilterRegistrationBean<>();
        registrationBean.setFilter(new LoggingFilter());
        registrationBean.addUrlPatterns("/*");
        registrationBean.setOrder(1); // 设置过滤器执行顺序
        return registrationBean;
    }
    
    @Bean
    public FilterRegistrationBean<CorsFilter> corsFilter() {
        FilterRegistrationBean<CorsFilter> registrationBean = new FilterRegistrationBean<>();
        registrationBean.setFilter(new CorsFilter());
        registrationBean.addUrlPatterns("/*");
        registrationBean.setOrder(2);
        return registrationBean;
    }
}
```

### 3. 跨域处理过滤器

```java
// CORS跨域过滤器
@Component
public class CorsFilter implements Filter {
    
    @Override
    public void doFilter(ServletRequest request, ServletResponse response, 
                        FilterChain chain) throws IOException, ServletException {
        
        HttpServletResponse httpResponse = (HttpServletResponse) response;
        HttpServletRequest httpRequest = (HttpServletRequest) request;
        
        // 设置CORS响应头
        httpResponse.setHeader("Access-Control-Allow-Origin", "*");
        httpResponse.setHeader("Access-Control-Allow-Methods", 
                              "GET, POST, PUT, DELETE, OPTIONS");
        httpResponse.setHeader("Access-Control-Allow-Headers", 
                              "Content-Type, Authorization, X-Requested-With");
        httpResponse.setHeader("Access-Control-Max-Age", "3600");
        
        // 处理预检请求
        if ("OPTIONS".equalsIgnoreCase(httpRequest.getMethod())) {
            httpResponse.setStatus(HttpServletResponse.SC_OK);
            return;
        }
        
        chain.doFilter(request, response);
    }
}
```

## （三）过滤器的应用场景

1. **字符编码设置**：统一设置请求和响应的字符编码
2. **跨域处理**：处理CORS跨域请求
3. **请求日志记录**：记录请求的详细信息
4. **安全检查**：进行基础的安全验证
5. **请求参数预处理**：对请求参数进行统一处理
6. **响应数据压缩**：对响应数据进行压缩处理

# 二、拦截器（Interceptor）详解

## （一）拦截器的基本概念

拦截器是Spring框架提供的组件，它基于Java的反射机制和动态代理技术实现。拦截器主要用于拦截Controller的请求，可以在请求处理的不同阶段进行干预。

### 1. 拦截器的特点

- **基于Spring框架**：是Spring MVC的组件
- **作用于Controller层**：只能拦截进入Controller的请求
- **更细粒度的控制**：可以获取到Handler和ModelAndView
- **框架级别**：在Spring MVC框架层面工作

### 2. 拦截器的接口定义

```java
public interface HandlerInterceptor {
    
    // 在Controller方法执行前调用
    default boolean preHandle(HttpServletRequest request, HttpServletResponse response, 
                             Object handler) throws Exception {
        return true;
    }
    
    // 在Controller方法执行后，视图渲染前调用
    default void postHandle(HttpServletRequest request, HttpServletResponse response, 
                           Object handler, ModelAndView modelAndView) throws Exception {
    }
    
    // 在整个请求完成后调用
    default void afterCompletion(HttpServletRequest request, HttpServletResponse response, 
                                 Object handler, Exception ex) throws Exception {
    }
}
```

## （二）拦截器的实现方式

### 1. 基础拦截器实现

```java
// 登录验证拦截器
@Component
public class LoginInterceptor implements HandlerInterceptor {
    
    private static final Logger logger = LoggerFactory.getLogger(LoginInterceptor.class);
    
    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, 
                            Object handler) throws Exception {
        
        String requestURI = request.getRequestURI();
        logger.info("LoginInterceptor - 拦截请求: {}", requestURI);
        
        // 排除不需要登录验证的路径
        if (isExcludePath(requestURI)) {
            return true;
        }
        
        // 检查用户是否登录
        HttpSession session = request.getSession();
        Object user = session.getAttribute("user");
        
        if (user == null) {
            logger.warn("用户未登录，拒绝访问: {}", requestURI);
            
            // 判断是否为AJAX请求
            if (isAjaxRequest(request)) {
                response.setContentType("application/json;charset=UTF-8");
                response.getWriter().write("{\"code\":401,\"message\":\"未登录\"}");
            } else {
                response.sendRedirect("/login");
            }
            return false;
        }
        
        logger.info("用户已登录，允许访问: {}", requestURI);
        return true;
    }
    
    @Override
    public void postHandle(HttpServletRequest request, HttpServletResponse response, 
                          Object handler, ModelAndView modelAndView) throws Exception {
        
        if (modelAndView != null) {
            // 可以在这里添加通用的模型数据
            modelAndView.addObject("currentTime", new Date());
            logger.info("PostHandle - 添加通用模型数据");
        }
    }
    
    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, 
                               Object handler, Exception ex) throws Exception {
        
        if (ex != null) {
            logger.error("请求处理异常: {}", ex.getMessage(), ex);
        }
        
        logger.info("AfterCompletion - 请求处理完成: {}", request.getRequestURI());
    }
    
    /**
     * 判断是否为排除路径
     */
    private boolean isExcludePath(String requestURI) {
        String[] excludePaths = {"/login", "/register", "/static", "/css", "/js", "/images"};
        for (String path : excludePaths) {
            if (requestURI.startsWith(path)) {
                return true;
            }
        }
        return false;
    }
    
    /**
     * 判断是否为AJAX请求
     */
    private boolean isAjaxRequest(HttpServletRequest request) {
        String requestedWith = request.getHeader("X-Requested-With");
        return "XMLHttpRequest".equals(requestedWith);
    }
}
```

### 2. 权限验证拦截器

```java
// 权限验证拦截器
@Component
public class AuthorityInterceptor implements HandlerInterceptor {
    
    private static final Logger logger = LoggerFactory.getLogger(AuthorityInterceptor.class);
    
    @Autowired
    private UserService userService;
    
    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, 
                            Object handler) throws Exception {
        
        // 只处理Controller方法
        if (!(handler instanceof HandlerMethod)) {
            return true;
        }
        
        HandlerMethod handlerMethod = (HandlerMethod) handler;
        
        // 检查方法是否需要权限验证
        RequirePermission requirePermission = handlerMethod.getMethodAnnotation(RequirePermission.class);
        if (requirePermission == null) {
            // 检查类级别的注解
            requirePermission = handlerMethod.getBeanType().getAnnotation(RequirePermission.class);
        }
        
        if (requirePermission == null) {
            return true; // 不需要权限验证
        }
        
        // 获取当前用户
        HttpSession session = request.getSession();
        User currentUser = (User) session.getAttribute("user");
        
        if (currentUser == null) {
            logger.warn("用户未登录，拒绝访问");
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "未登录");
            return false;
        }
        
        // 检查用户权限
        String[] requiredPermissions = requirePermission.value();
        boolean hasPermission = userService.hasAnyPermission(currentUser.getId(), requiredPermissions);
        
        if (!hasPermission) {
            logger.warn("用户 {} 没有访问权限: {}", currentUser.getUsername(), 
                       Arrays.toString(requiredPermissions));
            response.sendError(HttpServletResponse.SC_FORBIDDEN, "权限不足");
            return false;
        }
        
        logger.info("用户 {} 权限验证通过", currentUser.getUsername());
        return true;
    }
}

// 权限注解
@Target({ElementType.METHOD, ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
public @interface RequirePermission {
    String[] value();
}
```

### 3. 性能监控拦截器

```java
// 性能监控拦截器
@Component
public class PerformanceInterceptor implements HandlerInterceptor {
    
    private static final Logger logger = LoggerFactory.getLogger(PerformanceInterceptor.class);
    private static final String START_TIME_ATTRIBUTE = "startTime";
    
    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, 
                            Object handler) throws Exception {
        
        long startTime = System.currentTimeMillis();
        request.setAttribute(START_TIME_ATTRIBUTE, startTime);
        
        if (handler instanceof HandlerMethod) {
            HandlerMethod handlerMethod = (HandlerMethod) handler;
            String className = handlerMethod.getBeanType().getSimpleName();
            String methodName = handlerMethod.getMethod().getName();
            
            logger.info("开始执行: {}.{}", className, methodName);
        }
        
        return true;
    }
    
    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, 
                               Object handler, Exception ex) throws Exception {
        
        Long startTime = (Long) request.getAttribute(START_TIME_ATTRIBUTE);
        if (startTime != null) {
            long endTime = System.currentTimeMillis();
            long duration = endTime - startTime;
            
            if (handler instanceof HandlerMethod) {
                HandlerMethod handlerMethod = (HandlerMethod) handler;
                String className = handlerMethod.getBeanType().getSimpleName();
                String methodName = handlerMethod.getMethod().getName();
                
                logger.info("执行完成: {}.{}, 耗时: {}ms", className, methodName, duration);
                
                // 如果执行时间过长，记录警告
                if (duration > 1000) {
                    logger.warn("慢请求警告: {}.{}, 耗时: {}ms", className, methodName, duration);
                }
            }
        }
    }
}
```

### 4. 拦截器配置

```java
// 拦截器配置类
@Configuration
public class InterceptorConfig implements WebMvcConfigurer {
    
    @Autowired
    private LoginInterceptor loginInterceptor;
    
    @Autowired
    private AuthorityInterceptor authorityInterceptor;
    
    @Autowired
    private PerformanceInterceptor performanceInterceptor;
    
    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        
        // 性能监控拦截器 - 最高优先级
        registry.addInterceptor(performanceInterceptor)
                .addPathPatterns("/**")
                .order(1);
        
        // 登录验证拦截器
        registry.addInterceptor(loginInterceptor)
                .addPathPatterns("/**")
                .excludePathPatterns("/login", "/register", "/static/**", "/error")
                .order(2);
        
        // 权限验证拦截器
        registry.addInterceptor(authorityInterceptor)
                .addPathPatterns("/**")
                .excludePathPatterns("/login", "/register", "/static/**", "/error")
                .order(3);
    }
}
```

## （三）拦截器的应用场景

1. **登录验证**：检查用户是否已登录
2. **权限控制**：验证用户是否有访问特定资源的权限
3. **性能监控**：监控Controller方法的执行时间
4. **操作日志**：记录用户的操作行为
5. **参数验证**：对请求参数进行统一验证
6. **国际化处理**：根据用户设置切换语言

# 三、过滤器与拦截器的对比

## （一）主要区别

| 特性 | 过滤器（Filter） | 拦截器（Interceptor） |
|------|------------------|----------------------|
| **实现基础** | Servlet规范 | Spring框架 |
| **作用范围** | 整个Web应用 | Spring MVC的Controller |
| **执行时机** | Servlet容器级别 | Spring框架级别 |
| **配置方式** | web.xml或@WebFilter | 实现WebMvcConfigurer |
| **获取Spring Bean** | 需要特殊处理 | 可以直接注入 |
| **异常处理** | 无法捕获Controller异常 | 可以在afterCompletion中处理 |
| **执行顺序** | 在拦截器之前 | 在过滤器之后 |

## （二）执行流程对比

```
请求流程：
Client Request
    ↓
Filter1.doFilter() - 前置处理
    ↓
Filter2.doFilter() - 前置处理
    ↓
DispatcherServlet
    ↓
Interceptor1.preHandle()
    ↓
Interceptor2.preHandle()
    ↓
Controller.method()
    ↓
Interceptor2.postHandle()
    ↓
Interceptor1.postHandle()
    ↓
View Rendering
    ↓
Interceptor2.afterCompletion()
    ↓
Interceptor1.afterCompletion()
    ↓
Filter2.doFilter() - 后置处理
    ↓
Filter1.doFilter() - 后置处理
    ↓
Client Response
```

## （三）选择建议

### 1. 使用过滤器的场景

- **字符编码设置**：需要在整个请求处理过程中生效
- **跨域处理**：需要在Servlet容器级别处理
- **安全过滤**：如XSS防护、SQL注入防护
- **请求日志**：记录所有进入应用的请求
- **静态资源处理**：需要处理静态资源请求

### 2. 使用拦截器的场景

- **登录验证**：只需要验证Controller请求
- **权限控制**：基于注解的细粒度权限控制
- **操作日志**：记录用户的业务操作
- **性能监控**：监控Controller方法执行时间
- **数据预处理**：需要访问Spring容器中的Bean

# 四、实际应用案例

## （一）完整的Web应用安全架构

```java
// 1. 安全过滤器 - 处理基础安全
@Component
public class SecurityFilter implements Filter {
    
    @Override
    public void doFilter(ServletRequest request, ServletResponse response, 
                        FilterChain chain) throws IOException, ServletException {
        
        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpServletResponse httpResponse = (HttpServletResponse) response;
        
        // XSS防护
        XssHttpServletRequestWrapper xssRequest = new XssHttpServletRequestWrapper(httpRequest);
        
        // 设置安全响应头
        httpResponse.setHeader("X-Content-Type-Options", "nosniff");
        httpResponse.setHeader("X-Frame-Options", "DENY");
        httpResponse.setHeader("X-XSS-Protection", "1; mode=block");
        
        chain.doFilter(xssRequest, response);
    }
}

// 2. 登录拦截器 - 处理用户认证
@Component
public class AuthenticationInterceptor implements HandlerInterceptor {
    
    @Autowired
    private TokenService tokenService;
    
    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, 
                            Object handler) throws Exception {
        
        // 获取token
        String token = request.getHeader("Authorization");
        if (token != null && token.startsWith("Bearer ")) {
            token = token.substring(7);
        }
        
        // 验证token
        if (token == null || !tokenService.validateToken(token)) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("{\"error\":\"Invalid token\"}");
            return false;
        }
        
        // 设置用户信息到请求上下文
        User user = tokenService.getUserFromToken(token);
        UserContext.setCurrentUser(user);
        
        return true;
    }
    
    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, 
                               Object handler, Exception ex) throws Exception {
        // 清理用户上下文
        UserContext.clear();
    }
}

// 3. 权限拦截器 - 处理用户授权
@Component
public class AuthorizationInterceptor implements HandlerInterceptor {
    
    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, 
                            Object handler) throws Exception {
        
        if (!(handler instanceof HandlerMethod)) {
            return true;
        }
        
        HandlerMethod handlerMethod = (HandlerMethod) handler;
        RequireRole requireRole = handlerMethod.getMethodAnnotation(RequireRole.class);
        
        if (requireRole != null) {
            User currentUser = UserContext.getCurrentUser();
            if (!hasRequiredRole(currentUser, requireRole.value())) {
                response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                response.getWriter().write("{\"error\":\"Access denied\"}");
                return false;
            }
        }
        
        return true;
    }
    
    private boolean hasRequiredRole(User user, String[] requiredRoles) {
        // 实现角色验证逻辑
        return Arrays.stream(requiredRoles)
                     .anyMatch(role -> user.getRoles().contains(role));
    }
}
```

## （二）API接口监控系统

```java
// API监控拦截器
@Component
public class ApiMonitorInterceptor implements HandlerInterceptor {
    
    @Autowired
    private ApiMonitorService apiMonitorService;
    
    private static final String API_MONITOR_KEY = "apiMonitor";
    
    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, 
                            Object handler) throws Exception {
        
        if (!(handler instanceof HandlerMethod)) {
            return true;
        }
        
        HandlerMethod handlerMethod = (HandlerMethod) handler;
        ApiMonitor apiMonitor = handlerMethod.getMethodAnnotation(ApiMonitor.class);
        
        if (apiMonitor != null) {
            ApiMonitorInfo monitorInfo = new ApiMonitorInfo();
            monitorInfo.setApiName(apiMonitor.value());
            monitorInfo.setStartTime(System.currentTimeMillis());
            monitorInfo.setRequestUri(request.getRequestURI());
            monitorInfo.setMethod(request.getMethod());
            monitorInfo.setUserAgent(request.getHeader("User-Agent"));
            monitorInfo.setClientIp(getClientIp(request));
            
            request.setAttribute(API_MONITOR_KEY, monitorInfo);
        }
        
        return true;
    }
    
    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, 
                               Object handler, Exception ex) throws Exception {
        
        ApiMonitorInfo monitorInfo = (ApiMonitorInfo) request.getAttribute(API_MONITOR_KEY);
        if (monitorInfo != null) {
            monitorInfo.setEndTime(System.currentTimeMillis());
            monitorInfo.setDuration(monitorInfo.getEndTime() - monitorInfo.getStartTime());
            monitorInfo.setStatusCode(response.getStatus());
            monitorInfo.setSuccess(ex == null && response.getStatus() < 400);
            
            if (ex != null) {
                monitorInfo.setErrorMessage(ex.getMessage());
            }
            
            // 异步保存监控数据
            apiMonitorService.saveMonitorInfo(monitorInfo);
        }
    }
    
    private String getClientIp(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("X-Real-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }
        return ip;
    }
}

// API监控注解
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface ApiMonitor {
    String value() default "";
}

// 监控信息实体
public class ApiMonitorInfo {
    private String apiName;
    private long startTime;
    private long endTime;
    private long duration;
    private String requestUri;
    private String method;
    private String userAgent;
    private String clientIp;
    private int statusCode;
    private boolean success;
    private String errorMessage;
    
    // getter和setter方法省略
}
```

# 五、最佳实践与注意事项

## （一）性能优化建议

### 1. 过滤器优化

```java
// 高效的过滤器实现
@Component
public class OptimizedFilter implements Filter {
    
    // 使用缓存避免重复计算
    private final Set<String> excludePaths = new HashSet<>(Arrays.asList(
        "/static", "/css", "/js", "/images", "/favicon.ico"
    ));
    
    @Override
    public void doFilter(ServletRequest request, ServletResponse response, 
                        FilterChain chain) throws IOException, ServletException {
        
        HttpServletRequest httpRequest = (HttpServletRequest) request;
        String requestURI = httpRequest.getRequestURI();
        
        // 快速排除静态资源
        if (isStaticResource(requestURI)) {
            chain.doFilter(request, response);
            return;
        }
        
        // 执行业务逻辑
        doBusinessLogic(httpRequest, (HttpServletResponse) response);
        
        chain.doFilter(request, response);
    }
    
    private boolean isStaticResource(String requestURI) {
        return excludePaths.stream().anyMatch(requestURI::startsWith);
    }
    
    private void doBusinessLogic(HttpServletRequest request, HttpServletResponse response) {
        // 业务逻辑实现
    }
}
```

### 2. 拦截器优化

```java
// 高效的拦截器实现
@Component
public class OptimizedInterceptor implements HandlerInterceptor {
    
    // 使用ThreadLocal缓存计算结果
    private static final ThreadLocal<Boolean> authCache = new ThreadLocal<>();
    
    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, 
                            Object handler) throws Exception {
        
        // 检查缓存
        Boolean cached = authCache.get();
        if (cached != null) {
            return cached;
        }
        
        // 执行验证逻辑
        boolean result = performAuthentication(request);
        
        // 缓存结果
        authCache.set(result);
        
        return result;
    }
    
    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, 
                               Object handler, Exception ex) throws Exception {
        // 清理ThreadLocal
        authCache.remove();
    }
    
    private boolean performAuthentication(HttpServletRequest request) {
        // 认证逻辑实现
        return true;
    }
}
```

## （二）异常处理

```java
// 全局异常处理拦截器
@Component
public class ExceptionHandlingInterceptor implements HandlerInterceptor {
    
    private static final Logger logger = LoggerFactory.getLogger(ExceptionHandlingInterceptor.class);
    
    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, 
                               Object handler, Exception ex) throws Exception {
        
        if (ex != null) {
            // 记录异常信息
            logger.error("请求处理异常 - URI: {}, Method: {}, Error: {}", 
                        request.getRequestURI(), request.getMethod(), ex.getMessage(), ex);
            
            // 根据异常类型进行不同处理
            if (ex instanceof AuthenticationException) {
                handleAuthenticationException(response, ex);
            } else if (ex instanceof AuthorizationException) {
                handleAuthorizationException(response, ex);
            } else {
                handleGenericException(response, ex);
            }
        }
    }
    
    private void handleAuthenticationException(HttpServletResponse response, Exception ex) 
            throws IOException {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("application/json;charset=UTF-8");
        response.getWriter().write("{\"error\":\"Authentication failed\"}");
    }
    
    private void handleAuthorizationException(HttpServletResponse response, Exception ex) 
            throws IOException {
        response.setStatus(HttpServletResponse.SC_FORBIDDEN);
        response.setContentType("application/json;charset=UTF-8");
        response.getWriter().write("{\"error\":\"Access denied\"}");
    }
    
    private void handleGenericException(HttpServletResponse response, Exception ex) 
            throws IOException {
        response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        response.setContentType("application/json;charset=UTF-8");
        response.getWriter().write("{\"error\":\"Internal server error\"}");
    }
}
```

## （三）注意事项

### 1. 执行顺序

- 过滤器的执行顺序由注册顺序决定
- 拦截器的执行顺序可以通过order属性控制
- preHandle按顺序执行，postHandle和afterCompletion按逆序执行

### 2. 异常处理

- 过滤器中的异常需要自行处理
- 拦截器可以在afterCompletion中处理Controller抛出的异常
- 建议使用全局异常处理器配合拦截器使用

### 3. 性能考虑

- 避免在过滤器和拦截器中执行耗时操作
- 合理使用缓存减少重复计算
- 及时清理ThreadLocal变量避免内存泄漏

### 4. 安全考虑

- 敏感信息不要在日志中输出
- 验证用户输入防止注入攻击
- 合理设置会话超时时间

# 六、总结

过滤器和拦截器是Web开发中重要的组件，它们各有特点和适用场景：

## （一）过滤器的优势

1. **作用范围广**：可以拦截所有进入应用的请求
2. **标准化**：基于Servlet规范，具有良好的兼容性
3. **执行时机早**：在Spring框架之前执行
4. **适合基础处理**：如编码设置、跨域处理等

## （二）拦截器的优势

1. **Spring集成**：可以方便地使用Spring的功能
2. **细粒度控制**：可以获取到具体的Handler信息
3. **灵活的执行时机**：提供三个执行时机的回调
4. **适合业务处理**：如权限验证、操作日志等

## （三）选择原则

- **通用性需求**：选择过滤器
- **业务相关需求**：选择拦截器
- **需要Spring支持**：选择拦截器
- **静态资源处理**：选择过滤器

在实际项目中，通常会同时使用过滤器和拦截器，形成完整的请求处理链，以满足不同层次的需求。合理使用这两种技术，可以让我们的Web应用更加健壮、安全和高效。

## 参考资料

1. [Oracle Java Servlet Specification](https://javaee.github.io/servlet-spec/)
2. [Spring Framework Reference Documentation](https://docs.spring.io/spring-framework/docs/current/reference/html/)
3. [Spring Boot Reference Guide](https://docs.spring.io/spring-boot/docs/current/reference/html/)
4. [Java Web开发实战](https://book.douban.com/subject/26738496/)
5. [Spring MVC官方文档](https://docs.spring.io/spring-framework/docs/current/reference/html/web.html)