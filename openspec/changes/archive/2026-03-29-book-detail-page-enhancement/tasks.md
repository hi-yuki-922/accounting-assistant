## 1. 数据模型和枚举扩展

- [x] 1.1 在后端 AccountingType 枚举中添加 WriteOff 变体
  - 文件：`src-tauri/src/enums/accounting.rs`
  - 任务：添加 `WriteOff` 变量，实现 SeaORM 转换 trait

- [x] 1.2 在前端 AccountingType 枚举中添加 WriteOff 类型
  - 文件：`src/api/commands/accounting/enums.ts`
  - 任务：添加 `WriteOff: 'WriteOff'` 和对应的显示文本映射

## 2. 后端 DTO 结构扩展

- [x] 2.1 扩展 RecordWithCountDto 结构
  - 文件：`src-tauri/src/services/accounting_book/dto/mod.rs`
  - 任务：添加 `original_amount` 和 `net_amount` 字段

- [x] 2.2 新增 WriteOffRecordDto 结构
  - 文件：`src-tauri/src/services/accounting_book/dto/mod.rs`
  - 任务：创建冲账记录 DTO，包含 id、amount、record_time、remark、channel 字段

- [x] 2.3 新增 RecordWriteOffDetailsDto 结构
  - 文件：`src-tauri/src/services/accounting_book/dto/mod.rs`
  - 任务：创建 HoverCard 数据 DTO，包含 original_amount 和 write_off_records

## 3. 后端服务层实现

- [x] 3.1 新增删除记账记录方法
  - 文件：`src-tauri/src/services/accounting/mod.rs`
  - 任务：实现 `delete_record` 方法，支持删除未入账记录并更新账本记录数

- [x] 3.2 新增批量入账方法
  - 文件：`src-tauri/src/services/accounting/mod.rs`
  - 任务：实现 `batch_post_records` 方法，包含预验证和事务处理

- [x] 3.3 新增冲账记录创建方法
  - 文件：`src-tauri/src/services/accounting/mod.rs`
  - 任务：实现 `create_write_off_record` 方法，支持创建 WriteOff 类型记录

- [x] 3.4 优化查询接口使用 JOIN
  - 文件：`src-tauri/src/services/accounting_book/mod.rs`
  - 任务：修改 `get_records_by_book_id_paginated` 方法，使用批量聚合查询优化

- [x] 3.5 新增 HoverCard 数据查询方法
  - 文件：`src-tauri/src/services/accounting_book/mod.rs`
  - 任务：实现 `get_record_write_off_details` 方法，查询原始金额和冲账记录详情

## 4. 后端命令层实现

- [x] 4.1 新增删除记账记录命令
  - 文件：`src-tauri/src/commands/accounting.rs`
  - 任务：添加 `delete_accounting_record` Tauri 命令

- [x] 4.2 新增批量入账命令
  - 文件：`src-tauri/src/commands/accounting.rs`
  - 任务：添加 `batch_post_accounting_records` Tauri 命令

- [x] 4.3 新增 HoverCard 数据查询命令
  - 文件：`src-tauri/src/commands/accounting_book.rs`
  - 任务：添加 `get_record_write_off_details` Tauri 命令

- [x] 4.4 注册新命令到 Tauri
  - 文件：`src-tauri/src/commands/mod.rs`
  - 任务：注册所有新增的 Tauri 命令

## 5. 前端类型定义扩展

- [x] 5.1 扩展 RecordWithCountDto 类型
  - 文件：`src/api/commands/accounting-book/type.ts`
  - 任务：添加 `originalAmount` 和 `netAmount` 字段

- [x] 5.2 新增 WriteOffRecord 类型
  - 文件：`src/api/commands/accounting-book/type.ts`
  - 任务：创建 WriteOffRecord 类型定义

- [x] 5.3 新增 RecordWriteOffDetails 类型
  - 文件：`src/api/commands/accounting-book/type.ts`
  - 任务：创建 RecordWriteOffDetails 类型定义

## 6. 前端 API 层实现

- [x] 6.1 新增删除记账记录 API 方法
  - 文件：`src/api/commands/accounting/index.ts`
  - 任务：实现 `deleteAccountingRecord` 方法，调用后端删除命令

- [x] 6.2 新增批量入账 API 方法
  - 文件：`src/api/commands/accounting/index.ts`
  - 任务：实现 `batchPostAccountingRecords` 方法，调用后端批量入账命令

- [x] 6.3 新增 HoverCard 数据查询 API 方法
  - 文件：`src/api/commands/accounting-book/index.ts`
  - 任务：实现 `getRecordWriteOffDetails` 方法，调用后端查询命令

## 7. 前端页面组件实现

- [x] 7.1 添加"记一笔"按钮到账本详情页
  - 文件：`src/pages/books/book-detail-page.tsx`
  - 任务：在页面头部添加"记一笔"按钮，控制对话框状态

