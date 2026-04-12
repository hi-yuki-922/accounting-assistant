# AI Chat Prompt

## Purpose

定义 AI 聊天中 system prompt 的构建策略，包括历史摘要注入的移除和确认模式指令的动态注入。

## Requirements

### Requirement: 移除历史摘要注入

系统 SHALL 删除将历史 Section 摘要注入为 system message 的逻辑。

#### Scenario: useSectionChat 中移除摘要注入

- **WHEN** `useSectionChat` 构建对话上下文
- **THEN** 系统 SHALL NOT 调用 `getSectionSummaries()` 获取历史摘要
- **AND** SHALL NOT 构建 `summaryInjection` 并注入到 system message

#### Scenario: router 中移除摘要注入

- **WHEN** `router.ts` 的 `route()` 函数处理路由结果
- **THEN** 系统 SHALL NOT 获取和注入历史 Section 摘要

#### Scenario: RouteResult 类型清理

- **WHEN** 定义 `RouteResult` 类型
- **THEN** 系统 SHALL 移除 `summaryInjection` 字段

### Requirement: 确认模式指令动态注入

系统 SHALL 根据确认模式状态动态注入对应的 system prompt 指令片段。

#### Scenario: 确认模式 ON 指令

- **WHEN** 确认模式为 ON 且构建 system prompt
- **THEN** 系统 SHALL 注入指令片段："执行写操作前必须调用 confirm_operation 工具请求用户确认"
- **AND** 指令中 SHALL 列出所有写入工具的名称

#### Scenario: 确认模式 OFF 指令

- **WHEN** 确认模式为 OFF 且构建 system prompt
- **THEN** 系统 SHALL 注入指令片段："直接执行写操作，无需确认"

#### Scenario: 指令注入时机

- **WHEN** 用户发送消息触发对话
- **THEN** 确认模式指令 SHALL 在 system prompt 构建阶段注入
- **AND** 指令内容 SHALL 反映当前确认模式的实时状态
