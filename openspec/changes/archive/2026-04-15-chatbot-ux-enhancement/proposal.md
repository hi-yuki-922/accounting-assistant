## Why

当前 AI 对话功能的交互体验存在三个痛点：会话无法切换或新建（每次仅自动创建当日会话）、操作确认按钮不够直观（Button+emoji 方式辨识度低）、发送消息后存在空白等待期（Section 创建延迟导致用户消息和流式状态均不可见）。这些问题在网络环境较差时尤为明显，用户无法判断请求状态。

## What Changes

- 在 MenuBar 添加 DropdownMenu，提供新建会话、重命名当前会话、切换会话三个操作入口
- 新增右侧 Sheet 抽屉组件展示会话列表，支持切换、重命名、手动触发摘要生成
- 新建会话时自动对旧会话异步生成 LLM 摘要和标题，生成仅执行一次，持久化标记避免重复
- Session 实体新增 `summary`、`title_auto_generated`、`summary_generated` 三个字段
- 将操作确认按钮从 Button ghost+emoji 替换为 shadcn Badge 组件（outline=关，浅蓝=开，文本统一为"操作确认"）
- 优化消息发送流程：用户点击发送后立即显示消息气泡（乐观更新），消除 Section 创建期间的空白等待
- 确保 "思考中..." 脉冲动画覆盖从 send() 调用到首个流式 part 输出的完整时间段

## Capabilities

### New Capabilities
- `session-management-ui`: 会话管理 UI 层，包括 MenuBar DropdownMenu、会话列表 Sheet 抽屉、会话项操作（重命名、生成摘要、切换）
- `session-llm-summary`: 基于 LLM 的会话摘要与标题自动生成能力，包括触发时机管理、一次性生成标记、异步后台执行

### Modified Capabilities
- `session-management-hooks`: 扩展 useSessionList hook，适配 Session 新字段（summary、title_auto_generated、summary_generated），新增会话摘要生成和标题更新方法
- `chatbot-page`: handleSubmit 路由逻辑增加乐观更新（用户消息即时显示），协调会话管理 UI 的状态流转
- `chatbot-prompt-input`: 操作确认切换控件从 Button 替换为 Badge 组件
- `section-ui`: 优化流式状态指示器的触发时机，确保覆盖从 send() 到首个 part 的完整等待期

## Impact

- **前端组件**: menu-bar.tsx（重构）、prompt-input.tsx（Badge 替换）、section-card.tsx（状态指示优化）、chatbot-page.tsx（乐观更新+会话管理协调）
- **Hooks**: use-session-list.ts（扩展方法）、use-section-chat.ts（可能微调流式状态逻辑）
- **存储层**: session-store.ts（新增字段读写）、types.ts（Session 类型扩展）
- **后端**: Session 实体新增三个字段、数据库迁移
- **依赖**: shadcn Sheet 组件（可能需安装）、DropdownMenu 组件
