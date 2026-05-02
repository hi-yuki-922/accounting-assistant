# AI Chat Section

## Purpose

定义 Section（对话节）的数据模型和 SectionSummary 的新增字段。

## Requirements

### Requirement: SectionSummary 新增 title 字段

系统 SHALL 在 `SectionSummary` 类型中新增 `title: string` 字段，用于存储 LLM 生成的语义化标题。

#### Scenario: 类型定义

- **WHEN** 定义 SectionSummary 类型
- **THEN** 类型 SHALL 包含 `title: string` 字段（语义化标题）和 `summary: string` 字段（对话摘要）

#### Scenario: title 字段序列化

- **WHEN** 持久化 SectionSummary 到 JSON
- **THEN** `title` 字段 SHALL 一并序列化存储

### Requirement: SectionCard 标题展示使用 title

系统 SHALL 将 SectionCard 的标题展示从"对话节 #N"改为使用 SectionSummary 的 title 字段。

#### Scenario: 折叠态标题

- **WHEN** SectionCard 处于折叠状态且 SectionSummary 存在 title
- **THEN** 系统 SHALL 显示 title 作为折叠态标题

#### Scenario: 展开态标题

- **WHEN** SectionCard 处于展开状态且 SectionSummary 存在 title
- **THEN** 系统 SHALL 显示 title 作为展开态标题

#### Scenario: title 为空时的 fallback

- **WHEN** SectionSummary 的 title 为空或未设置
- **THEN** 系统 SHALL fallback 到原有"对话节 #N"格式显示
