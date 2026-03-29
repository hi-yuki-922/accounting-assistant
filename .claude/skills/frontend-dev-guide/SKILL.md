---
name: frontend-dev-guide
description: 指导 Tauri + React 19 桌面应用的前端开发，涵盖错误处理、组件开发、样式规范、路由管理等。当用户编写或修改 src/ 目录下的前端代码时必须使用此 skill，包括创建组件、页面、hooks、类型定义、工具函数，或进行前端相关的技术决策和代码审查。
---

# Tauri + React 19 前端开发指南

## 项目架构概览

本项目采用分层架构模式，从前端到后端的完整调用链为：

```
用户界面 (React 19 + TypeScript)
    ↓ TanStack Router
页面组件 (src/pages/*)
    ↓ 自定义 Hooks (src/hooks/*)
API 层 (src/api/commands/*)
    ↓ Tauri IPC
Rust 后端命令 (src-tauri/src/commands/*)
    ↓ Service 层
业务逻辑层
    ↓ Data Access Layer
数据库层 (SQLite via Sea-ORM)
```

### 目录结构

```
src/
├── api/                 # API 层 - Tauri IPC 命令封装
│   └── commands/       # 按模块组织的命令（chat, accounting 等）
├── components/          # 通用组件
│   ├── ui/            # shadcn/ui 组件
│   ├── ai-elements/   # AI 相关组件
│   └── layouts/       # 布局组件
├── hooks/             # 自定义 React Hooks
├── lib/               # 工具函数
├── pages/             # 页面组件
│   ├── dashboard/
│   │   ├── dashboard-page.tsx
│   │   └── components/
├── routes/            # TanStack Router 路由配置
├── types/             # TypeScript 类型定义
└── styles/            # 全局样式
```

---

## TypeScript 代码规范

### 类型定义

**始终使用 `type` 而不是 `interface`**

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

### 函数定义

**优先使用箭头函数，除非需要使用 `this`**

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

### 泛型类型

使用明确的类型参数，避免使用 `any`

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

---

## 错误处理规范

### 核心：Result 类型

本项目使用 `neverthrow` 库进行错误处理。所有底层函数（API 层、工具函数等）都必须返回 `Result<R, E>` 类型。

**预定义类型**（在 `src/types/lib.ts`）：

```typescript
import type { Result } from 'neverthrow'

export type SafeAsync<T> = Promise<Result<T, Error>>
export type Safe<T> = Result<T, Error>

export type TryCMD = {
  (...args: Parameters<typeof invoke>): SafeAsync<undefined>
  <T>(...args: Parameters<typeof invoke>): SafeAsync<T>
}
```

### 错误处理工具

在 `src/lib/index.ts` 中已定义以下工具函数，优先使用这些函数：

```typescript
// 同步函数包装
const safeFn = tryResult(unsafeFunction)

// 异步函数包装
const safeAsyncFn = tryResultAsync(asyncFunction)

// JSON 解析
const parsed = parseJson(jsonString)

// Tauri 命令调用
const result = await tryCMD<T>('command_name', { param: value })
```

### Result 操作模式

**Result 从底层向上传递**，使用 `map`、`mapErr` 进行转换，使用 `match` 解包：

```typescript
// ✅ 正确：使用 map/mapErr 链式操作
const result = await createSession(data)
  .map((session) => ({ ...session, extraField }))
  .mapErr((e) => new Error(`创建会话失败: ${e.message}`))

// ✅ 正确：使用 match 解包
result.match(
  (session) => {
    setCurrentSession(session)
  },
  (error) => {
    toast.error(error.message)
  }
)

// ⚠️ 允许：必要时使用 isOk/isErr 解包
if (result.isOk()) {
  const session = result.value
  setCurrentSession(session)
} else {
  toast.error(result.error.message)
}
```

### Hooks 中的错误处理

在自定义 Hooks 中，操作函数都应返回 `SafeAsync<T>` 类型：

```typescript
export const useMessages = () => {
  const loadMessages = async (sessionId: number): SafeAsync<void> => {
    const result = await chat.getMessages(sessionId)
    return result
      .map((messages) => setMessages(messages))
      .mapErr((e) => new Error(`加载消息失败：${e.message}`))
  }

  return { loadMessages }
}
```

---

## 文件组织规范

### 路由文件

**路由组件放在 `src/routes` 目录**，使用 TanStack Router 的 FileRoute 模式：

```typescript
// src/routes/chatbot.tsx
import { createFileRoute } from '@tanstack/react-router'
import { ChatbotPage } from '@/pages/chatbot/chatbot-page'
import { AppLayout } from '@/components/layouts/app-layout'

export const Route = createFileRoute('/chatbot')({
  component: () => (
    <AppLayout>
      <ChatbotPage />
    </AppLayout>
  ),
})
```

### 页面组件

**页面组件放在 `src/pages` 目录**，按路由路径组织：

- 路由 `/dashboard` → 页面组件 `src/pages/dashboard/dashboard-page.tsx`
- 路由 `/chatbot` → 页面组件 `src/pages/chatbot/chatbot-page.tsx`

