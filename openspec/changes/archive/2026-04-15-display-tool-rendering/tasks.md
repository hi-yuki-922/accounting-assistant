## 1. 展示工具定义与注册

- [x] 1.1 创建 `src/ai/tools/display.ts`，定义四个展示工具：display_order_list、display_order_detail、display_record_list、display_operation_result
- [x] 1.2 每个展示工具无输入参数，execute 返回 `{ displayed: true }`
- [x] 1.3 在 `src/ai/tools/index.ts` 中导入展示工具，注册到 `allTools` 对象
- [x] 1.4 扩展 `ToolCategory` 类型，新增 `'display'` 变体
- [x] 1.5 在 `toolsByCategory` 中新增 `'display'` 类别映射

## 2. 渲染管道改造

- [x] 2.1 定义源工具映射表常量 `DISPLAY_SOURCE_MAP`：展示工具名 → 源工具名数组
- [x] 2.2 修改 `section-card.tsx` 中 `PartRenderer`：`tool-call` case 返回 null
- [x] 2.3 修改 `ToolResultDispatcher`：仅处理展示工具和交互工具的 tool-result，其他返回 null
- [x] 2.4 在 `ToolResultDispatcher` 中实现源数据上下文查找逻辑：接收完整 parts 数组，根据 DISPLAY_SOURCE_MAP 向前查找匹配的源 tool-result
- [x] 2.5 更新 `PartRenderer` 调用：将完整 parts 数组传递给 `ToolResultDispatcher`
- [x] 2.6 更新渲染循环：在 `SectionChatContent` 的 messages.map 中传递 parts 给 PartRenderer

## 3. 清理旧渲染映射

- [x] 3.1 移除 `ToolCallIndicator` 组件定义（不再使用）
- [x] 3.2 移除 `TOOL_DISPLAY_NAMES` 常量（不再需要工具名中文映射）
- [x] 3.3 移除 `toolCallStateMap` 常量
- [x] 3.4 移除 section-card.tsx 中对 `Tool`、`ToolHeader` 组件的导入（如果不再使用）
- [x] 3.5 移除 ToolResultDispatcher 中对 search/create/settle 等工具的直接 case 分支

## 4. Prompt 指令更新

- [x] 4.1 在系统提示词中新增展示工具使用指令：搜索后必须调用展示工具，不直接输出 Markdown 表格
- [x] 4.2 为每个展示工具编写清晰的 description，说明其对应的搜索/写操作工具
- [x] 4.3 测试 AI 行为：验证搜索后 AI 调用展示工具而非直接输出表格

## 5. 集成验证

- [x] 5.1 验证搜索订单 → display_order_list → OrderListCard 正常渲染
- [x] 5.2 验证搜索记录 → display_record_list → RecordListCard 正常渲染
- [x] 5.3 验证查询详情 → display_order_detail → OrderDetailCard 正常渲染
- [x] 5.4 验证写操作 → display_operation_result → OperationResultCard 正常渲染
- [x] 5.5 验证交互工具（confirm_operation、collect_missing_fields）渲染不受影响
- [x] 5.6 验证 tool-call indicator 完全隐藏
- [x] 5.7 验证非展示/非交互工具的 tool-result 完全隐藏
