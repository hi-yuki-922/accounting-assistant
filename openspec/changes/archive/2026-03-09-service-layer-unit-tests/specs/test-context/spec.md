## ADDED Requirements

### Requirement: 测试上下文提供内存数据库初始化

测试上下文模块 SHALL 提供内存 SQLite 数据库连接池的初始化功能。

#### Scenario: 成功初始化内存数据库
- **WHEN** 调用测试上下文的初始化函数
- **THEN** 系统创建一个基于 `:memory:` 的 SQLite 数据库连接
- **AND** 系统调用 `entity::with_install_entities` 方法注册所有 Sea-ORM 实体
- **AND** 数据库 schema 已同步到内存数据库
- **AND** 连接通过 `once_cell::sync::Lazy` 包装为单例
- **AND** 多次调用返回相同的数据库连接实例

#### Scenario: 单例模式确保唯一性
- **WHEN** 多次调用测试上下文的数据库获取函数
- **THEN** 返回相同的 `DatabaseConnection` 实例
- **AND** 连接指向同一个内存数据库

### Requirement: 测试上下文提供服务单例管理

测试上下文模块 SHALL 提供服务类的初始化和单例访问功能。

#### Scenario: 成功初始化所有服务
- **WHEN** 调用测试上下文的服务初始化函数
- **THEN** 系统创建 AccountingService、AttachmentService 和 AccountingBookService 实例
- **AND** 每个服务实例都持有相同的数据库连接引用
- **AND** 服务实例通过线程安全的单例模式管理

#### Scenario: 获取服务实例
- **WHEN** 调用测试上下文的服务获取函数
- **THEN** 返回对应服务的可变引用或包装后的线程安全实例
- **AND** 服务实例可用于执行业务逻辑操作

### Requirement: 测试上下文提供临时文件目录

测试上下文模块 SHALL 提供临时文件目录，供需要文件操作的测试使用。

#### Scenario: 创建临时文件目录
- **WHEN** 测试上下文初始化
- **THEN** 系统使用 `tempfile` 创建临时文件目录
- **AND** 临时目录路径可获取用于文件操作
- **AND** 测试完成后临时目录自动清理

### Requirement: 测试上下文自动创建默认账簿

测试上下文模块 SHALL 在初始化时自动创建默认账簿，供所有测试使用。

#### Scenario: 初始化时创建默认账簿
- **WHEN** 测试上下文首次初始化
- **THEN** 系统执行 AccountingBookService 的 `create_default_book` 调用
- **AND** 数据库中包含默认账簿记录（ID = 10000001）
- **AND** 默认账簿标题为 "未归类账目"
- **AND** 后续测试可直接引用默认账簿 ID，无需重复创建

#### Scenario: 避免重复创建默认账簿
- **WHEN** 测试上下文多次初始化（由于单例模式）
- **THEN** 默认账簿只创建一次
- **AND** 数据库中只有一条默认账簿记录
- **AND** 所有测试共享同一默认账簿实例

### Requirement: 测试上下文提供事务支持

测试上下文模块 SHALL 提供在事务中执行测试用例的辅助函数。

#### Scenario: 在事务中执行测试
- **WHEN** 调用 `run_in_transaction` 辅助函数执行测试逻辑
- **THEN** 测试代码在独立的数据库连接中执行
- **AND** 每个测试都创建全新的数据库实例
- **AND** 默认账簿自动创建

### Requirement: 测试上下文支持串行执行

测试上下文模块 SHALL 支持使用 `#[serial]` 属性确保测试串行执行。

#### Scenario: 串行执行避免并发问题
- **WHEN** 多个测试使用 `#[serial]` 属性
- **THEN** 测试按顺序执行，不会并发运行
- **AND** SQLite 数据库访问安全
