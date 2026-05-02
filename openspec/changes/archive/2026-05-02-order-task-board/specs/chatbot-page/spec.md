## ADDED Requirements

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
