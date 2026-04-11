# Capability: Session Management Hooks

## Purpose

管理会话列表和 Section 列表的 React hooks，提供会话创建/切换/删除、节列表加载/折叠/摘要刷新等功能。

## Requirements

### Requirement: useSessionList 会话管理

`useSessionList` hook SHALL 管理会话列表状态和当前活跃会话，提供会话切换、创建、删除等操作。

#### Scenario: 初始化加载会话列表
- **WHEN** `useSessionList` 挂载
- **THEN** hook 调用 `getAllSessions()` 加载全部会话列表，设置到 `sessions` 状态

#### Scenario: 切换活跃会话
- **WHEN** 调用 `switchSession(id)`
- **THEN** `activeSessionId` 更新为目标会话 ID，触发下游 `useSectionList` 重新加载

#### Scenario: 创建新会话
- **WHEN** 调用 `createSession()`
- **THEN** hook 调用 `session-store.createSession()` 创建会话，追加到 `sessions` 列表，并设为活跃会话

#### Scenario: 删除会话
- **WHEN** 调用 `deleteSession(id)`
- **THEN** hook 调用 `session-store.deleteSession(id)` 删除会话，从列表移除。若删除的是活跃会话则切换到列表中第一个会话

### Requirement: useSessionList 加载今日最后会话

`useSessionList` SHALL 提供 `loadTodayLastSession()` 方法，用于首次进入页面时自动加载。

#### Scenario: 今日有会话
- **WHEN** 调用 `loadTodayLastSession()`
- **AND** 今日存在已创建的会话
- **THEN** `activeSessionId` 设为今日最后创建的会话 ID

#### Scenario: 今日无会话
- **WHEN** 调用 `loadTodayLastSession()`
- **AND** 今日不存在任何会话
- **THEN** 自动调用 `createSession()` 创建新会话并设为活跃

### Requirement: useSectionList 节列表管理

`useSectionList` hook SHALL 管理指定会话下的 Section 列表和摘要，提供节展开/折叠状态管理。

#### Scenario: 加载会话的节列表
- **WHEN** `useSectionList(sessionId)` 的 `sessionId` 发生变化
- **THEN** hook 调用 `getSectionSummaries(sessionId)` 加载所有节摘要，设置到 `summaries` 状态

#### Scenario: 新增节
- **WHEN** 调用 `addSection(sectionFile)`
- **THEN** 新节追加到 `sections` 列表，默认为展开状态，设为活跃节

#### Scenario: 切换活跃节
- **WHEN** 调用 `setActive(sectionFile)`
- **THEN** `activeSectionFile` 更新为目标节文件名

#### Scenario: 折叠/展开切换
- **WHEN** 调用 `toggleCollapse(sectionFile)`
- **THEN** 目标节的折叠状态切换。折叠时不卸载消息，仅在 UI 上隐藏

### Requirement: useSectionList 默认展开逻辑

`useSectionList` SHALL 根据节列表自动计算哪些节需要默认展开（最近 3 节）。

#### Scenario: 节数量超过 3
- **WHEN** 会话有 N 节（N > 3）
- **THEN** 最近 3 节自动设为展开状态，其余为折叠状态

#### Scenario: 节数量不超过 3
- **WHEN** 会话有 N 节（N ≤ 3）
- **THEN** 所有节均设为展开状态

### Requirement: useSectionList 摘要刷新

`useSectionList` SHALL 支持在节摘要生成后刷新摘要列表。

#### Scenario: 摘要更新后刷新
- **WHEN** 调用 `refreshSummaries()`
- **THEN** hook 重新调用 `getSectionSummaries(sessionId)` 更新 `summaries` 状态
