# AI 集成

本项目集成了智谱 AI（Zhipu AI），构建了完整的 AI Agent 基建，用于财务助手对话功能。

## 架构概览

```
用户输入
    ↓
chatbot-page.tsx                 # 聊天界面
    ↓
use-messages / use-sessions      # 状态管理 Hooks
    ↓
router.ts                        # 会话路由（新建/继续 section）
    ↓
agent.ts                         # Agent 工厂（组装 prompt + model + tools）
    ↓ Vercel AI SDK (ToolLoopAgent)
tools/                           # 15 个业务工具（5 类）
    ↓ tryCMD / Tauri IPC
Rust 后端命令                    # 执行实际业务操作
    ↓
writer.ts → storage/             # JSONL 持久化 + SQLite 元数据
```

### 模块总览

```
src/ai/
├── agent.ts                     # Agent 工厂
├── provider.ts                  # AI 模型提供商配置
├── router.ts                    # 会话 section 路由
├── types.ts                     # 共享类型定义
├── writer.ts                    # JSONL 流式写入器
├── prompts/
│   ├── loader.ts                # Prompt 文件加载器
│   ├── fragments.ts             # 动态指令片段生成
│   ├── shared/
│   │   ├── base.md              # 基础行为指令
│   │   ├── guardrails.md        # 安全护栏
│   │   └── domain-knowledge.md  # 业务领域知识
│   └── agents/
│       └── team-leader.md       # Team Leader 角色指令
├── tools/
│   ├── index.ts                 # 工具注册中心
│   ├── system.ts                # 系统工具
│   ├── basic-data.ts            # 基础数据查询工具
│   ├── order.ts                 # 订单管理工具
│   ├── accounting.ts            # 记账工具
│   ├── interaction.ts           # 交互控制工具
│   └── field-map.ts             # 写入工具字段定义（供 UI 表单渲染）
└── storage/
    ├── types.ts                 # 存储类型定义
    ├── session-store.ts         # 会话元数据 CRUD
    ├── section-store.ts         # JSONL section 读写
    └── summary.ts               # LLM 摘要生成
```

---

## Provider 配置

`provider.ts` — 智谱 AI 连接管理：

| 导出                                             | 说明                                                |
| ------------------------------------------------ | --------------------------------------------------- |
| `createZAiProvider()`                            | 创建 Zhipu Provider 实例（连接 `open.bigmodel.cn`） |
| `SUPPORTED_MODELS`                               | `{ FAST: 'glm-4-flash', ADVANCED: 'glm-4.7' }`      |
| `getApiKey()` / `saveApiKey()` / `clearApiKey()` | API Key 管理（localStorage）                        |
| `getModelName()` / `saveModelName()`             | 模型选择管理（localStorage）                        |

- 默认使用 `glm-4.7`（ADVANCED），摘要生成使用 `glm-4-flash`（FAST）
- Provider 创建结果以 `Result` 类型包装，错误时返回 `Result.Err`

---

## Agent 工厂

`agent.ts` — 组装完整的 Agent 实例：

```typescript
type CreateAgentOptions = {
  modelName?: string // 覆盖持久化的模型选择
  extraInstructions?: string[] // 追加到 prompt 末尾的额外指令
}
```

**创建流程：**

1. 调用 `createZAiProvider()` 获取 Provider
2. 解析模型名（优先 `options.modelName`，否则读取 localStorage）
3. 加载系统 prompt（4 个 Markdown 文件 + 动态指令片段）
4. 追加 `extraInstructions`
5. 加载全部 15 个工具
6. 返回 `ToolLoopAgent({ instructions, model, toolChoice: 'auto', tools })`

---

## 会话路由

`router.ts` — 管理对话 section（一个 section = 一个 JSONL 文件）：

```typescript
type RouteResult = {
  sectionFile: string // 如 "section_003.jsonl"
  messages: JSONLMessage[] // 继续时返回已有消息，新建时为空
}
```

- **继续对话**：传入 `referenceSectionFile`，读取已有消息
- **新建对话**：不传引用文件，创建新的顺序编号 JSONL 文件

---

## 流式写入器

`writer.ts` — 绑定到特定 session + section 的写入器：

