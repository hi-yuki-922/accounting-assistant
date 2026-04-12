/**
 * JSONL 消息流式写入
 * 在 Agent 对话过程中，实时追加消息到当前节的 JSONL 文件
 */

import { appendMessage } from './storage/section-store'
import type { JSONLMessage } from './storage/types'

/**
 * 创建一个绑定到特定节的流式写入器
 */
export const createSectionWriter = (
  sessionId: number,
  sectionFile: string
) => ({
  /**
   * 写入用户消息
   */
  async writeUserMessage(content: string, hidden?: boolean) {
    await appendMessage(sessionId, sectionFile, {
      role: 'user',
      content,
      ...(hidden ? { hidden } : {}),
    })
  },

  /**
   * 写入 assistant 消息（可能包含 tool_calls）
   */
  async writeAssistantMessage(message: {
    content: string | null
    tool_calls?: {
      id: string
      type: 'function'
      function: { name: string; arguments: string }
    }[]
  }) {
    await appendMessage(sessionId, sectionFile, {
      role: 'assistant',
      content: message.content,
      ...(message.tool_calls ? { tool_calls: message.tool_calls } : {}),
    })
  },

  /**
   * 写入工具调用结果
   */
  async writeToolResult(toolCallId: string, content: string) {
    await appendMessage(sessionId, sectionFile, {
      role: 'tool',
      tool_call_id: toolCallId,
      content,
    })
  },
})

export type SectionWriter = ReturnType<typeof createSectionWriter>
