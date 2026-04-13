## MODIFIED Requirements

### Requirement: PromptInput 确认模式切换

PromptInput 组件 SHALL 使用 shadcn Badge 组件作为操作确认状态的切换控件。Badge 文本统一为"操作确认"，关闭状态使用 outline 变体，开启状态使用浅蓝色样式。

#### Scenario: 确认模式关闭状态
- **WHEN** 确认模式为 off
- **THEN** Badge 使用 `variant="outline"` 样式，文本显示"操作确认"

#### Scenario: 确认模式开启状态
- **WHEN** 确认模式为 on
- **THEN** Badge 使用浅蓝色背景样式（`bg-blue-100 text-blue-700`，暗色模式 `dark:bg-blue-900 dark:text-blue-300`），文本显示"操作确认"

#### Scenario: 点击切换确认模式
- **WHEN** 用户点击 Badge
- **THEN** 确认模式在 on/off 之间切换，状态持久化到 localStorage
- **AND** Badge 样式立即更新为对应状态

#### Scenario: 确认模式状态恢复
- **WHEN** PromptInput 组件挂载
- **THEN** 从 localStorage 读取确认模式状态，Badge 显示为对应的样式
