## Why

当前账本详情页仅支持检索和展示账本的记账记录，缺少完整的记账记录管理功能。用户无法在账本详情页进行记账、编辑、删除和冲账等核心操作，需要切换到其他页面或通过其他途径完成这些任务，降低了记账效率和用户体验。此外，现有的数据结构不支持净金额显示和冲账详情的快速查看，影响了财务数据的准确性和可追溯性。

## What Changes

### 核心功能增强

- **"记一笔"功能**：在账本详情页顶部添加"记一笔"按钮，打开对话框后用户可以在当前账本下快速添加新的记账记录，支持输入标题、金额、记账类型、记录时间、渠道、备注等信息，记账金额必须大于零的正数
- **编辑未入账记录**：在列表中为状态为"待入账"的记录提供编辑按钮，点击后打开对话框修改记录信息，仅允许修改未入账状态的记录
- **删除未入账记录**：在列表中为状态为"待入账"的记录提供删除按钮，点击后删除记录并更新账本记录数，仅允许删除未入账状态的记录
- **单条入账功能**：在列表中为状态为"待入账"的记录提供入账按钮，点击后将记录状态从"待入账"改为"已入账"
- **批量入账功能**：在列表中添加复选框，用户可勾选多条"待入账"记录进行批量入账，支持前端限制（仅待入账记录可勾选）和后端预验证（全部成功或全部失败），包含确认对话框
- **冲账功能**：在列表中为状态为"已入账"的记录提供冲账按钮，点击后打开冲账对话框，创建新的冲账记录关联到原记录，记账类型固定为 WriteOff，记录状态固定为已入账，冲账金额支持正负数，冲账金额与原始金额的总和不能小于 0，不可对冲账记录再次冲账

### 数据结构扩展

- **新增 WriteOff 记账类型**：扩展 AccountingType 枚举，新增 WriteOff 类型，支持前端显示和后端存储
- **扩展查询接口数据结构**：修改 `RecordWithCountDto`，添加 `original_amount`（原始金额）和 `write_off_records`（冲账记录列表）字段
- **优化主查询性能**：使用 SQL JOIN 优化 `get_records_by_book_id_paginated` 接口，一次性获取原始记录和冲账数据，计算并返回净金额
- **新增 HoverCard 数据查询接口**：新增 `get_record_write_off_details` 接口，按需查询记录的原始金额和冲账记录详情，避免一次性加载过多数据

### 前端交互优化

- **HoverCard 展示冲账详情**：在列表中为有冲账关联的记录金额添加下划线样式，用户 hover 金额时显示 HoverCard，展示原始记录金额和所有冲账记录列表，包含净合计显示，支持按需加载和缓存策略
- **净金额特殊标记**：当净金额为 0 时，使用灰色文字标记，提供视觉区分
- **表格排序功能**：支持点击表头进行排序，支持的字段包括时间、类型、金额、渠道、状态、关联数，金额排序基于净金额，默认按时间降序排序
- **数据刷新策略**：添加/删除/批量入账后跳转到第一页并刷新列表，编辑/冲账后保留当前页和筛选条件并刷新列表，批量入账后默认折叠所有展开行并取消所有复选框
- **日期时间选择器**：使用 shadcn 的 DatePicker 选择日期，Input 输入时间，时间默认取当前时间并可由用户修改

### 约束和验证

- **记账金额验证**："记一笔"时记账金额必须大于零的正数，前端提供 `min={0.01} step={0.01}` 验证，后端进行二次验证
- **冲账金额验证**：添加冲账记录时验证冲账金额与原始金额的总和不能小于 0，前端提供实时验证，后端进行二次验证和冲账记录查询
- **状态权限控制**：前端 UI 根据记录状态控制操作按钮显示（编辑/删除仅对未入账记录显示，冲账仅对已入账记录显示），后端进行状态检查和权限验证
- **批量操作验证**：前端限制复选框（仅待入账记录可勾选），后端预验证（所有记录必须存在且状态为待入账），事务保证原子性（全部成功或全部失败）

