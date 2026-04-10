## Why

商品、订单、客户、品类等业务模块已基本完善，现需构建 AI Agent 基础设施，将现有的实验性聊天机器人升级为可支撑业务操作的生产级 Agent 系统。当前的 chatbot 页面代码散落在 `src/lib/`、`src/hooks/`、`src/types/` 多处，工具仅覆盖记账记录和账本操作，会话存储使用 SQLite 单表存储无法保留 LLM 对话的完整结构（tool_calls、tool_results 等），亟需重构为结构清晰、可扩展的 AI 基础设施层。

## What Changes

- **代码重构**：将 AI 相关代码（provider、agent、tools、prompts、storage）统一收拢到 `src/ai/` 目录，弃用现有实验性 chatbot 页面
- **工具体系扩展**：按业务分类重建工具集，分为基础资料工具（账本、客户、商品、品类查询）、订单工具（搜索、创建、结账、取消）、记账工具（搜索、创建、修改、冲账）、系统工具（日期时间）共 14 个细粒度工具
- **会话存储重构**：将会话存储改为 SQLite（元数据 + 节摘要）+ JSONL 文件（原始对话），引入 Section 对话模型，每节对话独立上下文，支持引用续接
- **Agent 架构**：采用代码路由函数 + 全能事务组长（单 Agent）架构，路由函数负责新建/续接对话节，事务组长 Agent 拥有全部工具按需调用
- **提示词管理**：系统提示词使用 Markdown 文件存储，支持分层组合（通用基础、安全护栏、领域知识、角色指令），运行时动态加载
- **文件系统**：引入 `tauri-plugin-fs` 插件，前端直接读写 `appdata/sessions/` 下的 JSONL 文件和提示词文件

## Capabilities

### New Capabilities

- `ai-directory-structure`: AI 模块目录结构规划，将分散的 AI 代码收拢到 `src/ai/` 统一管理
- `ai-tool-registry`: 工具注册与分类体系，支持按类别（基础资料/订单/记账/系统）组织和动态加载工具
- `ai-session-storage`: 会话存储层重构，SQLite 元数据 + JSONL 文件存储，引入 Section 对话模型和节摘要机制
- `ai-agent-core`: Agent 核心架构，包括 Provider 配置、Agent 工厂、路由函数、提示词加载与组合
- `ai-prompt-management`: 提示词管理系统，Markdown 文件分层存储、运行时动态加载、支持组合拼装

### Modified Capabilities

## Impact

- **前端目录结构**：新增 `src/ai/` 目录（含 provider、agent、router、tools/、prompts/、storage/ 子目录），弃用 `src/pages/chatbot/`、`src/lib/ai-provider.ts`、`src/lib/chat-tools.ts`、`src/lib/agent.ts`、`src/hooks/use-sessions.ts`、`src/hooks/use-messages.ts`
- **后端数据模型**：`chat_session` 表需调整字段（移除 model、system_prompt），`chat_message` 表和 `chat_message_seq` 表将被弃用，新增 `section_summary` 表
- **后端服务**：`ChatService` 需要重写，移除消息 CRUD，改为会话元数据和节摘要管理
- **后端命令**：Tauri IPC chat 命令需要调整，部分命令移除，新增节摘要相关命令
- **前端依赖**：新增 `@tauri-apps/plugin-fs`，移除 `src/api/commands/chat/` 中消息相关接口
- **Tauri 插件**：新增 `tauri-plugin-fs`，需配置 `$APPDATA` 读写权限
- **JSONL 文件**：在 `appdata/sessions/` 下按会话创建文件夹，存储对话节文件
- **提示词文件**：在应用资源目录下存储 Markdown 格式的系统提示词
