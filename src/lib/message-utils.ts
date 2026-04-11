/**
 * JSONLMessage → DisplayMessage 转换工具
 * 将原始 JSONL 消息映射为 UI 友好的展示格式
 */

import type { JSONLMessage } from '@/ai/storage/types'
import type { DisplayMessage } from '@/types/chatbot'

/**
 * 将 JSONLMessage 数组转换为 DisplayMessage 数组
 * 合并连续的 assistant + tool 消息为一个 assistant DisplayMessage
 */
export const toDisplayMessages = (
  messages: JSONLMessage[]
): DisplayMessage[] => {
  const result: DisplayMessage[] = []

  for (const msg of messages) {
    if (msg.role === 'user') {
      result.push({ role: 'user', content: msg.content })
      continue
    }

    if (msg.role === 'assistant') {
      result.push({
        role: 'assistant',
        content: msg.content ?? '',
        toolCalls:
          msg.tool_calls?.map((tc) => ({
            id: tc.id,
            name: tc.function.name,
            arguments: tc.function.arguments,
          })) ?? [],
      })
      continue
    }

    // system / tool 消息不展示，跳过
  }

  return result
}
