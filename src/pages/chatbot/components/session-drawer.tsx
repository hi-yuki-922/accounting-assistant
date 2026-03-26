/**
 * 会话列表抽屉组件
 * 显示所有会话列表，支持选择、重命名和删除
 */

import { Plus, MoreVertical, Edit2, Check, Trash2, X } from 'lucide-react'
import * as React from 'react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import type { ChatSession } from '@/types/chat'

export interface SessionDrawerProps {
  isOpen: boolean
  onClose: () => void
  sessions: ChatSession[]
  currentSession: ChatSession | null
  onSelectSession: (session: ChatSession) => void
  onDeleteSession: (sessionId: number) => void
  onStartRenameSession: (session: ChatSession) => void
  onSaveSessionTitle: (sessionId: number) => void
  onCancelRenameSession: () => void
  onCreateNewSession: () => Promise<void>
  isLoading: boolean
  editingSessionId: number | null
  editingTitle: string
  setEditingTitle: (title: string) => void
}

export const SessionDrawer: React.FC<SessionDrawerProps> = ({
  isOpen,
  onClose,
  sessions,
  currentSession,
  onSelectSession,
  onDeleteSession,
  onStartRenameSession,
  onSaveSessionTitle,
  onCancelRenameSession,
  onCreateNewSession,
  isLoading,
  editingSessionId,
  editingTitle,
  setEditingTitle,
}) => {
  if (!isOpen) {
    return null
  }

  const handleKeyDown = (e: React.KeyboardEvent, sessionId: number) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      onSaveSessionTitle(sessionId)
    } else if (e.key === 'Escape') {
      onCancelRenameSession()
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
      <div className="fixed inset-y-0 left-0 z-50 h-full w-80 border-r bg-background p-4">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">对话列表</h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="space-y-2">
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={onCreateNewSession}
            disabled={isLoading}
          >
            <Plus className="mr-2 h-4 w-4" />
            新对话
          </Button>
          {sessions.map((session) => (
            <div
              key={session.id}
              className={cn(
                'group flex cursor-pointer items-center justify-between rounded-lg border p-3 hover:bg-accent transition-colors',
                currentSession?.id === session.id && 'bg-accent'
              )}
              onClick={() => onSelectSession(session)}
            >
              <div className="flex-1">
                {editingSessionId === session.id ? (
                  <div className="flex items-center gap-2">
                    <Input
                      value={editingTitle}
                      onChange={(e) => setEditingTitle(e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, session.id)}
                      className="h-8 w-40"
                      autoFocus
                    />
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6"
                      onClick={(e) => {
                        e.stopPropagation()
                        onSaveSessionTitle(session.id)
                      }}
                    >
                      <Check className="h-3 w-3" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6"
                      onClick={(e) => {
                        e.stopPropagation()
                        onCancelRenameSession()
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <div>
                    <p className="font-medium truncate">{session.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(session.updated_at).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation()
                      onStartRenameSession(session)
                    }}
                  >
                    <Edit2 className="mr-2 h-4 w-4" />
                    重命名
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation()
                      onDeleteSession(session.id)
                    }}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    删除对话
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
