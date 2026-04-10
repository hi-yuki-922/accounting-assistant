## ADDED Requirements

### Requirement: useSectionChat 消息状态管理

`useSectionChat` hook SHALL 管理单个 Section 的消息列表状态，提供 `messages`、`isStreaming`、`error` 等响应式状态。

#### Scenario: 初始化加载历史消息
- **WHEN** `useSectionChat(sessionId, sectionFile)` 首次挂载
- **THEN** hook 从 JSONL 文件加载历史消息并设置到 `messages` 状态

#### Scenario: 空节初始化
- **WHEN** `useSectionChat(sessionId, sectionFile)` 挂载且该 JSONL 文件为空
- **THEN** `messages` 为空数组

### Requirement: useSectionChat 发送消息

`useSectionChat` SHALL 通过 `send(content: string)` 方法接收用户输入，创建 Agent 实例并驱动流式响应循环。

#### Scenario: 发送消息触发 Agent 流式响应
- **WHEN** 调用 `send("帮我创建一笔订单")`
- **THEN** hook 将用户消息追加到 `messages` 状态，创建 Agent 实例，调用 `agent.stream({ messages })` 开始流式响应
- **AND** `isStreaming` 设为 `true`

#### Scenario: 流式响应期间实时更新消息
- **WHEN** Agent 的 `fullStream` 发出 `text-delta` 事件
- **THEN** hook 将增量文本追加到 `messages` 中最后一条助手消息的 `content`，触发 UI 更新

#### Scenario: 流式响应完成后写入 JSONL
- **WHEN** Agent 流式响应完成（`fullStream` 结束）
- **THEN** hook 将完整的 user 消息、assistant 消息、tool 相关消息一次性写入 JSONL 文件
- **AND** `isStreaming` 设为 `false`

### Requirement: useSectionChat 中断响应

`useSectionChat` SHALL 通过 `stop()` 方法支持中断正在进行的流式响应。

#### Scenario: 用户中断流式响应
- **WHEN** 调用 `stop()` 且 Agent 正在流式响应
- **THEN** hook 通过 `AbortController.abort()` 中断 Agent 流，将已接收的内容作为最终 assistant 消息写入 JSONL
- **AND** `isStreaming` 设为 `false`

### Requirement: useSectionChat Agent 实例管理

`useSectionChat` SHALL 在 hook 内部创建和管理独立的 Agent 实例，hook 卸载时释放资源。

#### Scenario: hook 挂载创建 Agent
- **WHEN** `useSectionChat` 挂载并首次调用 `send()`
- **THEN** hook 调用 `createAgent()` 创建 Agent 实例，缓存供后续 `send()` 复用

#### Scenario: hook 卸载释放 Agent
- **WHEN** Section 卡片折叠或组件卸载
- **THEN** Agent 实例被 GC 回收，若正在流式则执行 `stop()` 中断

### Requirement: useSectionChat 错误处理

`useSectionChat` SHALL 将 Agent 执行过程中的错误捕获并设置到 `error` 状态。

#### Scenario: API Key 未配置
- **WHEN** `send()` 被调用但 API Key 未配置
- **THEN** `error` 设为错误文本，`isStreaming` 设为 `false`

#### Scenario: 网络请求失败
- **WHEN** Agent 流式过程中网络请求失败
- **THEN** `error` 设为错误文本，已接收内容保留，`isStreaming` 设为 `false`

### Requirement: useSectionChat 摘要生成

`useSectionChat` SHALL 在 Agent 流式响应完成后，调用摘要生成逻辑并保存到后端。

#### Scenario: 流式完成后生成摘要
- **WHEN** Agent 流式响应完成且 JSONL 写入成功
- **THEN** hook 调用 `generateSectionSummary()` 生成摘要，并调用 `createSectionSummary()` 保存到后端
