---
title: 【学习】Kubernetes (K8s) 基础入门笔记
categories: 学习
tags:
  - K8s
  - Kubernetes
  - 容器编排
  - 云计算
---

# 前言

Kubernetes，简称K8s，是一个开源的容器编排平台，用于自动化容器化应用程序的部署、扩展和管理。在现代云计算和微服务架构中，K8s已经成为事实上的标准。它能够帮助开发者和运维工程师更高效地管理复杂的应用环境，确保应用的高可用性和可伸缩性。本笔记旨在帮助初学者快速入门K8s的核心概念和基本操作。

# 一、Kubernetes核心概念

理解K8s的核心概念是掌握其强大功能的基础。以下是一些最重要的概念：

## （一）Container（容器）

容器是一种轻量级的、可移植的、自包含的软件打包技术。它将应用程序及其所有依赖（库、运行时等）打包在一起，确保在不同环境中拥有一致的运行表现。Docker是最常用的容器运行时之一。

K8s的核心任务就是管理这些容器。

## （二）Pod

Pod是K8s中可以创建和管理的最小部署单元。一个Pod可以包含一个或多个紧密关联的容器。这些容器共享同一个网络命名空间（IP地址和端口空间）、IPC命名空间以及存储卷。

Pod内的容器通常一起部署、一起启动、一起停止，并且可以像在同一台物理机上一样通过`localhost`相互通信。

**示例：一个简单的Nginx Pod定义 (YAML格式)**
```yaml
apiVersion: v1
kind: Pod
metadata:
  name: nginx-pod
  labels:
    app: nginx
spec:
  containers:
  - name: nginx-container
    image: nginx:latest # 使用最新的nginx镜像
    ports:
    - containerPort: 80 # 容器监听的端口
```

## （三）Node（节点）

Node是K8s集群中的工作机器，可以是物理机或虚拟机。每个Node都运行着`kubelet`（负责管理Pod和容器）、`kube-proxy`（负责网络代理和负载均衡）以及容器运行时（如Docker）。Pod最终会在Node上运行。

## （四）Service（服务）

Service是一种抽象，它定义了一组Pod的逻辑集合和一个访问它们的策略。由于Pod的生命周期是短暂的，它们可以被创建和销毁，IP地址也会随之改变。Service提供了一个稳定的入口点（固定的IP地址和DNS名称），使得其他应用或用户可以可靠地访问这组Pod提供的服务，而无需关心后端Pod的具体细节。

Service通过Label Selector来选择它所代理的Pod。

**示例：一个暴露Nginx Pod的Service定义 (YAML格式)**
```yaml
apiVersion: v1
kind: Service
metadata:
  name: nginx-service
spec:
  selector:
    app: nginx # 选择标签为 app:nginx 的Pod
  ports:
    - protocol: TCP
      port: 80       # Service监听的端口
      targetPort: 80 # Pod内容器监听的端口
  type: LoadBalancer # Service类型，LoadBalancer会尝试使用云提供商的负载均衡器暴露服务
```

## （五）Namespace（命名空间）

Namespace用于在同一个K8s集群中创建多个虚拟集群。它可以将集群资源划分为逻辑上隔离的组，适用于多租户环境或者区分不同的项目、团队或环境（如开发、测试、生产）。

大部分K8s资源（如Pod, Service, Deployment）都属于某个Namespace，而一些集群级别的资源（如Node, PersistentVolume）则不属于任何Namespace。默认情况下，所有资源都创建在`default`命名空间下。

## （六）Label（标签）和Selector（选择器）

Label是附加到K8s对象（如Pod, Node, Service）上的键值对。它们用于组织和选择对象的子集。例如，可以给所有前端Pod打上`tier: frontend`的标签，给所有后端Pod打上`tier: backend`的标签。

Selector是用于基于Label查询和筛选K8s对象的机制。Service使用Label Selector来确定它应该将流量路由到哪些Pod。Deployment也使用Label Selector来管理它所控制的Pod副本。

## （七）Deployment（部署）

Deployment为Pod和ReplicaSet（另一种K8s对象，用于维护指定数量的Pod副本）提供声明式的更新能力。您在Deployment中描述期望的应用状态，Deployment Controller会以受控的速率将实际状态逐步变更为期望状态。

