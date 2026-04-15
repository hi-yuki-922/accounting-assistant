## Why

AI 聊天助手的主要用途是通过对话创建和操作订单，但用户无法在同一视图中直观地看到订单全貌。需要在聊天界面左侧添加一个按类型+状态分列的订单看板，让用户一边与 AI 对话操作订单，一边实时看到今日（或指定时间段）的订单状态分布和变化。

## What Changes

- 在 chatbot 页面左侧面板（当前占位区域）实现订单任务看板，按订单类型+状态分为五列：销售-待结账、销售-已结账、采购-待结账、采购-已结账、已取消
- 每列固定宽度 320px，整体支持横向滚动
- 看板上方提供菜单栏，包含日期范围选择器（默认今日，最大 7 天）
- 看板卡片展示：业务类型+客户名称、创建时间、备注、应收(付)/实收(付)金额
- 卡片点击复用现有 OrderDetailDialog 弹窗查看完整订单详情
- 新增 AI 通知工具 `notify_board_refresh`，AI 写操作成功后调用该工具通知看板按订单类型刷新对应列
- **BREAKING**: Order 实体新增 `customer_name` 字段，冗余存储客户名称，创建订单时同步传入
- 创建订单工具及 API 需同步接受 `customerName` 参数

## Capabilities

### New Capabilities
- `order-task-board`: 聊天助手左侧的订单看板 UI 组件，包含五列看板布局、菜单栏、日期选择器、订单卡片、与 OrderDetailDialog 的交互
- `order-board-notification`: AI 工具到看板的事件通知机制，包括 notify_board_refresh 工具定义、前端事件订阅与看板刷新逻辑

### Modified Capabilities
- `order-entity`: 新增 customer_name 字段冗余存储客户名称
- `order-service`: create_order 接受并持久化 customer_name
- `order-frontend`: 创建/编辑订单弹窗传递 customerName，类型定义同步更新
- `ai-tool-registry`: 新增 notify_board_refresh 工具，create_order 工具入参增加 customerName
- `chatbot-page`: 左侧面板从占位替换为订单看板组件

## Impact

- **后端**: Order 实体 migration 新增字段，order_service::create 需接受 customer_name
- **前端 API 层**: Order 类型新增 customerName，CreateOrderDto 新增 customerName
- **AI 工具层**: tools/order.ts createOrder 入参扩展，tools/index.ts 新增通知工具
- **聊天页面**: chatbot-page.tsx 左侧面板重构，新增看板相关组件
- **订单弹窗**: 创建/编辑订单 Dialog 需传递客户名称
