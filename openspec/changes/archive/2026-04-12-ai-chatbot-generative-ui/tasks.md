## 1. Parts 消息模型重构

- [x] 1.1 在 `src/types/chatbot.ts` 中定义 `DisplayMessagePart` 类型（text / tool-call / tool-result 三种变体），定义 `ToolCallState` 类型（`'calling' | 'completed' | 'error'`）
- [x] 1.2 重构 `DisplayMessage` 类型：移除 `content: string` 和 `toolCalls: ToolCallDisplay[]`，新增 `id: string` 和 `parts: DisplayMessagePart[]`
- [x] 1.3 重写 `src/lib/message-utils.ts` 中的 `toDisplayMessages()`，将 `JSONLMessage[]` 转换为 Parts 模型的 `DisplayMessage[]`，合并 assistant 消息的 tool_calls 和对应的 tool result 到同一消息的 parts 中
- [x] 1.4 在 `src/hooks/use-section-chat.ts` 中新增 `toPartsFromSnapshot()` 辅助函数，将 `JSONLMessage[]` + 流式累加数据（`assistantContent`、`toolCallsAcc`、`toolResults`）转换为实时 `DisplayMessagePart[]`

## 2. 流消费循环改造

- [x] 2.1 改造 `useSectionChat.performSend()` 的 `fullStream` 消费循环，维护 `partsAcc: DisplayMessagePart[]` 替代单独的 `assistantContent` + `toolCallsAcc` + `toolResults`
- [x] 2.2 处理 `text-delta` 事件：追加到最后一个 text part 或创建新 text part，触发 React 状态更新
- [x] 2.3 处理 `tool-call` 事件：新增 `{ type: 'tool-call', state: 'calling' }` part，触发 React 状态更新
- [x] 2.4 处理 `tool-result` 事件：新增 `{ type: 'tool-result', result }` part，将对应 tool-call part 的 state 更新为 `'completed'`，触发 React 状态更新
- [x] 2.5 流完成时：将 `partsAcc` 合入最终的 assistant `DisplayMessage`，保持 JSONL 写入逻辑不变（仍使用 `buildSnapshot` + `SectionWriter`）
- [x] 2.6 中断（AbortError）时：将已接收的 parts 状态正确持久化

## 3. SectionChatContent 渲染层适配

- [x] 3.1 改造 `section-card.tsx` 中的 `SectionChatContent`，从 `msg.content` 渲染改为 `msg.parts.map()` 按 part 类型分发
- [x] 3.2 实现 text part 渲染：复用 `<MessageResponse>` 组件
- [x] 3.3 实现 tool-call part 渲染：使用 ai-elements `<Tool>` 组件展示工具调用状态（名称 + state badge）
- [x] 3.4 实现 tool-result part 渲染：新增 `<ToolResultRenderer>` 组件作为分发器入口
- [x] 3.5 适配流式指示器（思考中... / 光标）到 parts 模型，基于最后一个 assistant 消息的 parts 状态判断

## 4. 移除历史摘要注入

- [x] 4.1 在 `useSectionChat.performSend()` 中删除 `getSectionSummaries()` 调用和 `summaryInjection` 构建/注入逻辑（第 131-144 行）
- [x] 4.2 在 `src/ai/router.ts` 的 `route()` 函数中删除摘要获取和注入逻辑（第 48-55 行）
- [x] 4.3 从 `RouteResult` 类型中移除 `summaryInjection` 字段
- [x] 4.4 清理 `route()` 调用方对 `summaryInjection` 的引用

## 5. Section 摘要 LLM 生成

- [x] 5.1 在 `src/ai/storage/types.ts` 的 `SectionSummary` 类型中新增 `title: string` 字段
- [x] 5.2 在 `src/ai/storage/summary.ts` 中新增 `generateLLMSummary(userFirstMessage: string)` 函数，调用 `glm-4-flash` 生成 `{ title, summary }` JSON
- [x] 5.3 修改后端 Tauri command `create_section_summary`，接收并持久化 `title` 字段
- [x] 5.4 替换 `useSectionChat.performSend()` 流完成后的摘要生成逻辑：提取首条 user 消息 → 调用 `generateLLMSummary()` → 保存 title + summary，LLM 调用失败时 fallback 到截取首条消息前 20 字符作为 title
- [x] 5.5 修改 `SectionCard` 展示逻辑：折叠态显示 `summary.title`，展开态显示 `summary.title` 替代"对话节 #N"
- [x] 5.6 异步执行摘要生成，不阻塞流完成后的 UI 更新

## 6. confirm_operation 工具

- [x] 6.1 在 `src/ai/tools/` 下新增 `interaction.ts`，定义 `confirm_operation` 工具（inputSchema: `toolName`, `params`, `description`），execute 返回 `{ pending: true, toolName, params, description }`
- [x] 6.2 在 `src/ai/tools/index.ts` 中注册 `confirm_operation`，加入 `interaction` 工具类别
- [x] 6.3 在 `ToolResultRenderer` 的映射表中处理 `confirm_operation` → `<ConfirmationCard>` 组件渲染
- [x] 6.4 实现 `ConfirmationCard` 组件：展示 description + 确认/取消按钮
- [x] 6.5 用户点击确认：调用 `useSectionChat.send()` 注入隐藏 system message `"用户已确认执行操作。请使用以下参数调用 ${toolName}：${JSON.stringify(params)}"`
- [x] 6.6 用户点击取消：注入隐藏 system message `"用户已拒绝执行操作。"` 并在 UI 显示取消状态

