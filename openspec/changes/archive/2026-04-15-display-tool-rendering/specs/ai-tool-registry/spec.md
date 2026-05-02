## MODIFIED Requirements

### Requirement: 工具按业务域分类定义

系统 SHALL 将 Agent 工具按 5 个业务域分类定义，每个工具定义在对应的 TypeScript 文件中：
- `basic-data.ts` — 基础资料工具（search_books、search_customers、search_products、search_categories、get_product_detail）
- `order.ts` — 订单工具（search_orders、get_order_detail、create_order、settle_order）
- `accounting.ts` — 记账工具（search_records、create_record、update_record、create_write_off）
- `system.ts` — 系统工具（get_current_datetime）
- `display.ts` — 展示工具（display_order_list、display_order_detail、display_record_list、display_operation_result）

#### Scenario: 工具文件存在
- **WHEN** 查看 `src/ai/tools/` 目录
- **THEN** 包含 `index.ts`、`basic-data.ts`、`order.ts`、`accounting.ts`、`system.ts`、`interaction.ts`、`display.ts` 七个文件

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
