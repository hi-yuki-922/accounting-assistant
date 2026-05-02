# Capability: Chatbot Page

## Purpose

Chatbot 页面组件，负责路由注册、面板布局、首次加载会话、消息路由协调和会话切换。

## Requirements

### Requirement: Chatbot 页面路由与渲染

系统 SHALL 在 `/chatbot` 路由下渲染 Chatbot 页面组件，页面使用 Resizable 组件划分为左右两个面板：左侧为订单看板组件（OrderTaskBoard），右侧为 Section 对话区域。两个面板默认宽度比例为 6:4，右侧面板最小宽度为 320px。

#### Scenario: 用户点击侧边栏"AI 助手"导航
- **WHEN** 用户点击侧边栏或底栏的"AI 助手"入口
- **THEN** 系统导航到 `/chatbot` 路由并渲染 Chatbot 页面

#### Scenario: 页面布局渲染
- **WHEN** Chatbot 页面渲染完成
- **THEN** 页面使用 Resizable Panel Group 划分为左右两个面板
- **AND** 左侧面板展示订单看板（OrderTaskBoard），通过 ResizablePanel 实现与右侧对话区域的可调布局
- **AND** 右侧面板从上到下依次显示 MenuBar、SectionList、PromptInput，SectionList 占据可滚动区域
- **AND** 左右面板默认宽度比例为 6:4
- **AND** 右侧面板最小宽度为 320px

### Requirement: 首次进入自动加载会话

系统 SHALL 在首次进入 Chatbot 页面时，自动查询今日最后创建的会话并加载。如果今日无会话则自动新建空会话。

#### Scenario: 今日存在会话
- **WHEN** 用户首次进入 Chatbot 页面
- **AND** 今日存在已创建的会话
- **THEN** 系统自动加载今日最后创建的会话，显示其 Section 列表

#### Scenario: 今日无会话
- **WHEN** 用户首次进入 Chatbot 页面
- **AND** 今日不存在任何会话
- **THEN** 系统自动创建一个空会话并加载，Section 列表为空

### Requirement: 空态引导

当当前会话没有任何 Section 时，系统 SHALL 在 SectionList 区域显示简短的引导建议文本。

#### Scenario: 新建空会话的初始状态
- **WHEN** 当前会话没有任何 Section
- **THEN** SectionList 区域显示引导文本（如"你可以问我关于订单、记账、客户等问题"）

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

### Requirement: 左侧面板替换为订单看板
chatbot 页面左侧面板 SHALL 从占位文字替换为订单看板组件（OrderTaskBoard），通过 ResizablePanel 实现与右侧对话区域的可调布局。

#### Scenario: 页面加载展示看板
- **WHEN** 用户进入 chatbot 页面
- **THEN** 左侧面板展示订单看板（而非占位文字"任务看板（后续实现）"）

#### Scenario: 看板与对话区域可调
- **WHEN** 用户拖动 ResizableHandle
- **THEN** 左侧看板和右侧对话区域的宽度比例相应调整

### Requirement: 订单详情弹窗集成
chatbot 页面 SHALL 集成 OrderDetailDialog 弹窗，从看板卡片点击触发。弹窗中执行的操作（结账、取消）完成后 MUST 触发看板刷新。

#### Scenario: 看板卡片点击弹出详情
- **WHEN** 用户点击看板中的订单卡片
- **THEN** 弹出 OrderDetailDialog 展示该订单完整详情

#### Scenario: 详情弹窗操作后看板刷新
- **WHEN** 用户在详情弹窗中执行结账或取消操作并成功
- **THEN** 看板自动刷新对应列的数据

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
