use std::io;

/// Sidecar module error types
#[derive(Debug, thiserror::Error)]
pub enum SidecarError {
    /// Sidecar process not found
    #[error("Sidecar executable not found: {0}")]
    NotFound(String),

    /// Failed to spawn sidecar process
    #[error("Failed to spawn sidecar process: {0}")]
    SpawnError(io::Error),

    /// IO error during communication
    #[error("IO error: {0}")]
    IoError(#[from] io::Error),

    /// JSON serialization/deserialization error
    #[error("JSON error: {0}")]
    JsonError(#[from] serde_json::Error),

    /// Timeout waiting for response
    #[error("Timeout waiting for response: {0}")]
    Timeout(String),

    /// Sidecar process exited unexpectedly
    #[error("Sidecar process exited with code: {0}")]
    ProcessExit(i32),

    /// Invalid response from sidecar
    #[error("Invalid response: {0}")]
    InvalidResponse(String),

    /// Sidecar returned an error
    #[error("Sidecar error: {0}")]
    SidecarError(String),
}

pub type Result<T> = std::result::Result<T, SidecarError>;
