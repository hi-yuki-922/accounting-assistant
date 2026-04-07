## 1. 品类实体与序列

- [x] 1.1 创建 `category` 实体文件（id, name, sell_book_id, purchase_book_id, remark, create_at），定义 Relation 关联 accounting_book
- [x] 1.2 创建 `category_seq` 序列实体文件，实现 ID 生成（YYYYMMDDNNNNN 格式）
- [x] 1.3 在 `entity/mod.rs` 中注册 category 和 category_seq 实体

## 2. 品类服务层

- [x] 2.1 创建 `services/category/` 模块结构（mod.rs, dto.rs, service.rs）
- [x] 2.2 实现品类 DTO（CreateCategoryDto, UpdateCategoryDto）
- [x] 2.3 实现 CategoryService：创建品类（验证名称唯一、账本存在）
- [x] 2.4 实现 CategoryService：更新品类（名称唯一校验、"未分类"名称不可改）
- [x] 2.5 实现 CategoryService：删除品类（检查关联商品、"未分类"不可删）
- [x] 2.6 实现 CategoryService：查询所有品类（"未分类"排首位，其余按创建时间升序）
- [x] 2.7 实现 CategoryService：根据 ID 查询品类

## 3. 品类命令层与初始化

- [x] 3.1 注册品类 IPC 命令（create_category, update_category, delete_category, get_all_categories, get_category_by_id）
- [x] 3.2 在系统启动流程中添加"未分类"品类自动创建逻辑
- [x] 3.3 在服务容器中注册 CategoryService 单例

## 4. 枚举扩展

- [x] 4.1 在 AccountingType 枚举中新增 WriteOff 变体
- [x] 4.2 创建 OrderSubType 枚举（Wholesale, Retail, WholesalePurchase, PeerTransfer）
- [x] 4.3 实现 OrderSubType 的 Display 和序列化/反序列化

## 5. 商品实体修改

- [x] 5.1 在 product 实体中新增 category_id: Option<i64> 字段
- [x] 5.2 定义 product → category 的 belongs_to 关联关系
- [x] 5.3 更新 ProductFilter 的 serde rename 规则（如有变化）

## 6. 订单实体修改

- [x] 6.1 在 order 实体中新增 sub_type: OrderSubType 字段
- [x] 6.2 在 order 实体中删除 accounting_record_id 字段
- [x] 6.3 更新 OrderActiveModel 的默认值（sub_type 默认值）

## 7. 订单服务层重构

- [x] 7.1 修改 CreateOrderDto，新增 sub_type 字段
- [x] 7.2 修改 create_order：根据 order_type 和 customer_id 自动填充 sub_type 默认值，验证 sub_type 与 order_type 匹配
- [x] 7.3 修改 update_order：确保 sub_type 不可被修改
- [x] 7.4 重构 settle_order：实现按品类分组 order_items 逻辑
- [x] 7.5 实现 settle_order：为每个品类分组创建主记账记录（正确设置 book_id、accounting_type、title）
- [x] 7.6 实现 settle_order：折扣冲账按比例分摊逻辑（含尾差补差处理）
- [x] 7.7 实现 settle_order：创建 WriteOff 冲账记录（关联主记录、同一账本、负数金额）
- [x] 7.8 实现 settle_order：更新各账本 record_count
- [x] 7.9 移除 settle_order 中的 DEFAULT_BOOK_ID 硬编码和 accounting_record_id 更新逻辑

## 8. 前端 — 品类管理

- [x] 8.1 创建品类管理页面路由 /categories，添加侧边栏导航入口
- [x] 8.2 实现品类列表页面（卡片展示，显示名称、销售账本、进货账本、商品数量）
- [x] 8.3 实现创建品类弹窗（名称必填、销售/进货账本下拉选择、备注）
- [x] 8.4 实现编辑品类弹窗（"未分类"名称字段禁用）
- [x] 8.5 实现删除品类确认弹窗（有关联商品时提示）
- [x] 8.6 创建品类相关 API 调用函数

## 9. 前端 — 商品编辑适配

- [x] 9.1 在商品创建/编辑弹窗中新增品类选择（下拉框，加载品类列表）
- [x] 9.2 选择品类后同步更新冗余 category 字段（品类名称）

## 10. 前端 — 订单适配

- [x] 10.1 在创建订单弹窗中新增业务类型选择器（根据订单类型和客户选择联动默认值）
- [x] 10.2 重构结算弹窗：按品类分组展示记账预览（品类名称、记账金额、目标账本）
- [x] 10.3 结算弹窗中展示折扣冲账预览（有折扣时显示各品类冲账金额）
- [x] 10.4 采购订单金额标签改为"应付金额"和"实付金额"
- [x] 10.5 编辑订单弹窗中业务类型字段设为只读
- [x] 10.6 订单详情弹窗中展示记账记录列表（通过 order_id 反查，区分主记录和冲账记录）
- [x] 10.7 更新订单相关 API 调用函数（DTO 增加 sub_type 字段）
