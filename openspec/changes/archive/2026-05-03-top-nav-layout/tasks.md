## 1. 清理现有侧边栏和底部导航

- [x] 1.1 删除 `src/components/layouts/bottom-nav.tsx` 文件
- [x] 1.2 从 `app-layout.tsx` 中移除所有 Sidebar 相关 import 和 JSX（SidebarProvider、Sidebar、SidebarInset、SidebarTrigger、SidebarMenu 等）
- [x] 1.3 检查并移除路由文件中对 `BottomNav` 组件的引用和 import（`dashboard.tsx`、`chatbot.tsx`）
- [x] 1.4 评估 `sidebar.tsx` UI 组件：确认无其他引用后删除（或保留备注）

## 2. 创建顶部导航栏组件

- [x] 2.1 新建 `src/components/layouts/top-nav.tsx`，实现顶部导航栏结构（品牌区 + 导航菜单 + 工具区）
- [x] 2.2 实现品牌区：logo 图标 + "Accounting-Assistant" 文字
- [x] 2.3 实现一级导航菜单项：总览（`/dashboard`）、账本（`/books`）、订单管理（`/orders`）、AI 助手（`/chatbot`），使用 TanStack Router `<Link>` 组件
- [x] 2.4 实现「基础资料」二级下拉菜单：使用 `DropdownMenu` 组件，包含客户管理（`/customers`）、商品管理（`/products`）、品类管理（`/categories`）子项
- [x] 2.5 实现活跃状态检测：使用 `useLocation()` 对比当前路径，为一级菜单项和「基础资料」下拉触发器添加活跃样式
- [x] 2.6 实现右侧工具区：主题切换按钮（保留现有明暗切换逻辑）
- [x] 2.7 实现用户头像下拉：显示头像 + 硬编码「张三」，下拉包含「设置」选项（跳转 `/settings`）

## 3. 重写 AppLayout

- [x] 3.1 重写 `src/components/layouts/app-layout.tsx`：使用 `<TopNav>` 替代 `<SidebarProvider>` + `<Sidebar>` + `<SidebarInset>` 结构
- [x] 3.2 保留内容区域的 padding 响应式结构（`p-2 sm:p-4 md:p-6`）

## 4. 清理和验证

- [x] 4.1 移除不再需要的 import（lucide 图标中不再使用的：FileTextIcon、BarChart3Icon、BellIcon 等；sidebar 相关类型）
- [x] 4.2 检查 `use-mobile.ts` hook 是否仍有其他引用，评估是否保留
- [x] 4.3 验证所有导航项跳转正常：总览、账本、订单管理、AI 助手、基础资料下拉子项、设置
- [x] 4.4 验证活跃状态在所有页面上正确显示
- [x] 4.5 验证主题切换功能正常
- [x] 4.6 验证平板端（≥768px）响应式布局正常
