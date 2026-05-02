## Context

当前 chatbot 页面 (`chatbot-page.tsx`) 使用 ResizablePanelGroup 将页面分为左右两栏。左侧面板（60%）为占位文字"任务看板（后续实现）"，右侧面板（40%）为 Section 对话区域。

订单数据模型已完善，拥有完整的 CRUD API 和前端组件（卡片/列表视图、详情/创建/编辑/结账弹窗）。AI 通过 `src/ai/tools/order.ts` 中定义的工具操作订单，工具调用走 Tauri IPC。

现有的 display tools（`display_order_list` 等）是纯信号工具模式——execute 不执行业务逻辑，仅返回信号，前端通过 PartRenderer 捕获信号渲染 UI。本次通知工具可复用此模式。

## Goals / Non-Goals

**Goals:**
- 在聊天界面左侧提供订单全貌视图，按类型×状态分列展示
- AI 写操作后看板自动刷新，无需手动刷新
- Order 实体冗余存储客户名称，避免联表查询
- 复用现有 OrderDetailDialog 弹窗组件

**Non-Goals:**
- 不实现拖拽改变订单状态（操作通过 AI 对话完成）
- 不实现记账记录看板（后续迭代）
- 不修改后端 queryOrders 接口返回结构（卡片信息由 Order 字段直接满足）
- 不实现卡片动画过渡效果

## Decisions

### Decision 1: 通知机制——事件发射器模式

**选择**: 在 `notify_board_refresh` 工具的 execute 中通过自定义事件发射器通知看板组件刷新。

**理由**: 与 display tools 模式一致——工具 execute 返回 `{ refreshed: true }`，同时通过事件总线通知看板。不依赖 Tauri event system，纯前端 React 环境内完成。

**替代方案**:
- Tauri event（app_handle.emit）: 需要修改 Rust 后端，过度工程化
- 轮询: 简单但有延迟和性能开销
- React Context: 需要跨多层组件传递，耦合度高

**实现**: 使用 `mitt` 或自建的轻量 EventEmitter，在工具 execute 中 emit 事件，看板 hook 中 subscribe。

### Decision 2: 看板数据获取——复用 queryOrders API

**选择**: 看板使用现有 `orderApi.query()` 按日期范围分三次查询（销售订单、采购订单、已取消），分别填充五列。

**理由**: 现有 API 已支持按 orderType 和 status 筛选，无需新增后端接口。分类型查询可实现细粒度刷新（AI 只改了销售订单，仅刷新销售列）。

**替代方案**:
- getAllOrders 全量拉取前端分组: 简单但无法细粒度刷新
- 新增专用看板 API: 过度设计，当前 API 能满足

### Decision 3: 客户名称冗余存储

**选择**: Order 实体新增 `customer_name: Option<String>` 字段。

**理由**: 看板卡片需显示客户名称，每次查询联表查 customer 表增加复杂度。订单创建时客户名称已知，冗余存储是常见的反范式优化。客户名称变更不影响历史订单（快照语义）。

### Decision 4: 五列固定布局，横向滚动

**选择**: 每列固定 320px，使用 CSS overflow-x: auto 实现横向滚动。

**理由**: 五列总计 1600px，在小屏或左侧面板较窄时无法全部展示。横向滚动是看板类 UI 的标准交互模式。

## Risks / Trade-offs

- **[客户名称冗余]** → 客户改名后历史订单显示旧名称。这是可接受的——订单创建时的客户名是快照，类似订单项中的 product_name 快照。
- **[通知工具依赖 AI 调用]** → 如果 AI 没有按 prompt 指示调用通知工具，看板不会自动刷新。缓解：看板菜单栏提供手动刷新按钮。
- **[queryOrders 调用次数]** → 初始加载需 3 次 API 调用（销售、采购、已取消）。7 天内订单量通常不大，性能可接受。
