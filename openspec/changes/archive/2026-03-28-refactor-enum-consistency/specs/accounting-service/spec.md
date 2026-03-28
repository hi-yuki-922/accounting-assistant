## MODIFIED Requirements

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
