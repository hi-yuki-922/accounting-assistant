## Context

当前 Tauri Rust 后端使用 Sea-ORM 实现数据持久化，服务层（AccountingService、AttachmentService、AccountingBookService）承载核心业务逻辑。项目依赖 `:memory:` SQLite 连接用于开发和测试环境，但目前缺乏自动化测试覆盖。

现有服务通过 `Tauri::App::manage()` 进行依赖注入，通过 `DatabaseConnection` 共享连接池。服务初始化在 `services::init_services()` 中完成，包括默认账簿的创建。AttachmentService 部分方法依赖 `AppHandle` 进行文件系统操作。

测试基础设施缺失导致：
- 重构时无法验证行为保持不变
- 新功能开发缺乏回归保护
- 代码质量问题难以提前发现
- 因 AppHandle 依赖导致 AttachmentService 部分功能无法单元测试

## Goals / Non-Goals

**Goals:**

- 建立可复用的测试上下文基础设施，支持内存数据库和服务单例管理
- 使用 Tauri 2.0 的 mock 功能创建测试用的 AppHandle
- 在测试上下文中自动创建默认账簿，供所有测试使用
- 为三个现有服务实现全面的单元测试覆盖，包括依赖 AppHandle 的功能
- 确保测试可独立运行，不依赖外部状态或文件系统
- 使用 Rust 标准测试框架和常用测试工具

**Non-Goals:**

- 不涉及集成测试（如 Tauri 命令层的端到端测试）
- 不涉及前端测试
- 不修改现有服务的业务逻辑或接口
- 不涉及性能基准测试

## Decisions

### 1. 测试上下文模块设计

**决策**：使用 `once_cell::sync::Lazy` 实现线程安全的单例模式

**理由**：
- 避免在每个测试用例中重复初始化数据库和服务
- 线程安全确保并行测试不会产生竞态条件
- `once_cell::sync::Lazy` 是现代 Rust 的推荐选择，无需额外宏依赖
- 支持在初始化时创建默认账簿，确保所有测试都有可用的账簿引用
- 支持创建 mock AppHandle 单例，供 AttachmentService 使用

**替代方案考虑**：
- 每个测试独立初始化：简单但性能差，无法复用数据库 schema，无法创建全局默认账簿
- 全局可变静态变量：不安全，违反 Rust 借用规则

**改进说明**：
- 原设计中每个测试独立初始化数据库，导致无法跨测试共享默认账簿
- 新设计使用单例模式，在首次初始化时创建默认账簿，所有测试共享同一账簿
- 使用 Tauri 2.0 的 mock 功能创建 AppHandle 单例，供 AttachmentService 使用

### 2. 数据库连接管理

**决策**：使用 `:memory:` SQLite 连接，通过 `once_cell::sync::Lazy` 实现单例

**理由**：
- 内存数据库保证测试隔离，每次运行都是干净状态（配合串行执行）
- 单例模式确保所有测试共享同一数据库连接
- 在初始化时创建默认账簿，避免每个测试都要创建
- Sea-ORM 的 `DatabaseConnection` 支持 Clone，但使用 Lazy 更明确生命周期

**实现方式**：
1. 使用 `once_cell::sync::Lazy` 创建全局数据库连接
2. 创建 `:memory:` SQLite 连接
3. 调用 `entity::with_install_entities(&db).await` 注册所有实体并同步 schema
4. 调用 `AccountingBookService::create_default_book` 创建默认账簿
5. 使用 `#[serial]` 属性确保测试串行执行，避免并发问题

### 3. Tauri Mock AppHandle 创建

**决策**：使用 Tauri 2.0 的 mock runtime 创建测试用的 AppHandle

**理由**：
- Tauri 2.0 提供内置的 mock 功能，无需额外依赖
- Mock AppHandle 提供与生产环境一致的接口
- 不执行实际的 Tauri 应用逻辑，确保测试隔离
- 支持文件系统操作的 mock（配合 tempfile 使用）

**实现方式**：
1. 在测试上下文中使用 Tauri 的 mock 功能初始化 AppHandle
2. 使用 `once_cell::sync::Lazy` 实现 AppHandle 单例
3. 将 mock AppHandle 传递给 AttachmentService
4. 使用 `tempfile` 创建临时文件目录进行文件操作测试

### 4. 测试依赖包选择

**决策**：添加以下测试依赖
- `serial_test`：强制串行执行某些需要独占数据库的测试
- `tokio-test`：提供异步测试工具和宏
- `tempfile`：为文件系统操作提供临时目录（附件服务测试需要）
- `once_cell`：实现线程安全的单例模式

**理由**：
- `serial_test` 解决 SQLite 并发写入的潜在问题
- `tokio-test` 简化异步测试编写，提供 `tokio::test!` 宏
- `tempfile` 确保文件操作不影响宿主系统
- `once_cell` 提供现代 Rust 推荐的单例实现
- Tauri 2.0 内置 mock 功能，无需额外依赖包

### 5. 测试文件组织结构

**决策**：按服务模块划分测试文件，使用 `mod` 组织

