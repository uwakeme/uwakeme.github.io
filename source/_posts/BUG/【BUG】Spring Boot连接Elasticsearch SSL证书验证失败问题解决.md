---
title: 【BUG】Spring Boot连接Elasticsearch SSL证书验证失败问题解决
categories: BUG
date: 2025-01-29 19:45:24
tags:
  - Spring Boot
  - Elasticsearch
  - SSL
  - 证书验证
  - Java
series:
cover: https://cdn.jsdelivr.net/gh/uwakeme/personal-image-repository/images/20250129194524.png
---

# 一、问题背景

在开发Spring Boot应用时，尝试连接Elasticsearch时遇到应用启动失败的问题。错误信息显示：

```
org.springframework.data.elasticsearch.UncategorizedElasticsearchException: 
java.util.concurrent.ExecutionException: javax.net.ssl.SSLHandshakeException: 
sun.security.validator.ValidatorException: PKIX path building failed: 
sun.security.provider.certpath.SunCertPathBuilderException: 
unable to find valid certification path to requested target
```

这是一个典型的**SSL证书验证失败**问题，导致应用无法建立与Elasticsearch的HTTPS连接。

# 二、错误信息分析

## （一）错误堆栈解读

从错误堆栈可以看出问题发生的完整链路：

1. **Bean创建失败**：`objSearchRepository` Bean创建时失败
2. **Elasticsearch连接失败**：初始化`SimpleElasticsearchRepository`时抛出异常
3. **SSL握手失败**：`SSLHandshakeException`表明SSL/TLS握手过程中出现问题
4. **证书路径构建失败**：`PKIX path building failed`表明Java无法构建有效的证书信任链
5. **找不到有效证书路径**：`unable to find valid certification path to requested target`表明JVM的信任库中找不到可以验证目标服务器证书的证书路径

## （二）问题发生的时机

错误发生在Spring Boot应用启动时，具体是在初始化Elasticsearch Repository时：

```
Error creating bean with name 'objSearchRepository' defined in 
com.roof.api.objSearch.repository.ObjSearchRepository defined in 
@EnableElasticsearchRepositories
```

这说明应用在启动时尝试连接Elasticsearch服务器，但由于SSL证书验证失败，导致连接无法建立。

# 三、问题原因分析

## （一）SSL证书验证机制

Java应用程序在建立HTTPS连接时，会执行以下验证步骤：

1. **证书链验证**：验证服务器提供的证书是否由受信任的CA（证书颁发机构）签发
2. **证书有效期验证**：检查证书是否在有效期内
3. **域名验证**：验证证书中的域名是否与访问的域名匹配
4. **证书撤销检查**：检查证书是否已被撤销

## （二）常见原因

导致SSL证书验证失败的常见原因包括：

### 1. 自签名证书

Elasticsearch使用了自签名证书，而不是由公共CA（如Let's Encrypt、DigiCert等）签发的证书。自签名证书不受JVM默认信任库信任。

### 2. 内部CA签发的证书

企业内网环境中，Elasticsearch可能使用内部CA签发的证书。这些证书不在JVM的默认信任库（`cacerts`）中。

### 3. 证书配置问题

- Elasticsearch的SSL/TLS配置不正确
- 证书文件路径错误
- 证书文件损坏或格式不正确

### 4. 开发环境配置

开发环境中，为了方便测试，可能使用了不规范的证书配置。

## （三）Java信任库机制

Java使用`cacerts`文件作为默认的信任库，位于：

- **Windows**：`%JAVA_HOME%\lib\security\cacerts`
- **Linux/Mac**：`$JAVA_HOME/lib/security/cacerts`

JVM只会信任存储在信任库中的CA证书。如果Elasticsearch使用的证书不是由这些CA签发的，就会导致验证失败。

# 四、解决方案

根据不同的使用场景，可以采用以下几种解决方案：

## 方案一：禁用SSL证书验证（仅适用于开发环境）

**⚠️ 警告：此方案仅适用于开发/测试环境，生产环境严禁使用！**

### 方法1：配置Elasticsearch客户端忽略SSL验证

在`application.yml`或`application.properties`中配置：

```yaml
spring:
  elasticsearch:
    uris: https://localhost:9200
    username: elastic
    password: your_password
    connection-timeout: 10s
    socket-timeout: 60s
    # 禁用SSL证书验证（仅开发环境）
    ssl:
      verification-mode: none
```

或者使用Java配置类：