**命名规范**：页面组件以 `-page.tsx` 结尾

### 页面组件拆分

当页面组件过大需要拆分时，在当前页面目录下创建 `components` 子目录：

```
src/pages/chatbot/
├── chatbot-page.tsx        # 主页面组件
└── components/
    ├── chat-header.tsx      # 拆分的子组件
    ├── message-input.tsx
    ├── message-list.tsx
    └── session-drawer.tsx
```

### 通用组件

**通用组件放在 `src/components` 目录**：

- `src/components/ui/` - shadcn/ui 基础组件
- `src/components/layouts/` - 布局组件
- `src/components/ai-elements/` - AI 相关组件

通用组件不应与特定页面耦合，应可被多个页面复用。

---

## API 层开发规范

### 命令模块组织

每个功能模块在 `src/api/commands/` 下有独立目录：

```
src/api/commands/
├── chat/
│   ├── index.ts        # 导出所有函数和便捷对象
│   ├── enums.ts       # 枚举定义
│   └── type.ts        # 类型定义
├── accounting/
└── accounting-book/
```

### 命令实现模板

```typescript
// src/api/commands/chat/index.ts
import { tryCMD } from '@/lib'

import type { ChatSession, CreateSessionDto } from './type'

// 导出类型
export type { ChatSession, CreateSessionDto } from './type'

/**
 * 创建聊天会话
 * 对应 Rust 后端 create_chat_session 命令
 */
export const createSession = (data: CreateSessionDto) =>
  tryCMD<ChatSession>('create_chat_session', { input: data })

/**
 * 获取所有聊天会话
 */
export const getAllSessions = () =>
  tryCMD<ChatSession[]>('get_all_chat_sessions')

// 便捷对象导出
export const chat = {
  createSession,
  getAllSessions,
  // ... 其他方法
}
```

### 类型定义模板

```typescript
// src/api/commands/chat/type.ts
/**
 * 聊天会话接口
 */
export type ChatSession = {
  id: number
  title: string
  model: string
  created_at: string
  updated_at: string
}

/**
 * 创建会话 DTO
 */
export type CreateSessionDto = {
  title?: string
  model?: string
}
```

---

## Hooks 开发规范

### Hook 结构模板

```typescript
/**
 * Hook 功能描述
 * 详细说明该 Hook 的用途和使用场景
 */

import React, { useState, useCallback } from 'react'
import { err, ok } from 'neverthrow'

import type { MessageRole, MessageState } from '@/api/commands'
import { chat } from '@/api/commands'
import type { ChatMessage } from '@/types/chat'
import type { SafeAsync } from '@/types/lib'

/**
 * Hook 状态和操作接口
 */
export type UseMessagesState = {
  // 状态
  messages: ChatMessage[]
  isLoading: boolean

  // 操作
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>

  // 方法
  loadMessages: (sessionId: number) => SafeAsync<void>
  createMessage: (message: {
    content: string
    role: MessageRole
    session_id: number
    state: MessageState
  }) => SafeAsync<ChatMessage>
}

/**
 * 消息管理 Hook
 */
export const useMessages = (): UseMessagesState => {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const loadMessages = async (sessionId: number): SafeAsync<void> => {
    setIsLoading(true)
    const result = await chat.getMessages(sessionId)
    setIsLoading(false)
    return result
      .map((message) => setMessages(message))
      .mapErr((e) => new Error(`加载消息失败：${e.message}`))
  }

  const createMessage = async (message): SafeAsync<ChatMessage> => {
    const result = await chat.createMessage(message)
    return result
      .map((newMessage) => {
        setMessages((prev) => [...prev, newMessage])
        return newMessage
      })
      .mapErr((e) => new Error(`创建消息失败：${e.message}`))
  }

  return {
    messages,
    isLoading,
    setMessages,
    loadMessages,
    createMessage,
  }
}
```

### Hook 命名规范

- 以 `use` 开头
- 使用驼峰命名法
- 描述核心功能：`useMessages`、`useSessions`、`useChatbot`

---

## 组件开发规范

### 函数组件

**始终使用函数组件**：

```typescript
// ✅ 正确
export const MyComponent = ({ prop1, prop2 }: Props) => {
  return <div>...</div>
}

// ❌ 错误
export class MyComponent extends React.Component {
  render() {
    return <div>...</div>
  }
}
```

### Props 类型定义

```typescript
export interface ComponentProps {
  // 必需属性
  title: string
  onAction: () => void

  // 可选属性
  disabled?: boolean
  className?: string
}

export const MyComponent: React.FC<ComponentProps> = ({
  title,
  onAction,
  disabled = false,
  className,
}) => {
  // 组件逻辑
  return <button onClick={onAction} disabled={disabled}>{title}</button>
}
```

### 组件注释

为组件添加清晰的注释：

