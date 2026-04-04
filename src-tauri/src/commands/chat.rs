use crate::enums::MessageState;
use crate::services::chat::dto::{CreateMessageDto, CreateSessionDto};
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

/// 创建聊天消息
#[tauri::command]
pub async fn create_chat_message(
    service: State<'_, ChatService>,
    input: CreateMessageDto,
) -> Result<crate::entity::chat_message::Model, String> {
    service
        .create_message(input)
        .await
        .map_err(|e| e.to_string())
}

/// 获取会话的所有消息
#[tauri::command]
pub async fn get_chat_messages(
    service: State<'_, ChatService>,
    session_id: i64,
) -> Result<Vec<crate::entity::chat_message::Model>, String> {
    service
        .get_messages_by_session(session_id)
        .await
        .map_err(|e| e.to_string())
}

/// 更新消息状态
#[tauri::command]
pub async fn update_chat_message_state(
    service: State<'_, ChatService>,
    id: i64,
    state: MessageState,
) -> Result<crate::entity::chat_message::Model, String> {
    service
        .update_message_state(id, state)
        .await
        .map_err(|e| e.to_string())
}

/// 更新消息内容和 Token 数量
#[tauri::command]
pub async fn update_chat_message_content(
    service: State<'_, ChatService>,
    id: i64,
    content: String,
    tokens: Option<i32>,
) -> Result<crate::entity::chat_message::Model, String> {
    service
        .update_message_content(id, content, tokens)
        .await
        .map_err(|e| e.to_string())
}
