## Why

当前 AI 对话中每个工具调用都会生成一条工具调用可视化 UI（ToolCallIndicator）和对应的工具结果卡片，导致对话界面冗余嘈杂。用户不需要关心 Agent 调用了哪些工具、执行了什么操作——他们只需要看到最终结果。同时，AI 有时会以 Markdown 表格形式输出搜索结果，而非结构化的卡片组件，导致展示效果不一致。

## What Changes

- 新增展示工具（Display Tools）：`display_order_list`、`display_order_detail`、`display_record_list`、`display_operation_result`，作为搜索/写操作结果的结构化展示入口
- 隐藏所有 `tool-call` 类型的 Part 渲染（ToolCallIndicator 组件不再渲染）
- 非展示工具的 `tool-result` Part 不再渲染（搜索工具、写操作工具的结果不再直接展示）
- 仅保留展示工具和交互工具（confirm_operation、collect_missing_fields）的 `tool-result` 渲染
- 展示工具不接收数据参数，前端通过工具名约定在消息 Parts 上下文中自动查找源工具结果
- 修改 Agent 系统提示词：要求 AI 搜索后调用展示工具呈现结果，不直接以 Markdown 表格输出

## Capabilities

### New Capabilities
- `display-tools`: 展示工具定义与注册，包括 display_order_list、display_order_detail、display_record_list、display_operation_result 四个纯展示型工具
- `display-tool-rendering`: 展示工具的前端渲染管道，包括 Parts 渲染逻辑改造、源工具结果查找机制、工具名到展示组件的映射

### Modified Capabilities
- `ai-tool-registry`: 工具注册表新增展示工具类别
- `generative-ui-tool-renderer`: ToolResultDispatcher 改造为仅处理展示工具和交互工具，ToolCallIndicator 移除
- `ai-chat-tools`: 工具定义结构调整，新增展示工具的 description 优化

## Impact

- **工具层**: src/ai/tools/ 新增 display 工具文件，index.ts 注册新工具
- **前端渲染**: section-card.tsx 的 PartRenderer 和 ToolResultDispatcher 改造
- **类型**: chatbot.ts 的 DisplayMessagePart 类型可能微调
- **提示词**: Agent 系统提示词新增展示工具使用指令
- **生成式组件**: 现有组件（OrderListCard、RecordListCard 等）不变，仅改变数据来源（从直接 tool-result 改为展示工具上下文查找）
