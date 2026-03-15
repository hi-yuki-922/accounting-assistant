---
name: frontend-dev-guide
description: 指导 Tauri + React 19 桌面应用的前端开发，涵盖错误处理、组件开发、样式规范、路由管理等。当用户编写或修改 src/ 目录下的前端代码时使用此 skill，包括创建组件、页面、hooks、类型定义、工具函数，或进行前端相关的技术决策和代码审查。
---

# 前端开发指导

这是一个用于指导 Tauri + React 19 桌面应用前端开发的文档。本项目使用现代前端技术栈，严格遵循类型安全和代码规范。

## 核心错误处理模式

项目采用 Rust Result 风格的错误处理，这是项目最重要的编码规范之一。

### 错误处理工具函数

所有错误处理都应使用 `src/lib/index.ts` 中提供的工具函数：

```typescript
import { tryResult, tryResultAsync, parseJson, tryCMD } from "@/lib/index.ts"
import { ok, err, Result } from "neverthrow"

// 同步函数错误处理
const safeDivide = tryResult((a: number, b: number) => {
  if (b === 0) throw new Error("Division by zero")
  return a / b
})

// 异步函数错误处理
const safeFetch = tryResultAsync(async (url: string) => {
  const response = await fetch(url)
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  return response.json()
})

// 使用示例
const result = safeDivide(10, 2)
if (result.isErr()) {
  console.error(result.error)
} else {
  console.log(result.value) // 5
}
```

### Tauri 命令调用

所有与后端通信的代码都应使用 `tryCMD` 函数：

```typescript
import { invoke } from "@tauri-apps/api/core"
import { tryCMD } from "@/lib/index.ts"

// 定义 Tauri 命令类型
interface AccountingRecord {
  id: string
  amount: number
  date: string
}

// 安全调用后端
async function getAccountingRecords() {
  const result = await tryCMD<AccountingRecord[]>("get_accounting_records")

  if (result.isErr()) {
    // 错误处理
    console.error("Failed to fetch records:", result.error)
    return []
  }

  return result.value
}
```

### Result 类型链式操作

利用 neverthrow 提供的链式方法处理复杂逻辑：

```typescript
import { pipe } from "neverthrow"

async function processUserData(userId: string) {
  const result = await pipe(
    tryCMD<UserData>("get_user", { userId }),
    andThen(async (user) => {
      const records = await tryCMD<Record[]>("get_records", { userId })
      return records.map(r => ({ ...user, records: r.value }))
    })
  )

  if (result.isErr()) {
    // 统一错误处理
    handleApiError(result.error)
    return null
  }

  return result.value
}
```

## 技术栈概览

### 核心框架
- **React 19**: 最新的 React 版本，使用客户端组件模式
- **TypeScript**: 严格模式，包含 `strict`、`noUnusedLocals`、`noUnusedParameters` 等规则
- **Vite**: 现代化构建工具，提供快速的开发体验

### 样式系统
- **Tailwind CSS v4**: 使用最新的 CSS-in-JS 风格，通过 `@tailwindcss/vite` 插件集成
- **shadcn/ui**: 基于 Radix UI 的组件库，使用 Radix Nova 主题
- **CSS 变量**: 完整的语义化颜色系统，支持亮色/暗色主题切换

### 路由和状态管理
- **@tanstack/react-router**: 文件系统路由，提供类型安全
- **next-themes**: 主题切换管理
- **React Hooks**: 使用内置 hooks 和自定义 hooks

### 数据可视化
- **@unovis/react**: 现代化的图表库
- **recharts**: 备选图表库

### 工具库
- **radash**: 实用工具函数库
- **neverthrow**: Result 类型错误处理
- **clsx + tailwind-merge**: 样式类合并工具
- **date-fns**: 日期处理

## 项目结构

