use crate::entity::attachment;
use crate::services;
use crate::services::attachment::dto::AttachmentInfo;
use chrono::{DateTime, Utc};
use tauri::AppHandle;

/// 创建附件
#[tauri::command]
pub async fn create_attachment(
    app: AppHandle,
    master_id: i64,
    file_name: String,
    file_suffix: String,
    file_size: String,
    file_content: Vec<u8>,
) -> Result<(i64, String), String> {
    let service = services::attachment_service();

    service
        .create_attachment(&app, master_id, file_name, file_suffix, file_size, file_content)
        .await
}

/// 按 ID 删除附件
#[tauri::command]
pub async fn delete_attachment(id: i64) -> Result<(), String> {
    let service = services::attachment_service();
    service.delete_attachment(id).await
}

/// 按路径删除附件
#[tauri::command]
pub async fn delete_attachment_by_path(
    path: String,
) -> Result<(), String> {
    let service = services::attachment_service();
    service.delete_attachment_by_path(&path).await
}

/// 查询附件列表
#[tauri::command]
pub async fn query_attachments(
    page: i64,
    page_size: i64,
    file_name: Option<String>,
    file_suffix: Option<String>,
    start_time: Option<String>,
    end_time: Option<String>,
    master_id: Option<i64>,
) -> Result<Vec<AttachmentInfo>, String> {
    let service = services::attachment_service();

    // 解析时间参数
    let start_dt: Option<DateTime<Utc>> = if let Some(start) = start_time {
        Some(
            DateTime::parse_from_rfc3339(&start)
                .map_err(|e| format!("开始时间格式错误: {}", e))?
                .with_timezone(&Utc),
        )
    } else {
        None
    };

    let end_dt: Option<DateTime<Utc>> = if let Some(end) = end_time {
        Some(
            DateTime::parse_from_rfc3339(&end)
                .map_err(|e| format!("结束时间格式错误: {}", e))?
                .with_timezone(&Utc),
        )
    } else {
        None
    };

    let attachments: Vec<attachment::Model> = service
        .query_attachments(
            page,
            page_size,
            file_name,
            file_suffix,
            start_dt,
            end_dt,
            master_id,
        )
        .await?;

    Ok(attachments.into_iter().map(AttachmentInfo::from).collect())
}

/// 下载附件
#[tauri::command]
pub async fn download_attachment(
    id: i64,
) -> Result<(String, Vec<u8>), String> {
    let service = services::attachment_service();
    service.download_attachment(id).await
}