## Capabilities

### New Capabilities

- `book-detail-page-management`: 账本详情页的记账记录管理功能，包括"记一笔"、编辑未入账记录、删除未入账记录、单条入账、批量入账等核心操作
- `hover-card-display`: HoverCard 显示冲账详情功能，支持按需加载、数据缓存、净金额特殊标记等交互优化
- `batch-post-records`: 批量入账功能，支持前端复选框限制、后端预验证、事务原子性保证、确认对话框等
- `accounting-record-deletion`: 删除记账记录功能，支持删除未入账记录、更新账本记录数、状态权限控制等

### Modified Capabilities

- `accounting-service`: 扩展记账服务，添加删除记账记录的方法，支持删除未入账记录并更新账本记录数，后端状态检查和权限验证
- `write-off-records`: 扩展冲账记录规范，添加创建冲账记录的详细业务规则，包括金额验证、状态固定、渠道继承、时间默认等约束

## Impact

### 后端影响

- **枚举类型**：`src-tauri/src/enums/accounting.rs`，添加 WriteOff 变体
- **数据模型**：`src-tauri/src/entity/accounting_record.rs`，支持 WriteOff 类型
- **DTO 结构**：`src-tauri/src/services/accounting_book/dto/mod.rs`，扩展 RecordWithCountDto，添加 WriteOffRecordDto 和 RecordWriteOffDetailsDto
- **服务层**：`src-tauri/src/services/accounting_book/mod.rs`，新增 `get_record_write_off_details` 方法，优化 `get_records_by_book_id_paginated` 方法
- **服务层**：`src-tauri/src/services/accounting/mod.rs`，新增 `delete_record` 方法，扩展 `batch_post_records` 方法
- **命令层**：`src-tauri/src/commands/accounting.rs`，新增 `delete_accounting_record` 命令
- **命令层**：`src-tauri/src/commands/accounting_book.rs`，新增 `get_record_write_off_details` 命令

### 前端影响

- **类型定义**：`src/api/commands/accounting/enums.ts`，添加 WriteOff 类型和显示文本
- **类型定义**：`src/api/commands/accounting-book/type.ts`，扩展 RecordWithCountDto，添加 WriteOffRecord 和 RecordWriteOffDetails 类型
- **API 层**：`src/api/commands/accounting/index.ts`，新增 `deleteAccountingRecord` 方法
- **API 层**：`src/api/commands/accounting-book/index.ts`，新增 `getRecordWriteOffDetails` 方法
- **页面组件**：`src/pages/books/book-detail-page.tsx`，添加"记一笔"按钮、批量入账按钮、表格排序逻辑
- **列表组件**：`src/pages/books/components/record-list-table.tsx`，添加复选框、HoverCard、操作按钮、排序交互
- **对话框组件**：新增 `src/pages/books/components/add-record-dialog.tsx`，实现"记一笔"对话框
- **对话框组件**：新增 `src/pages/books/components/edit-record-dialog.tsx`，实现编辑记录对话框
- **对话框组件**：新增 `src/pages/books/components/write-off-dialog.tsx`，实现冲账对话框
- **对话框组件**：新增 `src/pages/books/components/batch-post-confirm-dialog.tsx`，实现批量入账确认对话框
- **对话框组件**：新增 `src/pages/books/components/delete-record-confirm-dialog.tsx`，实现删除确认对话框

### 兼容性

- **BREAKING**：前端 `RecordWithCountDto` 类型结构扩展，所有使用该类型的组件需要相应调整
- **BREAKING**：后端 `get_records_by_book_id_paginated` 接口返回数据结构变更，前端需要适配新的 `original_amount` 和 `write_off_records` 字段
- **向后兼容**：保留现有的 `modify_accounting_record` 和 `post_accounting_record` 命令，不影响现有功能
