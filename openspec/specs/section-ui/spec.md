# Capability: Section UI

## Purpose

会话中 Section 卡片的 UI 展示组件，支持展开/折叠态切换、消息列表渲染、流式 Markdown 显示、引用操作和活跃节高亮。

## Requirements

### Requirement: Section 卡片展开态

Section 卡片在展开态下 SHALL 显示完整的消息列表，包括用户消息气泡和助手消息（支持 Markdown 流式渲染）。

#### Scenario: 展开态渲染消息列表
- **WHEN** 一个 Section 处于展开状态
- **THEN** 卡片内显示该节的所有消息，用户消息和助手消息交替排列

#### Scenario: 流式响应中的助手消息
- **WHEN** Section 内的 Agent 正在流式响应
- **THEN** 助手消息实时显示 Markdown 渲染结果，文本逐字增长

### Requirement: Section 卡片折叠态

Section 卡片在折叠态下 SHALL 仅显示该节的摘要信息，不实例化 Agent 和加载消息。

#### Scenario: 折叠态显示摘要
- **WHEN** 一个 Section 处于折叠状态
- **THEN** 卡片仅显示节编号和摘要文本（如"查询了本月销售订单"），不加载 JSONL 消息

### Requirement: Section 折叠/展开切换

用户 SHALL 能够手动切换 Section 的折叠/展开状态。

#### Scenario: 点击折叠的 Section 展开
- **WHEN** 用户点击一个折叠的 Section 卡片
- **THEN** 该 Section 展开显示完整消息列表，内部实例化 Agent

#### Scenario: 点击展开的 Section 折叠
- **WHEN** 用户点击一个展开的 Section 卡片的折叠按钮
- **THEN** 该 Section 折叠，释放 Agent 实例，仅显示摘要

### Requirement: 最近 N 节默认展开

进入会话时，系统 SHALL 默认展开最近 3 节 Section，更早的节默认折叠。

#### Scenario: 会话有 5 节
- **WHEN** 当前会话有 5 节 Section
- **THEN** 第 3、4、5 节（最近 3 节）默认展开，第 1、2 节默认折叠

#### Scenario: 会话只有 2 节
- **WHEN** 当前会话只有 2 节 Section
- **THEN** 两节均展开

### Requirement: Section 卡片引用操作

每个 Section 卡片 SHALL 提供引用按钮，点击后将该节设为 PromptInput 的引用目标。

#### Scenario: 点击引用按钮
- **WHEN** 用户点击某个 Section 卡片的引用按钮
- **THEN** PromptInput 进入引用模式，显示被引用的节信息，下一次发送的消息将续接到该节

### Requirement: 活跃节高亮

当前正在接收消息的 Section SHALL 有视觉上的高亮指示，与普通展开节区分。

#### Scenario: 发送消息到某节
- **WHEN** 用户发送消息到某个 Section
- **THEN** 该 Section 视觉高亮（如边框颜色变化），直到流式响应完成
