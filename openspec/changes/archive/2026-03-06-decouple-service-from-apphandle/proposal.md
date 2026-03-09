## Why

当前服务层设计存在架构耦合问题：`AttachmentStorage` 结构体直接存储了 `AppHandle`，违反了服务层与 Tauri 框架应保持解耦的设计原则。这种耦合使得服务层依赖 Tauri 特定的类型，降低了代码的可测试性和可维护性，同时也限制了服务层的独立性。

## What Changes

- **重构 AttachmentStorage**：移除存储在结构体中的 `AppHandle` 字段
- **修改 AttachmentService 构造函数**：不再需要 `AppHandle` 参数
- **修改服务方法签名**：需要用到 `AppHandle` 的方法将由调用者（命令层）传入
- **修改服务初始化逻辑**：更新 `init_attachment_service` 函数签名
- **BREAKING**：所有调用 AttachmentService 需要传递 AppHandle 的地方需要修改

## Capabilities

### New Capabilities
- `service-layer-decoupling`: 服务层与 Tauri 框架解耦的能力，确保服务层不存储 Tauri 句柄，提高可测试性和独立性

### Modified Capabilities
- `attachment-storage`: 需要修改其初始化方式，支持从外部传入 AppHandle 或使用其他方式获取应用数据目录

## Impact

**受影响的代码：**
- `src-tauri/src/services/attachment/storage.rs`：移除 `_app_handle` 字段，修改相关方法签名
- `src-tauri/src/services/attachment/mod.rs`：修改 `AttachmentService` 构造函数和方法签名
- `src-tauri/src/services/mod.rs`：修改 `init_attachment_service` 函数
- `src-tauri/src/commands/`：所有调用 AttachmentService 方法的命令需要传递 AppHandle（如 `create_attachment`, `delete_attachment`, `download_attachment` 等）

**受影响的 API：**
- `AttachmentStorage::new()` - 不再接收 AppHandle 参数
- `AttachmentService::new()` - 不再接收 AppHandle 参数
- 需要访问 app_data_dir 的服务方法需要新增 AppHandle 参数

**依赖系统：**
- 数据库连接层：不受影响
- Tauri 命令层：需要修改调用方式，传递 AppHandle 给服务方法
