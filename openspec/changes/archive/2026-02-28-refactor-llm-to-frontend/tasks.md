## 1. 代码检查与准备

- [x] 1.1 搜索前端代码，确认无 `chat_completion` 命令引用
- [x] 1.2 搜索前端代码，确认无 `test_llm_connection` 命令引用（发现：src\services\llm.ts）
- [x] 1.3 搜索 Rust 代码，确认 `reqwest` 无其他模块引用
- [x] 1.4 搜索 Rust 代码，确认 `async-stream` 无其他模块引用
- [x] 1.5 搜索 Rust 代码，确认 `futures` 是否被其他模块使用（确认：仅 llm_service.rs 使用）
- [x] 1.6 搜索 Rust 代码，确认 `bytes` 无其他模块引用
- [x] 1.7 确认前端 `src/services/llm.ts` 已使用 AI SDK 完成所有功能

## 2. 创建配置模块

- [x] 2.1 创建 `src-tauri/src/commands/config.rs` 文件
- [x] 2.2 将 `get_llm_config` 命令代码从 `llm.rs` 移至 `config.rs`
- [x] 2.3 保留 `LLMConfig` 结构体定义在 `config.rs`
- [x] 2.4 在 `src-tauri/src/commands/mod.rs` 中添加 `mod config;`
- [x] 2.5 在 `commands/mod.rs` 的 `invoke_handler` 中注册 `config::get_llm_config`

## 3. 移除 LLM 服务层

- [x] 3.1 删除 `src-tauri/src/services/llm_service.rs` 文件
- [x] 3.2 从 `src-tauri/src/services/mod.rs` 中移除 `pub mod llm_service;`
- [x] 3.3 删除 `src-tauri/src/commands/llm.rs` 文件
- [x] 3.4 从 `src-tauri/src/commands/mod.rs` 中移除 `mod llm;`
- [x] 3.5 从 `commands/mod.rs` 的 `invoke_handler` 中移除 `llm::chat_completion`
- [x] 3.6 从 `commands/mod.rs` 的 `invoke_handler` 中移除 `llm::test_llm_connection`

## 4. 清理 Rust 依赖

- [x] 4.1 从 `src-tauri/Cargo.toml` 中移除 `reqwest` 依赖（如无其他引用）
- [x] 4.2 从 `src-tauri/Cargo.toml` 中移除 `async-stream` 依赖（如无其他引用）
- [x] 4.3 从 `src-tauri/Cargo.toml` 中移除 `bytes` 依赖（如无其他引用）
- [x] 4.4 从 `src-tauri/Cargo.toml` 中移除 `futures` 依赖（如无其他引用）
- [x] 4.5 运行 `cd src-tauri && cargo build` 验证编译通过

## 5. 前端适配

- [x] 5.1 确认前端 `src/services/llm.ts` 中无 `chat_completion` 命令调用
- [x] 5.2 确认前端 `src/services/llm.ts` 中无 `test_llm_connection` 命令调用（已移除 testLLMConnection 函数）
- [x] 5.3 确认前端 `getLLMConfig()` 函数继续调用 `get_llm_config` 命令

## 6. 验证与测试

- [x] 6.6 运行 `cargo test` 验证 Rust 测试通过（3 个测试通过）
