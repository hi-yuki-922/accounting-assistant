## 1. 重构记账服务为服务类

- [x] 1.1 在 `services/accounting/mod.rs` 中定义 `AccountingService` 结构体，包含 `db: DatabaseConnection` 字段
- [x] 1.2 实现 `AccountingService::new(db: DatabaseConnection)` 构造函数
- [x] 1.3 将 `add_accounting_record` 函数重构为 `AccountingService::add_record` 方法，使用 `&self.db`
- [x] 1.4 将 `modify_accounting_record` 函数重构为 `AccountingService::modify_record` 方法，使用 `&self.db`
- [x] 1.5 将 `post_accounting_record` 函数重构为 `AccountingService::post_record` 方法，使用 `&self.db`
- [x] 1.6 移除 `add_accounting_record`、`modify_accounting_record`、`post_accounting_record` 函数中的 `connection::get_or_init_db()` 调用
- [x] 1.7 运行 `cargo check` 验证 AccountingService 编译无误（编译器错误为预期的，因命令层未更新）

## 2. 重构账本服务为服务类

- [x] 2.1 在 `services/accounting_book/mod.rs` 中定义 `AccountingBookService` 结构体，包含 `db: DatabaseConnection` 字段
- [x] 2.2 实现 `AccountingBookService::new(db: DatabaseConnection)` 构造函数
- [x] 2.3 将 `create_book` 函数重构为 `AccountingBookService::create_book` 方法
- [x] 2.4 将 `get_books` 函数重构为 `AccountingBookService::get_books` 方法
- [x] 2.5 将 `get_book_by_id` 函数重构为 `AccountingBookService::get_book_by_id` 方法
- [x] 2.6 将 `update_book_title` 函数重构为 `AccountingBookService::update_book_title` 方法
- [x] 2.7 将 `delete_book` 函数重构为 `AccountingBookService::delete_book` 方法
- [x] 2.8 将 `get_records_by_book_id` 函数重构为 `AccountingBookService::get_records_by_book_id` 方法
- [x] 2.9 将 `get_uncategorized_records` 函数重构为 `AccountingBookService::get_uncategorized_records` 方法
- [x] 2.10 将 `get_books_paginated` 函数重构为 `AccountingBookService::get_books_paginated` 方法
- [x] 2.11 将 `get_records_by_book_id_paginated` 函数重构为 `AccountingBookService::get_records_by_book_id_paginated` 方法
- [x] 2.12 将 `get_write_off_records_by_id` 函数重构为 `AccountingBookService::get_write_off_records_by_id` 方法
- [x] 2.13 将 `create_default_book` 函数重构为 `AccountingBookService::create_default_book` 方法
- [x] 2.14 运行 `cargo check` 验证 AccountingBookService 编译无误（编译器错误为预期的，因命令层未更新）

## 3. 实现服务单例管理

- [x] 3.1 在 `services/mod.rs` 中导入 `std::sync::OnceCell`、`sea_orm::DatabaseConnection` 和 `tauri::AppHandle`
- [x] 3.2 在 `services/mod.rs` 中定义 `static ACCOUNTING_SERVICE: OnceCell<AccountingService>` 单例变量
- [x] 3.3 在 `services/mod.rs` 中定义 `static ACCOUNTING_BOOK_SERVICE: OnceCell<AccountingBookService>` 单例变量
- [x] 3.4 在 `services/mod.rs` 中定义 `static ATTACHMENT_SERVICE: OnceCell<AttachmentService>` 单例变量
- [x] 3.5 实现 `init_accounting_service(db: &DatabaseConnection)` 函数，初始化 AccountingService 单例
- [x] 3.6 实现 `init_accounting_book_service(db: &DatabaseConnection)` 函数，初始化 AccountingBookService 单例
- [x] 3.7 实现 `init_attachment_service(db: &DatabaseConnection, app_handle: AppHandle)` 函数，初始化 AttachmentService 单例
- [x] 3.8 实现 `init_services(db: &DatabaseConnection, app_handle: AppHandle)` 函数，依次初始化所有服务
- [x] 3.9 实现 `accounting_service() -> &'static AccountingService` 访问函数，使用 `expect()` 确保服务已初始化
- [x] 3.10 实现 `accounting_book_service() -> &'static AccountingBookService` 访问函数，使用 `expect()` 确保服务已初始化
- [x] 3.11 实现 `attachment_service() -> &'static AttachmentService` 访问函数，使用 `expect()` 确保服务已初始化
- [x] 3.12 运行 `cargo check` 验证服务单例管理编译无误（编译器错误为预期的，因命令层未更新）

## 4. 集成到 lib.rs

- [x] 4.1 在 `lib.rs` 的数据库初始化成功后调用 `services::init_services(&db_connection, app_handle())`
- [x] 4.2 确保 desktop 平台在数据库初始化完成后调用服务初始化
- [x] 4.3 确保 mobile 平台在数据库初始化完成后调用服务初始化
- [x] 4.4 运行 `cargo check` 验证 lib.rs 编译无误（服务管理层编译通过，命令层编译错误为预期的）

## 5. 重构记账命令层

