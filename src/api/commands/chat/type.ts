/**
 * Chat 模块类型定义
 * 与 Rust 后端类型定义对齐
 */

import type { MessageRole, MessageState } from './enums'

/**
 * 聊天会话模型
 * 与 Rust 后端 chat_session::Model 对齐
 */
export type ChatSession = {
  id: number
  title: string
  model: string
  system_prompt?: string
  created_at: string
  updated_at: string
}

/**
 * 聊天消息模型
 * 与 Rust 后端 chat_message::Model 对齐
 */
export type ChatMessage = {
  id: number
  session_id: number
  role: MessageRole
  content: string
  tokens?: number
  created_at: string
  state: MessageState
}

/**
 * 创建会话 DTO
 * 与 Rust 后端 CreateSessionDto 对齐
 */
export type CreateSessionDto = {
  title: string
  model?: string
  system_prompt?: string
}

/**
 * 创建消息 DTO
 * 与 Rust 后端 CreateMessageDto 对齐
 */
export type CreateMessageDto = {
  session_id: number
  role: MessageRole
  content: string
  tokens?: number
  state?: MessageState
}

/**
 * 更新会话标题 DTO
 */
export type UpdateSessionTitleDto = {
  id: number
  title: string
}

/**
 * 更新消息状态 DTO
 */
export type UpdateMessageStateDto = {
  id: number
  state: MessageState
}

/**
 * 更新消息内容 DTO
 */
export type UpdateMessageContentDto = {
  id: number
  content: string
  tokens?: number
}
