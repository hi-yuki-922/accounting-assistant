/**
 * 消息角色枚举
 */
export type MessageRole = 'user' | 'assistant' | 'system'

/**
 * 消息状态枚举
 */
export type MessageState = 'sending' | 'sent' | 'completed' | 'failed'

/**
 * 聊天消息接口
 */
export interface ChatMessage {
  id: number
  sessionId: number
  role: MessageRole
  content: string
  tokens?: number
  createdAt: string
  state: MessageState
}

/**
 * 聊天会话接口
 */
export interface ChatSession {
  id: number
  title: string
  model: string
  systemPrompt?: string
  createdAt: string
  updatedAt: string
}
