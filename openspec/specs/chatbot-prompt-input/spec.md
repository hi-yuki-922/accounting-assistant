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

### Requirement: PromptInput 确认模式切换

PromptInput 组件 SHALL 使用 shadcn Badge 组件作为操作确认状态的切换控件。Badge 文本统一为"操作确认"，关闭状态使用 outline 变体，开启状态使用浅蓝色样式。

#### Scenario: 确认模式关闭状态
- **WHEN** 确认模式为 off
- **THEN** Badge 使用 `variant="outline"` 样式，文本显示"操作确认"

#### Scenario: 确认模式开启状态
- **WHEN** 确认模式为 on
- **THEN** Badge 使用浅蓝色背景样式（`bg-blue-100 text-blue-700`，暗色模式 `dark:bg-blue-900 dark:text-blue-300`），文本显示"操作确认"

#### Scenario: 点击切换确认模式
- **WHEN** 用户点击 Badge
- **THEN** 确认模式在 on/off 之间切换，状态持久化到 localStorage
- **AND** Badge 样式立即更新为对应状态

#### Scenario: 确认模式状态恢复
- **WHEN** PromptInput 组件挂载
- **THEN** 从 localStorage 读取确认模式状态，Badge 显示为对应的样式
