## ADDED Requirements

### Requirement: 提示词文件使用 Markdown 格式
所有系统提示词 SHALL 使用 Markdown 格式存储在文件系统中，不硬编码在代码中。

#### Scenario: 提示词文件格式
- **WHEN** 查看任意提示词文件
- **THEN** 文件扩展名为 `.md`，内容为 Markdown 格式的文本

### Requirement: 提示词分层存储
提示词文件 SHALL 按层次存储在 `src/ai/prompts/` 目录下：
- `shared/` — 共享层提示词（base.md、guardrails.md、domain-knowledge.md）
- `agents/` — 角色层提示词（team-leader.md 等）

#### Scenario: 共享层文件存在
- **WHEN** 查看 `src/ai/prompts/shared/` 目录
- **THEN** 包含 `base.md`、`guardrails.md`、`domain-knowledge.md` 三个文件

#### Scenario: 角色层文件存在
- **WHEN** 查看 `src/ai/prompts/agents/` 目录
- **THEN** 包含 `team-leader.md` 文件

### Requirement: 运行时动态加载提示词
系统 SHALL 在运行时动态读取提示词文件，而非在编译时嵌入。使用 `tauri-plugin-fs` 的 `readTextFile` API 读取文件内容。

#### Scenario: 首次创建 Agent 时加载提示词
- **WHEN** 首次创建 Agent 实例
- **THEN** 系统从文件系统读取对应的 Markdown 文件，解析为系统提示词字符串

#### Scenario: 提示词文件更新后生效
- **WHEN** 修改提示词 Markdown 文件后创建新的 Agent 实例
- **THEN** 新 Agent 使用更新后的提示词内容

### Requirement: 提示词组合拼装
系统 SHALL 支持按规则组合多个提示词文件为完整的系统提示词。组合规则定义在代码中，提示词内容定义在文件中。

#### Scenario: 事务组长提示词组合
- **WHEN** 为事务组长角色加载提示词
- **THEN** 按顺序拼接 `base.md` + `guardrails.md` + `domain-knowledge.md` + `team-leader.md` 的内容

#### Scenario: 各文件之间有分隔
- **WHEN** 组合多个提示词文件
- **THEN** 各文件内容之间使用换行符分隔

### Requirement: 提示词加载错误处理
系统 SHALL 在提示词文件读取失败时提供明确的错误信息，不静默忽略。

#### Scenario: 文件不存在时报错
- **WHEN** 尝试加载不存在的提示词文件
- **THEN** 抛出或返回明确的错误信息，包含文件路径

#### Scenario: 文件内容为空时正常处理
- **WHEN** 提示词文件存在但内容为空
- **THEN** 该文件贡献空字符串到组合结果中，不影响其他文件的加载
