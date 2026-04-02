/**
 * 商品卡片组件
 * 展示商品名称、分类、单位、参考价、操作按钮
 */

import { Edit, Trash2 } from 'lucide-react'

import type { Product } from '@/api/commands/product/type'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export type ProductCardProps = {
  product: Product
  onEdit: (product: Product) => void
  onDelete: (product: Product) => void
}

/** 格式化价格显示 */
const formatPrice = (price?: number) => {
  if (price == null) {
    return '-'
  }
  return `¥${price.toFixed(2)}`
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onEdit,
  onDelete,
}) => (
  <Card className="group hover:shadow-md transition-shadow">
    <CardContent className="p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          {/* 名称 + 分类 */}
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-base truncate">{product.name}</h3>
            {product.category && (
              <Badge variant="secondary">{product.category}</Badge>
            )}
          </div>

          {/* 单位 */}
          <div className="text-sm text-muted-foreground mt-1">
            单位：{product.unit}
          </div>

          {/* 参考价 */}
          <div className="flex gap-4 mt-2 text-sm">
            <div>
              <span className="text-muted-foreground">售价：</span>
              <span className="font-medium text-foreground">
                {formatPrice(product.defaultSellPrice)}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">进价：</span>
              <span className="font-medium text-foreground">
                {formatPrice(product.defaultPurchasePrice)}
              </span>
            </div>
          </div>

          {/* 备注（如有） */}
          {product.remark && (
            <p className="text-xs text-muted-foreground mt-2 truncate">
              {product.remark}
            </p>
          )}
        </div>

        {/* 操作按钮 */}
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity shrink-0">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => onEdit(product)}
            aria-label={`编辑：${product.name}`}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => onDelete(product)}
            aria-label={`删除：${product.name}`}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </div>
    </CardContent>
  </Card>
)
