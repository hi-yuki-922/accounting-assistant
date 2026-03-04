## Context

当前记账记录查询功能位于 `src-tauri/src/services/accounting_book/mod.rs` 中的 `get_records_by_book_id_paginated` 方法。该方法仅支持基本的账本 ID 筛选和分页，返回的是原始的 `accounting_record::Model` 结构。

记账记录实体 `accounting_record` 包含以下关键字段：
- `id`：主键
- `record_time`：记账时间
- `accounting_type`：记账类型（收入、支出、投资收益、投资亏损）
- `channel`：记账渠道（现金、支付宝、微信、银行卡、未知）
- `state`：记录状态（待入账、已入账）
- `write_off_id`：冲账关联记录 ID（可选）

当前架构使用 Sea-ORM 进行数据库操作，采用 Entity-First 模式。所有数据库操作通过服务层函数封装，前端通过 Tauri IPC 命令调用。

## Goals / Non-Goals

**Goals:**
- 为分页查询添加可选的过滤条件，支持按时间范围、记账类型、记账渠道和记录状态筛选
- 实现根据记录 ID 查询其冲账关联记录的功能
- 在分页查询中添加固定过滤条件（`write_off_id` 为空）
- 在分页返回的每条记录中包含关联记录数量统计
- 保持向后兼容性，不破坏现有功能

**Non-Goals:**
- 不修改数据库架构（`accounting_record` 表结构不变）
- 不实现复杂的关联记录统计查询优化（如缓存、视图等）
- 不涉及前端 UI 的变更

## Decisions

### DTO 结构设计

**决策**：扩展 `GetRecordsByBookIdPaginatedDto`，增加可选的过滤字段

**理由**：
- 使用 `Option<T>` 表示可选过滤条件，不传时不过滤
- 时间范围使用 `Option<NaiveDateTime>` 表示开始和结束时间
- 类型、渠道、状态使用对应的枚举类型 `Option<AccountingType>`、`Option<AccountingChannel>`、`Option<AccountingRecordState>`

**备选方案**：使用 JSON 字符串或 HashMap 传递过滤条件
- **拒绝理由**：类型安全性差，编译期无法检查

### 关联记录数量统计方式

**决策**：在获取分页数据后，批量查询每条记录的关联记录数量，然后注入到返回的数据中

**理由**：
- 简单直接，易于实现和维护
- 每页数据量有限（通常 10-50 条），批量查询性能可接受
- 避免在主查询中使用复杂的子查询或 JOIN

**备选方案 1**：使用单次 SQL 查询，通过 LEFT JOIN 和 COUNT 聚合获取关联数量
- **拒绝理由**：Sea-ORM 实现复杂，可能影响分页查询的性能和可读性

**备选方案 2**：在分页查询前先统计所有符合条件的记录数量，再查询数据
- **拒绝理由**：无法实现单条记录的关联数量统计

### 返回数据结构设计

**决策**：创建新的响应 DTO `RecordWithCountDto`，包含原始记录和关联记录数量

**理由**：
- 保持 `accounting_record::Model` 不变，避免修改实体定义
- 使用组合方式扩展返回数据，符合开闭原则
- 前端可以方便地获取关联记录数量

**备选方案**：直接修改 `accounting_record::Model`，添加 `related_count` 字段
- **拒绝理由**：实体应当反映数据库表结构，不应包含计算字段

### 固定过滤条件实现

**决策**：在构建 Sea-ORM 查询时，始终添加 `write_off_id` 为 NULL 的过滤条件

**理由**：
- 逻辑清晰，易于理解
- 避免查询已经被冲账的记录，减少数据冗余

## Risks / Trade-offs

**风险 1**：关联记录数量统计可能影响查询性能，尤其是当数据量较大时
- **缓解措施**：使用批量查询代替 N+1 查询，在单次查询中获取所有关联记录数量

**风险 2**：新增过滤条件可能导致向后兼容性问题
- **缓解措施**：所有过滤字段都使用 `Option<T>`，不传值时行为与原方法一致

**风险 3**：时间范围过滤时可能出现时区问题
- **缓解措施**：统一使用数据库存储的本地时间（NaiveDateTime），避免时区转换

## Migration Plan

### 部署步骤

1. 更新 DTO 定义（`src-tauri/src/services/accounting_book/dto/mod.rs`）
2. 修改服务层函数 `get_records_by_book_id_paginated`（`src-tauri/src/services/accounting_book/mod.rs`）
3. 新增服务层函数 `get_write_off_records_by_id`（`src-tauri/src/services/accounting_book/mod.rs`）
4. 更新 Tauri 命令（如需要，`src-tauri/src/commands/accounting_book.rs`）
5. 运行测试验证功能正确性

### 回滚策略

由于不涉及数据库架构变更，仅修改代码逻辑，可通过 Git 回滚来撤销变更。

## Open Questions

无。所有技术决策已在设计阶段明确。
