## ADDED Requirements

### Requirement: 通知工具覆盖
系统 SHALL 在 AI 工具注册表中新增 `notify_board_refresh` 工具，归类为通知工具。该工具在订单写操作成功后调用，通知前端看板按订单类型刷新。

#### Scenario: notify_board_refresh 入参
- **WHEN** 调用 `notify_board_refresh` 工具
- **THEN** 入参包含必填的 `orderType`（Sales/Purchase/All），指示需要刷新的订单类型范围

#### Scenario: getAllTools 包含通知工具
- **WHEN** 调用 `getAllTools()`
- **THEN** 返回的工具对象包含 `notify_board_refresh`

## MODIFIED Requirements

### Requirement: 订单工具覆盖
订单工具 SHALL 提供以下能力：
- `search_orders` — 按条件搜索订单，调用 `orderApi.queryOrders(...)`，支持按日期范围、状态、金额范围、支付渠道、订单类型筛选
- `get_order_detail` — 获取订单详情（含明细），调用 `orderApi.getOrderById({ id })`
- `create_order` — 创建订单，调用 `orderApi.createOrder(...)`，入参包含订单类型、客户、客户名称、商品明细列表
- `settle_order` — 订单结账，调用 `orderApi.settleOrder(...)`，入参包含订单 ID、支付渠道、实收金额

#### Scenario: create_order 入参
- **WHEN** 调用 `create_order` 工具
- **THEN** 入参包含必填的 `orderType`（Sales/Purchase）、`items`（商品明细数组），可选的 `customerId`、`customerName`、`remark`、`actualAmount`、`subType`

#### Scenario: create_order 传入客户名称
- **WHEN** 调用 `create_order` 工具且指定了 customerId
- **THEN** 入参 MUST 同时包含 customerName，与客户 ID 对应
