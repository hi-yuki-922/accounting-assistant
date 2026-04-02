## 1. 后端实体与枚举定义

- [x] 1.1 创建 `src-tauri/src/enums/order.rs`，定义 `OrderType`（Sales / Purchase）和 `OrderStatus`（Pending / Settled / Cancelled）枚举，实现 Sea-ORM 所需的 trait
- [x] 1.2 创建 `src-tauri/src/entity/order.rs`，定义 `order` 实体（id、order_no、order_type、customer_id、total_amount、actual_amount、status、channel、accounting_record_id、remark、create_at、settled_at），实现 Sea-ORM 所需的 trait
- [x] 1.3 创建 `src-tauri/src/entity/order_item.rs`，定义 `order_item` 实体（id 自增、order_id、product_id、product_name、quantity、unit、unit_price、subtotal、remark），实现 Sea-ORM 所需的 trait
- [x] 1.4 创建 `src-tauri/src/entity/order_seq.rs`，定义 `order_seq` 序列实体（date_key、seq）
- [x] 1.5 在 `src-tauri/src/entity/mod.rs` 中注册 `order`、`order_item`、`order_seq` 实体
- [x] 1.6 在 `src-tauri/src/enums/mod.rs` 中注册 `OrderType` 和 `OrderStatus` 枚举

## 2. 修改 accounting_record 实体

- [x] 2.1 在 `src-tauri/src/entity/accounting_record.rs` 中新增 `order_id: Option<i64>` 字段
- [x] 2.2 在 accounting_record 的 Command 层 DTO 中新增 `order_id` 字段
- [x] 2.3 在 `AccountingService` 中新增根据 `order_id` 查询记账记录的方法
- [x] 2.4 修改 `AccountingService` 的创建记录方法，支持传入 `order_id`（可选）

## 3. 后端订单服务层

- [x] 3.1 创建 `src-tauri/src/services/order/mod.rs`，实现 `OrderService`（接收 DatabaseConnection），包含 `create_order` 方法（事务中创建订单和明细，生成订单编号，计算总额）
- [x] 3.2 在 OrderService 中实现 `settle_order` 方法（事务中：验证状态 → 创建 accounting_record → 更新订单状态/关联/时间 → 更新账本 record_count）
- [x] 3.3 在 OrderService 中实现 `cancel_order` 方法（验证状态为 Pending 后更新为 Cancelled）
- [x] 3.4 在 OrderService 中实现查询方法：`get_all_orders`、`get_order_by_id`（含明细）、`get_orders_by_customer_id`、`get_orders_by_status`
- [x] 3.5 在 `src-tauri/src/services/mod.rs` 中注册 OrderService，在 `lib.rs` 中初始化并注入 Tauri state

## 4. 后端命令层

- [x] 4.1 创建 `src-tauri/src/commands/order.rs`，实现 Tauri IPC 命令：`create_order`、`settle_order`、`cancel_order`、`get_all_orders`、`get_order_by_id`、`get_orders_by_customer_id`、`get_orders_by_status`
- [x] 4.2 在 `src-tauri/src/commands/mod.rs` 中注册所有订单命令

## 5. 前端 API 层与类型定义

- [x] 5.1 在 `src/types/` 中定义订单相关 TypeScript 类型（Order、OrderItem、OrderType、OrderStatus、CreateOrderParams、SettleOrderParams）
- [x] 5.2 创建 `src/api/commands/order/index.ts`，使用 `tryCMD<T>` 封装所有订单相关的 Tauri invoke 调用

## 6. 前端页面与组件

- [x] 6.1 创建 `src/routes/orders.tsx`（布局页）和 `src/routes/orders.index.tsx`（订单列表页入口）
- [x] 6.3 创建 `src/pages/orders/orders-page.tsx`，实现订单管理页面（卡片/列表双视图切换）
- [x] 6.4 创建 `src/pages/orders/order-card.tsx`，实现订单卡片组件（订单编号、类型、客户、金额、状态）
- [x] 6.6 创建 `src/pages/orders/create-order-dialog.tsx`，实现创建订单对话框（类型选择、客户选择器、明细行管理、商品搜索、金额计算）
- [x] 6.7 创建 `src/pages/orders/settle-order-dialog.tsx`，实现结账确认对话框（支付渠道选择、实收金额修改）
- [x] 6.8 创建 `src/pages/orders/cancel-order-confirm-dialog.tsx`，实现取消确认对话框

## 7. 导航集成

- [x] 7.1 在应用侧边栏导航中添加"订单管理"入口，链接到 `/orders`

## 8. order_no 格式改为 `#N`

- [x] 8.1 修改订单编号生成逻辑，`order_no` 从 `ORD-YYYYMMDD-NNNNN` 改为 `#{seq}`（当日序号 + 井号前缀）
- [x] 8.2 更新前端显示，确保所有展示订单编号的地方使用新格式

## 9. 支付渠道移至结账阶段

- [x] 9.1 修改 `order` 实体的 `channel` 字段为 `Option<AccountingChannel>`（创建时为 None）
- [x] 9.2 修改 `CreateOrderDto`，移除 `channel` 字段
- [x] 9.3 修改 `SettleOrderDto`，新增 `channel` 字段（必填）
- [x] 9.4 修改 `create_order` 服务方法，不再处理 channel
- [x] 9.5 修改 `settle_order` 服务方法，接收 channel 参数，校验非空，写入订单和记账记录
- [x] 9.6 修改前端创建订单对话框，移除支付渠道选择
- [x] 9.7 修改前端结账对话框，新增支付渠道选择（必填）

## 10. 结账前可编辑订单

- [x] 10.1 新增 `UpdateOrderDto`（order_id 必填，items 可选，remark 可选）
- [x] 10.2 在 OrderService 中实现 `update_order` 方法（校验 Pending 状态，替换明细，重算金额）
- [x] 10.3 新增 `update_order` Tauri IPC 命令
- [x] 10.4 新增前端编辑订单对话框，预填充明细和备注，不可修改类型和客户
- [x] 10.5 在订单详情 Dialog 中为 Pending 状态订单添加"编辑"按钮

## 11. 订单详情改为 Dialog

- [x] 11.1 创建 `order-detail-dialog.tsx`，展示订单信息、明细表格、关联记账记录、操作按钮
- [x] 11.2 修改订单卡片和列表行，点击时弹出详情 Dialog
- [x] 11.3 移除 `src/routes/orders.$orderId.tsx` 路由文件

## 12. 卡片/列表双视图

- [x] 12.1 在订单管理页面添加视图切换控件（卡片/列表）
- [x] 12.2 实现卡片视图：仅展示今日订单，类型 Tab（全部/销售/采购）+ 状态 Tab（全部/待结账/已结账/已取消）双排独立筛选
- [x] 12.3 实现列表视图：订单表格 + 筛选栏（时间范围、状态、金额范围、支付渠道、类型）+ 分页控件
- [x] 12.4 新增 `query_orders` 后端接口，支持多维度筛选和分页查询
- [x] 12.5 新增 `query_orders` Tauri IPC 命令和前端 API 封装

## 13. 客户选择器

- [x] 13.1 在创建订单对话框中新增客户选择器组件（可搜索、可清空、非必填）

## 14. 商品搜索增强

- [x] 14.1 修改 `search_products` 服务方法，搜索范围从 name + category 扩展为 name + category + sku + keywords
- [x] 14.2 修改前端创建/编辑订单对话框中的商品搜索，确保覆盖 SKU 和关键词

## 15. 订单明细单位不可修改

- [x] 15.1 修改创建/编辑订单对话框中的明细行，选择商品后自动填充单位并设为只读
