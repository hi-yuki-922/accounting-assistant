## ADDED Requirements

### Requirement: Create attachment Tauri command
系统 MUST 提供 Tauri IPC 命令用于创建附件。

#### Scenario: Create attachment command
- **WHEN** 前端调用 `create_attachment` 命令
- **WHEN** 传入参数包含:
  - `master_id`: i64
  - `file_name`: String
  - `file_suffix`: String
  - `file_size`: String
  - `file_content`: Vec<u8>
- **THEN** 系统 MUST 调用附件服务创建附件
- **THEN** 系统 MUST 返回包含 `id` 和 `path` 的对象
- **THEN** 出错时 MUST 返回错误信息

#### Scenario: Create attachment command with missing parameters
- **WHEN** 前端调用 `create_attachment` 命令
- **WHEN** 缺少必需参数(如 file_name)
- **THEN** 系统 MUST 返回参数错误
- **THEN** 系统 MUST 不执行创建操作

### Requirement: Delete attachment Tauri commands
系统 MUST 提供 Tauri IPC 命令用于删除附件。

#### Scenario: Delete attachment by ID command
- **WHEN** 前端调用 `delete_attachment` 命令
- **WHEN** 传入参数 `id`: i64
- **THEN** 系统 MUST 调用附件服务删除附件
- **THEN** 系统 MUST 返回成功或失败状态

#### Scenario: Delete attachment by path command
- **WHEN** 前端调用 `delete_attachment_by_path` 命令
- **WHEN** 传入参数 `path`: String
- **THEN** 系统 MUST 调用附件服务删除附件
- **THEN** 系统 MUST 返回成功或失败状态

### Requirement: Query attachments Tauri command
系统 MUST 提供 Tauri IPC 命令用于查询附件列表。

#### Scenario: Query attachments command with pagination
- **WHEN** 前端调用 `query_attachments` 命令
- **WHEN** 传入参数包含:
  - `page`: i64 (页码,从 1 开始)
  - `page_size`: i64 (每页数量)
- **THEN** 系统 MUST 返回附件列表
- **THEN** 结果 MUST 包含以下字段:
  - `id`: i64
  - `master_id`: i64
  - `path`: String
  - `file_name`: String
  - `file_suffix`: String
  - `file_size`: String
  - `create_at`: String (ISO 8601 格式)

#### Scenario: Query attachments with filters
- **WHEN** 前端调用 `query_attachments` 命令
- **WHEN** 传入可选筛选参数:
  - `file_name`: Option<String> (文件名关键词)
  - `file_suffix`: Option<String> (文件后缀)
  - `start_time`: Option<String> (开始时间,ISO 8601 格式)
  - `end_time`: Option<String> (结束时间,ISO 8601 格式)
  - `master_id`: Option<i64> (主表记录 ID)
- **THEN** 系统 MUST 根据提供的参数进行筛选
- **THEN** 未提供的参数 MUST 不影响查询
- **THEN** 系统 MUST 返回符合条件的附件列表

#### Scenario: Query attachments with invalid pagination
- **WHEN** 前端调用 `query_attachments` 命令
- **WHEN** 传入 `page` 小于 1
- **THEN** 系统 MUST 返回错误信息
- **WHEN** 传入 `page_size` 小于等于 0
- **THEN** 系统 MUST 使用默认值(如 20)

### Requirement: Download attachment Tauri command
系统 MUST 提供 Tauri IPC 命令用于下载附件。

#### Scenario: Download attachment command
- **WHEN** 前端调用 `download_attachment` 命令
- **WHEN** 传入参数 `id`: i64
- **THEN** 系统 MUST 返回包含以下字段的对象:
  - `file_name`: String
  - `file_content`: Vec<u8>
  - `mime_type`: String
- **THEN** 出错时 MUST 返回错误信息

### Requirement: Command error handling
所有 Tauri 命令 MUST 提供一致的错误处理。

#### Scenario: Command returns error
- **WHEN** 命令执行失败
- **THEN** 系统 MUST 返回包含错误信息的 Result
- **THEN** 错误信息 MUST 清晰描述问题原因
- **THEN** 系统 MUST 不崩溃应用

#### Scenario: Command timeout handling
- **WHEN** 命令执行超过预期时间(如大文件操作)
- **THEN** 系统 MUST 使用 Tokio 异步操作避免阻塞
- **THEN** 系统 MUST 保持 UI 响应性
