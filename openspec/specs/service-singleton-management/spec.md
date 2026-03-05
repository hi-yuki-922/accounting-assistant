## ADDED Requirements

### Requirement: Service singleton initialization
系统 MUST 在应用启动时初始化所有服务单例，确保服务实例在数据库连接池初始化完成后可用。

#### Scenario: Initialize services after database connection
- **WHEN** 数据库连接池初始化完成
- **THEN** 系统 MUST 调用 `services::init_services()` 初始化所有服务单例
- **THEN** 服务实例 MUST 使用已初始化的数据库连接池
- **THEN** 初始化 MUST 按照服务依赖顺序执行（如果有依赖关系）

#### Scenario: Initialize AttachmentService with AppHandle
- **WHEN** 调用服务初始化方法
- **WHEN** AttachmentService 需要 AppHandle
- **THEN** 系统 MUST 将 AppHandle 传递给 AttachmentService 构造函数
- **THEN** AttachmentService MUST 能够正常初始化

### Requirement: Service singleton access
系统 MUST 提供全局服务单例访问器，允许命令层获取已初始化的服务实例。

#### Scenario: Access accounting service singleton
- **WHEN** 命令层调用 `services::accounting_service()`
- **THEN** 系统 MUST 返回 AccountingService 单例实例
- **THEN** 返回的实例 MUST 已初始化数据库连接
- **THEN** 后续调用 MUST 返回同一个实例

#### Scenario: Access accounting book service singleton
- **WHEN** 命令层调用 `services::accounting_book_service()`
- **THEN** 系统 MUST 返回 AccountingBookService 单例实例
- **THEN** 返回的实例 MUST 已初始化数据库连接
- **THEN** 后续调用 MUST 返回同一个实例

#### Scenario: Access attachment service singleton
- **WHEN** 命令层调用 `services::attachment_service()`
- **THEN** 系统 MUST 返回 AttachmentService 单例实例
- **THEN** 返回的实例 MUST 已初始化数据库连接和 AppHandle
- **THEN** 后续调用 MUST 返回同一个实例

#### Scenario: Access uninitialized service
- **WHEN** 命令层调用服务访问器
- **WHEN** 服务尚未初始化
- **THEN** 系统 MUST panic 并显示明确的错误信息
- **THEN** 错误信息 MUST 指出哪个服务未初始化

### Requirement: Thread-safe service access
系统 MUST 确保服务单例在多线程环境下的访问是线程安全的。

#### Scenario: Concurrent access to service singleton
- **WHEN** 多个线程同时调用服务访问器
- **THEN** 系统 MUST 安全地返回服务实例
- **THEN** 所有线程 MUST 收到同一个服务实例
- **THEN** MUST 不出现数据竞争或死锁

### Requirement: Service class implementation
所有服务 MUST 采用服务类模式实现，持有数据库连接并提供业务方法。

#### Scenario: AccountingService holds database connection
- **WHEN** 创建 AccountingService 实例
- **WHEN** 调用服务方法
- **THEN** 方法内部 MUST 使用实例持有的数据库连接
- **THEN** 方法内部 MUST 不再调用 `connection::get_or_init_db()`

#### Scenario: AccountingBookService holds database connection
- **WHEN** 创建 AccountingBookService 实例
- **WHEN** 调用服务方法
- **THEN** 方法内部 MUST 使用实例持有的数据库连接
- **THEN** 方法内部 MUST 不再调用 `connection::get_or_init_db()`

### Requirement: Command layer integration
命令层 MUST 通过服务单例调用服务方法，而非直接创建服务实例。

#### Scenario: Accounting commands use service singleton
- **WHEN** 前端调用记账相关的 Tauri 命令
- **THEN** 命令处理器 MUST 通过 `services::accounting_service()` 获取服务实例
- **THEN** 命令处理器 MUST 不再创建新的服务实例
- **THEN** 命令处理器 MUST 不再直接获取数据库连接

#### Scenario: Accounting book commands use service singleton
- **WHEN** 前端调用账本相关的 Tauri 命令
- **THEN** 命令处理器 MUST 通过 `services::accounting_book_service()` 获取服务实例
- **THEN** 命令处理器 MUST 不再创建新的服务实例
- **THEN** 命令处理器 MUST 不再直接获取数据库连接

#### Scenario: Attachment commands use service singleton
- **WHEN** 前端调用附件相关的 Tauri 命令
- **THEN** 命令处理器 MUST 通过 `services::attachment_service()` 获取服务实例
- **THEN** 命令处理器 MUST 不再在每次调用时创建新服务实例
