## ADDED Requirements

### Requirement: HoverCard 显示冲账详情
系统 SHALL 在账本详情页列表中为有冲账关联的记录提供 HoverCard 功能，用户 hover 带下划线的金额时显示原始记录金额和所有冲账记录列表。

#### Scenario: 成功显示 HoverCard 冲账详情
- **WHEN** 用户 hover 列表中带下划线的金额（表示有冲账关联）
- **WHEN** 记录有 1 条或更多冲账关联记录
- **THEN** 系统 SHALL 显示 HoverCard
- **THEN** HoverCard SHALL 展示原始记录的详细信息（类型、金额、时间、渠道）
- **THEN** HoverCard SHALL 展示所有冲账记录的列表（按时间倒序）
- **THEN** HoverCard SHALL 显示净合计金额（原始金额 + 所有冲账金额的和）
- **THEN** 系统 SHALL 在数据加载中显示加载状态指示

#### Scenario: HoverCard 无数据时隐藏
- **WHEN** 记录没有冲账关联记录
- **THEN** 系统 SHALL 不显示 HoverCard
- **THEN** 金额 SHALL 不显示下划线样式

#### Scenario: HoverCard 数据加载失败
- **WHEN** 调用 HoverCard 数据接口失败
- **THEN** 系统 SHALL 显示加载失败错误提示
- **THEN** 系统 SHALL 隐藏 HoverCard 或显示错误信息

### Requirement: HoverCard 数据按需加载
系统 SHALL 在用户首次 hover 金额时调用接口获取冲账详情数据，后续 hover 使用缓存数据，避免重复请求。

#### Scenario: 首次 hover 加载数据
- **WHEN** 用户首次 hover 带下划线的金额
- **WHEN** 记录有冲账关联
- **THEN** 系统 SHALL 调用获取冲账详情接口
- **THEN** 系统 SHALL 显示加载状态
- **THEN** 系统 SHALL 在数据加载完成后显示冲账详情
- **THEN** 系统 SHALL 缓存加载的数据

#### Scenario: 再次 hover 使用缓存数据
- **WHEN** 用户再次 hover 同一记录的金额
- **WHEN** 冲账详情数据已在缓存中
- **THEN** 系统 SHALL 直接使用缓存数据
- **THEN** 系统 SHALL 不重复调用接口
- **THEN** 系统 SHALL 立即显示冲账详情

#### Scenario: HoverCard 关闭后清理
- **WHEN** 用户鼠标移出金额区域
- **THEN** 系统 SHALL 隐藏 HoverCard
- **THEN** 系统 SHALL 保持缓存数据（记录刷新时清理）

### Requirement: HoverCard 数据缓存管理
系统 SHALL 实现数据缓存策略，在记录刷新时清理缓存，避免显示过期数据。

#### Scenario: 记录刷新时清理缓存
- **WHEN** 用户进行添加、删除、批量入账、冲账等操作
- **THEN** 系统 SHALL 刷新记录列表
- **THEN** 系统 SHALL 清空所有 HoverCard 数据缓存
- **THEN** 系统 SHALL 移除所有展开的 HoverCard

#### Scenario: 页面卸载时清理缓存
- **WHEN** 用户离开账本详情页
- **THEN** 系统 SHALL 清空所有 HoverCard 数据缓存
- **THEN** 系统 SHALL 释放相关资源

### Requirement: 冲账记录详情显示
系统 SHALL 在 HoverCard 中展示每条冲账记录的详细信息，包括金额、时间、备注等。

#### Scenario: 显示冲账记录列表
- **WHEN** HoverCard 显示多条冲账记录
- **THEN** 系统 SHALL 按创建时间倒序排列冲账记录
- **THEN** 每条冲账记录 SHALL 显示：序号、时间、金额、备注
- **THEN** 系统 SHALL 使用背景色区分不同的冲账记录

#### Scenario: 显示净合计金额
- **WHEN** HoverCard 显示冲账详情
- **THEN** 系统 SHALL 计算净合计金额（原始金额 + 所有冲账金额）
- **THEN** 系统 SHALL 在底部突出显示净合计金额
- **THEN** 系统 SHALL 使用对应的颜色标识收入或支出

### Requirement: 净金额为 0 的特殊标记
系统 SHALL 在净金额为 0 时使用灰色文字标记，提供视觉区分。

#### Scenario: 净金额为 0 的标记
- **WHEN** 原始金额 + 所有冲账金额的和为 0
- **THEN** 系统 SHALL 在表格金额和 HoverCard 净合计中使用灰色文字
- **THEN** 系统 SHALL 保持字体大小和样式一致
- **THEN** 系统 SHALL 不影响其他交互功能

#### Scenario: 净金额不为 0 的正常显示
- **WHEN** 原始金额 + 所有冲账金额的和不为 0
- **THEN** 系统 SHALL 使用正常的颜色标识（收入为绿色，支出为红色）
- **THEN** 系统 SHALL 不应用特殊标记

### Requirement: HoverCard 样式和布局
系统 SHALL 提供清晰的 HoverCard 样式和布局，确保良好的用户体验。

#### Scenario: HoverCard 布局设计
- **WHEN** HoverCard 显示
- **THEN** 系统 SHALL 使用固定宽度（384px）
- **THEN** 系统 SHALL 使用适当的间距和边距
- **THEN** 系统 SHALL 使用圆角和边框增强视觉效果
- **THEN** 系统 SHALL 支持暗色主题

#### Scenario: HoverCard 内容分层显示
- **WHEN** HoverCard 显示
- **THEN** 系统 SHALL 分层显示：原始记录、冲账记录列表、净合计
- **THEN** 系统 SHALL 使用分隔线区分不同部分
- **THEN** 系统 SHALL 突出显示净合计金额

### Requirement: HoverCard 交互优化
系统 SHALL 提供流畅的 HoverCard 交互体验，包括加载状态、延迟显示、防止误触等优化。

#### Scenario: HoverCard 延迟显示
- **WHEN** 用户快速滑过金额区域
- **THEN** 系统 SHALL 不立即显示 HoverCard
- **THEN** 系统 SHALL 在 hover 持续一定时间（如 300ms）后显示 HoverCard

#### Scenario: HoverCard 加载状态反馈
- **WHEN** HoverCard 数据正在加载
- **THEN** 系统 SHALL 显示加载状态指示（如旋转图标）
- **THEN** 系统 SHALL 保持 HoverCard 的布局结构
- **THEN** 系统 SHALL 在加载完成后替换为实际内容

#### Scenario: HoverCard 错误状态处理
- **WHEN** HoverCard 数据加载失败
- **THEN** 系统 SHALL 显示错误信息
- **THEN** 系统 SHALL 提供重试按钮
- **THEN** 系统 SHALL 保持合理的错误恢复机制