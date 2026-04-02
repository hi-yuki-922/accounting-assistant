## ADDED Requirements

### Requirement: 订单实体定义
系统 SHALL 定义 `order` 实体，包含以下字段：
- `id`: i64，主键，采用日期序列模式生成（`YYYYMMDDNNNNN`）
- `order_no`: String，可读订单编号（格式 `#N`，如 `#1`, `#2`，当日序号）
- `order_type`: OrderType，订单类型（Sales / Purchase）
- `customer_id`: Option\<i64\>，关联客户 ID（散客为 None）
- `total_amount`: Decimal(19,4)，应收/应付总额（明细小计之和）
- `actual_amount`: Decimal(19,4)，实收/实付总额（抹零/让利后的最终金额）
- `status`: OrderStatus，订单状态（Pending / Settled / Cancelled）
- `channel`: Option\<AccountingChannel\>，支付/收款渠道（创建时为 None，结账时写入）
- `accounting_record_id`: Option\<i64\>，结账时关联的记账记录 ID
- `remark`: Option\<String\>，备注
- `create_at`: NaiveDateTime，创建时间
- `settled_at`: Option\<NaiveDateTime\>，结账时间

#### Scenario: 订单实体注册与同步
- **WHEN** 应用启动时执行 entity 注册
- **THEN** `order` 表被创建在 SQLite 数据库中，字段类型与上述定义一致

### Requirement: 订单序列实体定义
系统 SHALL 定义 `order_seq` 实体用于生成订单 ID，遵循现有日期序列模式：
- `date_key`: String，主键（格式 `YYYYMMDD`）
- `seq`: i32，当日序列号

#### Scenario: 序列原子递增
- **WHEN** 创建新订单时请求下一个 ID
- **THEN** 系统在事务中递增当日序列号，返回格式为 `YYYYMMDD` + 5位序列号拼接的 i64 值

### Requirement: 订单明细实体定义
系统 SHALL 定义 `order_item` 实体，包含以下字段：
- `id`: i64，主键，自增
- `order_id`: i64，关联订单 ID
- `product_id`: i64，关联商品 ID
- `product_name`: String，商品名称快照（冗余存储）
- `quantity`: Decimal(19,4)，数量（支持小数，如 0.5 斤）
- `unit`: String，计量单位快照（冗余存储）
- `unit_price`: Decimal(19,4)，成交单价
- `subtotal`: Decimal(19,4)，小计（= quantity × unit_price）
- `remark`: Option\<String\>，备注

#### Scenario: 订单明细实体注册与同步
- **WHEN** 应用启动时执行 entity 注册
- **THEN** `order_item` 表被创建在 SQLite 数据库中，字段类型与上述定义一致

### Requirement: OrderType 枚举定义
系统 SHALL 定义 `OrderType` 枚举，包含以下值：
- `Sales`：销售订单
- `Purchase`：采购订单

枚举在 SQLite 中以字符串形式存储。

#### Scenario: 枚举存储与读取
- **WHEN** 保存 OrderType::Sales 到数据库
- **THEN** 存储为字符串 "Sales"
- **WHEN** 从数据库读取字符串 "Sales"
- **THEN** 解析为 OrderType::Sales

### Requirement: OrderStatus 枚举定义
系统 SHALL 定义 `OrderStatus` 枚举，包含以下值：
- `Pending`：待结账
- `Settled`：已结账
- `Cancelled`：已取消

枚举在 SQLite 中以字符串形式存储。

#### Scenario: 枚举存储与读取
- **WHEN** 保存 OrderStatus::Pending 到数据库
- **THEN** 存储为字符串 "Pending"
- **WHEN** 从数据库读取字符串 "Pending"
- **THEN** 解析为 OrderStatus::Pending
