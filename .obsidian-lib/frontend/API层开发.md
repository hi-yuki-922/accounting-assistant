# API 层开发规范

## 命令模块组织

每个功能模块在 `src/api/commands/` 下有独立目录：

```
src/api/commands/
├── index.ts             # 统一导出所有模块和便捷对象
├── accounting/
│   ├── index.ts         # 导出函数和便捷对象
│   ├── enums.ts         # 枚举定义（as const 模式）
│   └── type.ts          # 类型定义（对齐 Rust 后端）
├── accounting-book/
├── attachment/
├── chat/
├── customer/
├── order/
└── product/
```

## 类型定义规范

### 模块级类型

接口层的类型声明统一放在各模块的 `type.ts` 中：

```typescript
// src/api/commands/customer/type.ts

/** 客户类型（对齐 Rust 后端 CustomerCategory 枚举） */
export type CustomerCategory = 'Retailer' | 'Supplier'

/** 客户模型 */
export type Customer = {
  id: number
  name: string
  category: CustomerCategory
  phone: string | null
  address: string | null
  remark: string | null
  create_at: string
}

/** 创建客户 DTO */
export type CreateCustomerDto = {
  name: string
  category: string
  phone?: string
  address?: string
  remark?: string
}
```

### 跨模块共用类型

多个接口模块共用的类型放在 `api/shared/types.ts`：

```typescript
// src/api/shared/types.ts

/** 分页响应（统一使用此类型） */
export type PaginatedResponse<T> = {
  data: T[]
  total: number
  page: number
  page_size: number
}
```

> **规范**：分页统一使用 `PaginatedResponse<T>`，不要使用 `PaginatedResult<T>` 等其他变体。

## 枚举定义

使用 `as const` 对象模式：

```typescript
// src/api/commands/accounting/enums.ts
export const AccountingType = {
  Income: 'Income',
  Expenditure: 'Expenditure',
  InvestmentIncome: 'InvestmentIncome',
  InvestmentLoss: 'InvestmentLoss',
  WriteOff: 'WriteOff',
} as const

export type AccountingType =
  (typeof AccountingType)[keyof typeof AccountingType]

export const ACCOUNTING_TYPE_DISPLAY_TEXT = {
  [AccountingType.Income]: '收入',
  [AccountingType.Expenditure]: '支出',
  [AccountingType.InvestmentIncome]: '投资收益',
  [AccountingType.InvestmentLoss]: '投资亏损',
  [AccountingType.WriteOff]: '核销',
} as const
```

## 命令实现模板

```typescript
// src/api/commands/customer/index.ts
import { tryCMD } from '@/lib'

import type { Customer, CreateCustomerDto, UpdateCustomerDto } from './type'

// 导出类型
export type { Customer, CreateCustomerDto, UpdateCustomerDto } from './type'

/** 创建客户 */
export const createCustomer = (data: CreateCustomerDto) =>
  tryCMD<Customer>('create_customer', { input: data })

/** 获取所有客户 */
export const getAllCustomers = () => tryCMD<Customer[]>('get_all_customers')

/** 按 ID 获取客户 */
export const getCustomerById = (id: number) =>
  tryCMD<Customer>('get_customer_by_id', { id })

/** 搜索客户 */
export const searchCustomers = (keyword: string) =>
  tryCMD<Customer[]>('search_customers', { keyword })

/** 更新客户 */
export const updateCustomer = (data: UpdateCustomerDto) =>
  tryCMD<Customer>('update_customer', { input: data })

/** 删除客户 */
export const deleteCustomer = (id: number) =>
  tryCMD<boolean>('delete_customer', { id })

// 便捷对象
export const customerApi = {
  create: createCustomer,
  getAll: getAllCustomers,
  getById: getCustomerById,
  search: searchCustomers,
  update: updateCustomer,
  delete: deleteCustomer,
}
```

## 便捷对象命名

便捷对象统一使用 `{module}Api` 格式：

```typescript
// ✅ 正确
export const customerApi = { ... }
export const productApi = { ... }
export const orderApi = { ... }
export const accountingBookApi = { ... }
```

## 统一导出

在 `src/api/commands/index.ts` 中统一导出所有模块：

```typescript
export * from './accounting'
export * from './accounting-book'
export * from './attachment'
export * from './chat'
export * from './customer'
export * from './order'
export * from './product'
```
