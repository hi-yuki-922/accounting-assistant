## Why

当前记账服务和账本服务采用函数式实现，与附件服务的服务类实现方式不一致。这种不一致性导致代码风格混乱，难以维护和扩展。同时，服务层缺乏统一的单例管理机制，命令层在每次调用时都需要重新创建服务实例，降低了代码效率和可维护性。

## What Changes

- 将记账服务（accounting）重构为服务类（AccountingService）形式，以附件服务为标准
- 将账本服务（accounting_book）重构为服务类（AccountingBookService）形式，以附件服务为标准
- 在服务层（services/mod.rs）中提供各服务的单例访问器
- 在服务层（services/mod.rs）中实现统一的服务初始化方法（init_services），该方法由 lib.rs 在数据库连接池初始化完成后调用
- 重构命令层，调用服务单例的方法而非直接创建服务实例
- **BREAKING**: 修改服务层和命令层的调用方式，需要同步更新所有相关代码

## Capabilities

### New Capabilities
- `service-singleton-management`: 服务单例管理，包括服务实例的初始化、全局访问和生命周期管理

### Modified Capabilities
- `accounting-service`: 记账服务的实现方式从函数式改为服务类式
- `accounting-book-service`: 账本服务的实现方式从函数式改为服务类式

## Impact

**受影响代码：**
- `src-tauri/src/services/accounting/mod.rs` - 从函数式重构为服务类
- `src-tauri/src/services/accounting_book/mod.rs` - 从函数式重构为服务类
- `src-tauri/src/services/mod.rs` - 新增服务单例管理和初始化方法
- `src-tauri/src/lib.rs` - 调用服务初始化方法
- `src-tauri/src/commands/accounting.rs` - 修改为调用服务单例
- `src-tauri/src/commands/accounting_book.rs` - 修改为调用服务单例

**API 变更：**
- 服务层公开的 API 从函数改为方法
- 命令层的实现方式变更，但前端调用的 Tauri 命令接口保持不变

**依赖变更：**
- 无新增外部依赖
- 仅修改内部架构
