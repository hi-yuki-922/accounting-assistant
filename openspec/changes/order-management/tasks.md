## 1. 后端实体与枚举定义

- [ ] 1.1 创建 `src-tauri/src/enums/order.rs`，定义 `OrderType`（Sales / Purchase）和 `OrderStatus`（Pending / Settled / Cancelled）枚举，实现 Sea-ORM 所需的 trait
- [ ] 1.2 创建 `src-tauri/src/entity/order.rs`，定义 `order` 实体（id、order_no、order_type、customer_id、total_amount、actual_amount、status、channel、accounting_record_id、remark、create_at、settled_at），实现 Sea-ORM 所需的 trait
- [ ] 1.3 创建 `src-tauri/src/entity/order_item.rs`，定义 `order_item` 实体（id 自增、order_id、product_id、product_name、quantity、unit、unit_price、subtotal、remark），实现 Sea-ORM 所需的 trait
- [ ] 1.4 创建 `src-tauri/src/entity/order_seq.rs`，定义 `order_seq` 序列实体（date_key、seq）
- [ ] 1.5 在 `src-tauri/src/entity/mod.rs` 中注册 `order`、`order_item`、`order_seq` 实体
- [ ] 1.6 在 `src-tauri/src/enums/mod.rs` 中注册 `OrderType` 和 `OrderStatus` 枚举

## 2. 修改 accounting_record 实体

- [ ] 2.1 在 `src-tauri/src/entity/accounting_record.rs` 中新增 `order_id: Option<i64>` 字段
- [ ] 2.2 在 accounting_record 的 Command 层 DTO 中新增 `order_id` 字段
- [ ] 2.3 在 `AccountingService` 中新增根据 `order_id` 查询记账记录的方法
- [ ] 2.4 修改 `AccountingService` 的创建记录方法，支持传入 `order_id`（可选）

## 3. 后端订单服务层

- [ ] 3.1 创建 `src-tauri/src/services/order/mod.rs`，实现 `OrderService`（接收 DatabaseConnection），包含 `create_order` 方法（事务中创建订单和明细，生成订单编号，计算总额）
- [ ] 3.2 在 OrderService 中实现 `settle_order` 方法（事务中：验证状态 → 创建 accounting_record → 更新订单状态/关联/时间 → 更新账本 record_count）
- [ ] 3.3 在 OrderService 中实现 `cancel_order` 方法（验证状态为 Pending 后更新为 Cancelled）
- [ ] 3.4 在 OrderService 中实现查询方法：`get_all_orders`、`get_order_by_id`（含明细）、`get_orders_by_customer_id`、`get_orders_by_status`
- [ ] 3.5 在 `src-tauri/src/services/mod.rs` 中注册 OrderService，在 `lib.rs` 中初始化并注入 Tauri state

## 4. 后端命令层

- [ ] 4.1 创建 `src-tauri/src/commands/order.rs`，实现 Tauri IPC 命令：`create_order`、`settle_order`、`cancel_order`、`get_all_orders`、`get_order_by_id`、`get_orders_by_customer_id`、`get_orders_by_status`
- [ ] 4.2 在 `src-tauri/src/commands/mod.rs` 中注册所有订单命令

## 5. 前端 API 层与类型定义

- [ ] 5.1 在 `src/types/` 中定义订单相关 TypeScript 类型（Order、OrderItem、OrderType、OrderStatus、CreateOrderParams、SettleOrderParams）
- [ ] 5.2 创建 `src/api/commands/order/index.ts`，使用 `tryCMD<T>` 封装所有订单相关的 Tauri invoke 调用

## 6. 前端页面与组件

- [ ] 6.1 创建 `src/routes/orders.tsx`（布局页）和 `src/routes/orders.index.tsx`（订单列表页入口）
- [ ] 6.2 创建 `src/routes/orders.$orderId.tsx`（订单详情页路由）
- [ ] 6.3 创建 `src/pages/orders/orders-page.tsx`，实现订单列表页（状态 Tab 切换 + 订单卡片列表 + 空状态）
- [ ] 6.4 创建 `src/pages/orders/order-card.tsx`，实现订单卡片组件（订单编号、类型、客户、金额、状态、操作按钮）
- [ ] 6.5 创建 `src/pages/orders/order-detail-page.tsx`，实现订单详情页（订单信息 + 明细表格 + 关联记账记录 + 结账/取消操作）
- [ ] 6.6 创建 `src/pages/orders/create-order-dialog.tsx`，实现创建订单对话框（类型选择、客户选择、明细行管理、商品搜索、金额计算、渠道选择）
- [ ] 6.7 创建 `src/pages/orders/settle-order-dialog.tsx`，实现结账确认对话框（显示订单摘要、可修改实收金额）
- [ ] 6.8 创建 `src/pages/orders/cancel-order-confirm-dialog.tsx`，实现取消确认对话框

## 7. 导航集成

- [ ] 7.1 在应用侧边栏导航中添加"订单管理"入口，链接到 `/orders`
