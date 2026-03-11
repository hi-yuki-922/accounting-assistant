# 命令层 (Commands)

## 命令定义

使用 `#[tauri::command]` 宏定义 Tauri 命令：

```rust
use tauri::command;
use tauri::State;
use crate::services::AccountingService;

#[command]
pub async fn add_accounting_record(
    service: State<'_, AccountingService>,
    input: AddAccountingRecordDto,
) -> Result<crate::entity::accounting_record::Model, String> {
    service.add_record(input)
        .await
        .map_err(|e| e.to_string())
}
```

## 状态注入

### 服务注入

通过 `State<'_, ServiceType>` 注入服务实例：

```rust
#[command]
pub async fn query_attachments(
    service: State<'_, AttachmentService>,
    page: i64,
    page_size: i64,
    file_name: Option<String>,
) -> Result<Vec<AttachmentInfo>, String> {
    service.query_attachments(page, page_size, file_name, None).await
}
```

### AppHandle 注入

需要访问应用资源时注入 `AppHandle`：

```rust
use tauri::AppHandle;

#[command]
pub async fn create_attachment(
    app: AppHandle,
    service: State<'_, AttachmentService>,
    master_id: i64,
    file_name: String,
    file_content: Vec<u8>,
) -> Result<(i64, String), String> {
    service.create_attachment(&app, master_id, file_name, ...).await
}
```

## 参数处理

### 基本类型

```rust
#[command]
pub async fn delete_attachment(
    service: State<'_, AttachmentService>,
    id: i64,  // 直接接收基本类型
) -> Result<(), String> {
    service.delete_attachment(id).await
}
```

### DTO 类型

```rust
#[command]
pub async fn add_accounting_record(
    service: State<'_, AccountingService>,
    input: AddAccountingRecordDto,  // 自动反序列化
) -> Result<Model, String> {
    // ...
}
```

### 可选参数

```rust
#[command]
pub async fn query_attachments(
    service: State<'_, AttachmentService>,
    page: i64,
    page_size: i64,
    file_name: Option<String>,     // 可选字符串
    file_suffix: Option<String>,
    start_time: Option<String>,    // 可选时间（字符串格式）
    end_time: Option<String>,
    master_id: Option<i64>,        // 可选数字
) -> Result<Vec<AttachmentInfo>, String> {
    // 解析时间参数
    let start_dt: Option<DateTime<Utc>> = start_time
        .map(|s| DateTime::parse_from_rfc3339(&s))
        .transpose()
        .map_err(|e| format!("时间格式错误: {}", e))?
        .map(|dt| dt.with_timezone(&Utc));

    // ...
}
```

## 返回类型

### 实体 Model

```rust
#[command]
pub async fn get_record(
    service: State<'_, AccountingService>,
    id: i64,
) -> Result<Model, String> {
    // 返回实体，自动序列化为 JSON
}
```

### 列表

```rust
#[command]
pub async fn query_attachments(
    // ...
) -> Result<Vec<AttachmentInfo>, String> {
    // 返回列表
}
```

### 元组

```rust
#[command]
pub async fn download_attachment(
    service: State<'_, AttachmentService>,
    id: i64,
) -> Result<(String, Vec<u8>), String> {
    // 返回文件名和内容
}
```

### 无返回值

```rust
#[command]
pub async fn delete_attachment(
    service: State<'_, AttachmentService>,
    id: i64,
) -> Result<(), String> {
    service.delete_attachment(id).await
}
```

## 命令注册

在 `commands/mod.rs` 中集中注册所有命令：

```rust
mod accounting;
mod attachment;
mod config;
mod accounting_book;

pub fn with_install_tauri_commands(
    builder: tauri::Builder<tauri::Wry>
) -> tauri::Builder<tauri::Wry> {
    builder.invoke_handler(tauri::generate_handler![
        // 记账相关
        accounting::add_accounting_record,
        accounting::modify_accounting_record,
        accounting::post_accounting_record,

        // 附件相关
        attachment::create_attachment,
        attachment::delete_attachment,
        attachment::delete_attachment_by_path,
        attachment::query_attachments,
        attachment::download_attachment,

        // 账本相关
        accounting_book::create_book,
        accounting_book::get_books,
        accounting_book::get_book_by_id,
        accounting_book::update_book_title,
        accounting_book::delete_book,
        accounting_book::get_records_by_book_id,

        // 配置相关
        config::get_llm_config,
    ])
}
```

## 完整命令示例

```rust
// commands/attachment.rs
use crate::entity::attachment;
use crate::services::attachment::AttachmentService;
use crate::services::attachment::dto::AttachmentInfo;
use chrono::{DateTime, Utc};
use tauri::{AppHandle, State};

/// 创建附件
#[tauri::command]
pub async fn create_attachment(
    app: AppHandle,
    service: State<'_, AttachmentService>,
    master_id: i64,
    file_name: String,
    file_suffix: String,
    file_size: String,
    file_content: Vec<u8>,
) -> Result<(i64, String), String> {
    service
        .create_attachment(&app, master_id, file_name, file_suffix, file_size, file_content)
        .await
}

/// 按 ID 删除附件
#[tauri::command]
pub async fn delete_attachment(
    service: State<'_, AttachmentService>,
    id: i64,
) -> Result<(), String> {
    service.delete_attachment(id).await
}

/// 查询附件列表
#[tauri::command]
pub async fn query_attachments(
    service: State<'_, AttachmentService>,
    page: i64,
    page_size: i64,
    file_name: Option<String>,
    file_suffix: Option<String>,
    start_time: Option<String>,
    end_time: Option<String>,
    master_id: Option<i64>,
) -> Result<Vec<AttachmentInfo>, String> {
    // 解析时间参数
    let start_dt = parse_optional_datetime(start_time)?;
    let end_dt = parse_optional_datetime(end_time)?;

    let attachments = service
        .query_attachments(page, page_size, file_name, file_suffix, start_dt, end_dt, master_id)
        .await?;

    Ok(attachments.into_iter().map(AttachmentInfo::from).collect())
}

/// 下载附件
#[tauri::command]
pub async fn download_attachment(
    service: State<'_, AttachmentService>,
    id: i64,
) -> Result<(String, Vec<u8>), String> {
    service.download_attachment(id).await
}

// 辅助函数
fn parse_optional_datetime(time_str: Option<String>) -> Result<Option<DateTime<Utc>>, String> {
    match time_str {
        Some(s) => {
            let dt = DateTime::parse_from_rfc3339(&s)
                .map_err(|e| format!("时间格式错误: {}", e))?;
            Ok(Some(dt.with_timezone(&Utc)))
        }
        None => Ok(None),
    }
}
```

## 命名约定

命令函数名使用 snake_case，与前端调用保持一致：

```rust
// 命令定义
#[command]
pub async fn add_accounting_record(...) { }

// 前端调用
invoke('add_accounting_record', { ... })
```
