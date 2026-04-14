/**
 * 菜单栏组件
 * 显示会话标题、DropdownMenu 操作入口（新建、重命名、切换会话）
 */

import { EllipsisVertical, MessageSquare } from 'lucide-react'
import { useCallback, useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

export type MenuBarProps = {
  /** 会话标题 */
  title?: string
  className?: string
  /** 新建会话回调 */
  onCreateSession?: () => void
  /** 重命名会话回调 */
  onRenameSession?: (newTitle: string) => void
  /** 打开会话列表回调 */
  onOpenSessionList?: () => void
}

export const MenuBar = ({
  title,
  className,
  onCreateSession,
  onRenameSession,
  onOpenSessionList,
}: MenuBarProps) => {
  const [renameDialogOpen, setRenameDialogOpen] = useState(false)
  const [renameInput, setRenameInput] = useState('')

  const handleRenameClick = useCallback(() => {
    setRenameInput(title ?? '')
    setRenameDialogOpen(true)
  }, [title])

  const handleRenameConfirm = useCallback(() => {
    const trimmed = renameInput.trim()
    if (trimmed && onRenameSession) {
      onRenameSession(trimmed)
    }
    setRenameDialogOpen(false)
  }, [renameInput, onRenameSession])

  const hasActions = onCreateSession || onRenameSession || onOpenSessionList

  return (
    <div
      className={cn('flex items-center gap-2 border-b px-4 py-3', className)}
    >
      <MessageSquare className="h-4 w-4 shrink-0 text-muted-foreground" />
      <span className="flex-1 truncate text-sm font-medium">
        {title ?? 'AI 助手'}
      </span>

      {hasActions && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7">
              <EllipsisVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {onCreateSession && (
              <DropdownMenuItem onClick={onCreateSession}>
                新建会话
              </DropdownMenuItem>
            )}
            {onRenameSession && (
              <DropdownMenuItem onClick={handleRenameClick}>
                重命名当前会话
              </DropdownMenuItem>
            )}
            {onOpenSessionList && (
              <DropdownMenuItem onClick={onOpenSessionList}>
                切换会话
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      {/* 重命名对话框 */}
      <Dialog open={renameDialogOpen} onOpenChange={setRenameDialogOpen}>
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
            <Button
              variant="outline"
              onClick={() => setRenameDialogOpen(false)}
            >
              取消
            </Button>
            <Button onClick={handleRenameConfirm}>确认</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
