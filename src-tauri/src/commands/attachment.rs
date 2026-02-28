use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use tauri::AppHandle;

use crate::db::connection;
use crate::entity::attachment;
use crate::services::attachment::AttachmentService;

/// 附件信息响应
#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AttachmentInfo {
    pub id: i64,
    pub master_id: i64,
    pub path: String,
    pub file_name: String,
    pub file_suffix: String,
    pub file_size: String,
    pub create_at: String,
}

impl From<attachment::Model> for AttachmentInfo {
    fn from(model: attachment::Model) -> Self {
        Self {
            id: model.id,
            master_id: model.master_id,
            path: model.path,
            file_name: model.file_name,
            file_suffix: model.file_suffix,
            file_size: model.file_size,
            create_at: model.create_at.to_string(),
        }
    }
}

/// 创建附件
#[tauri::command]
pub async fn create_attachment(
    app_handle: AppHandle,
    master_id: i64,
    file_name: String,
    file_suffix: String,
    file_size: String,
    file_content: Vec<u8>,
) -> Result<(i64, String), String> {
    let db = connection::get_db().ok_or("数据库未初始化")?;
    let service = AttachmentService::new((*db).clone(), app_handle);

    service
        .create_attachment(master_id, file_name, file_suffix, file_size, file_content)
        .await
}

/// 按 ID 删除附件
#[tauri::command]
pub async fn delete_attachment(app_handle: AppHandle, id: i64) -> Result<(), String> {
    let db = connection::get_db().ok_or("数据库未初始化")?;
    let service = AttachmentService::new((*db).clone(), app_handle);

    service.delete_attachment(id).await
}

/// 按路径删除附件
#[tauri::command]
pub async fn delete_attachment_by_path(
    app_handle: AppHandle,
    path: String,
) -> Result<(), String> {
    let db = connection::get_db().ok_or("数据库未初始化")?;
    let service = AttachmentService::new((*db).clone(), app_handle);

    service.delete_attachment_by_path(&path).await
}

/// 查询附件列表
#[tauri::command]
pub async fn query_attachments(
    app_handle: AppHandle,
    page: i64,
    page_size: i64,
    file_name: Option<String>,
    file_suffix: Option<String>,
    start_time: Option<String>,
    end_time: Option<String>,
    master_id: Option<i64>,
) -> Result<Vec<AttachmentInfo>, String> {
    let db = connection::get_db().ok_or("数据库未初始化")?;
    let service = AttachmentService::new((*db).clone(), app_handle);

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

    let attachments = service
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
    app_handle: AppHandle,
    id: i64,
) -> Result<(String, Vec<u8>), String> {
    let db = connection::get_db().ok_or("数据库未初始化")?;
    let service = AttachmentService::new((*db).clone(), app_handle);

    service.download_attachment(id).await
}
