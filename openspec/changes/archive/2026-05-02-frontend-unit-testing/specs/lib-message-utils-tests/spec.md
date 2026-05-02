## ADDED Requirements

### Requirement: toDisplayMessages 空消息处理

#### Scenario: 空消息列表
- **WHEN** 输入 `[]`
- **THEN** 返回 `[]`

### Requirement: toDisplayMessages user 消息映射

#### Scenario: 普通 user 消息
- **WHEN** 输入包含 `role: 'user', content: '你好'` 的消息
- **THEN** 返回的 DisplayMessage 中 `role` 为 `'user'`，`parts` 包含 `{ type: 'text', content: '你好' }`

#### Scenario: hidden user 消息被过滤
- **WHEN** 输入包含 `role: 'user', hidden: true` 的消息
- **THEN** 该消息不出现在返回结果中

### Requirement: toDisplayMessages assistant 消息映射

#### Scenario: 纯文本 assistant 消息
- **WHEN** 输入包含 `role: 'assistant', content: '回复内容'` 的消息（无 tool_calls）
- **THEN** 返回的 DisplayMessage 中 `parts` 包含 `{ type: 'text', content: '回复内容' }`

#### Scenario: 含 tool_calls 的 assistant 消息
- **WHEN** 输入包含 `role: 'assistant', tool_calls: [{ id, function: { name, arguments } }]` 的消息
- **THEN** 返回的 DisplayMessage 的 `parts` 中包含 `{ type: 'tool-call', toolCallId, toolName, args, state: 'completed' }` 部分

### Requirement: toDisplayMessages tool result 合并

#### Scenario: tool result 合入 assistant 消息
- **WHEN** 存在 assistant 消息（含 tool_call id="tc1"）和对应的 `role: 'tool', tool_call_id: "tc1"` 消息
- **THEN** tool result 作为 `{ type: 'tool-result', toolCallId: 'tc1', toolName, result }` 出现在同一 assistant 消息的 `parts` 中

#### Scenario: tool result JSON 解析
- **WHEN** tool result 的 `content` 为有效 JSON 字符串
- **THEN** `result` 字段为解析后的对象
- **WHEN** tool result 的 `content` 为无效 JSON
- **THEN** `result` 字段保留原始字符串

#### Scenario: toolName 正确关联
- **WHEN** tool result 的 tool_call_id 对应到 assistant 消息中的 tool_call
- **THEN** tool result 的 `toolName` 等于对应 tool_call 的 `function.name`
- **WHEN** 找不到对应的 tool_call
- **THEN** `toolName` 为 `"unknown"`

### Requirement: confirm_operation 状态推导

#### Scenario: confirmed 状态
- **WHEN** assistant 调用 confirm_operation 工具
- **AND** 后续存在 hidden user 消息（不含"已拒绝"）
- **AND** 该 hidden 消息后无 assistant 响应
- **THEN** 对应 tool result 的 `_status` 为 `"confirmed"`

#### Scenario: cancelled 状态
- **WHEN** assistant 调用 confirm_operation 工具
- **AND** 后续 hidden user 消息包含"已拒绝"
- **THEN** 对应 tool result 的 `_status` 为 `"cancelled"`

#### Scenario: completed 状态
- **WHEN** assistant 调用 confirm_operation 工具
- **AND** 后续 hidden user 消息（不含"已拒绝"）
- **AND** hidden 消息后存在 assistant 响应
- **THEN** 对应 tool result 的 `_status` 为 `"completed"`

### Requirement: collect_missing_fields 状态推导

#### Scenario: submitted 状态
- **WHEN** assistant 调用 collect_missing_fields 工具
- **AND** 后续存在 hidden user 消息（不含"已取消"）
- **AND** 该 hidden 消息后无 assistant 响应
- **THEN** 对应 tool result 的 `_status` 为 `"submitted"`

#### Scenario: cancelled 状态
- **WHEN** assistant 调用 collect_missing_fields 工具
- **AND** 后续 hidden user 消息包含"已取消"
- **THEN** 对应 tool result 的 `_status` 为 `"cancelled"`

#### Scenario: completed 状态
- **WHEN** assistant 调用 collect_missing_fields 工具
- **AND** 后续 hidden user 消息（不含"已取消"）
- **AND** hidden 消息后存在 assistant 响应
- **THEN** 对应 tool result 的 `_status` 为 `"completed"`

### Requirement: _status 注入规则

#### Scenario: _status 注入到 JSON 解析结果
- **WHEN** tool result 的 content 被成功解析为对象
- **AND** 该 tool_call 存在推导的 confirmation 或 missingFields 状态
- **THEN** `_status` 字段被注入到解析后的对象中

#### Scenario: 无状态时不注入 _status
- **WHEN** tool_call 不属于 confirm_operation 或 collect_missing_fields
- **THEN** tool result 的 `result` 中不包含 `_status` 字段

### Requirement: 混合消息序列综合测试

#### Scenario: 完整对话流程
- **WHEN** 输入包含多条 user、assistant（含 tool_calls）、tool、hidden user 的混合消息序列
- **THEN** 返回的 DisplayMessage 数组正确反映所有映射规则：
  - hidden 消息不出现
  - tool 消息不单独出现（合入 assistant）
  - 各消息 id 递增
  - 状态推导和 JSON 注入正确
