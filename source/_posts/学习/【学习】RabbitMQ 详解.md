---
title: 【学习】RabbitMQ详解
categories: 学习
tags:
  - RabbitMQ
  - 消息队列
  - AMQP
  - 分布式系统
  - 中间件
---

# 前言

在现代分布式系统中，不同服务或应用之间的异步通信和解耦扮演着至关重要的角色。消息队列（Message Queue, MQ）作为实现这一目标的核心中间件，受到了广泛应用。RabbitMQ是一款开源的、实现了高级消息队列协议（AMQP）的消息代理软件，由Erlang语言开发，以其可靠性、灵活性、高可用性和丰富的功能特性而闻名。它能够有效地处理服务间的消息传递，实现应用的削峰填谷、异步处理和系统解耦。本笔记旨在详细介绍RabbitMQ的核心概念、工作机制、主要特性、安装配置及典型应用场景，帮助读者深入理解并能熟练运用RabbitMQ。

# 一、RabbitMQ核心概念

理解RabbitMQ的核心组件和术语是掌握其强大功能的基础。

## （一）生产者 (Producer)

生产者是发送消息的应用程序。它创建消息，然后将消息发布（publish）到交换机（Exchange）。生产者通常不直接将消息发送到队列，而是通过交换机来路由。

## （二）消费者 (Consumer)

消费者是接收消息的应用程序。它连接到RabbitMQ代理，并订阅（subscribe）一个或多个队列。当有消息到达其订阅的队列时，RabbitMQ会将消息推送给消费者，或者消费者主动从队列中拉取（pull）消息。

## （三）代理 (Broker)

代理是RabbitMQ服务的核心，通常指RabbitMQ服务器本身。它接收来自生产者的消息，并根据路由规则将消息转发给相应的队列，最终再由队列将消息传递给消费者。代理还负责处理连接、认证、授权、消息持久化、集群管理等功能。

## （四）交换机 (Exchange)

交换机是接收来自生产者的消息，并根据特定规则将消息路由到一个或多个队列的组件。交换机本身不存储消息。RabbitMQ有四种主要的交换机类型：

1.  **Direct Exchange（直接交换机）**：根据消息的路由键（Routing Key）完全匹配绑定键（Binding Key）来将消息路由到队列。
2.  **Fanout Exchange（扇形交换机）**：将接收到的所有消息广播到所有绑定到该交换机的队列，忽略路由键。
3.  **Topic Exchange（主题交换机）**：根据消息的路由键与绑定键之间的模式匹配（使用通配符 `*` 和 `#`）来路由消息。
4.  **Headers Exchange（头部交换机）**：不依赖路由键，而是根据消息头中的属性值进行匹配来路由消息。

## （五）队列 (Queue)

队列是RabbitMQ中存储消息的缓冲区。消息最终会从交换机路由到队列中，等待消费者处理。队列具有一些重要属性：

*   **名称 (Name)**：队列的唯一标识。
*   **持久化 (Durable)**：如果设置为true，即使RabbitMQ服务器重启，队列本身也会被保留下来。非持久化队列在服务器重启后会丢失。
*   **排他性 (Exclusive)**：如果设置为true，队列只能被创建它的连接所使用，并且当连接关闭时队列会被自动删除。
*   **自动删除 (Auto-delete)**：如果设置为true，当最后一个消费者取消订阅后，队列会被自动删除。

## （六）绑定 (Binding)

绑定是连接交换机和队列（或者交换机和交换机）之间的桥梁。它定义了交换机如何将消息路由到队列。绑定通常会包含一个绑定键（Binding Key），其作用取决于交换机的类型。

## （七）路由键 (Routing Key)

生产者在发送消息给交换机时，可以指定一个路由键。交换机会根据路由键和自身的类型，以及与队列的绑定关系，来决定消息的去向。

## （八）绑定键 (Binding Key)

在创建绑定时，用于将队列（或交换机）与交换机关联起来的字符串。其含义和匹配方式取决于交换机的类型。

## （九）消息 (Message)

消息是在生产者和消费者之间传递的数据单元。它通常由两部分组成：

*   **Payload（消息体）**：实际传输的数据内容，可以是任何格式（如JSON、XML、文本、二进制）。
*   **Properties（属性）**：描述消息的元数据，如消息是否持久化、优先级、消息ID、时间戳、内容类型等。

## （十）AMQP (Advanced Message Queuing Protocol)

