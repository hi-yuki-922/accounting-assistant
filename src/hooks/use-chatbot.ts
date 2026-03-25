/**
 * 聊天机器人状态管理 Hook
 * 管理会话列表、消息、输入状态等核心逻辑
 */

import type { ChatStatus } from 'ai'
import { streamText } from 'ai'
import { ok } from 'neverthrow'
import React, { useEffect, useRef, useState } from 'react'

import { chat, MessageRole, MessageState } from '@/api/commands'
import type { PromptInputMessage } from '@/components/ai-elements/prompt-input'
import { tryResultAsync } from '@/lib'
import {
  createFinanceAgent,
  createZAiProvider,
  getApiKey,
  getModelName,
} from '@/lib/ai-provider'
import { financeTools } from '@/lib/chat-tools'
import type { ChatMessage, ChatSession } from '@/types/chat'

/**
 * 聊天机器人状态和操作接口
 */
export interface ChatbotState {
  // 状态
  sessions: ChatSession[]
  currentSession: ChatSession | null
  messages: ChatMessage[]
  input: string
  isLoading: boolean
  chatStatus: ChatStatus
  isDrawerOpen: boolean
  editingSessionId: number | null
  editingTitle: string

  // 操作
  setSessions: React.Dispatch<React.SetStateAction<ChatSession[]>>
  setCurrentSession: React.Dispatch<React.SetStateAction<ChatSession | null>>
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>
  setInput: React.Dispatch<React.SetStateAction<string>>
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>
  setChatStatus: React.Dispatch<React.SetStateAction<ChatStatus>>
  setIsDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>
  setEditingSessionId: React.Dispatch<React.SetStateAction<number | null>>
  setEditingTitle: React.Dispatch<React.SetStateAction<string>>

  // 方法
  onLoadSessions: () => Promise<void>
  onSelectSession: (session: ChatSession) => Promise<void>
  onDeleteSession: (sessionId: number) => Promise<void>
  onStartRenameSession: (session: ChatSession) => void
  onSaveSessionTitle: (sessionId: number) => Promise<void>
  onCancelRenameSession: () => void
  onSendMessage: (message: PromptInputMessage) => Promise<void>
  onCreateNewSession: () => Promise<ChatSession | null>
}

/**
 * 聊天机器人状态管理 Hook
 */
