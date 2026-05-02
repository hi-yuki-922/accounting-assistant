/**
 * 对话节 JSONL 文件读写
 * 使用 tauri-plugin-fs 操作 appdata/sessions/ 下的文件
 */

import {
  BaseDirectory,
  exists,
  mkdir,
  readTextFile,
  writeTextFile,
} from '@tauri-apps/plugin-fs'

import { parseJson } from '@/lib'

import type { JSONLMessage } from './types'

/**
 * 获取会话目录路径
 */
const sessionDir = (sessionId: number): string =>
  `sessions/session_${sessionId}`

/**
 * 获取节文件完整路径
 */
const sectionPath = (sessionId: number, sectionFile: string): string =>
  `${sessionDir(sessionId)}/${sectionFile}`

/**
 * 创建新的对话节 JSONL 文件
 * @returns 生成的文件名（如 section_001.jsonl）
 */
export const createSection = async (sessionId: number): Promise<string> => {
  // 确保会话目录存在
  await mkdir(sessionDir(sessionId), {
    baseDir: BaseDirectory.AppData,
    recursive: true,
  })

  // 确定下一个节序号
  let seq = 1
  while (
    await exists(
      sectionPath(sessionId, `section_${String(seq).padStart(3, '0')}.jsonl`),
      { baseDir: BaseDirectory.AppData }
    )
  ) {
    seq += 1
  }

  const sectionFile = `section_${String(seq).padStart(3, '0')}.jsonl`

  // 创建空文件
  await writeTextFile(sectionPath(sessionId, sectionFile), '', {
    baseDir: BaseDirectory.AppData,
  })

  return sectionFile
}

/**
 * 追加单条消息到 JSONL 文件
 */
export const appendMessage = async (
  sessionId: number,
  sectionFile: string,
  message: JSONLMessage
): Promise<void> => {
  const path = sectionPath(sessionId, sectionFile)
  const existing = await readTextFile(path, {
    baseDir: BaseDirectory.AppData,
  })
  const line = JSON.stringify(message) + '\n'

  await writeTextFile(path, existing + line, {
    baseDir: BaseDirectory.AppData,
  })
}

/**
 * 读取节内全部消息（逐行解析，容错）
 */
export const readMessages = async (
  sessionId: number,
  sectionFile: string
): Promise<JSONLMessage[]> => {
  const path = sectionPath(sessionId, sectionFile)

  const existsFile = await exists(path, { baseDir: BaseDirectory.AppData })
  if (!existsFile) {
    return []
  }

  const content = await readTextFile(path, {
    baseDir: BaseDirectory.AppData,
  })

  const messages: JSONLMessage[] = []

  for (const line of content.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed) {
      continue
    }

    const result = parseJson(trimmed)
    if (result.isOk()) {
      messages.push(result.value as JSONLMessage)
    }
  }

  return messages
}
