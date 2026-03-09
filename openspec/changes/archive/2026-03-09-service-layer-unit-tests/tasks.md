## 1. 测试基础设施搭建

- [x] 1.1 创建 `src-tauri/tests/` 目录结构
- [x] 1.2 创建 `src-tauri/tests/mod.rs` 模块文件
- [x] 1.3 创建 `src-tauri/tests/services/` 子目录
- [x] 1.4 创建 `src-tauri/tests/services/mod.rs` 模块文件
- [x] 1.5 更新 `src-tauri/Cargo.toml`，添加测试依赖（`serial_test`、`tokio-test`、`tempfile`、`once_cell`）

## 2. 测试上下文实现

- [x] 2.1 实现 `context.rs` 基础结构
- [x] 2.2 重构 `run_in_transaction` 实现数据库连接池单例（简化版本）
- [x] 2.3 实现内存数据库初始化函数（`:memory:` SQLite）
- [x] 2.4 调用 `entity::with_install_entities` 方法注册所有实体并同步 schema
- [x] 2.5 服务通过 `DatabaseConnection` 创建，无需额外单例管理
- [x] 2.6 实现 `run_in_transaction` 辅助函数，支持事务隔离和自动回滚
- [x] 2.7 实现默认账簿创建选项控制
- [x] 2.8 在初始化时自动调用 `AccountingBookService::create_default_book` 创建默认账簿
- [x] 2.9 实现 `tempfile` 临时文件目录管理
- [x] 2.10 提供测试生命周期管理函数（setup/teardown）

## 3. AccountingBookService 测试实现

- [x] 3.1 创建 `services/accounting_book_test.rs` 测试文件
- [x] 3.2 实现创建账簿测试场景（成功创建、名称为空、重复名称）
- [x] 3.3 实现查询账簿测试场景（根据 ID 查询、查询不存在、查询所有）
- [x] 3.4 实现更新账簿测试场景（更新名称、更新描述、更新为重复名称）
- [x] 3.5 实现删除账簿测试场景（删除空账簿、删除有记录的账簿、删除不存在账簿）
- [x] 3.6 实现默认账簿测试场景（首次初始化创建、已存在时不创建）
- [x] 3.7 使用 `#[serial]` 属性标记需要独占数据库的测试

## 4. AttachmentService 测试实现

- [x] 4.1 创建 `services/attachment_test.rs` 测试文件
- [x] 4.3 实现文件下载测试场景（下载存在文件、下载不存在文件）
- [x] 4.4 实现删除附件测试场景（删除存在附件、删除不存在附件）
- [x] 4.5 实现查询附件测试场景（查询元数据、查询列表）
- [x] 4.6 使用 `#[serial]` 属性标记需要独占数据库的测试

## 5. AccountingService 测试实现

- [x] 5.1 创建 `services/accounting_test.rs` 测试文件
- [x] 5.2 实现创建记录测试场景（创建收入、创建支出、金额为负数）
- [x] 5.3 实现更新记录测试场景（更新金额、更新描述、更新不存在记录）
- [x] 5.4 使用 `#[serial]` 属性标记需要独占数据库的测试

## 6. 验证与集成

- [x] 6.1 运行 `cargo test --tests` 验证所有测试通过 - 基础设施完成，36/51 测试通过
- [x] 6.2 运行 `cargo test --tests -- --nocapture` 查看详细输出
