/**
 * JSONLMessage → DisplayMessage 转换工具
 * 将原始 JSONL 消息映射为 UI 友好的 Parts 模型展示格式
 */

import type { JSONLMessage } from '@/ai/storage/types'
import type { DisplayMessage, DisplayMessagePart } from '@/types/chatbot'

/**
 * confirm_operation 工具结果的推导状态
 * - confirmed: 用户已确认，Agent 正在执行
 * - cancelled: 用户已取消
 * - completed: Agent 已完成执行（确认后有 assistant 响应）
 */
export type ConfirmationStatus = 'confirmed' | 'cancelled' | 'completed'

/**
 * collect_missing_fields 工具结果的推导状态
 * - submitted: 用户已提交表单
 * - cancelled: 用户已取消
 * - completed: Agent 已完成执行（提交后有 assistant 响应）
 */
export type MissingFieldsStatus = 'submitted' | 'cancelled' | 'completed'

/**
 * 从 JSONL 结构推导 confirm_operation 的确认状态
 * 检测 assistant(confirm_operation) 后面是否有 hidden user message 以及后续 assistant 响应
 */
function buildConfirmationStatus(
  messages: JSONLMessage[]
): Map<string, ConfirmationStatus> {
  const statusMap = new Map<string, ConfirmationStatus>()

  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i]
    if (msg.role !== 'assistant' || !msg.tool_calls) {
      continue
    }

    for (const tc of msg.tool_calls) {
      if (tc.function.name !== 'confirm_operation') {
        continue
      }

      // 跳过紧跟的 tool result 消息，查找 hidden user message
      let j = i + 1
      while (j < messages.length && messages[j].role === 'tool') {
        j++
      }

      if (j < messages.length && messages[j].role === 'user') {
        const userMsg = messages[j] as Extract<JSONLMessage, { role: 'user' }>
        if (!userMsg.hidden) {
          continue
        }

        const isCancelled = userMsg.content.includes('已拒绝')

        // 检查 hidden 消息后面是否有 assistant 响应（说明 Agent 已完成执行）
        let hasAssistantResponse = false
        for (let k = j + 1; k < messages.length; k++) {
          if (messages[k].role === 'assistant') {
            hasAssistantResponse = true
            break
          }
        }

        if (isCancelled) {
          statusMap.set(tc.id, 'cancelled')
        } else if (hasAssistantResponse) {
          statusMap.set(tc.id, 'completed')
        } else {
          statusMap.set(tc.id, 'confirmed')
        }
      }
    }
  }

  return statusMap
}

/**
 * 从 JSONL 结构推导 collect_missing_fields 的提交状态
 * 检测 assistant(collect_missing_fields) 后面是否有 hidden user message 以及后续 assistant 响应
 */
function buildMissingFieldsStatus(
  messages: JSONLMessage[]
): Map<string, MissingFieldsStatus> {
  const statusMap = new Map<string, MissingFieldsStatus>()

  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i]
    if (msg.role !== 'assistant' || !msg.tool_calls) {
      continue
    }

    for (const tc of msg.tool_calls) {
      if (tc.function.name !== 'collect_missing_fields') {
        continue
      }

      // 跳过紧跟的 tool result 消息，查找 hidden user message
      let j = i + 1
      while (j < messages.length && messages[j].role === 'tool') {
        j++
      }

      if (j < messages.length && messages[j].role === 'user') {
        const userMsg = messages[j] as Extract<JSONLMessage, { role: 'user' }>
        if (!userMsg.hidden) {
          continue
        }

        const isCancelled = userMsg.content.includes('已取消')

        // 检查 hidden 消息后面是否有 assistant 响应（说明 Agent 已完成执行）
        let hasAssistantResponse = false
        for (let k = j + 1; k < messages.length; k++) {
          if (messages[k].role === 'assistant') {
            hasAssistantResponse = true
            break
          }
        }

        if (isCancelled) {
          statusMap.set(tc.id, 'cancelled')
        } else if (hasAssistantResponse) {
          statusMap.set(tc.id, 'completed')
        } else {
          statusMap.set(tc.id, 'submitted')
        }
      }
    }
  }

  return statusMap
}

/**
 * 将 JSONLMessage 数组转换为 DisplayMessage 数组（Parts 模型）
 * 合并 assistant 消息的 tool_calls 和后续对应的 tool result 到同一消息的 parts 中
 */
export const toDisplayMessages = (
  messages: JSONLMessage[]
): DisplayMessage[] => {
  const result: DisplayMessage[] = []
  let msgIndex = 0

  // 构建 tool_call_id → tool result 的映射
  const toolResultMap = new Map<string, { toolName: string; content: string }>()
  for (const msg of messages) {
    if (msg.role === 'tool') {
      // 从前一条 assistant 消息的 tool_calls 中查找 toolName
      const toolName = findToolNameForCallId(messages, msg.tool_call_id)
      toolResultMap.set(msg.tool_call_id, {
        toolName,
        content: msg.content,
      })
    }
  }

  // 推导 confirm_operation 的确认状态
  const confirmationStatus = buildConfirmationStatus(messages)

  // 推导 collect_missing_fields 的提交状态
  const missingFieldsStatus = buildMissingFieldsStatus(messages)

  for (const msg of messages) {
    if (msg.role === 'user') {
      if (msg.hidden) {
        msgIndex++
        continue
      }
      result.push({
        id: `msg-${msgIndex}`,
        role: 'user',
        parts: [{ type: 'text', content: msg.content }],
      })
      msgIndex++
      continue
    }

    if (msg.role === 'assistant') {
      const parts: DisplayMessagePart[] = []

      // 文本部分
      if (msg.content) {
        parts.push({ type: 'text', content: msg.content })
      }

      // 工具调用部分
      if (msg.tool_calls) {
        for (const tc of msg.tool_calls) {
          parts.push({
            type: 'tool-call',
            toolCallId: tc.id,
            toolName: tc.function.name,
            args: tc.function.arguments,
            state: 'completed',
          })

          // 将对应的 tool result 也放入同一消息的 parts
          const toolResult = toolResultMap.get(tc.id)
          if (toolResult) {
            let parsedResult: unknown = toolResult.content
            try {
              parsedResult = JSON.parse(toolResult.content)
            } catch {
              // 保留原始字符串
            }

            // 注入推导的确认/提交状态
            const derivedStatus =
              confirmationStatus.get(tc.id) ?? missingFieldsStatus.get(tc.id)
            if (
              derivedStatus &&
              typeof parsedResult === 'object' &&
              parsedResult !== null
            ) {
              parsedResult = {
                ...(parsedResult as Record<string, unknown>),
                _status: derivedStatus,
              }
            }

            parts.push({
              type: 'tool-result',
              toolCallId: tc.id,
              toolName: toolResult.toolName,
              result: parsedResult,
            })
          }
        }
      }

      result.push({
        id: `msg-${msgIndex}`,
        role: 'assistant',
        parts,
      })
      msgIndex++
      continue
    }

    // system / tool 消息不单独展示，已合入 assistant 消息的 parts
    msgIndex++
  }

  return result
}

/**
 * 从 messages 中查找 tool_call_id 对应的 toolName
 */
function findToolNameForCallId(
  messages: JSONLMessage[],
  toolCallId: string
): string {
  for (const msg of messages) {
    if (msg.role === 'assistant' && msg.tool_calls) {
      for (const tc of msg.tool_calls) {
        if (tc.id === toolCallId) {
          return tc.function.name
        }
      }
    }
  }
  return 'unknown'
}