```java
import org.springframework.context.annotation.Configuration;
import org.springframework.data.elasticsearch.client.ClientConfiguration;
import org.springframework.data.elasticsearch.client.elc.ElasticsearchConfiguration;
import org.springframework.data.elasticsearch.repository.config.EnableElasticsearchRepositories;

@Configuration
@EnableElasticsearchRepositories
public class ElasticsearchConfig extends ElasticsearchConfiguration {

    @Override
    public ClientConfiguration clientConfiguration() {
        return ClientConfiguration.builder()
                .connectedTo("localhost:9200")
                .usingSsl()
                .withBasicAuth("elastic", "your_password")
                // 禁用SSL证书验证
                .withHostnameVerifier((hostname, session) -> true)
                .build();
    }
}
```

### 方法2：自定义RestClient配置

```java
import org.apache.http.conn.ssl.NoopHostnameVerifier;
import org.apache.http.conn.ssl.SSLConnectionSocketFactory;
import org.apache.http.conn.ssl.TrustAllStrategy;
import org.apache.http.impl.nio.client.HttpAsyncClientBuilder;
import org.apache.http.ssl.SSLContextBuilder;
import org.elasticsearch.client.RestClient;
import org.elasticsearch.client.RestHighLevelClient;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import javax.net.ssl.SSLContext;

@Configuration
public class ElasticsearchConfig {

    @Bean
    public RestHighLevelClient elasticsearchClient() {
        try {
            // 创建信任所有证书的SSL上下文
            SSLContext sslContext = SSLContextBuilder
                    .create()
                    .loadTrustMaterial(new TrustAllStrategy())
                    .build();

            // 创建SSL连接socket工厂
            SSLConnectionSocketFactory socketFactory = new SSLConnectionSocketFactory(
                    sslContext,
                    NoopHostnameVerifier.INSTANCE
            );

            // 构建RestClient
            RestClient restClient = RestClient.builder(
                    new HttpHost("localhost", 9200, "https")
            )
            .setHttpClientConfigCallback((HttpAsyncClientBuilder httpClientBuilder) -> {
                return httpClientBuilder.setSSLContext(sslContext)
                        .setSSLHostnameVerifier(NoopHostnameVerifier.INSTANCE);
            })
            .build();

            return new RestHighLevelClient(restClient);
        } catch (Exception e) {
            throw new RuntimeException("Failed to create Elasticsearch client", e);
        }
    }
}
```

## 方案二：导入证书到JVM信任库（推荐用于生产环境）

这是生产环境的推荐方案，通过将Elasticsearch的证书导入到JVM信任库中，使其成为受信任的证书。

### 步骤1：导出Elasticsearch服务器证书

使用`openssl`命令导出证书：

```bash
# 导出证书（将localhost:9200替换为你的Elasticsearch地址）
echo | openssl s_client -connect localhost:9200 -servername localhost 2>/dev/null | \
openssl x509 -outform PEM > elasticsearch.crt
```

或者使用`keytool`命令：

```bash
# 导出证书到文件
keytool -printcert -rfc -sslserver localhost:9200 > elasticsearch.crt
```

### 步骤2：导入证书到JVM信任库

```bash
# 找到JAVA_HOME
echo %JAVA_HOME%  # Windows
echo $JAVA_HOME   # Linux/Mac

# 导入证书到信任库（默认密码：changeit）
keytool -importcert \
    -alias elasticsearch \
    -file elasticsearch.crt \
    -keystore "%JAVA_HOME%\lib\security\cacerts" \
    -storepass changeit \
    -noprompt
```

**注：java 1.8 的证书路径在：%JAVA_HOME%\jre\lib\security\cacerts，不同版本可能不同，请根据实际情况选择。**


**Windows PowerShell示例**：

```powershell
$JAVA_HOME = $env:JAVA_HOME
keytool -importcert -alias elasticsearch -file elasticsearch.crt -keystore "$JAVA_HOME\lib\security\cacerts" -storepass changeit -noprompt
```

**Linux/Mac示例**：

```bash
sudo keytool -importcert \
    -alias elasticsearch \
    -file elasticsearch.crt \
    -keystore "$JAVA_HOME/lib/security/cacerts" \
    -storepass changeit \
    -noprompt
```

### 步骤3：验证证书导入

```bash
# 查看信任库中的证书
keytool -list -keystore "%JAVA_HOME%\lib\security\cacerts" -storepass changeit | findstr elasticsearch
```

### 步骤4：重启应用

证书导入后，需要重启Spring Boot应用才能生效。

## 方案三：使用自定义信任库

