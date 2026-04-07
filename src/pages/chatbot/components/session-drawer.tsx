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
  const drawerRef = React.useRef<HTMLDivElement>(null)
  const previousActiveElement = React.useRef<HTMLElement | null>(null)

  // Escape 关闭抽屉 + 焦点管理
  React.useEffect(() => {
    if (!isOpen) {
      return
    }

    // 记录打开前的焦点元素，关闭后恢复
    previousActiveElement.current = document.activeElement as HTMLElement

    // 聚焦到抽屉内的关闭按钮
    const timer = setTimeout(() => {
      const closeButton = drawerRef.current?.querySelector<HTMLButtonElement>(
        '[data-drawer-close]'
      )
      closeButton?.focus()
    }, 0)

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
        return
      }

      // 焦点陷阱：Tab 键限制在抽屉内循环
      if (e.key === 'Tab' && drawerRef.current) {
        const focusable = [
          ...drawerRef.current.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          ),
        ]
        if (focusable.length === 0) {
          return
        }

        const first = focusable[0]
        const last = focusable.at(-1)

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last?.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      clearTimeout(timer)
      document.removeEventListener('keydown', handleKeyDown)
      // 恢复之前的焦点
      previousActiveElement.current?.focus()
    }
  }, [isOpen, onClose])

  if (!isOpen) {
    return null
  }

  const handleRenameKeyDown = (e: React.KeyboardEvent, sessionId: number) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      onSaveSessionTitle(sessionId)
    } else if (e.key === 'Escape') {
      onCancelRenameSession()
    }
  }

  const handleSessionKeyDown = (
    e: React.KeyboardEvent,
    session: ChatSession
  ) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onSelectSession(session)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
      onClick={onClose}
      aria-hidden="true"
    >
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label="对话列表"
        className="fixed inset-y-0 left-0 z-50 h-full w-80 border-r bg-background p-4 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">对话列表</h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8"
            data-drawer-close
            aria-label="关闭对话列表"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="space-y-2 flex-1 overflow-y-auto">
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
              role="button"
              tabIndex={0}
              aria-current={
                currentSession?.id === session.id ? 'true' : undefined
              }
              className={cn(
                'group flex items-center justify-between rounded-lg border p-3 hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors',
                currentSession?.id === session.id && 'bg-accent'
              )}
              onClick={() => onSelectSession(session)}
              onKeyDown={(e) => handleSessionKeyDown(e, session)}
            >
              <div className="flex-1 min-w-0">
                {editingSessionId === session.id ? (
                  <div className="flex items-center gap-2">
                    <Input
                      value={editingTitle}
                      onChange={(e) => setEditingTitle(e.target.value)}
                      onKeyDown={(e) => handleRenameKeyDown(e, session.id)}
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
                      aria-label="保存"
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
                      aria-label="取消"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <div>
                    <p className="font-medium truncate">{session.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(session.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity shrink-0"
                    aria-label={`操作：${session.title}`}
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
