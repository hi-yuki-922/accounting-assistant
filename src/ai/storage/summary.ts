/**
 * 节摘要生成逻辑
 * 优先从 tool 调用结果提取结构化摘要，无 tool 调用时使用 LLM 生成
 */

import { parseJson } from '@/lib'

import type { JSONLMessage } from './types'

/**
 * 从对话节中提取工具调用结果，生成结构化摘要
 * 如果节中有工具调用，返回基于工具结果的摘要；否则返回 null
 */
const extractToolBasedSummary = (messages: JSONLMessage[]): string | null => {
  const toolResults: string[] = []

  for (const msg of messages) {
    if (msg.role === 'tool') {
      const result = parseJson(msg.content)
      if (result.isOk() && result.value?.success && result.value?.message) {
        toolResults.push(result.value.message)
      }
    }
  }

  if (toolResults.length === 0) {
    return null
  }

  return toolResults.join('；')
}

/**
 * 为一节对话生成摘要
 * 优先使用工具调用结果，无工具调用时返回用户消息摘要（由调用方决定是否用 LLM 生成）
 * @param messages - 节内全部消息
 * @returns 摘要字符串
 */
export const generateSectionSummary = (messages: JSONLMessage[]): string => {
  // 优先从工具结果提取
  const toolSummary = extractToolBasedSummary(messages)
  if (toolSummary) {
    return toolSummary
  }

  // 无工具调用时，提取用户消息的前几条作为简单摘要
  const userMessages = messages
    .filter((m): m is Extract<typeof m, { role: 'user' }> => m.role === 'user')
    .map((m) => m.content)

  if (userMessages.length === 0) {
    return '空对话'
  }

  // 取第一条用户消息的前 100 字符作为摘要
  const first = userMessages[0]
  return first.length > 100 ? first.slice(0, 100) + '...' : first
}
