# ai-agent-core

## Purpose

AI Agent 核心模块，负责 Provider 配置管理、Agent 工厂创建、对话节路由、消息流式写入以及共享类型定义。是 AI 基础设施的中枢层。

## Requirements

### Requirement: Provider 配置集中管理
系统 SHALL 在 `src/ai/provider.ts` 中集中管理 AI Provider 配置，包括：
- API Key 的存储与读取（localStorage）
- 支持的模型列表定义
- Provider 实例创建（zhipu-ai-provider）
- 模型名称的存储与读取（localStorage）

#### Scenario: 创建 Provider 实例
- **WHEN** 调用 Provider 创建函数
- **THEN** 返回基于 zhipu-ai-provider 的 Provider 实例，API 地址为 `https://open.bigmodel.cn/api/paas/v4`

#### Scenario: API Key 管理
- **WHEN** 用户设置 API Key
- **THEN** API Key 存储在 localStorage 中，Provider 创建时自动读取

### Requirement: Agent 工厂函数
系统 SHALL 在 `src/ai/agent.ts` 中提供 Agent 工厂函数，接受配置参数创建 ToolLoopAgent 实例。

#### Scenario: 创建默认 Agent
- **WHEN** 调用 Agent 工厂函数不传参数
- **THEN** 创建使用默认模型、加载全部工具、使用事务组长提示词的 ToolLoopAgent

#### Scenario: 创建指定模型 Agent
- **WHEN** 调用 Agent 工厂函数传入模型名称
- **THEN** 创建使用指定模型的 ToolLoopAgent

### Requirement: 代码路由函数
系统 SHALL 在 `src/ai/router.ts` 中实现路由函数，负责管理对话节的创建和续接。

#### Scenario: 默认创建新节
- **WHEN** 用户发送消息且未引用任何已有节
- **THEN** 路由函数创建新的对话节（生成 JSONL 文件，记录节摘要条目）

#### Scenario: 引用已有节续接
- **WHEN** 用户发送消息并引用了某一节
- **THEN** 路由函数在引用的节上续接对话，不创建新节

### Requirement: Agent 系统提示词动态加载
Agent 创建时 SHALL 从提示词管理模块动态加载并组合系统提示词，不硬编码在代码中。

#### Scenario: 系统提示词来自文件
- **WHEN** 创建 Agent
- **THEN** 系统提示词内容从 Markdown 文件读取并组合，而非代码中的字符串常量

### Requirement: 节摘要注入系统提示词
路由函数创建新对话节时 SHALL 查询同会话下之前所有节的摘要，将其注入 Agent 的 system prompt 中。

#### Scenario: 有历史摘要时注入
- **WHEN** 创建新节，且同会话下存在之前节的摘要
- **THEN** Agent 的 system prompt 末尾追加"以下是本会话之前节摘要："及各节摘要内容

### Requirement: JSONL 消息流式写入
对话过程中，Agent 的每次消息（用户输入、Assistant 回复、Tool 调用、Tool 结果）SHALL 实时追加写入当前节的 JSONL 文件。

#### Scenario: 用户消息立即写入
- **WHEN** 用户发送一条消息
- **THEN** 该消息在传递给 Agent 之前，先追加写入当前节的 JSONL 文件

#### Scenario: 工具调用结果立即写入
- **WHEN** Agent 调用工具并收到结果
- **THEN** 工具调用和工具结果消息分别追加写入当前节的 JSONL 文件

### Requirement: 共享类型定义
系统 SHALL 在 `src/ai/types.ts` 中定义 AI 模块的共享类型，包括 `ToolResult<T>` 等通用类型。

#### Scenario: ToolResult 类型可用
- **WHEN** 工具定义文件导入 `src/ai/types.ts`
- **THEN** 可以使用 `ToolResult<T>` 类型标注工具返回值
