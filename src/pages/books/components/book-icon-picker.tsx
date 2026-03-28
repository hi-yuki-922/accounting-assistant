/**
 * 图标选择器组件
 * 提供预设图标选项供用户选择
 */

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
  <div className="grid grid-cols-5 gap-3 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
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
            'hover:bg-white dark:hover:bg-gray-800',
            isSelected
              ? 'bg-blue-600 text-white ring-2 ring-blue-600 ring-offset-2 dark:ring-offset-gray-900'
              : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400'
          )}
          title={icon.name}
        >
          <IconComponent className="w-5 h-5" />
        </button>
      )
    })}
  </div>
)
