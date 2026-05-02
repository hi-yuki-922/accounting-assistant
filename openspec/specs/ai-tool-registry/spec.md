# ai-tool-registry

## Purpose

AI 工具注册表模块，负责 Agent 工具的定义格式、按业务域分类、统一导出、动态加载以及各业务域工具的详细规格。

## Requirements

### Requirement: 工具按业务域分类定义
系统 SHALL 将 Agent 工具按 5 个业务域分类定义，每个工具定义在对应的 TypeScript 文件中：
- `basic-data.ts` — 基础资料工具（search_books、search_customers、search_products、search_categories、get_product_detail）
- `order.ts` — 订单工具（search_orders、get_order_detail、create_order、settle_order）
- `accounting.ts` — 记账工具（search_records、create_record、update_record、create_write_off）
- `system.ts` — 系统工具（get_current_datetime）
- `display.ts` — 展示工具（display_order_list、display_order_detail、display_record_list、display_operation_result）
- `notification.ts` — 通知工具（notify_board_refresh）

#### Scenario: 工具文件存在
- **WHEN** 查看 `src/ai/tools/` 目录
- **THEN** 包含 `index.ts`、`basic-data.ts`、`order.ts`、`accounting.ts`、`system.ts`、`interaction.ts`、`display.ts`、`notification.ts` 八个文件

### Requirement: 工具定义使用 AI SDK tool 函数
每个工具 SHALL 使用 Vercel AI SDK 的 `tool()` 函数定义，包含 `description`、`inputSchema`（使用 Zod）和 `execute` 函数。

#### Scenario: 工具定义格式正确
- **WHEN** 查看任意工具定义
- **THEN** 工具使用 `tool({ description, inputSchema: zodSchema(z.object(...)), execute })` 格式定义

### Requirement: 工具执行调用 IPC 接口
业务工具（基础资料、订单、记账）的 `execute` 函数 SHALL 调用对应的 `src/api/commands/` 下的 Tauri IPC 命令，不直接访问数据库或后端服务。

#### Scenario: search_products 工具调用 IPC
- **WHEN** Agent 调用 `search_products` 工具并传入 `{ keyword: "苹果" }`
- **THEN** 工具调用 `productApi.searchProducts({ keyword: "苹果" })` 并返回结果

#### Scenario: create_order 工具调用 IPC
- **WHEN** Agent 调用 `create_order` 工具并传入订单参数
- **THEN** 工具调用 `orderApi.createOrder(...)` 并返回创建的订单信息

### Requirement: 工具返回统一格式
所有工具的 `execute` 函数 SHALL 返回 `{ success: boolean, message: string, data?: T, error?: string }` 格式的结果。

#### Scenario: 工具执行成功
- **WHEN** 工具成功执行
- **THEN** 返回 `{ success: true, message: "...", data: <result> }`

#### Scenario: 工具执行失败
- **WHEN** 工具执行过程中发生错误
- **THEN** 返回 `{ success: false, message: "...", error: "<error message>" }`

### Requirement: 工具统一导出
`src/ai/tools/index.ts` SHALL 导出一个 `getAllTools()` 函数，返回所有分类工具的合集对象（包含展示工具），供 Agent 使用。

#### Scenario: getAllTools 返回全部工具
- **WHEN** 调用 `getAllTools()`
- **THEN** 返回包含全部工具的对象，包含搜索工具、写操作工具、系统工具、交互工具和展示工具

### Requirement: 工具动态加载支持
`src/ai/tools/index.ts` SHALL 支持按类别加载工具子集，提供 `getToolsByCategory(category)` 函数，类别包括 `'display'`。

#### Scenario: 按类别加载展示工具
- **WHEN** 调用 `getToolsByCategory('display')`
- **THEN** 返回仅包含 display_order_list、display_order_detail、display_record_list、display_operation_result 的对象

#### Scenario: ToolCategory 类型扩展
- **WHEN** 定义 ToolCategory 类型
- **THEN** 类型 SHALL 包含 `'display'` 变体

#### Scenario: 按类别加载基础资料工具
- **WHEN** 调用 `getToolsByCategory('basic-data')`
- **THEN** 返回仅包含 search_books、search_customers、search_products、search_categories、get_product_detail 的对象

