/**
 * 会话列表管理 Hook
 * 管理会话列表状态和当前活跃会话，提供会话切换、创建、删除等操作
 */

import { useCallback, useState } from 'react'

import {
  createSession,
  deleteSession,
  getAllSessions,
} from '@/ai/storage/session-store'
import type { Session } from '@/ai/storage/types'

/**
 * useSessionList 状态和操作接口
 */
export type UseSessionListState = {
  /** 所有会话列表 */
  sessions: Session[]
  /** 当前活跃会话 ID */
  activeSessionId: number | null
  /** 加载中 */
  isLoading: boolean

  /** 切换活跃会话 */
  switchSession: (id: number) => void
  /** 创建新会话并设为活跃 */
  createSession: (title?: string) => Promise<Session>
  /** 删除会话 */
  deleteSession: (id: number) => Promise<void>
  /** 加载今日最后会话，无会话则自动创建 */
  loadTodayLastSession: () => Promise<void>
}

/**
 * 会话列表管理 Hook
 */
export const useSessionList = (): UseSessionListState => {
  const [sessions, setSessions] = useState<Session[]>([])
  const [activeSessionId, setActiveSessionId] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const switchSession = useCallback((id: number) => {
    setActiveSessionId(id)
  }, [])

  const handleCreateSession = useCallback(async (title?: string) => {
    const session = await createSession(title)
    setSessions((prev) => [session, ...prev])
    setActiveSessionId(session.id)
    return session
  }, [])

  const handleDeleteSession = useCallback(
    async (id: number) => {
      await deleteSession(id)
      setSessions((prev) => prev.filter((s) => s.id !== id))

      // 如果删除的是活跃会话，切换到列表中第一个
      if (activeSessionId === id) {
        setSessions((prev) => {
          if (prev.length > 0) {
            setActiveSessionId(prev[0].id)
          } else {
            setActiveSessionId(null)
          }
          return prev
        })
      }
    },
    [activeSessionId]
  )

  const loadTodayLastSession = useCallback(async () => {
    setIsLoading(true)
    try {
      const allSessions = await getAllSessions()
      setSessions(allSessions)

      // 获取今天的日期字符串（本地时间）
      const today = new Date()
      const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

      // 找到今天创建的最后一个会话（列表已按 createdAt 倒序）
      const todaySession = allSessions.find((s) =>
        s.createdAt.startsWith(todayStr)
      )

      if (todaySession) {
        setActiveSessionId(todaySession.id)
      } else {
        // 今日无会话，自动创建
        const session = await createSession()
        setSessions((prev) => [session, ...prev])
        setActiveSessionId(session.id)
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    sessions,
    activeSessionId,
    isLoading,
    switchSession,
    createSession: handleCreateSession,
    deleteSession: handleDeleteSession,
    loadTodayLastSession,
  }
}
