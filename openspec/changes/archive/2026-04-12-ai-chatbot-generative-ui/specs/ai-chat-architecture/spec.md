## ADDED Requirements

### Requirement: DisplayMessage 模型重构

系统 SHALL 将 `DisplayMessage` 从 `role + content` 扁平模型重构为 `role + parts` 数组模型。

#### Scenario: 类型定义迁移

- **WHEN** 引入 Parts 消息模型
- **THEN** `DisplayMessage` 类型 SHALL 移除 `content: string` 字段，替换为 `parts: DisplayMessagePart[]`
- **AND** 所有引用 `content` 字段的代码 SHALL 迁移到遍历 `parts` 数组

#### Scenario: 向后兼容加载

- **WHEN** 加载旧格式的持久化消息（仅含 content 字段）
- **THEN** 系统 SHALL 将旧格式的 content 自动转换为 `[{ type: 'text', content: '...' }]` parts 数组

### Requirement: 流消费循环改造

系统 SHALL 改造 `useSectionChat.performSend()` 中的流消费逻辑，从维护独立的 `assistantContent` + `toolCallsAcc` + `toolResults` 改为统一的 `partsAcc` 累加器。

#### Scenario: 统一累加器

- **WHEN** 消费 fullStream 事件
- **THEN** 系统 SHALL 使用单一的 `partsAcc: DisplayMessagePart[]` 累加所有类型的 part
- **AND** 不再维护独立的内容字符串和工具调用/结果数组

### Requirement: 渲染层适配 Parts 模型

系统 SHALL 将渲染层从遍历 `content` 文本改为遍历 `parts` 数组并按类型分发。

#### Scenario: 渲染循环改造

- **WHEN** 渲染 assistant 消息
- **THEN** 系统 SHALL 遍历 `parts` 数组，根据每个 part 的 `type` 字段分发到对应的渲染组件
- **AND** 不再使用纯文本 content 渲染

### Requirement: 快照转换函数升级

系统 SHALL 将 `toDisplayMessages()` 升级为 `toDisplayMessagesParts()`，支持从 JSONL 快照生成 Parts 模型的 DisplayMessage。

#### Scenario: 新增 toPartsFromSnapshot

- **WHEN** 需要从持久化快照恢复 Parts 模型的展示消息
- **THEN** 系统 SHALL 提供 `toPartsFromSnapshot()` 函数，将 `JSONLMessage[]` + 流式累加数据转换为 `DisplayMessagePart[]`
