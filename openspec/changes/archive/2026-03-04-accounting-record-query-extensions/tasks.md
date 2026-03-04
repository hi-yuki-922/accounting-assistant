## 1. DTO 结构定义更新

- [x] 1.1 修改 `GetRecordsByBookIdPaginatedDto`，增加可选过滤字段（`start_time`、`end_time`、`accounting_type`、`channel`、`state`）
- [x] 1.2 新增 `RecordWithCountDto` 结构体，包含原始记录和关联记录数量

## 2. 分页查询功能增强

- [x] 2.1 修改 `get_records_by_book_id_paginated` 函数，添加固定过滤条件（`write_off_id` 为 NULL）
- [x] 2.2 实现时间范围过滤逻辑（支持开始时间、结束时间单独或组合使用）
- [x] 2.3 实现记账类型过滤逻辑
- [x] 2.4 实现记账渠道过滤逻辑
- [x] 2.5 实现记录状态过滤逻辑
- [x] 2.6 实现批量查询关联记录数量的逻辑
- [x] 2.7 将关联记录数量注入到每条记录的返回数据中
- [x] 2.8 更新函数返回类型，使用 `PaginatedResponse<RecordWithCountDto>`

## 3. 冲账关联记录查询功能

- [x] 3.1 新增 `get_write_off_records_by_id` 服务函数
- [x] 3.2 实现根据记录 ID 查询关联记录的逻辑（通过 `write_off_id` 字段）
- [x] 3.3 实现查询结果按创建时间倒序排列

## 4. Tauri 命令更新

- [x] 4.1 更新 `get_records_by_book_id_paginated` 命令，传递新的过滤参数
- [x] 4.2 新增 `get_write_off_records_by_id` Tauri 命令（如需要）