```
src/
├── components/           # 组件目录
│   ├── ui/              # shadcn/ui 基础组件
│   ├── layouts/         # 布局组件
│   └── dashboard/       # 功能组件
├── hooks/               # 自定义 React hooks
├── lib/                 # 工具函数和配置
├── routes/              # 路由页面
├── styles/              # 样式文件
└── types/               # TypeScript 类型定义
```

## 组件开发规范

### 组件结构标准

所有组件都应遵循统一的结构：

```typescript
import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import type { ButtonProps } from "@/components/ui/button"

interface MyComponentProps {
  /** 组件标题 */
  title: string
  /** 是否启用 */
  enabled?: boolean
  /** 点击处理函数 */
  onClick?: () => void
  /** 自定义样式类 */
  className?: string
}

export function MyComponent({
  title,
  enabled = true,
  onClick,
  className
}: MyComponentProps) {
  return (
    <div className={cn("p-4 rounded-lg", className)}>
      <h2 className="text-lg font-semibold">{title}</h2>
      {enabled && (
        <Button onClick={onClick} className="mt-2">
          操作
        </Button>
      )}
    </div>
  )
}
```

### Props 接口规范

- 所有 Props 都必须有接口定义
- 使用 JSDoc 注释描述每个属性
- 为可选属性提供默认值
- 使用 `className` prop 支持样式定制

### 样式合并规范

使用 `cn()` 函数合并样式类，确保样式正确合并：

```typescript
import { cn } from "@/lib/utils"

// ✅ 正确：使用 cn() 合并样式
<div className={cn(
  "base-classes",
  isActive && "active-classes",
  customClassName
)} />

// ❌ 错误：直接拼接字符串
<div className={"base-classes " + (isActive ? "active-classes" : "")} />
```

### 响应式设计规范

项目使用 768px 作为移动端断点，响应式设计原则：

```typescript
// 响应式布局示例
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
  {items.map(item => (
    <div key={item.id} className="p-4">
      <h3 className="text-sm sm:text-base">{item.title}</h3>
      <p className="text-xs sm:text-sm">{item.description}</p>
    </div>
  ))}
</div>

// 自定义 hooks 检测移动端
import { useIsMobile } from "@/hooks/use-mobile"

function MyComponent() {
  const isMobile = useIsMobile()

  return (
    <div className={isMobile ? "mobile-layout" : "desktop-layout"}>
      {/* 根据设备显示不同内容 */}
    </div>
  )
}
```

## 类型定义规范

### 接口定义标准

所有类型定义都应使用 JSDoc 注释：

```typescript
/**
 * 财务记录接口
 */
export interface AccountingRecord {
  /** 记录唯一标识 */
  id: string
  /** 记录日期，格式为 YYYY-MM-DD */
  date: string
  /** 金额，正数表示收入，负数表示支出 */
  amount: number
  /** 记录类型：收入或支出 */
  type: "income" | "expense"
  /** 分类名称 */
  category: string
  /** 记录描述 */
  description: string
  /** 记录状态 */
  status: "completed" | "pending" | "cancelled"
}
```

### 使用类型推断

在可能的情况下，让 TypeScript 自动推断类型：

```typescript
// ✅ 好的实践
const users = await getUsers() // 类型自动推断为 User[]

// ✅ 明确需要类型时使用类型断言
const result = await invoke<AccountingRecord[]>("get_records")
```

## 路由开发规范

### 路由文件结构

使用文件系统路由，路由文件位于 `src/routes/` 目录：

```typescript
import { createFileRoute } from "@tanstack/react-router"
import { AppLayout } from "@/components/layouts/app-layout"

export const Route = createFileRoute("/dashboard")({
  component: DashboardRoute,
})

function DashboardRoute() {
  return (
    <AppLayout>
      {/* 页面内容 */}
    </AppLayout>
  )
}
```

### 路由类型安全

路由参数和搜索参数都有完整的类型支持：

