## ADDED Requirements

### Requirement: Service layer independence
服务层 MUST 不存储 Tauri 框架相关的类型（如 AppHandle），保持框架无关性。

#### Scenario: AttachmentStorage does not store AppHandle
- **WHEN** 创建 AttachmentStorage 实例
- **THEN** 结构体 MUST 不包含 AppHandle 字段
- **THEN** 构造函数 MUST 不接受 AppHandle 参数

#### Scenario: AttachmentService does not store AppHandle
- **WHEN** 创建 AttachmentService 实例
- **THEN** 结构体 MUST 不包含 AppHandle 字段
- **THEN** 构造函数 MUST 不接受 AppHandle 参数

#### Scenario: Service initialization without Tauri dependency
- **WHEN** 初始化服务单例
- **THEN** AttachmentService 初始化 MUST 不需要 AppHandle 参数
- **THEN** 服务初始化 MUST 只依赖数据库连接

### Requirement: AppHandle parameter passing
当服务层方法需要访问 Tauri 资源（如 app_data_dir）时，MUST 由调用者通过方法参数传入 AppHandle。

#### Scenario: Storage method receives AppHandle as parameter
- **WHEN** 调用 AttachmentStorage 的方法
- **WHEN** 方法需要访问 app_data_dir
- **THEN** 方法签名 MUST 包含 `app_handle: &AppHandle` 参数
- **THEN** 调用者 MUST 传递有效的 AppHandle

#### Scenario: Service method receives AppHandle as parameter
- **WHEN** 调用 AttachmentService 的方法
- **WHEN** 方法需要访问文件存储
- **THEN** 方法签名 MUST 包含 `app_handle: &AppHandle` 参数
- **THEN** 服务 MUST 将 AppHandle 传递给底层 Storage 方法

#### Scenario: Command layer passes AppHandle to service
- **WHEN** Tauri 命令处理器调用服务方法
- **WHEN** 服务方法需要 AppHandle
- **THEN** 命令处理器 MUST 从命令函数签名获取 AppHandle
- **THEN** 命令处理器 MUST 将 AppHandle 传递给服务方法调用

### Requirement: Minimal parameter passing impact
只有需要访问 Tauri 资源的方法才需要添加 AppHandle 参数，其他方法保持不变。

#### Scenario: Method without AppHandle requirement unchanged
- **WHEN** 调用不需要访问 app_data_dir 的服务方法
- **THEN** 方法签名 MUST 不包含 AppHandle 参数
- **THEN** 调用方式 MUST 与重构前一致

#### Scenario: Database-only methods unchanged
- **WHEN** 调用只涉及数据库操作的服务方法
- **THEN** 方法 MUST 不需要 AppHandle 参数
- **THEN** 方法 MUST 只使用已持有的数据库连接
