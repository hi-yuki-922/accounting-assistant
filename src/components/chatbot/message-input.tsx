/**
 * 消息输入组件
 * 处理用户输入和附件上传
 */

import type { ChatStatus } from 'ai'
import { Paperclip, XIcon } from 'lucide-react'
import * as React from 'react'

import type { PromptInputMessage } from '@/components/ai-elements/prompt-input'
import {
  PromptInput,
  PromptInputActionAddAttachments,
  PromptInputActionMenu,
  PromptInputActionMenuContent,
  PromptInputActionMenuTrigger,
  PromptInputBody,
  PromptInputButton,
  PromptInputFooter,
  PromptInputHeader,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
  usePromptInputAttachments,
} from '@/components/ai-elements/prompt-input'

export interface MessageInputProps {
  inputValue: string
  onInputChange: (value: string) => void
  onSubmit: (message: PromptInputMessage) => Promise<void>
  chatStatus: ChatStatus
}

// 附件显示组件
const PromptInputAttachmentsDisplay = () => {
  const attachments = usePromptInputAttachments()

  if (attachments.files.length === 0) {
    return null
  }

  return (
    <div className="flex items-center gap-2">
      {attachments.files.map((attachment) => (
        <div
          key={attachment.id}
          className="flex items-center gap-1 rounded-full border bg-muted px-3 py-1 text-sm"
        >
          <span className="truncate max-w-24">
            {attachment.filename || 'File'}
          </span>
          <button
            onClick={() => attachments.remove(attachment.id)}
            className="ml-1 hover:text-destructive"
            aria-label="Remove attachment"
          >
            <XIcon className="size-3" />
          </button>
        </div>
      ))}
    </div>
  )
}

export const MessageInput: React.FC<MessageInputProps> = ({
  inputValue,
  onInputChange,
  onSubmit,
  chatStatus,
}) => {
  const inputRef = React.useRef<HTMLTextAreaElement>(null)

  const handleSubmit = async (message: { files: any[]; text: string }) => {
    if (!inputValue.trim() && message.files.length === 0) {
      return
    }

    await onSubmit({
      files: message.files,
      text: inputValue,
    })

    // 重新聚焦输入框
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }

  return (
    <PromptInput
      accept="image/*,.pdf,.txt,.md,.csv,.json"
      maxFiles={5}
      // 10MB
      maxFileSize={10_485_760}
      multiple
      onSubmit={handleSubmit}
    >
      <PromptInputHeader>
        <PromptInputAttachmentsDisplay />
      </PromptInputHeader>
      <PromptInputBody>
        <PromptInputTextarea
          ref={inputRef}
          onChange={(e) => onInputChange(e.target.value)}
          value={inputValue}
        />
      </PromptInputBody>
      <PromptInputFooter>
        <PromptInputTools>
          <PromptInputActionMenu>
            <PromptInputActionMenuTrigger />
            <PromptInputActionMenuContent>
              <PromptInputActionAddAttachments label="上传文件" />
            </PromptInputActionMenuContent>
          </PromptInputActionMenu>
          <PromptInputButton tooltip={{ content: '附件', shortcut: '⌘U' }}>
            <Paperclip className="size-4" />
          </PromptInputButton>
        </PromptInputTools>
        <PromptInputSubmit status={chatStatus} />
      </PromptInputFooter>
    </PromptInput>
  )
}
