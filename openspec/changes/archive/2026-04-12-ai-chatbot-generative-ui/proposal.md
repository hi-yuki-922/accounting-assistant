## Why

AI 助手对话功能已基本可用，但用户体验仍有明显短板：

1. **Section 摘要不准确**：当前摘要从工具调用结果拼接生成（如"记录创建成功；查询到3笔支出"），无法反映对话主题，用户无法通过摘要了解这节对话的内容；展开时显示"对话节 #N"也缺乏语义信息
2. **历史摘要注入无实际价值**：历史 Section 摘要注入到 system prompt 中对 Agent 的决策帮助不大，反而浪费 token 并可能干扰当前对话
3. **工具调用结果仅展示纯文本**：Agent 操作了订单、记账记录后，用户只能看到"操作成功"等文字描述，无法直观查看具体数据，需要在对话中追问或切换到对应页面
4. **缺失信息只能通过对话追问**：用户创建订单/记录但信息不全时，Agent 只能通过多轮对话逐个追问，效率低下
5. **操作确认交互原始**：当前需要用户在输入框手动输入"确认操作"并引用对应 Section，缺乏可视化的确认界面

## What Changes

### Section 摘要与标题优化

- 流完成后，调用轻量 LLM（如 glm-4-flash），基于用户在 Section 的首次输入内容生成简短摘要和语义化标题
- 摘要替代当前的"工具结果拼接"策略，标题替代"对话节 #N"
- SectionSummary 类型新增 `title` 字段
- SectionCard 折叠态显示 title，展开态显示 title（而非 `对话节 #N`）

### 移除历史摘要注入

- 删除 `useSectionChat` 和 `router.ts` 中将历史 Section 摘要注入为 system message 的逻辑
- 删除 `RouteResult.summaryInjection` 字段

### Parts 消息模型（对齐 AI SDK）

- 重构 `DisplayMessage`，引入 `parts: DisplayMessagePart[]` 模型
- `DisplayMessagePart` 支持 `text`、`tool-call`、`tool-result` 三种类型
- 流消费循环产出 `parts` 数组而非纯文本 `content`
- 渲染层按 part 类型分发到对应组件

### 交互型工具：操作确认

- 新增 `confirm_operation` 专用工具，Agent 在确认模式 ON 时执行写操作前调用此工具
- 工具 execute 返回确认请求信息（pending 状态），本轮 ToolLoop 结束
- 前端渲染 ai-elements 的 Confirmation 组件，用户点击确认/取消后注入隐藏消息触发新一轮 ToolLoop
- PromptInput 新增确认模式切换 Badge（默认 ON），切换通过修改 system prompt 指令实现
- 写入工具标记：`create_order`、`settle_order`、`create_record`、`update_record`、`create_write_off`

### 交互型工具：缺失信息收集

- 新增 `collect_missing_fields` 专用工具，Agent 检测到必填字段缺失时调用
- 前端维护 `writeToolFieldMap` 映射表（写入工具 → 必填字段 → 表单元素定义），覆盖字段类型（text、number、select、array）和选项（select 的 options、array 的 itemSchema）
- `MissingFieldsForm` 组件根据映射表动态渲染缺失字段的表单
- 用户提交后注入隐藏消息，Agent 用完整参数调用对应写入工具
- 仅在必填字段缺失时触发表单，非必填字段用户未提供则留空

### 生成式 UI 组件

- `ToolResultRenderer`：toolName → 业务组件的分发器，在 `tool-result` part 渲染时根据 toolName 查找并渲染对应组件
- `OrderListCard`：搜索/创建订单后的列表展示卡片，行点击打开现有 `OrderDetailDialog`
- `RecordListCard`：搜索/创建记账记录后的列表展示卡片，行点击打开新建的 `RecordDetailDialog`
- `RecordDetailDialog`：新建记账记录详情弹窗，参考现有 `OrderDetailDialog` 模式
- `MissingFieldsForm`：通用缺失字段表单，从 `writeToolFieldMap` 获取字段定义
- 复用 ai-elements 的 `Confirmation` 组件用于操作确认场景

## Capabilities

### New Capabilities

- `generative-ui-parts-model`: Parts 消息模型定义与流消费适配，将扁平的 `DisplayMessage` 演进为 parts 数组结构
- `generative-ui-tool-renderer`: ToolResultRenderer 分发器 + toolName → 组件映射机制
- `generative-ui-order-list`: OrderListCard 订单列表生成式组件，复用 OrderDetailDialog
- `generative-ui-record-list`: RecordListCard 记账记录列表生成式组件 + RecordDetailDialog
- `generative-ui-confirmation`: confirm_operation 工具 + Confirmation 组件集成 + PromptInput 确认模式切换
- `generative-ui-missing-fields`: collect_missing_fields 工具 + writeToolFieldMap 映射表 + MissingFieldsForm 组件
- `section-llm-summary`: LLM 生成 Section 摘要与标题，替代工具结果拼接策略

### Modified Capabilities

- `ai-chat-architecture`: DisplayMessage 模型重构、流消费循环改造、渲染层适配 parts 模型
- `ai-chat-section`: SectionSummary 新增 title 字段、SectionCard 标题/摘要展示逻辑调整
- `ai-chat-prompt`: 移除历史摘要注入、新增确认模式指令注入逻辑
- `ai-chat-tools`: 新增 confirm_operation 和 collect_missing_fields 两个交互型工具

## Impact

- **前端 - AI 核心层**（`src/ai/`）：
  - `storage/summary.ts`：摘要生成改为 LLM 调用
  - `storage/types.ts`：SectionSummary 新增 title 字段
  - `router.ts`：删除 summaryInjection 相关逻辑
  - `agent.ts`：动态注入确认模式指令
  - `tools/`：新增 confirm_operation、collect_missing_fields 工具
  - `prompts/`：调整 agent 指令（确认模式、缺失信息收集）
- **前端 - Hooks**（`src/hooks/`）：
  - `use-section-chat.ts`：流消费改造（parts 模型）、移除摘要注入、LLM 摘要生成
  - `use-section-list.ts`：适配 title 字段
- **前端 - UI**（`src/pages/chatbot/`）：
  - `components/section-card.tsx`：parts 渲染替代纯文本、title 展示
  - `components/prompt-input.tsx`：新增确认模式切换 Badge
  - 新增 `components/tool-result-renderer.tsx`
  - 新增 `components/generative/order-list-card.tsx`
  - 新增 `components/generative/record-list-card.tsx`
  - 新增 `components/generative/missing-fields-form.tsx`
- **前端 - 业务组件**（`src/pages/`）：
  - 新增 `books/components/record-detail-dialog.tsx`
- **前端 - 类型**（`src/types/`）：
  - `chatbot.ts`：DisplayMessage 重构、新增 DisplayMessagePart 类型
- **后端**：无变更（工具 execute 在前端通过 Tauri IPC 调用后端 API）
- **数据库**：无变更
