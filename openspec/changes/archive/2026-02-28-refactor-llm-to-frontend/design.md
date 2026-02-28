## Context

### 当前状态

应用当前采用混合架构：
- **Rust 后端**：`src-tauri/src/services/llm_service.rs` 实现完整的 LLM 服务（355 行代码），包括请求/响应结构、SSE 流式解码器、错误处理等
- **Tauri 命令**：`src-tauri/src/commands/llm.rs` 提供 `chat_completion`、`get_llm_config`、`test_llm_connection` 三个 IPC 命令
- **前端**：`src/services/llm.ts` 使用 AI SDK（`@ai-sdk/openai`）直接调用 SiliconFlow API，具备完整的流式和非流式调用能力

### 问题

1. **职责重复**：前后端都实现了 LLM API 调用逻辑
2. **依赖冗余**：Rust 后端维护 `reqwest`、`futures`、`async-stream`、`bytes` 等依赖，但前端已直接调用 API
3. **维护成本**：两套实现增加了维护复杂度
4. **架构不一致**：前端已通过 AI SDK 完成所有 LLM 功能，Rust 后端实现显得冗余

### 约束

- 前端已完整实现 LLM 调用能力（流式和非流式）
- 需要保留 Rust 后端对配置的读取（环境变量管理）
- 不能破坏现有前端功能

## Goals / Non-Goals

### Goals

- 移除 Rust 后端冗余的 LLM 服务代码（约 350 行）
- 减少 Rust 后端外部依赖（`reqwest`、`futures`、`async-stream`、`bytes`）
- 简化 Rust 后端职责，仅保留配置管理
- 保持前端 LLM 功能不变

### Non-Goals

- 修改前端 LLM 调用逻辑
- 修改配置管理方式（仍使用环境变量）
- 改变 SiliconFlow API 调用方式
- 影响其他后端功能（会计记录、附件管理等）

## Decisions

### 决策 1：保留配置管理在 Rust 后端

**选择**：将 `get_llm_config` 移至新的 `config.rs` 模块，继续由 Rust 后端提供

**理由**：
- 环境变量由 Tauri 应用管理（`.env` 文件或系统环境变量）
- Rust 后端已具备环境变量读取能力
- 统一配置管理，避免前端直接读取环境变量（安全性和一致性）

**替代方案考虑**：
- **前端直接读取环境变量**：❌ 前端无法直接访问系统环境变量，需要通过 Tauri 插件
- **配置存储在前端（localStorage）**：❌ 安全性较差，配置更新不统一

### 决策 2：完全移除 Rust LLM 服务层

**选择**：删除 `llm_service.rs` 和相关依赖

**理由**：
- 前端 AI SDK 已完整实现所有功能
- Rust 实现维护成本高，使用频率低（前端已直接调用）
- 减少编译时间和二进制体积

**替代方案考虑**：
- **保留 Rust LLM 服务作为备份**：❌ 增加维护成本，无实际价值
- **只保留 Rust 服务，移除前端 AI SDK**：❌ 前端功能已完整开发，回退成本高

### 决策 3：前端依赖检查

**选择**：确认前端已不使用 `chat_completion` 和 `test_llm_connection` 命令，然后移除

**理由**：
- 前端 `src/services/llm.ts` 直接使用 AI SDK
- 删除冗余命令前需确认无其他代码引用

**替代方案考虑**：
- **保留命令但标记为废弃**：❌ 增加混淆，建议直接删除

## Risks / Trade-offs

### 风险 1：前端仍有对 Rust LLM 命令的引用

**风险**：前端某处代码可能仍在调用 `chat_completion` 或 `test_llm_connection`，删除后会导致运行时错误

**缓解措施**：
- 实施前全局搜索前端代码，确认无引用
- 如果发现引用，提前迁移至 AI SDK 方式

### 风险 2：Rust 依赖移除影响其他模块

**风险**：`reqwest`、`futures` 等包可能被其他模块使用（如 sidecar），误删会导致编译错误

**缓解措施**：
- 移除依赖前检查 `Cargo.toml` 和其他 Rust 代码引用
- 仅当确认无其他模块使用时才移除依赖

### 风险 3：配置读取路径变更

**风险**：将 `get_llm_config` 移至新模块可能影响前端调用

**缓解措施**：
- 命令名称保持不变（`get_llm_config`）
- 仅移动代码位置，IPC 命令签名不变

### 权衡：前端直接调用 vs 后端代理

| 维度 | 前端直接调用 | 后端代理（当前） |
|------|-------------|-----------------|
| 响应延迟 | 低（直连） | 高（IPC 中转） |
| 实现复杂度 | 中（需处理 API 细节） | 高（需实现完整服务） |
| 灵活性 | 高（直接控制） | 低（受限于后端） |
| 安全性 | 中（密钥在前端） | 高（密钥在后端） |

**选择**：前端直接调用（已实施）

**权衡理由**：Tauri 应用为桌面应用，前端密钥可接受；延迟和灵活性更重要

## Migration Plan

### 阶段 1：代码检查（准备）

1. 搜索前端代码，确认无 `chat_completion` 和 `test_llm_connection` 命令引用
2. 搜索 Rust 代码，确认 `reqwest`、`futures`、`async-stream`、`bytes` 无其他引用
3. 确认前端 `src/services/llm.ts` 已使用 AI SDK 完成所有功能

### 阶段 2：创建配置模块

1. 创建 `src-tauri/src/commands/config.rs`
2. 将 `get_llm_config` 命令从 `llm.rs` 移至 `config.rs`
3. 在 `commands/mod.rs` 中注册新命令

### 阶段 3：移除 LLM 服务

1. 删除 `src-tauri/src/services/llm_service.rs`
2. 从 `src-tauri/src/services/mod.rs` 中移除 `llm_service` 模块导出
3. 删除 `src-tauri/src/commands/llm.rs`
4. 从 `commands/mod.rs` 中移除 `chat_completion` 和 `test_llm_connection` 注册

### 阶段 4：清理依赖

1. 检查 `Cargo.toml`，移除以下依赖（如无其他引用）：
   - `reqwest`
   - `futures`
   - `async-stream`
   - `bytes`
2. 运行 `cargo build` 验证编译通过

### 阶段 5：测试

1. 运行 `pnpm tauri dev` 验证应用启动
2. 测试前端 LLM 聊天功能（流式和非流式）
3. 测试配置读取功能

### 回滚策略

如出现问题，通过 Git 恢复至 refactor 前状态：
```bash
git checkout HEAD~1 -- src-tauri/src/services/llm_service.rs
git checkout HEAD~1 -- src-tauri/src/commands/llm.rs
git checkout HEAD~1 -- src-tauri/Cargo.toml
```

## Open Questions

1. **Q**: `reqwest` 是否被 sidecar 模块使用？
   - **A**: 需在实施阶段检查 `src-tauri/src/sidecar/` 目录下的代码

2. **Q**: 前端是否有单元或集成测试引用 Rust LLM 命令？
   - **A**: 需在准备阶段检查 `src/**/*.test.ts`、`src/**/*.spec.ts` 等测试文件

3. **Q**: 是否需要保留 `test_llm_connection` 命令作为配置验证工具？
   - **A**: 前端可通过实际调用 LLM API 验证，无需单独命令
