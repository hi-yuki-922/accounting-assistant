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
  session_id: number
  role: MessageRole
  content: string
  tokens?: number
  created_at: string
  state: MessageState
}

/**
 * 聊天会话接口
 */
export interface ChatSession {
  id: number
  title: string
  model: string
  system_prompt?: string
  created_at: string
  updated_at: string
}
