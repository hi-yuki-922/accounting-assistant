## ADDED Requirements

### Requirement: Chatbot 页面路由与渲染

系统 SHALL 在 `/chatbot` 路由下渲染 Chatbot 页面组件，页面使用 Resizable 组件划分为左右两个面板：左侧为任务看板占位容器（本次不实现内容），右侧为 Section 对话区域。两个面板默认宽度比例为 6:4，右侧面板最小宽度为 320px。

#### Scenario: 用户点击侧边栏"AI 助手"导航
- **WHEN** 用户点击侧边栏或底栏的"AI 助手"入口
- **THEN** 系统导航到 `/chatbot` 路由并渲染 Chatbot 页面

#### Scenario: 页面布局渲染
- **WHEN** Chatbot 页面渲染完成
- **THEN** 页面使用 Resizable Panel Group 划分为左右两个面板
- **AND** 左侧面板为空容器占位（任务看板，后续提案实现）
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

Chatbot 页面 SHALL 协调 PromptInput 的消息发送与目标 Section 的路由。无引用时创建新节并发送，有引用时续接指定节并发送。

#### Scenario: 无引用新建节发送
- **WHEN** 用户在 PromptInput 输入消息并提交
- **AND** 未选择引用任何已有 Section
- **THEN** 系统调用 `route(sessionId)` 创建新节，将消息发送到新节的 `useSectionChat.send()`

#### Scenario: 引用已有节续接
- **WHEN** 用户在 PromptInput 选择引用某个已有 Section
- **AND** 输入消息并提交
- **THEN** 系统将消息发送到引用节的 `useSectionChat.send()`

### Requirement: 会话切换

系统 SHALL 支持用户手动打开会话列表并切换到其他会话。会话列表不默认显示。

#### Scenario: 用户切换会话
- **WHEN** 用户通过 MenuBar 打开会话列表并选择另一个会话
- **THEN** 系统加载选中会话的 Section 列表和摘要，更新当前活跃会话
