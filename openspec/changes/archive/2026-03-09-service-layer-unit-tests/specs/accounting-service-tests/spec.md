## ADDED Requirements

### Requirement: 会计记录服务支持创建记录

测试 SHALL 验证 AccountingService 能够成功创建新的会计记录。测试应使用测试上下文中自动创建的默认账簿。

#### Scenario: 创建收入记录（使用默认账簿）
- **WHEN** 调用创建记录方法，传入收入类型、金额、日期和描述
- **AND** book_id 设置为默认账簿 ID（10000001）或 None
- **THEN** 系统成功创建记录并返回记录 ID
- **AND** 数据库中包含该记录
- **AND** 记录的会计类型为收入（INCOME）
- **AND** 记录与默认账簿关联

#### Scenario: 创建支出记录（使用默认账簿）
- **WHEN** 调用创建记录方法，传入支出类型、金额、日期和描述
- **AND** book_id 设置为默认账簿 ID（10000001）或 None
- **THEN** 系统成功创建记录并返回记录 ID
- **AND** 数据库中包含该记录
- **AND** 记录的会计类型为支出（EXPENSE）
- **AND** 记录与默认账簿关联

#### Scenario: 创建记录时金额为负数
- **WHEN** 调用创建记录方法，传入负数金额
- **THEN** 系统返回错误
- **AND** 数据库中不包含该记录

### Requirement: 会计记录服务支持修改记录

测试 SHALL 验证 AccountingService 能够修改已存在的会计记录。

#### Scenario: 修改记录金额
- **WHEN** 调用修改方法，传入记录 ID 和新的金额
- **THEN** 系统成功修改记录
- **AND** 数据库中的记录金额为新值
- **AND** 其他字段保持不变

#### Scenario: 修改记录标题
- **WHEN** 调用修改方法，传入记录 ID 和新的标题
- **THEN** 系统成功修改记录
- **AND** 数据库中的记录标题为新值
- **AND** 其他字段保持不变

#### Scenario: 添加记录备注
- **WHEN** 调用修改方法，传入记录 ID 和备注内容
- **THEN** 系统成功修改记录
- **AND** 数据库中的记录备注为新值
- **AND** 其他字段保持不变

#### Scenario: 删除记录备注
- **WHEN** 调用修改方法，传入记录 ID 并将备注设置为 None
- **THEN** 系统成功修改记录
- **AND** 数据库中的记录备注为 None
- **AND** 其他字段保持不变

#### Scenario: 修改不存在的记录
- **WHEN** 调用修改方法，传入不存在的记录 ID
- **THEN** 系统返回错误
- **AND** 错误信息为 "Accounting record not found"
- **AND** 数据库不受影响

#### Scenario: 修改已过账的记录
- **WHEN** 调用修改方法，传入已过账记录的 ID
- **THEN** 系统返回错误
- **AND** 错误信息为 "Only records with state PendingPosting can be modified"
- **AND** 数据库不受影响

### Requirement: 会计记录服务支持过账记录

测试 SHALL 验证 AccountingService 能够将记录过账。

#### Scenario: 过账待过账记录
- **WHEN** 调用过账方法，传入待过账记录的 ID
- **THEN** 系统成功过账记录
- **AND** 记录状态从 PendingPosting 变为 Posted
- **AND** 其他字段保持不变

#### Scenario: 过账不存在的记录
- **WHEN** 调用过账方法，传入不存在的记录 ID
- **THEN** 系统返回错误
- **AND** 错误信息为 "Accounting record not found"
- **AND** 数据库不受影响

#### Scenario: 过账已过账的记录
- **WHEN** 调用过账方法，传入已过账记录的 ID
- **THEN** 系统返回成功
- **AND** 记录状态保持为 Posted

### Requirement: 会计记录服务支持查询记录

测试 SHALL 验证能够直接查询数据库中的会计记录。

#### Scenario: 根据 ID 查询存在的记录
- **WHEN** 使用 Entity::find_by_id 查询已存在的记录 ID
- **THEN** 系统返回对应的记录详情
- **AND** 返回记录的所有字段与创建时一致

#### Scenario: 查询不存在的记录
- **WHEN** 使用 Entity::find_by_id 查询不存在的记录 ID
- **THEN** 系统返回空结果
- **AND** 不抛出未处理异常

**注意**：以下功能由于服务未提供相关方法，测试中未实现：
- 删除记录测试（服务未提供 delete_record 方法）
- 统计功能测试（服务未提供统计方法）
- 日期范围查询（服务未提供查询方法）
- 分页查询（服务未提供查询方法）

