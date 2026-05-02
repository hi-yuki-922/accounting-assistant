/**
 * Section 卡片组件
 * 支持展开/折叠态切换，折叠态显示节编号和摘要，展开态渲染消息列表
 * 展开时内部实例化 useSectionChat，通过 ref 暴露 send/stop
 */

import { ChevronDown, ChevronRight, Quote } from 'lucide-react'
import { forwardRef, useCallback, useImperativeHandle, useRef } from 'react'

import type { SectionSummary } from '@/ai/storage/types'
import {
  Message,
  MessageContent,
  MessageResponse,
} from '@/components/ai-elements/message'
import { Button } from '@/components/ui/button'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { useSectionChat } from '@/hooks/use-section-chat'
import type { ConfirmationMode } from '@/lib/confirmation-mode'
import { cn } from '@/lib/utils'
import { ConfirmationCard } from '@/pages/chatbot/components/generative/confirmation-card'
import type { ConfirmationCardProps } from '@/pages/chatbot/components/generative/confirmation-card'
import { MissingFieldsForm } from '@/pages/chatbot/components/generative/missing-fields-form'
import type { MissingFieldsFormProps } from '@/pages/chatbot/components/generative/missing-fields-form'
import { OperationResultCard } from '@/pages/chatbot/components/generative/operation-result-card'
import { OrderDetailCard } from '@/pages/chatbot/components/generative/order-detail-card'
import { OrderListCard } from '@/pages/chatbot/components/generative/order-list-card'
import { RecordListCard } from '@/pages/chatbot/components/generative/record-list-card'
import type { DisplayMessagePart, SectionCardHandle } from '@/types/chatbot'

export type SectionCardProps = {
  /** 会话 ID */
  sessionId: number
  /** 节文件名 */
  sectionFile: string
  /** 节序号（用于显示） */
  index: number
  /** 节摘要 */
  summary: SectionSummary | undefined
  /** 是否折叠 */
  collapsed: boolean
  /** 是否为活跃节（正在接收消息） */
  isActive: boolean
  /** 折叠/展开切换回调 */
  onToggleCollapse: (sectionFile: string) => void
  /** 引用按钮回调 */
  onQuote: (sectionFile: string) => void
  /** 流式完成后回调 */
  onStreamComplete: () => void
  /** 确认模式 */
  confirmationMode: ConfirmationMode
  /** 预渲染的用户消息（乐观更新） */
  initialMessage?: string
}

// ─── 展示工具源工具映射 ─────────────────────────────────

/**
 * 展示工具名 → 源工具名数组的映射表
 * 用于在 parts 上下文中查找展示工具对应的源工具结果
 */
const DISPLAY_SOURCE_MAP: Record<string, string[]> = {
  display_order_list: ['search_orders', 'create_order'],
  display_order_detail: ['get_order_detail'],
  display_record_list: ['search_records', 'create_record', 'update_record'],
  display_operation_result: [
    'settle_order',
    'create_write_off',
    'search_books',
    'search_customers',
    'search_products',
    'search_categories',
    'get_product_detail',
  ],
}

/** 交互工具集合 */
const INTERACTION_TOOLS = new Set([
  'confirm_operation',
  'collect_missing_fields',
])

/** 展示工具集合 */
const DISPLAY_TOOLS = new Set(Object.keys(DISPLAY_SOURCE_MAP))

// ─── Part 渲染组件 ─────────────────────────────────────

/**
 * 在 parts 数组中向前查找最近的匹配源工具结果
 * 从当前 part 的索引向前遍历，返回第一个 toolName 匹配的 tool-result 的 result 数据
 */
function findSourceResult(
  parts: DisplayMessagePart[],
  currentIndex: number,
  sourceToolNames: string[]
): unknown {
  for (let i = currentIndex - 1; i >= 0; i--) {
    const p = parts[i]
    if (p.type === 'tool-result' && sourceToolNames.includes(p.toolName)) {
      return p.result
    }
  }
  return null
}

/**
 * 工具结果分发器
 * 仅处理展示工具和交互工具的 tool-result，其他返回 null
 */
