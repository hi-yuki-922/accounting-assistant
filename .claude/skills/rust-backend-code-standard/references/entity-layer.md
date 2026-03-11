# 实体层 (Entity)

## Entity-First 原则

Sea-ORM 实体优先定义，然后同步数据库架构。这意味着：
1. 先在代码中定义实体结构
2. 应用启动时自动创建/更新数据库表结构

## 实体定义

### 基本结构

```rust
use chrono::NaiveDateTime;
use rust_decimal::Decimal;
use serde::{Deserialize, Serialize};
use sea_orm::entity::prelude::*;

#[derive(Clone, Debug, PartialEq, Eq, DeriveEntityModel, Deserialize, Serialize)]
#[sea_orm(table_name = "accounting_record")]
pub struct Model {
    #[sea_orm(primary_key, auto_increment = false)]
    pub id: i64,

    #[sea_orm(column_type = "Decimal(Some((19, 4)))")]
    pub amount: Decimal,

    pub record_time: NaiveDateTime,
    pub accounting_type: AccountingType,
    pub title: String,
    pub channel: AccountingChannel,
    pub remark: Option<String>,
    pub write_off_id: Option<i64>,
    pub create_at: NaiveDateTime,
    pub state: AccountingRecordState,
    pub book_id: Option<i64>,
}
```

### 字段类型映射

| Rust 类型 | 数据库类型 | 说明 |
|----------|-----------|------|
| `i64` | INTEGER | 主键、ID |
| `Decimal` | DECIMAL(19,4) | 金额 |
| `String` | TEXT | 文本 |
| `NaiveDateTime` | DATETIME | 日期时间 |
| `Option<T>` | NULLABLE | 可空字段 |
| 自定义枚举 | TEXT | 枚举存储为中文 |

### 特殊字段标记

```rust
// 主键（禁用自增）
#[sea_orm(primary_key, auto_increment = false)]
pub id: i64,

// 精确数值类型
#[sea_orm(column_type = "Decimal(Some((19, 4)))")]
pub amount: Decimal,

// 可选字段
pub remark: Option<String>,
```

## ActiveModel 使用

### 插入数据

```rust
use sea_orm::ActiveValue;

let new_record = ActiveModel {
    id: ActiveValue::Set(id),
    amount: ActiveValue::Set(amount),
    record_time: ActiveValue::Set(record_time),
    accounting_type: ActiveValue::Set(accounting_type),
    title: ActiveValue::Set(title),
    channel: ActiveValue::Set(channel),
    remark: ActiveValue::Set(remark),
    write_off_id: ActiveValue::Set(write_off_id),
    create_at: ActiveValue::Set(Local::now().naive_local()),
    state: ActiveValue::Set(AccountingRecordState::PendingPosting),
    book_id: ActiveValue::Set(book_id),
};

let inserted = new_record.insert(&db).await?;
```

### 更新数据

```rust
// 从现有 Model 转换
let mut active_model: ActiveModel = record.into();

// 只更新特定字段
active_model.amount = ActiveValue::Set(new_amount);
active_model.title = ActiveValue::Set(new_title);

let updated = active_model.update(&db).await?;
```

### ActiveValue 状态

```rust
// Set: 设置值
ActiveValue::Set(value)

// NotSet: 不设置（插入时使用默认值）
ActiveValue::NotSet
```

## 关联关系

### 定义关联

```rust
#[derive(Copy, Clone, Debug, EnumIter)]
pub enum Relation {
    AccountingBook,
}

impl RelationTrait for Relation {
    fn def(&self) -> RelationDef {
        match self {
            Self::AccountingBook => Entity::belongs_to(super::accounting_book::Entity)
                .from(Column::BookId)
                .to(super::accounting_book::Column::Id)
                .into(),
        }
    }
}
```

### 关联查询

```rust
// 查询关联实体
let records = Entity::find()
    .find_also_related(AccountingBook)
    .all(&db)
    .await?;
```

## ActiveModelBehavior

实现默认值和行为：

```rust
impl ActiveModelBehavior for ActiveModel {
    fn new() -> Self {
        use chrono::Local;
        let now = Local::now().naive_local();

        Self {
            id: sea_orm::ActiveValue::NotSet,
            amount: sea_orm::ActiveValue::NotSet,
            record_time: sea_orm::ActiveValue::NotSet,
            // 设置默认值
            create_at: sea_orm::ActiveValue::Set(now),
            state: sea_orm::ActiveValue::Set(AccountingRecordState::PendingPosting),
            remark: sea_orm::ActiveValue::Set(None),
            // ...
        }
    }
}
```

## 实体方法

在 `impl Model` 块中添加实体相关方法：

```rust
impl Model {
    /// 生成唯一 ID，格式为 YYYYMMDDNNNNN
    pub async fn generate_id(db: &DatabaseConnection) -> Result<i64, Box<dyn std::error::Error>> {
        let now = Local::now();
        let date_str = now.format("%Y%m%d").to_string();
        let date_int = date_str.parse::<i32>().unwrap_or(20210101);

        // 获取下一个序列号
        let next_seq = super::accounting_record_seq::Model::get_next_sequence(db, date_int).await?;

        let id_str = format!("{}{:05}", date_int, next_seq);
        Ok(id_str.parse::<i64>().unwrap())
    }
}
```

## 实体注册

在应用初始化时注册所有实体：

```rust
// entity/mod.rs
pub mod accounting_record;
pub mod accounting_record_seq;
pub mod accounting_book;
pub mod accounting_book_seq;
pub mod attachment;
mod prelude;

pub async fn with_install_entities(
    db: &sea_orm::DatabaseConnection
) -> Result<(), Box<dyn std::error::Error>> {
    db.get_schema_builder()
        .register(accounting_record::Entity)
        .register(accounting_record_seq::Entity)
        .register(accounting_book::Entity)
        .register(attachment::Entity)
        .sync(db)  // 同步表结构
        .await?;

    Ok(())
}
```

## 序列表设计

用于生成唯一 ID：

```rust
#[derive(Clone, Debug, PartialEq, Eq, DeriveEntityModel)]
#[sea_orm(table_name = "accounting_record_seq")]
pub struct Model {
    #[sea_orm(primary_key)]
    pub date_key: i32,  // YYYYMMDD

    #[sea_orm(primary_key)]
    pub seq: i32,  // 序列号
}

impl Model {
    pub async fn get_next_sequence(db: &DatabaseConnection, date_key: i32) -> Result<i32, Error> {
        // 获取或创建序列记录
        // 返回下一个序列号
    }
}
```

## 文件组织

每个实体一个文件：

```
entity/
├── mod.rs              # 模块声明和注册
├── prelude.rs          # 公共导出
├── accounting_record.rs
├── accounting_record_seq.rs
├── accounting_book.rs
├── accounting_book_seq.rs
└── attachment.rs
```
