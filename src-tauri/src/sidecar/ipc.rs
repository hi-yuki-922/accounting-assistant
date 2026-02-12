use serde::{Deserialize, Serialize};

/// IPC command structure for communication with sidecar process
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct IpcCommand {
    /// Unique identifier for the command
    pub id: String,
    /// Function name to execute
    pub func: String,
    /// Parameters for the function
    pub params: serde_json::Value,
}

/// IPC response structure from sidecar process
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct IpcResponse {
    /// Unique identifier matching the command
    pub id: String,
    /// Whether the command was successful
    pub success: bool,
    /// Optional data returned on success
    pub data: Option<serde_json::Value>,
    /// Optional error message on failure
    pub error: Option<String>,
}

impl IpcCommand {
    /// Create a new IPC command
    pub fn new(id: impl Into<String>, func: impl Into<String>, params: serde_json::Value) -> Self {
        Self {
            id: id.into(),
            func: func.into(),
            params,
        }
    }

    /// Create a new IPC command with auto-generated UUID
    pub fn with_uuid(func: impl Into<String>, params: serde_json::Value) -> Self {
        Self {
            id: uuid::Uuid::new_v4().to_string(),
            func: func.into(),
            params,
        }
    }
}

impl IpcResponse {
    /// Create a successful response
    pub fn success(id: impl Into<String>, data: Option<serde_json::Value>) -> Self {
        Self {
            id: id.into(),
            success: true,
            data,
            error: None,
        }
    }

    /// Create an error response
    pub fn error(id: impl Into<String>, error: impl Into<String>) -> Self {
        Self {
            id: id.into(),
            success: false,
            data: None,
            error: Some(error.into()),
        }
    }

    /// Check if response is successful
    pub fn is_success(&self) -> bool {
        self.success
    }

    /// Get the response data if successful
    pub fn get_data(&self) -> Option<&serde_json::Value> {
        self.data.as_ref()
    }

    /// Get the error message if failed
    pub fn get_error(&self) -> Option<&String> {
        self.error.as_ref()
    }
}
