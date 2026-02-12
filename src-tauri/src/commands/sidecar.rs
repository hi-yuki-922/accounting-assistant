use crate::sidecar::{IpcCommand, IpcResponse, SidecarClient, SidecarError};
use tauri::State;
use std::sync::Arc;

/// State for managing the sidecar client
pub struct SidecarState {
    client: Arc<SidecarClient>,
}

impl SidecarState {
    pub fn new() -> Result<Self, SidecarError> {
        let client = Arc::new(SidecarClient::with_default()?);
        Ok(Self { client })
    }

    pub fn client(&self) -> &Arc<SidecarClient> {
        &self.client
    }

    /// Check if the sidecar is available and running
    pub fn is_available(&self) -> bool {
        self.client.is_running()
    }
}

/// Initialize the sidecar client
#[tauri::command]
pub async fn init_sidecar() -> Result<(), String> {
    // This would typically be done during app setup
    // For now, we'll just return success
    Ok(())
}

/// Send a command to the sidecar process
#[tauri::command]
pub async fn send_sidecar_command(
    func: String,
    params: serde_json::Value,
    state: State<'_, SidecarState>,
) -> Result<IpcResponse, String> {
    state
        .client()
        .send_command(func, params)
        .map_err(|e| e.to_string())
}

/// Example command: Test sidecar communication
#[tauri::command]
pub async fn test_sidecar(
    message: String,
    state: State<'_, SidecarState>,
) -> Result<String, String> {
    // Send a test command to the sidecar
    let params = serde_json::json!({
        "message": message
    });

    match state.client().send_command("test", params) {
        Ok(response) => {
            if response.is_success() {
                if let Some(data) = response.get_data() {
                    Ok(serde_json::to_string(data).unwrap_or_else(|_| "Success".to_string()))
                } else {
                    Ok("Command executed successfully".to_string())
                }
            } else {
                Err(response.get_error().cloned().unwrap_or_else(|| "Unknown error".to_string()))
            }
        }
        Err(e) => Err(e.to_string()),
    }
}