Deployment支持滚动更新和回滚应用版本，确保应用更新过程中的高可用性。

**示例：一个管理Nginx Pod的Deployment定义 (YAML格式)**
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx-deployment
  labels:
    app: nginx
spec:
  replicas: 3 # 期望运行3个Nginx Pod副本
  selector:
    matchLabels:
      app: nginx # 选择标签为 app:nginx 的Pod进行管理
  template: # Pod模板，用于创建新的Pod
    metadata:
      labels:
        app: nginx
    spec:
      containers:
      - name: nginx
        image: nginx:1.25.3 # 指定nginx镜像版本
        ports:
        - containerPort: 80
```

## （八）ConfigMap和Secret

- **ConfigMap**：用于存储非敏感的配置数据，如配置文件、命令行参数等。Pod可以将ConfigMap中的数据作为环境变量、命令行参数或卷挂载到文件系统中使用。
- **Secret**：用于存储敏感数据，如密码、API密钥、TLS证书等。Secret的使用方式与ConfigMap类似，但其数据会以Base64编码存储（注意：这只是编码，并非强加密，需要配合RBAC等权限控制来保护）。

# 二、Kubernetes架构

K8s采用典型的Master-Worker（现在更常称为Control Plane-Node）架构。

## （一）Control Plane Components（控制平面组件）

控制平面组件负责集群的全局决策（例如，调度）以及检测和响应集群事件（例如，当Deployment的`replicas`字段不满足时启动新的Pod）。控制平面组件可以运行在集群中的任何机器上，但为了简单起见，启动脚本通常在同一台机器上启动所有控制平面组件，并且不会在这台机器上运行用户容器。

主要组件包括：

1.  **kube-apiserver**：API服务器是K8s控制平面的前端。它暴露K8s API，处理REST请求，验证和配置数据对象（如Pod, Service等），并将它们的状态存储在etcd中。
2.  **etcd**：一个一致且高可用的键值存储，用作K8s所有集群数据的后台存储。
3.  **kube-scheduler**：监视新创建的、未指定运行Node的Pod，并选择一个Node让Pod在上面运行。调度决策的因素包括：单个Pod和Pod集合的资源需求、硬件/软件/策略约束、亲和性和反亲和性规范、数据局部性、工作负载间的干扰和最后期限。
4.  **kube-controller-manager**：运行控制器进程。逻辑上，每个控制器都是一个独立的进程，但是为了降低复杂性，它们都被编译到同一个可执行文件并在一个进程中运行。这些控制器包括：
    *   Node Controller：负责在节点出现故障时进行通知和响应。
    *   Replication Controller：负责为集群中运行的每个复制控制器对象维护正确数量的Pod。
    *   Endpoints Controller：填充Endpoints对象（即加入Service与Pod）。
    *   Service Account & Token Controllers：为新的Namespace创建默认的Service Account和API访问Token。
5.  **cloud-controller-manager**（可选）：嵌入了特定云平台的控制逻辑。Cloud Controller Manager允许您将您的集群连接到云提供商的API之上，并将与该云平台交互的组件与只与您的集群交互的组件分离开。

## （二）Node Components（节点组件）

节点组件在每个Node上运行，维护运行的Pod并提供K8s运行时环境。

1.  **kubelet**：一个在集群中每个Node上运行的代理。它确保容器都运行在Pod中。kubelet接收通过各种机制提供的一组PodSpec，并确保这些PodSpec中描述的容器正常运行且健康。kubelet不管理不是由K8s创建的容器。
2.  **kube-proxy**：kube-proxy是集群中每个Node上运行的网络代理，实现了K8s Service概念的一部分。kube-proxy维护Node上的网络规则。这些网络规则允许从集群内部或外部的网络会话与Pod进行网络通信。如果操作系统提供了数据包过滤层并且可用，则kube-proxy会使用它。否则，kube-proxy会转发流量本身。
3.  **Container Runtime（容器运行时）**：容器运行时是负责运行容器的软件。K8s支持多种容器运行时，如Docker、containerd、CRI-O以及任何实现了K8s容器运行时接口（CRI）的运行时。

# 三、Kubernetes基本操作 (kubectl)

`kubectl`是K8s的命令行工具，用于与K8s集群进行交互。以下是一些常用的命令：

## （一）查看集群信息

```shell
kubectl cluster-info         # 显示集群控制平面和服务的端点信息
kubectl get nodes            # 列出集群中的所有Node及其状态
kubectl get namespaces       # 列出所有命名空间
```

## （二）部署和管理应用

```shell
kubectl apply -f <filename.yaml>    # 根据YAML文件创建或更新资源
kubectl get pods                     # 列出当前命名空间下的所有Pod
kubectl get pods -n <namespace>      # 列出指定命名空间下的所有Pod
kubectl get pods -o wide             # 以更详细的格式列出Pod（包括IP和所在Node）
kubectl describe pod <pod-name>      # 显示Pod的详细信息，常用于排错
kubectl logs <pod-name>              # 查看Pod的日志
kubectl logs -f <pod-name>           # 实时跟踪Pod的日志
kubectl exec -it <pod-name> -- /bin/bash # 进入Pod的容器内部执行命令
kubectl get deployments              # 列出所有Deployment
kubectl scale deployment <deployment-name> --replicas=5 # 伸缩Deployment的副本数量
kubectl rollout status deployment/<deployment-name>    # 查看Deployment的部署状态
kubectl rollout history deployment/<deployment-name>   # 查看Deployment的更新历史
kubectl rollout undo deployment/<deployment-name>      # 回滚到上一个版本
kubectl delete pod <pod-name>          # 删除一个Pod
kubectl delete -f <filename.yaml>    # 删除YAML文件中定义的所有资源
```

## （三）查看资源

```shell
kubectl get services                 # 列出所有Service
kubectl get configmaps               # 列出所有ConfigMap
kubectl get secrets                  # 列出所有Secret
kubectl get all                      # 列出当前命名空间下的所有常见资源
kubectl get all -n <namespace-name>  # 列出指定命名空间下的所有常见资源
```

# 四、准备环境 (Minikube)

对于初学者，在本地计算机上运行K8s是学习和实验的好方法。Minikube是一个轻量级的K8s实现，它在您的本地机器上创建一个虚拟机，并部署一个只包含一个节点的简单集群。

## （一）安装Minikube

具体的安装步骤因操作系统而异，请参考Minikube官方文档：
[https://minikube.sigs.k8s.io/docs/start/](https://minikube.sigs.k8s.io/docs/start/)

## （二）启动Minikube集群

```shell
minikube start # 启动Minikube集群
```

## （三）配置kubectl与Minikube交互

Minikube通常会自动配置`kubectl`。您可以通过以下命令验证：
```shell
kubectl config current-context
# 应该输出 minikube
```
如果未自动配置，可以运行 `minikube kubectl -- config view` 查看配置，并手动设置 `kubectl` 上下文。

# 总结

Kubernetes是一个功能强大且复杂的系统，但通过理解其核心概念和基本操作，您可以开始利用它来编排您的容器化应用程序。本笔记提供了一个入门级的概览，鼓励读者通过实践和进一步学习来深入掌握K8s。不断尝试部署示例应用、探索不同的资源对象以及熟悉`kubectl`命令，将有助于您更好地理解K8s的工作方式。

# 五、参考链接

-   **Kubernetes官方文档 (中文)**: [https://kubernetes.io/zh-cn/docs/home/](https://kubernetes.io/zh-cn/docs/home/)
-   **Kubernetes官方教程 (中文)**: [https://kubernetes.io/zh-cn/docs/tutorials/](https://kubernetes.io/zh-cn/docs/tutorials/)
-   **Kubernetes GitHub**: [https://github.com/kubernetes/kubernetes](https://github.com/kubernetes/kubernetes)
-   **Minikube官方文档**: [https://minikube.sigs.k8s.io/docs/](https://minikube.sigs.k8s.io/docs/)
-   **Katacoda Kubernetes Playground (在线实验环境)**: [https://www.katacoda.com/courses/kubernetes](https://www.katacoda.com/courses/kubernetes) (部分场景可能需要调整或寻找替代)
-   **《Kubernetes权威指南》**: 一本广受欢迎的K8s书籍，适合深入学习。
-   **《Kubernetes Patterns》**: 介绍在K8s上设计和构建云原生应用的常见模式。

希望这篇笔记能帮助您开启Kubernetes的学习之旅！ 