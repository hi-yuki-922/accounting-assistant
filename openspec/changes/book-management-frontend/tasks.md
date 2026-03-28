## 1. 后端实体和 DTO 变更

- [x] 1.1 在 `accounting_book.rs` Entity 中添加 `record_count: i32` 字段
- [x] 1.2 在 `accounting_book.rs` Entity 中添加 `icon: Option<String>` 字段
- [x] 1.3 更新 `accounting_book.rs` ActiveModel 的 `new()` 方法，初始化新增字段
- [x] 1.4 在 `CreateBookDto` 中添加 `icon: Option<String>` 字段
- [x] 1.5 在 `UpdateBookDto` 中添加 `icon: Option<Option<String>>` 字段
- [x] 1.6 更新前端类型定义 `api/commands/accounting-book/type.ts` 中的 AccountingBook 类型

## 2. 后端服务层实现

- [x] 2.1 修改 `AccountingBookService.create_book()`，创建账本时初始化 record_count 为 0，处理 icon 字段
- [x] 2.2 修改 `AccountingBookService.update_book()`，支持更新 icon 字段
- [x] 2.3 修改 `AccountingBookService.delete_book()`，删除账本时更新默认账本的 record_count
- [x] 2.4 修改 `AccountingBookService.create_default_book()`，创建默认账本时设置 icon 和初始化 record_count
- [x] 2.5 修改 `AccountingService.add_record()`，创建记录后更新对应账本的 record_count += 1

## 3. 前端依赖安装

- [x] 3.1 添加 dnd-kit 依赖：`pnpm add @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities`
- [x] 3.2 验证依赖安装成功

## 4. 前端配置和类型

- [x] 4.1 创建 `src/config/book-icons.ts`，定义 BOOK_ICONS 配置数组（15-20 个图标选项）
- [x] 4.2 更新 `src/api/commands/accounting-book/type.ts`，在 AccountingBook 类型中添加 record_count 和 icon 字段
- [x] 4.3 更新 CreateBookDto 和 UpdateBookDto，添加 icon 字段

## 5. 前端基础组件

- [x] 5.1 创建 `src/pages/books/components/book-card.tsx`，实现账本卡片组件（图标、标题、描述、记录数量、操作菜单）
- [x] 5.2 创建 `src/pages/books/components/book-icon-picker.tsx`，实现图标选择器组件
- [x] 5.3 创建 `src/pages/books/components/create-edit-book-dialog.tsx`，实现创建/编辑账本对话框
- [x] 5.4 创建 `src/pages/books/components/delete-book-confirm-dialog.tsx`，实现删除确认对话框

## 6. 账本列表页面

- [x] 6.1 创建 `src/pages/books/books-page.tsx`，实现账本列表页面主逻辑
- [x] 6.2 实现卡片网格布局（响应式：移动端 1 列、平板 2-3 列、桌面 3-5 列）
- [x] 6.3 集成 dnd-kit，实现拖拽排序功能
- [x] 6.4 实现排序配置存储到 localStorage（key: book_order）
- [x] 6.5 实现从 localStorage 读取排序配置
- [x] 6.6 实现默认账本始终排在最后的逻辑
- [x] 6.7 集成创建/编辑/删除功能

## 7. 账本详情页面

- [x] 7.1 创建 `src/pages/books/book-detail-page.tsx`，实现账本详情页面主逻辑
- [x] 7.2 实现返回按钮导航
- [x] 7.3 实现编辑和删除操作
- [x] 7.4 创建 `src/pages/books/components/record-filter.tsx`，实现记录筛选器（时间范围、类型、渠道、状态、重置按钮）
- [x] 7.5 创建 `src/pages/books/components/record-list-table.tsx`，实现记录列表表格
- [x] 7.6 集成分页组件
- [x] 7.7 实现空状态显示

## 8. 路由配置

- [x] 8.1 创建 `src/routes/books.tsx`，配置 `/books` 路由指向账本列表页面
- [x] 8.2 创建 `src/routes/books.$bookId.tsx`，配置 `/books/:bookId` 路由指向账本详情页面
- [x] 8.3 测试路由导航正常工作

## 9. 导航栏更新

- [x] 9.1 在 `src/components/layouts/app-layout.tsx` 侧边栏中添加"账本"导航项
- [x] 9.2 在 `src/components/layouts/bottom-nav.tsx` 底部导航中添加"账本"导航项
- [x] 9.3 测试导航高亮和跳转功能

## 10. 测试和验证

- [x] 10.1 测试创建账本功能（带图标、标题、描述）
- [x] 10.2 测试编辑账本功能（修改标题、描述、图标）
- [x] 10.3 测试删除账本功能（确认对话框、记录迁移）
- [x] 10.4 测试默认账本不能删除
- [x] 10.5 测试拖拽排序功能
- [x] 10.6 测试排序配置持久化（刷新页面后保持顺序）
- [ ] 10.7 测试账本详情页的记录筛选
- [x] 10.8 测试账本详情页的记录分页
- [x] 10.9 测试响应式布局（移动端、平板、桌面）
- [ ] 10.10 测试导航栏跳转和高亮

## 11. 数据库迁移验证

- [x] 11.1 启动应用，验证 Sea-ORM 自动同步 schema 成功
- [x] 11.2 检查 `accounting_book` 表包含 `record_count` 和 `icon` 列
- [x] 11.3 验证现有账本的 `record_count` 正确初始化
