## MODIFIED Requirements

### Requirement: AccountingRecord 实体结构
系统 SHALL 定义 AccountingRecord 实体，包含以下字段：
- `id`: i64 类型，主键
- `amount`: Decimal 类型，金额
- `record_time`: NaiveDateTime 类型，记录时间
- `accounting_type`: AccountingType 枚举，记账类型
- `channel`: AccountingChannel 枚举，渠道
- `title`: String 类型，标题
- `remark`: Option<String> 类型，备注
- `write_off_id`: Option<i64> 类型，冲销 ID
- `create_at`: NaiveDateTime 类型，创建时间
- `state`: AccountingRecordState 枚举，记录状态
- `book_id`: Option<i64> 类型，关联账本 ID

#### Scenario: 实体包含 book_id 字段
- **WHEN** 定义 AccountingRecord 实体
- **THEN** 实体包含 book_id 字段
- **AND** book_id 为 Option<i64> 类型
- **AND** book_id 允许为 NULL（表示未归类）

#### Scenario: 实体关系定义
- **WHEN** 定义 AccountingRecord 实体关系
- **THEN** 存在到 AccountingBook 的关联关系
- **AND** 关系字段为 book_id
