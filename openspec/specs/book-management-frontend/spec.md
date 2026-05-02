# Purpose

账本管理前端功能 - 提供账本的创建、编辑、删除、查看和管理功能，包括卡片视图展示、图标选择、拖拽排序、详情页筛选和分页等功能。

## ADDED Requirements

### Requirement: Display book list with card view
系统 MUST 以卡片视图形式展示所有账本列表。

#### Scenario: Display books as cards
- **WHEN** 用户访问账本管理页面
- **THEN** 系统 MUST 以卡片网格形式展示所有账本
- **THEN** 每个卡片 MUST 显示账本图标
- **THEN** 每个卡片 MUST 显示账本标题
- **THEN** 每个卡片 MUST 显示账本描述（如果存在）
- **THEN** 每个卡片 MUST 显示记录数量
- **THEN** 默认账本（ID: 10000001）MUST 始终排在列表最后
- **THEN** 其他账本 MUST 按创建时间倒序排序（或用户自定义排序）

#### Scenario: Responsive card layout
- **WHEN** 用户在不同屏幕尺寸查看账本列表
- **THEN** 移动端（宽度 < 768px）MUST 显示单列
- **THEN** 平板端（768px ≤ 宽度 < 1024px）MUST 显示 2-3 列
- **THEN** 桌面端（宽度 ≥ 1024px）MUST 显示 3-5 列

### Requirement: Display book actions menu
系统 MUST 为每个账本卡片提供操作菜单。

#### Scenario: Display more options menu
- **WHEN** 用户点击账本卡片上的"更多"按钮
- **THEN** 系统 MUST 显示操作菜单
- **THEN** 菜单 MUST 包含"编辑"选项
- **THEN** 菜单 MUST 包含"删除"选项
- **THEN** 默认账本的菜单 MUST 不显示"删除"选项

#### Scenario: Menu positioning
- **WHEN** 用户点击"更多"按钮
- **THEN** 菜单 MUST 显示在按钮附近
- **THEN** 菜单 MUST 能够关闭

### Requirement: Create new book
系统 MUST 提供创建新账本的功能。

#### Scenario: Open create book dialog
- **WHEN** 用户点击"新建账本"按钮
- **THEN** 系统 MUST 显示创建账本对话框
- **THEN** 对话框 MUST 包含账本标题输入框
- **THEN** 对话框 MUST 包含账本描述输入框（可选）
- **THEN** 对话框 MUST 包含图标选择器
- **THEN** 对话框 MUST 包含"取消"按钮
- **THEN** 对话框 MUST 包含"创建"按钮
- **THEN** 标题输入框 MUST 设置最大长度为 20 字符

#### Scenario: Create book with valid input
- **WHEN** 用户填写有效的账本标题
- **WHEN** 用户选择图标（或使用默认图标）
- **WHEN** 用户点击"创建"按钮
- **THEN** 系统 MUST 调用后端创建账本接口
- **THEN** 系统 MUST 关闭对话框
- **THEN** 系统 MUST 刷新账本列表
- **THEN** 系统 MUST 显示成功提示

#### Scenario: Create book with empty title
- **WHEN** 用户点击"创建"按钮
- **WHEN** 账本标题为空
- **THEN** 系统 MUST 显示错误提示
- **THEN** 系统 MUST 不调用后端接口
- **THEN** 对话框 MUST 保持打开

#### Scenario: Cancel create book
- **WHEN** 用户点击"取消"按钮
- **THEN** 系统 MUST 关闭对话框
- **THEN** 系统 MUST 清空输入内容
- **THEN** 系统 MUST 不调用后端接口

### Requirement: Edit book
系统 MUST 提供编辑账本的功能。

#### Scenario: Open edit book dialog
- **WHEN** 用户点击账本卡片上的"编辑"选项
- **THEN** 系统 MUST 显示编辑账本对话框
- **THEN** 对话框 MUST 预填充当前账本的标题
- **THEN** 对话框 MUST 预填充当前账本的描述
- **THEN** 对话框 MUST 预填充当前账本的图标
- **THEN** 标题输入框 MUST 设置最大长度为 20 字符

#### Scenario: Update book with valid input
- **WHEN** 用户修改账本标题
- **WHEN** 用户修改账本描述（可选）
- **WHEN** 用户选择图标
- **WHEN** 用户点击"保存"按钮
- **THEN** 系统 MUST 调用后端更新账本接口
- **THEN** 系统 MUST 关闭对话框
- **THEN** 系统 MUST 刷新账本列表
- **THEN** 系统 MUST 显示成功提示

