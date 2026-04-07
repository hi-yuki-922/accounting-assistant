## Why

应用即将进入订单管理和 Agent 智能记账阶段，商品信息是订单模块的核心前置依赖。当前系统已完成账本、记账记录和客户管理，但缺少商品概念——无法支撑"卖了5斤苹果给张三"这样的自然语言场景。Agent 需要商品目录来识别、匹配和定价，订单模块需要商品来构建明细。

## What Changes

- 新增 `product` 实体（商品信息表）及对应的 `product_seq` 序列表
- 新增 `ProductService` 服务层，提供商品 CRUD 和模糊搜索能力
- 新增商品相关的 Tauri IPC Commands
- 新增前端商品管理页面（路由 `/products`），包含商品列表、创建、编辑、删除功能
- 新增 `ProductCategory` 枚举，用于商品分类
- 新增 `keywords` 字段（`Option<String>`），以分号分隔存储多个关键词，用于模糊搜索和 AI 检索
- 优化计量单位输入交互，提供常用单位 Chips 快捷选择 + 自由输入
- 优化关键词输入交互，使用 Tag 输入模式（回车添加、点击删除）

## Capabilities

### New Capabilities
- `product-entity`: 商品实体定义，包含字段（含 keywords）、序列、枚举（ProductCategory）
- `product-service`: 商品服务层，提供 CRUD、模糊搜索（覆盖 name/category/keywords）、分页查询
- `product-frontend`: 前端商品管理页面，路由 `/products`，含列表/创建/编辑/删除，计量单位 Chips 快捷选择，关键词 Tag 输入

### Modified Capabilities

无需修改现有能力规格。商品模块为独立新增，与现有模块通过逻辑外键（商品 ID）关联，不影响已有行为。

## Impact

- **后端**: 新增 entity、service、commands 模块，需在 `lib.rs` 注册实体和服务，在 `commands/mod.rs` 注册命令
- **前端**: 新增路由 `/products`，新增 API 调用层，新增页面组件
- **数据库**: 新增 `product` 和 `product_seq` 两张表（entity-first 自动同步）
- **导航**: 侧边栏需增加商品管理入口
