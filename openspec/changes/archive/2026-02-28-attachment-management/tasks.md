## 1. 实体层实现

- [x] 1.1 创建 `src-tauri/src/entity/attachment.rs` 文件
- [x] 1.2 定义 Attachment 实体结构体,包含所有必需字段(id, master_id, path, file_name, file_suffix, file_size, create_at)
- [x] 1.3 为 Attachment 实体实现 Model 和 ActiveModel trait
- [x] 1.4 在 `src-tauri/src/entity/mod.rs` 中导出 Attachment 实体
- [x] 1.5 在 `src-tauri/src/lib.rs` 中注册 Attachment 实体到数据库

## 2. 附件存储实现

- [x] 2.1 在 `src-tauri/src/services` 创建 `attachment_storage.rs` 模块
- [x] 2.2 实现获取 app_data_dir 路径功能
- [x] 2.3 实现创建基础存储目录 `fileStorage/attachment/` 的功能
- [x] 2.4 实现生成月度目录路径 `[YYYY-MM]` 的功能
- [x] 2.5 实现生成带时间戳前缀的文件名的功能
- [x] 2.6 实现完整的存储路径生成函数
- [x] 2.7 实现保存文件到存储目录的功能(使用 tokio::fs 异步操作)
- [x] 2.8 在 `src-tauri/src/services/mod.rs` 中导出附件存储模块

## 3. 附件服务层实现

- [x] 3.1 创建 `src-tauri/src/services/attachment.rs` 文件
- [x] 3.2 定义 AttachmentService 结构体,包含数据库连接
- [x] 3.3 实现 create_attachment 方法:保存文件并创建数据库记录
- [x] 3.4 实现 delete_attachment 方法:按 ID 删除附件(同时删除文件和记录)
- [x] 3.5 实现 delete_attachment_by_path 方法:按路径删除附件
- [x] 3.6 实现 query_attachments 方法:支持分页和多条件筛选(文件名、后缀、时间范围、master_id)
- [x] 3.7 实现 download_attachment 方法:读取文件内容并返回
- [x] 3.8 添加错误处理和边界条件检查(如无效 master_id、空文件名等)
- [x] 3.9 在 `src-tauri/src/services/mod.rs` 中导出 AttachmentService

## 4. Tauri 命令层实现

- [x] 4.1 创建 `src-tauri/src/commands/attachment.rs` 文件
- [x] 4.2 实现 create_attachment 命令:接收文件参数并调用服务层创建附件
- [x] 4.3 实现 delete_attachment 命令:按 ID 删除附件
- [x] 4.4 实现 delete_attachment_by_path 命令:按路径删除附件
- [x] 4.5 实现 query_attachments 命令:支持分页和筛选参数
- [x] 4.6 实现 download_attachment 命令:返回文件内容和元数据
- [x] 4.7 为所有命令添加统一的错误处理
- [x] 4.8 在 `src-tauri/src/commands/mod.rs` 中导出附件命令模块

## 5. 集成与测试

- [x] 5.1 在 `src-tauri/src/lib.rs` 中注册所有附件相关的 Tauri 命令
- [x] 5.2 运行 `cargo check` 验证代码编译无错误
- [x] 5.3 运行 `cargo clippy` 检查代码规范