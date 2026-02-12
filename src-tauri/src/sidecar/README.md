# Sidecar Module

This module provides communication with the external sidecar process `bun-sidecar-x86_64-pc-windows-mscv.exe`.

## Architecture

The sidecar module consists of the following components:

### Data Structures (`ipc.rs`)
- `IpcCommand`: Command structure for sending requests to the sidecar
- `IpcResponse`: Response structure from the sidecar

### Error Handling (`error.rs`)
- `SidecarError`: Comprehensive error types for all sidecar operations

### Process Management (`manager.rs`)
- `SidecarManager`: Manages the sidecar process lifecycle
- Handles process spawning, IPC communication via stdin/stdout
- Response listener thread for async responses

### Client (`client.rs`)
- `SidecarClient`: High-level API for communicating with the sidecar
- Includes retry logic and typed response extraction

## IPC Communication Format

### Input (IpcCommand)
```json
{
  "id": "unique-command-id",
  "func": "function-name",
  "params": {
    // Function-specific parameters
  }
}
```

### Output (IpcResponse)
```json
{
  "id": "matching-command-id",
  "success": true,
  "data": {
    // Response data on success
  },
  "error": null
}
```

On failure:
```json
{
  "id": "matching-command-id",
  "success": false,
  "data": null,
  "error": "Error message"
}
```

## Usage

### Basic Example

```rust
use crate::sidecar::{SidecarClient, IpcCommand};

// Create a client with default executable path
let client = SidecarClient::with_default()?;

// Start the sidecar process
client.start()?;

// Send a command
let params = serde_json::json!({
    "key": "value"
});
let response = client.send_command("my_function", params)?;

if response.is_success() {
    if let Some(data) = response.get_data() {
        println!("Success: {}", data);
    }
} else {
    eprintln!("Error: {:?}", response.get_error());
}

// Stop the process
client.stop()?;
```

### Using with SidecarManager Directly

```rust
use crate::sidecar::{SidecarManager, IpcCommand};

let manager = SidecarManager::with_default()?;
manager.start()?;

let command = IpcCommand::new(
    "cmd-1",
    "my_function",
    serde_json::json!({"param": "value"})
);

let response = manager.send_command(command)?;
```

### Tauri Integration

The module is integrated with Tauri through the following commands:

- `init_sidecar`: Initialize the sidecar client (called during app setup)
- `send_sidecar_command`: Send a command with function name and parameters
- `test_sidecar`: Test sidecar communication with a simple message

## Configuration

### Executable Path

By default, the sidecar looks for `bun-sidecar-x86_64-pc-windows-mscv.exe` in:
1. The same directory as the main executable
2. The current working directory (fallback)

To specify a custom path:

```rust
use std::path::PathBuf;

let custom_path = PathBuf::from("/path/to/sidecar.exe");
let manager = SidecarManager::new(custom_path)?;
```

## Error Handling

The module provides detailed error types:

- `NotFound`: Sidecar executable not found
- `SpawnError`: Failed to spawn the process
- `IoError`: Communication IO errors
- `JsonError`: JSON serialization/deserialization errors
- `Timeout`: Timeout waiting for response
- `ProcessExit`: Sidecar process exited unexpectedly
- `InvalidResponse`: Malformed response from sidecar
- `SidecarError`: Application-level errors from sidecar

## Retry Logic

The `SidecarClient` includes automatic retry logic for transient errors:

```rust
// Default: 3 retries
let response = client.send_command("function", params)?;

// Custom retry count
let response = client.send_command_with_retry("function", params, 5)?;
```

## Tauri Commands

Available Tauri commands for frontend integration:

```typescript
// Initialize sidecar
await invoke('init_sidecar');

// Send command
await invoke('send_sidecar_command', {
  func: 'function_name',
  params: { /* parameters */ }
});

// Test sidecar
await invoke('test_sidecar', { message: 'Hello' });
```

## Thread Safety

The sidecar manager and client are designed for thread-safe operation:
- Uses `Arc<Mutex<>>` for shared state
- Response channels for async communication
- Safe concurrent access from multiple threads

## Process Lifecycle

1. **Startup**: Sidecar process is spawned during app initialization
2. **Communication**: Commands are sent via stdin, responses read via stdout
3. **Cleanup**: Process is terminated when the manager is dropped

## Testing

Unit tests are included in `client.rs` for:
- IPC command serialization
- IPC response serialization
- Response error handling

Run tests with:
```bash
cargo test --package accounting-assistant-lib --lib sidecar
```

## Notes

- The sidecar executable must output responses as JSON, one per line
- Each response's `id` field must match the corresponding command's `id`
- The sidecar process should be long-running (daemon-like)
- Consider implementing health checks in production
