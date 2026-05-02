# 订单服务（order-service）

## Purpose

提供订单管理的业务逻辑层，包括订单的创建、编辑、结账、取消以及多维度查询功能。

## Requirements

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

### Requirement: 编辑订单
系统 SHALL 提供编辑 Pending 状态订单的能力，允许修改订单项和备注。编辑时 MUST 重新计算 total_amount 和 actual_amount（actual_amount 重置为新的 total_amount）。订单的 sub_type MUST NOT 允许修改。

#### Scenario: 编辑 Pending 订单
- **WHEN** 用户修改 Pending 订单的订单项
- **THEN** 系统更新订单项、重算 total_amount 和 actual_amount，sub_type 不变

#### Scenario: 编辑已结算订单被拒绝
- **WHEN** 用户尝试编辑已结算的订单
- **THEN** 系统拒绝编辑

### Requirement: 结算订单
系统 SHALL 提供结算 Pending 状态订单的能力。结算 MUST 在单个数据库事务中完成以下步骤：

1. 验证订单存在且状态为 Pending
2. 解析支付渠道，确定 final actual_amount
3. 查询所有 order_item，通过 product_id 获取对应商品的 category_id
4. 按 category_id 分组 order_items，未设置 category_id 的归入"未分类"品类
5. 为每个品类分组创建主记账记录：
   - accounting_type：Sales → Income，Purchase → Expenditure
   - amount：分组内所有 order_item 的 subtotal 之和
   - book_id：品类的 sell_book_id（销售）或 purchase_book_id（进货）
   - title："销售订单-{order_no}" 或 "采购订单-{order_no}"
   - order_id：当前订单 id
   - write_off_id：None
   - state：Posted
6. 若 total_amount ≠ actual_amount（有折扣），为每个品类分组创建冲账记录：
   - accounting_type：WriteOff
   - amount：负数，按比例分摊折扣（最后一条用补差值）
   - book_id：与主记录相同
   - title："折扣冲账-{主记录title}"
   - order_id：当前订单 id
   - write_off_id：对应的主记账记录 id
   - state：Posted
7. 更新对应账本的 record_count（每条记录 +1）
8. 更新订单状态为 Settled，设置 channel、actual_amount、settled_at

#### Scenario: 多品类订单结算
- **WHEN** 结算包含贝类（subtotal=600）和鱼类（subtotal=410.5）的销售订单，应收 1010.5，实收 1000
- **THEN** 创建两条 Income 主记录和两条 WriteOff 冲账记录，所有记录在同一事务中

#### Scenario: 无折扣结算
- **WHEN** 结算订单，应收等于实收
- **THEN** 仅创建主记账记录，不创建冲账记录

#### Scenario: 单品类结算
- **WHEN** 结算所有商品属于同一品类的订单
- **THEN** 创建一条主记录，如有折扣则创建一条冲账记录

#### Scenario: 订单已结算
- **WHEN** 尝试结算已结算的订单
- **THEN** 系统拒绝并返回错误

#### Scenario: 订单已取消
- **WHEN** 尝试结算已取消的订单
- **THEN** 系统拒绝并返回错误

### Requirement: 取消订单
系统 SHALL 提供取消 Pending 状态订单的能力。已结算的订单 MUST NOT 允许取消。

#### Scenario: 取消 Pending 订单
- **WHEN** 用户取消 Pending 状态的订单
- **THEN** 订单状态更新为 Cancelled

#### Scenario: 取消已结算订单被拒绝
- **WHEN** 用户尝试取消已结算的订单
- **THEN** 系统拒绝取消

### Requirement: 查询所有订单
系统 SHALL 提供查询所有订单的能力，按 create_at 降序排列，每条订单包含关联的订单项。

#### Scenario: 获取订单列表
- **WHEN** 用户查询所有订单
- **THEN** 返回所有订单及其订单项，按创建时间降序

### Requirement: 根据 ID 查询订单
系统 SHALL 提供根据 ID 查询单个订单的能力，包含关联的订单项。

#### Scenario: 订单存在
- **WHEN** 查询存在的订单 ID
- **THEN** 返回订单详情及其订单项

#### Scenario: 订单不存在
- **WHEN** 查询不存在的订单 ID
- **THEN** 返回错误提示

### Requirement: 根据客户 ID 查询订单
系统 SHALL 提供根据客户 ID 查询订单的能力。

#### Scenario: 查询客户订单
- **WHEN** 根据客户 ID 查询订单
- **THEN** 返回该客户的所有订单

### Requirement: 根据状态查询订单
系统 SHALL 提供根据订单状态查询订单的能力。

#### Scenario: 查询指定状态的订单
- **WHEN** 根据状态筛选订单
- **THEN** 返回匹配状态的订单列表

### Requirement: 多维度查询订单
系统 SHALL 提供多维度查询订单的能力，支持时间范围、金额范围、支付渠道、订单类型等筛选条件，并支持分页。

#### Scenario: 多条件筛选分页
- **WHEN** 用户指定多个筛选条件和分页参数
- **THEN** 返回符合条件的结果并支持分页
