/**
 * 对话节路由函数
 * 负责管理对话节的创建和续接
 */

import { createSection, readMessages } from './storage/section-store'
import type { JSONLMessage } from './storage/types'

/**
 * 路由结果
 */
export type RouteResult = {
  /** 当前节文件名 */
  sectionFile: string
  /** 节内已有消息（续接时有内容，新建时为空） */
  messages: JSONLMessage[]
}

/**
 * 路由函数：根据是否引用已有节，创建新节或续接已有节
 * @param sessionId - 会话 ID
 * @param referenceSectionFile - 可选，引用的节文件名（续接时提供）
 */
export const route = async (
  sessionId: number,
  referenceSectionFile?: string
): Promise<RouteResult> => {
  if (referenceSectionFile) {
    // 引用已有节 → 续接
    const messages = await readMessages(sessionId, referenceSectionFile)
    return {
      sectionFile: referenceSectionFile,
      messages,
    }
  }

  // 无引用 → 创建新节
  const sectionFile = await createSection(sessionId)
  return {
    sectionFile,
    messages: [],
  }
}