#### Scenario: Update book with empty title
- **WHEN** 用户点击"保存"按钮
- **WHEN** 账本标题为空
- **THEN** 系统 MUST 显示错误提示
- **THEN** 系统 MUST 不调用后端接口
- **THEN** 对话框 MUST 保持打开

### Requirement: Delete book
系统 MUST 提供删除账本的功能，且删除前需要确认。

#### Scenario: Open delete confirmation dialog
- **WHEN** 用户点击账本卡片上的"删除"选项
- **WHEN** 账本不是默认账本
- **THEN** 系统 MUST 显示删除确认对话框
- **THEN** 对话框 MUST 显示账本名称
- **THEN** 对话框 MUST 提示"该账本下的 N 条记录将迁移到'未归类账目'"
- **THEN** 对话框 MUST 包含"取消"按钮
- **THEN** 对话框 MUST 包含"删除"按钮

#### Scenario: Confirm delete book
- **WHEN** 用户点击"删除"按钮
- **THEN** 系统 MUST 调用后端删除账本接口
- **THEN** 系统 MUST 关闭确认对话框
- **THEN** 系统 MUST 刷新账本列表
- **THEN** 系统 MUST 显示成功提示

#### Scenario: Cancel delete book
- **WHEN** 用户点击"取消"按钮
- **THEN** 系统 MUST 关闭确认对话框
- **THEN** 系统 MUST 不调用后端接口

#### Scenario: Cannot delete default book
- **WHEN** 用户尝试删除默认账本（ID: 10000001）
- **THEN** 系统 MUST 不显示删除选项
- **THEN** 系统 MUST 不允许删除操作

### Requirement: Select book icon
系统 MUST 提供账本图标选择功能。

#### Scenario: Display icon picker
- **WHEN** 用户打开创建或编辑账本对话框
- **THEN** 系统 MUST 显示图标选择器
- **THEN** 图标选择器 MUST 显示预设图标选项
- **THEN** 图标选择器 MUST 支持点击选择图标
- **THEN** 选中图标 MUST 高亮显示

#### Scenario: Select icon from options
- **WHEN** 用户点击某个图标
- **THEN** 系统 MUST 选中该图标
- **THEN** 系统 MUST 更新对话框中显示的图标

#### Scenario: Default icon selection
- **WHEN** 用户打开创建账本对话框
- **THEN** 系统 MUST 默认选中第一个图标

### Requirement: Drag and drop to reorder books
系统 MUST 支持通过拖拽重新排序账本。

#### Scenario: Start dragging book card
- **WHEN** 用户按住某个账本卡片开始拖拽
- **THEN** 系统 MUST 显示拖拽视觉反馈
- **THEN** 系统 MUST 高亮可放置位置

#### Scenario: Drop book card at new position
- **WHEN** 用户将账本卡片拖拽到新位置
- **THEN** 系统 MUST 更新账本顺序
- **THEN** 系统 MUST 保存排序到 localStorage
- **THEN** 系统 MUST 显示排序完成的视觉反馈

#### Scenario: Cannot drag default book
- **WHEN** 用户尝试拖拽默认账本
- **THEN** 系统 MUST 不允许拖拽操作

#### Scenario: Persist sort order
- **WHEN** 用户拖拽排序后刷新页面
- **THEN** 系统 MUST 从 localStorage 读取排序配置
- **THEN** 系统 MUST 按保存的顺序显示账本

#### Scenario: Default sort order when no config
- **WHEN** localStorage 中没有排序配置
- **THEN** 系统 MUST 按创建时间倒序排序
- **THEN** 默认账本 MUST 始终排在最后

### Requirement: Navigate to book detail
系统 MUST 支持点击账本卡片进入账本详情。

#### Scenario: Navigate to book detail page
- **WHEN** 用户点击账本卡片（非操作按钮区域）
- **THEN** 系统 MUST 导航到账本详情页面
- **THEN** URL MUST 包含账本 ID（例如 `/books/20260001`）

#### Scenario: Display book detail header
- **WHEN** 用户进入账本详情页面
- **THEN** 系统 MUST 显示账本标题
- **THEN** 系统 MUST 显示"返回"按钮
- **THEN** 系统 MUST 显示"编辑"和"删除"按钮
- **THEN** 系统 MUST 显示筛选器
- **THEN** 系统 MUST 显示记录列表

### Requirement: Filter records in book detail
系统 MUST 支持在账本详情页筛选记录。

