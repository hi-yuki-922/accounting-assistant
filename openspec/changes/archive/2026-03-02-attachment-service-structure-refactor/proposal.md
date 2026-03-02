# 附件管理服务目录结构重构

## Why

当前附件管理服务的代码分散在 `src-tauri/src/services/` 根目录下（`attachment.rs` 和 `attachment_storage.rs`），与记账管理服务的目录结构不一致。这种扁平结构不利于代码组织和维护，随着功能增长会导致代码混乱。需要重构为与 `services/accounting` 相同的目录结构，以提高代码的可维护性和一致性。

## What Changes

- 创建 `src-tauri/src/services/attachment/` 目录结构
- 将 `services/attachment.rs` 重构并移动到 `services/attachment/mod.rs`
- 将 `services/attachment_storage.rs` 移动到 `services/attachment/storage.rs`
- 创建 `services/attachment/dto/mod.rs`，从 `commands/attachment.rs` 中提取 DTO 定义
- 更新 `services/mod.rs` 模块引用
- 更新 `commands/attachment.rs` 的导入路径
- **BREAKING**: 更新所有引用附件服务的导入路径

## Capabilities

### New Capabilities
无 - 此重构不改变任何功能，仅调整代码结构

### Modified Capabilities
无 - 功能需求不变，仅实现层结构调整

## Impact

**受影响的代码文件：**
- `src-tauri/src/services/mod.rs` - 更新模块引用
- `src-tauri/src/commands/attachment.rs` - 更新导入路径
- `src-tauri/src/services/attachment.rs` - 重构并移动到新目录
- `src-tauri/src/services/attachment_storage.rs` - 移动到新目录

**新增目录和文件：**
- `src-tauri/src/services/attachment/` - 新的附件服务目录
- `src-tauri/src/services/attachment/mod.rs` - 服务主文件
- `src-tauri/src/services/attachment/storage.rs` - 存储管理模块
- `src-tauri/src/services/attachment/dto/mod.rs` - DTO 定义模块

**系统影响：**
- 这是一个纯代码重构，不影响数据库 schema、API 行为或用户界面
- 所有功能保持不变，仅调整代码组织结构
