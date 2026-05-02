## Context

当前应用使用 shadcn/ui 的 `<Sidebar>` 组件作为主导航，配合 `<SidebarInset>` 渲染内容区域。所有页面通过 `<AppLayout>` 组件统一包裹，`<AppLayout>` 内部使用 `<SidebarProvider>` 管理侧边栏状态。

项目已安装以下可复用的 shadcn/ui 组件：
- `dropdown-menu.tsx` — 下拉菜单（已在多处使用）
- `navigation-menu.tsx` — 导航菜单（未使用）
- `menubar.tsx` — 菜单栏（未使用）
- `avatar.tsx` — 用户头像

路由使用 TanStack Router 文件路由，当前导航链接使用 `<a href>` 而非 `<Link>`。

## Goals / Non-Goals

**Goals:**
- 用顶部导航栏替代侧边栏，释放内容区域水平空间
- 将功能项合理分组（基础资料二级下拉），减少导航项的视觉数量
- 导航使用 TanStack Router `<Link>` 实现客户端路由切换
- 保持主题切换功能
- 响应式布局适配平板端（≥768px）

**Non-Goals:**
- 不做手机端（<768px）导航适配，后续单独开发
- 不实现通知功能
- 不实现真实的用户认证/登录系统
- 不修改各功能页面的内部布局和逻辑

## Decisions

### 1. 顶部导航栏实现方式：自建组件 + DropdownMenu

**选择**：基于 `<header>` + Tailwind 自建导航栏，使用已有的 `DropdownMenu` 组件实现二级下拉和用户菜单。

**备选方案**：
- `NavigationMenu`（shadcn/ui）：专为顶部导航设计，内置子菜单支持。但该组件面向大型多层级导航（如电商），对于当前 5 个一级 + 1 个二级 + 1 个用户菜单的结构偏重。
- `Menubar`（shadcn/ui）：操作系统风格菜单栏，视觉上与桌面应用契合，但交互模式偏传统，不支持路由集成。

**理由**：当前导航结构简单，自建组件更轻量灵活，可以直接使用 TanStack Router `<Link>`，无需适配第三方导航组件的路由限制。`DropdownMenu` 已在项目中广泛使用，风格一致。

### 2. 导航结构设计

```
┌──────────────────────────────────────────────────────────────────┐
│ [logo] Accounting-Assistant │ 总览 │ 账本 │ 订单管理 │ 基础资料▼ │ AI助手 │     🌓  👤张三▼ │
└──────────────────────────────────────────────────────────────────┘
```

- **品牌区**（左侧固定）：logo 图标 + "Accounting-Assistant" 文字
- **一级菜单**（中部）：总览、账本、订单管理、AI助手 — 使用 `<Link>` 直接导航
- **二级下拉**（中部）：「基础资料」— 使用 `<DropdownMenu>` 展开 客户/商品/品类
- **工具区**（右侧固定）：主题切换按钮 + 用户头像下拉（设置）

### 3. 活跃状态检测

使用 TanStack Router 的 `useLocation()` 获取当前路径，对比 `pathname` 判断活跃状态。对「基础资料」下拉，当路径为 `/customers`、`/products`、`/categories` 时，下拉触发器显示活跃样式。

### 4. AppLayout 组件结构

```
<AppLayout>
  ├── <TopNav>              ← 新组件：顶部导航栏
  │   ├── 品牌区
  │   ├── 导航菜单
  │   └── 工具区（主题 + 用户下拉）
  └── <main>                ← 内容区域（保留现有 padding 结构）
      └── {children}
</AppLayout>
```

`<AppLayout>` 不再使用 `<SidebarProvider>`，简化为纯布局容器。

### 5. 删除策略

- **直接删除**：`bottom-nav.tsx`、sidebar 相关 import
- **评估后决定**：`sidebar.tsx` UI 原始组件 — 如果项目其他地方无引用则删除；但 sidebar 是 shadcn/ui 标准组件，保留也不影响打包（tree-shaking），可保留以备后续使用
- **保留**：`use-mobile.ts` hook — 可能在其他响应式场景中使用

## Risks / Trade-offs

- **[导航项数量增长]** → 如果后续功能增加，一级菜单项可能溢出。当前 5 个一级项 + 1 个下拉在平板横屏下空间充足。后续可通过增加二级下拉分组或引入可折叠导航来应对。
- **[sidebar.tsx 保留体积]** → 保留未使用的 shadcn/ui sidebar 组件会增加少量源码体积，但通过 tree-shaking 不会影响最终打包。删除则后续恢复需重新安装。
