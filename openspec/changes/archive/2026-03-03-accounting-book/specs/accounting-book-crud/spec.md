## ADDED Requirements

### Requirement: 创建账本
系统 SHALL 允许用户创建新账本，title 为必填字段，ID 自动按 yyyyxxxx 格式生成。

#### Scenario: 成功创建账本
- **WHEN** 用户提交创建账本请求，title 为"个人账本"
- **THEN** 系统生成符合规则的账本 ID
- **AND** title 设置为"个人账本"
- **AND** create_at 设置为当前时间
- **AND** 返回创建成功的账本信息

#### Scenario: 空标题创建
- **WHEN** 用户提交创建账本请求，title 为空字符串
- **THEN** 系统拒绝创建请求
- **AND** 返回错误提示标题不能为空

### Requirement: 查询账本列表
系统 SHALL 允许用户查询所有账本列表，包括默认账本。

#### Scenario: 查询所有账本
- **WHEN** 用户请求账本列表
- **THEN** 系统返回数据库中所有账本
- **AND** 包含默认账本（id=10000001）
- **AND** 按创建时间倒序排列

#### Scenario: 查询单个账本
- **WHEN** 用户请求查询特定 ID 的账本
- **THEN** 系统返回对应账本的信息
- **AND** 包含 id、title、create_at 字段

### Requirement: 分页查询账本列表
系统 SHALL 支持分页查询账本列表，用户可指定页码（page）和每页数量（page_size），系统返回对应的账本数据及分页信息。

#### Scenario: 第一页查询
- **WHEN** 用户请求分页查询账本列表，page=1, page_size=10
- **THEN** 系统返回第 1-10 条账本数据
- **AND** 返回 total（总数量）
- **AND** 返回 page（当前页码）
- **AND** 返回 page_size（每页数量）
- **AND** 返回 total_pages（总页数）
- **AND** 按创建时间倒序排列

#### Scenario: 第二页查询
- **WHEN** 用户请求分页查询账本列表，page=2, page_size=10
- **THEN** 系统返回第 11-20 条账本数据
- **AND** 返回完整的分页信息

#### Scenario: 空数据查询
- **WHEN** 用户请求分页查询账本列表，数据库中无任何账本（仅存在默认账本）
- **THEN** 系统返回空数据列表
- **AND** total 为 0 或 1（仅默认账本）
- **AND** total_pages 为 0 或 1

#### Scenario: 无效页码
- **WHEN** 用户请求分页查询账本列表，page=0
- **THEN** 系统自动纠正为 page=1
- **AND** 返回第一页数据

#### Scenario: 页码超出范围
- **WHEN** 用户请求分页查询账本列表，page=100，但实际仅有 3 页数据
- **THEN** 系统返回空数据列表
- **AND** total_pages 为 3

### Requirement: 修改账本
系统 SHALL 允许用户修改账本，但仅能修改 title 字段，id 和 create_at 不可修改。

#### Scenario: 成功修改标题
- **WHEN** 用户修改账本的 title 字段
- **THEN** 系统更新账本的 title
- **AND** id 和 create_at 保持不变

#### Scenario: 尝试修改 ID
- **WHEN** 用户尝试修改账本的 id 字段
- **THEN** 系统拒绝修改请求
- **AND** 返回错误提示 ID 不可修改

#### Scenario: 尝试修改创建时间
- **WHEN** 用户尝试修改账本的 create_at 字段
- **THEN** 系统拒绝修改请求
- **AND** 返回错误提示创建时间不可修改

### Requirement: 删除账本
系统 SHALL 允许用户删除普通账本，但禁止删除默认账本（id=10000001）。删除时需要将关联到该账本的所有记账记录的 book_id 更新为默认账本的 ID（10000001）。

#### Scenario: 成功删除普通账本
- **WHEN** 用户删除 id 不为 10000001 的账本
- **THEN** 系统删除该账本记录
- **AND** 将所有关联记账记录的 book_id 更新为 10000001
- **AND** 返回删除成功

#### Scenario: 尝试删除默认账本
- **WHEN** 用户尝试删除 id 为 10000001 的默认账本
- **THEN** 系统拒绝删除请求
- **AND** 返回错误提示默认账本不可删除

#### Scenario: 删除包含记录的账本
- **WHEN** 用户删除包含多条记账记录的账本
- **THEN** 系统删除该账本
- **AND** 所有关联记录的 book_id 变为 10000001
- **AND** 记录的其他字段保持不变

#### Scenario: 删除无记录账本
- **WHEN** 用户删除不包含任何记账记录的账本
- **THEN** 系统仅删除该账本记录
- **AND** 无需执行记录迁移操作
