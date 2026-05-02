## 1. Vitest 基础设施搭建

- [x] 1.1 安装 vitest 作为 devDependency
- [x] 1.2 在 `vite.config.ts` 顶部添加 `/// <reference types="vitest/config" />`，新增 `test` 配置块（include、globals、environment）
- [x] 1.3 在 `package.json` 中添加 `test`（watch 模式）和 `test:run`（单次运行）脚本
- [x] 1.4 创建 `src/__tests__/lib/` 目录
- [x] 1.5 验证：运行 `pnpm test:run` 确认 vitest 正常启动（即使无测试文件也不报错）

## 2. formatters.ts 单元测试

- [x] 2.1 创建 `src/__tests__/lib/formatters.test.ts`
- [x] 2.2 编写 `formatCurrency` 测试：正常数值、字符串输入、null/undefined 返回 "-"、NaN 返回 "-"、自定义货币符号、自定义小数位
- [x] 2.3 编写 `formatCurrencyCompact` 测试：万/亿/千边界值、负数处理、小于千的数值
- [x] 2.4 编写 `formatDate` 测试：default/short/long/time/datetime/datetime-compact 六种模式、无效日期返回 "无效日期"、字符串输入
- [x] 2.5 编写 `formatPercentage` 测试：正值带+号、负值、零值、showSign=false、自定义 decimals
- [x] 2.6 编写 `formatNumber` 测试：千分位格式化、自定义 decimals
- [x] 2.7 编写 `formatFileSize` 测试：各单位边界（Bytes/KB/MB/GB/TB）、零值返回 "0 Bytes"
- [x] 2.8 编写 `formatDuration` 测试：小时+分钟+秒组合、纯秒、纯分钟+秒、零值返回 "0秒"
- [x] 2.9 编写 `formatPhoneNumber` 测试：标准 11 位手机号、非标准格式原样返回
- [x] 2.10 编写 `formatEmailHidden` 测试：长用户名、短用户名（≤2 字符）、单字符用户名
- [x] 2.11 编写 `formatCardNumberHidden` 测试：标准卡号、含非数字字符的卡号
- [x] 2.12 编写 `formatSignedAmount` 测试：收入为正、支出为负、零值无符号、自定义 decimals
- [x] 2.13 编写 `formatRawAmount` 测试：正常格式化、自定义 decimals
- [x] 2.14 验证：运行 `pnpm test:run`，所有 formatters 测试通过

## 3. message-utils.ts 单元测试

- [x] 3.1 创建 `src/__tests__/lib/message-utils.test.ts`
- [x] 3.2 构建测试辅助工具：定义 createMockMessage 工厂函数，快速构造各类 JSONLMessage 测试数据
- [x] 3.3 编写空消息列表测试：输入 `[]` 返回 `[]`
- [x] 3.4 编写 user 消息映射测试：role/content/id 正确传递，hidden 消息被跳过
- [x] 3.5 编写 assistant 消息映射测试：纯文本消息、含 tool_calls 的消息
- [x] 3.6 编写 tool result 合并测试：tool result 作为 parts 合入对应 assistant 消息，toolName 正确关联
- [x] 3.7 编写 confirm_operation 状态推导测试：confirmed（用户确认无后续响应）、cancelled（用户拒绝）、completed（用户确认后有 assistant 响应）
- [x] 3.8 编写 collect_missing_fields 状态推导测试：submitted、cancelled、completed 三种状态
- [x] 3.9 编写 JSON 解析注入测试：tool result 内容为有效 JSON 时解析为对象，无效 JSON 时保留原始字符串
- [x] 3.10 编写 _status 注入测试：推导的状态正确注入到 parsedResult 的 `_status` 字段
- [x] 3.11 编写综合场景测试：包含 user、assistant（含 tool_calls）、tool、hidden user 的混合消息序列
- [x] 3.12 验证：运行 `pnpm test:run`，所有 message-utils 测试通过

## 4. 最终验证

- [x] 4.1 运行 `pnpm test:run`，确认全部测试通过，无跳过、无失败
- [x] 4.2 确认 `pnpm build` 不受影响（测试文件不参与构建）
