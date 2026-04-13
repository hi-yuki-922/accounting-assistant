## ADDED Requirements

### Requirement: 展示工具定义

系统 SHALL 定义四个纯展示型工具，不执行业务逻辑，仅作为 AI 通知前端渲染结构化 UI 的信号。

#### Scenario: display_order_list 工具定义
- **WHEN** 注册 `display_order_list` 工具
- **THEN** 工具 SHALL 无输入参数，execute 返回 `{ displayed: true }`
- **AND** 工具 description SHALL 指示：搜索订单后调用此工具以卡片形式展示结果，不要以 Markdown 表格输出

#### Scenario: display_order_detail 工具定义
- **WHEN** 注册 `display_order_detail` 工具
- **THEN** 工具 SHALL 无输入参数，execute 返回 `{ displayed: true }`
- **AND** 工具 description SHALL 指示：查询订单详情后调用此工具以卡片形式展示

#### Scenario: display_record_list 工具定义
- **WHEN** 注册 `display_record_list` 工具
- **THEN** 工具 SHALL 无输入参数，execute 返回 `{ displayed: true }`
- **AND** 工具 description SHALL 指示：搜索或创建记账记录后调用此工具以卡片形式展示结果

#### Scenario: display_operation_result 工具定义
- **WHEN** 注册 `display_operation_result` 工具
- **THEN** 工具 SHALL 无输入参数，execute 返回 `{ displayed: true }`
- **AND** 工具 description SHALL 指示：执行写操作（结账、冲账、查询基础资料）后调用此工具展示操作结果

### Requirement: 展示工具注册

展示工具 SHALL 注册到 Agent 工具列表中，归类为 `'display'` 类别。

#### Scenario: getAllTools 包含展示工具
- **WHEN** 调用 `getAllTools()`
- **THEN** 返回的工具对象 SHALL 包含 `display_order_list`、`display_order_detail`、`display_record_list`、`display_operation_result` 四个工具

#### Scenario: 按类别加载展示工具
- **WHEN** 调用 `getToolsByCategory('display')`
- **THEN** 返回仅包含四个展示工具的对象

### Requirement: 展示工具不影响 Agent 循环

展示工具的 execute 返回正常结果（非 pending），Agent 循环 SHALL 继续执行。

#### Scenario: 展示工具调用后 Agent 继续生成文本
- **WHEN** Agent 调用展示工具
- **THEN** Agent 收到 `{ displayed: true }` 结果后继续生成文本响应
