## MODIFIED Requirements

### Requirement: 页面布局容器
账本管理页面的外层布局容器由侧边栏布局（SidebarProvider + SidebarInset）变更为顶部导航栏布局。页面内部功能、组件结构、交互逻辑不变。

#### Scenario: 账本页面在顶部导航布局下渲染
- **WHEN** 用户通过顶部导航栏点击「账本」进入账本页面
- **THEN** 账本页面在顶部导航栏下方的内容区域正常渲染，所有功能正常工作
