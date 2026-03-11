# 服务层 (Services)

## 服务结构

每个服务持有数据库连接：

```rust
use sea_orm::DatabaseConnection;

/// 记账服务
#[derive(Debug)]
pub struct AccountingService {
    db: DatabaseConnection,
}

impl AccountingService {
    pub fn new(db: DatabaseConnection) -> Self {
        Self { db }
    }
}
```

## 方法命名

### CRUD 操作标准命名

| 操作 | 方法名前缀 | 示例 |
|-----|-----------|------|
| 创建 | `add_`, `create_` | `add_record`, `create_attachment` |
| 查询单个 | `get_`, `find_` | `get_record`, `find_by_id` |
| 查询列表 | `query_`, `list_` | `query_attachments`, `list_records` |
| 更新 | `modify_`, `update_` | `modify_record`, `update_book` |
| 删除 | `delete_`, `remove_` | `delete_attachment`, `remove_record` |

### 方法签名

```rust
// 创建
pub async fn add_record(&self, input: AddAccountingRecordDto) -> Result<Model, Box<dyn std::error::Error>>

// 查询
pub async fn get_record(&self, id: i64) -> Result<Model, Box<dyn std::error::Error>>
pub async fn query_records(&self, page: i64, page_size: i64, ...) -> Result<Vec<Model>, String>

// 更新
pub async fn modify_record(&self, input: ModifyAccountingRecordDto) -> Result<Model, Box<dyn std::error::Error>>

// 删除
pub async fn delete_record(&self, id: i64) -> Result<(), String>
```

## DTO 定义

### 添加 DTO

```rust
// services/accounting/dto/mod.rs
use serde::{Deserialize, Serialize};

#[derive(Deserialize, Serialize)]
pub struct AddAccountingRecordDto {
    pub amount: f64,
    pub record_time: String,  // 格式: "YYYY-MM-DD HH:MM:SS"
    pub accounting_type: String,
    pub title: String,
    pub channel: String,
    pub remark: Option<String>,
    pub write_off_id: Option<i64>,
    pub book_id: Option<i64>,
}
```

### 修改 DTO

```rust
#[derive(Deserialize, Serialize)]
pub struct ModifyAccountingRecordDto {
    pub id: i64,
    pub amount: Option<f64>,
    pub record_time: Option<String>,
    pub accounting_type: Option<String>,
    pub title: Option<String>,
    pub remark: Option<Option<String>>,  // 允许设置为 None
}
```

## 类型转换

在 DTO 上实现类型转换方法：

```rust
impl AddAccountingRecordDto {
    pub fn to_internal_types(&self) -> Result<(Decimal, NaiveDateTime, AccountingType, AccountingChannel), String> {
        // 金额转换
        let amount_decimal = Decimal::from_f64_retain(self.amount)
            .ok_or_else(|| "金额格式无效".to_string())?;

        // 日期解析
        let parsed_datetime = NaiveDateTime::parse_from_str(&self.record_time, "%Y-%m-%d %H:%M:%S")
            .map_err(|_| "日期格式无效，期望 YYYY-MM-DD HH:MM:SS".to_string())?;

        // 枚举解析
        let parsed_type = self.accounting_type.parse::<AccountingType>()
            .map_err(|_| "记账类型无效".to_string())?;

        let parsed_channel = self.channel.parse::<AccountingChannel>()
            .map_err(|_| "支付渠道无效".to_string())?;

        Ok((amount_decimal, parsed_datetime, parsed_type, parsed_channel))
    }
}
```

## 参数验证

在服务层进行参数验证：

```rust
pub async fn create_attachment(
    &self,
    app_handle: &AppHandle,
    master_id: i64,
    file_name: String,
    file_suffix: String,
    file_size: String,
    file_content: Vec<u8>,
) -> Result<(i64, String), String> {
    // 验证必需参数
    if master_id <= 0 {
        return Err("主表记录 ID 必须大于 0".to_string());
    }

    if file_name.is_empty() {
        return Err("文件名不能为空".to_string());
    }

    // 业务逻辑验证
    let valid_suffixes = ["jpg", "png", "pdf", "doc", "docx"];
    if !valid_suffixes.contains(&file_suffix.as_str()) {
        return Err(format!("不支持的文件类型: {}", file_suffix));
    }

    // ...
}
```

