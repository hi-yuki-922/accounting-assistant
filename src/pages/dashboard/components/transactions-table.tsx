import { MoreHorizontalIcon } from 'lucide-react'
import * as React from 'react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { STATUS_LABELS } from '@/lib/constants'
import { formatCurrency, formatDate } from '@/lib/formatters'
import { cn } from '@/lib/utils'
import type { TransactionRecord } from '@/types/dashboard'

interface TransactionsTableProps {
  data: TransactionRecord[]
  className?: string
}

const getStatusBadgeVariant = (status: TransactionRecord['status']) => {
  switch (status) {
    case 'completed': {
      return 'default'
    }
    case 'pending': {
      return 'secondary'
    }
    case 'cancelled': {
      return 'destructive'
    }
    default: {
      return 'outline'
    }
  }
}

const getTypeBadgeVariant = (type: TransactionRecord['type']) =>
  type === 'income' ? 'default' : 'destructive'

const getTypeBadgeText = (type: TransactionRecord['type']) =>
  type === 'income' ? '收入' : '支出'

export const TransactionsTable = ({
  data,
  className,
}: TransactionsTableProps) => (
  <Card className={cn('', className)}>
    <CardHeader>
      <CardTitle>最近交易</CardTitle>
    </CardHeader>
    <CardContent>
      <ScrollArea className="h-[350px] w-full sm:h-[400px]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs sm:text-sm">日期</TableHead>
              <TableHead className="hidden sm:table-cell">类型</TableHead>
              <TableHead>分类</TableHead>
              <TableHead>金额</TableHead>
              <TableHead className="hidden sm:table-cell">状态</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <div className="font-medium text-xs sm:text-sm">
                      {formatDate(transaction.date, 'short')}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  <Badge
                    variant={getTypeBadgeVariant(transaction.type)}
                    className="text-xs"
                  >
                    {getTypeBadgeText(transaction.type)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 sm:gap-3">
                    <Avatar className="h-6 w-6 sm:h-8 sm:w-8">
                      <AvatarImage
                        src={transaction.avatar}
                        alt={transaction.category}
                      />
                      <AvatarFallback className="text-[10px] sm:text-xs">
                        {transaction.category.slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="font-medium text-xs sm:text-sm">
                        {transaction.category}
                      </span>
                      <span className="text-[10px] sm:text-sm text-muted-foreground line-clamp-1">
                        {transaction.description}
                      </span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div
                    className={cn(
                      'font-semibold text-xs sm:text-sm',
                      transaction.type === 'income'
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400'
                    )}
                  >
                    {transaction.type === 'income' ? '+' : '-'}
                    {formatCurrency(transaction.amount)}
                  </div>
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  <Badge
                    variant={getStatusBadgeVariant(transaction.status)}
                    className="text-xs"
                  >
                    {STATUS_LABELS[transaction.status].label}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon-sm">
                    <MoreHorizontalIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="sr-only">更多选项</span>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
    </CardContent>
  </Card>
)
