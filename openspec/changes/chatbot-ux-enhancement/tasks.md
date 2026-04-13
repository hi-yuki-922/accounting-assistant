## 1. 后端 Schema 迁移

- [ ] 1.1 Session 实体新增 `summary`（TEXT, nullable）、`title_auto_generated`（BOOL, default true）、`summary_generated`（BOOL, default false）三个字段
- [ ] 1.2 编写数据库迁移脚本，为已有 session 记录补充新字段默认值
- [ ] 1.3 后端 Tauri IPC 命令扩展：支持更新 session 的 summary、title_auto_generated、summary_generated 字段
- [ ] 1.4 验证迁移：启动应用确认旧数据正常加载，新字段默认值正确

## 2. 前端类型与存储层

- [ ] 2.1 更新 `src/ai/storage/types.ts` 中 Session 类型，新增 summary、title_auto_generated、summary_generated 字段
- [ ] 2.2 扩展 `src/ai/storage/session-store.ts`：新增 `updateSessionFields(id, fields)` 方法支持批量更新新字段
- [ ] 2.3 扩展 `src/ai/storage/session-store.ts`：新增 `generateSessionSummary(sessionId)` 函数，收集 Section 摘要并调用 LLM 生成会话摘要和标题

## 3. useSessionList Hook 扩展

- [ ] 3.1 扩展 `useSessionList` hook：新增 `renameSession(id, newTitle)` 方法，更新标题并标记 title_auto_generated=false
- [ ] 3.2 扩展 `useSessionList` hook：新增 `generateSummary(id)` 方法，异步调用摘要生成函数，完成后更新 sessions 状态
- [ ] 3.3 修改 `createSession` 方法：创建新会话后对旧会话（当前活跃会话）异步触发摘要生成

## 4. 操作确认 Badge 替换

- [ ] 4.1 将 `src/pages/chatbot/components/prompt-input.tsx` 中的确认按钮从 Button 替换为 Badge 组件
- [ ] 4.2 关闭状态：`variant="outline"`，文本"操作确认"
- [ ] 4.3 开启状态：浅蓝色样式（`bg-blue-100 text-blue-700` / `dark:bg-blue-900 dark:text-blue-300`），文本"操作确认"
- [ ] 4.4 点击切换逻辑不变（调用 onToggleConfirmation），验证 localStorage 持久化

## 5. MenuBar DropdownMenu

- [ ] 5.1 改造 `src/pages/chatbot/components/menu-bar.tsx`：右侧添加 DropdownMenu 触发按钮
- [ ] 5.2 实现"新建会话"选项：调用 `useSessionList.createSession()`
- [ ] 5.3 实现"重命名当前会话"选项：弹出 Dialog 输入框，调用 `useSessionList.renameSession()`
- [ ] 5.4 实现"切换会话"选项：控制 Sheet 抽屉的打开状态
- [ ] 5.5 MenuBar 接收必要的 props（sessions、activeSessionId、各操作回调）

## 6. 会话列表 Sheet 抽屉

- [ ] 6.1 创建 `SessionListSheet` 组件：使用 shadcn Sheet，从右侧滑出
- [ ] 6.2 渲染会话列表：按创建时间倒序，每项显示标题、日期、Section 数量、摘要（如果有）
- [ ] 6.3 当前活跃会话高亮标识
- [ ] 6.4 每个会话项提供重命名按钮（弹出 Dialog）
- [ ] 6.5 每个会话项提供"生成摘要"按钮（仅 summary_generated=false 时显示）
- [ ] 6.6 点击会话项触发切换：调用 `switchSession(id)` 并关闭 Sheet
- [ ] 6.7 在 chatbot-page.tsx 中集成 Sheet 的状态管理和组件渲染

## 7. Section 消息乐观更新

- [ ] 7.1 修改 `handleSubmit` 路由逻辑：在 route() 调用前记录用户消息内容
- [ ] 7.2 修改 `addSection` 或 SectionCard props：支持传入 `initialMessage` 属性用于预渲染
- [ ] 7.3 在 SectionChatContent 中：当 `initialMessage` 存在且 messages 为空时，渲染预渲染用户消息气泡
- [ ] 7.4 send() 执行后预渲染消息自然过渡到真实消息（当 messages 加载完成后 initialMessage 停止显示）
- [ ] 7.5 处理 send() 失败情况：预渲染消息下方显示错误提示

## 8. 集成验证

- [ ] 8.1 验证完整会话管理流程：新建 → 自动摘要 → 切换 → 重命名 → 手动摘要
- [ ] 8.2 验证 Badge 确认模式切换和持久化
- [ ] 8.3 验证消息发送的乐观更新：无引用、有引用两种场景
- [ ] 8.4 验证流式状态"思考中..."覆盖从 send() 到首个 part 的完整等待期
