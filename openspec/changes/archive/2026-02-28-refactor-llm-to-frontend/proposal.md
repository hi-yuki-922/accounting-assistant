## Why

当前应用中 LLM 调用逻辑在 Rust 后端（`LLMService`）和前端（`src/services/llm.ts`）之间分散，造成职责不清晰、维护复杂。前端已经通过 AI SDK 直接调用 LLM API，Rust 后端的 LLM 服务变得冗余。需要将所有 LLM API 调用移至前端，Rust 后端仅负责维护配置环境变量。

## What Changes

- **移除 Rust 后端的 LLM 服务层**
  - 删除 `src-tauri/src/services/llm_service.rs`（LLM 完整服务实现，包括请求/响应结构、流式解码器等）
  - 删除 `src-tauri/src/commands/llm.rs`（LLM 相关 Tauri 命令：`chat_completion`、`test_llm_connection`）
  - 从 `src-tauri/src/commands/mod.rs` 中移除 LLM 命令注册

- **移除 Rust 后端 LLM 依赖**
  - 从 `Cargo.toml` 中移除 `reqwest`、`futures`、`async-stream`、`bytes` 等 LLM 相关依赖
  - 从 `src-tauri/src/services/mod.rs` 中移除 `llm_service` 模块导出

- **保留 Rust 后端的配置管理**
  - 保留 `src-tauri/src/commands/llm.rs` 中的 `get_llm_config` 命令（只负责返回环境变量配置）
  - 将 `get_llm_config` 移至新的配置模块（例如 `src-tauri/src/commands/config.rs`）
  - 继续通过环境变量 `SILICONFLOW_API_KEY`、`SILICONFLOW_BASE_URL`、`SILICONFLOW_MODEL` 管理配置

- **前端适配**
  - 前端 `src/services/llm.ts` 已直接使用 AI SDK 调用 API，无需修改核心逻辑
  - 移除前端对 `chat_completion` 命令的调用（如存在）
  - 移除前端对 `test_llm_connection` 命令的调用（如存在）
  - 保留 `getLLMConfig()` 函数，继续从 Rust 后端获取配置

## Capabilities

### New Capabilities

### Modified Capabilities

- **llm-service-refactor**: 重构 LLM 服务架构，将 API 调用从前端和 Rust 后端的混合模式改为纯前端调用模式

## Impact

- **Rust 后端**：移除约 350 行 LLM 服务代码，简化后端职责
- **Tauri IPC**：减少 3 个命令（`chat_completion`、`test_llm_connection`、`get_llm_config`），保留 1 个配置获取命令（`get_llm_config`）
- **前端**：移除对 Rust 后端 LLM 命令的依赖，统一使用 AI SDK
- **依赖管理**：减少 Rust 后端外部依赖包数量
- **测试覆盖**：移除 `src-tauri/src/services/llm_service.rs` 中的单元测试
