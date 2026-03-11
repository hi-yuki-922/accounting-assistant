# 模块组织

## 模块声明

每个子目录应包含 `mod.rs` 文件作为模块声明：

```rust
// commands/mod.rs
mod accounting;
mod attachment;
mod config;
mod accounting_book;
```

## 公共导出

使用 `pub use` 重新导出常用类型，简化调用路径：

```rust
// services/mod.rs
pub mod accounting;
pub mod attachment;
pub mod accounting_book;

pub use accounting::AccountingService;
pub use accounting_book::AccountingBookService;
pub use attachment::AttachmentService;
```

## 服务初始化

服务通过 `Tauri::app.manage()` 进行依赖注入：

```rust
pub fn init_services(
    app: &App,
    db: &DatabaseConnection,
    rt: &tokio::runtime::Runtime
) -> Result<(), Box<dyn std::error::Error>> {
    let accounting_service = AccountingService::new(db.clone());
    let attachment_service = AttachmentService::new(db.clone());
    let accounting_book_service = AccountingBookService::new(db.clone());

    // 初始化默认数据
    rt.block_on(accounting_book_service.create_default_book())?;

    // 注入服务到 Tauri State
    app.manage(accounting_service);
    app.manage(attachment_service);
    app.manage(accounting_book_service);

    Ok(())
}
```

## 模块引用规则

### 引入外部 crate

在文件顶部组织引入：

```rust
// 标准库
use std::sync::Arc;
use std::path::Path;

// 外部 crate
use chrono::{DateTime, Utc};
use sea_orm::{ActiveModelTrait, ColumnTrait, DatabaseConnection, EntityTrait, QueryFilter};
use serde::{Deserialize, Serialize};

// 内部模块
use crate::entity::attachment;
use crate::services::attachment::AttachmentService;
```

### DTO 子模块

每个服务应包含 `dto` 子模块：

```rust
// services/accounting/mod.rs
pub mod dto;

use dto::{AddAccountingRecordDto, ModifyAccountingRecordDto};
```

```rust
// services/accounting/dto/mod.rs
use serde::{Deserialize, Serialize};

#[derive(Deserialize, Serialize)]
pub struct AddAccountingRecordDto {
    pub amount: f64,
    pub record_time: String,
    pub accounting_type: String,
    pub title: String,
    pub channel: String,
    pub remark: Option<String>,
    pub write_off_id: Option<i64>,
    pub book_id: Option<i64>,
}
```

## 实体模块

实体模块需要提供注册函数：

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
        .sync(db)
        .await?;

    Ok(())
}
```
