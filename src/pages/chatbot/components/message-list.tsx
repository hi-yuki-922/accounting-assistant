/**
 * 消息列表组件
 * 显示所有消息和空状态
 */

import { MessageSquare } from 'lucide-react'
import * as React from 'react'

import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from '@/components/ai-elements/conversation'
import {
  Message,
  MessageContent,
  MessageResponse,
} from '@/components/ai-elements/message'
import { ScrollArea } from '@/components/ui/scroll-area'
import type { ChatMessage } from '@/types/chat'

export interface MessageListProps {
  messages: ChatMessage[]
}

export const MessageList: React.FC<MessageListProps> = ({ messages }) => {
  const scrollRef = React.useRef<HTMLDivElement>(null)

  // 自动滚动到底部
  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  return (
    <ScrollArea className="h-full p-4" ref={scrollRef}>
      {messages.length === 0 ? (
        <div className="flex h-full items-center justify-center">
          <ConversationEmptyState
            icon={<MessageSquare className="size-12" />}
            title="开始新的对话"
            description="询问关于您的财务数据的问题，获取专业的财务建议"
          />
        </div>
      ) : (
        <Conversation>
          <ConversationContent>
            {messages.map((message) => (
              <Message from={message.role} key={message.id}>
                <MessageContent>
                  <MessageResponse>{message.content}</MessageResponse>
                </MessageContent>
              </Message>
            ))}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>
      )}
    </ScrollArea>
  )
}
