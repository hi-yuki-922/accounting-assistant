## Context

当前 Agent 工具调用后，前端的 PartRenderer 会为每个 `tool-call` 渲染 ToolCallIndicator（显示工具名和状态），为每个 `tool-result` 通过 ToolResultDispatcher 渲染对应的业务组件卡片。这导致对话中出现大量工具调用噪音。用户希望只看到最终结果（订单卡片、记账卡片等），而非工具调用过程。

Vercel AI SDK 的 ToolLoopAgent 流式输出包含 `tool-call` 和 `tool-result` 事件，每个事件携带 `toolCallId`。`tool-call` 事件记录工具名和状态，`tool-result` 事件记录工具返回数据。

## Goals / Non-Goals

**Goals:**
- 隐藏所有 `tool-call` 类型的 Part 渲染
- 将搜索/写操作工具的直接结果渲染改为通过展示工具（Display Tools）间接渲染
- AI 不再以 Markdown 表格输出搜索结果，而是调用展示工具生成结构化 UI
- 保持交互工具（confirm_operation、collect_missing_fields）的渲染不变

**Non-Goals:**
- 不修改现有搜索/写操作工具的 execute 逻辑（它们仍然是正常工作的业务工具）
- 不改变消息的 JSONL 存储格式
- 不修改 AI SDK 的流式事件结构
- 不改变生成式 UI 组件本身（OrderListCard、RecordListCard 等组件不变）

## Decisions

### D1: 展示工具不接收数据参数，前端通过上下文查找源结果

AI 无法获取前一个工具调用的 `tool_call_id`（该 ID 不进入模型上下文窗口），因此无法通过 ID 引用。替代方案：展示工具的 execute 返回空结果（仅作信号），前端渲染时根据工具名约定在当前消息的 parts 数组中向前查找最近的匹配源工具结果。

源工具映射表：
```
display_order_list       → ['search_orders', 'create_order']
display_order_detail     → ['get_order_detail']
display_record_list      → ['search_records', 'create_record', 'update_record']
display_operation_result → ['settle_order', 'create_write_off', 'search_books',
                            'search_customers', 'search_products',
                            'search_categories', 'get_product_detail']
```

这种方案的优点：零数据传递（无截断风险）、工具定义极简。缺点：依赖工具名约定的隐式映射，但映射关系是确定性的、可维护的。

### D2: PartRenderer 的 tool-call 渲染为 null

所有 `tool-call` 类型的 Part 统一返回 null，不再渲染任何内容。这包括搜索工具、写操作工具、展示工具和交互工具的 tool-call。

### D3: tool-call 隐藏后的流式状态补充

隐藏 tool-call 后，用户在 Agent 调用工具期间只能看到"思考中..."文字。这与 chatbot-ux-enhancement 提案中的流式状态优化联动——确保 "思考中..." 覆盖从 send() 到首个 text part 输出的完整时间段，包括工具调用期间。

### D4: 展示工具的 Prompt 指令

在 Agent 系统提示词中明确要求：
- 搜索工具获取结果后，必须调用对应的展示工具呈现，不要以 Markdown 表格或列表输出
- 搜索结果仅通过展示工具展示，AI 只需用自然语言对结果做简要总结
- 写操作（创建订单、记账等）成功后，也应调用展示工具展示操作结果

### D5: 展示工具注册为新的 'display' 工具类别

在 `src/ai/tools/` 下新增 `display.ts` 文件，定义四个展示工具。工具类别为 `'display'`，注册到 `toolsByCategory` 中。展示工具的 execute 函数返回 `{ displayed: true }` 作为确认信号。

## Risks / Trade-offs

- **[AI 不调用展示工具]** → 通过明确的 Prompt 指令约束 AI 行为。如果 AI 仍然以 Markdown 输出，不会导致错误，只是展示效果不佳（文本而非卡片）。可通过 Prompt 迭代优化。
- **[隐式映射维护成本]** → 源工具映射表是一个常量对象，新增工具时需同步更新。通过代码注释和类型约束降低遗漏风险。
- **[多轮搜索的源结果查找]** → 如果 AI 连续调用多次搜索工具再调用一次展示工具，前端会找到最近一次匹配的源工具结果。这符合直觉——展示最近的搜索结果。
