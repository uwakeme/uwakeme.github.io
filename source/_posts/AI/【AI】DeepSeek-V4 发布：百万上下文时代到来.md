---
title: 【AI】DeepSeek-V4 发布：百万上下文时代到来
date: 2026-04-24 10:00:00
tags:
  - AI
  - 大模型
  - DeepSeek
categories: AI
cover: https://raw.githubusercontent.com/uwakeme/personal-image-repository/master/images/20260424163853083.png
---

今天上午十一点，DeepSeek-V4 预览版悄然上线。没有发布会，没有通稿，科技圈的消息却像野火一样烧了起来。

![](https://raw.githubusercontent.com/uwakeme/personal-image-repository/master/images/20260424161500289.png)

说实话，和其他大模型公司相比，DeepSeek 的迭代速度并不算快。但每次发布，都有点东西。

## 一、1M 上下文，来了

最重磅的功能：**百万字超长上下文**。

这意味着什么？以前我们用大模型处理长文档，往往要面临"截断"的痛苦——上下文不够长，看到后面就忘了前面。现在这个问题基本不存在了。

### 技术原理

DeepSeek-V4 开创了一种全新的注意力机制，通过在 token 维度进行压缩，结合 DSA 稀疏注意力（DeepSeek Sparse Attention），实现了国内与开源领域领先的长上下文能力。

技术报告里提到，能做到这么省，主要靠三个技术创新：

- **CSA + HCA 注意力机制**：把很长的上下文"压缩打包"再处理
- **改进的残差连接 (mHC)**：让信息在网络各层之间传递得更稳、更准
- **Engram 条件记忆模块**：将高频事实性知识从 GPU 显存剥离，存储于 CPU DRAM 或 NVMe SSD，通过 O(1) 哈希索引检索

相比传统方法，这一套组合拳让计算量和显存需求大幅降低。官方数据显示，约 45% 的 Transformer 计算量可卸载，算力消耗降低约 35%。

![](https://raw.githubusercontent.com/uwakeme/personal-image-repository/master/images/20260424160913559.png)

### 参数规模

这次 V4 分两个版本：

![](https://raw.githubusercontent.com/uwakeme/personal-image-repository/master/images/20260424160521582.png)

相比上一代 V3.2 约 660B 总参数，V4-Pro 参数量是其 **2.4 倍**，但激活参数从 37B 增至 49B，增幅远小于总参数增长。这意味着 MoE 门控网络更加稀疏，单个 token 实际调用的算力更少，但可调用的知识储备更大。

1.6 万亿参数也刷新了 Kimi 2.6 的 1 万亿参数规模，成为目前国产开源模型最大参数规模。

### 国产芯片支持

值得一提的是，DeepSeek-V4 明确支持**华为昇腾 950 芯片**。官方披露国产芯片算力利用率突破 85%。这是国产 AI 开始打破英伟达"垄断"的重要信号。

即日起登录官网 chat.deepseek.com 或官方 App，即可与最新的 DeepSeek-V4 对话，探索 1M 超长上下文记忆的全新体验。

## 二、两个版本，怎么选？

V4 分为两个版本：Pro 和 Flash。

![](https://raw.githubusercontent.com/uwakeme/personal-image-repository/master/images/20260424160732970.png)

**V4-Pro** 是性能旗舰。几个关键指标：

- **Agent 能力大幅增强**：在 Agentic Coding 评测中达到开源模型最佳水平，内部员工使用反馈体验优于 Sonnet 4.5，交付质量接近 Opus 4.6 非思考模式（但与 Opus 4.6 思考模式仍有差距）
- **世界知识领先**：大幅领先其他开源模型，略微落后于 Gemini-Pro-3.1
- **推理性能顶级**：在数学、STEM、竞赛代码测评中超越所有已公开评测的开源模型，比肩顶级闭源模型

**V4-Flash** 是轻量版。世界知识储备稍逊于 Pro，但展现出了接近的推理能力。由于模型参数和激活更小，V4-Flash 能够提供更加快捷、经济的 API 服务。在简单任务上，Flash 和 Pro 旗鼓相当，但高难度任务仍有差距。

我的理解：日常使用选 Flash 做生产就够用了，如果要做复杂的 Agent 任务，Pro 是更好的选择。

## 三、Agent 能力专项优化

这次 V4 专门针对 Claude Code、OpenClaw、OpenCode、CodeBuddy 等主流 Agent 产品做了适配和优化，在代码任务、文档生成任务等方面的表现均有提升。

官方展示了一个案例：V4-Pro 在某个 Agent 框架下直接生成了一份 PPT 的内页。效果看起来相当不错，至少从我看到的截图来说，排版和内容组织都不像是"敷衍"的输出。

对于常年用大模型写代码的我来说，Agent 能力可能是最实用的提升。以前让模型帮我写一个完整的模块，经常会遇到"写着写着就跑偏了"的问题。现在看这个评测数据，至少理论上应该改善不少。

## 四、API 和开源

API 已同步更新，base_url 不变，只需要把 model 参数改成 `deepseek-v4-pro` 或 `deepseek-v4-flash`。两个模型都支持非思考模式和思考模式，其中思考模式支持 `reasoning_effort` 参数设置思考强度（high/max）。对于复杂的 Agent 场景，建议使用思考模式并设置强度为 max。

有一点需要注意：旧的 API 接口 `deepseek-chat` 和 `deepseek-reasoner` 将在三个月后（2026-07-24）停止使用。当前它们分别指向 V4-Flash 的非思考模式和思考模式。

![](https://raw.githubusercontent.com/uwakeme/personal-image-repository/master/images/20260424160950593.png)

> **开源链接：**
> - HuggingFace: https://huggingface.co/collections/deepseek-ai/deepseek-v4
> - ModelScope: https://modelscope.cn/collections/deepseek-ai/DeepSeek-V4
> - 技术报告: https://huggingface.co/deepseek-ai/DeepSeek-V4-Pro/blob/main/DeepSeek_V4.pdf

## 五、写在最后

官方引用了一句荀子的话：「不诱于誉，不恐于诽，率道而行，端然正己。」

DeepSeek 这家公司给我的感觉一直是：话不多，但一直在做实事。每次发布都不是那种"PPT 吊打一切"的风格，而是实打实地把东西放出来让你用。

从去年到现在，大模型领域的竞争越来越激烈。OpenAI、Google、Anthropic 每家都在出新品。但 DeepSeek 一直走自己的路——开源、 长上下文、Agent 能力、推理性能、成本控制，哪个都没落下。

---

**参考来源：** [DeepSeek 官方公众号](https://mp.weixin.qq.com/s/8bxXqS2R8Fx5-1TLDBiEDg)
