## 1. 数据库实体层

- [x] 1.1 创建 accounting_book_seq 实体文件（src-tauri/src/entity/accounting_book_seq.rs）
- [x] 1.2 实现 get_next_sequence 方法获取账本流水号
- [x] 1.3 创建 accounting_book 实体文件（src-tauri/src/entity/accounting_book.rs）
- [x] 1.4 实现 generate_id 方法生成 yyyyxxxx 格式账本 ID
- [x] 1.5 在 accounting_book 实体中实现 ActiveModelBehavior
- [x] 1.6 在 accounting_book 实体中添加 Relation（如果有需要）
- [x] 1.7 修改 accounting_record 实体，添加 book_id 字段
- [x] 1.8 在 accounting_record 实体中添加到 accounting_book 的关联关系
- [x] 1.9 在 entity/mod.rs 中注册新实体（accounting_book、accounting_book_seq）

## 2. 数据库初始化

- [x] 2.1 在 lib.rs 中导入 accounting_book 相关模块
- [x] 2.2 创建 create_default_book 函数，插入默认账本（id=10000001）
- [x] 2.3 在数据库初始化后调用 create_default_book 函数
- [x] 2.4 添加重复插入检测逻辑，避免重复创建默认账本

## 3. 服务层实现

- [x] 3.1 创建 accounting_book_service.rs 文件
- [x] 3.2 实现 create_book 方法（创建账本）
- [x] 3.3 实现 get_books 方法（查询所有账本）
- [x] 3.4 实现 get_book_by_id 方法（查询单个账本）
- [x] 3.5 实现 update_book_title 方法（修改账本标题）
- [x] 3.6 实现 delete_book 方法（删除账本并迁移记录）
- [x] 3.7 实现 get_records_by_book_id 方法（查询账本下的记录）
- [x] 3.8 在 services/mod.rs 中导出 accounting_book_service
- [x] 3.9 实现 get_books_paginated 方法（分页查询账本列表）
- [x] 3.10 实现 get_records_by_book_id_paginated 方法（分页查询账本下的记录）

## 4. 命令层实现

- [x] 4.1 在 commands/mod.rs 中添加 accounting_book 模块
- [x] 4.2 创建 accounting_book.rs 命令文件
- [x] 4.3 实现 create_book Tauri 命令
- [x] 4.4 实现 get_books Tauri 命令
- [x] 4.5 实现 get_book_by_id Tauri 命令
- [x] 4.6 实现 update_book_title Tauri 命令
- [x] 4.7 实现 delete_book Tauri 命令
- [x] 4.8 实现 get_records_by_book_id Tauri 命令
- [x] 4.9 在 with_install_tauri_commands 中注册账本相关命令
- [x] 4.10 实现 get_books_paginated Tauri 命令
- [x] 4.11 实现 get_records_by_book_id_paginated Tauri 命令

## 5. 测试与验证

- [x] 5.1 测试默认账本初始化功能
- [x] 5.2 测试账本 ID 生成规则（跨年、同年多个账本）
- [x] 5.3 测试账本 CRUD 功能
- [x] 5.4 测试删除账本时的记录迁移
- [x] 5.5 测试删除默认账本的保护机制
- [x] 5.6 测试记账记录与账本的关联关系
