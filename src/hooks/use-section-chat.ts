/**
 * Section 对话管理 Hook
 * 管理单个 Section 的消息状态、Agent 实例、流式响应和 JSONL 写入
 */

import type { ModelMessage } from 'ai'
import { useCallback, useEffect, useRef, useState } from 'react'

import { createAgent } from '@/ai/agent'
import {
  getConfirmationInstruction,
  getMissingFieldsInstruction,
} from '@/ai/prompts/fragments'
import { readMessages } from '@/ai/storage/section-store'
import { createSectionSummary } from '@/ai/storage/session-store'
import {
  extractFirstUserMessage,
  generateLLMSummary,
  generateSectionSummary,
} from '@/ai/storage/summary'
import type { JSONLMessage } from '@/ai/storage/types'
import { createSectionWriter } from '@/ai/writer'
import type { ConfirmationMode } from '@/lib/confirmation-mode'
import { toDisplayMessages } from '@/lib/message-utils'
import type { DisplayMessage, DisplayMessagePart } from '@/types/chatbot'

/**
 * tool_calls 数组元素类型
 */
type ToolCallItem = NonNullable<
  Extract<JSONLMessage, { role: 'assistant' }>['tool_calls']
>[number]

// ─── Parts 操作辅助函数 ─────────────────────────────────────

/**
 * 向 parts 追加文本增量
 * 如果最后一个 part 是 text，追加内容；否则创建新 text part
 */
const appendTextDelta = (
  parts: DisplayMessagePart[],
  text: string
): DisplayMessagePart[] => {
  const last = parts.at(-1)
  if (last && last.type === 'text') {
    return [
      ...parts.slice(0, -1),
      { type: 'text', content: last.content + text },
    ]
  }
  return [...parts, { type: 'text', content: text }]
}

/**
 * 向 parts 追加 tool result，并将对应 tool-call part 的 state 更新为 'completed'
 */
const appendToolResult = (
  parts: DisplayMessagePart[],
  toolCallId: string,
  toolName: string,
  output: unknown
): DisplayMessagePart[] => {
  // 更新对应 tool-call part 的 state
  const updated = parts.map((p) =>
    p.type === 'tool-call' && p.toolCallId === toolCallId
      ? { ...p, state: 'completed' as const }
      : p
  )
  // 追加 tool-result part
  return [
    ...updated,
    { type: 'tool-result', toolCallId, toolName, result: output },
  ]
}

// ─── JSONL 快照与模型消息转换 ─────────────────────────────────

/**
 * 根据流式累积数据构建当前 JSONL 快照
 */
