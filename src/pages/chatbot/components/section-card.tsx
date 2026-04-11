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
import { cn } from '@/lib/utils'
import type { SectionCardHandle } from '@/types/chatbot'

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
}

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
          'rounded-lg border transition-colors',
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
            <span className="truncate text-sm text-muted-foreground">
              {summary.summary}
            </span>
          )}

          {!collapsed && (
            <span className="text-sm font-medium">对话节 #{index}</span>
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
            chatSendRef={chatSendRef}
            chatStopRef={chatStopRef}
          />
        )}
      </Collapsible>
    )
  }
)

SectionCard.displayName = 'SectionCard'

/**
 * 展开态的聊天内容区域
 * 独立组件确保 useSectionChat 只在展开时挂载
 */
type SectionChatContentProps = {
  sessionId: number
  sectionFile: string
  isActive: boolean
  onStreamComplete: () => void
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
  chatSendRef,
  chatStopRef,
}: SectionChatContentProps) => {
  const { messages, isStreaming, error, send, stop } = useSectionChat(
    sessionId,
    sectionFile,
    onStreamComplete
  )

  // 将 send/stop 同步到 ref
  chatSendRef.current = send
  chatStopRef.current = stop

  return (
    <CollapsibleContent>
      <div className="border-t px-4 py-3">
        <div className="space-y-3">
          {messages.map((msg, idx) => {
            const isStreamingMsg =
              isStreaming &&
              isActive &&
              msg.role === 'assistant' &&
              idx === messages.length - 1

            return (
              <Message key={idx} from={msg.role}>
                <MessageContent>
                  {msg.content ? (
                    <MessageResponse>{msg.content}</MessageResponse>
                  ) : (isStreamingMsg ? (
                    <span className="animate-pulse text-sm text-muted-foreground">
                      思考中...
                    </span>
                  ) : null)}
                  {isStreamingMsg && msg.content && (
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
