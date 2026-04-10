use serde::{Deserialize, Serialize};

/// 创建会话 DTO
#[derive(Debug, Clone, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateSessionDto {
    pub title: String,
}
