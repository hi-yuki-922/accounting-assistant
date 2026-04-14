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
import { Tool, ToolHeader } from '@/components/ai-elements/tool'
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
import type {
  DisplayMessagePart,
  SectionCardHandle,
  ToolCallState,
} from '@/types/chatbot'

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

// ─── 工具名称中文映射 ─────────────────────────────────────

/**
 * 工具名称中文映射
 */
const TOOL_DISPLAY_NAMES: Record<string, string> = {
  search_orders: '搜索订单',
  get_order_detail: '查询订单详情',
  create_order: '创建订单',
  settle_order: '结账',
  search_records: '搜索记录',
  create_record: '创建记录',
  update_record: '更新记录',
  create_write_off: '冲账',
  search_books: '查询账本',
  search_customers: '查询客户',
  search_products: '查询商品',
  search_categories: '查询分类',
  get_product_detail: '查询商品详情',
}

// ─── Part 渲染组件 ─────────────────────────────────────

/**
 * 工具调用状态指示器
 * 使用 ai-elements Tool 组件展示工具名称和状态
 */
const toolCallStateMap: Record<ToolCallState, string> = {
  calling: 'input-available',
  completed: 'output-available',
  error: 'output-error',
}

const ToolCallIndicator = ({
  name,
  state,
}: {
  name: string
  state: ToolCallState
}) => {
  const displayName = TOOL_DISPLAY_NAMES[name] ?? name
  return (
    <Tool>
      <ToolHeader
        type="dynamic-tool"
        state={toolCallStateMap[state] as 'input-available'}
        toolName={displayName}
      />
    </Tool>
  )
}

/**
 * 工具结果分发器
 * 按 toolName 分发到对应的生成式组件，未匹配时 fallback 为纯文本
 */
const ToolResultDispatcher = ({
  part,
  send: _send,
  sendHidden,
}: {
  part: Extract<DisplayMessagePart, { type: 'tool-result' }>
  send: (content: string) => Promise<void>
  sendHidden: (content: string) => Promise<void>
}) => {
  const result = part.result as Record<string, unknown> | undefined

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

    // 订单工具
    case 'search_orders':
    case 'create_order': {
      return <OrderListCard result={part.result} />
    }

    case 'get_order_detail': {
      return <OrderDetailCard result={part.result} />
    }

    // 记账工具
    case 'search_records':
    case 'create_record':
    case 'update_record': {
      return <RecordListCard result={part.result} />
    }

    // 通用操作结果
    case 'settle_order':
    case 'create_write_off':
    case 'search_books':
    case 'search_customers':
    case 'search_products':
    case 'search_categories':
    case 'get_product_detail': {
      return <OperationResultCard result={part.result} />
    }

    default: {
      // Fallback: 纯文本展示
      const text =
        typeof part.result === 'string'
          ? part.result
          : JSON.stringify(part.result, null, 2)
      return (
        <pre className="overflow-x-auto rounded-md bg-muted/50 p-3 text-xs">
          {text}
        </pre>
      )
    }
  }
}

/**
 * 按 part 类型分发的渲染组件
 */
const PartRenderer = ({
  part,
  send,
  sendHidden,
}: {
  part: DisplayMessagePart
  send: (content: string) => Promise<void>
  sendHidden: (content: string) => Promise<void>
}) => {
  switch (part.type) {
    case 'text': {
      return <MessageResponse>{part.content}</MessageResponse>
    }

    case 'tool-call': {
      return <ToolCallIndicator name={part.toolName} state={part.state} />
    }

    case 'tool-result': {
      return (
        <ToolResultDispatcher part={part} send={send} sendHidden={sendHidden} />
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
                      send={send}
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
