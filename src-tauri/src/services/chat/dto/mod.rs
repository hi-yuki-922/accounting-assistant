use serde::{Deserialize, Serialize};
use crate::entity::chat_message::{MessageRole, MessageState};

/// 创建会话 DTO
#[derive(Debug, Clone, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateSessionDto {
    pub title: String,
    pub model: Option<String>,
    pub system_prompt: Option<String>,
}

/// 创建消息 DTO
#[derive(Debug, Clone, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateMessageDto {
    pub session_id: i64,
    pub role: MessageRole,
    pub content: String,
    pub tokens: Option<i32>,
    pub state: Option<MessageState>,
}
