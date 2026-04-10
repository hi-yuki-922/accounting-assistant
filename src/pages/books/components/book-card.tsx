/**
 * 账本卡片组件
 * 显示账本图标、标题、描述、记录数量和操作菜单
 */

import type { DraggableAttributes } from '@dnd-kit/core'
import type { SyntheticListenerMap } from '@dnd-kit/core/dist/hooks/utilities'
import { Folder, MoreHorizontal } from 'lucide-react'

import type { AccountingBook } from '@/api/commands/accounting-book/type'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { BOOK_ICONS } from '@/config/book-icons'
import { cn } from '@/lib/utils'
import React from "react";

export interface BookCardProps {
  /** 账本数据 */
  book: AccountingBook
  /** 是否为默认账本 */
  isDefault?: boolean
  /** 点击卡片 */
  onClick?: () => void
  /** 点击编辑 */
  onEdit?: () => void
  /** 点击删除 */
  onDelete?: () => void
  /** 拖拽状态 */
  isDragging?: boolean
  /** dnd-kit attributes */
  attributes?: DraggableAttributes
  /** dnd-kit listeners */
  listeners?: SyntheticListenerMap | undefined
  /** 是否在排序模式 */
  isSortingMode?: boolean
}

export const BookCard: React.FC<BookCardProps> = ({
  book,
  isDefault = false,
  onClick,
  onEdit,
  onDelete,
  isDragging = false,
  attributes,
  listeners,
  isSortingMode = false,
}) => {
  // 获取图标配置
  const iconConfig = BOOK_ICONS.find((icon) => icon.id === book.icon)

  // 动态导入 lucide-react 图标
  const IconComponent = iconConfig?.component ?? Folder
  return (
    <Card
      className={cn(
        'group cursor-pointer transition-all duration-200 hover:shadow-lg',
        isSortingMode && !isDragging && !isDefault && 'animate-shake',
        isSortingMode && !isDragging && 'cursor-grab hover:cursor-grabbing',
        isDragging && 'opacity-50 cursor-grabbing scale-105 z-10',
        !isSortingMode && !onClick && 'cursor-default'
      )}
      onClick={onClick}
      {...attributes}
      {...listeners}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4 flex-1">
            {/* 图标 */}
            <div className="shrink-0">
              <div className="w-14 h-14 rounded-lg bg-primary/10 flex items-center justify-center">
                <IconComponent className="w-7 h-7 text-primary" />
              </div>
            </div>

            {/* 内容 */}
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-foreground truncate">
                {book.title}
              </h3>
              {book.description && (
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {book.description}
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-2">
                {book.recordCount} 条记录
              </p>
            </div>
          </div>

          {/* 操作菜单 */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                onClick={(e) => e.stopPropagation()}
                aria-label={`操作：${book.title}`}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation()
                  onEdit?.()
                }}
              >
                编辑
              </DropdownMenuItem>
              {!isDefault && (
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={(e) => {
                    e.stopPropagation()
                    onDelete?.()
                  }}
                >
                  删除
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  )
}
