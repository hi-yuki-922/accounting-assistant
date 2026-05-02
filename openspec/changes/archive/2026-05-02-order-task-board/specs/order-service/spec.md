## MODIFIED Requirements

### Requirement: 创建订单
系统 SHALL 提供创建订单的能力。创建时 MUST 接受 order_type、可选的 customer_id、可选的 customer_name、order_items 数组、可选的 actual_amount 和 sub_type。系统 MUST 验证订单项非空，计算 total_amount 为所有订单项 subtotal 之和，actual_amount 默认等于 total_amount。

系统 MUST 根据 order_type 和 customer_id 自动填充 sub_type 默认值（如未提供）：
- Sales + 有客户 → Wholesale
- Sales + 无客户 → Retail
- Purchase → WholesalePurchase

系统 MUST 验证 sub_type 与 order_type 的对应关系。

#### Scenario: 创建销售订单自动填充批发类型
- **WHEN** 创建销售订单，选择了客户，未指定 sub_type
- **THEN** sub_type 自动设为 Wholesale

#### Scenario: 创建销售订单无客户默认零售
- **WHEN** 创建销售订单，未选择客户，未指定 sub_type
- **THEN** sub_type 自动设为 Retail

#### Scenario: 创建采购订单默认批发进货
- **WHEN** 创建采购订单，未指定 sub_type
- **THEN** sub_type 自动设为 WholesalePurchase

#### Scenario: sub_type 与 order_type 不匹配
- **WHEN** 创建销售订单但 sub_type 为 WholesalePurchase 或 PeerTransfer
- **THEN** 系统拒绝创建并返回错误

#### Scenario: 成功创建订单
- **WHEN** 提供有效的订单类型、订单项和金额
- **THEN** 创建订单记录和关联的订单项记录，返回完整订单数据

#### Scenario: 创建订单时存储客户名称
- **WHEN** 创建订单时传入 customer_id 和 customer_name
- **THEN** 订单记录中 customer_name 字段存储传入的客户名称

#### Scenario: 创建订单时无客户名称
- **WHEN** 创建订单时未传入 customer_name 或 customer_id
- **THEN** 订单记录中 customer_name 字段为 None
