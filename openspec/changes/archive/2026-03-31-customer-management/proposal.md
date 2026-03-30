## Why

当前应用只支持纯粹的收支记账，缺少交易对手（客户）的概念。用户在实际经营中与小型商铺老板、供货商有长期生意往来，需要一个通讯录式的客户信息管理功能，方便快速查找和记录客户基础信息。后续订单模块将基于客户数据实现往来明细查询、应收应付管理和单据打印。

## What Changes

- 新增客户（Customer）数据实体，包含姓名、分类、电话、微信号、地址、银行账号、备注等字段
- 新增客户分类枚举：零售商（Retailer）、供应商（Supplier）
- 新增客户管理的完整 CRUD 后端服务（entity → service → command）
- 新增前端客户管理页面：卡片列表展示，支持按姓名/电话搜索和按分类筛选
- 新增前端客户新增/编辑弹窗（Dialog）
- 侧边栏导航新增「客户管理」入口

## Capabilities

### New Capabilities
- `customer-entity`: 客户数据实体定义，包含 Customer 实体、ID 序列生成器、CustomerCategory 枚举
- `customer-service`: 客户业务逻辑层，提供 CRUD 操作服务
- `customer-frontend`: 客户管理前端页面，包含卡片列表、搜索筛选、新增/编辑弹窗、侧边栏导航

### Modified Capabilities

（无，客户管理为全新模块，不影响现有功能）

## Impact

- **后端新增文件**: `entity/customer.rs`, `entity/customer_seq.rs`, `enums/customer.rs`, `services/customer/`, `commands/customer.rs`
- **前端新增文件**: `types/customer.ts`, `components/customer/`, `routes/customers.index.tsx`, `routes/customers.tsx`
- **前端修改**: 侧边栏导航组件需新增客户管理入口
- **后端修改**: `lib.rs` 注册新实体、服务和命令；`entity/mod.rs`、`services/mod.rs`、`commands/mod.rs` 添加模块声明
- **数据库**: 自动新增 `customer` 和 `customer_seq` 两张表
- **无破坏性变更**: 完全增量式开发，不影响现有功能
