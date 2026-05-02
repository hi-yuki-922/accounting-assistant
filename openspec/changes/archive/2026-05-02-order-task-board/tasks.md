## 1. 后端：Order 实体扩展

- [x] 1.1 Order 实体新增 `customer_name: Option<String>` 字段（Rust model + migration）
- [x] 1.2 order_service::create 接受并持久化 customer_name 参数
- [x] 1.3 更新 CreateOrderDto 相关的 Rust 类型定义和 IPC 命令

## 2. 前端 API 层：类型与命令更新

- [x] 2.1 Order 类型新增 `customerName?: string` 字段
- [x] 2.2 CreateOrderDto 新增 `customerName?: string` 字段
- [x] 2.3 确认 IPC 命令对齐后端新增字段

## 3. 前端：订单弹窗传递客户名称

- [x] 3.1 CreateOrderDialog 选择客户时同步获取客户名称，提交时传递 customerName
- [x] 3.2 EditOrderDialog 确保不修改 customer_name（只读）

## 4. AI 工具层：通知工具与 create_order 扩展

- [x] 4.1 创建全局事件发射器实例（`src/lib/order-board-events.ts`）
- [x] 4.2 定义 `notify_board_refresh` 工具（入参 orderType，execute 中 emit 事件）
- [x] 4.3 `create_order` 工具入参新增 `customerName`
- [x] 4.4 在 `src/ai/tools/index.ts` 中注册 `notify_board_refresh` 工具
- [x] 4.5 更新 AI system prompt，指示写操作成功后调用 notify_board_refresh

## 5. 看板组件：核心 UI

- [x] 5.1 创建 `OrderTaskBoard` 看板组件（五列布局，320px 固定列宽，横向滚动）
- [x] 5.2 实现看板菜单栏（日期范围选择器 ≤7 天，刷新按钮）
- [x] 5.3 实现看板列组件（列标题+订单数量+卡片列表+空状态）
- [x] 5.4 实现订单卡片组件（业务类型+客户名称、时间、备注、金额）
- [x] 5.5 实现 `useOrderBoard` hook（按日期范围分类型查询订单、事件订阅刷新）

## 6. Chatbot 页面集成

- [x] 6.1 替换 chatbot-page.tsx 左侧面板占位为 OrderTaskBoard 组件
- [x] 6.2 集成 OrderDetailDialog（卡片点击触发，操作后刷新看板）
- [x] 6.3 看板订阅 order-board:refresh 事件，按 orderType 定向刷新对应列
