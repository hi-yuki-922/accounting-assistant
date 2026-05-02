## ADDED Requirements

### Requirement: 展示工具使用 Prompt 指令

Agent 系统提示词 SHALL 包含展示工具的使用指令，约束 AI 的结果展示行为。

#### Scenario: 搜索结果必须通过展示工具展示
- **WHEN** AI 使用搜索工具获取结果
- **THEN** AI SHALL 调用对应的展示工具呈现结果，不直接以 Markdown 表格或列表输出

#### Scenario: 写操作结果通过展示工具展示
- **WHEN** AI 执行写操作（创建订单、记账、结账等）成功
- **THEN** AI SHALL 调用对应的展示工具展示操作结果

#### Scenario: AI 用自然语言总结结果
- **WHEN** AI 调用展示工具后
- **THEN** AI SHALL 用简短的自然语言对结果进行总结，不重复展示工具已呈现的详细数据

#### Scenario: 搜索与展示工具的对应关系
- **WHEN** AI 查看工具列表
- **THEN** 展示工具的 description SHALL 明确说明其对应的搜索/写操作工具，帮助 AI 正确匹配
