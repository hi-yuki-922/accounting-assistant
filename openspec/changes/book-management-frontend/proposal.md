## Why

后端账本管理接口（CRUD、分页查询、记录关联）已经完整实现，但缺少对应的前端管理界面。用户无法通过 UI 直观地管理多个账本、查看账本详情和浏览账本内的记账记录。添加账本管理页面是完善核心记账功能的关键步骤。

## What Changes

- **后端变更**：
  - `AccountingBook` 实体新增 `record_count` 字段用于缓存记录数量
  - `AccountingBook` 实体新增 `icon` 字段用于存储账本图标
  - `AccountingService.add_record()` 创建记录时自动更新对应账本的 `record_count`
  - `AccountingBookService.delete_book()` 删除账本时更新默认账本的 `record_count`
  - DTO 新增 `icon` 字段支持创建和更新账本图标

- **前端变更**：
  - 新增 `/books` 路由：账本列表页面，卡片视图展示所有账本
  - 新增 `/books/:bookId` 路由：账本详情页面，展示账本内的记账记录
  - 新增账本卡片组件，支持显示图标、标题、描述、记录数量
  - 新增图标选择器组件，提供预设图标选项
  - 新增创建/编辑账本对话框
  - 实现拖拽排序功能（使用 dnd-kit），排序配置存储在 localStorage
  - 侧边栏和底部导航栏添加"账本"入口
  - 账本详情页支持按时间范围、类型、渠道、状态筛选记录
  - 添加分页组件

## Capabilities

### New Capabilities

- `book-management-frontend`: 账本管理前端页面，包括账本列表（卡片视图）、账本详情（记录列表）、创建/编辑/删除功能、拖拽排序、图标选择

### Modified Capabilities

- `accounting-book-service`: 账本实体新增 `record_count` 和 `icon` 字段，创建和删除记录时需要维护 `record_count` 字段的正确性

## Impact

- **后端代码**：
  - `src-tauri/src/entity/accounting_book.rs`: 实体结构变更
  - `src-tauri/src/services/accounting_book/dto/mod.rs`: DTO 新增 icon 字段
  - `src-tauri/src/services/accounting_book/mod.rs`: 创建/更新/删除账本时处理 icon 和 record_count
  - `src-tauri/src/services/accounting/mod.rs`: 添加记录时更新 record_count
  - 数据库 schema: Sea-ORM 自动同步新增字段

- **前端代码**：
  - 新增页面：`src/pages/books/books-page.tsx`, `src/pages/books/book-detail-page.tsx`
  - 新增组件：`src/pages/books/components/book-card.tsx`, `src/pages/books/components/book-icon-picker.tsx`
  - 新增路由：`src/routes/books.tsx`, `src/routes/books.$bookId.tsx`
  - 修改布局：`src/components/layouts/app-layout.tsx`, `src/components/layouts/bottom-nav.tsx` 添加账本导航
  - 新增配置：`src/config/book-icons.ts` 图标选项列表
  - 类型定义更新：`src/api/commands/accounting-book/type.ts`

- **依赖**：
  - 前端新增 `@dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities` 依赖

- **用户体验**：
  - 用户可以直观地查看和管理所有账本
  - 支持自定义账本图标，提升视觉识别度
  - 通过拖拽排序个性化账本展示顺序
  - 快速浏览账本内的记账记录
  - 筛选和分页提升大数据量场景下的使用体验