#### Scenario: Display filter controls
- **WHEN** 用户进入账本详情页面
- **THEN** 系统 MUST 显示时间范围选择器（开始时间、结束时间）
- **THEN** 系统 MUST 显示记账类型下拉（全部/收入/支出）
- **THEN** 系统 MUST 显示记账渠道下拉（全部/现金/微信/支付宝/银行卡）
- **THEN** 系统 MUST 显示记录状态下拉（全部/待处理/已完成/已取消）
- **THEN** 系统 MUST 显示"重置"按钮

#### Scenario: Filter by time range
- **WHEN** 用户选择时间范围
- **WHEN** 点击筛选或选择完成后
- **THEN** 系统 MUST 调用后端接口查询记录
- **THEN** 系统 MUST 仅显示时间范围内的记录
- **THEN** 系统 MUST 更新分页信息

#### Scenario: Filter by accounting type
- **WHEN** 用户选择记账类型（收入或支出）
- **THEN** 系统 MUST 仅显示指定类型的记录

#### Scenario: Filter by channel
- **WHEN** 用户选择记账渠道
- **THEN** 系统 MUST 仅显示指定渠道的记录

#### Scenario: Filter by state
- **WHEN** 用户选择记录状态
- **THEN** 系统 MUST 仅显示指定状态的记录

#### Scenario: Reset filters
- **WHEN** 用户点击"重置"按钮
- **THEN** 系统 MUST 清空所有筛选条件
- **THEN** 时间范围 MUST 置空
- **THEN** 类型 MUST 设置为"全部"
- **THEN** 渠道 MUST 设置为"全部"
- **THEN** 状态 MUST 设置为"全部"
- **THEN** 系统 MUST 刷新记录列表

### Requirement: Paginate records in book detail
系统 MUST 支持分页展示账本详情页的记录。

#### Scenario: Display records with pagination
- **WHEN** 用户进入账本详情页面
- **THEN** 系统 MUST 显示第一页记录
- **THEN** 系统 MUST 显示分页控件
- **THEN** 分页控件 MUST 显示当前页码
- **THEN** 分页控件 MUST 显示总页数
- **THEN** 分页控件 MUST 显示总数

#### Scenario: Navigate to next page
- **WHEN** 用户点击下一页按钮
- **THEN** 系统 MUST 显示下一页记录
- **THEN** 系统 MUST 更新页码显示

#### Scenario: Navigate to previous page
- **WHEN** 用户点击上一页按钮
- **THEN** 系统 MUST 显示上一页记录
- **THEN** 系统 MUST 更新页码显示

#### Scenario: Navigate to specific page
- **WHEN** 用户点击特定页码
- **THEN** 系统 MUST 显示该页记录
- **THEN** 系统 MUST 更新页码显示

### Requirement: Add book navigation entry
系统 MUST 在顶部导航栏中添加账本入口。

#### Scenario: Display book entry in top nav
- **WHEN** 用户查看顶部导航栏
- **THEN** 系统 MUST 显示"账本"导航项
- **THEN** "账本"导航项 MUST 有对应图标
- **THEN** 点击"账本"导航项 MUST 导航到 `/books` 页面
- **THEN** 当前在账本页面时，"账本"导航项 MUST 高亮显示

#### Scenario: 账本页面在顶部导航布局下渲染
- **WHEN** 用户通过顶部导航栏点击「账本」进入账本页面
- **THEN** 账本页面在顶部导航栏下方的内容区域正常渲染，所有功能正常工作

### Requirement: Navigate back from book detail
系统 MUST 支持从账本详情页返回列表。

#### Scenario: Click back button
- **WHEN** 用户在账本详情页点击"返回"按钮
- **THEN** 系统 MUST 导航到账本列表页（`/books`）

#### Scenario: Browser back navigation
- **WHEN** 用户在账本详情页点击浏览器后退按钮
- **THEN** 系统 MUST 正确导航到账本列表页

### Requirement: Display empty state for book detail
系统 MUST 在账本没有记录时显示空状态。

#### Scenario: No records in book
- **WHEN** 账本详情页没有记录
- **THEN** 系统 MUST 显示空状态提示
- **THEN** 空状态提示 MUST 说明"暂无记账记录"
- **THEN** 空状态提示 MUST 引导用户添加记录

### Requirement: Display record count
系统 MUST 在账本卡片上显示记录数量。

#### Scenario: Display record count on card
- **WHEN** 账本卡片展示时
- **THEN** 系统 MUST 显示记录数量（例如："128 条记录"）
- **THEN** 记录数量 MUST 来自后端返回的 `record_count` 字段
