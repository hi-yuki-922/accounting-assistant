## ADDED Requirements

### Requirement: Create accounting book
系统 MUST 提供创建账本功能，支持用户创建自定义账本。

#### Scenario: Successfully create book
- **WHEN** 调用创建账本服务
- **WHEN** 提供有效的账本标题
- **THEN** 系统 MUST 自动生成唯一的账本 ID
- **THEN** 系统 MUST 创建账本记录
- **THEN** 系统 MUST 设置创建时间为当前时间
- **THEN** 系统 MUST 返回创建的账本模型

#### Scenario: Create book with empty title
- **WHEN** 调用创建账本服务
- **WHEN** 提供空的账本标题
- **THEN** 系统 MUST 返回错误
- **THEN** 错误信息 MUST 说明标题不能为空

#### Scenario: Create book with whitespace title
- **WHEN** 调用创建账本服务
- **WHEN** 提供仅包含空格的账本标题
- **THEN** 系统 MUST 返回错误
- **THEN** 错误信息 MUST 说明标题不能为空

### Requirement: Get all books
系统 MUST 提供查询所有账本功能。

#### Scenario: Get all books
- **WHEN** 调用查询所有账本服务
- **THEN** 系统 MUST 返回所有账本列表
- **THEN** 结果 MUST 包含账本 ID、标题、创建时间

### Requirement: Get book by ID
系统 MUST 提供根据 ID 查询单个账本功能。

#### Scenario: Successfully get book by ID
- **WHEN** 调用根据 ID 查询账本服务
- **WHEN** 提供有效的账本 ID
- **THEN** 系统 MUST 返回对应的账本
- **THEN** 返回的账本 MUST 包含所有字段

#### Scenario: Get non-existent book
- **WHEN** 调用根据 ID 查询账本服务
- **WHEN** 提供不存在的账本 ID
- **THEN** 系统 MUST 返回 None

### Requirement: Update book title
系统 MUST 提供修改账本标题功能。

#### Scenario: Successfully update book title
- **WHEN** 调用修改账本标题服务
- **WHEN** 提供有效的账本 ID 和新标题
- **THEN** 系统 MUST 更新账本标题
- **THEN** 系统 MUST 返回更新后的账本
- **THEN** 其他字段 MUST 保持不变

#### Scenario: Update book title with empty title
- **WHEN** 调用修改账本标题服务
- **WHEN** 提供空的新标题
- **THEN** 系统 MUST 返回错误
- **THEN** 错误信息 MUST 说明标题不能为空

#### Scenario: Update non-existent book title
- **WHEN** 调用修改账本标题服务
- **WHEN** 提供不存在的账本 ID
- **THEN** 系统 MUST 返回 None

### Requirement: Delete book
系统 MUST 提供删除账本功能，将关联记录迁移到默认账本。

#### Scenario: Successfully delete book
- **WHEN** 调用删除账本服务
- **WHEN** 提供有效的账本 ID
- **WHEN** 账本不是默认账本
- **THEN** 系统 MUST 将该账本的所有记录迁移到默认账本
- **THEN** 系统 MUST 删除账本记录
- **THEN** 系统 MUST 返回 true
- **THEN** 操作 MUST 在事务中执行，确保数据一致性

#### Scenario: Delete non-existent book
- **WHEN** 调用删除账本服务
- **WHEN** 提供不存在的账本 ID
- **THEN** 系统 MUST 返回 false
- **THEN** 系统 MUST 不执行任何数据库操作

#### Scenario: Delete default book
- **WHEN** 调用删除账本服务
- **WHEN** 提供默认账本 ID (10000001)
- **THEN** 系统 MUST 返回错误
- **THEN** 错误信息 MUST 说明默认账本不能删除
- **THEN** 系统 MUST 不执行删除操作

#### Scenario: Delete book migrates records
- **WHEN** 删除账本
- **WHEN** 该账本包含记账记录
- **THEN** 所有记录的 book_id MUST 更新为默认账本 ID
- **THEN** 记录的其他字段 MUST 保持不变

