# AI Chat Tools

## Purpose

定义 AI 聊天中的交互型工具，包括 confirm_operation 和 collect_missing_fields 工具的注册与执行行为。

## Requirements

### Requirement: 新增 confirm_operation 交互型工具

系统 SHALL 注册 `confirm_operation` 工具到 Agent 的工具列表中。

#### Scenario: 工具 schema 定义

- **WHEN** 注册 `confirm_operation` 工具
- **THEN** 工具 SHALL 接受参数：`toolName`（string，目标写入工具名称）、`params`（object，工具参数）、`description`（string，操作描述）

#### Scenario: 工具 execute 行为

- **WHEN** Agent 调用 `confirm_operation` 工具
- **THEN** 工具 execute SHALL 返回 `{ pending: true, toolName, params, description }`
- **AND** 不执行实际的写操作

#### Scenario: 工具描述

- **WHEN** Agent 查看工具列表
- **THEN** `confirm_operation` 工具描述 SHALL 说明：用于在执行写操作前请求用户确认，仅在确认模式 ON 时使用

### Requirement: 新增 collect_missing_fields 交互型工具

系统 SHALL 注册 `collect_missing_fields` 工具到 Agent 的工具列表中。

#### Scenario: 工具 schema 定义

- **WHEN** 注册 `collect_missing_fields` 工具
- **THEN** 工具 SHALL 接受参数：`toolName`（string，目标写入工具名称）、`missingFields`（string[]，缺失字段列表）、`providedParams`（object，已提供参数）

#### Scenario: 工具 execute 行为

- **WHEN** Agent 调用 `collect_missing_fields` 工具
- **THEN** 工具 execute SHALL 返回 `{ pending: true, toolName, missingFields, providedParams }`
- **AND** 不执行实际的写操作

#### Scenario: 工具描述

- **WHEN** Agent 查看工具列表
- **THEN** `collect_missing_fields` 工具描述 SHALL 说明：用于在必填字段缺失时收集用户补充信息

### Requirement: 交互型工具标记机制

系统 SHALL 为交互型工具（confirm_operation、collect_missing_fields）提供标记机制，区分其与普通业务工具的行为差异。

#### Scenario: pending 状态标识

- **WHEN** 交互型工具 execute 返回 pending 状态
- **THEN** 前端 SHALL 识别 pending 状态并渲染对应的交互组件（Confirmation 或 MissingFieldsForm）
- **AND** 不将其视为普通的工具执行完成

### Requirement: 展示工具使用 Prompt 指令

Agent 系统提示词 SHALL 包含展示工具的使用指令，约束 AI 的结果展示行为。

#### Scenario: 搜索结果必须通过展示工具展示
- **WHEN** AI 使用搜索工具获取结果
- **THEN** AI SHALL 调用对应的展示工具呈现结果，不直接以 Markdown 表格或列表输出

#### Scenario: 写操作结果通过展示工具展示
- **WHEN** AI 执行写操作（创建订单、记账、结账等）成功
- **THEN** AI SHALL 调用对应的展示工具展示操作结果

#### Scenario: AI 用自然语言总结结果
- **WHEN** AI 调用展示工具后
- **THEN** AI SHALL 用简短的自然语言对结果进行总结，不重复展示工具已呈现的详细数据

#### Scenario: 搜索与展示工具的对应关系
- **WHEN** AI 查看工具列表
- **THEN** 展示工具的 description SHALL 明确说明其对应的搜索/写操作工具，帮助 AI 正确匹配