AMQP是一个开放标准的应用层协议，为面向消息的中间件设计。RabbitMQ是AMQP协议的一个健壮的实现。该协议定义了消息的格式、交换机制、队列行为等。

## （十一）虚拟主机 (Virtual Host)

虚拟主机提供了一种在单个RabbitMQ代理中逻辑上隔离环境的方法。每个虚拟主机可以拥有自己独立的交换机、队列和绑定，以及用户权限。这使得多个应用程序可以在同一个RabbitMQ实例上运行而互不干扰，类似于关系数据库中的"数据库"概念。

# 二、RabbitMQ工作原理

RabbitMQ的工作流程可以概括为以下步骤：

1.  **生产者连接**：生产者应用程序通过网络连接到RabbitMQ代理，并建立一个信道（Channel）。
2.  **生产者发送消息**：生产者将消息（包含消息体、属性和路由键）发送到指定的交换机。
3.  **交换机路由消息**：交换机接收到消息后，根据其类型、消息的路由键以及与队列的绑定关系（通过绑定键），决定将消息路由到一个或多个队列中。
4.  **消息进入队列**：消息被存放在匹配的队列中，等待消费者处理。如果队列配置了持久化，并且消息本身也标记为持久化，那么消息会被保存到磁盘。
5.  **消费者连接与订阅**：消费者应用程序连接到RabbitMQ代理，建立信道，并声明或订阅其感兴趣的队列。
6.  **消费者接收消息**：RabbitMQ将队列中的消息推送给订阅该队列的消费者。消费者接收到消息后进行业务处理。
7.  **消息确认**：消费者处理完消息后，向RabbitMQ发送一个确认（Acknowledgement, ACK），告知RabbitMQ该消息已被成功处理。RabbitMQ收到确认后，才会从队列中彻底删除该消息（对于需要手动确认的模式）。如果消费者在处理消息时失败或异常退出而没有发送ACK，RabbitMQ会将该消息重新放回队列或投递给其他消费者（取决于配置）。

# 三、交换机类型详解

交换机是RabbitMQ消息路由的核心，不同类型的交换机提供了不同的消息分发策略。

## （一）Direct Exchange (直接交换机)

*   **工作原理**：直接交换机将消息路由到绑定键（Binding Key）与消息的路由键（Routing Key）完全匹配的队列。如果一个队列的绑定键与消息的路由键相同，那么该消息就会被投递到这个队列。
*   **使用场景**：适用于需要精确匹配路由规则的场景，例如点对点消息传递，或者根据特定标识符将任务分配给特定的工作队列。
*   **示例**：一个生产者发送消息时指定路由键为 `pdf_process`，那么这条消息会被投递到所有绑定键为 `pdf_process` 的队列。

```
Producer ----RoutingKey: "key1"----> [Direct Exchange] ----BindingKey: "key1"----> Queue1
                                     |
                                     ----BindingKey: "key2"----> Queue2 (不会收到消息)
```

## （二）Fanout Exchange (扇形交换机)

*   **工作原理**：扇形交换机将接收到的所有消息广播到所有绑定到它的队列，完全忽略消息的路由键和队列的绑定键。
*   **使用场景**：适用于需要将同一消息分发给多个消费者的场景，例如系统通知、实时数据广播、日志系统等。
*   **示例**：一个生产者发送一条日志消息到Fanout交换机，所有绑定到该交换机的日志处理队列都会收到这条日志。

```
Producer ----AnyRoutingKey----> [Fanout Exchange] ----(no binding key needed)----> QueueA
                                    |
                                    ----(no binding key needed)----> QueueB
                                    |
                                    ----(no binding key needed)----> QueueC
```

## （三）Topic Exchange (主题交换机)

*   **工作原理**：主题交换机根据消息的路由键与队列的绑定键之间的模式匹配来路由消息。绑定键和路由键都是由点号 `.` 分隔的单词序列。
    *   `*` (星号) 可以替代一个单词。
    *   `#` (井号) 可以替代零个或多个单词。
