/**
 * Chat 模块类型定义
 * 与 Rust 后端类型定义对齐
 */

/**
 * 聊天会话模型
 * 与 Rust 后端 chat_session::Model 对齐
 */
export type ChatSession = {
  id: number
  title: string
  createdAt: string
  updatedAt: string
}

/**
 * 节摘要模型
 * 与 Rust 后端 section_summary::Model 对齐
 */
export type SectionSummary = {
  id: number
  sessionId: number
  sectionFile: string
  title: string | null
  summary: string
  createdAt: string
}

/**
 * 创建会话 DTO
 * 与 Rust 后端 CreateSessionDto 对齐
 */
export type CreateSessionDto = {
  title: string
}
