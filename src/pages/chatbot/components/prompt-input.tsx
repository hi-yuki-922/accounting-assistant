/**
 * 底部输入框组件
 * 基于 ai-elements 的 PromptInput 组件构建
 * 包含文本输入、发送/停止按钮、引用模式
 */

import type { ChatStatus } from 'ai'
import { X } from 'lucide-react'
import { useCallback, useEffect, useRef } from 'react'

import {
  PromptInput as AIPromptInput,
  PromptInputBody,
  PromptInputFooter,
  PromptInputProvider,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
  usePromptInputController,
} from '@/components/ai-elements/prompt-input'
import type { PromptInputMessage } from '@/components/ai-elements/prompt-input'
import { Button } from '@/components/ui/button'
import type { ConfirmationMode } from '@/lib/confirmation-mode'
import { cn } from '@/lib/utils'
import type { PromptSubmitPayload } from '@/types/chatbot'

export type PromptInputProps = {
  /** 是否正在流式响应 */
  isStreaming: boolean
  /** 引用的节文件名 */
  referenceSectionFile?: string | null
  /** 引用节的摘要文本 */
  referenceSummary?: string
  /** 提交回调 */
  onSubmit: (payload: PromptSubmitPayload) => void
  /** 停止回调 */
  onStop: () => void
  /** 取消引用回调 */
  onCancelReference: () => void
  /** Section 索引入口按钮 */
  sectionIndexSlot?: React.ReactNode
  /** 确认模式 */
  confirmationMode: ConfirmationMode
  /** 切换确认模式回调 */
  onToggleConfirmation: () => void
  className?: string
}

/**
 * 内部输入组件，使用 PromptInputController 获取文本状态
 */
const PromptInputInner = ({
  isStreaming,
  referenceSectionFile,
  referenceSummary,
  onSubmit,
  onStop,
  onCancelReference,
  sectionIndexSlot,
  confirmationMode,
  onToggleConfirmation,
  wrapperRef,
}: Omit<PromptInputProps, 'className'> & {
  wrapperRef: React.RefObject<HTMLDivElement | null>
}) => {
  const { textInput } = usePromptInputController()
  const status: ChatStatus = isStreaming ? 'streaming' : 'ready'

  // 引用节变更后自动聚焦输入框
  useEffect(() => {
    if (referenceSectionFile) {
      wrapperRef.current
        ?.querySelector<HTMLTextAreaElement>('textarea')
        ?.focus()
    }
  }, [referenceSectionFile, wrapperRef])

  const handleSubmit = useCallback(
    (message: PromptInputMessage) => {
      const text = message.text.trim()
      if (!text || isStreaming) {
        return
      }

      onSubmit({
        content: text,
        referenceSectionFile: referenceSectionFile ?? undefined,
      })
    },
    [isStreaming, onSubmit, referenceSectionFile]
  )

  return (
    <>
      {/* 引用信息栏 */}
      {referenceSectionFile && (
        <div className="mb-2 flex items-center gap-2 rounded-lg bg-muted px-3 py-1.5 text-xs text-muted-foreground">
          <span className="truncate">
            引用: {referenceSummary ?? referenceSectionFile}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-4 w-4 shrink-0"
            onClick={onCancelReference}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}

      <AIPromptInput onSubmit={handleSubmit}>
        <PromptInputBody>
          <PromptInputTextarea placeholder="输入消息..." />
        </PromptInputBody>
        <PromptInputFooter>
          <PromptInputTools>
            {sectionIndexSlot}
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                'h-6 gap-1 rounded-full px-2 text-xs',
                confirmationMode === 'on'
                  ? 'text-green-600 hover:text-green-700'
                  : 'text-muted-foreground hover:text-foreground'
              )}
              onClick={onToggleConfirmation}
              title={
                confirmationMode === 'on' ? '确认模式已开启' : '确认模式已关闭'
              }
            >
              <span className="text-sm">🛡️</span>
              <span>{confirmationMode === 'on' ? '已开启' : '已关闭'}</span>
            </Button>
          </PromptInputTools>
          <PromptInputSubmit
            disabled={!textInput.value.trim()}
            status={status}
            onStop={onStop}
          />
        </PromptInputFooter>
      </AIPromptInput>
    </>
  )
}

export const PromptInput = ({ className, ...innerProps }: PromptInputProps) => {
  const wrapperRef = useRef<HTMLDivElement>(null)

  return (
    <div
      ref={wrapperRef}
      className={cn('border-t bg-background px-4 pb-4 pt-3', className)}
    >
      <PromptInputProvider>
        <PromptInputInner {...innerProps} wrapperRef={wrapperRef} />
      </PromptInputProvider>
    </div>
  )
}