*   **使用场景**：非常灵活，适用于需要根据多个标准进行消息路由的复杂场景。例如，根据日志的来源（`kern`, `cron`）和级别（`info`, `warn`, `error`）进行路由。路由键可能是 `kern.error`，绑定键可以是 `kern.*` 或 `*.error` 或 `#`。
*   **示例**：
    *   路由键为 `stock.usd.nyse` 的消息。
    *   绑定键 `stock.usd.*` 的队列会收到此消息。
    *   绑定键 `stock.#` 的队列会收到此消息。
    *   绑定键 `*.usd.nyse` 的队列会收到此消息。
    *   绑定键 `stock.eur.frankfurt` 的队列不会收到此消息。

```
Producer --RoutingKey: "news.europe.sport"--> [Topic Exchange] --BindingKey: "news.europe.#"--> Queue_Europe_News
                                             |
                                             --BindingKey: "news.*.sport"--> Queue_Sport_News
                                             |
                                             --BindingKey: "#.sport"--> Queue_All_Sport (也会收到)
```

## （四）Headers Exchange (头部交换机)

*   **工作原理**：头部交换机不依赖路由键进行匹配，而是根据发送消息时指定的头部属性（headers）进行匹配。在绑定队列到头部交换机时，可以指定一组键值对（arguments）作为匹配条件。消息的头部也包含一组键值对，当消息的头部与队列绑定的参数匹配时，消息才会被路由到该队列。匹配规则可以设置为 `all`（所有键值对都匹配）或 `any`（任意一个键值对匹配）。
*   **使用场景**：当路由规则比简单的字符串匹配更复杂，需要基于消息的多个属性进行路由时使用。相对不常用。
*   **示例**：队列绑定时设置参数 `{"format": "pdf", "type": "report", "x-match": "all"}`。只有当消息的headers同时包含 `format=pdf` 和 `type=report` 时，消息才会被路由到该队列。

# 四、RabbitMQ关键特性

## （一）消息持久化 (Message Persistence)

为了确保消息在RabbitMQ服务器重启或崩溃后不丢失，需要同时进行以下两项设置：

1.  **队列持久化**：在声明队列时，将其 `durable` 属性设置为 `true`。
    ```java
    // channel.queueDeclare(queueName, durable, exclusive, autoDelete, arguments);
    channel.queueDeclare("my_durable_queue", true, false, false, null);
    ```
2.  **消息持久化**：生产者在发送消息时，将消息的投递模式（delivery mode）设置为2（持久化）。
    ```java
    // AMQP.BasicProperties props = new AMQP.BasicProperties.Builder().deliveryMode(2).build();
    // channel.basicPublish(exchangeName, routingKey, props, messageBodyBytes);
    channel.basicPublish("", "my_durable_queue", MessageProperties.PERSISTENT_TEXT_PLAIN, message.getBytes());
    ```

**注意**：即使队列和消息都标记为持久化，从RabbitMQ接收到消息到将其写入磁盘之间仍然存在一个短暂的时间窗口。对于非常严格的持久性要求，可以考虑使用发布者确认（Publisher Confirms）和事务。

## （二）消息确认机制 (Acknowledgement Mechanisms)

消息确认是保证消息可靠传递的重要机制。

### 1. 消费者确认 (Consumer Acknowledgements)

当消费者从队列中获取消息后，RabbitMQ需要知道消息是否被成功处理。消费者确认有两种模式：

*   **自动确认 (Automatic Acknowledgement)**：当RabbitMQ将消息发送给消费者后，立即认为消息已被处理并将其从队列中移除。这种模式简单，但如果消费者在处理消息过程中崩溃，消息会丢失。
*   **手动确认 (Manual Acknowledgement)**：消费者在成功处理完消息后，显式地向RabbitMQ发送一个确认（ACK）。如果消费者在处理过程中失败或未发送ACK就断开连接，RabbitMQ会将该消息重新入队（或根据配置投递给其他消费者或进入死信队列）。

手动确认相关的命令：

*   `basic.ack`：肯定确认，告知RabbitMQ消息已成功处理。
*   `basic.nack`：否定确认，告知RabbitMQ消息处理失败，可以指示RabbitMQ是否重新入队该消息。
*   `basic.reject`：与`basic.nack`类似，但一次只能拒绝一条消息。

### 2. 发布者确认 (Publisher Confirms)

发布者确认机制用于确保生产者发送的消息已经成功到达RabbitMQ代理（并被路由到队列或交换机处理完毕）。

*   当通道（Channel）设置为确认模式后 (`channel.confirmSelect()`)，生产者发送的每条消息都会被分配一个唯一的序列号。
*   RabbitMQ代理在处理完消息后，会向生产者发送一个确认（ACK）或否定确认（NACK）。
    *   ACK表示消息已成功处理。
    *   NACK表示消息因某种原因未能成功处理（例如队列不存在，或内部错误）。