- [x] 7.2 添加批量入账按钮到账本详情页
  - 文件：`src/pages/books/book-detail-page.tsx`
  - 任务：在页面头部添加批量入账按钮，根据选中状态控制

- [x] 7.3 实现表格排序功能
  - 文件：`src/pages/books/book-detail-page.tsx`
  - 任务：添加排序状态管理，支持点击表头排序

## 8. 列表组件功能扩展

- [x] 8.1 添加复选框到列表表格
  - 文件：`src/pages/books/components/record-list-table.tsx`
  - 任务：为每条记录添加复选框，实现选中状态管理

- [x] 8.2 添加操作按钮到列表表格
  - 文件：`src/pages/books/components/record-list-table.tsx`
  - 任务：根据记录状态显示编辑、删除、入账、冲账按钮

- [x] 8.3 实现表头排序交互
  - 文件：`src/pages/books/components/record-list-table.tsx`
  - 任务：为支持排序的字段添加点击事件和排序图标显示

- [x] 8.4 实现净金额显示和特殊标记
  - 文件：`src/pages/books/components/record-list-table.tsx`
  - 任务：实现净金额显示，净金额为 0 时使用灰色标记

- [x] 8.5 实现 HoverCard 组件
  - 文件：`src/pages/books/components/record-list-table.tsx`
  - 任务：创建 HoverCard 组件，支持按需加载和数据缓存

## 9. 对话框组件实现

- [x] 9.1 创建"记一笔"对话框组件
  - 文件：`src/pages/books/components/add-record-dialog.tsx`
  - 任务：实现完整的记账表单，包含标题、金额、类型、时间、渠道、备注

- [x] 9.2 创建编辑记录对话框组件
  - 文件：`src/pages/books/components/edit-record-dialog.tsx`
  - 任务：实现编辑表单，支持修改记录信息

- [x] 9.3 创建冲账对话框组件
  - 文件：`src/pages/books/components/write-off-dialog.tsx`
  - 任务：实现冲账表单，金额验证，渠道和时间默认值

- [x] 9.4 创建批量入账确认对话框组件
  - 文件：`src/pages/books/components/batch-post-confirm-dialog.tsx`
  - 任务：实现批量操作确认，显示选中记录信息

- [x] 9.5 创建删除确认对话框组件
  - 文件：`src/pages/books/components/delete-record-confirm-dialog.tsx`
  - 任务：实现删除确认，显示记录信息和警告

## 10. 日期时间选择器实现

- [x] 10.1 实现日期选择器
  - 文件：集成到对话框组件
  - 任务：使用 Calendar + Popover 组件，支持日期选择

- [x] 10.2 实现时间输入框
  - 文件：集成到对话框组件
  - 任务：使用 Input 组件，type="time"，支持时间输入

- [x] 10.3 实现默认时间设置
  - 文件：集成到对话框组件
  - 任务：在对话框打开时设置默认时间为当前时间

## 11. 数据刷新和状态管理

- [x] 11.1 实现智能刷新策略
  - 文件：`src/pages/books/book-detail-page.tsx`
  - 任务：根据操作类型选择不同的刷新策略

- [x] 11.2 实现复选框状态管理
  - 文件：`src/pages/books/book-detail-page.tsx`
  - 任务：管理选中记录列表，控制按钮状态

- [x] 11.3 实现 HoverCard 数据缓存
  - 文件：`src/pages/books/components/record-list-table.tsx`
  - 任务：实现 Map 缓存，记录刷新时清理

## 12. 错误处理和用户反馈

- [x] 12.1 实现前端表单验证
  - 文件：各个对话框组件
  - 任务：添加金额验证、必填字段验证、格式验证

- [x] 12.2 实现错误提示
  - 文件：各个对话框和页面组件
  - 任务：使用 Sonner 显示成功、错误、警告提示

- [x] 12.3 实现加载状态显示
  - 文件：各个组件
  - 任务：添加加载状态，提供明确的用户反馈

## 13. 样式和主题适配

- [x] 13.1 实现净金额特殊标记样式
  - 文件：`src/pages/books/components/record-list-table.tsx`
  - 任务：净金额为 0 时使用灰色文字标记

- [x] 13.2 实现 HoverCard 样式
  - 文件：`src/pages/books/components/record-list-table.tsx`
  - 任务：设计清晰的布局，支持暗色主题

- [x] 13.3 实现复选框禁用样式
  - 文件：`src/pages/books/components/record-list-table.tsx`
  - 任务：已入账记录的复选框显示为灰色不可点击样式

## 14. 测试和验证

- [x] 14.1 编写后端单元测试
  - 文件：`src-tauri/src/services/` 测试目录
  - 任务：为新增的服务方法编写单元测试

- [x] 14.2 进行端到端功能测试
  - 任务：手动测试所有新增功能，确保符合规范要求

- [x] 14.3 验证数据一致性
  - 任务：测试各种操作后数据的正确性，包括账本记录数更新