#### Scenario: 按类别加载不存在的类别
- **WHEN** 调用 `getToolsByCategory('non-existent')`
- **THEN** 返回空对象 `{}`

### Requirement: 系统工具无需 IPC 调用
`get_current_datetime` 系统工具 SHALL 在前端本地获取当前日期时间，不调用后端 IPC。

#### Scenario: 获取当前日期时间
- **WHEN** Agent 调用 `get_current_datetime` 工具
- **THEN** 返回当前日期时间，格式为 "YYYY-MM-DD HH:mm:ss"，无需入参

### Requirement: 基础资料工具覆盖
基础资料工具 SHALL 提供以下能力：
- `search_books` — 查询所有账本，调用 `accountingBook.getAllBooks()`
- `search_customers` — 按关键词搜索客户，调用 `customerApi.searchCustomers({ keyword })`
- `search_products` — 按关键词搜索商品，调用 `productApi.searchProducts({ keyword })`
- `search_categories` — 查询所有品类，调用 `categoryApi.getAllCategories()`
- `get_product_detail` — 获取商品详情（含参考价格），调用 `productApi.getProductById({ id })`

#### Scenario: search_customers 入参
- **WHEN** 调用 `search_customers` 工具
- **THEN** 入参为 `{ keyword: string }`，必填

#### Scenario: get_product_detail 入参
- **WHEN** 调用 `get_product_detail` 工具
- **THEN** 入参为 `{ id: number }`，必填

### Requirement: 订单工具覆盖
订单工具 SHALL 提供以下能力：
- `search_orders` — 按条件搜索订单，调用 `orderApi.queryOrders(...)`，支持按日期范围、状态、金额范围、支付渠道、订单类型筛选
- `get_order_detail` — 获取订单详情（含明细），调用 `orderApi.getOrderById({ id })`
- `create_order` — 创建订单，调用 `orderApi.createOrder(...)`，入参包含订单类型、客户、客户名称、商品明细列表
- `settle_order` — 订单结账，调用 `orderApi.settleOrder(...)`，入参包含订单 ID、支付渠道、实收金额

#### Scenario: search_orders 入参
- **WHEN** 调用 `search_orders` 工具
- **THEN** 入参包含可选的 `startTime`、`endTime`、`status`、`minAmount`、`maxAmount`、`channel`、`orderType`、`page`、`pageSize`

#### Scenario: create_order 入参
- **WHEN** 调用 `create_order` 工具
- **THEN** 入参包含必填的 `orderType`（Sales/Purchase）、`items`（商品明细数组），可选的 `customerId`、`customerName`、`remark`、`actualAmount`、`subType`

#### Scenario: create_order 传入客户名称
- **WHEN** 调用 `create_order` 工具且指定了 customerId
- **THEN** 入参 MUST 同时包含 customerName，与客户 ID 对应

### Requirement: 通知工具覆盖
系统 SHALL 在 AI 工具注册表中新增 `notify_board_refresh` 工具，归类为通知工具。该工具在订单写操作成功后调用，通知前端看板按订单类型刷新。

#### Scenario: notify_board_refresh 入参
- **WHEN** 调用 `notify_board_refresh` 工具
- **THEN** 入参包含必填的 `orderType`（Sales/Purchase/All），指示需要刷新的订单类型范围

#### Scenario: getAllTools 包含通知工具
- **WHEN** 调用 `getAllTools()`
- **THEN** 返回的工具对象包含 `notify_board_refresh`

### Requirement: 记账工具覆盖
记账工具 SHALL 提供以下能力：
- `search_records` — 按条件搜索记账记录，调用 `accountingBook.getRecordsByBookIdPaginated(...)`
- `create_record` — 创建记账记录，调用 `accounting.createAccountingRecord(...)`
- `update_record` — 修改记账记录，调用 `accounting.updateAccountingRecord(...)`
- `create_write_off` — 创建冲账记录，调用 `accounting.createWriteOffRecord(...)`

#### Scenario: create_record 入参
- **WHEN** 调用 `create_record` 工具
- **THEN** 入参包含必填的 `amount`、`recordTime`、`accountingType`、`title`、`channel`，可选的 `remark`、`bookId`

#### Scenario: create_write_off 入参
- **WHEN** 调用 `create_write_off` 工具
- **THEN** 入参包含必填的 `originalRecordId`、`amount`，可选的 `channel`、`remark`、`recordTime`
