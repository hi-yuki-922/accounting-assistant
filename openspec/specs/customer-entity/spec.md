## ADDED Requirements

### Requirement: 客户实体数据模型
系统 SHALL 定义 `customer` 实体，包含以下字段：
- `id`: i64，主键，非自增，使用日期+流水号序列生成
- `name`: String，客户姓名，必填
- `category`: CustomerCategory，客户分类，必填
- `phone`: String，联系电话，必填
- `wechat`: Option<String>，微信号，可选
- `address`: Option<String>，地址，可选
- `bank_account`: Option<String>，银行账号，可选
- `remark`: Option<String>，备注，可选
- `create_at`: NaiveDateTime，创建时间，自动设置为当前时间

#### Scenario: 客户实体创建时自动填充默认值
- **WHEN** 创建新的客户 ActiveModel
- **THEN** `create_at` 自动设置为当前本地时间，`id` 为 NotSet 状态等待序列生成

### Requirement: 客户 ID 序列生成
系统 SHALL 提供 `customer_seq` 序列实体，使用日期+流水号格式生成唯一客户 ID。ID 格式为 `YYYYMMDDNNNNN`（8位日期 + 5位流水号）。

#### Scenario: 首次生成当日 ID
- **WHEN** 当天首次调用 `generate_id`
- **THEN** 序列表创建新记录，返回 `YYYYMMDD00001` 格式的 ID

#### Scenario: 连续生成当日 ID
- **WHEN** 当天非首次调用 `generate_id`
- **THEN** 序列表 seq 字段自增，返回递增的流水号

### Requirement: 客户分类枚举
系统 SHALL 定义 `CustomerCategory` 枚举，包含以下两个值：
- `Retailer` — 零售商
- `Supplier` — 供应商

枚举 SHALL 实现 Sea-ORM 的完整转换 trait（TryGetable、ValueType、From for Value、TryFromU64），以及 serde 的 Serialize/Deserialize。

#### Scenario: 枚举与数据库字符串互转
- **WHEN** 从数据库读取客户记录的 category 字段
- **THEN** 字符串 "Retailer" 正确转换为 `CustomerCategory::Retailer`，"Supplier" 正确转换为 `CustomerCategory::Supplier`

#### Scenario: 枚举序列化
- **WHEN** 将 `CustomerCategory::Retailer` 通过 serde 序列化为 JSON
- **THEN** 输出字符串 `"Retailer"`
