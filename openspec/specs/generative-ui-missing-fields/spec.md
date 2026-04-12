# Generative UI Missing Fields

## Purpose

定义必填字段缺失时的信息收集机制，包括 collect_missing_fields 工具、字段映射表和 MissingFieldsForm 组件。

## Requirements

### Requirement: collect_missing_fields 工具

系统 SHALL 提供 `collect_missing_fields` 专用工具，Agent 检测到必填字段缺失时调用此工具收集信息。

工具参数 SHALL 包含：
- `toolName`：目标写入工具名称
- `missingFields`：缺失的必填字段名列表
- `providedParams`：用户已提供的参数（JSON 对象）

#### Scenario: 必填字段缺失检测

- **WHEN** Agent 准备调用写入工具但检测到必填字段缺失
- **THEN** Agent SHALL 调用 `collect_missing_fields` 工具，传入目标工具名称、缺失字段列表和已提供参数
- **AND** 工具 execute SHALL 返回 `{ pending: true, toolName, missingFields, providedParams }`

#### Scenario: 缺失信息收集结束当前 ToolLoop

- **WHEN** `collect_missing_fields` 工具返回 pending 状态
- **THEN** 当前轮次的 ToolLoop SHALL 结束
- **AND** 前端渲染 MissingFieldsForm 组件等待用户填写

### Requirement: writeToolFieldMap 字段映射表

系统 SHALL 维护前端 `writeToolFieldMap` 映射表，定义每个写入工具的必填字段及其表单元素。

映射表 SHALL 覆盖以下写入工具及字段：
- `create_order`：orderType（select）、items（array，嵌套 itemFields）
- `settle_order`：orderId（number）、channel（select）
- `create_record`：title（text）、amount（number）、accountingType（select）、channel（select）、recordTime（datetime）
- `update_record`：id（number）
- `create_write_off`：originalRecordId（number）、amount（number）

`FieldDef` SHALL 支持以下类型：`text`、`number`、`select`、`datetime`、`array`（嵌套 itemFields）。

#### Scenario: select 类型字段定义

- **WHEN** 字段类型为 `select`
- **THEN** FieldDef SHALL 包含 `options` 数组，定义所有可选项的 label 和 value

#### Scenario: array 类型字段定义

- **WHEN** 字段类型为 `array`
- **THEN** FieldDef SHALL 包含 `itemFields` 对象，定义数组中每个元素的子字段结构

### Requirement: MissingFieldsForm 组件

系统 SHALL 提供 `MissingFieldsForm` 组件，根据 `writeToolFieldMap` 动态渲染缺失字段的表单。

#### Scenario: 表单渲染

- **WHEN** 前端收到 `collect_missing_fields` 工具返回的 pending 状态
- **THEN** 系统 SHALL 从 `writeToolFieldMap` 中查找目标工具的字段定义
- **AND** 仅渲染 `missingFields` 列表中指定的字段
- **AND** 每个字段根据其 FieldDef 类型渲染对应的表单控件

#### Scenario: 用户提交表单

- **WHEN** 用户填写完缺失字段并提交表单
- **THEN** 系统 SHALL 注入隐藏 system 消息："用户已补充信息：${JSON.stringify(formData)}。请结合之前提供的 ${JSON.stringify(providedParams)}，调用 ${toolName} 完成操作。"
- **AND** 触发新一轮 ToolLoop，Agent 用完整参数调用写入工具

#### Scenario: 仅必填字段触发

- **WHEN** 用户未提供非必填字段
- **THEN** 系统 SHALL NOT 为非必填字段触发表单收集
- **AND** 非必填字段 SHALL 留空或不传递
