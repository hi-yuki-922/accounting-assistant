## Context

当前服务层架构中，`AttachmentStorage` 结构体直接持有 `AppHandle`，这在 `storage.rs:9` 中定义为 `_app_handle: AppHandle`。这种设计导致服务层与 Tauri 框架紧密耦合，具体表现为：

1. `AttachmentStorage::new()` 需要传入 `AppHandle` 参数
2. `AttachmentService::new()` 间接需要 `AppHandle` 参数
3. 服务初始化函数 `init_attachment_service()` 需要传入 `AppHandle`
4. 服务层无法脱离 Tauri 环境独立测试

这种耦合违反了分层架构原则，服务层应该是与框架无关的业务逻辑层。

## Goals / Non-Goals

**Goals:**
- 移除 `AttachmentStorage` 结构体中的 `AppHandle` 字段
- 改为在需要时由调用者（命令层）传入 `AppHandle`
- 确保服务层不依赖 Tauri 特定类型
- 保持服务层方法的业务逻辑完整性
- 提高代码可测试性

**Non-Goals:**
- 不改变附件存储的目录结构
- 不改变附件文件命名规则
- 不改变数据库访问层
- 不影响其他服务（AccountingService, AccountingBookService）

## Decisions

### 1. 传递 AppHandle 的时机

**决定：** 由命令层在调用需要 AppHandle 的服务方法时传入，而非存储在服务结构体中。

**理由：**
- 保持了服务结构的轻量级，不存储不必要的依赖
- 依赖关系明确：方法签名清楚表明需要哪些依赖
- 更容易进行单元测试（可以 mock AppHandle）
- 符合依赖注入的最佳实践

**考虑的替代方案：**
- 存储为 `Option<AppHandle>`：引入了可选性，增加复杂度，且无法根本解决耦合问题
- 创建 `PathProvider` trait 抽象：过度设计，引入额外的抽象层次

### 2. 方法签名变更策略

**决定：** 只在需要访问 `app_data_dir` 的方法中添加 `AppHandle` 参数。

**理由：**
- 最小化变更影响范围
- 保持不需要 AppHandle 的方法签名不变
- 明确表达方法对 AppHandle 的依赖

**影响的方法：**
- `AttachmentStorage::new()` → 移除 `app_handle` 参数
- `AttachmentStorage::get_app_data_dir()` → 新增 `app_handle: &AppHandle` 参数
- `AttachmentStorage::get_base_storage_dir()` → 新增 `app_handle: &AppHandle` 参数
- `AttachmentStorage::get_monthly_dir()` → 新增 `app_handle: &AppHandle` 参数
- `AttachmentStorage::generate_storage_path()` → 新增 `app_handle: &AppHandle` 参数
- `AttachmentService::new()` → 移除 `app_handle` 参数
- `AttachmentService::create_attachment()` → 新增 `app_handle: &AppHandle` 参数

### 3. 服务单例初始化

**决定：** `AttachmentService` 初始化不再需要 `AppHandle`。

**理由：**
- AppHandle 由命令层在调用时动态传入
- 服务单例只持有数据库连接，与 Tauri 无关
- 初始化逻辑更简洁

**相关文件变更：**
- `services/mod.rs:33-36` - `init_attachment_service()` 签名变更
- `services/mod.rs:44-47` - `init_services()` 调用变更

## Risks / Trade-offs

### Risk 1: 命令层需要传递更多参数

**风险：** 所有需要 AppHandle 的服务调用都需要在命令层传递 AppHandle，增加了调用复杂度。

**缓解措施：**
- Tauri 命令函数签名已经包含 `app: AppHandle`，可直接传递
- 调用模式一致，不会造成混淆

### Risk 2: 向后兼容性

**风险：** 这是一次破坏性变更，现有代码需要全面更新。

**缓解措施：**
- 使用编译期错误帮助定位所有需要修改的调用点
- 按模块逐步迁移，确保每次变更后测试通过

### Trade-off: 方法签名变长

**权衡：** 方法签名添加了 AppHandle 参数，变得稍长。

**收益：** 清晰表达依赖关系，提高代码可理解性。

## Migration Plan

1. **第一阶段：修改 AttachmentStorage**
   - 移除 `_app_handle` 字段
   - 修改构造函数 `new()`
   - 为所有需要 app_data_dir 的方法添加 `app_handle` 参数

2. **第二阶段：修改 AttachmentService**
   - 修改构造函数 `new()` 移除 `app_handle` 参数
   - 为需要访问存储的方法添加 `app_handle` 参数
   - 传递 AppHandle 给底层 Storage 方法调用

3. **第三阶段：修改服务初始化**
   - 更新 `init_attachment_service()` 函数签名
   - 更新 `init_services()` 调用

4. **第四阶段：更新命令层**
   - 更新所有调用 AttachmentService 方法的命令
   - 添加 `app: AppHandle` 到命令函数签名（如果没有）
   - 传递 AppHandle 给服务方法调用

## Open Questions

无。设计方案已明确，可以直接实施。
