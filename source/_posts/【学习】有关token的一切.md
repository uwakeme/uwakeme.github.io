---
title: 【学习】有关token的一切
tags:
  - JAVA
  - 后端
---
# 一、token概述
## （一）什么是token？
### 1、 在web领域
+ token翻译过来就是令牌的意思。
+ token是由服务器生成的一串字符串，在第一次登录成功后返回给前端，保存在浏览器或本地，在之后的请求中都会带上以供服务器校验。

### 2、 在人工智能领域
+ 在人工智能领域，尤其是自然语言处理(Natural Language Processing, NLP)中，token指的是**处理文本的最小单元或基本元素**。
+ 需要注意的是，token并不一定是一个字符，它可以是一个字符，一个词语，一个标点符号，比如：
  - 英文单词："hello", "world"
  - 中文字符："你", "好"
  - 标点符号：".", "!"
  - 特殊标记："[CLS]", "[SEP]"
+ 在大型语言模型（如GPT、BERT等）中，token是模型处理和生成文本的基本单位，也是计算模型容量和处理速度的基本单位。

## （二）token的分类
在Web应用中，token主要可以分为以下几类：

### 1. 会话Token（Session Token）
+ 传统的会话管理方式，服务器生成一个唯一标识符并存储在服务器的会话存储中。
+ 客户端通过Cookie或URL参数携带这个标识符。
+ 优点：实现简单，安全性较高。
+ 缺点：服务器需要存储会话信息，不利于分布式系统和水平扩展。

### 2. JWT（JSON Web Token）
+ 一种开放标准（RFC 7519），用于在各方之间安全地传输信息。
+ 由三部分组成：Header（头部）、Payload（负载）和Signature（签名）。
+ 优点：自包含（包含了所有用户所需要的信息），无需查询数据库，支持分布式系统。
+ 缺点：一旦签发无法撤销（除非设置较短的过期时间），payload部分仅做base64编码，敏感信息需要额外加密。

### 3. OAuth Token
+ 用于授权第三方应用访问用户资源的标准协议。
+ 包括访问令牌（Access Token）和刷新令牌（Refresh Token）。
+ 优点：安全性高，支持精细的权限控制，适用于跨应用场景。
+ 缺点：实现复杂，流程较多。

### 4. CSRF Token
+ 用于防止跨站请求伪造（CSRF）攻击的特殊令牌。
+ 通常嵌入在表单中或作为HTTP头部发送。
+ 优点：有效防止CSRF攻击。
+ 缺点：需要在每个请求中处理，增加了开发复杂度。

### 5. API Key
+ 用于识别API调用者身份的长字符串。
+ 通常在HTTP头部或URL参数中传递。
+ 优点：使用简单，适合服务器间通信。
+ 缺点：安全性较低，一旦泄露风险较大。

# 二、Token 的核心技术

## （一）Token的生成

### 1. 随机数生成
+ 使用密码学安全的随机数生成器（CSPRNG）生成高熵值的随机字符串。
+ 常见实现：Java的`SecureRandom`，Node.js的`crypto.randomBytes()`等。
+ 优点：简单易实现，安全性高。
+ 缺点：需要在服务端存储映射关系。

### 2. 哈希算法
+ 将用户信息与密钥结合后进行哈希运算。
+ 常用算法：SHA-256、HMAC等。
+ 优点：不可逆，安全性高。
+ 缺点：无法从哈希值中提取原始信息。

### 3. JWT签名
+ 使用密钥对Header和Payload进行签名。
+ 常用算法：HMAC、RSA、ECDSA等。
+ 优点：可验证完整性，防止篡改。
+ 缺点：签名算法的安全性依赖于密钥管理。

## （二）Token的存储

### 1. 客户端存储
+ 浏览器：localStorage、sessionStorage、Cookie。
+ 移动应用：SharedPreferences（Android）、Keychain（iOS）。
+ 注意事项：敏感Token不应存储在localStorage中，容易受到XSS攻击。

### 2. 服务端存储
+ 内存缓存：Redis、Memcached等。
+ 数据库：关系型数据库、NoSQL数据库。
+ 分布式系统考虑：集中式Token存储，支持水平扩展。

## （三）Token的传输

### 1. HTTP头部
+ 通常使用Authorization头部：`Authorization: Bearer <token>`。
+ 优点：符合RESTful API设计规范，与业务数据分离。
+ 缺点：需要前端正确设置头部。

### 2. 请求参数
+ 作为URL查询参数或表单数据传输。
+ 优点：实现简单，兼容性好。
+ 缺点：Token可能会被记录在服务器日志中，安全性较低。

### 3. Cookie
+ 自动随请求发送到服务器。
+ 优点：使用方便，可设置HttpOnly和Secure属性增强安全性。
+ 缺点：受同源策略限制，跨域请求需要额外配置。

# 三、Token 的安全问题与防御

## （一）常见安全威胁

### 1. Token泄露
+ 风险：未加密的通信、客户端存储不当、日志记录等导致Token泄露。
+ 防御措施：
  - 使用HTTPS加密传输。
  - 敏感Token使用HttpOnly和Secure的Cookie存储。
  - 避免将Token记录到日志中。

### 2. Token劫持
+ 风险：XSS攻击、中间人攻击等导致Token被劫持。
+ 防御措施：
  - 实施内容安全策略（CSP）防止XSS。
  - 使用HTTPS防止中间人攻击。
  - 绑定Token到用户IP或设备指纹。

