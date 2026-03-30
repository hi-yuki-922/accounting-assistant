## 1. 后端 Entity & Enum

- [x] 1.1 创建 `enums/customer.rs`，定义 `CustomerCategory` 枚举（Retailer/Supplier），实现 Sea-ORM 转换 trait
- [x] 1.2 创建 `entity/customer_seq.rs`，复用现有序列生成模式（YYYYMMDD + 5位流水号）
- [x] 1.3 创建 `entity/customer.rs`，定义 Customer 实体（id, name, category, phone, wechat, address, bank_account, remark, create_at）
- [x] 1.4 更新 `entity/mod.rs` 和 `enums/mod.rs`，注册新模块

## 2. 后端 Service 层

- [x] 2.1 创建 `services/customer/dto.rs`，定义 CreateCustomerDto 和 UpdateCustomerDto，字段使用 camelCase 序列化
- [x] 2.2 创建 `services/customer/mod.rs`，实现 CustomerService（new, create, update, delete, get_all, get_by_id, search）
- [x] 2.3 更新 `services/mod.rs`，注册 customer 模块并在 `init_services` 中初始化 CustomerService

## 3. 后端 Command 层

- [x] 3.1 创建 `commands/customer.rs`，定义 Tauri IPC 命令（create_customer, update_customer, delete_customer, get_all_customers, get_customer_by_id, search_customers）
- [x] 3.2 更新 `commands/mod.rs`，注册客户管理命令到 `with_install_tauri_commands`

## 4. 前端类型 & IPC

- [x] 4.1 创建 `types/customer.ts`，定义 Customer、CustomerCategory、CreateCustomerDto、UpdateCustomerDto 类型
- [x] 4.2 创建前端 IPC 调用函数（invoke wrapper），封装客户管理的后端命令调用

## 5. 前端页面 & 组件

- [x] 5.1 创建 `routes/customers.tsx`，客户管理布局页（Outlet）
- [x] 5.2 创建 `routes/customers.index.tsx`，客户列表页面（卡片列表 + 搜索框 + 分类 Tab）
- [x] 5.3 创建客户卡片组件，展示姓名、分类标签、电话、操作按钮（编辑/删除）
- [x] 5.4 创建新增/编辑客户 Dialog 弹窗组件，包含表单字段和校验逻辑
- [x] 5.5 实现删除客户确认对话框

## 6. 前端导航集成

- [x] 6.1 更新侧边栏导航组件，新增「客户管理」入口（位于账本管理和 AI 助手之间）
- [x] 6.2 注册客户管理路由到应用路由配置