## 业务规则验证

```rust
pub async fn modify_record(&self, input: ModifyAccountingRecordDto) -> Result<Model, Box<dyn std::error::Error>> {
    // 获取现有记录
    let record = Entity::find_by_id(input.id)
        .one(&self.db)
        .await?
        .ok_or("记录不存在")?;

    // 验证业务规则：只有待入账状态可修改
    if record.state != AccountingRecordState::PendingPosting {
        return Err("只有待入账状态的记录可以修改".into());
    }

    // 转换类型
    let (amount, record_time, accounting_type) = input.to_internal_types()?;

    // 更新字段
    let mut active_model: ActiveModel = record.into();

    if let Some(new_amount) = amount {
        active_model.amount = sea_orm::ActiveValue::Set(new_amount);
    }

    if let Some(new_time) = record_time {
        active_model.record_time = sea_orm::ActiveValue::Set(new_time);
    }

    let updated = active_model.update(&self.db).await?;
    Ok(updated)
}
```

## 完整服务示例

```rust
// services/attachment/mod.rs
use chrono::{DateTime, Utc};
use sea_orm::{ActiveModelTrait, ColumnTrait, DatabaseConnection, EntityTrait, QueryFilter, QueryOrder, QuerySelect};
use std::path::Path;
use tauri::AppHandle;

use crate::entity::attachment;

pub mod dto;
pub mod storage;

use storage::AttachmentStorage;

/// 附件服务
#[derive(Debug)]
pub struct AttachmentService {
    db: DatabaseConnection,
}

impl AttachmentService {
    pub fn new(db: DatabaseConnection) -> Self {
        Self { db }
    }

    /// 创建附件
    pub async fn create_attachment(
        &self,
        app_handle: &AppHandle,
        master_id: i64,
        file_name: String,
        file_suffix: String,
        file_size: String,
        file_content: Vec<u8>,
    ) -> Result<(i64, String), String> {
        // 验证参数
        if master_id <= 0 {
            return Err("主表记录 ID 必须大于 0".to_string());
        }
        if file_name.is_empty() {
            return Err("文件名不能为空".to_string());
        }

        // 保存文件
        let storage_path = AttachmentStorage::save_file(app_handle, &file_name, file_content).await?;
        let path_str = storage_path.to_str().ok_or("路径转换失败")?.to_string();

        // 创建数据库记录
        let now = Utc::now().naive_utc();
        let attachment_model = attachment::ActiveModel {
            id: sea_orm::ActiveValue::NotSet,
            master_id: sea_orm::ActiveValue::Set(master_id),
            path: sea_orm::ActiveValue::Set(path_str.clone()),
            file_name: sea_orm::ActiveValue::Set(file_name),
            file_suffix: sea_orm::ActiveValue::Set(file_suffix),
            file_size: sea_orm::ActiveValue::Set(file_size),
            create_at: sea_orm::ActiveValue::Set(now),
        };

        let result = attachment_model.insert(&self.db).await
            .map_err(|e| format!("创建附件记录失败: {}", e))?;

        Ok((result.id, path_str))
    }

    /// 查询附件列表
    pub async fn query_attachments(
        &self,
        page: i64,
        page_size: i64,
        file_name: Option<String>,
        master_id: Option<i64>,
    ) -> Result<Vec<attachment::Model>, String> {
        if page < 1 || page_size <= 0 {
            return Err("分页参数无效".to_string());
        }

        let mut query = attachment::Entity::find();

        if let Some(name) = file_name {
            if !name.is_empty() {
                query = query.filter(attachment::Column::FileName.contains(&name));
            }
        }

        if let Some(mid) = master_id {
            if mid > 0 {
                query = query.filter(attachment::Column::MasterId.eq(mid));
            }
        }

        query = query.order_by_desc(attachment::Column::CreateAt);
        query = query.limit(page_size as u64).offset(((page - 1) * page_size) as u64);

        query.all(&self.db).await.map_err(|e| format!("查询失败: {}", e))
    }
}
```
