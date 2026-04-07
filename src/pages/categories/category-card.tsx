/**
 * 品类卡片组件
 * 展示品类名称、关联账本、操作按钮
 */

import { BookOpen, Edit, Trash2 } from 'lucide-react'

import type { Category } from '@/api/commands/category/type'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

const DEFAULT_CATEGORY_NAME = '未分类'

export type CategoryCardProps = {
  category: Category
  bookMap: Record<number, string>
  onEdit: (category: Category) => void
  onDelete: (category: Category) => void
}

export const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  bookMap,
  onEdit,
  onDelete,
}) => {
  const isDefault = category.name === DEFAULT_CATEGORY_NAME
  const sellBookName = bookMap[category.sellBookId] || `#${category.sellBookId}`
  const purchaseBookName =
    bookMap[category.purchaseBookId] || `#${category.purchaseBookId}`

  return (
    <Card className="group hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-base truncate">
                {category.name}
              </h3>
              {isDefault && <Badge variant="secondary">默认</Badge>}
            </div>

            <div className="flex flex-col gap-1 text-sm text-muted-foreground mt-2">
              <div className="flex items-center gap-1.5">
                <BookOpen className="h-3.5 w-3.5" />
                <span>销售：{sellBookName}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <BookOpen className="h-3.5 w-3.5" />
                <span>进货：{purchaseBookName}</span>
              </div>
            </div>

            {category.remark && (
              <p className="text-xs text-muted-foreground mt-2 truncate">
                {category.remark}
              </p>
            )}
          </div>

          <div className="flex gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity shrink-0">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => onEdit(category)}
              aria-label={`编辑：${category.name}`}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => onDelete(category)}
              aria-label={`删除：${category.name}`}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
