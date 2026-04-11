/**
 * Section 对话管理 Hook
 * 管理单个 Section 的消息状态、Agent 实例、流式响应和 JSONL 写入
 */

import type { ModelMessage } from 'ai'
import { useCallback, useEffect, useRef, useState } from 'react'

import { createAgent } from '@/ai/agent'
import { readMessages } from '@/ai/storage/section-store'
import {
  createSectionSummary,
  getSectionSummaries,
} from '@/ai/storage/session-store'
import { generateSectionSummary } from '@/ai/storage/summary'
import type { JSONLMessage } from '@/ai/storage/types'
import { createSectionWriter } from '@/ai/writer'
import { toDisplayMessages } from '@/lib/message-utils'
import type { DisplayMessage } from '@/types/chatbot'

/**
 * tool_calls 数组元素类型
 */
type ToolCallItem = NonNullable<
  Extract<JSONLMessage, { role: 'assistant' }>['tool_calls']
>[number]

/**
 * useSectionChat 状态和操作接口
 */
export type UseSectionChatState = {
  /** 展示用消息列表 */
  messages: DisplayMessage[]
  /** 是否正在流式响应 */
  isStreaming: boolean
  /** 错误信息 */
  error: string | null
  /** 发送消息 */
  send: (content: string) => Promise<void>
  /** 中断流式响应 */
  stop: () => void
}

/**
 * Section 对话管理 Hook
 * @param sessionId - 会话 ID
 * @param sectionFile - 节文件名
 * @param onStreamComplete - 流式完成回调（用于刷新摘要等）
 */
