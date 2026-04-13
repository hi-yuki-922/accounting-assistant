## MODIFIED Requirements

### Requirement: 消息路由协调

Chatbot 页面 SHALL 协调 PromptInput 的消息发送与目标 Section 的路由。无引用时创建新节并乐观渲染用户消息，有引用时续接指定节并发送。

#### Scenario: 无引用新建节发送（乐观更新）
- **WHEN** 用户在 PromptInput 输入消息并提交
- **AND** 未选择引用任何已有 Section
- **THEN** 系统立即在 SectionList 区域渲染新 Section 卡片，卡片内预先显示用户消息气泡
- **AND** 后台调用 `route(sessionId)` 创建新节
- **AND** 节创建完成后调用 `useSectionChat.send()` 发送消息
- **AND** 消息发送后用户消息从预渲染状态过渡到真实消息状态

#### Scenario: 引用已有节续接
- **WHEN** 用户在 PromptInput 选择引用某个已有 Section
- **AND** 输入消息并提交
- **THEN** 系统将消息发送到引用节的 `useSectionChat.send()`

### Requirement: 会话管理 UI 协调

Chatbot 页面 SHALL 协调 MenuBar 的 DropdownMenu 和 Sheet 抽屉与会话管理 hooks 的交互。

#### Scenario: MenuBar 展示当前会话信息
- **WHEN** Chatbot 页面渲染
- **THEN** MenuBar 显示当前活跃会话的标题和 DropdownMenu 操作入口

#### Scenario: 从 DropdownMenu 新建会话
- **WHEN** 用户通过 MenuBar 的 DropdownMenu 点击"新建会话"
- **THEN** 系统调用 `useSessionList.createSession()`，新会话自动成为活跃会话

#### Scenario: 从 DropdownMenu 重命名会话
- **WHEN** 用户通过 MenuBar 的 DropdownMenu 点击"重命名当前会话"
- **THEN** 系统弹出 Dialog，用户修改后调用 `useSessionList.renameSession()`

#### Scenario: 从 Sheet 切换会话
- **WHEN** 用户在 Sheet 中点击某个会话
- **THEN** 系统调用 `useSessionList.switchSession(id)`，Sheet 关闭

## ADDED Requirements

### Requirement: Section 卡片预渲染用户消息

新建 Section 时，系统 SHALL 在 Section 卡片挂载后立即预渲染用户消息，无需等待 `useSectionChat.send()` 完成。

#### Scenario: 预渲染用户消息
- **WHEN** handleSubmit 创建新节并调用 addSection
- **THEN** 新 SectionCard 挂载时立即显示用户消息气泡，内容为用户输入的文本
- **AND** 消息样式与正常用户消息一致
- **AND** send() 完成后用户消息自然过渡到真实状态，无视觉跳动

#### Scenario: send 失败时的错误提示
- **WHEN** Section 创建完成但 send() 失败（如 Agent 创建失败）
- **THEN** 预渲染的用户消息下方显示错误提示，允许用户重试或放弃
