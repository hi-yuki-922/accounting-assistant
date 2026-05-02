# Display Tool Rendering

## Purpose

定义展示工具结果的渲染机制，包括 tool-call Part 隐藏、非展示/非交互工具的 tool-result 过滤、展示工具结果通过上下文查找源数据渲染、交互工具结果渲染保持不变，以及源工具映射表的维护。

## Requirements

### Requirement: tool-call Part 全部隐藏

PartRenderer 在渲染 `tool-call` 类型的 Part 时 SHALL 返回 null，不渲染任何内容。

#### Scenario: 搜索工具调用隐藏
- **WHEN** 渲染 `{ type: 'tool-call', toolName: 'search_orders' }` part
- **THEN** 不渲染任何内容（ToolCallIndicator 不再使用）

#### Scenario: 展示工具调用隐藏
- **WHEN** 渲染 `{ type: 'tool-call', toolName: 'display_order_list' }` part
- **THEN** 不渲染任何内容

#### Scenario: 交互工具调用隐藏
- **WHEN** 渲染 `{ type: 'tool-call', toolName: 'confirm_operation' }` part
- **THEN** 不渲染任何内容

### Requirement: 非展示/非交互工具的 tool-result 不渲染

PartRenderer 在渲染 `tool-result` 类型的 Part 时，仅当 toolName 为展示工具或交互工具时才渲染业务组件，其他工具的 tool-result 返回 null。

#### Scenario: 搜索工具结果不渲染
- **WHEN** 渲染 `{ type: 'tool-result', toolName: 'search_orders' }` part
- **THEN** 不渲染任何内容

#### Scenario: 写操作工具结果不渲染
- **WHEN** 渲染 `{ type: 'tool-result', toolName: 'create_order' }` part
- **THEN** 不渲染任何内容

#### Scenario: 基础资料工具结果不渲染
- **WHEN** 渲染 `{ type: 'tool-result', toolName: 'search_books' }` part
- **THEN** 不渲染任何内容

### Requirement: 展示工具结果通过上下文查找源数据渲染

当渲染展示工具的 `tool-result` 时，系统 SHALL 在当前消息的 parts 数组中向前查找最近的匹配源工具的 tool-result，将源数据传递给对应的业务组件。

#### Scenario: display_order_list 渲染订单卡片
- **WHEN** 渲染 `{ type: 'tool-result', toolName: 'display_order_list' }` part
- **THEN** 系统在 parts 中查找最近的 toolName 为 `search_orders` 或 `create_order` 的 tool-result
- **AND** 将该 result 数据传递给 OrderListCard 组件渲染

#### Scenario: display_order_detail 渲染订单详情卡片
- **WHEN** 渲染 `{ type: 'tool-result', toolName: 'display_order_detail' }` part
- **THEN** 系统在 parts 中查找最近的 toolName 为 `get_order_detail` 的 tool-result
- **AND** 将该 result 数据传递给 OrderDetailCard 组件渲染

#### Scenario: display_record_list 渲染记录卡片
- **WHEN** 渲染 `{ type: 'tool-result', toolName: 'display_record_list' }` part
- **THEN** 系统在 parts 中查找最近的 toolName 为 `search_records`、`create_record` 或 `update_record` 的 tool-result
- **AND** 将该 result 数据传递给 RecordListCard 组件渲染

#### Scenario: display_operation_result 渲染操作结果卡片
- **WHEN** 渲染 `{ type: 'tool-result', toolName: 'display_operation_result' }` part
- **THEN** 系统在 parts 中查找最近的 toolName 为 `settle_order`、`create_write_off`、`search_books`、`search_customers`、`search_products`、`search_categories` 或 `get_product_detail` 的 tool-result
- **AND** 将该 result 数据传递给 OperationResultCard 组件渲染

#### Scenario: 未找到源数据时的 fallback
- **WHEN** 渲染展示工具结果但 parts 中找不到匹配的源工具结果
- **THEN** 不渲染任何内容（静默跳过，不显示错误）

### Requirement: 交互工具结果渲染不变

交互工具（confirm_operation、collect_missing_fields）的 `tool-result` 渲染逻辑 SHALL 保持不变。

#### Scenario: confirm_operation 结果渲染
- **WHEN** 渲染 `{ type: 'tool-result', toolName: 'confirm_operation' }` part
- **THEN** 系统渲染 ConfirmationCard 组件（行为不变）

#### Scenario: collect_missing_fields 结果渲染
- **WHEN** 渲染 `{ type: 'tool-result', toolName: 'collect_missing_fields' }` part
- **THEN** 系统渲染 MissingFieldsForm 组件（行为不变）

### Requirement: 源工具映射表

系统 SHALL 维护一个展示工具名到源工具名列表的映射表，用于上下文查找。

映射关系 SHALL 为：
- `display_order_list` → `['search_orders', 'create_order']`
- `display_order_detail` → `['get_order_detail']`
- `display_record_list` → `['search_records', 'create_record', 'update_record']`
- `display_operation_result` → `['settle_order', 'create_write_off', 'search_books', 'search_customers', 'search_products', 'search_categories', 'get_product_detail']`

#### Scenario: 映射表完整性
- **WHEN** 新增搜索或写操作工具
- **THEN** 开发者 SHALL 同步更新映射表，将新工具名添加到对应的展示工具映射中
