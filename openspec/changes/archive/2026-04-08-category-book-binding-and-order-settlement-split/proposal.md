## Why

当前订单结算时，记账记录硬编码写入默认账本（"未归类账目"），无法按商品品类自动分类记账。实际业务中，不同品类的商品需要记账到不同账本（如"海鲜-贝类"、"进货-鱼类"等），且一张订单经常包含多种品类商品，需要按品类拆分记账。此外，订单上的折扣/抹零需要以冲账形式准确反映在各品类账本中。

## What Changes

- 新增商品品类（category）实体，作为商品的基础资料，支持 CRUD 管理
- 品类绑定两个账本：`sell_book_id`（销售账本）和 `purchase_book_id`（进货账本）
- 系统启动时自动创建"未分类"品类，默认绑定"未归类账目"
- 商品实体新增 `category_id` 字段关联品类，现有 `category` 字段保留为冗余名称
- 订单新增 `sub_type` 业务类型字段（批发/零售/批发进货/同行调货），创建后不可修改
- **BREAKING**: 删除订单实体上的 `accounting_record_id` 字段，改为通过 `accounting_record.order_id` 反查
- 订单结算流程重构：按品类分组 order_items，每组生成一条应收记账记录
- 新增 `AccountingType::WriteOff` 枚举变体，用于记录折扣/抹零冲账
- 有折扣时按比例生成冲账记录（负数金额），与主记录归入同一账本
- 前端新增品类管理页面、商品编辑关联品类、结算 UI 适配、采购订单文案调整

## Capabilities

### New Capabilities
- `category-entity`: 商品品类实体定义，包含品类与账本的绑定关系（sell_book_id、purchase_book_id）
- `category-service`: 品类 CRUD 服务层，系统启动时自动创建"未分类"品类
- `category-frontend`: 品类管理前端页面，基础资料 CRUD
- `order-sub-type`: 订单业务类型枚举（批发/零售/批发进货/同行调货），创建时选择且不可修改
- `order-settlement-split`: 订单结算按品类拆分记账，含折扣冲账（WriteOff）逻辑

### Modified Capabilities
- `product-entity`: 新增 `category_id` 字段关联品类实体
- `order-entity`: 删除 `accounting_record_id` 字段，新增 `sub_type` 字段
- `order-service`: 结算流程重构，按品类拆分记账 + 冲账生成
- `order-frontend`: 订单创建增加业务类型选择，结算 UI 适配拆分展示，采购订单文案调整

## Impact

- **数据库迁移**: 新增 `category` 表；`product` 表新增 `category_id` 列；`order` 表删除 `accounting_record_id` 列、新增 `sub_type` 列
- **实体层**: 新增 category 实体及关联关系；修改 product、order 实体
- **枚举**: 新增 `OrderSubType` 枚举；`AccountingType` 新增 `WriteOff` 变体
- **服务层**: 新增 CategoryService；重构 OrderService 的结算逻辑
- **命令层**: 新增品类 IPC 命令；修改订单结算命令
- **前端**: 新增品类管理路由及页面；修改商品编辑、订单创建、订单结算相关组件
- **系统初始化**: 启动时自动创建"未分类"品类