如果不想修改JVM的默认信任库，可以创建自定义信任库并在应用中使用。

### 步骤1：创建自定义信任库

```bash
# 创建新的信任库
keytool -importcert \
    -alias elasticsearch \
    -file elasticsearch.crt \
    -keystore mytruststore.jks \
    -storepass mypassword \
    -noprompt
```

### 步骤2：配置应用使用自定义信任库

在应用启动时添加JVM参数：

```bash
java -Djavax.net.ssl.trustStore=path/to/mytruststore.jks \
     -Djavax.net.ssl.trustStorePassword=mypassword \
     -jar your-application.jar
```

或者在`application.properties`中配置（如果框架支持）：

```properties
# Spring Boot Elasticsearch配置
spring.elasticsearch.uris=https://localhost:9200
spring.elasticsearch.username=elastic
spring.elasticsearch.password=your_password

# 自定义信任库
server.ssl.trust-store=classpath:mytruststore.jks
server.ssl.trust-store-password=mypassword
```

## 方案四：配置Elasticsearch客户端使用指定证书

如果Elasticsearch提供了客户端证书文件，可以直接在配置中使用：

```java
import org.springframework.context.annotation.Configuration;
import org.springframework.data.elasticsearch.client.ClientConfiguration;
import org.springframework.data.elasticsearch.client.elc.ElasticsearchConfiguration;

import javax.net.ssl.SSLContext;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.security.KeyStore;
import java.security.cert.Certificate;
import java.security.cert.CertificateFactory;

@Configuration
public class ElasticsearchConfig extends ElasticsearchConfiguration {

    @Override
    public ClientConfiguration clientConfiguration() {
        try {
            // 加载证书文件
            CertificateFactory cf = CertificateFactory.getInstance("X.509");
            InputStream certInputStream = Files.newInputStream(
                Paths.get("path/to/elasticsearch.crt")
            );
            Certificate cert = cf.generateCertificate(certInputStream);

            // 创建信任库
            KeyStore trustStore = KeyStore.getInstance(KeyStore.getDefaultType());
            trustStore.load(null, null);
            trustStore.setCertificateEntry("elasticsearch", cert);

            // 创建SSL上下文
            SSLContext sslContext = SSLContexts.custom()
                    .loadTrustMaterial(trustStore, null)
                    .build();

            return ClientConfiguration.builder()
                    .connectedTo("localhost:9200")
                    .usingSsl(sslContext)
                    .withBasicAuth("elastic", "your_password")
                    .build();
        } catch (Exception e) {
            throw new RuntimeException("Failed to configure Elasticsearch client", e);
        }
    }
}
```

# 五、Spring Data Elasticsearch配置示例

## （一）使用ElasticsearchClient（推荐）

```java
import co.elastic.clients.elasticsearch.ElasticsearchClient;
import co.elastic.clients.json.jackson.JacksonJsonpMapper;
import co.elastic.clients.transport.ElasticsearchTransport;
import co.elastic.clients.transport.rest_client.RestClientTransport;
import org.apache.http.HttpHost;
import org.apache.http.auth.AuthScope;
import org.apache.http.auth.UsernamePasswordCredentials;
import org.apache.http.client.CredentialsProvider;
import org.apache.http.impl.client.BasicCredentialsProvider;
import org.apache.http.conn.ssl.NoopHostnameVerifier;
import org.apache.http.conn.ssl.SSLConnectionSocketFactory;
import org.apache.http.ssl.SSLContextBuilder;
import org.elasticsearch.client.RestClient;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import javax.net.ssl.SSLContext;

@Configuration
public class ElasticsearchConfig {

    @Bean
    public ElasticsearchClient elasticsearchClient() {
        try {
            // 创建SSL上下文（信任所有证书 - 仅开发环境）
            SSLContext sslContext = SSLContextBuilder
                    .create()
                    .loadTrustMaterial((chain, authType) -> true)
                    .build();

            // 创建凭证提供者
            CredentialsProvider credentialsProvider = new BasicCredentialsProvider();
            credentialsProvider.setCredentials(
                    AuthScope.ANY,
                    new UsernamePasswordCredentials("elastic", "your_password")
            );

            // 创建RestClient
            RestClient restClient = RestClient.builder(
                    new HttpHost("localhost", 9200, "https")
            )
            .setHttpClientConfigCallback(httpClientBuilder -> {
                return httpClientBuilder
                        .setDefaultCredentialsProvider(credentialsProvider)
                        .setSSLContext(sslContext)
                        .setSSLHostnameVerifier(NoopHostnameVerifier.INSTANCE);
            })
            .build();

            // 创建Transport
            ElasticsearchTransport transport = new RestClientTransport(
                    restClient,
                    new JacksonJsonpMapper()
            );

            return new ElasticsearchClient(transport);
        } catch (Exception e) {
            throw new RuntimeException("Failed to create Elasticsearch client", e);
        }
    }
}
```

