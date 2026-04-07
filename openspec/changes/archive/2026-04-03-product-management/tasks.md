## 1. 后端实体定义

- [x] 1.1 创建 `src-tauri/src/entity/product.rs`，定义 `product` 实体（id、name、category、unit、default_sell_price、default_purchase_price、sku、remark、create_at），实现 Sea-ORM 所需的 trait（TryGetable、ValueType、From<Value> 等）
- [x] 1.2 创建 `src-tauri/src/entity/product_seq.rs`，定义 `product_seq` 序列实体（date_key、seq），遵循现有序列模式
- [x] 1.3 在 `src-tauri/src/entity/mod.rs` 中注册 `product` 和 `product_seq` 实体

## 2. 后端服务层

- [x] 2.1 创建 `src-tauri/src/services/product/mod.rs`，实现 `ProductService`（接收 DatabaseConnection），包含 `create_product`、`update_product`、`delete_product` 方法
- [x] 2.2 在 ProductService 中实现 `get_all_products`、`get_product_by_id`、`search_products`（按名称和分类模糊搜索）方法
- [x] 2.3 在 `src-tauri/src/services/mod.rs` 中注册 ProductService，在 `lib.rs` 中初始化并注入 Tauri state

## 3. 后端命令层

- [x] 3.1 创建 `src-tauri/src/commands/product.rs`，实现 Tauri IPC 命令：`create_product`、`update_product`、`delete_product`、`get_all_products`、`get_product_by_id`、`search_products`
- [x] 3.2 在 `src-tauri/src/commands/mod.rs` 中注册所有商品命令

## 4. 前端 API 层

- [x] 4.1 创建 `src/api/commands/product/index.ts`，使用 `tryCMD<T>` 封装所有商品相关的 Tauri invoke 调用
- [x] 4.2 在 `src/api/commands/product/type.ts` 中定义商品相关的 TypeScript 类型（Product 类型，CreateProductDto、UpdateProductDto 接口）

## 5. 前端页面与组件

- [x] 5.1 创建 `src/routes/products.tsx`（布局页，AppLayout + Outlet）和 `src/routes/products.index.tsx`（商品列表页入口）
- [x] 5.2 创建 `src/pages/products/products-page.tsx`，实现商品列表页（商品卡片网格展示 + 搜索框 + 空状态）
- [x] 5.3 创建 `src/pages/products/product-card.tsx`，实现商品卡片组件（展示名称、分类、单位、参考价、操作按钮）
- [x] 5.4 创建 `src/pages/products/create-edit-product-dialog.tsx`，实现创建/编辑商品对话框（表单验证：name 和 unit 必填）
- [x] 5.5 创建 `src/pages/products/delete-product-confirm-dialog.tsx`，实现删除确认对话框

## 6. 导航集成

- [x] 6.1 在应用侧边栏导航中添加"商品管理"入口，链接到 `/products`

## 7. 关键词字段支持

- [x] 7.1 在 `product` 实体中新增 `keywords: Option<String>` 字段，更新 entity 定义
- [x] 7.2 更新 `CreateProductDto` 和 `UpdateProductDto`，增加 `keywords` 可选字段
- [x] 7.3 更新 `search_products` 服务方法，将 `keywords` 列加入模糊搜索 OR 条件
- [x] 7.4 更新前端 TypeScript 类型定义（Product、CreateProductDto、UpdateProductDto），增加 `keywords` 字段

## 8. 计量单位 Chips 快捷选择

- [x] 8.1 在创建/编辑商品对话框中，为计量单位输入框增加常用单位 Chips 快捷选择（预设列表：斤、公斤、个、件、箱、盒、袋、瓶、包）

## 9. 关键词 Tag 输入组件

- [x] 9.1 实现关键词 Tag 输入组件（回车添加 Tag、点击 × 删除 Tag、编辑时解析分号字符串回 Tag 列表）
- [x] 9.2 在创建/编辑商品对话框中集成关键词 Tag 输入组件，提交时将 Tag 列表拼接为分号分隔字符串
