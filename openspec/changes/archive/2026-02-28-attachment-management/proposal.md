## Why

记账助手目前仅支持记录收支和投资数据,缺乏附件管理能力。用户无法为记账记录添加凭证(如发票、收据、转账截图等),这限制了应用的实用性和数据完整性。附件管理功能将为用户提供更丰富的记账体验,支持凭证归档和数据验证。

## What Changes

- 新增 Sea-ORM 附件实体 Attachment,用于存储附件元数据
- 实现附件文件存储系统,文件按月份归档到 app_data_dir/fileStorage/attachment/ 目录
- 实现附件管理服务层,提供附件的创建、删除、查询和下载功能
- 实现 Tauri IPC 命令,供前端调用附件管理功能
- 附件查询支持按文件名称、创建时间范围、文件后缀进行筛选和分页

## Capabilities

### New Capabilities

- `attachment-entity`: 附件实体定义,包含附件的所有元数据字段
- `attachment-storage`: 附件文件存储系统,处理文件的物理存储和路径管理
- `attachment-service`: 附件管理服务,提供附件的 CRUD 操作
- `attachment-api`: 附件管理 Tauri 命令接口,供前端调用

### Modified Capabilities

(无现有功能的需求变更)

## Impact

- 新增数据库表: attachment
- 新增 Rust 模块: src-tauri/src/entity/attachment.rs, src-tauri/src/services/attachment.rs
- 新增 Tauri 命令: src-tauri/src/commands/attachment.rs
- 新增文件存储目录: fileStorage/attachment/[YYYY-MM]/
- 依赖项: 可能需要增加 tokio/fs 用于异步文件操作
- 数据库迁移: Sea-ORM 将自动同步新实体到 SQLite 数据库