*   生产者可以同步等待确认，也可以异步接收确认回调。

发布者确认比事务更轻量级，性能更好，是实现可靠发布的推荐方式。

## （三）可靠性保证

通过结合使用持久化（队列和消息）、消费者手动确认以及发布者确认，可以构建高度可靠的消息传递系统。即使在生产者、消费者或RabbitMQ代理发生故障的情况下，也能最大限度地减少消息丢失的风险。

## （四）高可用与集群 (High Availability and Clustering)

RabbitMQ支持多种高可用方案：

### 1. 集群 (Clustering)

多个RabbitMQ节点可以组成一个集群，所有节点共享用户、虚拟主机、队列、交换机等元数据信息。客户端可以连接到集群中的任意节点。队列的内容默认只存在于创建该队列的节点上（除非是镜像队列）。集群提供了元数据的高可用和负载均衡（针对连接）。

### 2. 镜像队列 (Mirrored Queues)

为了实现队列内容的高可用，可以将队列配置为镜像队列。镜像队列会在集群中的多个节点上拥有副本。当主节点发生故障时，其中一个镜像节点会自动提升为新的主节点，保证队列的可用性和消息的冗余。

### 3. Shovel 和 Federation 插件

*   **Shovel**：用于在不同的Broker之间（可以是不同集群，甚至不同数据中心）可靠地移动消息。
*   **Federation**：允许将不同Broker上的交换机或队列连接起来，实现更大规模的分布式消息系统。

## （五）管理与监控 (Management and Monitoring)

RabbitMQ提供了多种管理和监控工具：

*   **RabbitMQ Management Plugin**：一个基于Web的管理界面，可以监控节点状态、连接、信道、交换机、队列、消息速率等，并进行用户、虚拟主机、权限等管理操作。默认端口是15672。
*   **`rabbitmqctl`**：一个强大的命令行工具，用于管理RabbitMQ服务器的各个方面，如用户管理、虚拟主机管理、策略配置、集群管理、查看状态等。
*   **HTTP API**：Management Plugin也暴露了一套RESTful API，可以通过编程方式管理和监控RabbitMQ。

# 五、RabbitMQ安装与配置

## （一）安装Erlang

RabbitMQ是使用Erlang语言编写的，因此在安装RabbitMQ之前必须先安装Erlang OTP环境。请确保安装与RabbitMQ版本兼容的Erlang版本。可以从Erlang官网或通过包管理器安装。

**在CentOS/RHEL上通过官方源安装较新版Erlang（示例）：**

```shell
# 配置Erlang解决方案仓库
curl -s https://packagecloud.io/install/repositories/rabbitmq/erlang/script.rpm.sh | sudo bash

# 导入GPG密钥
rpm --import https://packagecloud.io/rabbitmq/erlang/gpgkey
rpm --import https://packagecloud.io/gpg.key
rpm --import https://github.com/rabbitmq/signing-keys/releases/download/2.0/rabbitmq-release-signing-key.asc

# 清理并创建缓存
yum clean all
yum makecache

# 安装Erlang
yum install -y erlang

# 验证安装
erl -version
```

## （二）安装RabbitMQ Server

可以从RabbitMQ官网下载对应操作系统的安装包，或使用包管理器安装。

**在CentOS/RHEL上安装（示例）：**

```shell
# 添加RabbitMQ仓库
curl -s https://packagecloud.io/install/repositories/rabbitmq/rabbitmq-server/script.rpm.sh | sudo bash

# 导入GPG密钥
rpm --import https://packagecloud.io/rabbitmq/rabbitmq-server/gpgkey

# 清理并创建缓存
yum clean all
yum makecache

# 安装RabbitMQ服务器 (例如安装特定版本3.8.9)
yum install -y rabbitmq-server-3.8.9

# 启动RabbitMQ服务
systemctl start rabbitmq-server

# 设置开机自启动
systemctl enable rabbitmq-server

# 查看状态
systemctl status rabbitmq-server
```

## （三）启用Management Plugin

```shell
# 启用管理插件
rabbitmq-plugins enable rabbitmq_management

# 重启服务使插件生效 (某些版本可能需要)
systemctl restart rabbitmq-server
```
之后可以通过 `http://<server-ip>:15672` 访问管理界面，默认用户名为 `guest`，密码为 `guest`。出于安全考虑，`guest`用户默认只能从 `localhost` 登录。