const ToolResultDispatcher = ({
  part,
  parts,
  partIndex,
  sendHidden,
}: {
  part: Extract<DisplayMessagePart, { type: 'tool-result' }>
  parts: DisplayMessagePart[]
  partIndex: number
  sendHidden: (content: string) => Promise<void>
}) => {
  const result = part.result as Record<string, unknown> | undefined

  // 交互工具：保持原有渲染不变
  switch (part.toolName) {
    case 'confirm_operation': {
      return (
        <ConfirmationCard
          toolCallId={part.toolCallId}
          result={result as ConfirmationCardProps['result']}
          onSend={sendHidden}
        />
      )
    }

    case 'collect_missing_fields': {
      return (
        <MissingFieldsForm
          result={result as MissingFieldsFormProps['result']}
          onSend={sendHidden}
        />
      )
    }
  }

  // 展示工具：从上下文查找源数据并渲染对应组件
  const sourceToolNames = DISPLAY_SOURCE_MAP[part.toolName]
  if (sourceToolNames) {
    const sourceResult = findSourceResult(parts, partIndex, sourceToolNames)
    if (sourceResult == null) {
      return null
    }

    switch (part.toolName) {
      case 'display_order_list': {
        return <OrderListCard result={sourceResult} />
      }
      case 'display_order_detail': {
        return <OrderDetailCard result={sourceResult} />
      }
      case 'display_record_list': {
        return <RecordListCard result={sourceResult} />
      }
      case 'display_operation_result': {
        return <OperationResultCard result={sourceResult} />
      }
    }
  }

  // 非展示/非交互工具：不渲染
  return null
}

/**
 * 按 part 类型分发的渲染组件
 * tool-call 统一不渲染，tool-result 仅处理展示工具和交互工具
 */
const PartRenderer = ({
  part,
  parts,
  partIndex,
  sendHidden,
}: {
  part: DisplayMessagePart
  parts: DisplayMessagePart[]
  partIndex: number
  sendHidden: (content: string) => Promise<void>
}) => {
  switch (part.type) {
    case 'text': {
      return <MessageResponse>{part.content}</MessageResponse>
    }

    // tool-call 统一隐藏
    case 'tool-call': {
      return null
    }

    case 'tool-result': {
      // 仅处理展示工具和交互工具
      if (
        !DISPLAY_TOOLS.has(part.toolName) &&
        !INTERACTION_TOOLS.has(part.toolName)
      ) {
        return null
      }
      return (
        <ToolResultDispatcher
          part={part}
          parts={parts}
          partIndex={partIndex}
          sendHidden={sendHidden}
        />
      )
    }

    default: {
      return null
    }
  }
}

// ─── 展开态聊天内容 ─────────────────────────────────────

/**
 * 展开态的聊天内容区域
 * 独立组件确保 useSectionChat 只在展开时挂载
 */
type SectionChatContentProps = {
  sessionId: number
  sectionFile: string
  isActive: boolean
  onStreamComplete: () => void
  confirmationMode: ConfirmationMode
  /** 预渲染的用户消息（乐观更新） */
  initialMessage?: string
  chatSendRef: React.MutableRefObject<
    ((content: string) => Promise<void>) | null
  >
  chatStopRef: React.MutableRefObject<(() => void) | null>
}

