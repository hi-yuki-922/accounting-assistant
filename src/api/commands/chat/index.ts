/**
 * Chat 模块 IPC 命令实现
 * 与 Rust 后端 src-tauri/src/commands/chat.rs 中的命令对齐
 */

import { tryCMD } from '@/lib'

import type { MessageState } from './enums'
import { MessageRole } from './enums'
import type {
  ChatSession,
  ChatMessage,
  CreateSessionDto,
  CreateMessageDto,
  UpdateSessionTitleDto,
  UpdateMessageStateDto,
  UpdateMessageContentDto,
} from './type'

// 导出类型和枚举
export type {
  ChatSession,
  ChatMessage,
  CreateSessionDto,
  CreateMessageDto,
  UpdateSessionTitleDto,
  UpdateMessageStateDto,
  UpdateMessageContentDto,
} from './type'

export { MessageRole, MessageState } from './enums'

/**
 * 创建聊天会话
 * 对应 Rust 后端 create_chat_session 命令
 */
export const createSession = (data: CreateSessionDto) =>
  tryCMD<ChatSession>('create_chat_session', { input: data })

/**
 * 获取所有聊天会话
 * 对应 Rust 后端 get_all_chat_sessions 命令
 */
export const getAllSessions = () =>
  tryCMD<ChatSession[]>('get_all_chat_sessions')

/**
 * 根据 ID 获取聊天会话
 * 对应 Rust 后端 get_chat_session 命令
 */
export const getSession = (id: number) =>
  tryCMD<ChatSession | null>('get_chat_session', { id })

/**
 * 更新会话标题
 * 对应 Rust 后端 update_chat_session_title 命令
 */
export const updateSessionTitle = (id: number, title: string) =>
  tryCMD<ChatSession>('update_chat_session_title', { id, title })

/**
 * 删除聊天会话
 * 对应 Rust 后端 delete_chat_session 命令
 */
export const deleteSession = (id: number) =>
  tryCMD<number>('delete_chat_session', { id })

/**
 * 创建聊天消息
 * 对应 Rust 后端 create_chat_message 命令
 */
export const createMessage = (data: CreateMessageDto) =>
  tryCMD<ChatMessage>('create_chat_message', { input: data })

/**
 * 获取会话的所有消息
 * 对应 Rust 后端 get_chat_messages 命令
 */
export const getMessages = (session_id: number) =>
  tryCMD<ChatMessage[]>('get_chat_messages', { session_id })

/**
 * 更新消息状态
 * 对应 Rust 后端 update_chat_message_state 命令
 */
export const updateMessageState = (id: number, state: MessageState) =>
  tryCMD<ChatMessage>('update_chat_message_state', { id, state })

/**
 * 更新消息内容和 Token 数量
 * 对应 Rust 后端 update_chat_message_content 命令
 */
export const updateMessageContent = (data: UpdateMessageContentDto) =>
  tryCMD<ChatMessage>('update_chat_message_content', data)

// 便捷方法
export const chat = {
  createMessage,
  createSession,
  deleteSession,
  getAllSessions,
  getMessages,
  getSession,
  updateMessageContent,
  updateMessageState,
  updateSessionTitle,
}
