/**
 * 会话元数据存储
 * 通过 IPC 调用后端 CRUD，通过 tauri-plugin-fs 管理 JSONL 文件
 */

import { BaseDirectory, mkdir, remove } from '@tauri-apps/plugin-fs'

import { chat } from '@/api/commands/chat'

import type { Session, SectionSummary } from './types'

/**
 * 创建新会话
 * 同时在 appdata/sessions/ 下创建对应的文件夹
 */
export const createSession = async (title = '新对话'): Promise<Session> => {
  const session = await chat.createSession({ title }).then((r) => {
    if (r.isErr()) {
      throw new Error(r.error.toString())
    }
    return r.value
  })

  // 创建会话文件夹
  await mkdir(`sessions/session_${session.id}`, {
    baseDir: BaseDirectory.AppData,
    recursive: true,
  })

  return session
}

/**
 * 获取所有会话，按创建时间倒序
 */
export const getAllSessions = async (): Promise<Session[]> => {
  const result = await chat.getAllSessions()
  if (result.isErr()) {
    throw new Error(result.error.toString())
  }
  return result.value
}

/**
 * 根据 ID 获取会话
 */
export const getSessionById = async (id: number): Promise<Session | null> => {
  const result = await chat.getSession(id)
  if (result.isErr()) {
    throw new Error(result.error.toString())
  }
  return result.value
}

/**
 * 更新会话标题
 */
export const updateSessionTitle = async (
  id: number,
  title: string
): Promise<Session> => {
  const result = await chat.updateSessionTitle(id, title)
  if (result.isErr()) {
    throw new Error(result.error.toString())
  }
  return result.value
}

/**
 * 删除会话
 * 同时删除会话文件夹和 SQLite 数据
 */
export const deleteSession = async (id: number): Promise<void> => {
  // 删除会话文件夹
  try {
    await remove(`sessions/session_${id}`, {
      baseDir: BaseDirectory.AppData,
      recursive: true,
    })
  } catch {
    // 文件夹可能不存在，忽略错误
  }

  // 删除 SQLite 数据（级联删除节摘要）
  const result = await chat.deleteSession(id)
  if (result.isErr()) {
    throw new Error(result.error.toString())
  }
}

/**
 * 创建节摘要
 */
export const createSectionSummary = async (
  sessionId: number,
  sectionFile: string,
  summary: string
): Promise<SectionSummary> => {
  const result = await chat.createSectionSummary(
    sessionId,
    sectionFile,
    summary
  )
  if (result.isErr()) {
    throw new Error(result.error.toString())
  }
  return result.value
}

/**
 * 获取指定会话的所有节摘要
 */
export const getSectionSummaries = async (
  sessionId: number
): Promise<SectionSummary[]> => {
  const result = await chat.getSectionSummaries(sessionId)
  if (result.isErr()) {
    throw new Error(result.error.toString())
  }
  return result.value
}
