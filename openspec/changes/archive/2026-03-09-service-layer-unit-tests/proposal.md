## Why

当前项目缺乏服务层的单元测试覆盖，这增加了重构和功能开发过程中的回归风险。随着业务逻辑复杂度的提升，需要通过自动化测试来确保代码质量和可靠性，为未来的功能迭代提供安全网。

特别地，AttachmentService 部分功能依赖 `AppHandle` 进行文件系统操作，在单元测试中难以提供，导致这些功能无法被测试覆盖，增加了代码维护风险。

## What Changes

在 `src-tauri/tests` 目录下建立测试基础设施：

- **新增 `tests/context.rs`**：提供测试上下文模块
  - 使用 `once_cell::sync::Lazy` 实现基于内存 SQLite 的数据库连接池单例
  - 调用 `entity::with_install_entities` 方法注册 Sea-ORM 实体
  - 使用 Tauri 2.0 mock runtime 创建测试用的 AppHandle 单例
  - 封装服务类为多线程安全的单例模式
  - 在初始化时执行 `AccountingBookService::create_default_book` 创建默认账簿
  - 提供统一的测试生命周期管理

- **新增 `tests/services/*.rs`**：为现有服务层实现单元测试用例
  - `accounting_test.rs`：会计记录服务的单元测试
  - `attachment_test.rs`：附件服务的单元测试（包括文件上传/下载等依赖 AppHandle 的功能）
  - `accounting_book_test.rs`：会计账簿服务的单元测试

- **新增测试依赖配置**：更新 `Cargo.toml` 添加必要的测试依赖

## Capabilities

### New Capabilities

- `test-context-with-mock-app`：提供测试基础设施，包括内存数据库初始化、Tauri mock AppHandle、服务实例管理和测试生命周期控制

- `accounting-service-tests`：覆盖会计记录服务的增删改查、查询、统计等核心功能的单元测试

- `attachment-service-tests-with-mock`：覆盖附件服务的文件上传、下载、存储、检索等功能的单元测试，使用 mock AppHandle 支持

- `accounting-book-service-tests-with-default-book`：覆盖会计账簿服务的创建、管理、默认账簿初始化等功能的单元测试

### Modified Capabilities

（无）

## Impact

**受影响的代码和模块：**

- `src-tauri/tests/`：新增测试目录和相关测试文件
- `src-tauri/Cargo.toml`：添加测试依赖（如 `tokio-test`、`serial_test`、`tempfile`、`once_cell`）
- `src-tauri/src/services/`：现有服务代码可能需要添加 `pub` 可见性修饰符以支持测试

**不涉及的影响：**

- 不改变现有服务的业务逻辑和接口
- 不影响前端代码
- 不影响数据库 schema
- 不影响 Tauri 命令层

**测试运行方式：**

```bash
cd src-tauri
cargo test --tests
```

**关键改进点：**

1. **单例模式**：使用 `once_cell::sync::Lazy` 实现数据库连接和服务的单例，避免重复初始化
2. **Mock AppHandle**：利用 Tauri 2.0 的 mock runtime 创建测试用的 AppHandle，解决 AttachmentService 的测试依赖问题
3. **默认账簿**：在测试上下文初始化时自动创建默认账簿，所有测试共享同一账簿实例，避免外键约束错误
4. **串行执行**：使用 `#[serial]` 属性确保测试串行执行，避免并发数据库访问问题
