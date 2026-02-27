use reqwest::Client;
use serde::{Deserialize, Serialize};
use std::env;
use std::pin::Pin;
use std::task::{Context, Poll};
use thiserror::Error;
use futures::{Stream, StreamExt};
use bytes::Bytes;

#[derive(Error, Debug)]
pub enum LLMError {
    #[error("Configuration error: {0}")]
    Config(String),
    #[error("API request failed: {0}")]
    Request(#[from] reqwest::Error),
    #[error("API response error: {0}")]
    Api(String),
    #[error("Rate limit exceeded")]
    RateLimit,
    #[error("Network error: {0}")]
    Network(String),
}

pub type LLMResult<T> = Result<T, LLMError>;

#[derive(Debug, Serialize, Deserialize)]
pub struct LLMMessage {
    pub role: String,
    pub content: String,
}

#[derive(Debug, Serialize)]
pub struct LLMRequest {
    pub messages: Vec<LLMMessage>,
    pub model: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub temperature: Option<f64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub max_tokens: Option<u32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub stream: Option<bool>,
}

#[derive(Debug, Deserialize)]
pub struct LLMChoice {
    pub message: LLMResponseMessage,
    pub finish_reason: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct LLMResponseMessage {
    pub role: String,
    pub content: String,
}

#[derive(Debug, Deserialize)]
pub struct LLMUsage {
    pub prompt_tokens: u32,
    pub completion_tokens: u32,
    pub total_tokens: u32,
}

#[derive(Debug, Deserialize)]
pub struct LLMResponse {
    pub id: String,
    pub choices: Vec<LLMChoice>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub usage: Option<LLMUsage>,
}

#[derive(Debug, Deserialize)]
pub struct LLMStreamChoice {
    pub delta: LLMStreamDelta,
    pub finish_reason: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct LLMStreamDelta {
    #[serde(default)]
    pub role: Option<String>,
    #[serde(default)]
    pub content: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct LLMStreamChunk {
    pub id: String,
    pub choices: Vec<LLMStreamChoice>,
}

#[derive(Debug, Deserialize)]
pub struct LLMErrorResponse {
    pub error: ApiErrorDetail,
}

#[derive(Debug, Deserialize)]
pub struct ApiErrorDetail {
    pub message: String,
    #[serde(rename = "type")]
    pub error_type: Option<String>,
}

pub struct SSEDecoder {
    buffer: Vec<u8>,
}

impl SSEDecoder {
    pub fn new() -> Self {
        Self { buffer: Vec::new() }
    }

    pub fn decode(
        mut self,
        mut stream: impl Stream<Item = Result<Bytes, reqwest::Error>> + Unpin,
    ) -> impl Stream<Item = LLMResult<String>> {
        async_stream::stream! {
            while let Some(chunk_result) = stream.next().await {
                match chunk_result {
                    Ok(chunk) => {
                        self.buffer.extend_from_slice(&chunk);
                        while let Some(event) = self.parse_next_event() {
                            if event.starts_with("[DONE]") {
                                continue;
                            }
                            if event.is_empty() {
                                continue;
                            }
                            if let Ok(stream_chunk) = serde_json::from_str::<LLMStreamChunk>(&event) {
                                if let Some(choice) = stream_chunk.choices.first() {
                                    if let Some(content) = &choice.delta.content {
                                        yield Ok(content.clone());
                                    }
                                }
                            }
                        }
                    }
                    Err(e) => {
                        yield Err(LLMError::Network(e.to_string()));
                        break;
                    }
                }
            }
        }
    }

    fn parse_next_event(&mut self) -> Option<String> {
        let data = String::from_utf8_lossy(&self.buffer).to_string();

        if !data.starts_with("data: ") {
            return None;
        }

        if let Some(pos) = data.find("\n\n") {
            let event = data[6..pos].to_string();
            self.buffer.drain(..pos + 2);
            return Some(event);
        }

        None
    }
}

impl Default for SSEDecoder {
    fn default() -> Self {
        Self::new()
    }
}

pub struct LLMService {
    client: Client,
    api_key: String,
    base_url: String,
    model: String,
}

impl LLMService {
    pub fn new() -> LLMResult<Self> {
        let api_key = env::var("SILICONFLOW_API_KEY")
            .map_err(|_| LLMError::Config("SILICONFLOW_API_KEY not set".to_string()))?;

        if api_key.is_empty() {
            return Err(LLMError::Config(
                "SILICONFLOW_API_KEY is empty".to_string()
            ));
        }

        let base_url = env::var("SILICONFLOW_BASE_URL")
            .unwrap_or_else(|_| "https://api.siliconflow.cn/v1".to_string());

        let model = env::var("SILICONFLOW_MODEL")
            .unwrap_or_else(|_| "Qwen/Qwen2.5-7B-Instruct".to_string());

        let client = Client::builder()
            .timeout(std::time::Duration::from_secs(30))
            .build()
            .map_err(|e| LLMError::Network(e.to_string()))?;

        Ok(Self {
            client,
            api_key,
            base_url,
            model,
        })
    }

    pub fn with_config(api_key: String, base_url: String, model: String) -> LLMResult<Self> {
        if api_key.is_empty() {
            return Err(LLMError::Config("API key is empty".to_string()));
        }

        let client = Client::builder()
            .timeout(std::time::Duration::from_secs(30))
            .build()
            .map_err(|e| LLMError::Network(e.to_string()))?;

        Ok(Self {
            client,
            api_key,
            base_url,
            model,
        })
    }

    pub async fn chat_completion(&self, messages: Vec<LLMMessage>) -> LLMResult<LLMResponse> {
        let request = LLMRequest {
            messages,
            model: self.model.clone(),
            temperature: Some(0.7),
            max_tokens: Some(2000),
            stream: Some(false),
        };

        self.send_request(&request).await
    }

    pub async fn chat_completion_with_options(
        &self,
        messages: Vec<LLMMessage>,
        temperature: Option<f64>,
        max_tokens: Option<u32>,
    ) -> LLMResult<LLMResponse> {
        let request = LLMRequest {
            messages,
            model: self.model.clone(),
            temperature,
            max_tokens,
            stream: Some(false),
        };

        self.send_request(&request).await
    }

    pub async fn chat_completion_stream(
        &self,
        messages: Vec<LLMMessage>,
    ) -> LLMResult<impl futures::Stream<Item = LLMResult<String>>> {
        let request = LLMRequest {
            messages,
            model: self.model.clone(),
            temperature: Some(0.7),
            max_tokens: Some(2000),
            stream: Some(true),
        };

        let url = format!("{}/chat/completions", self.base_url);
        let client = self.client.clone();
        let api_key = self.api_key.clone();

        let request_json = serde_json::to_vec(&request)
            .map_err(|e| LLMError::Network(e.to_string()))?;

        let response = client
            .post(&url)
            .header("Authorization", format!("Bearer {}", api_key))
            .header("Content-Type", "application/json")
            .body(request_json)
            .send()
            .await?;

        let status = response.status();

        if status.as_u16() == 429 {
            return Err(LLMError::RateLimit);
        }

        if !status.is_success() {
            let error_response = response
                .json::<LLMErrorResponse>()
                .await
                .unwrap_or_else(|_| LLMErrorResponse {
                    error: ApiErrorDetail {
                        message: format!("API error: {}", status.as_u16()),
                        error_type: None,
                    },
                });
            return Err(LLMError::Api(error_response.error.message));
        }

        let stream = response.bytes_stream();
        let decoder = SSEDecoder::new();

        Ok(decoder.decode(stream))
    }

    async fn send_request(&self, request: &LLMRequest) -> LLMResult<LLMResponse> {
        let url = format!("{}/chat/completions", self.base_url);

        let response = self.client
            .post(&url)
            .header("Authorization", format!("Bearer {}", self.api_key))
            .header("Content-Type", "application/json")
            .json(request)
            .send()
            .await?;

        let status = response.status();

        if status.is_success() {
            response
                .json::<LLMResponse>()
                .await
                .map_err(|e| LLMError::Api(format!("Failed to parse response: {}", e)))
        } else if status.as_u16() == 429 {
            Err(LLMError::RateLimit)
        } else {
            let error_response = response
                .json::<LLMErrorResponse>()
                .await
                .unwrap_or_else(|_| LLMErrorResponse {
                    error: ApiErrorDetail {
                        message: format!("API error: {}", status.as_u16()),
                        error_type: None,
                    },
                });
            Err(LLMError::Api(error_response.error.message))
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_llm_message_serialization() {
        let msg = LLMMessage {
            role: "user".to_string(),
            content: "Hello".to_string(),
        };
        let json = serde_json::to_string(&msg).unwrap();
        assert!(json.contains("user"));
        assert!(json.contains("Hello"));
    }
}
