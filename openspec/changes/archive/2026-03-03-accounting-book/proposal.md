## Why

当前记账系统仅支持单一全局记录存储，无法区分不同账本。用户希望将记账记录按账本分类管理（如个人账本、工作账本、家庭账本等），并支持账本的创建、修改和删除操作。

## What Changes

- **新增实体**: 创建 `AccountingBook` 实体（id, title, create_at）
- **默认账本**: 数据库初始化时创建特殊默认账本（id=10000001, title="未归类账目"）
- **ID 生成规则**: 普通账本使用 yyyyxxxx 格式（年份+四位流水号）
- **CRUD 功能**: 实现账本的创建、查询、修改、删除
- **修改限制**: 账本仅允许修改 title 字段
- **删除迁移**: 删除账本时，关联记录移至未归类账目
- **关联关系**: 在 `AccountingRecord` 实体添加 `book_id` 字段，建立一对多关系
- **序列表**: 新建 `accounting_book_seq` 表用于账本流水号管理

## Capabilities

### New Capabilities
- `accounting-book-entity`: 账本实体定义、默认账本初始化、ID 生成规则
- `accounting-book-crud`: 账本的创建、查询、修改、删除功能，分页查询账本列表
- `accounting-book-relation`: 账本与记账记录的关联关系、删除迁移逻辑、分页查询账本中的记账记录

### Modified Capabilities
- `accounting-record-entity`: 添加 book_id 字段建立账本关联

## Impact

- **数据库**: 新增 `accounting_book` 和 `accounting_book_seq` 表，`accounting_record` 表添加 `book_id` 列
- **实体层**: 新增 `accounting_book.rs` 和 `accounting_book_seq.rs`，修改 `accounting_record.rs`
- **服务层**: 新增账本服务（AccountingBookService），包括分页查询方法
- **命令层**: 新增账本相关的 Tauri IPC 命令，包括分页查询命令
- **迁移**: 删除账本时需要批量更新关联记录的 book_id
- **分页**: 分页查询使用 page（页码）和 page_size（每页数量）参数，返回完整的分页元数据
