use super::error::{Result, SidecarError};
use super::ipc::{IpcCommand, IpcResponse};
use super::manager::SidecarManager;
use std::sync::Arc;

/// Sidecar client for communicating with the sidecar process
pub struct SidecarClient {
    manager: Arc<SidecarManager>,
}

impl SidecarClient {
    /// Create a new sidecar client
    pub fn new(manager: Arc<SidecarManager>) -> Self {
        Self { manager }
    }

    /// Create a new sidecar client with default manager
    pub fn with_default() -> Result<Self> {
        let manager = Arc::new(SidecarManager::with_default().map_err(|e| {
            eprintln!("Warning: Could not initialize sidecar manager: {}", e);
            SidecarError::NotFound("sidecar".to_string())
        })?);
        Ok(Self { manager })
    }

    /// Start the sidecar process
    pub fn start(&self) -> Result<()> {
        self.manager.start()
    }

    /// Stop the sidecar process
    pub fn stop(&self) -> Result<()> {
        self.manager.stop()
    }

    /// Check if the sidecar is running
    pub fn is_running(&self) -> bool {
        self.manager.is_running()
    }

    /// Send a command to the sidecar with retry logic
    pub fn send_command(&self, func: impl Into<String>, params: serde_json::Value) -> Result<IpcResponse> {
        self.send_command_with_retry(func, params, 3)
    }

    /// Send a command with retry logic
    pub fn send_command_with_retry(
        &self,
        func: impl Into<String>,
        params: serde_json::Value,
        max_retries: u32,
    ) -> Result<IpcResponse> {
        let func = func.into();
        let mut last_error = None;

        for attempt in 1..=max_retries {
            let command = IpcCommand::new(format!("{}-{}", func, attempt), &func, params.clone());

            match self.manager.send_command(command) {
                Ok(response) => {
                    if response.is_success() {
                        return Ok(response);
                    } else {
                        // Sidecar returned an error
                        let error_msg = response
                            .get_error()
                            .cloned()
                            .unwrap_or_else(|| "Unknown error".to_string());
                        last_error = Some(SidecarError::SidecarError(error_msg));

                        // Don't retry on application errors
                        return Err(last_error.unwrap());
                    }
                }
                Err(e) => {
                    last_error = Some(e);

                    // Retry on IO or timeout errors
                    if attempt < max_retries {
                        std::thread::sleep(std::time::Duration::from_millis(100 * attempt as u64));
                    }
                }
            }
        }

        Err(last_error.unwrap_or_else(|| {
            SidecarError::Timeout(format!(
                "Failed to execute command '{}' after {} attempts",
                func, max_retries
            ))
        }))
    }

    /// Send a command and extract data as a specific type
    pub fn send_command_typed<T>(
        &self,
        func: impl Into<String>,
        params: serde_json::Value,
    ) -> Result<T>
    where
        T: for<'de> serde::Deserialize<'de>,
    {
        let response = self.send_command(func, params)?;

        if response.is_success() {
            if let Some(data) = response.get_data() {
                serde_json::from_value(data.clone())
                    .map_err(|e| SidecarError::InvalidResponse(format!("Failed to parse data: {}", e)))
            } else {
                Err(SidecarError::InvalidResponse(
                    "Response contains no data".to_string(),
                ))
            }
        } else {
            Err(SidecarError::SidecarError(
                response
                    .get_error()
                    .cloned()
                    .unwrap_or_else(|| "Unknown error".to_string()),
            ))
        }
    }

    /// Get the underlying manager
    pub fn manager(&self) -> &Arc<SidecarManager> {
        &self.manager
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_ipc_command_serialization() {
        let command = IpcCommand::new("test-id", "test_func", serde_json::json!({"key": "value"}));
        let json = serde_json::to_string(&command).unwrap();
        let parsed: IpcCommand = serde_json::from_str(&json).unwrap();

        assert_eq!(parsed.id, "test-id");
        assert_eq!(parsed.func, "test_func");
        assert_eq!(parsed.params, serde_json::json!({"key": "value"}));
    }

    #[test]
    fn test_ipc_response_serialization() {
        let response = IpcResponse::success("test-id", Some(serde_json::json!({"result": "ok"})));
        let json = serde_json::to_string(&response).unwrap();
        let parsed: IpcResponse = serde_json::from_str(&json).unwrap();

        assert_eq!(parsed.id, "test-id");
        assert!(parsed.is_success());
        assert_eq!(parsed.get_data(), Some(&serde_json::json!({"result": "ok"})));
    }

    #[test]
    fn test_ipc_response_error() {
        let response = IpcResponse::error("test-id", "Something went wrong");
        assert_eq!(response.id, "test-id");
        assert!(!response.is_success());
        assert_eq!(response.get_error(), Some(&"Something went wrong".to_string()));
    }
}
