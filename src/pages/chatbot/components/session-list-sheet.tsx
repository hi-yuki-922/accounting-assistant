/**
 * 会话列表 Sheet 抽屉组件
 * 右侧滑出，展示所有会话列表，支持切换、重命名、生成摘要
 */

import { MessageSquare, Pencil, Sparkles } from 'lucide-react'
import { useCallback, useState } from 'react'

import type { Session } from '@/ai/storage/types'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { cn } from '@/lib/utils'

export type SessionListSheetProps = {
  /** 是否打开 */
  open: boolean
  /** 打开/关闭回调 */
  onOpenChange: (open: boolean) => void
  /** 会话列表 */
  sessions: Session[]
  /** 当前活跃会话 ID */
  activeSessionId: number | null
  /** 切换会话回调 */
  onSwitchSession: (id: number) => void
  /** 重命名会话回调 */
  onRenameSession: (id: number, newTitle: string) => void
  /** 生成摘要回调 */
  onGenerateSummary: (id: number) => void
}

export const SessionListSheet = ({
  open,
  onOpenChange,
  sessions,
  activeSessionId,
  onSwitchSession,
  onRenameSession,
  onGenerateSummary,
}: SessionListSheetProps) => {
  const [renameTarget, setRenameTarget] = useState<Session | null>(null)
  const [renameInput, setRenameInput] = useState('')

  const handleItemClick = useCallback(
    (id: number) => {
      onSwitchSession(id)
      onOpenChange(false)
    },
    [onSwitchSession, onOpenChange]
  )

  const handleRenameClick = useCallback((session: Session) => {
    setRenameInput(session.title)
    setRenameTarget(session)
  }, [])

  const handleRenameConfirm = useCallback(() => {
    const trimmed = renameInput.trim()
    if (trimmed && renameTarget) {
      onRenameSession(renameTarget.id, trimmed)
    }
    setRenameTarget(null)
  }, [renameInput, renameTarget, onRenameSession])

  const handleGenerateSummary = useCallback(
    (id: number) => {
      onGenerateSummary(id)
    },
    [onGenerateSummary]
  )

  /** 格式化日期显示 */
  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr)
      return `${date.getMonth() + 1}/${date.getDate()}`
    } catch {
      return ''
    }
  }

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="w-80 p-0">
          <SheetHeader className="border-b px-4 py-3">
            <SheetTitle className="text-sm">会话列表</SheetTitle>
          </SheetHeader>
          <ScrollArea className="h-[calc(100vh-52px)]">
            <div className="flex flex-col gap-1 p-2">
              {sessions.map((session) => {
                const isActive = session.id === activeSessionId
                return (
                  <div
                    key={session.id}
                    className={cn(
                      'group flex flex-col gap-1 rounded-lg px-3 py-2 cursor-pointer transition-colors',
                      isActive
                        ? 'bg-primary/10 border border-primary/20'
                        : 'hover:bg-muted'
                    )}
                    onClick={() => handleItemClick(session.id)}
                  >
                    {/* 标题行 */}
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                      <span className="flex-1 truncate text-sm font-medium">
                        {session.title}
                      </span>
                      {isActive && (
                        <span className="shrink-0 rounded-full bg-primary px-1.5 py-0.5 text-[10px] text-primary-foreground">
                          当前
                        </span>
                      )}
                    </div>

                    {/* 摘要和元信息 */}
                    <div className="flex items-center gap-2 pl-5.5">
                      <span className="text-[10px] text-muted-foreground">
                        {formatDate(session.createdAt)}
                      </span>
                      {session.summary && (
                        <span className="flex-1 truncate text-xs text-muted-foreground">
                          {session.summary}
                        </span>
                      )}
                    </div>

                    {/* 操作按钮 */}
                    <div
                      className="flex items-center gap-1 pl-5.5 opacity-0 transition-opacity group-hover:opacity-100"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleRenameClick(session)}
                        title="重命名"
                      >
                        <Pencil className="h-3 w-3" />
                      </Button>
                      {!session.summaryGenerated && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => handleGenerateSummary(session.id)}
                          title="生成摘要"
                        >
                          <Sparkles className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>

      {/* 重命名对话框 */}
      <Dialog
        open={renameTarget !== null}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setRenameTarget(null)
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>重命名会话</DialogTitle>
          </DialogHeader>
          <Input
            value={renameInput}
            onChange={(e) => setRenameInput(e.target.value)}
            placeholder="输入新标题"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleRenameConfirm()
              }
            }}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameTarget(null)}>
              取消
            </Button>
            <Button onClick={handleRenameConfirm}>确认</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