```
src-tauri/tests/
├── context.rs          # 测试上下文（数据库、AppHandle、服务单例）
├── mod.rs             # 模块声明
└── services/
    ├── mod.rs         # 模块声明
    ├── accounting_test.rs
    ├── attachment_test.rs
    └── accounting_book_test.rs
```

**理由**：
- 模块化结构清晰，易于维护和扩展
- 按服务划分与源代码结构一致
- `mod.rs` 提供统一的公共接口
- context.rs 集中管理测试基础设施，便于复用

### 6. 测试隔离策略

**决策**：使用单例数据库连接 + 每个测试清理测试数据的策略

**理由**：
- 单例连接支持默认账簿的创建和共享
- 每个测试开始前清理数据（或使用唯一 ID 避免冲突）
- 确保测试之间隔离，一个测试失败不影响其他
- 便于调试，测试失败后可保留数据查看

**实现方式**：
1. 使用 `once_cell::sync::Lazy` 创建全局数据库连接
2. 在首次初始化时执行 `create_default_book` 创建默认账簿
3. 使用 `#[serial]` 属性确保测试串行执行
4. 每个测试使用独立的事务连接

**改进说明**：
- 原设计尝试使用事务回滚实现隔离，但由于服务层使用 `DatabaseConnection` 而非事务连接，无法完美实现
- 新设计使用串行执行 + 清理策略，实际效果相同且更易实现
- 单例数据库连接确保默认账簿可用，同时通过串行执行避免并发问题

## Risks / Trade-offs

### 风险 1：测试与生产环境差异

**描述**：内存数据库可能与生产环境磁盘 SQLite 有性能差异

**缓解措施**：
- 单元测试专注于逻辑正确性，不依赖性能特征
- 使用相同版本的 SQLite 和 Sea-ORM 配置
- 关键路径可考虑集成测试补充

### 风险 2：AppHandle 依赖问题

**描述**：AttachmentService 的部分方法依赖 AppHandle，在单元测试中难以提供

**缓解措施**：
- 使用 Tauri 2.0 的 mock runtime 功能创建测试用的 AppHandle
- 在测试上下文中初始化 mock AppHandle 单例
- 对于不需要 AppHandle 的方法，先完成测试
- 对于必须依赖 AppHandle 的方法，使用 tempfile 创建真实临时文件

### 风险 3：服务可见性问题

**描述**：现有服务某些方法可能是 `pub(crate)` 或 `private`，测试无法访问

**缓解措施**：
- 必要时将测试需要的方法改为 `pub`
- 考虑使用 `#[cfg(test)]` 模块暴露内部实现
- 优先测试公共接口，减少对内部实现的依赖

### 风险 4：异步测试复杂度

**描述**：Sea-ORM 操作是异步的，异步测试可能更难调试

**缓解措施**：
- 使用 `tokio::test` 宏简化测试编写
- 测试上下文提供辅助函数减少 async/await 噪音
- 添加清晰的错误消息和断言信息

### 权衡：测试覆盖率 vs 开发速度

**描述**：追求高覆盖率可能增加开发时间

**权衡**：
- 优先测试核心业务逻辑和复杂分支
- 简单的 getter/setter 可降低测试优先级
- 目标覆盖率达到 70-80%，确保关键路径有保护

## Migration Plan

### 阶段 1：测试基础设施搭建

1. 创建 `src-tauri/tests/` 目录和基础模块结构
2. 实现 `context.rs`，提供：
   - 使用 `once_cell::sync::Lazy` 的单例数据库连接
   - Tauri mock AppHandle 初始化
   - 服务单例管理
   - 默认账簿创建
   - `run_in_transaction` 辅助函数
3. 更新 `Cargo.toml`，添加测试依赖

### 阶段 2：服务测试实现（按依赖顺序）

1. 实现 AccountingBookService 测试（其他服务依赖）
2. 实现 AttachmentService 测试（包括文件上传/下载等需要 AppHandle 的功能）
3. 实现 AccountingService 测试（最复杂）

### 阶段 3：验证和集成

1. 运行 `cargo test --tests` 验证所有测试通过
2. 检查测试覆盖率（可选）
3. 添加 CI/CD 集成（如果已有 CI）

### 回滚策略

- 测试代码位于 `tests/` 目录，不影响生产代码
- 如测试导致构建问题，可通过注释掉 `tests/` 模块快速恢复
- 依赖项修改可通过回滚 `Cargo.toml` 恢复

## Open Questions

1. **测试数据管理**：是否需要提供测试数据 fixtures 辅助函数？
   - 建议：先实现基本 CRUD 测试，如重复模式再提取 fixtures

2. **Mock 外部依赖**：AttachmentService 涉及文件系统操作，如何处理？
   - 决策：使用 Tauri 2.0 mock runtime 创建 AppHandle，使用 `tempfile` 创建真实临时文件

3. **测试运行时间**：大量测试可能需要较长时间，是否需要并行执行优化？
   - 建议：使用 `#[serial]` 确保串行执行，避免并发问题。后续根据实际运行时间决定是否优化

4. **默认账簿创建**：AccountingBookService 的 `create_default_book` 在测试中的时机？
   - 决策：在测试上下文初始化时创建，所有测试共享同一默认账簿