## 7. 确认模式切换 Badge

- [x] 7.1 在 `src/lib/` 下新增确认模式 localStorage 管理（`getConfirmationMode()` / `setConfirmationMode()`）
- [x] 7.2 在 `src/pages/chatbot/components/prompt-input.tsx` 中新增确认模式 Badge 组件，支持点击切换
- [x] 7.3 修改 `ChatbotPage` 传递 `confirmationMode` 到 `SectionCard` → `SectionChatContent` → `useSectionChat`
- [x] 7.4 在 `useSectionChat.performSend()` 中根据 `confirmationMode` 动态注入 system prompt 指令片段
- [x] 7.5 在 `src/ai/prompts/` 中新增确认模式指令片段模板（ON/OFF 两段）

## 8. collect_missing_fields 工具

- [x] 8.1 在 `src/ai/tools/interaction.ts` 中定义 `collect_missing_fields` 工具（inputSchema: `toolName`, `missingFields[]`, `providedParams`），execute 返回 `{ pending: true, toolName, missingFields, providedParams }`
- [x] 8.2 在 `src/ai/tools/index.ts` 中注册 `collect_missing_fields`
- [x] 8.3 新增 `src/ai/tools/field-map.ts`，定义 `writeToolFieldMap` 映射表（create_order / settle_order / create_record / update_record / create_write_off 的必填字段 → FieldDef）
- [x] 8.4 定义 `FieldDef` 类型：`{ label: string; type: 'text' | 'number' | 'select' | 'datetime' | 'array'; options?: ...; itemFields?: ... }`

## 9. MissingFieldsForm 组件

- [x] 9.1 创建 `src/pages/chatbot/components/generative/missing-fields-form.tsx`，根据 `toolName` 和 `missingFields` 从 `writeToolFieldMap` 获取字段定义，动态渲染表单
- [x] 9.2 实现字段类型渲染器：text → `<Input>`，number → `<Input type="number">`，select → `<Select>`（带 options），datetime → 日期时间选择器
- [x] 9.3 实现表单提交：收集填写数据，调用 `useSectionChat.send()` 注入隐藏 system message 包含表单数据和已提供的参数
- [x] 9.4 实现取消操作：注入取消消息，UI 显示取消状态
- [x] 9.5 在 `ToolResultRenderer` 映射表中处理 `collect_missing_fields` → `<MissingFieldsForm>`

## 10. ToolResultRenderer 与生成式业务组件

- [x] 10.1 创建 `src/pages/chatbot/components/tool-result-renderer.tsx`，实现 toolName → Component 映射分发逻辑，未匹配时 fallback 为纯文本展示
- [x] 10.2 创建 `src/pages/chatbot/components/generative/order-list-card.tsx`，接收 `search_orders` / `create_order` 的 result，展示订单列表（表格或卡片），行点击打开 `OrderDetailDialog`
- [x] 10.3 创建 `src/pages/chatbot/components/generative/order-detail-card.tsx`，接收 `get_order_detail` 的 result，展示订单详情摘要，点击打开 `OrderDetailDialog`
- [x] 10.4 创建 `src/pages/chatbot/components/generative/record-list-card.tsx`，接收 `search_records` / `create_record` / `update_record` 的 result，展示记录列表，行点击打开 `RecordDetailDialog`
- [x] 10.5 创建 `src/pages/chatbot/components/generative/operation-result-card.tsx`，通用的操作结果展示组件（成功/失败消息 + 关键数据摘要），用于未定制展示的工具

## 11. RecordDetailDialog

- [x] 11.1 创建 `src/pages/books/components/record-detail-dialog.tsx`，Props：`{ open, recordId, onClose }`
- [x] 11.2 通过 `accounting.get(recordId)` 获取完整记录并展示：标题、金额（收入红色/支出绿色）、记账类型、支付渠道、记录时间、状态、备注
- [x] 11.3 如有关联冲账记录，展示冲账信息（冲账 ID）
- [x] 11.4 编辑/删除操作暂不包含（类型兼容性问题，后续迭代）
- [x] 11.5 在 `RecordListCard` 中行点击时打开此 Dialog

## 12. System Prompt 改造

- [x] 12.1 修改 `src/ai/prompts/agents/team-leader.md`，新增交互工具使用指南：确认模式下的 `confirm_operation` 调用规则、缺失信息时 `collect_missing_fields` 调用规则
- [x] 12.2 新增写入工具清单到 agent prompt，明确列举哪些工具属于写操作（`create_order`、`settle_order`、`create_record`、`update_record`、`create_write_off`）
- [x] 12.3 新增隐藏消息处理指南：当收到用户确认/补充信息的 system message 时，如何正确提取参数并调用对应工具

## 13. 集成与端到端验证

- [x] 13.1 验证 Parts 模型下流式渲染正常（文本 + 工具调用 + 工具结果混合展示）
- [x] 13.2 验证 Section 摘要和标题的 LLM 生成端到端流程（流完成 → LLM 调用 → 摘要保存 → UI 更新）
- [x] 13.3 验证确认模式 ON：写操作触发确认 → 用户确认 → 操作执行 → 结果展示
- [x] 13.4 验证确认模式 OFF：写操作直接执行 → 结果展示
- [x] 13.5 验证缺失信息收集：必填字段缺失 → 表单弹出 → 用户填写 → 操作执行 → 结果展示
- [x] 13.6 验证 OrderListCard / RecordListCard 列表展示 + 点击打开详情 Dialog
- [x] 13.7 验证历史对话加载后 Parts 模型的正确还原
