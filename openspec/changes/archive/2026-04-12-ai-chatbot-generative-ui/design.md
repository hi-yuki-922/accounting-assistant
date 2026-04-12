## Context

AI 助手对话功能基于 Tauri 2.0 + React 19 + AI SDK v6（ToolLoopAgent）构建，使用智谱 GLM 模型。当前架构已实现基础的 Section 化对话、流式响应和 14 个业务工具调用。核心挑战在于：

- **消息模型扁平**：`DisplayMessage` 仅包含 `role + content`，tool result 在展示层被完全丢弃，无法渲染富内容
- **Section 摘要由工具结果拼接**：如"记录创建成功；查询到 3 笔支出"，不能反映对话主题
- **交互原始**：确认操作需要用户在输入框手打"确认操作"并引用 Section；缺失信息通过多轮对话追问
- **无生成式 UI**：工具调用结果只展示纯文本，用户无法直观查看数据

现有技术约束：
- 使用 `ToolLoopAgent`（非 `useChat`），手动消费 `fullStream` 事件
- 消息持久化为 JSONL（OpenAI Chat Completion 格式），展示用 `DisplayMessage` 是有损映射
- 智谱模型支持 tool use 和结构化输出
- 前端已有 `OrderDetailDialog` 可复用，无 `RecordDetailDialog`

## Goals / Non-Goals

**Goals:**

- 重构 `DisplayMessage` 为 Parts 模型，对齐 AI SDK 的 `ToolUIPart` 设计理念
- LLM 生成 Section 摘要与标题，替代工具结果拼接策略
- 移除历史 Section 摘要注入 system prompt 的逻辑
- 实现操作确认交互（`confirm_operation` 工具 + Confirmation 组件 + PromptInput 切换 Badge）
- 实现缺失信息收集（`collect_missing_fields` 工具 + `writeToolFieldMap` 映射表 + MissingFieldsForm 组件）
- 实现操作结果生成式展示（ToolResultRenderer 分发器 + OrderListCard + RecordListCard + RecordDetailDialog）

**Non-Goals:**

- 不实现统计图表类生成式 UI（等数据统计功能完善后再做）
- 不切换到 `useChat`（保持当前 `ToolLoopAgent` + 手动流消费架构）
- 不实现多 Agent 架构（保持 Team Leader 单 Agent）
- 不实现消息编辑/分支/重新生成
- 不修改后端（所有工具 execute 通过 Tauri IPC 调用现有后端 API）

## Decisions

### 1. Parts 消息模型设计

`DisplayMessage` 从扁平 `content: string` 演进为 `parts: DisplayMessagePart[]`，对齐 AI SDK 的 UIMessage parts 理念：

```ts
type DisplayMessage = {
  id: string
  role: 'user' | 'assistant'
  parts: DisplayMessagePart[]
}

type DisplayMessagePart =
  | { type: 'text'; content: string }
  | { type: 'tool-call'; toolCallId: string; toolName: string; args: string; state: ToolCallState }
  | { type: 'tool-result'; toolCallId: string; toolName: string; result: unknown }
```

- user 消息：`parts: [{ type: 'text', content: '...' }]`
- assistant 消息：parts 可包含 text + tool-call + tool-result 的任意组合，按流式接收顺序排列
- 每条消息生成稳定 ID（基于 `sectionFile + arrayIndex`），替代当前的 array index key
- `ToolCallState` 为 `'calling' | 'completed' | 'error'`，支持工具执行中的 loading 展示

**替代方案**：保持扁平模型，在渲染层叠加映射 → 扩展性差，后续每个新交互场景都要 hack 渲染逻辑。

### 2. 流消费循环适配 Parts

`useSectionChat.performSend()` 的 `fullStream` 消费循环改造：

- 维护一个 `partsAcc: DisplayMessagePart[]`（而非单独的 `assistantContent` + `toolCallsAcc` + `toolResults`）
- `text-delta` 事件：追加到最后一个 text part 或创建新 text part
- `tool-call` 事件：新增 `{ type: 'tool-call', state: 'calling' }` part
- `tool-result` 事件：新增 `{ type: 'tool-result' }` part，同时将对应 tool-call part 的 state 更新为 `'completed'`
- 流完成时：将 `partsAcc` 合入 assistant `DisplayMessage`

每个 `tool-result` part 携带原始 JSON result 数据（`unknown` 类型），供 ToolResultRenderer 消费。

### 3. 渲染层 Parts 分发

