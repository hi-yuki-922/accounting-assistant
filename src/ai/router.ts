/**
 * 对话节路由函数
 * 负责管理对话节的创建和续接
 */

import { createSection, readMessages } from './storage/section-store'
import {
  createSectionSummary,
  getSectionSummaries,
} from './storage/session-store'
import type { JSONLMessage } from './storage/types'

/**
 * 路由结果
 */
export type RouteResult = {
  /** 当前节文件名 */
  sectionFile: string
  /** 节内已有消息（续接时有内容，新建时为空） */
  messages: JSONLMessage[]
  /** 注入到 system prompt 的历史节摘要 */
  summaryInjection: string
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
      summaryInjection: '',
    }
  }

  // 无引用 → 创建新节
  const sectionFile = await createSection(sessionId)

  // 查询同会话的历史节摘要
  const summaries = await getSectionSummaries(sessionId)
  let summaryInjection = ''

  if (summaries.length > 0) {
    const summaryText = summaries
      .map((s) => `[${s.sectionFile}] ${s.summary}`)
      .join('\n')
    summaryInjection = `以下是本会话之前节摘要：\n${summaryText}`
  }

  return {
    sectionFile,
    messages: [],
    summaryInjection,
  }
}
