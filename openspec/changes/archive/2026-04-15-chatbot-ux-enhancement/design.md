## Context

Chatbot 页面已有完整的会话/Section 消息流，但三个交互短板影响日常使用：无会话管理 UI 导致只能使用自动创建的当日会话；操作确认按钮视觉辨识度低；发送消息后存在 Section 创建延迟导致用户看到空白等待。

当前技术栈：React 19、shadcn/ui 组件库、Tauri 2.0 IPC、SQLite（Sea-ORM）、Vercel AI SDK 的 ToolLoopAgent。

## Goals / Non-Goals

**Goals:**
- 提供完整的会话管理 UI（新建、切换、重命名、LLM 摘要生成）
- 消除消息发送后的空白等待期，让用户始终有即时反馈
- 将操作确认按钮改为更直观的 Badge 组件
- LLM 摘要生成异步后台执行，不阻塞 UI

**Non-Goals:**
- 不实现会话删除功能（当前不需要）
- 不实现会话搜索或分类功能
- 不改变 Section 内部的消息渲染逻辑（仅优化流式状态的触发时机）
- 不引入新的外部依赖（使用已有的 shadcn 组件：Sheet、DropdownMenu、Badge、Dialog/Input）

## Decisions

### D1: MenuBar 使用 DropdownMenu 而非直接嵌入按钮

MenuBar 空间有限，DropdownMenu 将三个操作入口（新建、重命名、切换）收纳为一个触发按钮，保持界面简洁。重命名操作直接在 DropdownMenu 内触发 Dialog 弹窗。

### D2: 会话列表使用 Sheet 抽屉而非 DropdownMenu

会话列表需要展示多项信息（标题、日期、摘要、操作按钮），DropdownMenu 空间不够。Sheet 从右侧滑出，宽度适中，可以容纳完整的会话列表。Sheet 内不提供新建会话功能，新建操作保留在 DropdownMenu 中，避免入口混乱。

### D3: Session Schema 扩展方案

在 SQLite 的 Session 表新增三个字段而非新建关联表，因为摘要和标题生成状态是 Session 实体的强属性，一对一关系无需额外表。

### D4: LLM 摘要的触发时机

- **自动触发**：新建会话时对旧会话（当前会话）触发。此时旧会话已有 Section 数据可用。
- **手动触发**：Sheet 列表中每个会话项提供"生成摘要"按钮（仅 summary_generated=false 时显示）。
- 使用 `generateSessionSummary()` 独立函数，调用 LLM 生成摘要和标题，更新 SQLite。
- 异步执行，不 await，通过 state 刷新 UI。

### D5: 乐观更新策略

发送消息时，在 `route()` 之前就渲染用户消息气泡：
- handleSubmit 中先创建一个临时的 Section（带用户消息），立即渲染
- route() 完成后，send() 将消息写入真实的 Section
- 临时 Section 和真实 Section 之间通过状态同步消除闪烁

实际上更简单的方案：在 Section 创建完成前，在 SectionList 区域显示一个"临时的"用户消息气泡（独立于任何 Section），等 Section 就绪后消失，用户消息出现在 SectionCard 内。但这会导致视觉跳动。

**最终选择**：保持当前流程（route → addSection → send），但在 route 期间为新增的 SectionCard 预先渲染用户消息。具体方式：在 `addSection` 时同时传入初始消息内容，SectionCard 挂载时立即显示用户消息，不等 send() 完成。

### D6: Badge 组件替代确认按钮

使用 shadcn Badge 组件：
- 关闭状态：`variant="outline"`，中性色
- 开启状态：自定义浅蓝色样式（`bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300`）
- 文本统一为"操作确认"
- 点击整个 Badge 切换状态

## Risks / Trade-offs

- **[LLM 摘要失败]** → 摘要生成是后台异步操作，失败时 summary_generated 保持 false，用户可手动重试。不自动重试避免无限循环。
- **[乐观更新与实际消息不一致]** → 如果 send() 失败（如 Agent 创建失败），预渲染的用户消息需要被清除或标记错误。在 SectionChatContent 中处理 error 状态。
- **[Schema 迁移]** → 新增三个字段都是可空或有默认值的，迁移无破坏性。但需要同步更新 Rust 实体和前端类型。
- **[Sheet 与 DropdownMenu 的入口关系]** → 用户需要理解"切换会话"在 DropdownMenu 里，而不是 Sheet 里。在 DropdownMenu 中明确标注"切换会话"与"新建会话"的区别。