const SectionChatContent = ({
  sessionId,
  sectionFile,
  isActive,
  onStreamComplete,
  confirmationMode,
  initialMessage,
  chatSendRef,
  chatStopRef,
}: SectionChatContentProps) => {
  const { messages, isStreaming, error, send, sendHidden, stop } =
    useSectionChat(sessionId, sectionFile, onStreamComplete, confirmationMode)

  // 将 send/stop 同步到 ref
  chatSendRef.current = send
  chatStopRef.current = stop

  return (
    <CollapsibleContent>
      <div className="border-t px-4 py-3">
        <div className="space-y-3">
          {/* 预渲染用户消息（乐观更新）：仅在 messages 为空且 initialMessage 存在时显示 */}
          {messages.length === 0 && initialMessage && (
            <Message from="user">
              <MessageContent>
                <MessageResponse>{initialMessage}</MessageResponse>
              </MessageContent>
            </Message>
          )}

          {messages.map((msg, idx) => {
            const isStreamingMsg =
              isStreaming &&
              isActive &&
              msg.role === 'assistant' &&
              idx === messages.length - 1

            // 判断是否需要显示流式指示器
            const showThinking = isStreamingMsg && msg.parts.length === 0
            const hasActiveToolCall = msg.parts.some(
              (p) => p.type === 'tool-call' && p.state === 'calling'
            )
            const showCursor =
              isStreamingMsg &&
              !hasActiveToolCall &&
              msg.parts.some((p) => p.type === 'text')

            return (
              <Message key={msg.id} from={msg.role}>
                <MessageContent>
                  {showThinking && (
                    <span className="animate-pulse text-sm text-muted-foreground">
                      思考中...
                    </span>
                  )}
                  {msg.parts.map((part, partIdx) => (
                    <PartRenderer
                      key={`${msg.id}-${partIdx}`}
                      part={part}
                      parts={msg.parts}
                      partIndex={partIdx}
                      sendHidden={sendHidden}
                    />
                  ))}
                  {showCursor && (
                    <span className="inline-block h-4 w-0.5 animate-pulse bg-muted-foreground/50" />
                  )}
                </MessageContent>
              </Message>
            )
          })}

          {error && (
            <div className="rounded-lg bg-destructive/10 px-4 py-2 text-sm text-destructive">
              {error}
            </div>
          )}
        </div>
      </div>
    </CollapsibleContent>
  )
}

// ─── Section 卡片主组件 ─────────────────────────────────

/**
 * Section 卡片组件
 * 通过 forwardRef 暴露 send/stop 方法
 */
export const SectionCard = forwardRef<SectionCardHandle, SectionCardProps>(
  (
    {
      sessionId,
      sectionFile,
      index,
      summary,
      collapsed,
      isActive,
      onToggleCollapse,
      onQuote,
      onStreamComplete,
      confirmationMode,
      initialMessage,
    },
    ref
  ) => {
    // 内部持有 sectionChat 的 ref 以便转发 send/stop
    const chatSendRef = useRef<(content: string) => Promise<void>>(null)
    const chatStopRef = useRef<() => void>(null)

    const handleSend = useCallback(async (content: string) => {
      await chatSendRef.current?.(content)
    }, [])

    const handleStop = useCallback(() => {
      chatStopRef.current?.()
    }, [])

    useImperativeHandle(ref, () => ({ send: handleSend, stop: handleStop }), [
      handleSend,
      handleStop,
    ])

    return (
      <Collapsible
        open={!collapsed}
        onOpenChange={() => onToggleCollapse(sectionFile)}
        className={cn(
          'min-w-0 overflow-hidden rounded-lg border transition-colors',
          isActive && !collapsed
            ? 'border-primary/50 bg-primary/5'
            : 'border-border'
        )}
      >
        {/* 头部：节编号 + 摘要/折叠按钮 */}
        <div className="flex items-center gap-2 px-4 py-3">
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="icon" className="h-5 w-5 shrink-0">
              {collapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </CollapsibleTrigger>

          <span className="shrink-0 text-xs font-medium text-muted-foreground">
            #{index}
          </span>

          {collapsed && summary && (
            <span className="text-sm text-muted-foreground inline-block flex-1">
              {summary.title ?? summary.summary}
            </span>
          )}

          {!collapsed && (
            <span className="flex-1 truncate text-sm font-medium">
              {summary?.title ?? `对话节 #${index}`}
            </span>
          )}

          <div className="ml-auto flex shrink-0 items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={(e) => {
                e.stopPropagation()
                onQuote(sectionFile)
              }}
              title="引用此节"
            >
              <Quote className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {/* 展开态：消息列表 */}
        {!collapsed && (
          <SectionChatContent
            sessionId={sessionId}
            sectionFile={sectionFile}
            isActive={isActive}
            onStreamComplete={onStreamComplete}
            confirmationMode={confirmationMode}
            initialMessage={initialMessage}
            chatSendRef={chatSendRef}
            chatStopRef={chatStopRef}
          />
        )}
      </Collapsible>
    )
  }
)

SectionCard.displayName = 'SectionCard'
