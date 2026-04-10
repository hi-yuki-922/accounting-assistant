## Context

AI Agent 基础设施已通过 `ai-agent-infrastructure` 变更完成构建，`src/ai/` 目录下包含完整的 Agent 工厂（`createAgent`）、路由函数（`route`）、JSONL 写入器（`createSectionWriter`）、会话/节存储（`session-store`、`section-store`）和 14 个业务工具。路由树已注册 `/chatbot` 路由，侧边栏和底栏已添加"AI 助手"导航入口，但页面组件 `src/routes/chatbot.tsx` 尚未创建。

AI SDK 使用 `ai@^6.0.101`（Vercel AI SDK v6），提供 `ToolLoopAgent` 类，其 `stream()` 方法返回 `StreamTextResult`，包含 `fullStream`（全部事件流）和 `textStream`（纯文本增量流），支持 `abortSignal` 中断。

前端技术栈为 React 19 + TypeScript + Tailwind CSS v4 + shadcn/ui + TanStack Router。项目已安装 ai-elements 组件库（48 个组件），但适配度有限，仅挑选合适的复用，不合适的基于 shadcn/ui 自行封装。

## Goals / Non-Goals

**Goals:**

- 构建 Chatbot 页面，实现 Section 对话模型的完整 UI 呈现
- 实现细粒度 Hook 层（`useSessionList`、`useSectionList`、`useSectionChat`），职责清晰、粒度适中
- 每个 expanded Section 内部实例化独立 Agent，支持多节并发流式
- 底部 PromptInput 支持新建节和引用已有节续接两种模式
- 流式响应期间实时渲染 Markdown 文本，结束后一次性写入 JSONL

**Non-Goals:**

- 不实现左侧任务看板（后续独立提案）
- 不实现工具调用的可视化渲染（后续 AI 生成式 UI 提案）
- 不实现错误态的结构化可视化（后续提案，当前仅文本展示）
- 不实现会话列表的默认展示（仅用户手动打开）
- 不实现附件、语音输入等高级输入功能
- 不复用 AI SDK 的 `useChat` hook

## Decisions

### 1. 自定义 Hook 而非 useChat

**决策**：自行实现 `useSectionChat` hook 包装 `ToolLoopAgent`，不复用 AI SDK 提供的 `useChat`。

**理由**：
- `useChat` 假设单一对话视图，与多 Section 共存模型冲突
- PromptInput 在页面底部不属于任何 Section，消息需要路由到目标 Section
- Agent 在客户端直接调用智谱 API，不需要 `useChat` 的 HTTP endpoint 抽象
- 自定义 hook 可以精确控制 `fullStream` 事件的消费和 JSONL 写入时机

### 2. Agent 生命周期跟随 Section

**决策**：每个 expanded Section 内部创建独立的 Agent 实例。

**备选方案**：
- 全局共享单个 Agent — 无法支持多节并发请求

**理由**：用户可能在一个 Section 流式响应未完成时，向另一个 Section 发送消息。独立实例保证互不干扰。

**实现**：`useSectionChat` hook 内部调用 `createAgent()`，hook 卸载时 Agent 被 GC 回收。

### 3. SectionComponent + useImperativeHandle 模式

**决策**：expanded Section 组件内部实例化 `useSectionChat`，通过 `useImperativeHandle` 暴露 `send()` 和 `stop()` 给父组件。

**理由**：
- 符合 React hooks 规则（per-component instance）
- collapsed Section 不渲染、不消耗 hook 资源
- 父组件通过 ref 调用 active section 的 `send()`，避免状态提升的复杂度

### 4. 流结束后一次性写入 JSONL

**决策**：在 Agent 流式循环完成后，将完整的 user/assistant/tool 消息一次性写入 JSONL。

**备选方案**：
- 流中逐事件写入 — 更安全但 JSONL 中会有碎片化内容，需要额外的消息组装逻辑

**理由**：Agent 循环通常几秒到十几秒，崩溃概率低。`SectionWriter` 的 `writeUserMessage`、`writeAssistantMessage`、`writeToolResult` 天然适配攒完再写的模式。

### 5. 默认展开最近 3 节

**决策**：进入会话时，最近 3 节默认展开，更早的节折叠只显示摘要。

**理由**：
- 3 节提供足够的上下文连续感
- 避免过多展开节导致页面过长和内存占用过高
- 常量可配置，后续根据用户反馈调整

### 6. 首次进入自动加载今日最后会话

**决策**：进入 `/chatbot` 页面时，查询今日最后创建的会话并加载。如果没有则自动新建空会话。

**理由**：减少用户操作步骤，直接进入可用状态。会话列表仅在用户主动打开时显示。

### 7. 基于 shadcn/ui 封装组件

**决策**：UI 组件主要基于 shadcn/ui 封装，不强制对齐 ai-elements 的数据模型。

**理由**：ai-elements 组件与 AI SDK 的 `UIMessage`、`ToolUIPart` 深度绑定，与项目的 `JSONLMessage` 类型结构不匹配。适配成本高于自行封装。仅挑选通用性强的组件（如滚动容器、Markdown 渲染）复用。

## Risks / Trade-offs

**[Agent 并发资源消耗]** → 多个 expanded Section 各自持有 Agent 实例，Agent 本身轻量（仅配置信息），但并发流式时会同时发起多个 LLM API 请求。缓解：实际上同一时刻用户通常只关注一个 Section，并发场景少见。

**[useImperativeHandle 时序问题]** → 新建 Section 后 `setActive` 触发渲染，SectionCard 实例化 `useSectionChat` 并通过 ref 暴露 `send()`，父组件需要等待 ref 就绪后才能调用。缓解：使用 `flushSync` 或在 `useSectionChat` 内部支持 pending message 机制（初始化时自动发送待处理消息）。

**[流式 Markdown 渲染性能]** → 助手消息实时渲染 Markdown，频繁更新可能导致性能问题。缓解：使用 React 19 的并发特性（`useTransition`）或将流式文本累积后低频更新。
