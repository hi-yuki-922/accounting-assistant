## MODIFIED Requirements

### Requirement: 删除记账记录
系统 MUST 提供删除记账记录功能，支持删除未入账状态的记录并更新账本记录数。

#### Scenario: Successfully delete accounting record
- **WHEN** 调用删除记账记录服务
- **WHEN** 提供有效的记录 ID
- **WHEN** 记录状态为 PendingPosting
- **THEN** 系统 MUST 删除指定的记账记录
- **THEN** 系统 MUST 更新对应账本的记录数 -1
- **THEN** 系统 MUST 返回删除成功的确认

#### Scenario: Delete posted accounting record
- **WHEN** 调用删除记账记录服务
- **WHEN** 提供有效的记录 ID
- **WHEN** 记录状态为 Posted
- **THEN** 系统 MUST 返回错误
- **THEN** 错误信息 MUST 说明已入账的记录只能冲账

#### Scenario: Delete non-existent accounting record
- **WHEN** 调用删除记账记录服务
- **WHEN** 提供不存在的记录 ID
- **THEN** 系统 MUST 返回错误
- **THEN** 错误信息 MUST 说明记录不存在

#### Scenario: Delete accounting record with write-off relations
- **WHEN** 调用删除记账记录服务
- **WHEN** 提供的记录有冲账关联记录
- **THEN** 系统 MUST 返回错误
- **THEN** 错误信息 MUST 说明不能删除有冲账关联的记录

#### Scenario: Delete accounting record and update book count
- **WHEN** 调用删除记账记录服务
- **WHEN** 记录成功删除
- **THEN** 系统 MUST 自动更新对应账本的 record_count 字段 -1
- **THEN** 系统 MUST 确保账本记录数不为负数

#### Scenario: Delete record from default book
- **WHEN** 调用删除记账记录服务
- **WHEN** 删除的记录属于默认账本
- **THEN** 系统 MUST 更新默认账本的 record_count 字段 -1
- **THEN** 系统 MUST 确保默认账本的记录数正确更新
