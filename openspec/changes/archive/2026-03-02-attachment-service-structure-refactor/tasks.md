# 实现任务清单

## 1. 创建新目录结构

- [x] 1.1 创建 `src-tauri/src/services/attachment/` 目录
- [x] 1.2 创建 `src-tauri/src/services/attachment/dto/` 子目录

## 2. 创建新模块文件

- [x] 2.1 创建 `src-tauri/src/services/attachment/dto/mod.rs`
  - 从 `commands/attachment.rs` 中提取 `AttachmentInfo` 结构体
  - 添加 `From<attachment::Model>` trait 实现
  - 添加必要的导入语句
- [x] 2.2 创建 `src-tauri/src/services/attachment/storage.rs`
  - 复制 `services/attachment_storage.rs` 中的 `AttachmentStorage` 结构体
  - 确保所有导入路径正确
- [x] 2.3 创建 `src-tauri/src/services/attachment/mod.rs`
  - 复制 `services/attachment.rs` 中的 `AttachmentService` 结构体
  - 更新导入语句：`use crate::services::attachment::dto::AttachmentInfo`
  - 更新导入语句：`use crate::services::attachment::storage::AttachmentStorage`
  - 添加 `pub mod dto;` 和 `pub mod storage;` 模块声明
  - 重新导出 `pub use storage::AttachmentStorage;`（如需要）

## 3. 更新模块引用

- [x] 3.1 更新 `src-tauri/src/services/mod.rs`
  - 将 `pub mod attachment;` 改为 `pub mod attachment;`
  - （模块名保持不变，只需要确保新目录结构被正确识别）
- [x] 3.2 更新 `src-tauri/src/commands/attachment.rs`
  - 更新导入：`use crate::services::attachment::AttachmentService` → `use crate::services::attachment::AttachmentService`
  - 更新导入：添加 `use crate::services::attachment::dto::AttachmentInfo`
  - 移除本地定义的 `AttachmentInfo` 结构体
  - 验证所有命令函数正常工作

## 4. 验证和测试

- [x] 4.1 运行 `cargo check` 确保无编译错误
- [x] 4.2 运行 `cargo test` 确保所有测试通过

## 5. 清理旧文件

- [x] 5.1 删除 `src-tauri/src/services/attachment.rs`
- [x] 5.2 删除 `src-tauri/src/services/attachment_storage.rs`
- [x] 5.3 运行最终验证：`cargo check` 和 `cargo test`
