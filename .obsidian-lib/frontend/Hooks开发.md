# Hooks 开发规范

## Hook 结构模板

```typescript
/**
 * Hook 功能描述
 * 详细说明该 Hook 的用途和使用场景
 */

import { useState, useCallback } from 'react'
import { err, ok } from 'neverthrow'

import { customerApi } from '@/api/commands'
import type { Customer } from '@/api/commands/customer/type'
import type { SafeAsync } from '@/types/lib'

/**
 * Hook 状态和操作接口
 */
export type UseCustomersState = {
  // 状态
  customers: Customer[]
  isLoading: boolean

  // 方法
  loadCustomers: () => SafeAsync<void>
  createCustomer: (data: CreateCustomerDto) => SafeAsync<Customer>
}

/**
 * 客户管理 Hook
 */
export const useCustomers = (): UseCustomersState => {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const loadCustomers = useCallback(async (): SafeAsync<void> => {
    setIsLoading(true)
    const result = await customerApi.getAll()
    setIsLoading(false)
    return result
      .map((data) => setCustomers(data))
      .mapErr((e) => new Error(`加载客户失败：${e.message}`))
  }, [])

  const createCustomer = async (
    data: CreateCustomerDto
  ): SafeAsync<Customer> => {
    const result = await customerApi.create(data)
    return result
      .map((newCustomer) => {
        setCustomers((prev) => [...prev, newCustomer])
        return newCustomer
      })
      .mapErr((e) => new Error(`创建客户失败：${e.message}`))
  }

  return {
    customers,
    isLoading,
    loadCustomers,
    createCustomer,
  }
}
```

## Hook 命名规范

- 以 `use` 开头
- 使用驼峰命名法
- 描述核心功能：`useMessages`、`useSessions`、`useCustomers`

## 设计原则

### 状态管理

- 使用 `useState` 管理本地状态
- 提供 setter 供外部直接操作状态
- Loading 状态使用独立 `useState<boolean>`

### 操作函数

- 所有操作函数返回 `SafeAsync<T>` 类型
- 使用 `useCallback` 包裹需要缓存的函数
- 操作函数内部处理 loading 状态

### 类型导出

- 同时导出 **Hook 状态接口**（如 `UseCustomersState`）和 **Hook 函数**
- 状态接口包含所有暴露的状态和方法

## 自动加载

如需在组件挂载时自动加载数据：

```typescript
useEffect(() => {
  loadCustomers()
}, [loadCustomers])
```