```typescript
// 带参数的路由
export const Route = createFileRoute("/record/$id")({
  component: RecordDetail,
})

function RecordDetail() {
  const { id } = Route.useParams() // id: string

  return <div>Record ID: {id}</div>
}
```

## 样式规范

### Tailwind CSS 使用规范

#### 颜色使用
使用语义化的颜色变量，而非硬编码颜色值：

```typescript
// ✅ 正确：使用语义化颜色
<div className="bg-primary text-primary-foreground">
  主要内容
</div>

<div className="text-muted-foreground">
  次要文本
</div>

// ❌ 错误：硬编码颜色
<div className="bg-black text-white">
  主要内容
</div>
```

#### 间距和布局
遵循一致的间距系统：

```typescript
// 使用 Tailwind 的间距 scale
<div className="p-4 sm:p-6 lg:p-8">     // 内边距
<div className="gap-4 sm:gap-6">        // 元素间距
<div className="mt-4 sm:mt-6">         // 外边距
```

#### 响应式断点
项目使用以下响应式断点：
- `sm`: 640px
- `md`: 768px (移动端/桌面端分界)
- `lg`: 1024px
- `xl`: 1280px

### 组件样式定制

使用 `class-variance-authority` 管理组件变体：

```typescript
import { cva, type VariantProps } from "class-variance-authority"

const cardVariants = cva(
  "base-classes",
  {
    variants: {
      variant: {
        default: "default-variant-classes",
        primary: "primary-variant-classes",
      },
      size: {
        small: "small-size-classes",
        large: "large-size-classes",
      }
    },
    defaultVariants: {
      variant: "default",
      size: "medium",
    }
  }
)

interface CardProps extends VariantProps<typeof cardVariants> {
  children: React.ReactNode
}
```

## 工具函数规范

### 格式化函数

使用 `src/lib/formatters.ts` 中提供的格式化函数：

```typescript
import {
  formatCurrency,
  formatDate,
  formatRelativeTime,
  formatPercentage
} from "@/lib/formatters"

// 金额格式化
formatCurrency(1234.56)           // "¥1,234.56"
formatCurrencyCompact(12345678)   // "¥1234.6万"

// 日期格式化
formatDate(new Date())            // "2025年3月15日"
formatRelativeTime(yesterday)      // "昨天"

// 百分比格式化
formatPercentage(12.5)            // "+12.5%"
formatPercentage(-5.2)            // "-5.2%"
```

### 自定义工具函数

添加新的工具函数时，遵循以下规范：

```typescript
/**
 * 函数简短描述
 * @param param1 - 参数描述
 * @param param2 - 参数描述
 * @returns 返回值描述
 */
export function customUtil(param1: string, param2: number): string {
  // 实现逻辑
  return result
}
```

## 数据获取和状态管理

### Tauri 命令调用

```typescript
import { invoke } from "@tauri-apps/api/core"
import { tryCMD } from "@/lib/index.ts"

// 定义命令参数类型
interface GetRecordsParams {
  startDate: string
  endDate: string
  limit?: number
}

// 定义返回类型
interface AccountingRecord {
  id: string
  amount: number
  date: string
}

// 安全调用
async function fetchRecords(params: GetRecordsParams) {
  const result = await tryCMD<AccountingRecord[]>(
    "get_accounting_records",
    params
  )

  if (result.isErr()) {
    console.error("Failed to fetch records:", result.error)
    return []
  }

  return result.value
}
```

### 数据状态管理

```typescript
import { useState, useEffect } from "react"

function useAccountingRecords() {
  const [records, setRecords] = useState<AccountingRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    fetchRecords()
      .then(setRecords)
      .catch(setError)
      .finally(() => setLoading(false))
  }, [])

  return { records, loading, error }
}
```

## 图表和数据可视化

### 图表组件

使用 `@unovis/react` 创建图表：

