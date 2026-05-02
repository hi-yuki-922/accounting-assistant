## ADDED Requirements

### Requirement: MenuBar DropdownMenu 操作入口

MenuBar 组件 SHALL 在右侧提供一个 DropdownMenu 触发按钮，包含三个操作选项：新建会话、重命名当前会话、切换会话。

#### Scenario: 点击新建会话
- **WHEN** 用户在 DropdownMenu 中点击"新建会话"
- **THEN** 系统创建新会话（标题自动为"会话-{id}"），切换到新会话，对旧会话异步触发摘要生成

#### Scenario: 点击重命名当前会话
- **WHEN** 用户在 DropdownMenu 中点击"重命名当前会话"
- **THEN** 弹出 Dialog 输入框，显示当前标题，用户修改后确认保存

#### Scenario: 点击切换会话
- **WHEN** 用户在 DropdownMenu 中点击"切换会话"
- **THEN** 打开右侧 Sheet 抽屉显示会话列表

### Requirement: 会话列表 Sheet 抽屉

系统 SHALL 提供右侧 Sheet 抽屉展示所有会话列表，支持会话切换和操作。

#### Scenario: 打开会话列表
- **WHEN** 用户点击"切换会话"入口
- **THEN** 右侧 Sheet 抽屉滑出，显示所有会话列表（按创建时间倒序），每个会话项显示标题、创建日期和 Section 数量

#### Scenario: 当前会话高亮
- **WHEN** 会话列表渲染
- **THEN** 当前活跃会话项 SHALL 有视觉高亮标识

#### Scenario: 点击切换到其他会话
- **WHEN** 用户在 Sheet 中点击某个会话项
- **THEN** 系统切换到该会话，加载其 Section 列表，Sheet 关闭

#### Scenario: Sheet 内重命名会话
- **WHEN** 用户在 Sheet 中点击某个会话项的重命名按钮
- **THEN** 弹出 Dialog 输入框，用户修改后保存，title_auto_generated 标记为 false

#### Scenario: Sheet 内手动生成摘要
- **WHEN** 用户在 Sheet 中点击某个会话项的"生成摘要"按钮
- **AND** 该会话的 summary_generated 为 false
- **THEN** 系统异步调用 LLM 生成摘要，生成完成后更新 UI，标记 summary_generated 为 true

#### Scenario: 已生成摘要的会话不显示生成按钮
- **WHEN** 某会话的 summary_generated 为 true
- **THEN** 该会话项不显示"生成摘要"按钮

#### Scenario: Sheet 内不提供新建会话
- **WHEN** Sheet 抽屉打开
- **THEN** Sheet 内只有已有会话列表和操作，不提供新建会话功能
