## MODIFIED Requirements

### Requirement: Section 卡片展开态

Section 卡片在展开态下 SHALL 显示完整的消息列表，包括用户消息气泡和助手消息（支持 Markdown 流式渲染）。流式响应期间，当助手消息的 parts 为空时 SHALL 显示"思考中..."脉冲动画。当 Section 处于预渲染状态（Section 创建但 send 尚未完成）时 SHALL 显示用户消息气泡。

#### Scenario: 展开态渲染消息列表
- **WHEN** 一个 Section 处于展开状态
- **THEN** 卡片内显示该节的所有消息，用户消息和助手消息交替排列

#### Scenario: 流式响应中的助手消息
- **WHEN** Section 内的 Agent 正在流式响应
- **THEN** 助手消息实时显示 Markdown 渲染结果，文本逐字增长

#### Scenario: 助手思考状态指示
- **WHEN** Agent 正在流式响应且助手消息的 parts 为空
- **THEN** 在助手消息位置显示"思考中..."脉冲动画文字

#### Scenario: 预渲染用户消息
- **WHEN** 新建的 SectionCard 接收到 initialMessage 属性
- **THEN** 在 Agent 初始化完成前立即显示用户消息气泡，内容为 initialMessage
- **AND** send() 执行后预渲染消息过渡为真实消息，无视觉跳动