```typescript
import { VisXYContainer, VisLine, VisAxis, VisCrosshair } from "@unovis/react"

interface ChartData {
  month: string
  income: number
  expense: number
}

export function RevenueChart({ data }: { data: ChartData[] }) {
  return (
    <VisXYContainer data={data}>
      <VisLine x="month" y="income" color="#3b82f6" />
      <VisLine x="month" y="expense" color="#ef4444" />
      <VisAxis type="x" />
      <VisAxis type="y" />
      <VisCrosshair />
    </VisXYContainer>
  )
}
```

## 测试和调试

### 开发工具

```bash
# 启动开发服务器
pnpm tauri dev

# 仅前端开发
pnpm dev

# 类型检查
pnpm tsc --noEmit

# 构建前端
pnpm build
```

### 调试技巧

1. **类型检查**: TypeScript 严格模式会捕获大部分错误
2. **组件 Props**: 使用 TypeScript 确保类型安全
3. **错误处理**: 使用 Result 类型捕获运行时错误
4. **浏览器 DevTools**: React DevTools 和 Redux DevTools (如需要)

## 性能优化

### 代码分割

使用动态导入进行代码分割：

```typescript
const LazyComponent = React.lazy(() => import("./LazyComponent"))

function App() {
  return (
    <React.Suspense fallback={<div>Loading...</div>}>
      <LazyComponent />
    </React.Suspense>
  )
}
```

### 组件优化

```typescript
// 使用 React.memo 避免不必要的重渲染
export const MemoizedComponent = React.memo(MyComponent)

// 使用 useMemo 缓存计算结果
const expensiveValue = useMemo(() => {
  return heavyCalculation(data)
}, [data])

// 使用 useCallback 缓存函数
const handleClick = useCallback(() => {
  // 处理逻辑
}, [dependency])
```

## 国际化考虑

项目使用中文界面，所有 UI 文本都应使用中文：

```typescript
// ✅ 正确
<Button>提交</Button>
<div className="text-muted-foreground">加载中...</div>

// ❌ 错误
<Button>Submit</Button>
<div className="text-muted-foreground">Loading...</div>
```

## 无障碍访问

遵循 Web 无障碍访问标准：

```typescript
// 按钮和链接
<button aria-label="关闭对话框">✕</button>

// 表单
<label htmlFor="email">邮箱</label>
<input id="email" type="email" aria-required="true" />

// 图片
<img src="chart.png" alt="月度收支趋势图" />

// 状态更新
<div role="status" aria-live="polite">
  {successMessage}
</div>
```

## 最佳实践总结

1. **类型安全**: 始终使用 TypeScript 严格模式
2. **错误处理**: 使用 Result 类型模式，避免 try-catch
3. **组件设计**: 单一职责，可重用，可测试
4. **样式管理**: 使用 Tailwind CSS 和 CSS 变量
5. **性能考虑**: 避免不必要的重渲染，合理使用 memo
6. **代码质量**: 保持代码简洁，遵循项目规范
7. **注释文档**: 为公共接口提供清晰的 JSDoc 注释
8. **响应式设计**: 考虑移动端和桌面端的不同需求

## 常见问题解决

### 如何处理 Tauri 命令错误？
```typescript
const result = await tryCMD("command_name")
if (result.isErr()) {
  // 显示错误消息给用户
  showErrorToast(result.error.message)
  return
}
// 使用 result.value
```

### 如何创建响应式组件？
```typescript
import { useIsMobile } from "@/hooks/use-mobile"

function MyComponent() {
  const isMobile = useIsMobile()
  return <div className={isMobile ? "mobile-view" : "desktop-view"}>
```

### 如何使用 shadcn/ui 组件？
```typescript
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

// 直接使用，样式已预设
<Button variant="default" size="md">
  点击我
</Button>
```

### 如何格式化财务数据？
```typescript
import { formatCurrency, formatPercentage } from "@/lib/formatters"

const formattedAmount = formatCurrency(1234.56)  // "¥1,234.56"
const formattedPercent = formatPercentage(12.5)  // "+12.5%"
```