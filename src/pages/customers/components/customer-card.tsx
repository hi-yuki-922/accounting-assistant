/**
 * 客户卡片组件
 * 展示客户姓名、分类标签、电话、操作按钮
 */

import { Edit, Trash2, Phone } from 'lucide-react'

import type { Customer, CustomerCategory } from '@/api/commands/customer/type'
import { CUSTOMER_CATEGORY_LABELS } from '@/api/commands/customer/type'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export type CustomerCardProps = {
  customer: Customer
  onEdit: (customer: Customer) => void
  onDelete: (customer: Customer) => void
}

/** 分类对应的 Badge 变体颜色 */
const CATEGORY_VARIANT: Record<
  CustomerCategory,
  'default' | 'secondary' | 'outline' | 'destructive'
> = {
  Retailer: 'default',
  Supplier: 'secondary',
}

export const CustomerCard: React.FC<CustomerCardProps> = ({
  customer,
  onEdit,
  onDelete,
}) => (
  <Card className="group hover:shadow-md transition-shadow">
    <CardContent className="p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          {/* 姓名 + 分类 */}
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-base truncate">
              {customer.name}
            </h3>
            <Badge variant={CATEGORY_VARIANT[customer.category]}>
              {CUSTOMER_CATEGORY_LABELS[customer.category]}
            </Badge>
          </div>

          {/* 电话 */}
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-2">
            <Phone className="h-3.5 w-3.5" />
            <span>{customer.phone}</span>
          </div>

          {/* 备注（如有） */}
          {customer.remark && (
            <p className="text-xs text-muted-foreground mt-2 truncate">
              {customer.remark}
            </p>
          )}
        </div>

        {/* 操作按钮 */}
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity shrink-0">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => onEdit(customer)}
            aria-label={`编辑：${customer.name}`}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => onDelete(customer)}
            aria-label={`删除：${customer.name}`}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </div>
    </CardContent>
  </Card>
)