## （四）用户和权限管理

### 1. 创建用户

```shell
# 添加用户 <username> <password>
rabbitmqctl add_user myuser mypassword
```

### 2. 设置用户标签 (角色)

```shell
# 将用户设置为管理员
rabbitmqctl set_user_tags myuser administrator

# 其他可用标签：monitoring, policymaker, management
```

### 3. 创建虚拟主机

```shell
# 添加虚拟主机 <vhost_name>
rabbitmqctl add_vhost /my_vhost
```

### 4. 设置用户权限

```shell
# 为用户在指定虚拟主机上设置权限
# rabbitmqctl set_permissions [-p <vhost>] <user> <conf> <write> <read>
# <conf>: 配置权限 (创建队列、交换机等)
# <write>: 写权限 (发布消息)
# <read>: 读权限 (消费消息、绑定等)
# ".*" 表示所有资源
rabbitmqctl set_permissions -p /my_vhost myuser ".*" ".*" ".*"
```

## （五）配置文件

RabbitMQ的主要配置文件是 `rabbitmq.conf`。其位置因安装方式和操作系统而异，通常在 `/etc/rabbitmq/` 或 `/usr/local/etc/rabbitmq/` 等目录下。

如果文件不存在，可以创建一个。配置文件采用INI格式（Key = Value）或新的sysctl格式。

**示例 `rabbitmq.conf` (INI格式):**

```ini
# 默认用户guest只能本地登录，如需远程，需配置（不推荐用于生产）
# loopback_users = none

# 修改默认端口
# listeners.tcp.default = 5672

# 集群相关配置
# cluster_partition_handling = autoheal

# 内存限制
# vm_memory_high_watermark.relative = 0.4
```

修改配置文件后需要重启RabbitMQ服务。

# 六、常用 `rabbitmqctl` 命令

`rabbitmqctl`是RabbitMQ的主要命令行管理工具。

*   `rabbitmqctl status`: 查看节点状态、运行的应用程序、监听器等。
*   `rabbitmqctl cluster_status`: 查看集群状态。
*   `rabbitmqctl list_users`: 列出所有用户。
*   `rabbitmqctl add_user <username> <password>`: 添加新用户。
*   `rabbitmqctl delete_user <username>`: 删除用户。
*   `rabbitmqctl change_password <username> <new_password>`: 修改用户密码。
*   `rabbitmqctl set_user_tags <username> <tag ...>`: 设置用户标签（角色）。
*   `rabbitmqctl list_vhosts`: 列出所有虚拟主机。
*   `rabbitmqctl add_vhost <vhost_path>`: 添加虚拟主机。
*   `rabbitmqctl delete_vhost <vhost_path>`: 删除虚拟主机。
*   `rabbitmqctl set_permissions [-p <vhost_path>] <username> <conf_regex> <write_regex> <read_regex>`: 设置权限。
*   `rabbitmqctl list_permissions [-p <vhost_path>]`: 列出权限。
*   `rabbitmqctl list_queues [-p <vhost_path>] [queueinfoitem ...]` : 列出队列信息。
*   `rabbitmqctl list_exchanges [-p <vhost_path>] [exchangeinfoitem ...]` : 列出交换机信息。
*   `rabbitmqctl list_bindings [-p <vhost_path>] [bindinginfoitem ...]` : 列出绑定信息。
*   `rabbitmqctl list_connections [connectioninfoitem ...]` : 列出连接信息。
*   `rabbitmqctl list_channels [channelinfoitem ...]` : 列出信道信息。
*   `rabbitmqctl purge_queue <queue_name> [-p <vhost_path>]`: 清空指定队列的所有消息。
*   `rabbitmqctl stop_app`: 停止RabbitMQ应用（节点仍在运行Erlang VM）。
*   `rabbitmqctl start_app`: 启动RabbitMQ应用。
*   `rabbitmqctl reset`: 将节点恢复到初始状态（删除所有持久化消息和配置）。
*   `rabbitmqctl join_cluster <clusternode> [--ram]`：将当前节点加入指定集群节点。

# 七、RabbitMQ应用场景

RabbitMQ凭借其强大的功能和灵活性，广泛应用于各种场景：

