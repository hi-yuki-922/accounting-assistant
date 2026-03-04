## Why

当前账本管理的记账记录查询功能过于基础，无法支持用户进行复杂的数据筛选和关联记录管理。用户需要根据时间范围、记账类型、记账渠道和记录状态来筛选记录，同时需要查看每条记录的冲账关联情况。这些功能对于日常财务管理和数据追踪至关重要。

## What Changes

- **分页查询增强**：为 `get_records_by_book_id_paginated` 方法增加可选的过滤条件支持
  - 记账时间范围过滤（`record_time` 字段，支持开始时间和结束时间）
  - 记账类型过滤（`accounting_type` 字段）
  - 记账渠道过滤（`channel` 字段）
  - 记账状态过滤（`state` 字段）

- **关联记录查询**：新增根据指定记账记录 ID 查询其冲账关联记录的功能
  - 通过 `write_off_id` 字段查询目标记录的所有关联记录

- **固定过滤条件**：`get_records_by_book_id_paginated` 增加固定过滤条件，只查询 `write_off_id` 为空的记录

- **返回数据增强**：分页查询返回的每条记账记录包含关联记录数量统计

## Capabilities

### New Capabilities
- `record-query-filters`: 记账记录查询的过滤条件能力，支持时间范围、记账类型、记账渠道和记录状态的筛选
- `write-off-records`: 冲账关联记录查询能力，支持根据记录 ID 查询其所有关联记录

### Modified Capabilities
- 无现有能力的需求级变更

## Impact

- **修改的文件**：
  - `src-tauri/src/services/accounting_book/mod.rs`：修改 `get_records_by_book_id_paginated` 方法
  - `src-tauri/src/services/accounting_book/dto/mod.rs`：修改和新增 DTO 结构体
  - `src-tauri/src/commands/accounting_book.rs`（如存在）：可能需要更新对应的 Tauri 命令

- **数据库影响**：无架构变更，仅涉及查询逻辑优化

- **性能考虑**：关联记录数量统计需要额外的数据库查询，需评估是否在单次查询中完成或使用批量查询优化