export const useSectionChat = (
  sessionId: number | null,
  sectionFile: string | null,
  onStreamComplete?: () => void
): UseSectionChatState => {
  const [messages, setMessages] = useState<DisplayMessage[]>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const agentRef = useRef<Awaited<ReturnType<typeof createAgent>> | null>(null)
  const abortRef = useRef<AbortController | null>(null)
  // 用 ref 持有当前 jsonl 原始消息，避免闭包过期
  const jsonlRef = useRef<JSONLMessage[]>([])
  // 标记历史是否已加载
  const loadedRef = useRef(false)
  // 暂存消息：hook 初始化完成前收到的 send 调用
  const pendingRef = useRef<string | null>(null)

  // 初始化时从 JSONL 加载历史消息
  useEffect(() => {
    if (!sessionId || !sectionFile) {
      setMessages([])
      jsonlRef.current = []
      loadedRef.current = false
      return
    }

    loadedRef.current = false
    readMessages(sessionId, sectionFile).then((msgs) => {
      jsonlRef.current = msgs
      setMessages(toDisplayMessages(msgs))
      loadedRef.current = true

      // 处理暂存消息
      if (pendingRef.current) {
        const content = pendingRef.current
        pendingRef.current = null
        performSend(content, msgs)
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, sectionFile])

  // 卸载时中断
  useEffect(
    () => () => {
      abortRef.current?.abort()
    },
    []
  )

  const performSend = useCallback(
    async (content: string, baseJsonl?: JSONLMessage[]) => {
      if (!sessionId || !sectionFile) {
        return
      }

      setError(null)
      setIsStreaming(true)

      const currentJsonl = baseJsonl ?? jsonlRef.current
      const userMsg: JSONLMessage = { role: 'user', content }
      const jsonlWithUser = [...currentJsonl, userMsg]
      jsonlRef.current = jsonlWithUser
      setMessages(toDisplayMessages(jsonlWithUser))

      let assistantContent = ''
      const toolCallsAcc: ToolCallItem[] = []
      const toolResults: Extract<JSONLMessage, { role: 'tool' }>[] = []

      try {
        // 创建 Agent（懒初始化）
        if (!agentRef.current) {
          agentRef.current = await createAgent()
        }

        const abortController = new AbortController()
        abortRef.current = abortController

        // 获取历史摘要注入
        const summaries = await getSectionSummaries(sessionId)
        let summaryInjection = ''
        if (summaries.length > 0) {
          const summaryText = summaries
            .map((s) => `[${s.sectionFile}] ${s.summary}`)
            .join('\n')
          summaryInjection = `以下是本会话之前节摘要：\n${summaryText}`
        }

        // 构建上下文消息
        const contextMessages: JSONLMessage[] = []
        if (summaryInjection) {
          contextMessages.push({ role: 'system', content: summaryInjection })
        }
        contextMessages.push(...jsonlWithUser)

        const result = await agentRef.current!.stream({
          messages: toModelMessages(contextMessages),
          abortSignal: abortController.signal,
        })

        // 消费 fullStream
        for await (const event of result.fullStream) {
          if (abortController.signal.aborted) {
            break
          }

          switch (event.type) {
            case 'text-delta': {
              assistantContent += event.text
              // 构建当前快照用于展示
              const snapshot = buildSnapshot(
                jsonlWithUser,
                assistantContent,
                toolCallsAcc,
                toolResults
              )
              jsonlRef.current = snapshot
              setMessages(toDisplayMessages(snapshot))
              break
            }

            case 'tool-call': {
              toolCallsAcc.push({
                id: event.toolCallId,
                type: 'function' as const,
                function: {
                  name: event.toolName,
                  arguments:
                    typeof event.input === 'string'
                      ? event.input
                      : JSON.stringify(event.input),
                },
              })
              break
            }

            case 'tool-result': {
              const output =
                typeof event.output === 'string'
                  ? event.output
                  : JSON.stringify(event.output)
              toolResults.push({
                role: 'tool',
                tool_call_id: event.toolCallId,
                content: output,
              })
              // 更新展示
              const snapshot = buildSnapshot(
                jsonlWithUser,
                assistantContent,
                toolCallsAcc,
                toolResults
              )
              jsonlRef.current = snapshot
              setMessages(toDisplayMessages(snapshot))
              break
            }

            case 'error': {
              setError(String(event.error))
              break
            }
          }
        }

        // 流式完成 — 写入 JSONL
        const writer = createSectionWriter(sessionId, sectionFile)
        await writer.writeUserMessage(content)

        if (assistantContent || toolCallsAcc.length > 0) {
          await writer.writeAssistantMessage({
            content: assistantContent || null,
            tool_calls: toolCallsAcc.length > 0 ? toolCallsAcc : undefined,
          })
          for (const tr of toolResults) {
            await writer.writeToolResult(tr.tool_call_id!, tr.content)
          }
        }

        // 生成摘要并保存
        const finalJsonl = buildSnapshot(
          jsonlWithUser,
          assistantContent,
          toolCallsAcc,
          toolResults
        )
        jsonlRef.current = finalJsonl
        const summary = generateSectionSummary(finalJsonl)
        await createSectionSummary(sessionId, sectionFile, summary)

        onStreamComplete?.()
      } catch (error) {
        if ((error as Error).name === 'AbortError') {
          // 用户中断，将已接收内容写入 JSONL
          const writer = createSectionWriter(sessionId, sectionFile)
          await writer.writeUserMessage(content)
          if (assistantContent) {
            await writer.writeAssistantMessage({ content: assistantContent })
          }
        } else {
          setError(error instanceof Error ? error.message : '发生未知错误')
        }
      } finally {
        setIsStreaming(false)
      }
    },
    [sessionId, sectionFile, onStreamComplete]
  )

  const send = useCallback(
    async (content: string) => {
      if (!sessionId || !sectionFile) {
        pendingRef.current = content
        return
      }

      if (!loadedRef.current) {
        pendingRef.current = content
        return
      }

      await performSend(content)
    },
    [sessionId, sectionFile, performSend]
  )

  const stop = useCallback(() => {
    abortRef.current?.abort()
  }, [])

  return { messages, isStreaming, error, send, stop }
}

/**
 * 根据流式累积数据构建当前 JSONL 快照
 */
function buildSnapshot(
  baseJsonl: JSONLMessage[],
  assistantContent: string,
  toolCalls: ToolCallItem[],
  toolResults: Extract<JSONLMessage, { role: 'tool' }>[]
): JSONLMessage[] {
  const snapshot: JSONLMessage[] = [...baseJsonl]

  // 只有有内容时才添加 assistant 消息
  if (assistantContent || toolCalls.length > 0) {
    snapshot.push({
      role: 'assistant',
      content: assistantContent || null,
      ...(toolCalls.length > 0 ? { tool_calls: toolCalls } : {}),
    })
  }

  snapshot.push(...toolResults)
  return snapshot
}

/**
 * 将 JSONLMessage[] 转换为 AI SDK ModelMessage[] 格式
 *
 * AI SDK v6 的 ModelMessage 要求：
 * - assistant 消息的 tool_calls 需转为 content 数组中的 ToolCallPart
 * - tool 消息的 content 必须是 ToolResultPart[] 数组，不能是字符串
 */
function toModelMessages(messages: JSONLMessage[]): ModelMessage[] {
  // 先构建 tool_call_id -> tool_name 的映射（从 assistant 消息的 tool_calls 中提取）
  const toolNameMap = new Map<string, string>()
  for (const m of messages) {
    if (m.role === 'assistant' && m.tool_calls) {
      for (const tc of m.tool_calls) {
        toolNameMap.set(tc.id, tc.function.name)
      }
    }
  }

  return messages.map((m) => {
    if (m.role === 'system') {
      return { role: 'system' as const, content: m.content }
    }

    if (m.role === 'user') {
      return { role: 'user' as const, content: m.content }
    }

    if (m.role === 'assistant') {
      // 如果有 tool_calls，将 content 转为数组格式
      if (m.tool_calls && m.tool_calls.length > 0) {
        const parts: (
          | { type: 'text'; text: string }
          | {
              type: 'tool-call'
              toolCallId: string
              toolName: string
              input: unknown
            }
        )[] = []

        // 添加文本部分
        if (m.content) {
          parts.push({ type: 'text', text: m.content })
        }

        // 添加工具调用部分
        for (const tc of m.tool_calls) {
          let input: unknown
          try {
            input = JSON.parse(tc.function.arguments)
          } catch {
            input = tc.function.arguments
          }
          parts.push({
            type: 'tool-call',
            toolCallId: tc.id,
            toolName: tc.function.name,
            input,
          })
        }

        return { role: 'assistant' as const, content: parts }
      }

      return { role: 'assistant' as const, content: m.content ?? '' }
    }

    // tool 消息：content 必须是 ToolResultPart[] 数组
    if (m.role === 'tool') {
      const toolName = toolNameMap.get(m.tool_call_id) ?? 'unknown'
      return {
        role: 'tool' as const,
        content: [
          {
            type: 'tool-result' as const,
            toolCallId: m.tool_call_id,
            toolName,
            output: { type: 'text', value: m.content },
          },
        ],
      }
    }

    // 兜底（不应该到这里）
    return m as never
  })
}
