## Why

AI Agent 基础设施（`src/ai/`）已初步成型，包含 Agent 工厂、路由函数、Section 存储、工具定义、提示词管理等完整模块，但缺少前端 UI 页面将这些能力呈现给用户。当前路由树已注册 `/chatbot` 路由且侧边栏已添加"AI 助手"导航入口，但 `src/routes/chatbot.tsx` 页面组件尚未创建。需要构建 AI 对话界面，让用户能通过 Section 对话模型与 Agent 进行交互。

## What Changes

- **新增 Chatbot 页面**：创建 `src/routes/chatbot.tsx` 页面组件，布局为菜单栏 + Section 列表 + 底部输入框
- **新增 Hook 层**：创建 `useSessionList`、`useSectionList`、`useSectionChat` 三个细粒度 hooks，管理会话、节、消息的完整生命周期
- **新增 Section 组件体系**：基于 shadcn/ui 封装 SectionCard（展开/折叠态）、MessageList、UserMessage、AssistantMessage、PromptInput 等组件
- **集成 ToolLoopAgent**：每个展开的 Section 内部实例化独立的 Agent，通过 `agent.stream()` 的 `fullStream` 驱动流式响应和 UI 更新

## Capabilities

### New Capabilities

- `chatbot-page`: Chatbot 页面容器组件，负责页面布局、首次进入逻辑（加载今日最后会话或新建空会话）、协调 Section 列表与 PromptInput 的消息路由
- `section-ui`: Section 卡片组件体系，包括展开态（消息列表 + 流式渲染）和折叠态（摘要展示），支持折叠/展开切换，最近 N 节默认展开
- `section-chat-hook`: `useSectionChat` hook，封装 per-section 的 Agent 实例管理、消息状态、流式响应循环、JSONL 写入和摘要生成
- `session-management-hooks`: 会话与节列表管理的 hooks（`useSessionList`、`useSectionList`），提供会话切换、节创建/引用、摘要刷新等能力
- `chatbot-prompt-input`: 底部输入框组件，支持新建节发送和引用已有节续接两种模式，包含 Section 索引 Popover 用于快速跳转和引用

### Modified Capabilities

## Impact

- **新增文件**：`src/routes/chatbot.tsx`、`src/hooks/use-session-list.ts`、`src/hooks/use-section-list.ts`、`src/hooks/use-section-chat.ts`、`src/components/chatbot/` 目录下的多个组件
- **依赖现有模块**：`src/ai/agent.ts`（createAgent）、`src/ai/router.ts`（route）、`src/ai/writer.ts`（createSectionWriter）、`src/ai/storage/` 下的 store 函数
- **UI 组件依赖**：shadcn/ui 组件（Card、Collapsible、Popover、Button、ScrollArea 等），可能复用部分 ai-elements 组件（Message、Conversation 的滚动容器能力）
- **路由**：复用已注册的 `/chatbot` 路由，不需要修改路由树
