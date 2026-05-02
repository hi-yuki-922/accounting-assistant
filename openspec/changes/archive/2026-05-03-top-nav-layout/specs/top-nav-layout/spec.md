## ADDED Requirements

### Requirement: 顶部导航栏布局
系统 SHALL 使用顶部水平导航栏作为应用的主导航方式，替代侧边栏导航。

#### Scenario: 导航栏渲染
- **WHEN** 用户访问应用的任意页面
- **THEN** 页面顶部渲染水平导航栏，包含品牌区、导航菜单、工具区

#### Scenario: 内容区域全宽显示
- **WHEN** 顶部导航栏渲染完成
- **THEN** 内容区域占据导航栏以下的全部水平宽度，无侧边栏占用空间

### Requirement: 品牌区展示
导航栏左侧 SHALL 展示应用 logo 图标和标题文字 "Accounting-Assistant"。

#### Scenario: 品牌区渲染
- **WHEN** 顶部导航栏渲染完成
- **THEN** 导航栏最左侧显示 logo 图标和 "Accounting-Assistant" 文字

### Requirement: 一级导航菜单
系统 SHALL 提供以下一级导航项，点击后直接跳转对应页面：
- 总览（路由 `/dashboard`）
- 账本（路由 `/books`）
- 订单管理（路由 `/orders`）
- AI 助手（路由 `/chatbot`）

#### Scenario: 点击一级导航项
- **WHEN** 用户点击「总览」导航项
- **THEN** 系统通过客户端路由跳转到 `/dashboard`，无整页刷新

#### Scenario: 一级导航活跃状态
- **WHEN** 用户当前位于 `/dashboard` 页面
- **THEN** 「总览」导航项显示活跃样式（与当前路径匹配）

### Requirement: 基础资料二级下拉菜单
系统 SHALL 提供「基础资料」下拉菜单，包含以下子项：
- 客户管理（路由 `/customers`）
- 商品管理（路由 `/products`）
- 品类管理（路由 `/categories`）

#### Scenario: 展开基础资料下拉
- **WHEN** 用户点击「基础资料」导航项
- **THEN** 显示下拉菜单，列出客户管理、商品管理、品类管理三个选项

#### Scenario: 点击下拉子项跳转
- **WHEN** 用户在下拉中点击「客户管理」
- **THEN** 系统通过客户端路由跳转到 `/customers`，下拉自动关闭

#### Scenario: 基础资料活跃状态
- **WHEN** 用户当前位于 `/customers`、`/products` 或 `/categories` 页面
- **THEN** 「基础资料」导航触发器显示活跃样式

### Requirement: 用户头像下拉菜单
导航栏右侧 SHALL 展示用户头像和用户名，点击后展开下拉菜单，包含「设置」选项。

#### Scenario: 用户下拉菜单展示
- **WHEN** 导航栏渲染完成
- **THEN** 右侧显示用户头像和硬编码用户名「张三」

#### Scenario: 展开用户下拉
- **WHEN** 用户点击头像区域
- **THEN** 显示下拉菜单，包含「设置」选项

#### Scenario: 点击设置跳转
- **WHEN** 用户在下拉中点击「设置」
- **THEN** 系统跳转到 `/settings` 页面

### Requirement: 主题切换
导航栏右侧 SHALL 提供明暗主题切换按钮。

#### Scenario: 切换主题
- **WHEN** 用户点击主题切换按钮
- **THEN** 应用在明暗主题之间切换

### Requirement: 客户端路由导航
所有导航链接 SHALL 使用 TanStack Router 的 `<Link>` 组件，实现客户端路由切换，避免整页刷新。

#### Scenario: 导航无整页刷新
- **WHEN** 用户通过导航栏切换页面
- **THEN** 页面通过客户端路由切换，浏览器无整页刷新行为

### Requirement: 响应式平板适配
导航栏 SHALL 在平板屏幕尺寸（≥768px）下正常显示和使用。

#### Scenario: 平板端导航显示
- **WHEN** 视口宽度 ≥ 768px
- **THEN** 顶部导航栏完整显示所有导航项，布局合理无溢出

### Requirement: 移除侧边栏和底部导航
系统 SHALL 不再使用侧边导航菜单和移动端底部导航栏。

#### Scenario: 无侧边栏渲染
- **WHEN** 用户访问应用任意页面
- **THEN** 页面不渲染侧边导航菜单组件

#### Scenario: 无底部导航渲染
- **WHEN** 用户访问应用任意页面
- **THEN** 页面不渲染底部导航栏组件

## REMOVED Requirements

### Requirement: 死链接导航项
**Reason**: 导航重构中移除无对应路由的链接
**Migration**: 记录（/records）和统计（/statistics）功能后续以新规格单独规划

### Requirement: 通知铃铛图标
**Reason**: 通知功能暂未实现，移除空壳 UI 元素
**Migration**: 后续实现通知功能时在导航栏工具区重新添加
