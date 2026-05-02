## MODIFIED Requirements

### Requirement: ToolResultRenderer 分发器

系统 SHALL 提供 `ToolResultRenderer` 组件（在 ToolResultDispatcher 中实现），在渲染 `tool-result` part 时仅处理展示工具和交互工具的结果。非展示/非交互工具的 tool-result SHALL 不渲染。

#### Scenario: 展示工具结果渲染
- **WHEN** 渲染一个 tool-result part 且其 toolName 为展示工具（display_order_list 等）
- **THEN** 系统 SHALL 从消息 parts 上下文中查找对应的源工具结果，将数据传递给映射的业务组件渲染

#### Scenario: 交互工具结果渲染
- **WHEN** 渲染一个 tool-result part 且其 toolName 为交互工具（confirm_operation、collect_missing_fields）
- **THEN** 系统 SHALL 渲染对应的交互组件（ConfirmationCard、MissingFieldsForm），行为不变

#### Scenario: 其他工具结果不渲染
- **WHEN** 渲染一个 tool-result part 且其 toolName 不为展示工具或交互工具
- **THEN** 系统 SHALL 不渲染任何内容

### Requirement: toolName 到组件的映射表

系统 SHALL 维护展示工具名到业务组件的映射表（替换原 search/write 工具的直接映射）。

映射表 SHALL 包含以下映射：
- `display_order_list` → OrderListCard
- `display_order_detail` → OrderDetailCard
- `display_record_list` → RecordListCard
- `display_operation_result` → OperationResultCard
- `confirm_operation` → ConfirmationCard
- `collect_missing_fields` → MissingFieldsForm

#### Scenario: 映射表的类型安全
- **WHEN** 组件从映射表获取渲染组件
- **THEN** 所有映射组件 SHALL 接受统一的 `{ result: unknown }` props 类型

### Requirement: 渲染层按 Part 类型分发

系统 SHALL 将渲染循环按 part 类型分发到对应组件，`tool-call` 类型不再渲染。

#### Scenario: text part 渲染
- **WHEN** 渲染 `{ type: 'text' }` part
- **THEN** 系统 SHALL 使用 `MessageResponse` 组件渲染文本内容

#### Scenario: tool-call part 不渲染
- **WHEN** 渲染 `{ type: 'tool-call' }` part
- **THEN** 系统 SHALL 不渲染任何内容（返回 null）

#### Scenario: tool-result part 按工具类型分发
- **WHEN** 渲染 `{ type: 'tool-result' }` part
- **THEN** 系统 SHALL 检查 toolName 是否为展示工具或交互工具
- **AND** 是则渲染对应组件，否则不渲染
