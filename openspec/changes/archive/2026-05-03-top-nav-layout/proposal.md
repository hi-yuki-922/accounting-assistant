## Why

当前应用采用侧边导航菜单，但系统功能数量有限（仅 8 个有效页面），侧边栏占用了大量水平空间却未提供相应的导航效率增益。同时存在死链接（记录、统计）、移动端底部导航不一致、导航使用 `<a href>` 导致整页刷新等问题。切换为顶部导航栏可以释放内容区域宽度，提升空间利用率，并使导航结构更加紧凑合理。

## What Changes

- **BREAKING** 移除侧边导航菜单（`<Sidebar>` + `<SidebarProvider>`）及底部导航（`<BottomNav>`）
- 重写 `app-layout.tsx` 为顶部导航栏布局
- 新建顶部导航栏组件，包含：
  - 品牌区（logo + "Accounting-Assistant"）
  - 一级菜单项：总览（原仪表板）、账本、订单管理、AI 助手
  - 二级下拉菜单「基础资料」：客户管理、商品管理、品类管理
  - 用户头像下拉菜单（右侧）：用户名 + 设置
- 移除死链接（记录 `/records`、统计 `/statistics`）
- 移除通知铃铛图标
- 将「仪表板」更名为「总览」
- 导航链接从 `<a href>` 迁移为 TanStack Router `<Link>`
- 清理不再使用的 `sidebar.tsx` UI 组件及相关代码
- 移动端仅保留响应式布局适配平板，不做手机端导航适配

## Capabilities

### New Capabilities

- `top-nav-layout`: 顶部导航栏布局组件，包含品牌区、一级菜单、二级下拉菜单、用户菜单的完整导航结构

### Modified Capabilities

- `book-management-frontend`: 布局容器从侧边栏切换为顶部导航栏
- `chatbot-page`: 布局容器切换，释放完整内容宽度
- `category-frontend`: 导航路径从侧边栏直链变为「基础资料」下拉子项
- `customer-frontend`: 导航路径从侧边栏直链变为「基础资料」下拉子项
- `product-frontend`: 导航路径从侧边栏直链变为「基础资料」下拉子项
- `order-frontend`: 布局容器切换为顶部导航栏

## Impact

- `src/components/layouts/app-layout.tsx` — 完全重写
- `src/components/layouts/bottom-nav.tsx` — 删除
- `src/components/ui/sidebar.tsx` — 评估是否删除（检查其他引用）
- 所有路由文件（`src/routes/*.tsx`）— 移除 `<SidebarProvider>` 依赖
- `src/hooks/use-mobile.ts` — 评估是否仍有使用
- 导航链接从整页刷新变为客户端路由切换
