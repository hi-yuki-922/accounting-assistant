## ADDED Requirements

### Requirement: DisplayMessage 使用 Parts 数组模型

系统 SHALL 将 `DisplayMessage` 从扁平的 `content: string` 演进为 `parts: DisplayMessagePart[]` 数组结构，对齐 AI SDK 的 UIMessage parts 设计理念。

`DisplayMessagePart` SHALL 支持三种类型：
- `text`：文本内容 `{ type: 'text', content: string }`
- `tool-call`：工具调用 `{ type: 'tool-call', toolCallId: string, toolName: string, args: string, state: ToolCallState }`
- `tool-result`：工具结果 `{ type: 'tool-result', toolCallId: string, toolName: string, result: unknown }`

`ToolCallState` SHALL 为 `'calling' | 'completed' | 'error'` 枚举值。

#### Scenario: 用户消息的 Parts 结构

- **WHEN** 用户发送一条文本消息
- **THEN** 系统 SHALL 将其映射为 `{ role: 'user', parts: [{ type: 'text', content: '用户输入内容' }] }`

#### Scenario: 助手消息包含多种 Part 类型

- **WHEN** 助手回复包含文本、工具调用和工具结果
- **THEN** 系统 SHALL 按 `text` → `tool-call` → `tool-result` 的流式接收顺序排列 parts 数组
- **AND** 每个 tool-call part 包含 `toolCallId`、`toolName`、`args` 和 `state` 字段
- **AND** 每个 tool-result part 包含 `toolCallId`、`toolName` 和原始 JSON `result` 数据

### Requirement: 消息稳定 ID 生成

系统 SHALL 为每条 `DisplayMessage` 生成稳定 ID，基于 `sectionFile + arrayIndex` 而非随机值。

#### Scenario: ID 格式一致性

- **WHEN** 创建新的 DisplayMessage
- **THEN** ID SHALL 由 section 文件名和消息在数组中的索引组合生成
- **AND** 同一消息在多次渲染时保持相同 ID

### Requirement: 流消费循环适配 Parts 模型

系统 SHALL 改造 `useSectionChat.performSend()` 中的 `fullStream` 消费循环，维护 `partsAcc: DisplayMessagePart[]` 累加器。

#### Scenario: text-delta 事件处理

- **WHEN** 收到 `text-delta` 流事件
- **THEN** 系统 SHALL 将内容追加到最后一个 text part（如存在）或创建新的 text part

#### Scenario: tool-call 事件处理

- **WHEN** 收到 `tool-call` 流事件
- **THEN** 系统 SHALL 新增 `{ type: 'tool-call', state: 'calling' }` part 到 partsAcc

#### Scenario: tool-result 事件处理

- **WHEN** 收到 `tool-result` 流事件
- **THEN** 系统 SHALL 新增 `{ type: 'tool-result' }` part 到 partsAcc
- **AND** 将对应 tool-call part 的 state 更新为 `'completed'`

#### Scenario: 流完成时合并

- **WHEN** fullStream 完成
- **THEN** 系统 SHALL 将 `partsAcc` 合入 assistant DisplayMessage 的 parts 数组

### Requirement: JSONL 持久化兼容

系统 SHALL 保持 JSONL 持久化格式不变（OpenAI Chat Completion 格式），Parts 模型仅影响前端展示层。

#### Scenario: 展示层转换

- **WHEN** 从 JSONL 快照加载消息用于展示
- **THEN** 系统 SHALL 通过 `toDisplayMessagesParts()` 函数将 `JSONLMessage[]` 转换为 Parts 模型的 `DisplayMessage[]`

#### Scenario: 持久化格式不变

- **WHEN** 构建消息快照用于持久化
- **THEN** `buildSnapshot()` 和 `toModelMessages()` SHALL 保持原有逻辑不变