`SectionChatContent` 渲染循环改为按 part 分发：

```
parts.map(part => {
  switch (part.type) {
    'text':        → <MessageResponse>{content}</MessageResponse>
    'tool-call':   → <ToolCallIndicator name={toolName} state={state} />
    'tool-result': → <ToolResultRenderer toolName={toolName} result={result} />
  }
})
```

`ToolResultRenderer` 内部维护 toolName → Component 的映射表：

```ts
const toolRenderMap: Record<string, React.ComponentType<{ result: unknown }>> = {
  search_orders: OrderListCard,
  get_order_detail: OrderDetailCard,
  create_order: OrderListCard,
  settle_order: OperationResultCard,
  search_records: RecordListCard,
  create_record: RecordListCard,
  update_record: RecordListCard,
  create_write_off: OperationResultCard,
  // 查询类工具也有映射
  search_books: OperationResultCard,
  search_customers: OperationResultCard,
  search_products: OperationResultCard,
  search_categories: OperationResultCard,
  get_product_detail: OperationResultCard,
}
```

未在映射表中的工具 fallback 到纯文本展示。

### 4. 确认机制：confirm_operation 作为本轮终点

新增 `confirm_operation` 工具。确认模式 ON 时，Agent 在执行写操作前调用此工具而非直接调用写入工具：

```
Agent 调用 confirm_operation({
  toolName: 'settle_order',
  params: { orderId: 3, channel: 'AliPay' },
  description: '对订单 #003 执行结账操作，金额 ¥500，支付渠道：支付宝'
})
→ execute 返回 { pending: true, toolName, params, description }
→ 渲染 Confirmation 组件
→ 本轮 ToolLoop 结束
```

用户点击确认后，注入隐藏消息：

```
system: "用户已确认执行操作。请使用以下参数调用 ${toolName}：${JSON.stringify(params)}"
```

触发新一轮 ToolLoop，Agent 用完整参数调用实际写入工具。

**确认模式切换**：PromptInput 新增 Badge，状态通过 `localStorage` 持久化。切换时修改注入的 system prompt 指令：
- ON：`"执行写操作前必须调用 confirm_operation 工具请求用户确认"`
- OFF：`"直接执行写操作，无需确认"`

**写入工具列表**：`create_order`、`settle_order`、`create_record`、`update_record`、`create_write_off`

**替代方案**：使用 AI SDK 原生 `requireApproval` + 暂停/恢复 ToolLoop → 当前架构不支持暂停，需大幅改造。以本轮对话结束的方式实现更简单。

### 5. 缺失信息收集：collect_missing_fields + 前端映射表

新增 `collect_missing_fields` 工具。Agent 检测到必填字段缺失时调用：

```
Agent 调用 collect_missing_fields({
  toolName: 'create_order',
  missingFields: ['orderType', 'items'],
  providedParams: { customerId: 5, remark: 'xxx' }
})
→ execute 返回 { pending: true, toolName, missingFields, providedParams }
→ 渲染 MissingFieldsForm
→ 本轮 ToolLoop 结束
```

前端维护 `writeToolFieldMap`，仅包含写入工具的**必填字段**定义：

```ts
const writeToolFieldMap: Record<string, Record<string, FieldDef>> = {
  create_order: {
    orderType: { label: '订单类型', type: 'select', options: [...] },
    items: { label: '商品明细', type: 'array', itemFields: { ... } },
  },
  settle_order: {
    orderId: { label: '订单 ID', type: 'number' },
    channel: { label: '支付渠道', type: 'select', options: [...] },
  },
  create_record: {
    title: { label: '摘要', type: 'text' },
    amount: { label: '金额', type: 'number' },
    accountingType: { label: '记账类型', type: 'select', options: [...] },
    channel: { label: '支付渠道', type: 'select', options: [...] },
    recordTime: { label: '记账时间', type: 'datetime' },
  },
  update_record: {
    id: { label: '记录 ID', type: 'number' },
  },
  create_write_off: {
    originalRecordId: { label: '原始记录 ID', type: 'number' },
    amount: { label: '冲账金额', type: 'number' },
  },
}
```

`FieldDef` 支持的类型：`text`、`number`、`select`、`datetime`、`array`（嵌套 itemFields）。

用户提交后注入隐藏消息：
```
system: "用户已补充信息：${JSON.stringify(formData)}。
 请结合之前提供的 ${JSON.stringify(providedParams)}，
 调用 ${toolName} 完成操作。"
```

