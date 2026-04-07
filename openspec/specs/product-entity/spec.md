# 商品实体（product-entity）

## Purpose

定义商品（product）相关的数据库实体，包括商品实体和商品序列实体。

## Requirements

### Requirement: 商品实体定义
系统 SHALL 定义 `product` 实体，包含以下字段：
- `id`: i64，主键，非自增，使用 YYYYMMDDNNNNN 格式生成
- `name`: String，商品名称
- `category_id`: Option<i64>，品类外键，关联 `category.id`
- `category`: Option<String>，品类名称（冗余字段，与 category_id 对应的品类名称同步）
- `unit`: String，计量单位
- `default_sell_price`: Option<Decimal(19,4)>，默认销售参考价
- `default_purchase_price`: Option<Decimal(19,4)>，默认采购参考价
- `sku`: Option<String>，商品编码
- `keywords`: Option<String>，搜索关键词，以分号分隔
- `remark`: Option<String>，备注
- `create_at`: NaiveDateTime，创建时间戳

#### Scenario: 商品实体包含品类关联
- **WHEN** 系统创建商品实体定义
- **THEN** 实体包含 category_id（Option<i64>）字段和 category（Option<String>）冗余字段

#### Scenario: 商品与品类关联关系
- **WHEN** 定义商品实体的 Relation
- **THEN** 定义 belongs_to 关系：category_id → category.id

#### Scenario: 商品 ID 生成
- **WHEN** 创建新商品时调用 ID 生成方法
- **THEN** 生成格式为 YYYYMMDDNNNNN 的唯一 i64 ID

### Requirement: 商品序列实体
系统 SHALL 定义 `product_seq` 序列实体，用于商品 ID 的原子生成。使用标准 date_key + seq 模式，返回 YYYYMMDD + 5 位序列号作为 i64。

#### Scenario: 序列原子递增
- **WHEN** 并发创建商品时
- **THEN** 序列号原子递增，保证 ID 唯一
