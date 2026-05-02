## MODIFIED Requirements

### Requirement: 订单实体定义
系统 SHALL 定义 `order` 实体，包含以下字段：
- `id`: i64，主键，非自增，使用 YYYYMMDDNNNNN 格式生成
- `order_no`: String，可读订单号，格式为 `#N`
- `order_type`: OrderType，订单类型（Sales 或 Purchase），以字符串存储
- `customer_id`: Option<i64>，客户外键
- `customer_name`: Option<String>，客户名称冗余快照
- `total_amount`: Decimal(19,4)，应收/应付总额
- `actual_amount`: Decimal(19,4)，实收/实付总额
- `sub_type`: OrderSubType，订单业务类型（批发/零售/批发进货/同行调货），以字符串存储
- `status`: OrderStatus，订单状态（Pending/Settled/Cancelled），以字符串存储
- `channel`: AccountingChannel，支付渠道，以字符串存储
- `remark`: Option<String>，备注
- `create_at`: NaiveDateTime，创建时间
- `settled_at`: Option<NaiveDateTime>，结算时间

#### Scenario: 订单实体字段完整
- **WHEN** 系统创建订单实体定义
- **THEN** 实体包含 id、order_no、order_type、customer_id、customer_name、total_amount、actual_amount、sub_type、status、channel、remark、create_at、settled_at 字段

#### Scenario: 订单实体不包含 accounting_record_id
- **WHEN** 定义订单实体
- **THEN** 不包含 accounting_record_id 字段，记账记录关联通过 accounting_record.order_id 反查

#### Scenario: 客户名称快照语义
- **WHEN** 创建订单时传入客户名称
- **THEN** customer_name 作为创建时刻的快照存储，后续客户名称变更不影响历史订单
