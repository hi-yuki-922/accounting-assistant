/**
 * 聊天头部组件
 * 显示当前会话标题、描述和新建对话按钮
 */

import { MessageSquare, Plus } from 'lucide-react'
import * as React from 'react'

import { Button } from '@/components/ui/button'
import type { ChatSession } from '@/types/chat'

export interface ChatHeaderProps {
  currentSession: ChatSession | null
  isLoading: boolean
  onCreateNewSession: () => Promise<void>
  onToggleDrawer: () => void
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  currentSession,
  isLoading,
  onCreateNewSession,
  onToggleDrawer,
}) => (
  <div className="flex items-center justify-between border-b p-4">
    <div className="flex items-center gap-3">
      <Button
        variant="ghost"
        size="icon"
        onClick={onToggleDrawer}
        className="hover:bg-accent"
      >
        <MessageSquare className="h-5 w-5" />
      </Button>
      <div>
        <h2 className="text-lg font-semibold">
          {currentSession?.title || 'AI 财务助手'}
        </h2>
        <p className="text-sm text-muted-foreground">
          {currentSession ? '继续对话' : '开始新的对话'}
        </p>
      </div>
    </div>
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={onCreateNewSession}
        disabled={isLoading}
      >
        <Plus className="mr-2 h-4 w-4" />
        新对话
      </Button>
    </div>
  </div>
)