export const useChatbot = (
  initialSessions: ChatSession[] = []
): ChatbotState => {
  // 核心状态
  const [sessions, setSessions] = useState<ChatSession[]>(initialSessions)
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [chatStatus, setChatStatus] = useState<ChatStatus>('submitted')
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [editingSessionId, setEditingSessionId] = useState<number | null>(null)
  const [editingTitle, setEditingTitle] = useState('')

  // Agent 引用
  const agentRef = useRef<ReturnType<typeof createFinanceAgent> | null>(null)

  // 获取 API Key 和模型名称
  const apiKey = getApiKey()
  const modelName = getModelName()

  // 初始化 Agent
  useEffect(() => {
    if (apiKey) {
      agentRef.current = createFinanceAgent(modelName)
    }
  }, [apiKey, modelName])

  /**
   * 加载会话列表
   */
  const loadSessions = tryResultAsync(async () => {
    const result = await chat.getAllSessions()
    if (result.isOk()) {
      setSessions(result.value)
    } else {
      console.error('加载会话列表失败:', result.error)
      throw result.error
    }
  })

  /**
   * 加载消息
   */
  const loadMessages = tryResultAsync(async (sessionId: number) => {
    const result = await chat.getMessages(sessionId)
    if (result.isOk()) {
      setMessages(result.value)
    } else {
      console.error('加载消息失败:', result.error)
      throw result.error
    }
  })

  /**
   * 创建新会话
   */
  const createNewSession = tryResultAsync(async () => {
    const result = await chat.createSession({
      model: modelName,
      title: `对话 ${sessions.length + 1}`,
    })

    if (result.isOk()) {
      const newSession = result.value
      setSessions([newSession, ...sessions])
      setCurrentSession(newSession)
      setMessages([])
      setIsDrawerOpen(false)
      return newSession
    }

    console.error('创建会话失败:', result.error)
    throw result.error
  })

  /**
   * 创建临时会话
   */
  const createTempSession = tryResultAsync(async (): Promise<ChatSession> => {
    const result = await chat.createSession({
      model: modelName,
      title: '新对话',
    })

    if (result.isOk()) {
      const newSession = result.value
      setSessions([newSession, ...sessions])
      setCurrentSession(newSession)
      return newSession
    }

    throw new Error('创建会话失败')
  })

  /**
   * 选择会话
   */
  const selectSession = tryResultAsync(async (session: ChatSession) => {
    setCurrentSession(session)
    await loadMessages(session.id)
    setIsDrawerOpen(false)
  })

  /**
   * 删除会话
   */
  const deleteSession = tryResultAsync(async (sessionId: number) => {
    const result = await chat.deleteSession(sessionId)
    if (result.isOk()) {
      setSessions((prev) => prev.filter((s) => s.id !== sessionId))
      if (currentSession?.id === sessionId) {
        setCurrentSession(null)
        setMessages([])
      }
    } else {
      console.error('删除会话失败:', result.error)
      throw result.error
    }
  })

  /**
   * 开始重命名会话
   */
  const startRenameSession = (session: ChatSession) => {
    setEditingSessionId(session.id)
    setEditingTitle(session.title)
  }

  /**
   * 保存会话标题
   */
  const saveSessionTitle = tryResultAsync(async (sessionId: number) => {
    const result = await chat.updateSessionTitle(sessionId, editingTitle.trim())
    if (result.isOk()) {
      setSessions((prev) =>
        prev.map((s) =>
          s.id === sessionId ? { ...s, title: editingTitle.trim() } : s
        )
      )
      if (currentSession?.id === sessionId) {
        setCurrentSession((prev) =>
          prev ? { ...prev, title: editingTitle.trim() } : null
        )
      }
      setEditingSessionId(null)
      setEditingTitle('')
    } else {
      console.error('更新会话标题失败:', result.error)
      throw result.error
    }
  })

  /**
   * 取消重命名
   */
  const cancelRenameSession = () => {
    setEditingSessionId(null)
    setEditingTitle('')
  }

  const getCurrentSession = tryResultAsync(async () => {
    // 如果没有当前会话，先创建临时会话
    let session = currentSession
    if (!session) {
      const newSession = await createTempSession()
      if (newSession.isErr()) {
        throw newSession._unsafeUnwrapErr
      }
      session = newSession._unsafeUnwrap()
    }

    return session
  })

  const generateSessionTitleLocal = async (
    firstMessage: string,
    sessionId: number
  ) => {
    // 如果没有 Agent，使用简单截断作为降级方案
    const newTitle = firstMessage.slice(0, 20)
    await chat.updateSessionTitle(sessionId, newTitle)
    setSessions((prev) =>
      prev.map((s) => (s.id === sessionId ? { ...s, title: newTitle } : s))
    )
    if (currentSession?.id === sessionId) {
      setCurrentSession((prev) => (prev ? { ...prev, title: newTitle } : null))
    }
  }
  /**
   * 生成会话标题
   */
  const generateSessionTitle = tryResultAsync(
    async (sessionId: number, firstMessage: string) => {
      const agent = agentRef.current
      if (!agent) {
        await generateSessionTitleLocal(firstMessage, sessionId)
        return
      }

      // 使用 AI 生成简洁的会话标题
      if (!apiKey) {
        throw new Error('API Key 未配置')
      }

      const provider = createZAiProvider(apiKey)
      const model = provider(modelName)

      const result = streamText({
        messages: [
          {
            content: `请根据以下对话内容生成一个简洁的会话标题（不超过 10 个字）：\n${firstMessage}`,
            role: 'user',
          },
        ],
        model,
      })

      let newTitle = ''
      for await (const chunk of result.textStream) {
        newTitle += chunk
      }

      newTitle = newTitle.trim().slice(0, 20)
      await chat.updateSessionTitle(sessionId, newTitle)
      setSessions((prev) =>
        prev.map((s) => (s.id === sessionId ? { ...s, title: newTitle } : s))
      )
      if (currentSession?.id === sessionId) {
        setCurrentSession((prev) =>
          prev ? { ...prev, title: newTitle } : null
        )
      }
    }
  )

  /**
   * 发送消息
   */
  const sendMessage = tryResultAsync(async (message: PromptInputMessage) => {
    const { text: userContent, files } = message
    if (!userContent.trim() && files.length === 0) {
      return
    }

    const session = await getCurrentSession()

    if (session.isErr()) {
      throw new Error('创建会话失败：', session.error)
    }

    setInput('')
    setIsLoading(true)
    setChatStatus('submitted')

    try {
      // 保存用户消息
      const userResult = await chat.createMessage({
        content: userContent,
        role: MessageRole.User,
        session_id: session.value.id,
        state: MessageState.Completed,
      })

      if (userResult.isErr()) {
        console.error('保存用户消息失败:', userResult.error)
        throw new Error('保存用户消息失败')
      }

      setMessages((prev) => [...prev, userResult.value])

      // 创建占位符助手消息
      const assistantResult = await chat.createMessage({
        content: '',
        role: MessageRole.Assistant,
        session_id: session.id,
        state: MessageState.Sending,
      })

      if (assistantResult.isErr()) {
        console.error('创建助手消息失败:', assistantResult.error)
        throw new Error('创建助手消息失败')
      }

      setMessages((prev) => [...prev, assistantResult.value])

      // 加载历史消息
      const historyMessages = await chat.getMessages(session.id)
      if (historyMessages.isErr()) {
        console.error('获取历史消息失败:', historyMessages.error)
        throw new Error('获取历史消息失败')
      }

      // 使用 streamText 进行 AI 调用
      if (!apiKey) {
        throw new Error('API Key 未配置')
      }

      const provider = createZAiProvider(apiKey)
      const model = provider(modelName)

      // 构建消息历史
      const messages = historyMessages.value.map((msg) => ({
        content: msg.content,
        role: msg.role as 'user' | 'assistant' | 'system',
      }))

      let aiResponse = ''
      const result = streamText({
        messages,
        model,
      })

      // 处理流式响应
      for await (const chunk of result.textStream) {
        aiResponse += chunk
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantResult.value.id
              ? { ...msg, content: aiResponse }
              : msg
          )
        )
      }

      // 更新消息内容和状态
      await chat.updateMessageContent({
        content: aiResponse,
        id: assistantResult.value.id,
      })
      await chat.updateMessageState(
        assistantResult.value.id,
        MessageState.Completed
      )

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantResult.value.id
            ? {
                ...msg,
                content: aiResponse,
                state: MessageState.Completed,
              }
            : msg
        )
      )

      // 首轮对话后自动生成标题
      if (session.value.title === '新对话') {
        await generateSessionTitle(session.value.id, userContent)
      }
    } catch (error) {
      console.error('发送消息失败:', error)

      // 更新错误状态
      setChatStatus('error')
      setMessages((prev) => {
        const lastMessage = prev.at(-1)
        if (lastMessage && lastMessage.role === MessageRole.Assistant) {
          return prev.map((msg) =>
            msg.id === lastMessage.id
              ? {
                  ...msg,
                  content:
                    '抱歉，处理您的请求时出现错误。请检查 API Key 配置或稍后重试。',
                  state: MessageState.Failed,
                }
              : msg
          )
        }
        return prev
      })

      throw error
    } finally {
      setIsLoading(false)
    }
  })

  // 初始加载会话
  useEffect(() => {
    loadSessions()
  }, [])

  return {
    // 状态
    sessions,
    currentSession,
    messages,
    input,
    isLoading,
    chatStatus,
    isDrawerOpen,
    editingSessionId,
    editingTitle,

    // 操作
    setSessions,
    setCurrentSession,
    setMessages,
    setInput,
    setIsLoading,
    setChatStatus,
    setIsDrawerOpen,
    setEditingSessionId,
    setEditingTitle,

    // 方法
    onLoadSessions: loadSessions,
    onSelectSession: selectSession,
    onDeleteSession: deleteSession,
    onStartRenameSession: startRenameSession,
    onSaveSessionTitle: saveSessionTitle,
    onCancelRenameSession: cancelRenameSession,
    onSendMessage: sendMessage,
    onCreateNewSession: createNewSession,
  }
}
