## ADDED Requirements

### Requirement: 账本与记账记录一对多关系
系统 SHALL 建立账本（AccountingBook）与记账记录（AccountingRecord）之间的一对多关系，一个账本可以包含多条记账记录，一条记账记录只能属于一个账本。

#### Scenario: 关系定义验证
- **WHEN** 定义账本与记账记录的关系
- **THEN** 一个账本可以关联多条记账记录
- **AND** 一条记账记录只能关联一个账本

### Requirement: 账本删除时记录迁移
系统 SHALL 在删除账本时，通过数据库事务确保记录迁移的原子性，将所有关联记录的 book_id 更新为默认账本 ID（10000001）。

#### Scenario: 事务内记录迁移
- **WHEN** 用户删除账本
- **THEN** 系统启动数据库事务
- **AND** 查找所有 book_id 等于待删除账本 ID 的记录
- **AND** 将这些记录的 book_id 更新为 10000001
- **AND** 删除账本记录
- **AND** 提交事务

#### Scenario: 迁移失败回滚
- **WHEN** 记录迁移过程中发生错误
- **THEN** 系统回滚事务
- **AND** 账本不被删除
- **AND** 记录的 book_id 保持不变
- **AND** 返回错误提示

### Requirement: 查询账本关联记录
系统 SHALL 支持查询指定账本下的所有记账记录。

#### Scenario: 查询账本所有记录
- **WHEN** 用户请求查询某个账本的所有记录
- **THEN** 系统返回 book_id 等于该账本 ID 的所有记账记录
- **AND** 按记录时间倒序排列

#### Scenario: 查询未归类账目记录
- **WHEN** 用户查询未归类账目（id=10000001）
- **THEN** 系统返回 book_id 为 10000001 或 NULL 的所有记录

### Requirement: 分页查询账本中的记账记录
系统 SHALL 支持分页查询指定账本中的记账记录，用户可指定账本 ID、页码（page）和每页数量（page_size），系统返回对应的记账记录数据及分页信息。

#### Scenario: 查询账本记录第一页
- **WHEN** 用户请求分页查询账本记录，book_id=20240001, page=1, page_size=20
- **THEN** 系统返回该账本第 1-20 条记账记录
- **AND** 返回 total（该账本的总记录数）
- **AND** 返回 page（当前页码）
- **AND** 返回 page_size（每页数量）
- **AND** 返回 total_pages（总页数）
- **AND** 按记录时间倒序排列

#### Scenario: 查询账本记录第二页
- **WHEN** 用户请求分页查询账本记录，book_id=20240001, page=2, page_size=20
- **THEN** 系统返回该账本第 21-40 条记账记录
- **AND** 返回完整的分页信息

#### Scenario: 查询空账本记录
- **WHEN** 用户请求分页查询账本记录，book_id=20240002, page=1, page_size=20
- **THEN** 系统返回空数据列表
- **AND** total 为 0
- **AND** total_pages 为 0

#### Scenario: 查询未归类账目记录（分页）
- **WHEN** 用户请求分页查询未归类账目，book_id=10000001, page=1, page_size=20
- **THEN** 系统返回 book_id 为 10000001 或 NULL 的记录
- **AND** 返回完整的分页信息

#### Scenario: 账本不存在
- **WHEN** 用户请求分页查询账本记录，book_id=99999999（不存在）
- **THEN** 系统返回错误提示账本不存在
- **AND** 返回空数据列表

### Requirement: 新建记录关联账本
系统 SHALL 在创建记账记录时，允许用户指定关联的账本 ID。

#### Scenario: 创建记录时指定账本
- **WHEN** 用户创建记账记录并指定 book_id
- **THEN** 系统将记录的 book_id 设置为指定值
- **AND** 记录成功创建

#### Scenario: 未指定账本的记录
- **WHEN** 用户创建记账记录未指定 book_id
- **THEN** 系统将记录的 book_id 设置为 NULL
- **AND** 记录成功创建

### Requirement: 记录修改限制
系统 SHALL 允许用户修改记录的 book_id，将记录从一个账本移动到另一个账本。

#### Scenario: 修改记录所属账本
- **WHEN** 用户修改记录的 book_id
- **THEN** 系统将记录关联到新账本
- **AND** 不影响记录的其他字段
