## ADDED Requirements

### Requirement: Service initialization through app.manage
所有服务类 SHALL 在 Tauri 应用构建阶段通过 `app.manage()` 机制进行初始化和注册，确保服务在应用生命周期内以单例形式存在。

#### Scenario: Successful service registration
- **WHEN** Tauri 应用在 Builder::setup 回调中执行 `app.manage(service_instance)`
- **THEN** 该服务 SHALL 被注册到应用的 State 管理器中
- **THEN** 该服务 SHALL 在整个应用生命周期内保持单例状态
- **THEN** 如果服务初始化失败，应用启动 SHALL 失败并返回错误

#### Scenario: Service initialization order
- **WHEN** 多个服务通过 `app.manage()` 注册
- **THEN** 服务 SHALL 按照注册顺序进行初始化
- **THEN** 如果服务 A 依赖服务 B，则服务 B SHALL 在服务 A 之前注册
- **THEN** 如果存在循环依赖，编译器 SHALL 报告错误

### Requirement: Service injection in command handlers
命令处理函数 SHALL 通过 `State<'_, ServiceType>` 参数访问已注册的服务实例。

#### Scenario: Command handler with single service
- **WHEN** 命令处理函数定义包含 `service: State<'_, AttachmentService>` 参数
- **THEN** Tauri SHALL 自动注入 AttachmentService 实例
- **THEN** 该服务实例 SHALL 与通过 app.manage() 注册的实例相同
- **THEN** 如果服务未注册，编译 SHALL 失败

#### Scenario: Command handler with multiple services
- **WHEN** 命令处理函数定义包含多个服务 State 参数
- **THEN** Tauri SHALL 自动注入所有指定的服务实例
- **THEN** 所有服务实例 SHALL 保持与注册时的单例一致性

### Requirement: Service method signature for Tauri context
服务方法 SHALL 接受必要的 Tauri 上下文（如 AppHandle、Window）作为参数，而不是将其存储在服务单例中。

#### Scenario: Service method requiring AppHandle
- **WHEN** 服务方法需要访问应用级功能
- **THEN** 该方法 SHALL 接受 `&AppHandle` 参数
- **THEN** 该方法 SHALL 使用传入的 AppHandle 执行所需操作

#### Scenario: Service method requiring Window
- **WHEN** 服务方法需要访问特定窗口
- **THEN** 该方法 SHALL 接受 `&Window` 参数
- **THEN** 该方法 SHALL 使用传入的 Window 执行所需操作

### Requirement: Removal of OnceCell singleton pattern
服务类 SHALL 移除所有 `OnceCell` 相关的单例实现，包括 `instance()` 静态方法和 `init()` 初始化方法。

#### Scenario: Direct service instantiation
- **WHEN** 创建服务实例
- **THEN** 客户端 SHALL 直接使用 `Service::new()` 或其他构造方法
- **THEN** 不存在全局静态的 `instance()` 方法
- **THEN** 不存在全局静态的 `init()` 方法

#### Scenario: Service lifecycle management
- **WHEN** 应用启动
- **THEN** 服务 SHALL 通过 `app.manage()` 创建并管理其生命周期
- **THEN** 服务 SHALL 不再由 OnceCell 管理其生命周期
- **THEN** 服务实例 SHALL 随应用关闭而销毁


