## ADDED Requirements

### Requirement: 会话元数据存储在 SQLite
系统 SHALL 在 SQLite 数据库中使用 `chat_session` 表存储会话元数据，包含以下字段：
- `id` (i64) — 主键，日期序列格式 YYYYMMDDNNNNN
- `title` (String) — 会话标题
- `created_at` (NaiveDateTime) — 创建时间
- `updated_at` (NaiveDateTime) — 更新时间

#### Scenario: 创建会话
- **WHEN** 创建新会话
- **THEN** 系统自动生成 ID，记录创建时间和更新时间，`title` 默认为"新对话"

#### Scenario: 会话表不含旧字段
- **WHEN** 查看 `chat_session` 表结构
- **THEN** 表中不存在 `model` 和 `system_prompt` 字段

### Requirement: 对话节 JSONL 文件存储
系统 SHALL 将每节对话的原始 LLM 输入输出存储为 JSONL 文件，文件位于 `appdata/sessions/session_{id}/section_{seq}.jsonl`。

#### Scenario: JSONL 文件路径结构
- **WHEN** 会话 ID 为 20260408001，第 1 节对话
- **THEN** JSONL 文件路径为 `appdata/sessions/session_20260408001/section_001.jsonl`

#### Scenario: 一个会话一个文件夹
- **WHEN** 查看会话存储目录
- **THEN** 每个会话对应 `appdata/sessions/` 下的一个文件夹，文件夹内包含一个或多个 JSONL 文件

### Requirement: JSONL 格式遵循 OpenAI Chat Completion 规范
每行 JSONL SHALL 为一条完整的 LLM 消息，遵循 OpenAI Chat Completion 消息格式，包含 `role`、`content`、`tool_calls`、`tool_call_id` 等标准字段。

#### Scenario: 用户消息格式
- **WHEN** 用户发送消息
- **THEN** JSONL 中追加一行 `{"role":"user","content":"用户输入内容"}`

#### Scenario: 工具调用消息格式
- **WHEN** Assistant 发起工具调用
- **THEN** JSONL 中追加一行 `{"role":"assistant","content":null,"tool_calls":[{"id":"...","type":"function","function":{"name":"...","arguments":"..."}}]}`

#### Scenario: 工具结果消息格式
- **WHEN** 工具返回结果
- **THEN** JSONL 中追加一行 `{"role":"tool","tool_call_id":"...","content":"..."}`

### Requirement: 对话节上下文独立
每节对话的上下文 SHALL 独立，加载对话时仅加载当前节的 JSONL 文件内容作为 Agent 的 messages 数组，不加载其他节的内容。

#### Scenario: 新节不包含旧节消息
- **WHEN** 用户创建新的对话节
- **THEN** Agent 的 messages 数组不包含之前节中的任何消息

### Requirement: 节摘要存储
系统 SHALL 在 SQLite 中使用 `section_summary` 表存储每节对话的摘要，包含以下字段：
- `id` (i64) — 主键
- `session_id` (i64) — 关联会话 ID
- `section_file` (String) — 对应的 JSONL 文件名
- `summary` (String) — 摘要内容
- `created_at` (NaiveDateTime) — 创建时间

#### Scenario: 节摘要表存在
- **WHEN** 查看数据库表列表
- **THEN** 包含 `section_summary` 表，字段为 id、session_id、section_file、summary、created_at

### Requirement: 节间摘要注入
新对话节开始时，系统 SHALL 将同一会话下之前所有节的摘要注入 Agent 的 system prompt 中，格式为"以下是本会话之前节摘要：..."。

#### Scenario: 首节无摘要注入
- **WHEN** 会话中创建第 1 节对话
- **THEN** system prompt 中不包含节摘要

#### Scenario: 后续节注入之前节摘要
- **WHEN** 会话中创建第 3 节对话，且第 1、2 节已有摘要
- **THEN** system prompt 中包含第 1、2 节的摘要内容

### Requirement: 节摘要生成方式
系统 SHALL 优先从 tool 调用结果中自动提取结构化摘要。当一节对话内没有 tool 调用时，使用 LLM 生成自然语言摘要。

#### Scenario: 有 tool 调用的节自动提取摘要
- **WHEN** 一节对话中包含 `create_order` 工具调用且成功
- **THEN** 自动从工具返回结果中提取摘要，如"创建销售订单 ORD-20260408-00001，客户张三，总计¥40"

#### Scenario: 无 tool 调用的节 LLM 生成摘要
- **WHEN** 一节对话中没有任何工具调用
- **THEN** 使用 LLM 对对话内容生成简短摘要

### Requirement: 前端使用 tauri-plugin-fs 读写文件
系统 SHALL 使用 `tauri-plugin-fs` 插件在前端直接读写 JSONL 文件，所有文件操作基于 `BaseDirectory.AppData`。

#### Scenario: 追加消息到 JSONL
- **WHEN** 需要向对话节追加新消息
- **THEN** 使用 `open` API 以 `append: true` 模式打开文件，写入一行 JSON 后关闭

#### Scenario: 读取节内全部消息
- **WHEN** 需要加载对话节的完整上下文
- **THEN** 使用 `readTextFileLines` API 逐行读取 JSONL 文件，每行解析为消息对象

#### Scenario: 创建会话文件夹
- **WHEN** 创建新会话
- **THEN** 使用 `mkdir` API 在 `sessions/` 下创建以会话 ID 命名的文件夹，`recursive: true`

#### Scenario: 删除会话
- **WHEN** 删除会话
- **THEN** 使用 `remove` API 删除会话文件夹，`recursive: true`，同时删除 SQLite 中的元数据和节摘要

### Requirement: JSONL 读取容错
读取 JSONL 文件时 SHALL 逐行解析，跳过格式无效的行，不因单行解析失败而中断整个文件读取。

#### Scenario: 遇到无效行跳过
- **WHEN** JSONL 文件中某行不是有效 JSON
- **THEN** 系统跳过该行，继续解析后续行，记录警告日志

### Requirement: 移除旧的消息存储表
系统 SHALL 移除 `chat_message` 和 `chat_message_seq` 两张表及对应的 Rust 实体和服务代码。

#### Scenario: 旧表已移除
- **WHEN** 查看数据库表列表
- **THEN** 不存在 `chat_message` 和 `chat_message_seq` 表

### Requirement: 后端 ChatService 重构
后端 `ChatService` SHALL 重写为仅管理会话元数据和节摘要的 CRUD 操作，不再处理消息的创建、更新、查询。

#### Scenario: ChatService 提供会话 CRUD
- **WHEN** 调用 ChatService
- **THEN** 支持 create_session、get_all_sessions、get_session_by_id、update_session_title、delete_session

#### Scenario: ChatService 提供节摘要 CRUD
- **WHEN** 调用 ChatService
- **THEN** 支持 create_section_summary、get_summaries_by_session

#### Scenario: ChatService 不再处理消息
- **WHEN** 查看 ChatService 方法列表
- **THEN** 不存在 create_message、get_messages_by_session、update_message_content、update_message_state 方法
