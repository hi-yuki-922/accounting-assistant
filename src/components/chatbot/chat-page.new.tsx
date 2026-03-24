/**
 * 聊天页面（重构后的版本）
 * 展示如何使用新的 Hook 架构
 */

import type { ToolLoopAgent } from 'ai'
import { tryit } from 'radash'
import * as React from 'react'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

import { chat, MessageRole, MessageState } from '@/api'
import type { PromptInputMessage } from '@/components/ai-elements/prompt-input.tsx'
import { useChatbot } from '@/hooks/use-chatbot'
import { useMessages } from '@/hooks/use-messages.ts'
import { useSessions } from '@/hooks/use-sessions.ts'
import { createFinanceAgent, getModelName } from '@/lib/ai-provider.ts'
import type { FinanceTools } from '@/lib/chat-tools.ts'

import { ChatHeader } from './chat-header'
import { MessageInput } from './message-input'
import { MessageList } from './message-list'
import { SessionDrawer } from './session-drawer'

/**
 * 聊天页面组件（重构版）
 */
export const ChatPageNew = () => {
  // 使用 useChatbot Hook 管理所有聊天状态
  const chatbotState = useChatbot()

  const [drawerVisible, setDrawerVisible] = useState(false)
  const [loading, setLoading] = useState(false)
  const [modelName, setModelName] = useState(getModelName())

  const [userPrompt, setUserPrompt] = useState('')

  const agentRef = useRef<ToolLoopAgent<never, FinanceTools> | null>(null)
  useEffect(() => {
    const result = createFinanceAgent(modelName)
    result.match(
      (agent) => {
        agentRef.current = agent
      },
      (_) => {
        agentRef.current = null
      }
    )
  }, [modelName])
  const {
    sessions,
    currentSession,
    editingSessionId,
    editingTitle,
    setSessions,
    setCurrentSession,
    setEditingTitle,
    setEditingSessionId,
    loadSessions,
    createSession,
    generateSessionTitle,
    selectSession,
    deleteSession,
    renameSession,
  } = useSessions()

  const { messages, setMessages, createMessage } = useMessages()

  const onCreateNewSession = async () => {
    setLoading(true)
    const result = await createSession()
    result.match(
      (newSession) => {
        setSessions([newSession, ...sessions])
        setCurrentSession(newSession)
        setMessages([])
        setDrawerVisible(false)
      },
      (e) => {
        toast.error(e.message)
      }
    )
    setLoading(false)
  }

  const onSendMessage = async (message: PromptInputMessage) => {
    if (!agentRef.current) {
      toast.error('Agent 加载失败')
      return
    }
    const userContent = message.text
    if (!userContent.trim()) {
      return
    }
    let session = currentSession
    if (!session) {
      const newSession = await createSession('新会话')
      if (newSession.isErr()) {
        toast.error(newSession.error.message)
        return
      }
      setCurrentSession(newSession.value)
      session = newSession.value
      generateSessionTitle(session.id, userContent)
    }

    const userMessage = await createMessage({
      content: userContent,
      role: MessageRole.User,
      session_id: session.id,
      state: MessageState.Completed,
    })

    if (userMessage.isErr()) {
      toast.error('保存用户消息失败')
      return
    }
    const assistantMessage = await createMessage({
      content: '',
      role: MessageRole.Assistant,
      session_id: session.id,
      state: MessageState.Sending,
    })

    if (assistantMessage.isErr()) {
      toast.error('创建消息失败')
      return
    }

    const inputMessages = messages.map((msg) => ({
      content: msg.content,
      role: msg.role,
    }))

    let aiResponse = ''
    const [streamError, result] = await tryit(agentRef.current.stream)({
      messages: inputMessages,
    })

    if (streamError) {
      // TODO: 请求失败错误处理
      setLoading(false)
      return
    }

    for await (const chunk of result.textStream) {
      aiResponse += chunk
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessage.value.id
            ? { ...msg, content: aiResponse }
            : msg
        )
      )
    }

    await chat.updateMessageContent({
      content: aiResponse,
      id: assistantMessage.value.id,
    })

    await chat.updateMessageState(
      assistantMessage.value.id,
      MessageState.Completed
    )

    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === assistantMessage.value.id
          ? { ...msg, content: aiResponse, state: MessageState.Completed }
          : msg
      )
    )
  }

  // 渲染聊天界面
  return (
    <div className="flex h-screen bg-background">
      {/* 主聊天区域 */}
      <div className="flex-1 flex flex-col">
        {/* 聊天头部 */}
        <ChatHeader
          currentSession={currentSession}
          isLoading={loading}
          onToggleDrawer={() => setDrawerVisible((prev) => !prev)}
          onCreateNewSession={onCreateNewSession}
        />

        {/* 消息列表 */}
        <MessageList messages={messages} />

        {/* 消息输入框 */}
        <MessageInput
          inputValue={userPrompt}
          onInputChange={setUserPrompt}
          onSubmit={onSendMessage}
          disabled={loading}
          placeholder="输入消息..."
        />
      </div>

      {/* 会话抽屉 */}
      <SessionDrawer
        isOpen={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        sessions={sessions}
        currentSession={currentSession}
        onSelectSession={onSelectSession}
        onDeleteSession={onDeleteSession}
        onStartRenameSession={onStartRenameSession}
        onSaveSessionTitle={onSaveSessionTitle}
        onCancelRenameSession={onCancelRenameSession}
        onCreateNewSession={onCreateNewSession}
        isLoading={isLoading}
        editingSessionId={editingSessionId}
        editingTitle={editingTitle}
        setEditingTitle={setEditingTitle}
      />
    </div>
  )
}
