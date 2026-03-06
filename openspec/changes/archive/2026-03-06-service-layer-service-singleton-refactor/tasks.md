## 1. 服务类重构

- [x] 1.1 分析现有服务类结构，识别所有使用 OnceCell 的服务
- [x] 1.2 修改 `AccountingService` - 移除 `instance()` 和 `init()` 静态方法
- [x] 1.3 修改 `AttachmentService` - 移除 `instance()` 和 `init()` 静态方法
- [x] 1.4 修改 `AccountingBookService` - 移除 `instance()` 和 `init()` 静态方法
- [x] 1.5 修改 `SidecarManager` - 移除 `instance()` 和 `init()` 静态方法（如有）
- [x] 1.6 验证所有服务类都有公共的构造方法（如 `new()`）
- [x] 1.7 更新服务类方法签名，添加必要的 Tauri 上下文参数（AppHandle、Window 等）

## 2. 应用初始化修改

- [x] 2.1 在 `lib.rs` 的 `Builder::setup` 回调中添加服务注册代码
- [x] 2.2 按照依赖顺序注册服务（确保数据库连接池、Sidecar 等基础服务优先）
- [x] 2.3 注册 `AccountingService`
- [x] 2.4 注册 `AttachmentService`
- [x] 2.5 注册 `AccountingBookService`
- [x] 2.7 验证服务注册顺序正确，无循环依赖
- [x] 2.8 添加错误处理，确保服务初始化失败时应用启动失败

## 3. 命令层重构

- [x] 3.1 识别所有命令处理函数文件（`src-tauri/src/commands/`）
- [x] 3.2 修改附件相关命令，使用 `State<'_, AttachmentService>` 替代静态调用
- [x] 3.3 修改记账记录相关命令，使用 `State<'_, AccountingService>` 替代静态调用
- [x] 3.4 修改账本相关命令，使用 `State<'_, AccountingBookService>` 替代静态调用
- [x] 3.5 更新命令处理函数签名，确保同时接受 `AppHandle` 和必要的 `State` 参数
- [x] 3.6 移除命令处理函数中的静态方法调用（如 `AttachmentService::instance()`）
- [x] 3.7 验证所有命令处理函数都正确使用了依赖注入

## 4. 构建和验证

- [x] 5.1 运行 `cargo build` 确保编译通过
- [x] 5.2 运行 `cargo clippy` 检查代码质量和潜在问题


## 6. 清理和文档

- [x] 6.1 更新服务类的注释，说明使用依赖注入
- [x] 6.2 更新开发者文档，说明新的服务使用方式
- [x] 6.3 验证代码符合 `tauri-rust-backend-code-standard` 标准
- [x] 6.4 清理临时代码和调试信息
