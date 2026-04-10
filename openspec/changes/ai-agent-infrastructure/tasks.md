## 1. 环境准备与依赖安装

- [x] 1.1 安装 `tauri-plugin-fs`：在 `src-tauri/Cargo.toml` 添加依赖，在 `src-tauri/src/lib.rs` 注册插件
- [x] 1.2 安装 `@tauri-apps/plugin-fs` 前端包
- [x] 1.3 在 `src-tauri/capabilities/default.json` 中配置 `$APPDATA` 和 `$RESOURCE` 的读写权限（scope 限制 `sessions/**`）

## 2. 目录结构与迁移

- [x] 2.1 创建 `src/ai/` 目录及子目录（`tools/`、`prompts/shared/`、`prompts/agents/`、`storage/`）
- [x] 2.2 创建 `src/ai/types.ts`，从 `src/types/agent.ts` 迁移 `ToolResult<T>` 类型
- [x] 2.3 将 `src/lib/ai-provider.ts` 迁移到 `src/ai/provider.ts`，移除旧的 model/systemPrompt 相关逻辑（这些移至 agent 配置）
- [x] 2.4 删除 `src/lib/agent.ts`（9行薄封装，功能合并到 `src/ai/agent.ts`）
- [x] 2.5 弃用 `src/pages/chatbot/` 目录：移除 chatbot 路由定义（`src/routes/chatbot.tsx`）和页面组件
- [x] 2.6 清理旧文件：删除 `src/lib/chat-tools.ts`、`src/lib/ai-provider.ts`、`src/types/agent.ts`、`src/types/chat.ts`，确保无残留引用
- [x] 2.7 删除 `src/hooks/use-sessions.ts` 和 `src/hooks/use-messages.ts`（功能由 `src/ai/storage/` 替代）

## 3. 提示词管理（src/ai/prompts/）

- [x] 3.1 创建 `src/ai/prompts/shared/base.md` — 通用基础指令（语言、角色定位、输出格式）
- [x] 3.2 创建 `src/ai/prompts/shared/guardrails.md` — 安全护栏（金额校验、操作确认要求）
- [x] 3.3 创建 `src/ai/prompts/shared/domain-knowledge.md` — 领域知识（订单状态机、记账规则、业务术语）
- [x] 3.4 创建 `src/ai/prompts/agents/team-leader.md` — 事务组长角色提示词（意图识别、工具使用指引）
- [x] 3.5 实现提示词加载函数：使用 `tauri-plugin-fs` 的 `readTextFile` 读取 Markdown 文件内容
- [x] 3.6 实现提示词组合函数：按规则拼接多个提示词文件为完整系统提示词字符串

## 4. 工具定义（src/ai/tools/）

- [x] 4.1 创建 `src/ai/tools/system.ts` — 定义 `get_current_datetime` 工具（前端本地获取，无入参）
- [x] 4.2 创建 `src/ai/tools/basic-data.ts` — 定义 5 个基础资料工具：search_books、search_customers、search_products、search_categories、get_product_detail
- [x] 4.3 创建 `src/ai/tools/order.ts` — 定义 4 个订单工具：search_orders、get_order_detail、create_order、settle_order
- [x] 4.4 创建 `src/ai/tools/accounting.ts` — 定义 4 个记账工具：search_records、create_record、update_record、create_write_off
- [x] 4.5 创建 `src/ai/tools/index.ts` — 实现 `getAllTools()` 返回全部 14 个工具的合集，实现 `getToolsByCategory(category)` 按类别加载子集

## 5. 后端重构

- [x] 5.1 调整 `chat_session` 实体：移除 `model` 和 `system_prompt` 字段
- [x] 5.2 创建 `section_summary` 实体：id, session_id, section_file, summary, created_at
- [x] 5.3 移除 `chat_message` 实体、`chat_message_seq` 实体及对应文件
- [x] 5.4 重写 `ChatService`：保留会话 CRUD，新增节摘要 CRUD（create_section_summary、get_summaries_by_session），移除所有消息相关方法
- [x] 5.5 调整 `src-tauri/src/commands/chat.rs`：移除消息相关命令（create_chat_message、get_chat_messages、update_chat_message_state、update_chat_message_content），新增节摘要相关命令（create_section_summary、get_section_summaries）
- [x] 5.6 更新 `src/api/commands/chat/` 前端类型和接口：移除消息相关 DTO 和函数，新增节摘要相关 DTO 和函数

## 6. 会话存储层（src/ai/storage/）

- [x] 6.1 创建 `src/ai/storage/types.ts` — 定义 Session、SectionSummary、SectionFile 等存储相关类型
- [x] 6.2 创建 `src/ai/storage/session-store.ts` — 封装会话元数据 CRUD（调用 IPC），包含 createSession、getAllSessions、deleteSession 等
- [x] 6.3 创建 `src/ai/storage/section-store.ts` — 封装 JSONL 文件读写操作（使用 tauri-plugin-fs）：
  - `createSection(sessionId)` — 创建新 JSONL 文件
  - `appendMessage(sessionId, sectionFile, message)` — 追加单条消息
  - `readMessages(sessionId, sectionFile)` — 读取节内全部消息（逐行解析，容错）
  - `deleteSessionDir(sessionId)` — 删除会话文件夹
- [x] 6.4 实现节摘要生成逻辑：优先从 tool 调用结果提取结构化摘要，无 tool 调用时使用 LLM 生成

## 7. Agent 核心（src/ai/agent.ts + src/ai/router.ts）

- [x] 7.1 创建 `src/ai/agent.ts` — Agent 工厂函数：加载提示词 + 加载工具 + 创建 ToolLoopAgent
- [x] 7.2 创建 `src/ai/router.ts` — 路由函数：
  - 接收用户输入和可选的引用节 ID
  - 无引用时创建新节（生成 JSONL 文件、注入历史节摘要到 system prompt）
  - 有引用时续接引用节（加载该节 JSONL 为 messages）
  - 返回节上下文（sectionFile、messages、systemPrompt）
- [x] 7.3 实现 JSONL 消息流式写入：在 Agent 对话过程中，将每条消息（user、assistant、tool_calls、tool results）实时追加写入当前节的 JSONL 文件
- [x] 7.4 实现节摘要注入：创建新节时查询同会话的历史节摘要，追加到 system prompt 末尾

## 8. 集成验证

- [x] 8.1 验证 `src/ai/` 模块可以独立导入使用，无循环依赖
- [ ] 8.2 验证所有 14 个工具可被 Agent 正确调用（通过 ToolLoopAgent 执行工具调用测试）
- [ ] 8.3 验证 Section 存储流程：创建会话 → 创建节 → 写入消息 → 读取消息 → 生成摘要
- [ ] 8.4 验证路由函数：无引用新建节、有引用续接节、历史摘要注入
- [ ] 8.5 验证提示词动态加载：修改 Markdown 文件后重新创建 Agent，提示词内容更新
