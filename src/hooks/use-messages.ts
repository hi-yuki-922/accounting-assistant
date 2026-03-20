/**
 * 消息管理 Hook
 * 专门处理消息的加载、创建和更新
 */

import React, { useState } from 'react'

import type { MessageRole, MessageState, CreateMessageDto } from '@/api/commands'
import { chat } from '@/api/commands'
import type { ChatMessage } from '@/types/chat'
import type { SafeAsync } from "@/types/lib.ts";
import { err, ok } from "neverthrow";

/**
 * 消息管理状态和操作接口
 */
export type UseMessagesState = {
  // 状态
  messages: ChatMessage[]
  isLoading: boolean

  // 操作
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>

  // 方法
  loadMessages: (sessionId: number) => SafeAsync<void>
  createMessage: (message: {
    content: string
    role: MessageRole
    session_id: number
    state: MessageState
  }) => SafeAsync<ChatMessage>
  updateMessage: (
    messageId: number,
    updates: {
      content?: string
      state?: MessageState
    }
  ) => SafeAsync<void>
}

/**
 * 消息管理 Hook
 */
export const useMessages = (): UseMessagesState => {
  // 消息状态
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)

  /**
   * 加载消息列表
   */
  const loadMessages = async (sessionId: number) => {
    setIsLoading(true)
    const result = await chat.getMessages(sessionId)
    setIsLoading(false)
    return result.map(
      message => setMessages(message)
    ).mapErr(e => new Error(`加载消息失败：${e.message}`))
  }

  /**
   * 创建新消息
   */
  const createMessage = async (message:CreateMessageDto) => {
    const result = await chat.createMessage(message)
    return result.map(newMessage => {
      setMessages((prev) => [...prev, newMessage])
      return newMessage
    }).mapErr(e => new Error(`创建消息失败：${e.message}`))
  }

  /**
   * 更新消息
   */
  const updateMessage = async (messageId: number, updates): SafeAsync<void> => {
    if (updates.content !== undefined) {
      const contentResult = await chat.updateMessageContent({
        content: updates.content,
        id: messageId,
      })
      if (contentResult.isErr()) {
        console.error('更新消息内容失败:', contentResult.error)
        return err(contentResult.error)
      }
    }

    if (updates.state !== undefined) {
      const stateResult = await chat.updateMessageState(
        messageId,
        updates.state
      )
      if (stateResult.isErr()) {
        console.error('更新消息状态失败:', stateResult.error)
        return err(stateResult.error)
      }
    }

    // 更新本地状态
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId
          ? {
              ...msg,
              ...updates,
            }
          : msg
      )
    )
    return ok()
  }

  return {
    // 状态
    messages,
    isLoading,

    // 操作
    setMessages,
    setIsLoading,

    // 方法
    loadMessages,
    createMessage,
    updateMessage,
  }
}
