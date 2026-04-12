# Hooks 开发规范

## 当前 Hooks

| Hook | 文件 | 用途 |
|---|---|---|
| `useSessionList` | `use-session-list.ts` | 会话列表管理：创建/删除/切换会话 |
| `useSectionList` | `use-section-list.ts` | Section 列表管理：展开/折叠/摘要刷新 |
| `useSectionChat` | `use-section-chat.ts` | Section 对话管理：Agent 实例/流式响应/JSONL 写入 |
| `useIsMobile` | `use-mobile.ts` | 移动端检测 |

## Hook 结构模板

### 简单列表管理 Hook

```typescript
/**
 * 会话列表管理 Hook
 * 管理会话列表状态和当前活跃会话，提供会话切换、创建、删除等操作
 */

import { useCallback, useState } from 'react'

import { createSession, deleteSession, getAllSessions } from '@/ai/storage/session-store'
import type { Session } from '@/ai/storage/types'

/**
 * Hook 状态和操作接口
 */
export type UseSessionListState = {
  sessions: Session[]
  activeSessionId: number | null
  isLoading: boolean

  switchSession: (id: number) => void
  createSession: (title?: string) => Promise<Session>
  deleteSession: (id: number) => Promise<void>
  loadTodayLastSession: () => Promise<void>
}

export const useSessionList = (): UseSessionListState => {
  const [sessions, setSessions] = useState<Session[]>([])
  const [activeSessionId, setActiveSessionId] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleCreateSession = useCallback(async (title?: string) => {
    const session = await createSession(title)
    setSessions((prev) => [session, ...prev])
    setActiveSessionId(session.id)
    return session
  }, [])

  // ... 其他方法

  return { sessions, activeSessionId, isLoading, switchSession, createSession: handleCreateSession, ... }
}
```

### 复杂流式对话 Hook（useSectionChat 模式）

```typescript
/**
 * Section 对话管理 Hook
 * 管理单个 Section 的消息状态、Agent 实例、流式响应和 JSONL 写入
 */

import { useCallback, useEffect, useRef, useState } from 'react'

export type UseSectionChatState = {
  messages: DisplayMessage[]
  isStreaming: boolean
  error: string | null
  send: (content: string) => Promise<void>
  sendHidden: (content: string) => Promise<void>  // 隐藏消息：用户不可见但发送给 Agent
  stop: () => void
}

export const useSectionChat = (
  sessionId: number | null,
  sectionFile: string | null,
  onStreamComplete?: () => void,
  confirmationMode: ConfirmationMode = 'on'
): UseSectionChatState => {
  const [messages, setMessages] = useState<DisplayMessage[]>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 用 ref 持有可变引用，避免闭包过期
  const agentRef = useRef<Awaited<ReturnType<typeof createAgent>> | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  // ... 初始化 Agent、消息发送、流式处理等逻辑
}
```

## Hook 命名规范

- 以 `use` 开头
- 使用驼峰命名法
- 描述核心功能：`useSectionChat`、`useSessionList`、`useSectionList`

## 设计原则

### 状态管理

- 使用 `useState` 管理本地状态
- 复杂的可变引用使用 `useRef`（如 Agent 实例、AbortController、JSONL 消息缓存）
- Loading 状态使用独立 `useState<boolean>`

### 操作函数

- 使用 `useCallback` 包裹需要缓存的函数
- 操作函数内部处理 loading 状态
- 使用 `try-finally` 确保 loading 状态重置
- **不需要** 返回 `SafeAsync<T>` 类型，使用普通 `Promise<void>` / `Promise<T>` 返回值

### 类型导出

- 同时导出 **Hook 状态接口**（如 `UseSessionListState`）和 **Hook 函数**
- 状态接口包含所有暴露的状态和方法

### 自动加载

如需在依赖项变化时自动加载数据：

```typescript
useEffect(() => {
  loadSections()
}, [loadSections])  // useCallback 的依赖变化时触发
```

## 与 API 层的交互

AI 相关 Hook（`useSessionList`、`useSectionList`、`useSectionChat`）直接调用 `@/ai/storage/` 中的存储函数，而非通过 API 层的 `tryCMD`。

普通业务页面（如客户、商品、订单）直接在页面组件中调用 API 层函数，不通过自定义 Hook。
