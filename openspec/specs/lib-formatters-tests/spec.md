## Purpose

验证 `src/lib/formatters.ts` 中各格式化函数的正确性，覆盖正常输入、边界值和异常情况。

## Requirements

### Requirement: formatCurrency 测试覆盖

`formatCurrency` 函数 SHALL 通过以下测试场景验证。

#### Scenario: 正常数值格式化
- **WHEN** 输入 `1234.5`
- **THEN** 返回 `"¥1,234.50"`

#### Scenario: 字符串输入
- **WHEN** 输入 `"5678.9"`
- **THEN** 返回 `"¥5,678.90"`

#### Scenario: null 输入
- **WHEN** 输入 `null`
- **THEN** 返回 `"-"`

#### Scenario: undefined 输入
- **WHEN** 输入 `undefined`
- **THEN** 返回 `"-"`

#### Scenario: NaN 输入
- **WHEN** 输入 `"abc"`（解析为 NaN）
- **THEN** 返回 `"-"`

#### Scenario: 自定义货币符号
- **WHEN** 输入 `100, "$"`
- **THEN** 返回 `"$100.00"`

#### Scenario: 自定义小数位
- **WHEN** 输入 `1234.567, "¥", 3`
- **THEN** 返回 `"¥1,234.567"`

### Requirement: formatCurrencyCompact 测试覆盖

#### Scenario: 亿级数值
- **WHEN** 输入 `200_000_000`
- **THEN** 返回以 "亿" 结尾的格式

#### Scenario: 万级数值
- **WHEN** 输入 `50_000`
- **THEN** 返回以 "万" 结尾的格式

#### Scenario: 千级数值
- **WHEN** 输入 `5000`
- **THEN** 返回以 "千" 结尾的格式

#### Scenario: 小于千的数值
- **WHEN** 输入 `999`
- **THEN** 返回两位小数格式，无后缀

#### Scenario: 负数处理
- **WHEN** 输入 `-50_000`
- **THEN** 正确格式化负值

### Requirement: formatDate 测试覆盖

#### Scenario: 六种格式模式
- **WHEN** 分别使用 default/short/long/time/datetime/datetime-compact 格式
- **THEN** 各返回对应格式的日期字符串

#### Scenario: 无效日期
- **WHEN** 输入 `"invalid-date"`
- **THEN** 返回 `"无效日期"`

#### Scenario: 字符串日期输入
- **WHEN** 输入 ISO 格式字符串 `"2024-03-15"`
- **THEN** 正确解析并格式化

### Requirement: formatPercentage 测试覆盖

#### Scenario: 正值带符号
- **WHEN** 输入 `12.5`
- **THEN** 返回 `"+12.5%"`

#### Scenario: 负值
- **WHEN** 输入 `-5.2`
- **THEN** 返回 `"-5.2%"`

#### Scenario: 零值
- **WHEN** 输入 `0`
- **THEN** 返回 `"0.0%"`

#### Scenario: 隐藏符号
- **WHEN** 输入 `12.5, 1, false`
- **THEN** 返回 `"12.5%"`（无 + 号）

### Requirement: formatNumber 测试覆盖

#### Scenario: 千分位
- **WHEN** 输入 `1234567`
- **THEN** 返回带千分位分隔符的字符串

#### Scenario: 自定义小数位
- **WHEN** 输入 `1234.5, 2`
- **THEN** 返回两位小数

### Requirement: formatFileSize 测试覆盖

#### Scenario: 各单位边界
- **WHEN** 输入 `1024`（KB 边界）、`1048576`（MB 边界）、`1073741824`（GB 边界）
- **THEN** 分别返回对应单位格式

#### Scenario: 零值
- **WHEN** 输入 `0`
- **THEN** 返回 `"0 Bytes"`

### Requirement: formatDuration 测试覆盖

#### Scenario: 完整时长
- **WHEN** 输入 `3661`（1小时1分1秒）
- **THEN** 返回 `"1小时1分钟1秒"`

#### Scenario: 纯秒
- **WHEN** 输入 `45`
- **THEN** 返回 `"45秒"`

#### Scenario: 零值
- **WHEN** 输入 `0`
- **THEN** 返回 `"0秒"`

### Requirement: formatPhoneNumber 测试覆盖

#### Scenario: 标准 11 位手机号
- **WHEN** 输入 `"13812345678"`
- **THEN** 返回 `"138-1234-5678"`

#### Scenario: 非标准格式
- **WHEN** 输入 `"12345"`
- **THEN** 返回原样 `"12345"`

### Requirement: formatEmailHidden 测试覆盖

#### Scenario: 长用户名
- **WHEN** 输入 `"zhangsan@example.com"`
- **THEN** 首字符保留，中间用星号替换

#### Scenario: 短用户名（≤2 字符）
- **WHEN** 输入 `"ab@example.com"`
- **THEN** 首字符保留，其余用星号替换

### Requirement: formatCardNumberHidden 测试覆盖

#### Scenario: 标准卡号
- **WHEN** 输入 `"6222021234567890"`
- **THEN** 返回 `"**** **** **** 7890"`

#### Scenario: 含非数字字符
- **WHEN** 输入 `"6222-0212-3456-7890"`
- **THEN** 非数字字符被过滤，返回 `"**** **** **** 7890"`

### Requirement: formatSignedAmount 测试覆盖

#### Scenario: 收入类型
- **WHEN** 输入 `100, true`
- **THEN** 返回 `"+100.00"`

#### Scenario: 支出类型
- **WHEN** 输入 `100, false`
- **THEN** 返回 `"-100.00"`

#### Scenario: 零值
- **WHEN** 输入 `0, true`
- **THEN** 返回 `"0.00"`（无符号）

### Requirement: formatRawAmount 测试覆盖

#### Scenario: 正常格式化
- **WHEN** 输入 `1234.5`
- **THEN** 返回 `"1234.50"`

#### Scenario: 自定义小数位
- **WHEN** 输入 `1234.5, 3`
- **THEN** 返回 `"1234.500"`
