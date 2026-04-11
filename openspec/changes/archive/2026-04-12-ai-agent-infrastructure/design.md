## Context

当前项目的 AI 相关代码散落在多处（`src/lib/ai-provider.ts`、`src/lib/chat-tools.ts`、`src/lib/agent.ts`、`src/hooks/use-sessions.ts`、`src/hooks/use-messages.ts`、`src/pages/chatbot/`），是一个实验性的聊天机器人验证页面。工具仅覆盖记账记录和账本操作（7 个工具），会话存储使用 SQLite 的 `chat_session` + `chat_message` 两张表，`chat_message.content` 为纯文本 String，无法保留 LLM 对话的完整结构（tool_calls、tool_results、多 part 消息等）。

后端已具备完整的业务模块：商品（product）、客户（customer）、品类（category）、订单（order）、记账（accounting）、账本（accounting-book）、附件（attachment），共计 62 个 IPC 命令可用。

前端 AI SDK 使用 Vercel AI SDK v6（`ai` 包），Provider 为 `zhipu-ai-provider`，Agent 类型为 `ToolLoopAgent`。

## Goals / Non-Goals

**Goals:**

- 将 AI 相关代码统一收拢到 `src/ai/` 目录，建立清晰的模块边界
- 重建工具体系，覆盖所有业务模块（基础资料、订单、记账、系统），共 14 个细粒度工具
- 重构会话存储为 Section 模型，使用 SQLite（元数据）+ JSONL 文件（原始对话），支持节间摘要共享
- 实现 Agent 核心架构：代码路由函数 + 全能事务组长单 Agent
- 建立提示词管理系统，支持 Markdown 文件分层组合和运行时动态加载
- 引入 `tauri-plugin-fs` 实现前端直接读写 JSONL 文件

**Non-Goals:**

- 不实现 UI 界面（后续独立提案）
- 不实现多 Agent 协同（当前业务复杂度不需要）
- 不实现确认卡片流程（后续独立提案）
- 不实现附件内容的 AI 处理
- 不实现工具调用的可视化渲染
- 不实现节间上下文的自动判断（初期由用户主动引用）

## Decisions

### 1. Section 对话模型（类 Jupyter Notebook）

**决策**：一次用户输入默认创建一节对话，一节对话对应一个 JSONL 文件，上下文独立。用户引用已有节时在引用节上续接。

**备选方案**：
- A: 传统线性对话（所有消息在同一上下文） — 难以管理长对话，token 消耗高
- B: 固定窗口滑动（保留最近 N 条消息） — 丢失重要上下文

**理由**：Section 模型天然适配"一张订单一节对话"的业务场景，上下文独立避免 token 膨胀，引用机制提供灵活性。

```
appdata/sessions/
├── session_{id}/
│   ├── section_001.jsonl    ← 第1节（独立上下文）
│   ├── section_002.jsonl    ← 第2节（独立上下文）
│   └── ...
```

### 2. SQLite + JSONL 混合存储

**决策**：SQLite 存储会话元数据和节摘要，JSONL 文件存储原始 LLM 对话（OpenAI Chat Completion 格式）。

**理由**：
- `chat_message.content: String` 无法表达 tool_calls、tool_results 等复杂结构
- JSONL 逐行追加天然适配流式对话写入
- SQLite 保留元数据查询能力（按标题搜索、按时间排序）
- `tauri-plugin-fs` 提供 `open({ append: true })` 和 `readTextFileLines()` 完美适配

**SQLite 变更**：

| 操作 | 表 | 说明 |
|------|---|------|
| 调整 | `chat_session` | 移除 `model`、`system_prompt` 字段，移至前端 agent 配置 |
| 新增 | `section_summary` | id, session_id, section_file, summary, created_at |
| 移除 | `chat_message` | 被 JSONL 文件替代 |
| 移除 | `chat_message_seq` | 无其他模块使用 |

### 3. 单 Agent 架构：代码路由 + 全能事务组长

**决策**：使用代码路由函数管理对话节创建/续接，单个事务组长 Agent 拥有全部 14 个工具。

**备选方案**：
- 多 Agent 层级（事务主管 → 事务组长 → 专员） — 当前业务复杂度不够，调度开销不值得

