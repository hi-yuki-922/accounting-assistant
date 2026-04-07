## ADDED Requirements

### Requirement: 商品品类实体定义
系统 SHALL 定义 `category` 实体，包含以下字段：
- `id`: i64，主键，非自增，使用 YYYYMMDDNNNNN 格式生成
- `name`: String，品类名称，唯一且非空
- `sell_book_id`: i64，销售账本外键，关联 `accounting_book.id`，非空
- `purchase_book_id`: i64，进货账本外键，关联 `accounting_book.id`，非空
- `remark`: Option<String>，备注
- `create_at`: NaiveDateTime，创建时间

#### Scenario: 品类实体字段完整性
- **WHEN** 系统创建品类实体定义
- **THEN** 实体包含 id、name、sell_book_id、purchase_book_id、remark、create_at 字段

#### Scenario: 品类与账本关联关系
- **WHEN** 定义品类实体的 Relation
- **THEN** 定义两个 belongs_to 关系：sell_book_id → accounting_book.id、purchase_book_id → accounting_book.id

### Requirement: 品类序列实体
系统 SHALL 定义 `category_seq` 序列实体，用于品类 ID 的原子生成，与现有序列实体模式一致（date_key + seq）。

#### Scenario: 品类 ID 生成
- **WHEN** 创建新品类时调用 ID 生成方法
- **THEN** 生成格式为 YYYYMMDDNNNNN 的唯一 i64 ID

### Requirement: 默认品类自动创建
系统 SHALL 在启动时检查是否存在默认品类（名称为"未分类"），若不存在则自动创建。默认品类的 `sell_book_id` 和 `purchase_book_id` SHALL 都指向 `DEFAULT_BOOK_ID`。

#### Scenario: 首次启动创建默认品类
- **WHEN** 系统启动且不存在名称为"未分类"的品类
- **THEN** 自动创建"未分类"品类，sell_book_id 和 purchase_book_id 均为 DEFAULT_BOOK_ID

#### Scenario: 已存在默认品类时不重复创建
- **WHEN** 系统启动时已存在名称为"未分类"的品类
- **THEN** 不创建新的品类记录
