/**
 * Chat 模块 IPC 命令实现
 * 与 Rust 后端 src-tauri/src/commands/chat.rs 中的命令对齐
 */

import { tryCMD } from '@/lib'

import type { ChatSession, SectionSummary, CreateSessionDto } from './type'

// 导出类型
export type { ChatSession, SectionSummary, CreateSessionDto } from './type'

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
 * 创建节摘要
 * 对应 Rust 后端 create_section_summary 命令
 */
export const createSectionSummary = (
  sessionId: number,
  sectionFile: string,
  title: string | null,
  summary: string
) =>
  tryCMD<SectionSummary>('create_section_summary', {
    sessionId,
    sectionFile,
    title,
    summary,
  })

/**
 * 获取指定会话的节摘要
 * 对应 Rust 后端 get_section_summaries 命令
 */
export const getSectionSummaries = (sessionId: number) =>
  tryCMD<SectionSummary[]>('get_section_summaries', { sessionId })

// 便捷方法
export const chat = {
  createSectionSummary,
  createSession,
  deleteSession,
  getAllSessions,
  getSectionSummaries,
  getSession,
  updateSessionTitle,
}
