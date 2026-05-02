## ADDED Requirements

### Requirement: 通知工具定义
系统 SHALL 定义 `notify_board_refresh` AI 工具，用于在 AI 写操作成功后通知看板刷新数据。该工具为纯信号工具，不执行业务逻辑。

#### Scenario: 工具注册
- **WHEN** 调用 `getAllTools()`
- **THEN** 返回的工具对象包含 `notify_board_refresh` 工具

#### Scenario: 工具入参
- **WHEN** 注册 `notify_board_refresh` 工具
- **THEN** 入参为 `{ orderType: 'Sales' | 'Purchase' | 'All' }`，必填，指示需要刷新的订单类型

#### Scenario: 工具执行返回
- **WHEN** 执行 `notify_board_refresh` 工具
- **THEN** 返回 `{ refreshed: true }`，同时通过事件发射器发出 `order-board:refresh` 事件，携带 orderType 参数

### Requirement: 通知工具描述
`notify_board_refresh` 工具的 description SHALL 指示 AI 在订单写操作（创建订单、结账订单、取消订单）成功后调用此工具，并根据操作的订单类型传入对应的 orderType。

#### Scenario: 创建销售订单后通知
- **WHEN** AI 成功创建销售订单后
- **THEN** AI 调用 `notify_board_refresh({ orderType: 'Sales' })`

#### Scenario: 结账采购订单后通知
- **WHEN** AI 成功结账采购订单后
- **THEN** AI 调用 `notify_board_refresh({ orderType: 'Purchase' })`

#### Scenario: 取消订单后通知
- **WHEN** AI 成功取消订单后
- **THEN** AI 调用 `notify_board_refresh({ orderType: 'All' })`（因取消操作影响已取消列）

### Requirement: 前端事件订阅
看板组件 SHALL 订阅 `order-board:refresh` 事件，收到事件后根据 orderType 参数刷新对应列的数据。

#### Scenario: 订阅事件并刷新
- **WHEN** 看板组件挂载
- **THEN** 订阅 `order-board:refresh` 事件

#### Scenario: 组件卸载取消订阅
- **WHEN** 看板组件卸载
- **THEN** 取消 `order-board:refresh` 事件订阅，避免内存泄漏

### Requirement: 事件发射器实例
系统 SHALL 提供一个全局事件发射器实例，供通知工具和看板组件共享使用。

#### Scenario: 事件发射器单例
- **WHEN** 通知工具 execute 和看板组件分别引入事件发射器
- **THEN** 使用同一个发射器实例，确保事件能正确传递
