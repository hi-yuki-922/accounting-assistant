# Section LLM Summary

## Purpose

定义使用 LLM 生成 Section 摘要的机制，包括摘要生成触发、输入输出格式、失败 fallback 和独立 Provider 隔离。

## Requirements

### Requirement: LLM 生成 Section 摘要

系统 SHALL 在 Section 对话流完成后，调用轻量 LLM 模型（glm-4-flash）生成摘要，替代当前的工具结果拼接策略。

#### Scenario: 流完成后触发摘要生成

- **WHEN** Section 的对话流完成（所有 ToolLoop 结束）
- **THEN** 系统 SHALL 调用 `glm-4-flash` 模型，基于用户在该 Section 的首条消息生成摘要
- **AND** 摘要 SHALL 不超过 30 个字

#### Scenario: LLM 摘要输入

- **WHEN** 调用 LLM 生成摘要
- **THEN** 输入 SHALL 仅使用用户在 Section 的首条消息内容
- **AND** 输入 SHALL NOT 包含工具调用结果或其他上下文

#### Scenario: LLM 摘要输出格式

- **WHEN** LLM 返回摘要结果
- **THEN** 结果 SHALL 为 JSON 格式：`{ "title": "...", "summary": "..." }`
- **AND** title 不超过 10 个字
- **AND** summary 不超过 30 个字

### Requirement: SectionSummary 新增 title 字段

系统 SHALL 在 `SectionSummary` 类型中新增 `title: string` 字段。

#### Scenario: title 字段存储

- **WHEN** LLM 生成摘要成功
- **THEN** 系统 SHALL 将返回的 title 存入 SectionSummary 的 `title` 字段
- **AND** 将 summary 存入 SectionSummary 的 `summary` 字段

### Requirement: SectionCard 标题展示优化

系统 SHALL 在 SectionCard 中使用语义化 title 替代"对话节 #N"显示。

#### Scenario: 折叠态标题展示

- **WHEN** SectionCard 处于折叠状态
- **THEN** 系统 SHALL 显示 SectionSummary 的 `title` 字段值
- **AND** 不再显示"对话节 #N"格式的标题

#### Scenario: 展开态标题展示

- **WHEN** SectionCard 处于展开状态
- **THEN** 系统 SHALL 显示 SectionSummary 的 `title` 字段值作为标题

### Requirement: LLM 摘要失败 fallback

系统 SHALL 在 LLM 摘要生成失败时提供 fallback 策略。

#### Scenario: LLM 调用失败

- **WHEN** LLM 摘要生成调用失败（网络错误、模型异常等）
- **THEN** 系统 SHALL 截取用户首条消息的前 20 个字符作为 title
- **AND** 不阻塞用户的其他操作

### Requirement: 独立 LLM Provider 实例

系统 SHALL 使用独立于主对话 Agent 的 provider 实例调用摘要 LLM。

#### Scenario: Provider 隔离

- **WHEN** 调用摘要生成
- **THEN** 系统 SHALL 使用 `glm-4-flash` 模型的独立 provider 实例
- **AND** 该实例 SHALL NOT 影响主对话模型（glm-4-plus）的配置和调用
