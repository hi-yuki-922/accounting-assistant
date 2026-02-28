## REMOVED Requirements

### Requirement: Rust 后端提供 LLM 聊天完成命令
**Reason**: LLM API 调用已移至前端，使用 AI SDK 直接调用，Rust 后端命令冗余
**Migration**: 前端使用 `src/services/llm.ts` 中的 `chatCompletion` 函数（基于 AI SDK）

### Requirement: Rust 后端提供 LLM 连接测试命令
**Reason**: 前端可通过实际调用 LLM API 验证连接，无需单独命令
**Migration**: 前端可调用 `chatCompletion` 验证连接状态

### Requirement: Rust 后端实现完整 LLM 服务
**Reason**: 前端已通过 AI SDK 实现所有 LLM 功能（流式/非流式调用），Rust 实现冗余
**Migration**: 移除 `src-tauri/src/services/llm_service.rs`，使用前端 AI SDK

## MODIFIED Requirements

### Requirement: Rust 后端提供 LLM 配置获取命令
系统 SHALL 通过 Tauri IPC 命令提供 LLM 配置信息，包括 API Key、Base URL 和 Model 名称。

#### Scenario: 成功获取 LLM 配置
- **WHEN** 前端调用 `get_llm_config` 命令
- **THEN** 系统返回包含 `api_key`、`base_url`、`model` 的配置对象
- **THEN** 配置来源于环境变量 `SILICONFLOW_API_KEY`、`SILICONFLOW_BASE_URL`、`SILICONFLOW_MODEL`

#### Scenario: 环境变量未设置时使用默认值
- **WHEN** `SILICONFLOW_BASE_URL` 环境变量未设置
- **THEN** 系统使用默认值 `https://api.siliconflow.cn/v1`
- **WHEN** `SILICONFLOW_MODEL` 环境变量未设置
- **THEN** 系统使用默认值 `Qwen/Qwen2.5-7B-Instruct`

#### Scenario: API Key 为空时返回空字符串
- **WHEN** `SILICONFLOW_API_KEY` 环境变量未设置
- **THEN** 系统返回 `api_key` 为空字符串
- **THEN** 前端需自行处理无效配置的情况

### Requirement: Rust 后端移除 LLM 相关依赖
系统 SHALL 从 `Cargo.toml` 中移除 LLM 相关的外部依赖，除非被其他模块使用。

#### Scenario: 移除 reqwest 依赖
- **WHEN** 确认 `reqwest` 仅被 `llm_service` 使用
- **THEN** 系统从 `Cargo.toml` 中移除 `reqwest` 依赖

#### Scenario: 移除 async-stream 依赖
- **WHEN** 确认 `async-stream` 仅被 `llm_service` 使用
- **THEN** 系统从 `Cargo.toml` 中移除 `async-stream` 依赖

#### Scenario: 保留被其他模块使用的依赖
- **WHEN** `futures` 被 sidecar 模块使用
- **THEN** 系统保留 `futures` 依赖

### Requirement: 前端独立完成 LLM API 调用
系统 SHALL 使用 AI SDK 直接调用 SiliconFlow API，不依赖 Rust 后端的 LLM 服务。

#### Scenario: 非流式聊天完成
- **WHEN** 前端调用 `chatCompletion` 函数
- **THEN** 系统通过 AI SDK 向 SiliconFlow API 发送请求
- **THEN** 系统返回完整的 LLM 响应内容

#### Scenario: 流式聊天完成
- **WHEN** 前端调用 `chatCompletionStream` 函数
- **THEN** 系统通过 AI SDK 建立 SSE 流式连接
- **THEN** 系统逐块返回 LLM 生成的内容

#### Scenario: 使用配置初始化客户端
- **WHEN** 前端调用 `initLLMClient` 函数
- **THEN** 系统从 Rust 后端获取 LLM 配置
- **THEN** 系统使用配置初始化 AI SDK 客户端
