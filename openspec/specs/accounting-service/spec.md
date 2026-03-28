## ADDED Requirements

### Requirement: Add accounting record
系统 MUST 提供添加记账记录功能，创建新的记账记录并自动生成记录 ID。

#### Scenario: Successfully add accounting record
- **WHEN** 调用添加记账记录服务
- **WHEN** 提供有效的金额、记录时间、记账类型、标题、渠道等参数
- **THEN** 系统 MUST 自动生成唯一的记录 ID
- **THEN** 系统 MUST 创建记账记录
- **THEN** 系统 MUST 设置默认状态为 PendingPosting（待过账）
- **THEN** 系统 MUST 设置记录的创建时间为当前时间
- **THEN** 系统 MUST 返回创建的记录模型

#### Scenario: Add accounting record with default book
- **WHEN** 调用添加记账记录服务
- **WHEN** 未提供账本 ID
- **THEN** 系统 MUST 将记录关联到默认账本（ID: 10000001）

#### Scenario: Add accounting record with specified book
- **WHEN** 调用添加记账记录服务
- **WHEN** 提供账本 ID
- **THEN** 系统 MUST 将记录关联到指定的账本

#### Scenario: Add accounting record with write-off relation
- **WHEN** 调用添加记账记录服务
- **WHEN** 提供 write_off_id
- **THEN** 系统 MUST 将记录关联到指定的冲账记录

### Requirement: Modify accounting record
系统 MUST 提供修改记账记录功能，仅允许修改待过账状态的记录。

#### Scenario: Successfully modify accounting record
- **WHEN** 调用修改记账记录服务
- **WHEN** 提供记录 ID 和要修改的字段
- **WHEN** 记录状态为 PendingPosting
- **THEN** 系统 MUST 更新指定的字段
- **THEN** 系统 MUST 保持未指定的字段不变
- **THEN** 系统 MUST 返回更新后的记录模型

#### Scenario: Modify accounting record amount
- **WHEN** 调用修改记账记录服务
- **WHEN** 仅提供新的金额
- **THEN** 系统 MUST 更新金额字段
- **THEN** 系统 MUST 不修改其他字段

#### Scenario: Modify accounting record time
- **WHEN** 调用修改记账记录服务
- **WHEN** 仅提供新的记录时间
- **THEN** 系统 MUST 更新记录时间字段
- **THEN** 系统 MUST 不修改其他字段

#### Scenario: Modify accounting record title
- **WHEN** 调用修改记账记录服务
- **WHEN** 仅提供新的标题
- **THEN** 系统 MUST 更新标题字段
- **THEN** 系统 MUST 不修改其他字段

#### Scenario: Modify accounting record type
- **WHEN** 调用修改记账记录服务
- **WHEN** 仅提供新的记账类型
- **THEN** 系统 MUST 更新记账类型字段
- **THEN** 系统 MUST 不修改其他字段

#### Scenario: Modify accounting record remark
- **WHEN** 调用修改记账记录服务
- **WHEN** 仅提供新的备注
- **THEN** 系统 MUST 更新备注字段
- **THEN** 系统 MUST 不修改其他字段

#### Scenario: Modify posted accounting record
- **WHEN** 调用修改记账记录服务
- **WHEN** 记录状态为 Posted（已过账）
- **THEN** 系统 MUST 返回错误
- **THEN** 错误信息 MUST 说明仅待过账记录可以修改

#### Scenario: Modify non-existent accounting record
- **WHEN** 调用修改记账记录服务
- **WHEN** 提供不存在的记录 ID
- **THEN** 系统 MUST 返回错误
- **THEN** 错误信息 MUST 说明记录不存在

### Requirement: Post accounting record
系统 MUST 提供过账记账记录功能，将记录状态从待过账改为已过账。

#### Scenario: Successfully post accounting record
- **WHEN** 调用过账记账记录服务
- **WHEN** 提供有效的记录 ID
- **WHEN** 记录状态为 PendingPosting
- **THEN** 系统 MUST 将记录状态改为 Posted
- **THEN** 系统 MUST 返回更新后的记录模型
- **THEN** 其他字段 MUST 保持不变

#### Scenario: Post non-existent accounting record
- **WHEN** 调用过账记账记录服务
- **WHEN** 提供不存在的记录 ID
- **THEN** 系统 MUST 返回错误
- **THEN** 错误信息 MUST 说明记录不存在

#### Scenario: Post already posted accounting record
- **WHEN** 调用过账记账记录服务
- **WHEN** 记录状态已经为 Posted
- **THEN** 系统 MUST 将状态保持为 Posted
- **THEN** 系统 MUST 返回记录模型

### Requirement: Service class implementation
记账服务 MUST 采用服务类模式实现，持有数据库连接。

#### Scenario: AccountingService constructor
- **WHEN** 创建 AccountingService 实例
- **THEN** 服务 MUST 接收 DatabaseConnection 作为构造参数
- **THEN** 服务 MUST 存储数据库连接引用
- **THEN** 后续方法调用 MUST 使用该数据库连接

#### Scenario: AccountingService methods use instance database
- **WHEN** 调用 AccountingService 的任何方法
- **THEN** 方法 MUST 使用实例持有的数据库连接
- **THEN** 方法内部 MUST 不调用 `connection::get_or_init_db()`
- **THEN** 方法 MUST 不持有数据库连接的所有权

### Requirement: DTO parsing and validation
系统 MUST 正确解析和验证输入的 DTO 参数。

#### Scenario: Parse valid amount
- **WHEN** DTO 包含有效的金额（f64）
- **THEN** 系统 MUST 将金额转换为 Decimal 类型
- **THEN** 系统 MUST 保留精确的小数位数

#### Scenario: Parse invalid amount
- **WHEN** DTO 包含无效的金额
- **THEN** 系统 MUST 返回错误
- **THEN** 错误信息 MUST 说明金额无效

#### Scenario: Parse valid date time
- **WHEN** DTO 包含有效的时间字符串（格式: YYYY-MM-DD HH:MM:SS）
- **THEN** 系统 MUST 将字符串解析为 NaiveDateTime
- **THEN** 系统 MUST 返回解析结果

#### Scenario: Parse invalid date time
- **WHEN** DTO 包含无效的时间字符串
- **THEN** 系统 MUST 返回错误
- **THEN** 错误信息 MUST 说明期望的时间格式

#### Scenario: Parse valid accounting type
- **WHEN** DTO 包含有效的记账类型字符串（Income、Expenditure、InvestmentIncome、InvestmentLoss）
- **THEN** 系统 MUST 将英文字符串解析为 AccountingType 枚举
- **THEN** 系统 MUST 返回解析结果

#### Scenario: Parse invalid accounting type
- **WHEN** DTO 包含无效的记账类型字符串
- **THEN** 系统 MUST 返回错误
- **THEN** 错误信息 MUST 说明记账类型无效

#### Scenario: Parse valid accounting channel
- **WHEN** DTO 包含有效的记账渠道字符串（Cash、AliPay、Wechat、BankCard、Unknown）
- **THEN** 系统 MUST 将英文字符串解析为 AccountingChannel 枚举
- **THEN** 系统 MUST 返回解析结果

#### Scenario: Parse invalid accounting channel
- **WHEN** DTO 包含无效的记账渠道字符串
- **THEN** 系统 MUST 返回错误
- **THEN** 错误信息 MUST 说明记账渠道无效
