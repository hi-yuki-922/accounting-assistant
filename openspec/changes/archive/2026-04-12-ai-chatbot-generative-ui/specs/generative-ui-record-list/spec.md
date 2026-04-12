## ADDED Requirements

### Requirement: RecordListCard 记账记录列表展示

系统 SHALL 提供 `RecordListCard` 组件，在搜索或创建/更新记账记录后以卡片形式展示记录列表。

#### Scenario: 搜索记账记录结果展示

- **WHEN** Agent 调用 `search_records` 工具并返回记账记录列表
- **THEN** 系统 SHALL 渲染 RecordListCard，展示匹配的记录摘要信息（标题、金额、记账类型、支付渠道、记录时间）

#### Scenario: 创建记账记录结果展示

- **WHEN** Agent 调用 `create_record` 工具并返回新创建的记录
- **THEN** 系统 SHALL 渲染 RecordListCard，展示新创建的记录信息

#### Scenario: 更新记账记录结果展示

- **WHEN** Agent 调用 `update_record` 工具并返回更新后的记录
- **THEN** 系统 SHALL 渲染 RecordListCard，展示更新后的记录信息

#### Scenario: 记录行点击交互

- **WHEN** 用户点击 RecordListCard 中的某一行记录
- **THEN** 系统 SHALL 打开 `RecordDetailDialog` 弹窗，展示该记录的完整详情

#### Scenario: 空列表处理

- **WHEN** 搜索结果为空（无匹配记录）
- **THEN** 系统 SHALL 显示"未找到匹配的记账记录"提示信息

### Requirement: RecordDetailDialog 记账记录详情弹窗

系统 SHALL 提供 `RecordDetailDialog` 组件，以弹窗形式展示记账记录的完整详情。

#### Scenario: 弹窗打开

- **WHEN** 通过 `open` prop 和 `recordId` 触发弹窗打开
- **THEN** 系统 SHALL 通过 `accounting.getById(recordId)` 获取完整记录数据
- **AND** 展示字段：标题、金额（带颜色区分收入/支出）、记账类型、支付渠道、记录时间、状态、备注

#### Scenario: 关联冲账信息展示

- **WHEN** 记账记录存在关联的冲账记录
- **THEN** 系统 SHALL 在详情中展示冲账信息（冲账金额、冲账时间）

#### Scenario: 弹窗关闭

- **WHEN** 用户点击关闭按钮或弹窗外部区域
- **THEN** 系统 SHALL 调用 `onClose` 回调关闭弹窗

#### Scenario: 底部操作按钮

- **WHEN** 弹窗展示记录详情
- **THEN** 系统 SHALL 在底部提供"编辑"和"删除"操作按钮
- **AND** 编辑按钮复用 `AccountingRecordDialog` 组件
- **AND** 删除按钮复用 `DeleteRecordConfirmDialog` 组件