```typescript
/**
 * 会话列表抽屉组件
 * 显示所有会话列表，支持选择、重命名和删除
 */

export interface SessionDrawerProps {
  isOpen: boolean
  onClose: () => void
  sessions: ChatSession[]
  onSelectSession: (session: ChatSession) => void
}

export const SessionDrawer: React.FC<SessionDrawerProps> = ({
  isOpen,
  onClose,
  sessions,
  onSelectSession,
}) => {
  // ...
}
```

### Hooks 使用

- Hooks 必须在组件顶层调用，不要条件调用
- 正确填写依赖数组
- 优先使用 `useCallback` 和 `useMemo` 优化性能

```typescript
export const MyComponent = ({ items }: Props) => {
  const [selected, setSelected] = useState<string | null>(null)

  // ✅ 正确：useCallback 配合依赖数组
  const handleClick = useCallback((id: string) => {
    setSelected(id)
  }, [])

  // ✅ 正确：useMemo 优化计算
  const filteredItems = useMemo(() => {
    return items.filter(item => item.active)
  }, [items])

  return (
    <div>
      {filteredItems.map(item => (
        <Item key={item.id} onClick={() => handleClick(item.id)} />
      ))}
    </div>
  )
}
```

---

## 样式规范

### Tailwind CSS

项目使用 Tailwind CSS v4 进行样式开发：

```typescript
// ✅ 使用 Tailwind 类名
<div className="flex h-screen bg-background p-4">

// ✅ 使用 cn 工具函数合并类名
import { cn } from '@/lib/utils'

<div className={cn(
  'base-classes',
  isActive && 'active-classes',
  className
)}>
```

### 主题支持

所有组件必须支持亮色和暗色主题，使用语义化的颜色类：

```typescript
// ✅ 使用语义化颜色
<div className="bg-background text-foreground border-border">

// ❌ 避免硬编码颜色
<div className="bg-white text-black">
```

---

## 路由导航

### TanStack Router

使用 `@tanstack/react-router` 进行路由管理：

```typescript
import { useRouter, Link } from '@tanstack/react-router'

// 编程式导航
const router = useRouter()
const navigate = () => router.navigate({ to: '/dashboard' })

// 声明式导航
<Link to="/chatbot">聊天</Link>
```

---

## 路径别名

**始终使用 `@/` 前缀引用 src 目录下的模块**：

```typescript
// ✅ 正确
import { Button } from '@/components/ui/button'
import { chat } from '@/api/commands'
import type { ChatMessage } from '@/types/chat'

// ❌ 错误
import { Button } from '../../../components/ui/button'
import { chat } from '../../api/commands'
```

---

## 开发工作流

### 创建新页面

1. 在 `src/pages/` 下创建页面目录
2. 创建 `{page-name}-page.tsx` 文件
3. 在 `src/routes/` 下创建对应的路由文件
4. 如需要，在 `src/pages/{page-name}/components/` 下拆分子组件

### 创建新 API 命令

1. 在 `src/api/commands/` 下创建模块目录
2. 创建 `type.ts`、`enums.ts`、`index.ts`
3. 使用 `tryCMD` 包装 Tauri 命令
4. 导出类型和便捷对象
5. 在 `src/api/index.ts` 中导出新模块

### 创建新 Hook

1. 在 `src/hooks/` 下创建 Hook 文件
2. 定义状态类型和操作接口
3. 实现 Hook 逻辑，操作函数返回 `SafeAsync<T>`
4. 在页面组件中使用 Hook

### 创建新组件

1. 判断组件是页面级还是通用级
   - 页面级：`src/pages/{page-name}/components/`
   - 通用级：`src/components/`
2. 使用 shadcn/ui 组件构建基础元素
3. 定义 Props 接口
4. 实现组件逻辑
5. 添加必要的注释

---

## 常见问题

### Q: 何时使用 `Result` 类型？

**A:** 所有涉及 I/O 操作、网络请求、数据库访问的函数都应返回 `Result` 类型。包括：
- API 命令调用
- 工具函数（如 JSON 解析）
- Hook 中的操作函数

### Q: 如何在组件中处理 Result？

**A:** 使用 `match` 方法处理成功和失败情况：

```typescript
result.match(
  (data) => {
    // 处理成功
    setData(data)
    toast.success('操作成功')
  },
  (error) => {
    // 处理失败
    toast.error(error.message)
  }
)
```

### Q: 何时拆分组件？

**A:** 当组件满足以下条件之一时考虑拆分：
- 组件代码超过 200 行
- 包含可独立复用的逻辑
- 有清晰的子功能边界

### Q: 如何使用 shadcn/ui 组件？

**A:** shadcn/ui 组件已安装在 `src/components/ui/`，直接导入使用：

```typescript
import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'
```

---

## 参考文件

在开发过程中，可以参考以下文件作为实现模板：

- **页面组件**：`src/pages/chatbot/chatbot-page.tsx`
- **Hook**：`src/hooks/use-messages.ts`
- **API 命令**：`src/api/commands/chat/index.ts`
- **组件**：`src/pages/chatbot/components/session-drawer.tsx`
- **路由**：`src/routes/chatbot.tsx`
- **工具函数**：`src/lib/index.ts`
