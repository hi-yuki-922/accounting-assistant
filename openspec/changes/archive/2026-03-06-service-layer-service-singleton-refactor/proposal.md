## Why

当前服务层使用 OnceCell 存储单例导致架构复杂度增加，服务初始化时机难以控制，与 Tauri 应用生命周期脱节。使用 Tauri 的 app.manage 机制可以更好地集成到应用生命周期中，提供更清晰的依赖注入模式和更好的类型安全。

## What Changes

- **BREAKING**: 移除服务类中的 OnceCell 单例模式
- 在 lib.rs 的 Tauri app 构建阶段使用 `app.manage()` 注册所有服务单例
- 修改所有命令处理函数，通过 `State<'_, ServiceType>` 参数注入所需的服务
- 移除服务类中的 `instance()`、`init()` 等静态方法
- 确保服务方法的签名能接受必要的 Tauri 上下文（如 AppHandle、Window 等）

## Capabilities

### New Capabilities
- `app-managed-service-injection`: 通过 Tauri app.manage 进行服务单例管理和依赖注入

### Modified Capabilities

## Impact

受影响的代码和系统：

- **核心架构**: `src-tauri/src/lib.rs` - 应用初始化和服务注册
- **服务层**: 所有 `src-tauri/src/services/` 下的服务类需要重构
- **命令层**: 所有 `src-tauri/src/commands/` 下的命令处理函数需要更新服务获取方式
- **构建配置**: 不需要修改 Cargo.toml，但需要确保所有服务都能被正确注册

此重构将提升代码的可维护性和可测试性，使服务生命周期与 Tauri 应用生命周期更紧密地结合。