### 3. CSRF攻击
+ 风险：攻击者诱导用户访问恶意网站，利用用户已有的认证信息发起请求。
+ 防御措施：
  - 使用CSRF Token。
  - 检查Referer头部。
  - 使用SameSite Cookie属性。

### 4. 重放攻击
+ 风险：攻击者截获有效Token后重复使用。
+ 防御措施：
  - 在Token中包含时间戳和nonce（一次性随机数）。
  - 服务端维护已使用的nonce列表。
  - 设置合理的Token有效期。

## （二）最佳安全实践

### 1. Token生命周期管理
+ 设置合理的过期时间（短期访问Token，长期刷新Token）。
+ 实现Token撤销机制（黑名单、版本控制等）。
+ 定期轮换密钥和刷新Token。

### 2. 多因素认证（MFA）
+ 结合Token与其他认证因素（如短信验证码、生物识别等）。
+ 敏感操作要求重新认证。

### 3. 权限粒度控制
+ 实现基于角色的访问控制（RBAC）或属性基础的访问控制（ABAC）。
+ Token中仅包含必要的权限信息。
+ 遵循最小权限原则。

### 4. 监控与审计
+ 记录Token的创建、使用和撤销。
+ 实施异常检测机制（如频繁的Token刷新、不同地理位置的访问等）。
+ 建立安全事件响应流程。

# 四、实际应用场景

## （一）Web应用认证

### 1. 单页应用（SPA）
+ 使用JWT实现无状态认证。
+ 前端存储Token，每次请求附带Token。
+ 适合与RESTful API配合使用。

### 2. 移动应用
+ 使用OAuth 2.0进行认证授权。
+ 安全存储Token（Keychain/KeyStore）。
+ 实现透明的Token刷新机制。

## （二）微服务架构

### 1. 服务间认证
+ 使用JWT或API Key进行服务间通信认证。
+ 实现服务网格（Service Mesh）进行统一的认证管理。

### 2. API网关
+ 集中式Token验证和转换。
+ 实现统一的访问控制策略。
+ 处理Token格式转换（如外部JWT转内部自定义Token）。

## （三）物联网（IoT）

### 1. 设备认证
+ 使用设备特定的Token进行身份验证。
+ 实现设备生命周期内的Token管理。

### 2. 有限资源环境
+ 优化Token大小和验证过程，适应资源受限的设备。
+ 考虑使用轻量级的认证协议。

## （四）跨域资源共享

### 1. 跨域API访问
+ 使用Token解决跨域认证问题。
+ 配合CORS（跨源资源共享）策略使用。

### 2. 第三方集成
+ 使用OAuth 2.0允许第三方应用访问用户资源。
+ 实现细粒度的权限控制和授权管理。

# 五、进阶内容

## （一）无Cookie认证

### 1. 优势
+ 避免Cookie相关的安全问题（如CSRF）。
+ 更好地支持跨域请求和移动应用。
+ 减少每次请求的数据量。

### 2. 实现方式
+ 使用Authorization头部传输Token。
+ 在前端JavaScript中管理Token存储和刷新。

## （二）JWT高级应用

### 1. 嵌套JWT
+ 将一个JWT嵌入另一个JWT的payload中。
+ 用于实现Token转换和委派认证。

### 2. 加密JWT
+ 使用JWE（JSON Web Encryption）对payload进行加密。
+ 保护敏感信息不被中间方获取。

### 3. 动态权限
+ 在JWT中包含细粒度的权限声明。
+ 实现基于上下文的动态权限控制。

## （三）分布式系统中的Token管理

### 1. 一致性挑战
+ Token撤销在分布式系统中的传播延迟。
+ 使用发布-订阅模式或分布式缓存解决一致性问题。

### 2. 扩展性考虑
+ 无状态Token（如JWT）减轻了服务器存储负担。
+ 使用Redis等分布式缓存存储Token元数据。

## （四）AI领域的Token优化

### 1. Token计数与优化
+ 理解不同模型的Token计算方式（如BPE、WordPiece等）。
+ 优化提示工程（Prompt Engineering）减少Token使用。

### 2. 多模态Token处理
+ 文本、图像、音频等不同模态的Token表示。
+ 跨模态Token对齐与融合技术。

### 3. Token压缩技术
+ 知识蒸馏减少所需Token数量。
+ 上下文压缩方法提高Token利用效率。

> [!NOTE] 参考文章
> 1. [5分钟彻底搞懂什么是token](https://blog.csdn.net/dongtuoc/article/details/135491455?ops_request_misc=%257B%2522request%255Fid%2522%253A%25221e369571857b86781ae8e57f0f8c32f8%2522%252C%2522scm%2522%253A%252220140713.130102334..%2522%257D&request_id=1e369571857b86781ae8e57f0f8c32f8&biz_id=0&utm_medium=distribute.pc_search_result.none-task-blog-2~all~top_positive~default-1-135491455-null-null.142^v102^pc_search_result_base3&utm_term=token&spm=1018.2226.3001.4187)
> 2. [JSON Web Token 入门教程](http://www.ruanyifeng.com/blog/2018/07/json_web_token-tutorial.html)
> 3. [OAuth 2.0 的四种方式](http://www.ruanyifeng.com/blog/2019/04/oauth-grant-types.html)
> 4. [深入了解Token认证的来龙去脉](https://juejin.cn/post/6844903939570888711)
> 5. [大型语言模型中的Token计算与优化](https://zhuanlan.zhihu.com/p/611223883)
