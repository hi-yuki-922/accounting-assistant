# Generative UI Confirmation

## Purpose

定义确认模式下的操作确认机制，包括 confirm_operation 工具、Confirmation 组件交互和确认模式切换 Badge。

## Requirements

### Requirement: confirm_operation 工具

系统 SHALL 提供 `confirm_operation` 专用工具，Agent 在确认模式 ON 时执行写操作前调用此工具请求用户确认。

工具参数 SHALL 包含：
- `toolName`：待执行的写入工具名称
- `params`：待执行的工具参数（JSON 对象）
- `description`：操作的可读描述

#### Scenario: 确认模式下的写操作请求

- **WHEN** 确认模式为 ON 且 Agent 准备执行写操作（create_order、settle_order、create_record、update_record、create_write_off）
- **THEN** Agent SHALL 调用 `confirm_operation` 工具，传入目标工具名称、参数和操作描述
- **AND** 工具 execute SHALL 返回 `{ pending: true, toolName, params, description }`

#### Scenario: 确认操作结束当前 ToolLoop

- **WHEN** `confirm_operation` 工具返回 pending 状态
- **THEN** 当前轮次的 ToolLoop SHALL 结束
- **AND** 前端渲染 Confirmation 组件等待用户操作

### Requirement: Confirmation 组件交互

系统 SHALL 使用 ai-elements 的 `Confirmation` 组件渲染确认请求。

#### Scenario: 用户确认操作

- **WHEN** 用户在 Confirmation 组件中点击确认按钮
- **THEN** 系统 SHALL 注入隐藏 system 消息："用户已确认执行操作。请使用以下参数调用 ${toolName}：${JSON.stringify(params)}"
- **AND** 触发新一轮 ToolLoop，Agent 用完整参数调用实际写入工具

#### Scenario: 用户取消操作

- **WHEN** 用户在 Confirmation 组件中点击取消按钮
- **THEN** 系统 SHALL 注入隐藏 system 消息通知 Agent 操作已取消
- **AND** Agent SHALL 不再执行该写操作，改为回复用户操作已取消

### Requirement: 确认模式切换 Badge

系统 SHALL 在 PromptInput 底部工具栏新增确认模式切换 Badge。

#### Scenario: 默认状态

- **WHEN** 用户首次使用或未设置过确认模式
- **THEN** 确认模式 SHALL 默认为 ON，Badge 显示已开启状态

#### Scenario: 切换确认模式

- **WHEN** 用户点击确认模式 Badge
- **THEN** 系统 SHALL 切换确认模式状态（ON ↔ OFF）
- **AND** 状态 SHALL 持久化到 `localStorage`（key: `confirmation-mode`）

#### Scenario: 确认模式指令注入

- **WHEN** 确认模式为 ON 且用户发送消息
- **THEN** 系统 SHALL 在 system prompt 中注入指令："执行写操作前必须调用 confirm_operation 工具请求用户确认"

#### Scenario: 非确认模式指令

- **WHEN** 确认模式为 OFF 且用户发送消息
- **THEN** 系统 SHALL 在 system prompt 中注入指令："直接执行写操作，无需确认"

### Requirement: 写入工具清单定义

系统 SHALL 明确定义以下工具为写入工具，需在确认模式下触发确认流程：`create_order`、`settle_order`、`create_record`、`update_record`、`create_write_off`。

#### Scenario: 写入工具清单传递给 Agent

- **WHEN** 注入确认模式相关 system prompt
- **THEN** prompt 中 SHALL 明确列举所有写入工具的名称，指导 Agent 识别哪些操作需要确认
