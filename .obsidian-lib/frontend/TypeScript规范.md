# TypeScript 规范

## 类型定义

**始终使用 `type` 而不是 `interface`**：

```typescript
// ✅ 正确
type ChatMessage = {
  id: number
  content: string
  role: MessageRole
}

// ❌ 错误
interface ChatMessage {
  id: number
  content: string
  role: MessageRole
}
```

## 函数定义

**优先使用箭头函数**：

```typescript
// ✅ 正确
const formatDate = (date: Date): string => {
  return date.toLocaleDateString()
}

// ❌ 错误（除非需要 this）
function formatDate(date: Date): string {
  return date.toLocaleDateString()
}
```

## 泛型类型

使用明确的类型参数，避免使用 `any`：

```typescript
// ✅ 正确
const processData = <T extends Record<string, unknown>>(
  data: T
): Result<T, Error> => {
  return ok(data)
}

// ❌ 错误
const processData = (data: any): any => {
  return data
}
```

## 枚举定义

**使用 `as const` 对象**，不使用 TypeScript `enum`：

```typescript
// ✅ 正确：使用 as const 对象
export const AccountingType = {
  Income: 'Income',
  Expenditure: 'Expenditure',
  InvestmentIncome: 'InvestmentIncome',
} as const

export type AccountingType = (typeof AccountingType)[keyof typeof AccountingType]

// 伴随显示文本映射
export const ACCOUNTING_TYPE_DISPLAY_TEXT = {
  [AccountingType.Income]: '收入',
  [AccountingType.Expenditure]: '支出',
  [AccountingType.InvestmentIncome]: '投资收益',
} as const

// ❌ 错误：不要使用 TypeScript enum
enum AccountingType {
  Income = 'Income',
}
```

## 组件导出

使用命名导出，不使用默认导出：

```typescript
// ✅ 正确
export const OrdersPage = () => { ... }

// ❌ 错误
export default function OrdersPage() { ... }
```
