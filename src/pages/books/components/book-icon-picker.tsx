/**
 * 图标选择器组件
 * 提供预设图标选项供用户选择
 */

import React from 'react'

import { BOOK_ICONS } from '@/config/book-icons'
import type { BookIcon } from '@/config/book-icons'
import { cn } from '@/lib/utils'

export interface BookIconPickerProps {
  /** 当前选中的图标 */
  selectedIcon?: string
  /** 选择图标回调 */
  onSelectIcon: (icon: BookIcon) => void
}

export const BookIconPicker: React.FC<BookIconPickerProps> = ({
  selectedIcon,
  onSelectIcon,
}) => (
  <div className="grid grid-cols-5 gap-3 p-4 bg-muted rounded-lg">
    {BOOK_ICONS.map((icon) => {
      const IconComponent = icon.component
      const isSelected = selectedIcon === icon.id

      return (
        <button
          key={icon.id}
          type="button"
          onClick={() => onSelectIcon(icon)}
          className={cn(
            'w-12 h-12 rounded-lg flex items-center justify-center transition-all duration-200',
            'hover:bg-accent',
            isSelected
              ? 'bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2'
              : 'bg-card text-muted-foreground'
          )}
          title={icon.name}
        >
          <IconComponent className="w-5 h-5" />
        </button>
      )
    })}
  </div>
)