1.  **异步处理**：将耗时的任务（如邮件发送、报表生成、视频转码）发送到消息队列，由后台工作进程异步处理，提高前端应用的响应速度和用户体验。
2.  **应用解耦**：服务之间通过消息队列进行通信，而不是直接调用。这降低了服务间的耦合度，使得系统更易于维护和扩展。一个服务发生故障不会直接导致其他服务不可用。
3.  **流量削峰（削峰填谷）**：在高并发场景下（如秒杀活动、促销），将瞬时的大量请求写入消息队列，后端服务按照自身处理能力从队列中消费，避免系统因瞬时压力过大而崩溃。
4.  **日志处理**：将应用产生的日志消息发送到RabbitMQ，由专门的日志处理服务进行收集、分析和存储。
5.  **事件驱动架构**：当某个事件发生时（如订单创建、用户注册），生产者发布一个事件消息，相关的订阅者（其他服务）接收到事件后执行相应的业务逻辑。
6.  **分布式事务的最终一致性**：在分布式事务中，可以使用消息队列来传递事务状态或执行补偿操作，确保数据的最终一致性。
7.  **任务调度/延迟任务**：结合RabbitMQ的TTL（Time-To-Live）和死信交换机（Dead Letter Exchange）可以实现延迟消息和定时任务。

# 八、与其他消息队列对比（简要）

| 特性         | RabbitMQ (AMQP)                      | Kafka                                  | Redis (Pub/Sub, Stream)                |
|--------------|--------------------------------------|----------------------------------------|----------------------------------------|
| **协议**     | AMQP, MQTT, STOMP等                  | 自定义TCP协议                          | RESP                                   |
| **模型**     | 多种交换机类型，灵活路由               | 发布/订阅 (基于Topic和Partition)       | Pub/Sub (简单广播), Stream (类Kafka)   |
| **吞吐量**   | 良好，但通常低于Kafka                | 非常高，为大数据设计                   | Pub/Sub较低, Stream较高 (取决于场景)   |
| **消息持久化** | 支持，灵活配置                       | 默认持久化到磁盘，日志型存储           | Pub/Sub不持久, Stream持久化            |
| **可靠性**   | 高 (ACK, 持久化, 事务, 发布者确认)   | 高 (副本机制, ISR)                     | Pub/Sub不可靠, Stream提供ACK           |
| **功能复杂度** | 高，功能丰富（管理界面、多种协议）   | 相对专注日志和流处理                   | Pub/Sub简单, Stream功能逐渐增强        |
| **消息堆积** | 支持大量消息堆积                     | 非常擅长大量消息堆积和回溯消费         | Pub/Sub不支持, Stream支持有限堆积      |
| **适用场景** | 企业级应用集成, 复杂路由, 任务队列 | 大数据流处理, 日志收集, 事件溯源       | 简单消息通知, 实时缓存更新, 轻量级队列 |
| **运维复杂度** | 中等                                 | 较高 (依赖ZooKeeper或KRaft)            | 低                                     |

选择哪种消息队列取决于具体的业务需求、性能要求、可靠性需求以及运维能力。

# 九、总结

RabbitMQ作为一款功能强大且成熟的消息中间件，为构建可靠、可扩展的分布式应用提供了坚实的基础。它通过AMQP协议以及灵活的交换机、队列和绑定机制，实现了高效的消息路由和分发。其提供的持久化、消息确认、集群和高可用特性，保证了消息传递的可靠性和系统的稳定性。

笔者认为，深入理解RabbitMQ的核心概念、工作原理以及各种特性，并结合实际应用场景进行合理选型和配置，是发挥其最大效能的关键。希望本笔记能够帮助您更好地理解和使用RabbitMQ。

# 十、参考链接

*   **RabbitMQ官方网站**: [https://www.rabbitmq.com/](https://www.rabbitmq.com/)
*   **RabbitMQ官方文档**: [https://www.rabbitmq.com/documentation.html](https://www.rabbitmq.com/documentation.html)
*   **AMQP协议**: [https://www.amqp.org/](https://www.amqp.org/)
*   **Erlang Solutions**: [https://www.erlang-solutions.com/](https://www.erlang-solutions.com/)
*   （可补充您在学习过程中参考的其他优质博客或教程链接）
*   **相关安装教程**: [【LINUX】在一台空服务器上部署网页系统](./【LINUX】在一台空服务器上部署网页系统.md)

--- 