/**
 * 菜单栏组件
 * 显示会话标题、Section 索引入口
 */

import { MessageSquare } from 'lucide-react'

import { cn } from '@/lib/utils'

export type MenuBarProps = {
  /** 会话标题 */
  title?: string
  className?: string
}

export const MenuBar = ({ title, className }: MenuBarProps) => (
  <div className={cn('flex items-center gap-2 border-b px-4 py-3', className)}>
    <MessageSquare className="h-4 w-4 text-muted-foreground" />
    <span className="text-sm font-medium">{title ?? 'AI 助手'}</span>
  </div>
)