### Requirement: Get records by book ID
系统 MUST 提供查询指定账本下所有记录的功能。

#### Scenario: Get records by book ID
- **WHEN** 调用查询账本记录服务
- **WHEN** 提供有效的账本 ID
- **THEN** 系统 MUST 返回该账本下的所有记账记录
- **THEN** 结果 MUST 按记录时间倒序排列

### Requirement: Get uncategorized records
系统 MUST 提供查询未归类账目功能，包含 NULL 和默认账本的记录。

#### Scenario: Get uncategorized records
- **WHEN** 调用查询未归类账目服务
- **THEN** 系统 MUST 返回 book_id 为 NULL 的记录
- **THEN** 系统 MUST 返回 book_id 为默认账本的记录
- **THEN** 两种情况的记录 MUST 合并返回

### Requirement: Get books paginated
系统 MUST 提供分页查询账本列表功能。

#### Scenario: Get first page of books
- **WHEN** 调用分页查询账本服务
- **WHEN** 提供页码为 1
- **WHEN** 提供每页数量
- **THEN** 系统 MUST 返回第一页的账本列表
- **THEN** 系统 MUST 返回总数量
- **THEN** 系统 MUST 返回当前页码
- **THEN** 系统 MUST 返回每页数量
- **THEN** 系统 MUST 返回总页数
- **THEN** 结果 MUST 按创建时间倒序排列

#### Scenario: Get second page of books
- **WHEN** 调用分页查询账本服务
- **WHEN** 提供页码为 2
- **THEN** 系统 MUST 返回第二页的账本列表
- **THEN** 返回的记录 MUST 与第一页不同

#### Scenario: Get books with invalid page
- **WHEN** 调用分页查询账本服务
- **WHEN** 提供页码为 0
- **THEN** 系统 MUST 将页码自动纠正为 1
- **THEN** 系统 MUST 返回第一页的数据

#### Scenario: Get books beyond total pages
- **WHEN** 调用分页查询账本服务
- **WHEN** 提供超出总页数的页码
- **THEN** 系统 MUST 返回空的数据列表
- **THEN** 总数量 MUST 仍为实际总数

#### Scenario: Calculate total pages correctly
- **WHEN** 总数量为 25，每页数量为 10
- **THEN** 总页数 MUST 为 3
- **THEN** 最后一页 MUST 包含 5 条记录

### Requirement: Get records by book ID paginated
系统 MUST 提供分页查询指定账本下记账记录功能，支持多种筛选条件。

#### Scenario: Get records by book ID paginated
- **WHEN** 调用分页查询记录服务
- **WHEN** 提供有效的账本 ID
- **WHEN** 提供页码和每页数量
- **THEN** 系统 MUST 返回指定页的记录列表
- **THEN** 系统 MUST 返回分页元数据（总数、页码、每页数量、总页数）
- **THEN** 结果 MUST 按记录时间倒序排列
- **THEN** 每条记录 MUST 包含关联记录数量

#### Scenario: Get records for default book includes null book_id
- **WHEN** 调用分页查询记录服务
- **WHEN** 账本 ID 为默认账本 ID (10000001)
- **THEN** 系统 MUST 返回 book_id 为默认账本的记录
- **THEN** 系统 MUST 返回 book_id 为 NULL 的记录
- **THEN** 两种情况的记录 MUST 合并返回

#### Scenario: Filter records by time range
- **WHEN** 调用分页查询记录服务
- **WHEN** 提供开始时间
- **WHEN** 提供结束时间
- **THEN** 系统 MUST 返回记录时间在范围内的记录
- **THEN** 时间范围 MUST 包含边界值

#### Scenario: Filter records by accounting type
- **WHEN** 调用分页查询记录服务
- **WHEN** 提供记账类型
- **THEN** 系统 MUST 仅返回指定类型的记录

#### Scenario: Filter records by channel
- **WHEN** 调用分页查询记录服务
- **WHEN** 提供记账渠道
- **THEN** 系统 MUST 仅返回指定渠道的记录

