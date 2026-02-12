pub mod client;
pub mod error;
pub mod ipc;
pub mod manager;

pub use client::SidecarClient;
pub use error::{Result, SidecarError};
pub use ipc::{IpcCommand, IpcResponse};
pub use manager::SidecarManager;