**替代方案**：Agent 动态传递字段定义 → Agent 无法精确描述前端组件需求（如 select 的 options），且增加 Agent 负担。前端维护映射表更可靠。

### 6. Section 摘要 LLM 生成

流完成后，调用轻量模型（`glm-4-flash`）生成摘要和标题：

```ts
const generateLLMSummary = async (userFirstMessage: string) => {
  const prompt = `请根据用户的输入，生成一段简短的对话摘要（不超过30字）和一个简短的标题（不超过10字）。
用户输入：${userFirstMessage}
请以 JSON 格式返回：{ "title": "...", "summary": "..." }`

  // 调用 glm-4-flash，解析 JSON 返回
}
```

- 仅使用用户在 Section 的**首条消息**作为输入
- `SectionSummary` 类型新增 `title: string` 字段
- `SectionCard` 折叠态和展开态都使用 `title`（替代"对话节 #N"）
- 如果 LLM 调用失败，fallback 到截取首条消息前 20 字符作为 title
- 使用独立于 Agent 的 provider 实例（`glm-4-flash`），不占用主对话模型

### 7. 移除历史摘要注入

删除两处摘要注入逻辑：
- `use-section-chat.ts:131-144`：`getSectionSummaries()` + `summaryInjection` 构建和注入
- `router.ts:48-55`：`route()` 函数中的摘要获取和注入

`RouteResult` 类型移除 `summaryInjection` 字段。Agent 的上下文中不再包含历史 Section 信息。

### 8. PromptInput 确认模式 Badge

在 `PromptInput` 底部工具栏区域新增 Badge 组件：

- 显示状态：🛡️ 已开启（默认）/ 🛡️ 已关闭
- 点击切换，状态存 `localStorage`（key: `confirmation-mode`）
- 组件内部读取状态，通过新的 prop `confirmationMode` 传递给 `ChatbotPage`
- `ChatbotPage.handleSubmit()` 将 `confirmationMode` 传递给 `useSectionChat`
- `useSectionChat.performSend()` 根据模式动态注入 system prompt 指令片段

### 9. RecordDetailDialog 设计

新建 `RecordDetailDialog`，参考现有 `OrderDetailDialog` 模式：

- Props：`{ open: boolean; recordId: number; onClose: () => void }`
- 通过 `accounting.getById(recordId)` 获取完整记录
- 展示字段：标题、金额（带颜色）、记账类型、支付渠道、记录时间、状态、备注
- 如有关联冲账记录，展示冲账信息
- 底部操作按钮：编辑（复用 `AccountingRecordDialog`）、删除（复用 `DeleteRecordConfirmDialog`）
- 不展示订单关联（记账记录的 order_id 对用户透明）

### 10. JSONL 持久化兼容

Parts 模型仅影响前端展示层。JSONL 持久化格式不变（仍然是 OpenAI Chat Completion 格式）：

- `toDisplayMessages()` 改为 `toDisplayMessagesParts()`，输出 Parts 模型的 `DisplayMessage`
- `buildSnapshot()` 保持不变，仍然产出 `JSONLMessage[]`
- `toModelMessages()` 保持不变
- 新增 `toPartsFromSnapshot()` 函数，将 `JSONLMessage[]` + 流式累加数据转换为 `DisplayMessagePart[]`

## Risks / Trade-offs

- **[确认操作需要两次 LLM 调用]** → 确认模式下写操作需两轮 ToolLoop（第一轮确认，第二轮执行）。使用 `glm-4-flash` 轻量模型减少延迟。桌面应用场景下用户可接受短暂等待。
- **[LLM 摘要额外调用]** → 每个 Section 完成后多一次 `glm-4-flash` 调用。成本极低（flash 模型），且异步执行不阻塞用户操作。
- **[前端映射表维护负担]** → `writeToolFieldMap` 需要与后端工具 schema 保持同步。写入工具变更不频繁，维护成本可接受。后续可考虑从 Zod schema 自动生成。
- **[confirm_operation 依赖 Prompt 工程]** → Agent 需要可靠地在确认模式下调用 `confirm_operation` 而非直接调用写入工具。依赖 system prompt 的指令清晰度。需在 prompt 中明确列举写入工具清单和调用要求。
- **[隐藏消息的格式]** → 用户确认/提交表单后注入的 system message 需要精确传递参数。格式设计为 JSON 字符串，减少 Agent 解析出错的可能性。
