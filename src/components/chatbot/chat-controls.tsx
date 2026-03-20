/**
 * 聊天状态管理组件
 * 使用 useChatbot Hook 提供状态和操作方法给子组件
 */

import type { ChatStatus } from 'ai'
import * as React from 'react'

import type { PromptInputMessage } from '@/components/ai-elements/prompt-input'
import { useChatbot } from '@/hooks/use-chatbot'
import type { ChatMessage, ChatSession } from '@/types/chat'

export interface ChatControlsProps {
  initialSessions?: ChatSession[]
  children: (props: {
    sessions: ChatSession[]
    setSessions: React.Dispatch<React.SetStateAction<ChatSession[]>>
    currentSession: ChatSession | null
    setCurrentSession: React.Dispatch<React.SetStateAction<ChatSession | null>>
    messages: ChatMessage[]
    setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>
    input: string
    setInput: React.Dispatch<React.SetStateAction<string>>
    isLoading: boolean
    setIsLoading: React.Dispatch<React.SetStateAction<boolean>>
    chatStatus: ChatStatus
    setChatStatus: React.Dispatch<React.SetStateAction<ChatStatus>>
    isDrawerOpen: boolean
    setIsDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>
    editingSessionId: number | null
    setEditingSessionId: React.Dispatch<React.SetStateAction<number | null>>
    editingTitle: string
    setEditingTitle: React.Dispatch<React.SetStateAction<string>>
    onLoadSessions: () => Promise<void>
    onSelectSession: (session: ChatSession) => Promise<void>
    onDeleteSession: (sessionId: number) => Promise<void>
    onStartRenameSession: (session: ChatSession) => void
    onSaveSessionTitle: (sessionId: number) => Promise<void>
    onCancelRenameSession: () => void
    onSendMessage: (message: PromptInputMessage) => Promise<void>
  }) => React.ReactNode
}

/**
 * 聊天状态管理组件
 * 负责提供聊天相关的状态和操作方法给子组件
 */
export const ChatControls: React.FC<ChatControlsProps> = ({
  initialSessions = [],
  children,
}) => {
  // 使用自定义 Hook 管理所有聊天状态
  const chatbotState = useChatbot(initialSessions)

  return children(chatbotState)
}
