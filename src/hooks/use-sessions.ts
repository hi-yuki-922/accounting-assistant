import { generateText } from 'ai'
/**
 * 会话管理 Hook
 * 专门处理会话的 CRUD 操作
 */
import { err, ok } from 'neverthrow'
import type { Result } from 'neverthrow'
import React, { useState } from 'react'

import { chat } from '@/api/commands'
import { tryResult } from '@/lib'
import { createZAiProvider } from '@/lib/ai-provider.ts'
import type { ChatSession } from '@/types/chat'

/**
 * 会话管理状态和操作接口
 */
export type UseSessionsState = {
  // 状态
  sessions: ChatSession[]
  currentSession: ChatSession | null
  editingSessionId: number | null
  editingTitle: string

  // 操作
  setSessions: React.Dispatch<React.SetStateAction<ChatSession[]>>
  setCurrentSession: React.Dispatch<React.SetStateAction<ChatSession | null>>
  setEditingSessionId: React.Dispatch<React.SetStateAction<number | null>>
  setEditingTitle: React.Dispatch<React.SetStateAction<string>>

  // 方法
  loadSessions: () => Promise<Result<void, Error>>
  createSession: (title?: string) => Promise<Result<ChatSession, Error>>
  generateSessionTitle: (
    sessionId: number,
    userContent: string
  ) => Promise<Result<void, Error>>
  selectSession: (session: ChatSession) => Result<void, Error>
  deleteSession: (sessionId: number) => Promise<Result<void, Error>>
  renameSession: (
    sessionId: number,
    newTitle: string
  ) => Promise<Result<void, Error>>
}

/**
 * 会话管理 Hook
 */
export const useSessions = (
  initialSessions: ChatSession[] = []
): UseSessionsState => {
  // 会话状态
  const [sessions, setSessions] = useState<ChatSession[]>(initialSessions)
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null)
  const [editingSessionId, setEditingSessionId] = useState<number | null>(null)
  const [editingTitle, setEditingTitle] = useState('')

  /**
   * 加载会话列表
   */
  const loadSessions = async () => {
    const result = await chat.getAllSessions()
    return result
      .map((allSessions) => {
        setSessions(allSessions)
      })
      .mapErr((e) => new Error(`加载会话失败: ${e.message}`))
  }

  /**
   * 创建新会话
   */
  const createSession = async (title?: string) => {
    const sessionTitle = title || `对话 ${sessions.length + 1}`
    const result = await chat.createSession({
      // 默认模型
      model: 'glm-4,7',
      title: sessionTitle,
    })

    return result
      .map((newSession) => {
        setSessions([newSession, ...sessions])
        setCurrentSession(newSession)
        return newSession
      })
      .mapErr((e) => new Error(`创建会话失败：${e.message}`))
  }

  /**
   * 选择会话
   */
  const selectSession = tryResult((session: ChatSession) => {
    setCurrentSession(session)
  })

  /**
   * 删除会话
   */
  const deleteSession = async (sessionId: number) => {
    const result = await chat.deleteSession(sessionId)
    return result
      .map((id) => {
        setSessions((prev) => prev.filter((s) => s.id !== id))
        if (currentSession?.id === sessionId) {
          setCurrentSession(null)
        }
      })
      .mapErr((e) => new Error(`删除会话失败：${e.message}`))
  }

  /**
   * 重命名会话
   */
  const renameSession = async (sessionId: number, newTitle: string) => {
    const result = await chat.updateSessionTitle(sessionId, newTitle.trim())
    return result
      .map(() => {
        setSessions((prev) =>
          prev.map((s) =>
            s.id === sessionId ? { ...s, title: newTitle.trim() } : s
          )
        )
        if (currentSession?.id === sessionId) {
          setCurrentSession((prev) =>
            prev ? { ...prev, title: newTitle.trim() } : null
          )
        }
      })
      .mapErr((e) => new Error(`更新会话标题失败：${e.message}`))
  }

  const generateSessionTitleLocal = async (
    sessionId: number,
    userContent: string
  ) => {
    const newTitle = userContent.slice(0, 20)
    const result = await chat.updateSessionTitle(sessionId, newTitle)
    return result
      .map(() => {
        setSessions((prev) =>
          prev.map((s) => (s.id === sessionId ? { ...s, title: newTitle } : s))
        )
        return ok()
      })
      .mapErr((e) => err(e))
  }

  /**
   * 根据用户首次对话内容生成一个会话标题
   * @param sessionId 会话id
   * @param userContent 用户首次输入内容
   */
  const generateSessionTitle = async (
    sessionId: number,
    userContent: string
  ) => {
    const result = createZAiProvider()
    const generateResult = await result.match(
      async (zAi) => {
        const data = await generateText({
          model: zAi('glm-4.7-flash'),
          prompt: `请对用户输入的内容进行总结摘要，生成一段简洁的描述作为会话标题（不超过10个字）：\n ====用户输入内容开始====\n${userContent}\n====用户输入内容结束====`,
        })
        setSessions((prev) =>
          prev.map((s) => (s.id === sessionId ? { ...s, title: data.text } : s))
        )
        return ok()
      },
      async (_) => await generateSessionTitleLocal(sessionId, userContent)
    )
    return generateResult.match(
      async () => {
        // oxlint-disable-next-line typescript/no-non-null-assertion
        const session = sessions.find((s) => s.id === sessionId)!
        await chat.updateSessionTitle(sessionId, session.title)
        return ok()
      },
      (e) => e
    )
  }

  return {
    // 状态
    sessions,
    currentSession,
    editingSessionId,
    editingTitle,

    // 操作
    setSessions,
    setCurrentSession,
    setEditingSessionId,
    setEditingTitle,

    // 方法
    loadSessions,
    createSession,
    generateSessionTitle,
    selectSession,
    deleteSession,
    renameSession,
  }
}