**理由**：LLM 的 `toolChoice: 'auto'` 本身已具备意图分类能力，选择 `create_order` 工具就是"录入意图"，选择 `search_orders` 就是"查询意图"。后续业务复杂度增长时再拆分。

### 4. 细粒度工具分类（策略 A）

**决策**：14 个细粒度工具，按业务域分为 4 类。

**理由**：
- 每个 tool schema 更精确，LLM 填参数更准确
- 工具总数 < 20，`toolChoice: 'auto'` 表现良好
- 便于后续按角色动态加载工具

| 类别 | 工具 | 对应 IPC |
|------|------|----------|
| 基础资料 | `search_books` | `get_all_books` |
| 基础资料 | `search_customers` | `search_customers` |
| 基础资料 | `search_products` | `search_products` |
| 基础资料 | `search_categories` | `get_all_categories` |
| 基础资料 | `get_product_detail` | `get_product_by_id` |
| 订单 | `search_orders` | `query_orders` |
| 订单 | `get_order_detail` | `get_order_by_id` |
| 订单 | `create_order` | `create_order` |
| 订单 | `settle_order` | `settle_order` |
| 记账 | `search_records` | `get_records_by_book_id_paginated` |
| 记账 | `create_record` | `create_accounting_record` |
| 记账 | `update_record` | `update_accounting_record` |
| 记账 | `create_write_off` | `create_write_off_record` |
| 系统 | `get_current_datetime` | 无（前端本地获取） |

### 5. 提示词分层组合

**决策**：提示词分三层存储，运行时动态组合。

```
prompts/
├── shared/
│   ├── base.md              ← 通用基础（所有角色共享）
│   ├── guardrails.md        ← 安全护栏（操作类角色共享）
│   └── domain-knowledge.md  ← 领域知识（业务角色共享）
└── agents/
    └── team-leader.md       ← 事务组长角色指令
```

**组合规则**：
- 事务组长 = `base.md` + `guardrails.md` + `domain-knowledge.md` + `team-leader.md`

**理由**：分层复用避免提示词重复，新增角色时只需编写角色特有部分。运行时加载便于调试和迭代。

### 6. 文件系统操作使用 tauri-plugin-fs

**决策**：引入 `tauri-plugin-fs`，前端直接操作 `appdata/sessions/` 下的 JSONL 文件和提示词 Markdown 文件。

**关键 API 映射**：

| 操作 | API |
|------|-----|
| 创建会话文件夹 | `mkdir('sessions/session_{id}', { baseDir: AppData, recursive: true })` |
| 追加消息到 JSONL | `open('sessions/.../section_{n}.jsonl', { append: true, baseDir: AppData })` |
| 读取节内对话 | `readTextFileLines('sessions/.../section_{n}.jsonl', { baseDir: AppData })` |
| 检查文件存在 | `exists('sessions/...', { baseDir: AppData })` |
| 删除会话 | `remove('sessions/session_{id}', { recursive: true, baseDir: AppData })` |
| 读取提示词 | `readTextFile('prompts/shared/base.md', { baseDir: Resource })` |

## Risks / Trade-offs

**[单 Agent 扩展性]** → 当前单 Agent 设计在工具数超过 20 时可能导致 LLM 选择准确度下降。缓解：后续可按角色拆分工具集或引入多 Agent。

**[JSONL 文件管理]** → 前端直接操作文件系统，异常情况下（如应用崩溃）可能产生不完整的 JSONL 行。缓解：读取时逐行解析容错，跳过无效行。

**[提示词文件分发]** → 运行时读取意味着提示词文件需随应用分发，且用户可能修改。缓解：提示词文件打包在 `$RESOURCE` 目录中只读，若需用户自定义则在 `$APPDATA` 中覆盖。

**[tauri-plugin-fs 权限]** → 需要配置 `$APPDATA` 和 `$RESOURCE` 的读写权限范围。缓解：通过 scope 限制仅允许 `sessions/` 和 `prompts/` 子目录。

**[节间摘要质量]** → 自动生成的摘要可能遗漏重要信息。缓解：优先从 tool 调用结果提取结构化摘要（确定性高），无 tool 调用时用小模型生成。

**[弃用 chat_message 表的数据迁移]** → 现有 SQLite 中的聊天消息数据将丢失。缓解：此为实验性数据，不需要迁移方案。如有必要可提供一次性导出脚本。