const buildSnapshot = (
  baseJsonl: JSONLMessage[],
  assistantContent: string,
  toolCalls: ToolCallItem[],
  toolResults: Extract<JSONLMessage, { role: 'tool' }>[]
): JSONLMessage[] => {
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
const toModelMessages = (messages: JSONLMessage[]): ModelMessage[] => {
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
  /** 发送隐藏消息（用户不可见，但仍发送给 Agent） */
  sendHidden: (content: string) => Promise<void>
  /** 中断流式响应 */
  stop: () => void
}

/**
 * 异步生成 LLM 摘要（带 fallback）
 */
const generateAndSaveSummary = async (
  sessionId: number,
  sectionFile: string,
  finalJsonl: JSONLMessage[],
  onStreamComplete?: () => void
) => {
  const firstUserMsg = extractFirstUserMessage(finalJsonl)
  if (!firstUserMsg) {
    return
  }

  try {
    const { title, summary } = await generateLLMSummary(firstUserMsg)
    await createSectionSummary(sessionId, sectionFile, summary, title)
    onStreamComplete?.()
  } catch {
    // LLM 失败时 fallback：截取首条消息前 20 字符作为 title
    const fallbackTitle = firstUserMsg.slice(0, 20)
    const fallbackSummary = generateSectionSummary(finalJsonl)
    await createSectionSummary(
      sessionId,
      sectionFile,
      fallbackSummary,
      fallbackTitle
    )
    onStreamComplete?.()
  }
}

/**
 * 将流式结果写入 JSONL
 */
const writeStreamResult = async (
  sessionId: number,
  sectionFile: string,
  content: string,
  options: { hidden?: boolean } | undefined,
  streamCtx: StreamContext
) => {
  const writer = createSectionWriter(sessionId, sectionFile)
  await writer.writeUserMessage(content, options?.hidden)

  if (streamCtx.assistantContent || streamCtx.toolCallsAcc.length > 0) {
    await writer.writeAssistantMessage({
      content: streamCtx.assistantContent || null,
      tool_calls:
        streamCtx.toolCallsAcc.length > 0 ? streamCtx.toolCallsAcc : undefined,
    })
    for (const tr of streamCtx.toolResults) {
      const toolCallId = tr.tool_call_id as string
      await writer.writeToolResult(toolCallId, tr.content)
    }
  }
}

// 流式事件处理的上下文
type StreamContext = {
  partsAcc: DisplayMessagePart[]
  assistantContent: string
  toolCallsAcc: ToolCallItem[]
  toolResults: Extract<JSONLMessage, { role: 'tool' }>[]
  updateDisplay: () => void
  onError: (msg: string) => void
}

/**
 * 处理单个流式事件
 */
const handleStreamEvent = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  event: any,
  ctx: StreamContext
) => {
  if (event.type === 'text-delta') {
    ctx.assistantContent += event.text
    ctx.partsAcc = appendTextDelta(ctx.partsAcc, event.text)
    ctx.updateDisplay()
  } else if (event.type === 'tool-call') {
    const args =
      typeof event.input === 'string'
        ? event.input
        : JSON.stringify(event.input)
    ctx.toolCallsAcc.push({
      id: event.toolCallId,
      type: 'function' as const,
      function: {
        name: event.toolName,
        arguments: args,
      },
    })
    ctx.partsAcc = [
      ...ctx.partsAcc,
      {
        type: 'tool-call',
        toolCallId: event.toolCallId,
        toolName: event.toolName,
        args,
        state: 'calling' as const,
      },
    ]
    ctx.updateDisplay()
  } else if (event.type === 'tool-result') {
    const output =
      typeof event.output === 'string'
        ? event.output
        : JSON.stringify(event.output)
    ctx.toolResults.push({
      role: 'tool',
      tool_call_id: event.toolCallId,
      content: output,
    })
    ctx.partsAcc = appendToolResult(
      ctx.partsAcc,
      event.toolCallId,
      event.toolName,
      event.output
    )
    ctx.updateDisplay()
  } else if (event.type === 'error') {
    ctx.onError(String(event.error))
  }
}

/**
 * Section 对话管理 Hook
 * @param sessionId - 会话 ID
 * @param sectionFile - 节文件名
 * @param onStreamComplete - 流式完成回调（用于刷新摘要等）
 * @param confirmationMode - 操作确认模式 - on | off
 */