#### Scenario: Filter records by state
- **WHEN** 调用分页查询记录服务
- **WHEN** 提供记录状态
- **THEN** 系统 MUST 仅返回指定状态的记录

#### Scenario: Only show non-write-off records
- **WHEN** 调用分页查询记录服务
- **THEN** 系统 MUST 仅返回 write_off_id 为 NULL 的记录
- **THEN** 冲账关联记录 MUST 不在主查询结果中显示

#### Scenario: Include related record count
- **WHEN** 调用分页查询记录服务
- **THEN** 每条记录 MUST 包含关联记录数量
- **THEN** 关联记录数量 MUST 通过 write_off_id 关联统计
- **THEN** 没有关联记录的数量 MUST 为 0

#### Scenario: Query non-existent book
- **WHEN** 调用分页查询记录服务
- **WHEN** 提供不存在的账本 ID
- **THEN** 系统 MUST 返回错误
- **THEN** 错误信息 MUST 说明账本不存在

#### Scenario: Handle invalid page number
- **WHEN** 调用分页查询记录服务
- **WHEN** 提供页码为 0
- **THEN** 系统 MUST 将页码自动纠正为 1

#### Scenario: Handle page beyond total
- **WHEN** 调用分页查询记录服务
- **WHEN** 提供超出总页数的页码
- **THEN** 系统 MUST 返回空的数据列表

### Requirement: Get write-off records by ID
系统 MUST 提供根据记录 ID 查询冲账关联记录功能。

#### Scenario: Get write-off records by ID
- **WHEN** 调用查询冲账关联记录服务
- **WHEN** 提供有效的记录 ID
- **THEN** 系统 MUST 返回所有 write_off_id 等于给定 ID 的记录
- **THEN** 结果 MUST 按创建时间倒序排列
- **THEN** 系统 MUST 返回关联记录的完整信息

#### Scenario: Get write-off records for record with no relations
- **WHEN** 调用查询冲账关联记录服务
- **WHEN** 提供没有冲账关联的记录 ID
- **THEN** 系统 MUST 返回空的记录列表

### Requirement: Create default book
系统 MUST 提供创建默认账本（未归类账目）功能。

#### Scenario: Create default book when not exists
- **WHEN** 调用创建默认账本服务
- **WHEN** 默认账本不存在
- **THEN** 系统 MUST 创建 ID 为 10000001 的账本
- **THEN** 账本标题 MUST 为"未归类账目"
- **THEN** 创建时间 MUST 为 2000-01-01 00:00:00
- **THEN** 系统 MUST 返回成功

#### Scenario: Skip default book creation when exists
- **WHEN** 调用创建默认账本服务
- **WHEN** 默认账本已存在
- **THEN** 系统 MUST 不创建新账本
- **THEN** 系统 MUST 返回成功
- **THEN** 系统 MUST 打印提示信息

### Requirement: Service class implementation
账本服务 MUST 采用服务类模式实现，持有数据库连接。

#### Scenario: AccountingBookService constructor
- **WHEN** 创建 AccountingBookService 实例
- **THEN** 服务 MUST 接收 DatabaseConnection 作为构造参数
- **THEN** 服务 MUST 存储数据库连接引用
- **THEN** 后续方法调用 MUST 使用该数据库连接

#### Scenario: AccountingBookService methods use instance database
- **WHEN** 调用 AccountingBookService 的任何方法
- **THEN** 方法 MUST 使用实例持有的数据库连接
- **THEN** 方法内部 MUST 不调用 `connection::get_or_init_db()`
- **THEN** 方法 MUST 不持有数据库连接的所有权

### Requirement: Transaction handling
删除账本操作 MUST 在事务中执行，确保数据一致性。

#### Scenario: Transaction success
- **WHEN** 删除账本成功
- **THEN** 记录迁移 MUST 成功
- **THEN** 账本删除 MUST 成功
- **THEN** 事务 MUST 提交

#### Scenario: Transaction failure
- **WHEN** 删除账本过程中发生错误
- **THEN** 事务 MUST 回滚
- **THEN** 数据库状态 MUST 保持不变
- **THEN** 系统 MUST 返回错误