- [x] 5.1 修改 `commands/accounting.rs`，导入 `services::accounting_service`
- [x] 5.2 修改 `add_accounting_record` 命令，通过 `services::accounting_service()` 获取服务实例
- [x] 5.3 修改 `add_accounting_record` 命令，调用 `service.add_record()` 方法
- [x] 5.4 修改 `modify_accounting_record` 命令，通过 `services::accounting_service()` 获取服务实例
- [x] 5.5 修改 `modify_accounting_record` 命令，调用 `service.modify_record()` 方法
- [x] 5.6 修改 `post_accounting_record` 命令，通过 `services::accounting_service()` 获取服务实例
- [x] 5.7 修改 `post_accounting_record` 命令，调用 `service.post_record()` 方法
- [x] 5.8 移除命令层中不再使用的 `use crate::db::connection;` 导入
- [x] 5.9 运行 `cargo check` 验证 accounting 命令层编译无误

## 6. 重构账本命令层

- [x] 6.1 修改 `commands/accounting_book.rs`，导入 `services::accounting_book_service`
- [x] 6.2 修改 `create_book` 命令，通过 `services::accounting_book_service()` 获取服务实例
- [x] 6.3 修改 `create_book` 命令，调用 `service.create_book()` 方法
- [x] 6.4 修改 `get_books` 命令，通过 `services::accounting_book_service()` 获取服务实例
- [x] 6.5 修改 `get_books` 命令，调用 `service.get_books()` 方法
- [x] 6.6 修改 `get_book_by_id` 命令，通过 `services::accounting_book_service()` 获取服务实例
- [x] 6.7 修改 `get_book_by_id` 命令，调用 `service.get_book_by_id()` 方法
- [x] 6.8 修改 `update_book_title` 命令，通过 `services::accounting_book_service()` 获取服务实例
- [x] 6.9 修改 `update_book_title` 命令，调用 `service.update_book_title()` 方法
- [x] 6.10 修改 `delete_book` 命令，通过 `services::accounting_book_service()` 获取服务实例
- [x] 6.11 修改 `delete_book` 命令，调用 `service.delete_book()` 方法
- [x] 6.12 修改 `get_records_by_book_id` 命令，通过 `services::accounting_book_service()` 获取服务实例
- [x] 6.13 修改 `get_records_by_book_id` 命令，调用 `service.get_records_by_book_id()` 方法
- [x] 6.14 修改 `get_uncategorized_records` 命令，通过 `services::accounting_book_service()` 获取服务实例
- [x] 6.15 修改 `get_uncategorized_records` 命令，调用 `service.get_uncategorized_records()` 方法
- [x] 6.16 修改 `get_books_paginated` 命令，通过 `services::accounting_book_service()` 获取服务实例
- [x] 6.17 修改 `get_books_paginated` 命令，调用 `service.get_books_paginated()` 方法
- [x] 6.18 修改 `get_records_by_book_id_paginated` 命令，通过 `services::accounting_book_service()` 获取服务实例
- [x] 6.19 修改 `get_records_by_book_id_paginated` 命令，调用 `service.get_records_by_book_id_paginated()` 方法
- [x] 6.20 修改 `get_write_off_records_by_id` 命令，通过 `services::accounting_book_service()` 获取服务实例
- [x] 6.21 修改 `get_write_off_records_by_id` 命令，调用 `service.get_write_off_records_by_id()` 方法
- [x] 6.22 移除命令层中不再使用的数据库连接获取逻辑
- [x] 6.23 运行 `cargo check` 验证 accounting_book 命令层编译无误

## 7. 重构附件命令层

- [x] 7.1 修改 `commands/attachment.rs`，导入 `services::attachment_service`
- [x] 7.2 修改 `create_attachment` 命令，通过 `services::attachment_service()` 获取服务实例
- [x] 7.3 修改 `create_attachment` 命令，移除 `AttachmentService::new()` 调用
- [x] 7.4 修改 `delete_attachment` 命令，通过 `services::attachment_service()` 获取服务实例
- [x] 7.5 修改 `delete_attachment` 命令，移除 `AttachmentService::new()` 调用
- [x] 7.6 修改 `delete_attachment_by_path` 命令，通过 `services::attachment_service()` 获取服务实例
- [x] 7.7 修改 `delete_attachment_by_path` 命令，移除 `AttachmentService::new()` 调用
- [x] 7.8 修改 `query_attachments` 命令，通过 `services::attachment_service()` 获取服务实例
- [x] 7.9 修改 `query_attachments` 命令，移除 `AttachmentService::new()` 调用
- [x] 7.10 修改 `download_attachment` 命令，通过 `services::attachment_service()` 获取服务实例
- [x] 7.11 修改 `download_attachment` 命令，移除 `AttachmentService::new()` 调用
- [x] 7.12 移除命令层中不再使用的数据库连接获取逻辑
- [x] 7.13 运行 `cargo check` 验证 attachment 命令层编译无误

## 8. 验证和测试

- [x] 8.1 运行 `cargo check` 验证整个项目编译无误
- [x] 8.2 运行 `cargo test` 确保所有测试通过
- [x] 8.3 运行 `pnpm tauri dev` 启动完整应用
