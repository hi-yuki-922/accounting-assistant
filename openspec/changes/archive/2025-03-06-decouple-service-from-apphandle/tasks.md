## 1. 修改 AttachmentStorage

- [x] 1.1 移除 AttachmentStorage 结构体中的 `_app_handle: AppHandle` 字段
- [x] 1.2 修改 `AttachmentStorage::new()` 构造函数，移除 `app_handle` 参数
- [x] 1.3 修改 `get_app_data_dir()` 方法，添加 `app_handle: &AppHandle` 参数，使用传入的 app_handle 获取 app_data_dir
- [x] 1.4 修改 `get_base_storage_dir()` 方法，添加 `app_handle: &AppHandle` 参数，传递给 `get_app_data_dir()`
- [x] 1.5 修改 `get_monthly_dir()` 方法，添加 `app_handle: &AppHandle` 参数，传递给 `get_base_storage_dir()`
- [x] 1.6 修改 `generate_storage_path()` 方法，添加 `app_handle: &AppHandle` 参数，传递给 `get_monthly_dir()`

## 2. 修改 AttachmentService

- [x] 2.1 修改 `AttachmentService::new()` 构造函数，移除 `app_handle` 参数，同时移除 `AttachmentStorage` 的初始化（因为不再需要 AppHandle）
- [x] 2.2 修改 `AttachmentService` 结构体，移除 `storage: AttachmentStorage` 字段或将其改为 None
- [x] 2.3 修改 `create_attachment()` 方法，添加 `app_handle: &AppHandle` 参数
- [x] 2.4 在 `create_attachment()` 方法中，创建临时的 `AttachmentStorage` 实例，传入 app_handle
- [x] 2.5 更新 `create_attachment()` 方法中所有调用 `self.storage` 的地方，使用临时 Storage 实例
- [x] 2.6 验证其他方法（delete_attachment、query_attachments、download_attachment）不需要 AppHandle，保持不变

## 3. 修改服务初始化逻辑

- [x] 3.1 修改 `services/mod.rs` 中的 `init_attachment_service()` 函数签名，移除 `app_handle: AppHandle` 参数
- [x] 3.2 更新 `init_attachment_service()` 函数内部调用 `AttachmentService::new()` 的代码，移除 app_handle 参数
- [x] 3.3 修改 `init_services()` 函数，移除传递给 `init_attachment_service()` 的 app_handle 参数
- [x] 3.4 更新 `lib.rs` 中调用 `init_services()` 的代码（desktop 和 mobile 两个分支），移除传递 app_handle（第 63 行和第 93 行）

## 4. 更新命令层（commands/attachment.rs）

- [x] 4.1 修改 `create_attachment` 命令函数签名，添加 `app: tauri::AppHandle` 参数
- [x] 4.2 在 `create_attachment` 命令中，将 `app` 传递给 `service.create_attachment()` 调用
- [x] 4.3 验证 `delete_attachment`、`delete_attachment_by_path`、`query_attachments`、`download_attachment` 命令不需要修改（因为这些服务方法不需要 AppHandle）