| 方法                                   | 写入内容                                        |
| -------------------------------------- | ----------------------------------------------- |
| `writeUserMessage(content, hidden?)`   | 用户消息（`hidden` 标记不显示给用户的注入指令） |
| `writeAssistantMessage(message)`       | 助手消息（含可选 `tool_calls`）                 |
| `writeToolResult(toolCallId, content)` | 工具调用结果                                    |

所有方法委托给 `section-store` 的 `appendMessage()`。

---

## 存储层

### 存储架构

采用 **SQLite + JSONL** 双层存储：

- **SQLite**（Tauri IPC）：会话元数据、section 摘要 — 支持查询和排序
- **JSONL 文件**（tauri-plugin-fs）：原始对话消息 — 支持流式追加

### 存储类型

```typescript
// 会话元数据
type Session = { id; title; createdAt; updatedAt }

// Section 摘要
type SectionSummary = { id; sessionId; sectionFile; title; summary; createdAt }

// 消息类型（联合类型，遵循 OpenAI Chat Completion 格式）
type JSONLMessage =
  | { role: 'user'; content; hidden? } // hidden: 不显示给用户的注入指令
  | { role: 'assistant'; content?; tool_calls? }
  | { role: 'tool'; tool_call_id; content }
  | { role: 'system'; content }
```

### Session Store

`session-store.ts` — 会话生命周期管理：

| 函数                                                     | 说明                                   |
| -------------------------------------------------------- | -------------------------------------- |
| `createSession(title?)`                                  | 创建 SQLite 会话 + AppData 目录        |
| `getAllSessions()`                                       | 按创建时间降序获取所有会话             |
| `getSessionById(id)`                                     | 获取单个会话                           |
| `updateSessionTitle(id, title)`                          | 更新会话标题                           |
| `deleteSession(id)`                                      | 删除目录 + SQLite 数据（级联删除摘要） |
| `createSectionSummary(...)` / `getSectionSummaries(...)` | Section 摘要管理                       |

### Section Store

`section-store.ts` — JSONL 文件读写：

文件存储在 `AppData/sessions/session_{id}/section_XXX.jsonl`。

| 函数                                         | 说明                            |
| -------------------------------------------- | ------------------------------- |
| `createSection(sessionId)`                   | 创建下一个顺序编号的 JSONL 文件 |
| `appendMessage(sessionId, sectionFile, msg)` | 追加消息行                      |
| `readMessages(sessionId, sectionFile)`       | 读取并解析所有消息              |

### 摘要生成

`summary.ts` — 使用快速模型生成摘要：

| 函数                                   | 说明                                              |
| -------------------------------------- | ------------------------------------------------- |
| `generateLLMSummary(userFirstMessage)` | 用 `glm-4-flash` 生成标题（≤10字）和摘要（≤30字） |
| `generateSectionSummary(messages)`     | 备用：提取用户消息前 100 字符                     |
| `extractFirstUserMessage(messages)`    | 提取第一条用户消息                                |

---

## 工具系统

### 工具注册

`tools/index.ts` — 集中注册，支持按类别获取：

```typescript
type ToolCategory =
  | 'basic-data'
  | 'order'
  | 'accounting'
  | 'system'
  | 'interaction'
```

### 15 个工具一览

| 分类        | 工具名                   | 类型 | 说明                      |
| ----------- | ------------------------ | ---- | ------------------------- |
| system      | `get_current_datetime`   | 只读 | 获取当前日期时间          |
| basic-data  | `search_books`           | 只读 | 查询所有账本              |
| basic-data  | `search_customers`       | 只读 | 模糊搜索客户（姓名/电话） |
| basic-data  | `search_products`        | 只读 | 模糊搜索商品（名称/分类） |
| basic-data  | `search_categories`      | 只读 | 查询所有商品分类          |
| basic-data  | `get_product_detail`     | 只读 | 获取商品详情含参考价      |
| order       | `search_orders`          | 只读 | 订单筛选搜索（分页）      |
| order       | `get_order_detail`       | 只读 | 获取订单含明细项          |
| order       | `create_order`           | 写入 | 创建销售/采购订单         |
| order       | `settle_order`           | 写入 | 结算待处理订单            |
| accounting  | `search_records`         | 只读 | 记账记录搜索（分页）      |
| accounting  | `create_record`          | 写入 | 创建记账记录              |
| accounting  | `update_record`          | 写入 | 修改已有记录              |
| accounting  | `create_write_off`       | 写入 | 创建冲销记录              |
| interaction | `confirm_operation`      | 控制 | 暂停等待用户确认          |
| interaction | `collect_missing_fields` | 控制 | 暂停等待用户补充字段      |

