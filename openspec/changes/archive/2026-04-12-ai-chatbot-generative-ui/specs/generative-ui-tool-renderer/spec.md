## ADDED Requirements

### Requirement: ToolResultRenderer 分发器

系统 SHALL 提供 `ToolResultRenderer` 组件，在渲染 `tool-result` part 时根据 `toolName` 查找并渲染对应的业务组件。

#### Scenario: 已注册工具的渲染

- **WHEN** 渲染一个 tool-result part 且其 toolName 在 toolRenderMap 中存在映射
- **THEN** 系统 SHALL 将 `result` 数据传递给映射表中对应的 React 组件进行渲染

#### Scenario: 未注册工具的 fallback

- **WHEN** 渲染一个 tool-result part 且其 toolName 不在 toolRenderMap 中
- **THEN** 系统 SHALL fallback 到纯文本展示，将 result 以可读格式呈现

### Requirement: toolName 到组件的映射表

系统 SHALL 维护一个 `toolRenderMap` 映射表，将 toolName 映射到对应的 React 组件。

映射表 SHALL 包含以下映射：
- `search_orders` → OrderListCard
- `get_order_detail` → OrderDetailCard
- `create_order` → OrderListCard
- `settle_order` → OperationResultCard
- `search_records` → RecordListCard
- `create_record` → RecordListCard
- `update_record` → RecordListCard
- `create_write_off` → OperationResultCard
- `search_books` → OperationResultCard
- `search_customers` → OperationResultCard
- `search_products` → OperationResultCard
- `search_categories` → OperationResultCard
- `get_product_detail` → OperationResultCard

#### Scenario: 映射表的类型安全

- **WHEN** 组件从映射表获取渲染组件
- **THEN** 所有映射组件 SHALL 接受统一的 `{ result: unknown }` props 类型

### Requirement: 渲染层按 Part 类型分发

系统 SHALL 将渲染循环从纯文本渲染改为按 part 类型分发到对应组件。

#### Scenario: text part 渲染

- **WHEN** 渲染 `{ type: 'text' }` part
- **THEN** 系统 SHALL 使用 `MessageResponse` 组件渲染文本内容

#### Scenario: tool-call part 渲染

- **WHEN** 渲染 `{ type: 'tool-call' }` part
- **THEN** 系统 SHALL 使用 `ToolCallIndicator` 组件，显示工具名称和执行状态（calling/completed/error）

#### Scenario: tool-result part 渲染

- **WHEN** 渲染 `{ type: 'tool-result' }` part
- **THEN** 系统 SHALL 使用 `ToolResultRenderer` 组件，根据 toolName 分发到具体业务组件
