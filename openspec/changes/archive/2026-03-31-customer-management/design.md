## Context

当前应用仅支持收支记账功能，客户信息管理是完全独立的新模块。后端采用 Entity-First 分层架构（entity → service → command），前端使用 React 19 + TanStack Router + shadcn/ui。客户模块作为独立的通讯录功能，现阶段不与现有记账实体产生关联，但需为后续订单模块预留扩展能力（如 bank_account 字段）。

现有架构模式参考：
- Entity：Sea-ORM ActiveModel 模式，ID 使用日期+流水号序列生成（如 `accounting_record_seq`）
- Service：通过 `init_services` 注册到 Tauri `app.manage()`，命令层通过 `State<Service>` 获取
- Command：Tauri IPC 命令，通过 `with_install_tauri_commands` 统一注册
- Enum：实现 Sea-ORM 的 `TryGetable`、`ValueType`、`From<Enum> for Value` 等转换 trait
- 前端路由：基于 TanStack Router 的文件路由，侧边栏为固定导航

## Goals / Non-Goals

**Goals:**
- 新增完整的客户 CRUD 功能，复用现有分层架构模式
- 提供卡片列表展示，支持按姓名/电话搜索和按分类（全部/零售商/供应商）筛选
- 新增/编辑客户使用 Dialog 弹窗交互
- 侧边栏新增「客户管理」导航入口
- 数据模型为后续订单模块预留扩展字段

**Non-Goals:**
- 客户与记账记录的关联（属于订单模块）
- 应收应付统计功能（属于订单模块）
- 单据打印功能（属于订单模块）
- 客户标签/多分类支持（当前仅需零售商/供应商单选）
- 客户数据的导入/导出

## Decisions

### 1. 客户 ID 生成策略：日期+流水号

**决定**：复用现有 `accounting_record` 的 ID 生成模式，使用 `YYYYMMDDNNNNN` 格式（日期 + 5位流水号），配合 `customer_seq` 序列表。

**理由**：与项目现有的 ID 生成模式保持一致，便于跨模块统一管理。客户数量在几十到几百级别，此方案不会产生冲突。

**替代方案**：使用 UUID 或自增 ID — 但项目现有实体均使用业务 ID，保持一致性更重要。

### 2. 客户分类：枚举单选

**决定**：`CustomerCategory` 枚举包含 `Retailer`（零售商）和 `Supplier`（供应商），每客户仅属于一个分类。

**理由**：用户明确确认同一客户不会同时是零售商和供应商。枚举实现 Sea-ORM 完整的转换 trait，与现有 `AccountingType`、`AccountingChannel` 等枚举模式一致。

### 3. 前端路由结构

**决定**：采用与账本管理相同的路由模式：
- `routes/customers.tsx` — 布局页（Outlet）
- `routes/customers.index.tsx` — 客户列表页（默认页）

**理由**：与现有 `books.tsx` / `books.index.tsx` 保持一致，后续如需客户详情页可添加 `customers.$customerId.tsx`。

### 4. 列表展示：卡片列表，无分页

**决定**：使用卡片列表展示客户信息，不做分页。支持搜索和分类 Tab 筛选。

**理由**：客户量级在几十到几百之间，无需分页。卡片列表对于信息密度适中的客户数据体验优于表格。

### 5. Service 层设计

**决定**：创建 `CustomerService` 结构体，包含以下方法：
- `create_customer` — 新增客户
- `update_customer` — 修改客户
- `delete_customer` — 删除客户
- `get_all_customers` — 获取全部客户
- `get_customer_by_id` — 按 ID 查询客户
- `search_customers` — 按姓名/电话搜索

**理由**：与现有 `AccountingService` 的设计模式一致。由于无分页需求，查询方法相对简单。

### 6. DTO 命名风格

**决定**：DTO 字段使用 camelCase（前端 IPC 传输），Rust 结构体字段使用 snake_case（内部逻辑），通过 `#[serde(rename_all = "camelCase")]` 自动转换。

**理由**：与项目最近的 IPC 字段重命名重构保持一致（参见归档变更 `rename-ipc-fields-to-camelcase`）。

## Risks / Trade-offs

- **[扩展性]** 客户分类目前只有两种，如果未来需要更多分类需修改枚举 → 可接受，枚举变更在当前架构下影响范围可控
- **[性能]** 无分页设计，数据量增长到数千条时可能影响体验 → 通过搜索和筛选缓解，且用户确认量级在几百以内
- **[预留字段]** bank_account 字段现阶段使用率低 → 作为可选字段不影响现有功能，为订单模块做好准备
