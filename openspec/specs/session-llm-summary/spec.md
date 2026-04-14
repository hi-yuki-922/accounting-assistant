# Capability: Session LLM Summary

## Purpose

支持基于 LLM 自动生成会话摘要和标题，扩展 Session Schema 以存储摘要相关字段，异步后台执行摘要生成任务。

## Requirements

### Requirement: Session Schema 扩展

Session 实体 SHALL 新增三个字段以支持 LLM 摘要和标题生成功能。

#### Scenario: 新建会话的默认值
- **WHEN** 创建新会话
- **THEN** session 记录的 `summary` 为 null，`title_auto_generated` 为 true，`summary_generated` 为 false

#### Scenario: Schema 迁移
- **WHEN** 系统启动时检测到旧 Schema
- **THEN** 自动执行迁移，为已有 session 记录补充新字段的默认值（summary=null, title_auto_generated=true, summary_generated=false）

### Requirement: LLM 会话摘要与标题生成

系统 SHALL 支持基于 LLM 自动生成会话摘要和标题，生成仅执行一次。

#### Scenario: 自动触发摘要生成
- **WHEN** 用户新建会话
- **AND** 旧会话（当前会话）的 summary_generated 为 false
- **THEN** 系统收集旧会话所有 Section 摘要，异步调用 LLM 生成会话摘要
- **AND** 如果旧会话的 title_auto_generated 为 true，LLM 同时生成会话标题
- **AND** 生成完成后更新 session 记录，summary_generated 设为 true

#### Scenario: 手动触发摘要生成
- **WHEN** 用户在会话列表中点击"生成摘要"
- **AND** 该会话的 summary_generated 为 false
- **THEN** 系统异步调用 LLM 生成摘要和标题（遵循 title_auto_generated 规则）
- **AND** 生成完成后更新 session 记录，summary_generated 设为 true

#### Scenario: 跳过已生成摘要的会话
- **WHEN** summary_generated 为 true
- **THEN** 系统不执行任何摘要生成操作

#### Scenario: 用户重命名后不再自动生成标题
- **WHEN** 用户手动重命名会话标题
- **THEN** title_auto_generated 设为 false
- **AND** 后续 LLM 摘要生成时不再更新标题（仅更新摘要）

#### Scenario: 摘要生成失败处理
- **WHEN** LLM 调用失败
- **THEN** summary_generated 保持 false，不自动重试，用户可手动再次触发

### Requirement: 摘要生成异步执行

LLM 摘要生成 SHALL 异步后台执行，不阻塞页面正常操作。

#### Scenario: 异步执行不阻塞 UI
- **WHEN** 摘要生成任务启动
- **THEN** 用户可正常使用页面（发送消息、切换会话等），不感知后台任务

#### Scenario: 生成完成后刷新 UI
- **WHEN** 摘要生成完成
- **THEN** 会话列表中对应会话的标题和摘要自动更新（如果 Sheet 打开则即时刷新）
