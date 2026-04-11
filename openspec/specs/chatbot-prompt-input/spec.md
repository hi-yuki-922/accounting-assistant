# Capability: Chatbot PromptInput

## Purpose

Chatbot 页面的消息输入组件，提供文本输入、发送、流式状态控制、引用模式和 Section 索引功能。

## Requirements

### Requirement: PromptInput 基础输入

PromptInput 组件 SHALL 提供文本输入框和发送按钮，支持用户输入消息并发送。

#### Scenario: 输入文本并发送
- **WHEN** 用户在输入框输入文本并点击发送按钮或按 Enter
- **THEN** 组件调用 `onSubmit(text)` 回调，清空输入框

#### Scenario: 空消息不发送
- **WHEN** 用户在输入框未输入任何内容并尝试发送
- **THEN** 组件不触发 `onSubmit` 回调

### Requirement: PromptInput 流式状态

PromptInput 组件 SHALL 在 Agent 流式响应期间显示停止按钮，替代发送按钮。

#### Scenario: 流式中显示停止按钮
- **WHEN** `isStreaming` 为 `true`
- **THEN** 发送按钮变为停止按钮，点击后调用 `onStop()` 回调

#### Scenario: 流式完成后恢复发送按钮
- **WHEN** `isStreaming` 变为 `false`
- **THEN** 停止按钮恢复为发送按钮

### Requirement: PromptInput 引用模式

PromptInput 组件 SHALL 支持引用已有 Section 续接模式。引用时显示被引用节的信息，发送消息时传递引用标识。

#### Scenario: 进入引用模式
- **WHEN** 用户通过 Section 卡片的引用按钮或 Section 索引选择某个节
- **THEN** PromptInput 显示被引用节的信息（如节编号和摘要），进入引用模式

#### Scenario: 引用模式下发送消息
- **WHEN** PromptInput 处于引用模式且用户发送消息
- **THEN** `onSubmit(text, referenceSectionFile)` 回调包含引用的节文件名

#### Scenario: 取消引用模式
- **WHEN** 用户点击引用信息旁的取消按钮
- **THEN** PromptInput 退出引用模式，下一次发送将创建新节

### Requirement: Section 索引 Popover

PromptInput 区域 SHALL 提供 Section 索引入口，以 Popover 形式展示当前会话所有节的列表，支持快速跳转和引用。

#### Scenario: 打开 Section 索引
- **WHEN** 用户点击 Section 索引按钮
- **THEN** 以 Popover 形式展示当前会话所有节的列表，每节显示编号和摘要

#### Scenario: 从索引跳转到节
- **WHEN** 用户在 Popover 中点击某节
- **THEN** SectionList 自动滚动到目标节并展开

#### Scenario: 从索引引用节
- **WHEN** 用户在 Popover 中点击某节的引用按钮
- **THEN** PromptInput 进入引用模式，指向该节
