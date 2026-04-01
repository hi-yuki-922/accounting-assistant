## Why

商品信息管理（Phase 1A）即将落地，商品与客户两个核心实体已就位。订单是连接"商品交易"与"记账记录"的关键桥梁——销售订单记录卖出什么、卖给谁、收了多少钱，采购订单记录进了什么货、从谁那进、付了多少钱。没有订单模块，Agent 无法将自然语言转化为结构化交易，也无法自动生成记账记录。

## What Changes

- 新增 `order` 实体（订单表）及 `order_seq` 序列表，支持销售单（Sales）和采购单（Purchase）两种类型
- 新增 `order_item` 实体（订单明细表），记录每笔订单的商品明细
- 新增 `OrderType` 枚举（Sales / Purchase）和 `OrderStatus` 枚举（Pending / Settled / Cancelled）
- 新增 `OrderService` 服务层，提供订单创建、结账、取消能力，结账时自动生成对应的记账记录
- 新增订单相关的 Tauri IPC Commands
- **BREAKING**: `accounting_record` 实体新增 `order_id: Option<i64>` 字段，支持订单与记账记录的双向关联
- 新增前端订单管理页面（路由 `/orders`），包含订单列表、订单详情、创建、结账、取消功能

## Capabilities

### New Capabilities
- `order-entity`: 订单与订单明细实体定义，包含 OrderType、OrderStatus 枚举
- `order-service`: 订单服务层，提供创建/结账/取消/查询能力，结账时自动生成记账记录
- `order-frontend`: 前端订单管理页面，路由 `/orders`，含列表/详情/创建/结账/取消

### Modified Capabilities
- `accounting-service`: 记账记录新增 `order_id` 可选字段，支持通过订单 ID 查询关联的记账记录
- `accounting-book-service`: 账本详情页需支持展示来源订单信息（通过 order_id 关联查询）

## Impact

- **后端**: 新增 entity（order、order_item、order_seq）、service、commands 模块；修改 `accounting_record` 实体新增 `order_id` 字段；修改 `AccountingService` 支持带 order_id 创建记录
- **前端**: 新增路由 `/orders`，新增 API 调用层，新增页面组件；记账记录列表/详情中展示关联订单信息
- **数据库**: 新增 `order`、`order_item`、`order_seq` 三张表；`accounting_record` 表新增 `order_id` 列
- **导航**: 侧边栏需增加订单管理入口
- **依赖**: 依赖 product-management 模块已完成（商品实体）
