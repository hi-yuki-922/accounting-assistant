## ADDED Requirements

### Requirement: 创建订单
系统 SHALL 提供 `create_order` 方法，接收订单类型、客户 ID（可选）、订单明细列表、支付渠道、备注，创建新订单。

#### Scenario: 创建销售订单
- **WHEN** 调用 `create_order` 传入 order_type=Sales、明细列表（含 product_id、product_name、quantity、unit、unit_price）、channel
- **THEN** 系统生成日期序列 ID 和可读订单编号（ORD-YYYYMMDD-NNNNN）
- **THEN** 系统计算 total_amount 为所有明细 subtotal 之和
- **THEN** 系统设置 actual_amount 等于 total_amount（初始相等）
- **THEN** 系统设置 status 为 Pending
- **THEN** 系统创建 order 记录和所有 order_item 记录
- **THEN** 操作 MUST 在事务中执行

#### Scenario: 创建采购订单
- **WHEN** 调用 `create_order` 传入 order_type=Purchase、明细列表、channel
- **THEN** 系统创建采购订单，逻辑与销售订单一致
- **THEN** order_type 为 Purchase

#### Scenario: 创建散客订单
- **WHEN** 调用 `create_order` 时不传 customer_id（为 None）
- **THEN** 系统创建订单，customer_id 为 None

#### Scenario: 创建订单时指定实收金额
- **WHEN** 调用 `create_order` 时传入 actual_amount 与 total_amount 不同
- **THEN** 系统使用传入的 actual_amount（覆盖默认值）
- **THEN** actual_amount 可小于 total_amount（让利/抹零）

#### Scenario: 创建订单明细为空
- **WHEN** 调用 `create_order` 时明细列表为空
- **THEN** 系统 MUST 返回错误，提示订单明细不能为空

### Requirement: 结账订单
系统 SHALL 提供 `settle_order` 方法，将 Pending 订单结账，自动生成关联的记账记录。

#### Scenario: 销售订单结账
- **WHEN** 调用 `settle_order` 传入 Pending 状态的销售订单 ID
- **THEN** 系统 MUST 创建一条 accounting_record，accounting_type 为 Income
- **THEN** accounting_record.amount 为订单的 actual_amount
- **THEN** accounting_record.channel 为订单的 channel
- **THEN** accounting_record.order_id 为订单 ID
- **THEN** accounting_record.book_id 为 None（归入默认账本）
- **THEN** accounting_record.title 为 "销售订单-{order_no}"
- **THEN** accounting_record.state 为 Posted
- **THEN** 系统 MUST 更新订单 status 为 Settled，settled_at 为当前时间
- **THEN** 系统 MUST 更新订单 accounting_record_id 为新创建的记账记录 ID
- **THEN** 系统 MUST 更新默认账本的 record_count +1
- **THEN** 以上操作 MUST 在同一事务中执行

#### Scenario: 采购订单结账
- **WHEN** 调用 `settle_order` 传入 Pending 状态的采购订单 ID
- **THEN** 系统 MUST 创建 accounting_record，accounting_type 为 Expenditure
- **THEN** accounting_record.title 为 "采购订单-{order_no}"
- **THEN** 其余逻辑与销售订单结账一致

#### Scenario: 结账时指定实际金额
- **WHEN** 调用 `settle_order` 传入 actual_amount 参数
- **THEN** 系统 MUST 更新订单的 actual_amount 为传入值
- **THEN** accounting_record.amount 使用更新后的 actual_amount

#### Scenario: 结账已结账的订单
- **WHEN** 调用 `settle_order` 传入已结账（Settled）的订单 ID
- **THEN** 系统 MUST 返回错误，提示订单已结账

#### Scenario: 结账已取消的订单
- **WHEN** 调用 `settle_order` 传入已取消（Cancelled）的订单 ID
- **THEN** 系统 MUST 返回错误，提示订单已取消

#### Scenario: 结账不存在的订单
- **WHEN** 调用 `settle_order` 传入不存在的订单 ID
- **THEN** 系统 MUST 返回错误，提示订单不存在

### Requirement: 取消订单
系统 SHALL 提供 `cancel_order` 方法，将 Pending 订单标记为已取消。

#### Scenario: 成功取消订单
- **WHEN** 调用 `cancel_order` 传入 Pending 状态的订单 ID
- **THEN** 系统 MUST 更新订单 status 为 Cancelled
- **THEN** 系统 MUST 不创建记账记录

#### Scenario: 取消已结账的订单
- **WHEN** 调用 `cancel_order` 传入已结账（Settled）的订单 ID
- **THEN** 系统 MUST 返回错误，提示已结账订单不可取消

#### Scenario: 取消不存在的订单
- **WHEN** 调用 `cancel_order` 传入不存在的订单 ID
- **THEN** 系统 MUST 返回错误，提示订单不存在

### Requirement: 查询所有订单
系统 SHALL 提供 `get_all_orders` 方法，返回所有订单列表（不含明细）。

#### Scenario: 查询订单列表
- **WHEN** 调用 `get_all_orders`
- **THEN** 系统返回所有订单记录，按创建时间倒序排列

### Requirement: 根据 ID 查询订单（含明细）
系统 SHALL 提供 `get_order_by_id` 方法，返回单个订单及其所有明细。

#### Scenario: 查询存在的订单
- **WHEN** 调用 `get_order_by_id` 传入已存在的订单 ID
- **THEN** 系统返回订单信息及其所有 order_item 明细

#### Scenario: 查询不存在的订单
- **WHEN** 调用 `get_order_by_id` 传入不存在的订单 ID
- **THEN** 系统返回 None

### Requirement: 按客户查询订单
系统 SHALL 提供 `get_orders_by_customer_id` 方法，返回指定客户的所有订单。

#### Scenario: 查询客户的订单
- **WHEN** 调用 `get_orders_by_customer_id` 传入客户 ID
- **THEN** 系统返回该客户关联的所有订单，按创建时间倒序排列

### Requirement: 按状态筛选订单
系统 SHALL 提供 `get_orders_by_status` 方法，返回指定状态的订单列表。

#### Scenario: 查询待结账订单
- **WHEN** 调用 `get_orders_by_status` 传入 OrderStatus::Pending
- **THEN** 系统返回所有 Pending 状态的订单