## （二）使用RestHighLevelClient（已弃用，但仍可用）

```java
import org.elasticsearch.client.RestHighLevelClient;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.elasticsearch.config.AbstractElasticsearchConfiguration;

@Configuration
public class ElasticsearchConfig extends AbstractElasticsearchConfiguration {

    @Override
    @Bean
    public RestHighLevelClient elasticsearchClient() {
        // 配置代码同方案一中的示例
        // ...
        return restHighLevelClient;
    }
}
```

# 六、最佳实践建议

## （一）环境区分

1. **开发环境**：可以使用禁用SSL验证的方式，提高开发效率
2. **测试环境**：建议导入证书到信任库，模拟生产环境
3. **生产环境**：必须使用受信任的证书，严禁禁用SSL验证

## （二）证书管理

1. **使用公共CA签发的证书**：生产环境应使用Let's Encrypt、DigiCert等公共CA签发的证书
2. **定期更新证书**：确保证书在有效期内，及时更新即将过期的证书
3. **证书监控**：建立证书过期监控机制，避免因证书过期导致服务中断

## （三）安全性考虑

1. **不要在生产环境禁用SSL验证**：这会严重降低系统安全性
2. **保护信任库密码**：使用强密码保护信任库，不要使用默认密码
3. **限制证书访问权限**：确保证书文件的访问权限受到严格控制

## （四）配置管理

1. **使用配置文件**：将SSL相关配置放在配置文件中，便于管理
2. **环境变量**：敏感信息（如密码）应使用环境变量或配置中心管理
3. **配置验证**：在应用启动时验证SSL配置的正确性

# 七、故障排查步骤

当遇到SSL证书验证失败问题时，可以按以下步骤排查：

1. **检查Elasticsearch服务状态**
   ```bash
   curl -X GET "https://localhost:9200" -u elastic:your_password -k
   ```

2. **检查证书信息**
   ```bash
   openssl s_client -connect localhost:9200 -showcerts
   ```

3. **验证JVM信任库**
   ```bash
   keytool -list -keystore "%JAVA_HOME%\lib\security\cacerts" -storepass changeit
   ```

4. **检查应用配置**
   - 验证Elasticsearch连接地址是否正确
   - 验证用户名和密码是否正确
   - 检查SSL相关配置

5. **查看详细日志**
   - 启用SSL调试：`-Djavax.net.debug=ssl:handshake`
   - 查看Spring Boot启动日志
   - 查看Elasticsearch客户端日志

# 八、总结

Spring Boot连接Elasticsearch时的SSL证书验证失败问题，通常是由于Elasticsearch使用了自签名证书或内部CA签发的证书导致的。解决这个问题有多种方案：

1. **开发环境**：可以临时禁用SSL验证，但要注意安全性
2. **生产环境**：必须将证书导入JVM信任库或使用受信任的CA签发的证书
3. **最佳实践**：使用公共CA签发的证书，建立证书管理机制，确保系统安全性

通过合理配置SSL证书，可以确保Spring Boot应用与Elasticsearch之间的安全通信，同时保证系统的稳定性和安全性。

# 九、相关知识点

## （一）SSL/TLS协议

- **SSL（Secure Sockets Layer）**：安全套接字层协议
- **TLS（Transport Layer Security）**：传输层安全协议，SSL的后续版本
- **HTTPS**：基于TLS/SSL的HTTP协议，提供加密通信

## （二）PKI（Public Key Infrastructure）

- **CA（Certificate Authority）**：证书颁发机构
- **证书链**：由根CA、中间CA和终端证书组成的信任链
- **信任库**：存储受信任CA证书的存储库

## （三）Java安全机制

- **KeyStore**：Java密钥库，用于存储密钥和证书
- **TrustStore**：信任库，用于存储受信任的CA证书
- **SSLContext**：SSL上下文，用于创建SSL连接

## （四）Elasticsearch安全特性

- **X-Pack Security**：Elasticsearch的安全插件
- **TLS/SSL加密**：传输层加密
- **证书认证**：基于证书的身份验证
- **基本认证**：用户名密码认证