### 工具返回类型

所有工具的 `execute` 函数统一返回：

```typescript
type ToolResult<T = unknown> = {
  success: boolean
  message: string // 中文人类可读描述
  data?: T // 成功时填充
  error?: string // 失败时填充
}
```

### 交互控制工具（Pending 模式）

`interaction.ts` 中的两个工具不执行业务操作，而是返回 `{ pending: true }` 暂停 Agent 循环：

- **`confirm_operation`**：写入操作前暂停，等待用户确认。参数：`toolName, params, description`
- **`collect_missing_fields`**：缺少必填参数时暂停，UI 渲染表单。参数：`toolName, missingFields, providedParams`

用户响应后，结果作为 `hidden` 系统消息注入，触发新的 Agent 回合。

### 字段映射

`field-map.ts` — 定义写入工具的 UI 表单元数据：

```typescript
type FieldDef = {
  label: string // 中文标签
  type: 'text' | 'number' | 'select' | 'datetime'
  options?: { label: string; value: string }[] // select 类型的选项
}
```

用于前端渲染 `MissingFieldsForm` 组件。

---

## Prompt 系统

### 加载器

`loader.ts` — 从 Tauri 资源目录加载 Markdown prompt 文件：

加载顺序：`base.md` → `guardrails.md` → `domain-knowledge.md` → `team-leader.md`

### Prompt 文件内容

| 文件                  | 内容                                                                                        |
| --------------------- | ------------------------------------------------------------------------------------------- |
| `base.md`             | 基础行为：简体中文对话、金额 ¥ 符号 + 2 位小数、日期 YYYY-MM-DD 格式                        |
| `guardrails.md`       | 安全护栏：金额必须为正数、写入需确认、禁止编造数据、精确金额非估算                          |
| `domain-knowledge.md` | 业务领域知识：订单状态机、订单类型、记账类型/渠道、业务术语                                 |
| `team-leader.md`      | Team Leader 角色：意图分类（查询/录入/修改/分析）、工具使用指引、信息收集策略、隐藏消息处理 |

### 动态指令片段

`fragments.ts` — 在 Agent 创建时动态追加的指令：

| 函数                                | 说明                                                      |
| ----------------------------------- | --------------------------------------------------------- |
| `getConfirmationInstruction('on')`  | 要求 Agent 在写入前必须调用 `confirm_operation`           |
| `getConfirmationInstruction('off')` | 允许 Agent 直接执行写入                                   |
| `getMissingFieldsInstruction()`     | 要求 Agent 使用 `collect_missing_fields` 而非自然语言追问 |

---

## 对话流程

```
1. 用户发送消息
2. route() 决定继续现有 section 或创建新 section
3. createAgent() 组装 prompt + model + tools → ToolLoopAgent
4. Agent 处理过程中，writer.ts 流式写入每条消息到 JSONL
5. 只读工具（search_*、get_*）直接执行，返回结果
6. 写入工具经过两层交互门控：
   ├─ 确认模式：confirm_operation → pending → UI 确认 → hidden message → 执行
   └─ 缺字段：collect_missing_fields → pending → UI 表单 → hidden message → 执行
7. section 结束时，generateLLMSummary() 用快速模型生成标题和摘要
```

## 设计要点

- **Result 类型贯穿**：API 层（`result.isOk()`）和 Provider 层（`provider.isErr()`）统一使用 Result 模式
- **Pending 暂停控制**：通过 `{ pending: true }` 暂停 Agent 循环，委托 UI 交互后通过 hidden 系统消息恢复
- **双层存储**：SQLite 存储可查询的元数据 + JSONL 存储原始对话，分别使用 IPC 和文件系统 API
- **可组合 Prompt**：静态 Markdown 文件 + 动态指令片段 + 创建时额外指令，三层组合
- **字段映射驱动 UI**：`field-map.ts` 定义表单元数据，前端据此动态渲染表单组件
