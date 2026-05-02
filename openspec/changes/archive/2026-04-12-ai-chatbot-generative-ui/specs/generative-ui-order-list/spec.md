## ADDED Requirements

### Requirement: OrderListCard 订单列表展示

系统 SHALL 提供 `OrderListCard` 组件，在搜索或创建订单后以卡片形式展示订单列表。

#### Scenario: 搜索订单结果展示

- **WHEN** Agent 调用 `search_orders` 工具并返回订单列表
- **THEN** 系统 SHALL 渲染 OrderListCard，展示匹配的订单摘要信息（订单编号、客户、金额、状态）

#### Scenario: 创建订单结果展示

- **WHEN** Agent 调用 `create_order` 工具并返回新创建的订单
- **THEN** 系统 SHALL 渲染 OrderListCard，展示新创建的订单信息

#### Scenario: 订单行点击交互

- **WHEN** 用户点击 OrderListCard 中的某一行订单
- **THEN** 系统 SHALL 打开现有的 `OrderDetailDialog` 弹窗，展示该订单的完整详情

#### Scenario: 空列表处理

- **WHEN** 搜索结果为空（无匹配订单）
- **THEN** 系统 SHALL 显示"未找到匹配的订单"提示信息

### Requirement: OperationResultCard 操作结果展示

系统 SHALL 提供 `OperationResultCard` 组件，用于展示非列表类型的工具操作结果。

#### Scenario: 结账操作结果

- **WHEN** Agent 调用 `settle_order` 工具并返回操作结果
- **THEN** 系统 SHALL 渲染 OperationResultCard，展示操作成功/失败状态及关键信息

#### Scenario: 查询类工具结果

- **WHEN** Agent 调用查询类工具（search_books、search_customers、search_products、search_categories、get_product_detail）并返回结果
- **THEN** 系统 SHALL 渲染 OperationResultCard，以可读格式展示查询结果
