use super::error::{Result, SidecarError};
use super::ipc::{IpcCommand, IpcResponse};
use std::collections::HashMap;
use std::io::{BufRead, BufReader, Write};
use std::path::PathBuf;
use std::process::{Child, ChildStdin, Command, Stdio};
use std::sync::{Arc, Mutex};
use std::thread;
use std::sync::mpsc;

const SIDECAR_EXECUTABLE: &str = "bun-sidecar-x86_64-pc-windows-mscv.exe";

/// Sidecar process manager
pub struct SidecarManager {
    /// Path to the sidecar executable
    executable_path: PathBuf,
    /// The child process
    child: Arc<Mutex<Option<Child>>>,
    /// Standard input for the process
    stdin: Arc<Mutex<Option<ChildStdin>>>,
    /// Channel for receiving responses
    response_rx: Mutex<Option<mpsc::Receiver<IpcResponse>>>,
    /// Pending requests waiting for responses
    pending_requests: Arc<Mutex<HashMap<String, mpsc::Sender<IpcResponse>>>>,
}

impl SidecarManager {
    /// Create a new sidecar manager
    pub fn new(executable_path: PathBuf) -> Result<Self> {
        if !executable_path.exists() {
            return Err(SidecarError::NotFound(
                executable_path.to_string_lossy().to_string(),
            ));
        }

        let (response_tx, response_rx) = mpsc::channel();

        Ok(Self {
            executable_path,
            child: Arc::new(Mutex::new(None)),
            stdin: Arc::new(Mutex::new(None)),
            response_rx: Mutex::new(Some(response_rx)),
            pending_requests: Arc::new(Mutex::new(HashMap::new())),
        })
    }

    /// Create a new sidecar manager with default executable name
    /// Note: This will not check if the executable exists to allow
    /// graceful degradation when sidecar is not present
    pub fn with_default() -> Result<Self> {
        let mut path = PathBuf::new();
        if let Ok(exe_dir) = std::env::current_exe() {
            if let Some(parent) = exe_dir.parent() {
                path = parent.join(SIDECAR_EXECUTABLE);
            }
        }

        // Fallback to current directory
        if !path.exists() {
            path = PathBuf::from(SIDECAR_EXECUTABLE);
        }

        // Don't check existence - allow graceful degradation
        let (response_tx, response_rx) = mpsc::channel();

        Ok(Self {
            executable_path: path,
            child: Arc::new(Mutex::new(None)),
            stdin: Arc::new(Mutex::new(None)),
            response_rx: Mutex::new(Some(response_rx)),
            pending_requests: Arc::new(Mutex::new(HashMap::new())),
        })
    }

    /// Start the sidecar process
    pub fn start(&self) -> Result<()> {
        let mut child = Command::new(&self.executable_path)
            .stdin(Stdio::piped())
            .stdout(Stdio::piped())
            .stderr(Stdio::inherit())
            .spawn()
            .map_err(SidecarError::SpawnError)?;

        let stdin = child.stdin.take().ok_or_else(|| {
            SidecarError::InvalidResponse("Failed to capture stdin".to_string())
        })?;

        let stdout = child.stdout.take().ok_or_else(|| {
            SidecarError::InvalidResponse("Failed to capture stdout".to_string())
        })?;

        let mut child_guard = self.child.lock().unwrap();
        *child_guard = Some(child);
        drop(child_guard);

        let mut stdin_guard = self.stdin.lock().unwrap();
        *stdin_guard = Some(stdin);
        drop(stdin_guard);

        // Start the response listener thread
        self.start_response_listener(stdout);

        Ok(())
    }

    /// Stop the sidecar process
    pub fn stop(&self) -> Result<()> {
        let mut child_guard = self.child.lock().unwrap();
        if let Some(mut child) = child_guard.take() {
            child.kill()?;
        }
        *child_guard = None;

        let mut stdin_guard = self.stdin.lock().unwrap();
        *stdin_guard = None;

        Ok(())
    }

    /// Check if the sidecar is running
    pub fn is_running(&self) -> bool {
        let child_guard = self.child.lock().unwrap();
        child_guard.is_some()
    }

    /// Send a command to the sidecar and wait for response
    pub fn send_command(&self, command: IpcCommand) -> Result<IpcResponse> {
        let id = command.id.clone();

        // Create a channel for the response
        let (tx, rx) = mpsc::channel();

        // Register the request
        {
            let mut pending = self.pending_requests.lock().unwrap();
            pending.insert(id.clone(), tx);
        }

        // Send the command
        self.send_to_sidecar(&command)?;

        // Wait for response with timeout
        // For simplicity, we'll use the response_rx channel
        // In a production system, you'd want to use timeout
        let response = rx.recv().map_err(|_| {
            SidecarError::Timeout(format!(
                "No response for command {}",
                id
            ))
        })?;

        // Clean up pending request
        {
            let mut pending = self.pending_requests.lock().unwrap();
            pending.remove(&id);
        }

        if response.is_success() {
            Ok(response)
        } else {
            let error_msg = response
                .get_error()
                .cloned()
                .unwrap_or_else(|| "Unknown error".to_string());
            Err(SidecarError::SidecarError(error_msg))
        }
    }

    /// Send a command to the sidecar process
    fn send_to_sidecar(&self, command: &IpcCommand) -> Result<()> {
        let json = serde_json::to_string(command)?;
        let mut stdin_guard = self.stdin.lock().unwrap();

        if let Some(stdin) = stdin_guard.as_mut() {
            writeln!(stdin, "{}", json)?;
            stdin.flush()?;
        } else {
            return Err(SidecarError::InvalidResponse(
                "Sidecar not started".to_string(),
            ));
        }

        Ok(())
    }

    /// Start the response listener thread
    fn start_response_listener(&self, stdout: std::process::ChildStdout) {
        let pending_requests = self.pending_requests.clone();

        thread::spawn(move || {
            let reader = BufReader::new(stdout);

            for line_result in reader.lines() {
                if let Ok(json_str) = line_result {
                    if let Ok(response) = serde_json::from_str::<IpcResponse>(&json_str) {
                        let id = response.id.clone();
                        let pending = pending_requests.lock().unwrap();

                        if let Some(tx) = pending.get(&id) {
                            let _ = tx.send(response);
                        }
                    }
                }
            }
        });
    }
}

impl Drop for SidecarManager {
    fn drop(&mut self) {
        let _ = self.stop();
    }
}
