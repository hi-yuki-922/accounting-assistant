## ADDED Requirements

### Requirement: 删除未入账记录功能
系统 SHALL 在账本详情页列表中为状态为"待入账"的记录提供删除按钮，点击后删除记录并更新账本记录数。

#### Scenario: 成功删除未入账记录
- **WHEN** 用户点击列表中"待入账"记录的删除按钮
- **WHEN** 用户在删除确认对话框中确认删除操作
- **THEN** 系统 SHALL 删除指定的记账记录
- **THEN** 系统 SHALL 更新账本记录数 -1
- **THEN** 系统 SHALL 智能刷新当前页
- **THEN** 系统 SHALL 如果当前页变空则跳转到上一页
- **THEN** 系统 SHALL 显示删除成功的提示

#### Scenario: 删除已入账记录被拒绝
- **WHEN** 用户尝试删除状态为"已入账"的记录
- **THEN** 系统 SHALL 不显示删除按钮
- **THEN** 系统 SHALL 在后端拒绝删除已入账记录的请求
- **THEN** 系统 SHALL 返回错误说明已入账的记录只能冲账

#### Scenario: 删除不存在的记录
- **WHEN** 用户尝试删除不存在的记录 ID
- **THEN** 系统 SHALL 返回错误
- **THEN** 错误信息 SHALL 说明记录不存在

#### Scenario: 删除有冲账关联的记录被拒绝
- **WHEN** 用户尝试删除有冲账关联的记录
- **THEN** 系统 SHALL 验证记录是否有冲账关联
- **THEN** 系统 SHALL 返回错误说明不能删除有冲账关联的记录

### Requirement: 删除确认对话框
系统 SHALL 在删除操作前显示确认对话框，展示记录信息和提供确认和取消选项，防止误操作。

#### Scenario: 显示删除确认对话框
- **WHEN** 用户点击"待入账"记录的删除按钮
- **THEN** 系统 SHALL 显示删除确认对话框
- **THEN** 删除确认对话框 SHALL 显示"确定要删除这条记录吗？"
- **THEN** 删除确认对话框 SHALL 显示记录的摘要信息（标题、金额、类型等）
- **THEN** 删除确认对话框 SHALL 显示注意事项（删除后无法恢复）
- **THEN** 删除确认对话框 SHALL 提供确认和取消按钮

#### Scenario: 确认删除操作
- **WHEN** 用户在删除确认对话框中点击确认按钮
- **THEN** 系统 SHALL 关闭确认对话框
- **THEN** 系统 SHALL 执行删除操作
- **THEN** 系统 SHALL 在操作完成后刷新列表

#### Scenario: 取消删除操作
- **WHEN** 用户在删除确认对话框中点击取消按钮
- **THEN** 系统 SHALL 关闭确认对话框
- **THEN** 系统 SHALL 不执行删除操作
- **THEN** 系统 SHALL 保持记录列表不变

### Requirement: 删除操作的权限控制
系统 SHALL 根据记录状态控制删除按钮的显示和操作权限，确保操作的合法性和数据可追溯性。

#### Scenario: 未入账记录的删除权限
- **WHEN** 记录状态为"待入账"
- **THEN** 系统 SHALL 允许删除该记录
- **THEN** 系统 SHALL 显示删除按钮
- **THEN** 后端 SHALL 接受删除请求

#### Scenario: 已入账记录的删除权限
- **WHEN** 记录状态为"已入账"
- **THEN** 系统 SHALL 不允许删除该记录
- **THEN** 系统 SHALL 不显示删除按钮
- **THEN** 后端 SHALL 拒绝删除请求
- **THEN** 系统 SHALL 返回错误说明已入账的记录只能冲账

### Requirement: 删除操作的账本记录数更新
系统 SHALL 在删除记账记录后正确更新对应账本的记录计数，确保数据一致性。

#### Scenario: 更新指定账本的记录数
- **WHEN** 用户删除属于账本 A 的记账记录
- **THEN** 系统 SHALL 将账本 A 的记录数 -1
- **THEN** 系统 SHALL 立即更新账本记录数
- **THEN** 系统 SHALL 确保更新后的记录数不为负数

#### Scenario: 删除默认账本的记录
- **WHEN** 用户删除属于默认账本的记账记录
- **THEN** 系统 SHALL 将默认账本的记录数 -1
- **THEN** 系统 SHALL 确保默认账本的记录数正确更新

### Requirement: 删除操作的智能刷新
系统 SHALL 在删除记录后采用智能刷新策略，根据当前页的数据情况自动调整页面跳转。

#### Scenario: 删除后当前页仍有数据
- **WHEN** 用户删除当前页的 1 条记录
- **WHEN** 当前页还有其他数据（如原本有 20 条，删除后还有 19 条）
- **THEN** 系统 SHALL 保留当前页码
- **THEN** 系统 SHALL 刷新当前页的记录列表

#### Scenario: 删除后当前页变空且不是第一页
- **WHEN** 用户删除当前页的最后 1 条记录
- **WHEN** 当前页码为第 3 页
- **THEN** 系统 SHALL 自动跳转到第 2 页
- **THEN** 系统 SHALL 刷新跳转后的记录列表

#### Scenario: 删除后当前页变空且是第一页
- **WHEN** 用户删除当前页的最后 1 条记录
- **WHEN** 当前页码为第 1 页
- **THEN** 系统 SHALL 保持第 1 页
- **THEN** 系统 SHALL 刷新空列表状态
- **THEN** 系统 SHALL 显示"暂无记账记录"的空状态提示

### Requirement: 删除操作的后端验证
系统 SHALL 在删除记录时进行后端验证，包括记录存在性检查、状态权限检查、冲账关联检查等。

#### Scenario: 验证记录存在
- **WHEN** 后端接收删除记录请求
- **WHEN** 指定的记录 ID 存在于数据库中
- **THEN** 系统 SHALL 通过验证
- **THEN** 系统 SHALL 继续执行删除操作

#### Scenario: 验证记录不存在
- **WHEN** 后端接收删除记录请求
- **WHEN** 指定的记录 ID 不存在于数据库中
- **THEN** 系统 SHALL 检测到记录不存在
- **THEN** 系统 SHALL 返回错误
- **THEN** 错误信息 SHALL 说明记录不存在

#### Scenario: 验证记录状态为待入账
- **WHEN** 后端接收删除记录请求
- **WHEN** 指定的记录状态为"待入账"
- **THEN** 系统 SHALL 通过验证
- **THEN** 系统 SHALL 继续执行删除操作

#### Scenario: 验证记录状态已入账被拒绝
- **WHEN** 后端接收删除记录请求
- **WHEN** 指定的记录状态为"已入账"
- **THEN** 系统 SHALL 检测到状态错误
- **THEN** 系统 SHALL 返回错误
- **THEN** 错误信息 SHALL 说明已入账的记录只能冲账

#### Scenario: 验证记录无冲账关联
- **WHEN** 后端接收删除记录请求
- **WHEN** 指定的记录没有冲账关联记录
- **THEN** 系统 SHALL 通过验证
- **THEN** 系统 SHALL 继续执行删除操作

#### Scenario: 验证记录有冲账关联被拒绝
- **WHEN** 后端接收删除记录请求
- **WHEN** 指定的记录有冲账关联记录
- **THEN** 系统 SHALL 检测到冲账关联
- **THEN** 系统 SHALL 返回错误
- **THEN** 错误信息 SHALL 说明不能删除有冲账关联的记录