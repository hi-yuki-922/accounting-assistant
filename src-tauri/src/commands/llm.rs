use crate::services::llm_service::{LLMError, LLMMessage, LLMService};
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct ChatCompletionRequest {
    pub messages: Vec<LLMMessage>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub temperature: Option<f64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub max_tokens: Option<u32>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ChatCompletionResponse {
    pub id: String,
    pub content: String,
    pub finish_reason: Option<String>,
    pub usage: Option<ChatUsage>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ChatUsage {
    pub prompt_tokens: u32,
    pub completion_tokens: u32,
    pub total_tokens: u32,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct LLMConfig {
    pub api_key: String,
    pub base_url: String,
    pub model: String,
}

#[tauri::command]
pub async fn chat_completion(request: ChatCompletionRequest) -> Result<ChatCompletionResponse, String> {
    let service = LLMService::new().map_err(|e| e.to_string())?;

    let response = service
        .chat_completion_with_options(
            request.messages,
            request.temperature,
            request.max_tokens,
        )
        .await
        .map_err(|e| e.to_string())?;

    if let Some(choice) = response.choices.first() {
        Ok(ChatCompletionResponse {
            id: response.id,
            content: choice.message.content.clone(),
            finish_reason: choice.finish_reason.clone(),
            usage: response.usage.map(|u| ChatUsage {
                prompt_tokens: u.prompt_tokens,
                completion_tokens: u.completion_tokens,
                total_tokens: u.total_tokens,
            }),
        })
    } else {
        Err("No choices in response".to_string())
    }
}

#[tauri::command]
pub async fn get_llm_config() -> Result<LLMConfig, String> {
    Ok(LLMConfig {
        api_key: std::env::var("SILICONFLOW_API_KEY").unwrap_or_default(),
        base_url: std::env::var("SILICONFLOW_BASE_URL")
            .unwrap_or_else(|_| "https://api.siliconflow.cn/v1".to_string()),
        model: std::env::var("SILICONFLOW_MODEL")
            .unwrap_or_else(|_| "Qwen/Qwen2.5-7B-Instruct".to_string()),
    })
}


#[tauri::command]
pub fn test_llm_connection() -> Result<String, String> {
    match LLMService::new() {
        Ok(_) => Ok("Connection successful".to_string()),
        Err(e) => Err(format!("Connection failed: {}", e)),
    }
}
