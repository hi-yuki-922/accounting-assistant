use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct LLMConfig {
    pub api_key: String,
    pub base_url: String,
    pub model: String,
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
