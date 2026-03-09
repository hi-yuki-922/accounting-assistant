## ADDED Requirements

### Requirement: 会计账簿服务支持创建账簿

测试 SHALL 验证 AccountingBookService 能够创建新的会计账簿。

#### Scenario: 成功创建账簿
- **WHEN** 调用创建账簿方法，传入账簿名称和描述
- **THEN** 系统成功创建账簿并返回账簿 ID
- **AND** 数据库中包含该账簿记录
- **AND** 账簿名称与输入一致

#### Scenario: 创建账簿时名称为空
- **WHEN** 调用创建账簿方法，传入空字符串作为名称
- **THEN** 系统返回错误
- **AND** 数据库中不包含该账簿

#### Scenario: 创建重复名称的账簿
- **WHEN** 调用创建账簿方法，传入已存在的账簿名称
- **THEN** 系统返回错误
- **AND** 数据库中不包含重复的账簿

### Requirement: 会计账簿服务支持查询账簿

测试 SHALL 验证 AccountingBookService 能够查询会计账簿。

#### Scenario: 根据 ID 查询账簿
- **WHEN** 调用查询方法，传入已存在的账簿 ID
- **THEN** 系统返回对应的账簿详情
- **AND** 返回账簿的所有字段与创建时一致

#### Scenario: 查询不存在的账簿
- **WHEN** 调用查询方法，传入不存在的账簿 ID
- **THEN** 系统返回空结果
- **AND** 不抛出未处理异常

#### Scenario: 查询所有账簿
- **WHEN** 调用列表查询方法
- **THEN** 系统返回所有账簿的列表
- **AND** 每个账簿包含基本信息

#### Scenario: 查询空账簿列表（仅默认账簿存在）
- **WHEN** 数据库中仅存在默认账簿
- **AND** 调用查询方法
- **THEN** 系统返回仅包含默认账簿的列表
- **AND** 列表长度为 1

### Requirement: 会计账簿服务支持更新账簿

测试 SHALL 验证 AccountingBookService 能够更新已存在的会计账簿。

#### Scenario: 更新账簿标题
- **WHEN** 调用更新方法，传入账簿 ID 和新的标题
- **THEN** 系统成功更新账簿
- **AND** 数据库中的账簿标题为新值
- **AND** 其他字段保持不变

#### Scenario: 更新为空标题
- **WHEN** 调用更新方法，传入空字符串作为新标题
- **THEN** 系统返回错误
- **AND** 错误信息为"账本标题不能为空"
- **AND** 数据库中的账簿标题保持不变

#### Scenario: 更新不存在的账簿
- **WHEN** 调用更新方法，传入不存在的账簿 ID
- **THEN** 系统返回空结果
- **AND** 数据库不受影响

### Requirement: 会计账簿服务支持删除账簿

测试 SHALL 验证 AccountingBookService 能够删除会计账簿。

#### Scenario: 删除不包含会计记录的账簿
- **WHEN** 调用删除方法，传入不包含会计记录的账簿 ID
- **THEN** 系统成功删除账簿
- **AND** 返回 true
- **AND** 数据库中不再包含该账簿

#### Scenario: 删除不存在的账簿
- **WHEN** 调用删除方法，传入不存在的账簿 ID
- **THEN** 系统返回 false
- **AND** 不抛出未处理异常

#### Scenario: 删除默认账簿
- **WHEN** 调用删除方法，传入默认账簿 ID（10000001）
- **THEN** 系统返回错误
- **AND** 错误信息为"默认账本不能删除"
- **AND** 数据库不受影响

### Requirement: 会计账簿服务支持创建默认账簿

测试 SHALL 验证 AccountingBookService 能够创建默认账簿。

#### Scenario: 首次创建默认账簿
- **WHEN** 调用 `create_default_book` 方法且数据库中不存在默认账簿
- **THEN** 系统创建默认账簿（ID = 10000001）
- **AND** 默认账簿标题为"未归类账目"
- **AND** 数据库中包含该账簿
- **AND** 返回创建的账簿

#### Scenario: 已存在默认账簿时再次调用
- **WHEN** 调用 `create_default_book` 方法且数据库中已存在默认账簿
- **THEN** 系统不创建新的默认账簿
- **AND** 数据库中账簿数量不变
- **AND** 返回已存在的默认账簿

### Requirement: 会计账簿服务支持查询账簿关联的记录

测试 SHALL 验证 AccountingBookService 能够查询账簿下的会计记录。

#### Scenario: 查询账簿下的记录
- **WHEN** 调用查询方法，传入账簿 ID
- **AND** 该账簿下有会计记录
- **THEN** 系统返回该账簿下的所有记录列表
- **AND** 所有记录的 book_id 与指定的账簿 ID 一致

#### Scenario: 查询空账簿下的记录
- **WHEN** 调用查询方法，传入账簿 ID
- **AND** 该账簿下没有会计记录
- **THEN** 系统返回空列表
- **AND** 列表长度为 0

### Requirement: 会计账簿服务支持查询未归类记录

测试 SHALL 验证 AccountingBookService 能够查询未归类的会计记录。

#### Scenario: 查询未归类记录
- **WHEN** 调用查询方法，获取未归类记录
- **AND** 数据库中存在 book_id 为 None 的记录
- **THEN** 系统返回所有未归类记录列表
- **AND** 包括 book_id 为 None 和 book_id 为默认账簿 ID 的记录

### Requirement: 会计账簿服务支持查询冲账关联记录

测试 SHALL 验证 AccountingBookService 能够查询与主记录关联的冲账记录。

#### Scenario: 查询冲账关联记录
- **WHEN** 调用查询方法，传入主记录 ID
- **AND** 该主记录有冲账关联记录
- **THEN** 系统返回所有 write_off_id 等于指定 ID 的记录列表
- **AND** 返回的记录都是冲账关联记录

**注意**：以下功能由于服务未提供相关方法，测试中未实现：
- 设置默认账簿（服务未提供设置默认账簿的方法）
- 查询账簿统计信息（服务未提供统计方法）
- 创建重复名称的账簿限制（当前实现允许同名账簿）

