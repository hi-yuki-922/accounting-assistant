# Sidecar 进程管理

## Sidecar 结构

```rust
use std::collections::HashMap;
use std::io::{BufRead, BufReader, Write};
use std::path::PathBuf;
use std::process::{Child, ChildStdin, Command, Stdio};
use std::sync::{Arc, Mutex, mpsc};
use std::thread;

const SIDECAR_EXECUTABLE: &str = "bun-sidecar-x86_64-pc-windows-mscv.exe";

/// Sidecar 进程管理器
pub struct SidecarManager {
    /// 可执行文件路径
    executable_path: PathBuf,
    /// 子进程
    child: Arc<Mutex<Option<Child>>>,
    /// 标准输入
    stdin: Arc<Mutex<Option<ChildStdin>>>,
    /// 响应接收通道
    response_rx: Mutex<Option<mpsc::Receiver<IpcResponse>>>,
    /// 等待响应的请求
    pending_requests: Arc<Mutex<HashMap<String, mpsc::Sender<IpcResponse>>>>,
}
```

## 初始化

### 指定路径

```rust
impl SidecarManager {
    /// 创建新的 Sidecar 管理器
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
}
```

### 默认路径

```rust
impl SidecarManager {
    /// 使用默认可执行文件名创建管理器
    /// 注意：不检查文件是否存在，允许优雅降级
    pub fn with_default() -> Result<Self> {
        let mut path = PathBuf::new();

        // 获取当前可执行文件目录
        if let Ok(exe_dir) = std::env::current_exe() {
            if let Some(parent) = exe_dir.parent() {
                path = parent.join(SIDECAR_EXECUTABLE);
            }
        }

        // 回退到当前目录
        if !path.exists() {
            path = PathBuf::from(SIDECAR_EXECUTABLE);
        }

        let (response_tx, response_rx) = mpsc::channel();

        Ok(Self {
            executable_path: path,
            child: Arc::new(Mutex::new(None)),
            stdin: Arc::new(Mutex::new(None)),
            response_rx: Mutex::new(Some(response_rx)),
            pending_requests: Arc::new(Mutex::new(HashMap::new())),
        })
    }
}
```

## 进程控制

### 启动

```rust
impl SidecarManager {
    /// 启动 Sidecar 进程
    pub fn start(&self) -> Result<()> {
        let mut child = Command::new(&self.executable_path)
            .stdin(Stdio::piped())
            .stdout(Stdio::piped())
            .stderr(Stdio::inherit())
            .spawn()
            .map_err(SidecarError::SpawnError)?;

        // 捕获 stdin
        let stdin = child.stdin.take().ok_or_else(|| {
            SidecarError::InvalidResponse("无法捕获 stdin".to_string())
        })?;

        // 捕获 stdout
        let stdout = child.stdout.take().ok_or_else(|| {
            SidecarError::InvalidResponse("无法捕获 stdout".to_string())
        })?;

        // 保存进程引用
        {
            let mut child_guard = self.child.lock().unwrap();
            *child_guard = Some(child);
        }

        // 保存 stdin
        {
            let mut stdin_guard = self.stdin.lock().unwrap();
            *stdin_guard = Some(stdin);
        }

        // 启动响应监听线程
        self.start_response_listener(stdout);

        Ok(())
    }
}
```

### 停止

```rust
impl SidecarManager {
    /// 停止 Sidecar 进程
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
}
```

### 状态检查

```rust
impl SidecarManager {
    /// 检查 Sidecar 是否运行中
    pub fn is_running(&self) -> bool {
        let child_guard = self.child.lock().unwrap();
        child_guard.is_some()
    }
}
```

## 命令通信

### 发送命令

```rust
impl SidecarManager {
    /// 发送命令并等待响应
    pub fn send_command(&self, command: IpcCommand) -> Result<IpcResponse> {
        let id = command.id.clone();

        // 创建响应通道
        let (tx, rx) = mpsc::channel();

        // 注册请求
        {
            let mut pending = self.pending_requests.lock().unwrap();
            pending.insert(id.clone(), tx);
        }

        // 发送命令
        self.send_to_sidecar(&command)?;

        // 等待响应
        let response = rx.recv().map_err(|_| {
            SidecarError::Timeout(format!("命令 {} 无响应", id))
        })?;

        // 清理请求
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
                .unwrap_or_else(|| "未知错误".to_string());
            Err(SidecarError::SidecarError(error_msg))
        }
    }

    /// 发送数据到 Sidecar
    fn send_to_sidecar(&self, command: &IpcCommand) -> Result<()> {
        let json = serde_json::to_string(command)?;
        let mut stdin_guard = self.stdin.lock().unwrap();

        if let Some(stdin) = stdin_guard.as_mut() {
            writeln!(stdin, "{}", json)?;
            stdin.flush()?;
        } else {
            return Err(SidecarError::InvalidResponse("Sidecar 未启动".to_string()));
        }

        Ok(())
    }
}
```

### 响应监听

```rust
impl SidecarManager {
    /// 启动响应监听线程
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
```

## 资源清理

```rust
impl Drop for SidecarManager {
    fn drop(&mut self) {
        let _ = self.stop();
    }
}
```

## 错误定义

```rust
use thiserror::Error;

#[derive(Debug, Error)]
pub enum SidecarError {
    #[error("Sidecar 可执行文件未找到: {0}")]
    NotFound(String),

    #[error("启动 Sidecar 进程失败: {0}")]
    SpawnError(#[from] std::io::Error),

    #[error("Sidecar 响应无效: {0}")]
    InvalidResponse(String),

    #[error("等待响应超时: {0}")]
    Timeout(String),

    #[error("Sidecar 错误: {0}")]
    SidecarError(String),

    #[error("JSON 序列化错误: {0}")]
    JsonError(#[from] serde_json::Error),
}

pub type Result<T> = std::result::Result<T, SidecarError>;
```

## IPC 协议

### 命令结构

```rust
// sidecar/ipc.rs
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize)]
pub struct IpcCommand {
    pub id: String,
    pub command: String,
    pub params: serde_json::Value,
}

#[derive(Debug, Deserialize)]
pub struct IpcResponse {
    pub id: String,
    pub success: bool,
    pub data: Option<serde_json::Value>,
    pub error: Option<String>,
}

impl IpcResponse {
    pub fn is_success(&self) -> bool {
        self.success
    }

    pub fn get_error(&self) -> Option<&String> {
        self.error.as_ref()
    }
}
```

## 使用示例

```rust
// 创建管理器
let manager = SidecarManager::with_default()?;

// 启动进程
manager.start()?;

// 发送命令
let command = IpcCommand {
    id: uuid::Uuid::new_v4().to_string(),
    command: "process".to_string(),
    params: json!({ "input": "data" }),
};

let response = manager.send_command(command)?;

if response.is_success() {
    // 处理成功响应
    if let Some(data) = response.data {
        println!("结果: {:?}", data);
    }
}

// 自动清理（Drop）
```
