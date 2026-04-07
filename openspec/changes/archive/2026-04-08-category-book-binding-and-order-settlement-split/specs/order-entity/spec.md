## MODIFIED Requirements

### Requirement: 订单实体定义
系统 SHALL 定义 `order` 实体，包含以下字段：
- `id`: i64，主键，非自增，使用 YYYYMMDDNNNNN 格式生成
- `order_no`: String，可读订单号，格式为 `#N`
- `order_type`: OrderType，订单类型（Sales 或 Purchase），以字符串存储
- `customer_id`: Option<i64>，客户外键
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
- **THEN** 实体包含 id、order_no、order_type、customer_id、total_amount、actual_amount、sub_type、status、channel、remark、create_at、settled_at 字段

#### Scenario: 订单实体不包含 accounting_record_id
- **WHEN** 定义订单实体
- **THEN** 不包含 accounting_record_id 字段，记账记录关联通过 accounting_record.order_id 反查

### Requirement: 订单序列实体
系统 SHALL 定义 `order_seq` 序列实体，用于订单 ID 的原子生成。使用标准 date_key + seq 模式。

#### Scenario: 序列原子递增
- **WHEN** 并发创建订单时
- **THEN** 序列号原子递增，保证 ID 唯一

### Requirement: 订单项实体定义
系统 SHALL 定义 `order_item` 实体，包含以下字段：
- `id`: i64，主键，自增
- `order_id`: i64，订单外键
- `product_id`: i64，商品外键
- `product_name`: String，商品名称快照
- `quantity`: Decimal，数量（支持小数）
- `unit`: String，计量单位快照
- `unit_price`: Decimal(19,4)，成交单价
- `subtotal`: Decimal(19,4)，小计（quantity × unit_price）
- `remark`: Option<String>，备注

#### Scenario: 订单项字段完整
- **WHEN** 系统创建订单项实体定义
- **THEN** 实体包含 id、order_id、product_id、product_name、quantity、unit、unit_price、subtotal、remark 字段

### Requirement: OrderType 枚举
系统 SHALL 定义 `OrderType` 枚举，包含 `Sales` 和 `Purchase` 两个变体，以字符串形式存储。

#### Scenario: 订单类型枚举
- **WHEN** 创建订单时选择类型
- **THEN** 可选 Sales 或 Purchase

### Requirement: OrderStatus 枚举
系统 SHALL 定义 `OrderStatus` 枚举，包含 `Pending`、`Settled`、`Cancelled` 三个变体，以字符串形式存储。

#### Scenario: 订单状态枚举
- **WHEN** 订单经历不同阶段
- **THEN** 状态在 Pending → Settled 或 Pending → Cancelled 之间转换

## REMOVED Requirements

### Requirement: 订单记账记录关联字段
**Reason**: 一张订单结算后会产生多条记账记录（按品类拆分 + 冲账），单条 FK 不再适用，改为通过 accounting_record.order_id 反查。
**Migration**: 移除 order 表的 accounting_record_id 列。现有已结算订单的记账记录关联通过 accounting_record.order_id 保留。
