## ADDED Requirements

### Requirement: 商品实体定义
系统 SHALL 定义 `product` 实体，包含以下字段：
- `id`: i64，主键，采用日期序列模式生成（`YYYYMMDDNNNNN`）
- `name`: String，商品名称，非空
- `category`: Option\<String\>，商品分类
- `unit`: String，计量单位（如斤、个、箱、盒），非空
- `default_sell_price`: Option\<Decimal(19,4)\>，参考售价
- `default_purchase_price`: Option\<Decimal(19,4)\>，参考采购价
- `sku`: Option\<String\>，商品编码
- `remark`: Option\<String\>，备注
- `create_at`: NaiveDateTime，创建时间

#### Scenario: 商品实体注册与同步
- **WHEN** 应用启动时执行 entity 注册
- **THEN** `product` 表被创建在 SQLite 数据库中，字段类型与上述定义一致

### Requirement: 商品序列实体定义
系统 SHALL 定义 `product_seq` 实体用于生成商品 ID，遵循现有日期序列模式：
- `date_key`: String，主键（格式 `YYYYMMDD`）
- `seq`: i32，当日序列号

#### Scenario: 序列原子递增
- **WHEN** 创建新商品时请求下一个 ID
- **THEN** 系统在事务中递增当日序列号，返回格式为 `YYYYMMDD` + 5位序列号拼接的 i64 值