export const useSectionChat = (
  sessionId: number | null,
  sectionFile: string | null,
  onStreamComplete?: () => void,
  confirmationMode: ConfirmationMode = 'on'
): UseSectionChatState => {
  const [messages, setMessages] = useState<DisplayMessage[]>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const agentRef = useRef<Awaited<ReturnType<typeof createAgent>> | null>(null)
  const abortRef = useRef<AbortController | null>(null)
  // 用 ref 持有当前 jsonl 原始消息，避免闭包过期
  const jsonlRef = useRef<JSONLMessage[]>([])
  // 标记历史是否已加载
  const loadedRef = useRef(false)
  // 暂存消息：hook 初始化完成前收到的 send 调用
  const pendingRef = useRef<string | null>(null)

  const performSend = useCallback(
    async (
      content: string,
      options?: { hidden?: boolean },
      baseJsonl?: JSONLMessage[]
    ) => {
      if (!sessionId || !sectionFile) {
        return
      }

      setError(null)
      setIsStreaming(true)

      const currentJsonl = baseJsonl ?? jsonlRef.current
      const userMsg: JSONLMessage = {
        role: 'user',
        content,
        ...(options?.hidden ? { hidden: true } : {}),
      }
      const jsonlWithUser = [...currentJsonl, userMsg]
      jsonlRef.current = jsonlWithUser

      // 历史消息的 Parts 模型（不含当前流式）
      const historyMessages = toDisplayMessages(jsonlWithUser)
      setMessages(historyMessages)

      const streamCtx: StreamContext = {
        partsAcc: [],
        assistantContent: '',
        toolCallsAcc: [],
        toolResults: [],
        updateDisplay: () => {
          setMessages([
            ...historyMessages,
            {
              id: 'msg-streaming',
              role: 'assistant',
              parts: streamCtx.partsAcc,
            },
          ])
        },
        onError: (msg) => setError(msg),
      }

      try {
        // 创建 Agent（每次创建以注入当前确认模式指令）
        agentRef.current = await createAgent({
          extraInstructions: [
            getConfirmationInstruction(confirmationMode),
            getMissingFieldsInstruction(),
          ],
        })

        const abortController = new AbortController()
        abortRef.current = abortController

        const agent = agentRef.current
        if (!agent) {
          return
        }

        const result = await agent.stream({
          messages: toModelMessages(jsonlWithUser),
          abortSignal: abortController.signal,
        })

        // 消费 fullStream，维护 partsAcc
        for await (const event of result.fullStream) {
          if (abortController.signal.aborted) {
            break
          }
          handleStreamEvent(event, streamCtx)
        }

        // 流式完成 — 写入 JSONL
        await writeStreamResult(
          sessionId,
          sectionFile,
          content,
          options,
          streamCtx
        )

        // 生成摘要并保存
        const finalJsonl = buildSnapshot(
          jsonlWithUser,
          streamCtx.assistantContent,
          streamCtx.toolCallsAcc,
          streamCtx.toolResults
        )
        jsonlRef.current = finalJsonl

        // 从 finalJsonl 重建展示消息，确保确认状态等推导字段正确更新
        setMessages(toDisplayMessages(finalJsonl))

        onStreamComplete?.()

        // 异步生成 LLM 摘要，不阻塞 UI 更新
        generateAndSaveSummary(
          sessionId,
          sectionFile,
          finalJsonl,
          onStreamComplete
        )
        // eslint-disable-next-line eslint/no-shadow
      } catch (error) {
        if ((error as Error).name === 'AbortError') {
          // 用户中断，将已接收内容写入 JSONL
          await writeStreamResult(
            sessionId,
            sectionFile,
            content,
            options,
            streamCtx
          )

          // 从 JSONL 文件重新加载，确保展示与持久化一致
          const reloaded = await readMessages(sessionId, sectionFile)
          jsonlRef.current = reloaded
          setMessages(toDisplayMessages(reloaded))
        } else {
          setError(error instanceof Error ? error.message : '发生未知错误')
        }
      } finally {
        setIsStreaming(false)
      }
    },
    [sessionId, sectionFile, onStreamComplete, confirmationMode]
  )

  // 初始化时从 JSONL 加载历史消息
  useEffect(() => {
    if (!sessionId || !sectionFile) {
      setMessages([])
      jsonlRef.current = []
      loadedRef.current = false
      return
    }

    loadedRef.current = false
    const loadMessages = async () => {
      const msgs = await readMessages(sessionId, sectionFile)
      jsonlRef.current = msgs
      setMessages(toDisplayMessages(msgs))
      loadedRef.current = true

      // 处理暂存消息
      if (pendingRef.current) {
        const loadContent = pendingRef.current
        pendingRef.current = null
        performSend(loadContent, undefined, msgs)
      }
    }
    // eslint-disable-next-line eslint-plugin-promise/prefer-await-to-then
    loadMessages().catch(() => {
      /* 忽略加载失败 */
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

  const sendHidden = useCallback(
    async (content: string) => {
      if (!sessionId || !sectionFile || !loadedRef.current) {
        return
      }

      await performSend(content, { hidden: true })
    },
    [sessionId, sectionFile, performSend]
  )

  const stop = useCallback(() => {
    abortRef.current?.abort()
  }, [])

  return { messages, isStreaming, error, send, sendHidden, stop }
}
