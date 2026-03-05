## Context

当前项目采用 Tauri 2.0 架构，后端使用 Rust，前端使用 Vue 3 + TypeScript。服务层（services）包含记账服务、账本服务和附件服务。其中附件服务已经采用服务类（Service Class）模式实现，持有数据库连接并提供业务方法。然而，记账服务和账本服务仍然采用函数式实现，每个函数内部都调用 `connection::get_or_init_db()` 来获取数据库连接。

命令层（commands）作为 Tauri IPC 的入口点，负责处理前端请求并调用服务层。目前，附件服务的命令层在每次调用时都创建新的服务实例（`AttachmentService::new(db, app_handle)`），而记账和账本服务的命令层直接调用服务模块的函数。

这种不一致的实现方式导致以下问题：
1. 代码风格不统一，降低可维护性
2. 服务层缺乏统一的单例管理，每次创建服务实例都有额外开销
3. 数据库连接获取逻辑分散在各个函数中
4. 服务实例没有生命周期管理

## Goals / Non-Goals

**Goals:**
- 统一服务层的实现模式，全部采用服务类形式
- 在服务层实现统一的单例管理机制
- 命令层通过服务单例调用服务方法，而非直接创建实例
- 在应用启动时统一初始化所有服务单例
- 保持前端调用的 Tauri 命令接口不变

**Non-Goals:**
- 不修改业务逻辑，仅重构代码组织方式
- 不引入新的外部依赖
- 不改变数据库架构
- 不改变前端代码

## Decisions

### 决策 1：使用 OnceCell 实现服务单例

**选择：** 使用 `std::sync::OnceCell`（Rust 1.70+）实现服务单例，而非 `lazy_static` 或其他第三方库。

**理由：**
- `OnceCell` 是 Rust 标准库的一部分，无需引入额外依赖
- 与项目现有的依赖策略一致
- 提供 `get_or_init()` 方法，支持延迟初始化
- 线程安全，适用于 Tauri 的多线程环境

**替代方案考虑：**
- `lazy_static`：需要引入额外的宏和依赖，`OnceCell` 功能类似且更轻量
- `arc-swap`：过于复杂，本场景不需要原子替换操作
- 直接在 lib.rs 中创建静态变量：不符合 Rust 的所有权和生命周期管理最佳实践

### 决策 2：在 services/mod.rs 中统一管理服务单例

**选择：** 在 `services/mod.rs` 中定义服务单例的静态变量和访问函数。

**理由：**
- 集中管理所有服务的单例，便于维护
- 提供统一的 `init_services()` 初始化方法
- 避免在 lib.rs 中暴露过多实现细节
- 符合模块化设计原则

**替代方案考虑：**
- 每个服务模块内部管理自己的单例：会导致分散，初始化逻辑难以统一管理
- 创建单独的 service_manager 模块：对于当前三个服务来说过于复杂

### 决策 3：服务构造函数接收 DatabaseConnection 和必要的上下文

**选择：** 所有服务类都接收 `DatabaseConnection` 作为必需参数，按需接收其他上下文（如 `AppHandle`）。

**理由：**
- 与现有的 `AttachmentService` 模式保持一致
- 数据库连接是所有服务的核心依赖
- 便于单元测试时注入测试数据库连接

**替代方案考虑：**
- 服务在内部通过全局函数获取数据库连接：降低了可测试性和依赖注入的灵活性

### 决策 4：命令层通过服务访问器函数获取服务实例

**选择：** 命令层通过 `services::accounting_service()` 等访问器函数获取服务单例。

**理由：**
- 封装了单例的实现细节
- 提供清晰的接口，命令层无需关心单例如何创建和管理
- 便于未来添加日志、监控等横切关注点

**替代方案考虑：**
- 直接访问静态变量：破坏封装性，不利于维护
- 每次调用都创建新实例：不符合单例模式的目标

## Risks / Trade-offs

### 风险 1：初始化顺序依赖

**风险：** 服务单例必须在数据库连接池初始化完成后才能创建。如果初始化顺序错误，会导致运行时 panic。

**缓解措施：**
- 在 `lib.rs` 中的数据库初始化完成后立即调用 `services::init_services()`
- 在单例访问函数中使用 `expect()` 提供清晰的错误信息，确保服务已初始化

### 风险 2：测试环境的服务隔离

**风险：** 使用全局单例可能导致测试之间的干扰，难以隔离测试。

**缓解措施：**
- 服务类仍然支持直接构造（通过 `new()` 方法），测试时可以创建独立实例
- 在单元测试中，建议直接创建服务实例而非使用单例
- 集成测试中，每个测试前可以重新初始化服务单例（需要设计重置机制）

### 权衡：增加的复杂度 vs 带来的好处

**权衡：** 引入单例管理会增加一定的代码复杂度，但换来了：
- 统一的代码风格和架构
- 更好的性能（避免重复创建实例）
- 更清晰的职责分离

## Migration Plan

### 步骤 1：重构记账服务为服务类

1. 在 `services/accounting/mod.rs` 中定义 `AccountingService` 结构体
2. 实现构造函数 `new(db: DatabaseConnection)`
3. 将现有的函数改为 `AccountingService` 的方法
4. 方法内部不再调用 `connection::get_or_init_db()`，直接使用 `&self.db`

### 步骤 2：重构账本服务为服务类

1. 在 `services/accounting_book/mod.rs` 中定义 `AccountingBookService` 结构体
2. 实现构造函数 `new(db: DatabaseConnection)`
3. 将现有的函数改为 `AccountingBookService` 的方法
4. 方法内部不再调用 `connection::get_or_init_db()`（目前账本服务内部没有数据库获取逻辑）

### 步骤 3：实现服务单例管理

1. 在 `services/mod.rs` 中为每个服务定义 `OnceCell` 单例变量
2. 为每个服务实现 `init_*_service()` 函数
3. 实现统一的 `init_services()` 函数，依次初始化所有服务
4. 为每个服务实现访问器函数（如 `accounting_service()`）

### 步骤 4：集成到 lib.rs

1. 在数据库初始化完成后调用 `services::init_services(&db_connection, &app_handle)`
2. 确保 AppHandle 按需传递给需要的服务（如 AttachmentService）

### 步骤 5：重构命令层

1. 修改 `commands/accounting.rs`，通过 `services::accounting_service()` 获取服务实例
2. 修改 `commands/accounting_book.rs`，通过 `services::accounting_book_service()` 获取服务实例
3. 修改 `commands/attachment.rs`，通过 `services::attachment_service()` 获取服务实例（避免每次创建新实例）
4. 移除命令层中不再需要的数据库连接获取逻辑

### 步骤 6：验证和测试

1. 运行 `cargo check` 验证编译
2. 运行 `cargo test` 确保所有测试通过
3. 手动测试前端功能，确保 Tauri 命令正常工作

### 回滚策略

如果重构后出现严重问题，可以通过 git 回滚到重构前的代码。建议在完成步骤 3 后提交一次，作为中间状态，便于回滚到特定阶段。

## Open Questions

1. **是否需要服务的重置机制？** 当前设计中没有提供重置单例的方法。如果未来需要（例如在测试环境中），可以添加 `reset_services()` 函数。

2. **附件服务的 AppHandle 传递方式？** 当前附件服务需要 `AppHandle`，但其他服务不需要。在 `init_services()` 中需要按需传递 `AppHandle`。是否有更优雅的设计？

3. **错误处理策略？** 如果服务初始化失败（例如数据库连接异常），应该如何处理？当前使用 `expect()` 会导致 panic，是否需要更优雅的错误处理？
