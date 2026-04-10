## 1. 目录结构与类型定义

- [ ] 1.1 创建 `src/components/chatbot/` 目录及子目录结构
- [ ] 1.2 创建 `src/components/chatbot/types.ts`，定义消息展示类型（`DisplayMessage`、`ChatStatus` 等），将 `JSONLMessage` 映射为 UI 友好的类型

## 2. Hook 层 — 会话与节管理

- [ ] 2.1 创建 `src/hooks/use-session-list.ts`：实现 `useSessionList` hook，包含 `sessions`、`activeSessionId`、`switchSession`、`createSession`、`deleteSession`、`loadTodayLastSession`
- [ ] 2.2 创建 `src/hooks/use-section-list.ts`：实现 `useSectionList` hook，包含 `sections`、`summaries`、`activeSectionFile`、`addSection`、`setActive`、`toggleCollapse`、`refreshSummaries`，实现最近 3 节默认展开逻辑

## 3. Hook 层 — Section 对话

- [ ] 3.1 创建 `src/hooks/use-section-chat.ts`：实现 `useSectionChat` hook 的基础框架 — 消息状态（`messages`、`isStreaming`、`error`）、初始化时从 JSONL 加载历史消息
- [ ] 3.2 实现 `send(content)` 方法：写入用户消息 → 创建 Agent 实例（首次）→ 调用 `agent.stream({ messages })` → 消费 `fullStream` 实时更新 `messages` 状态
- [ ] 3.3 实现流式完成后逻辑：将完整消息一次性写入 JSONL → 调用摘要生成 → 调用 `createSectionSummary` 保存
- [ ] 3.4 实现 `stop()` 方法：通过 `AbortController` 中断流式响应，将已接收内容写入 JSONL
- [ ] 3.5 实现错误处理：API Key 未配置、网络请求失败等场景捕获错误并设置 `error` 状态
- [ ] 3.6 实现 `useImperativeHandle` 暴露 `send()` 和 `stop()` 给父组件

## 4. 组件层 — Section 卡片

- [ ] 4.1 创建 `src/components/chatbot/section-card.tsx`：Section 卡片组件，支持展开/折叠态切换，折叠态显示节编号和摘要，展开态渲染 MessageList
- [ ] 4.2 实现展开态的消息列表渲染：遍历 `messages` 渲染用户消息和助手消息
- [ ] 4.3 实现折叠/展开切换时 Agent 实例的生命周期管理（展开时 hook 挂载，折叠时 hook 卸载）
- [ ] 4.4 实现引用按钮和活跃节高亮样式

## 5. 组件层 — 消息渲染

- [ ] 5.1 创建 `src/components/chatbot/user-message.tsx`：用户消息气泡组件
- [ ] 5.2 创建 `src/components/chatbot/assistant-message.tsx`：助手消息组件，支持 Markdown 渲染和流式文本增量显示

## 6. 组件层 — PromptInput

- [ ] 6.1 创建 `src/components/chatbot/prompt-input.tsx`：底部输入框组件，包含文本输入、发送按钮、流式状态下的停止按钮
- [ ] 6.2 实现引用模式：显示被引用节信息、支持取消引用、发送时传递引用标识
- [ ] 6.3 创建 `src/components/chatbot/section-index-popover.tsx`：Section 索引 Popover，展示所有节列表，支持跳转和引用操作

## 7. 组件层 — MenuBar

- [ ] 7.1 创建 `src/components/chatbot/menu-bar.tsx`：菜单栏组件，显示会话标题、Section 索引入口、模型切换控件

## 8. 页面集成

- [ ] 8.1 创建 `src/routes/chatbot.tsx`：Chatbot 页面组件，组装 MenuBar + SectionList + PromptInput，协调 hooks 之间的数据流
- [ ] 8.2 实现首次进入逻辑：调用 `loadTodayLastSession()`，无会话时自动创建
- [ ] 8.3 实现消息路由：PromptInput 提交时协调 `route()` → `addSection()` → `send()` 的完整流程，处理引用续接场景
- [ ] 8.4 实现空态引导文本：当前会话无 Section 时显示引导建议

## 9. 验证

- [ ] 9.1 验证页面路由：侧边栏"AI 助手"点击后正确导航到 `/chatbot` 并渲染页面
- [ ] 9.2 验证对话流程：发送消息 → Agent 流式响应 → 消息实时显示 → JSONL 写入 → 摘要生成
- [ ] 9.3 验证新建节和引用续接：两种发送模式的完整流程
- [ ] 9.4 验证 Section 折叠/展开：折叠不加载消息，展开加载消息和 Agent
- [ ] 9.5 验证会话切换：切换会话后 Section 列表正确更新
- [ ] 9.6 验证错误态：API Key 未配置时的错误文本展示
