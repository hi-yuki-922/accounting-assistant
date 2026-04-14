use crate::services::chat::dto::CreateSessionDto;
use crate::services::chat::ChatService;
use tauri::State;

/// 创建聊天会话
#[tauri::command]
pub async fn create_chat_session(
    service: State<'_, ChatService>,
    input: CreateSessionDto,
) -> Result<crate::entity::chat_session::Model, String> {
    service
        .create_session(input)
        .await
        .map_err(|e| e.to_string())
}

/// 获取所有聊天会话
#[tauri::command]
pub async fn get_all_chat_sessions(
    service: State<'_, ChatService>,
) -> Result<Vec<crate::entity::chat_session::Model>, String> {
    service.get_all_sessions().await.map_err(|e| e.to_string())
}

/// 根据 ID 获取聊天会话
#[tauri::command]
pub async fn get_chat_session(
    service: State<'_, ChatService>,
    id: i64,
) -> Result<Option<crate::entity::chat_session::Model>, String> {
    service
        .get_session_by_id(id)
        .await
        .map_err(|e| e.to_string())
}

/// 更新聊天会话标题
#[tauri::command]
pub async fn update_chat_session_title(
    service: State<'_, ChatService>,
    id: i64,
    title: String,
) -> Result<crate::entity::chat_session::Model, String> {
    service
        .update_session_title(id, title)
        .await
        .map_err(|e| e.to_string())
}

/// 删除聊天会话
#[tauri::command]
pub async fn delete_chat_session(service: State<'_, ChatService>, id: i64) -> Result<u64, String> {
    service
        .delete_session(id)
        .await
        .map_err(|e| e.to_string())
        .map(|result| result.rows_affected)
}

/// 更新会话字段（summary、title_auto_generated、summary_generated、title）
#[tauri::command]
pub async fn update_chat_session_fields(
    service: State<'_, ChatService>,
    id: i64,
    summary: Option<String>,
    title_auto_generated: Option<bool>,
    summary_generated: Option<bool>,
    title: Option<String>,
) -> Result<crate::entity::chat_session::Model, String> {
    service
        .update_session_fields(id, summary, title_auto_generated, summary_generated, title)
        .await
        .map_err(|e| e.to_string())
}

/// 创建节摘要
#[tauri::command]
pub async fn create_section_summary(
    service: State<'_, ChatService>,
    session_id: i64,
    section_file: String,
    title: Option<String>,
    summary: String,
) -> Result<crate::entity::section_summary::Model, String> {
    service
        .create_section_summary(session_id, section_file, title, summary)
        .await
        .map_err(|e| e.to_string())
}

/// 获取指定会话的节摘要
#[tauri::command]
pub async fn get_section_summaries(
    service: State<'_, ChatService>,
    session_id: i64,
) -> Result<Vec<crate::entity::section_summary::Model>, String> {
    service
        .get_summaries_by_session(session_id)
        .await
        .map_err(|e| e.to_string())
}
