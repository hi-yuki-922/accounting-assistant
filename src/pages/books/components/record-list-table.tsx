/**
 * 记录列表表格组件
 * 展示账本内的记账记录
 */

import type { AccountingChannel } from '@/api/commands/accounting'
import {
  AccountingType,
  AccountingRecordState,
  ACCOUNTING_TYPE_DISPLAY_TEXT,
  ACCOUNTING_CHANNEL_DISPLAY_TEXT,
  ACCOUNTING_RECORD_STATE_DISPLAY_TEXT,
} from '@/api/commands/accounting'
import type { RecordWithCountDto } from '@/api/commands/accounting-book/type'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'

type RecordListTableProps = {
  /** 记录列表 */
  records: RecordWithCountDto[]
  /** 加载中状态 */
  loading?: boolean
}

const formatAmount = (amount: number, type: AccountingType): string => {
  const absAmount = Math.abs(amount)
  const sign = type === AccountingType.Income ? '+' : '-'
  return `${sign}${absAmount.toFixed(2)}`
}

const getAccountingTypeLabel = (type: AccountingType): string =>
  ACCOUNTING_TYPE_DISPLAY_TEXT[type] || '未知'

const getAccountingChannelLabel = (channel: AccountingChannel): string =>
  ACCOUNTING_CHANNEL_DISPLAY_TEXT[channel] || '未知'

const getAccountingRecordStateLabel = (state: AccountingRecordState): string =>
  ACCOUNTING_RECORD_STATE_DISPLAY_TEXT[state] || '未知'

const getStateBadgeVariant = (
  state: AccountingRecordState
): 'default' | 'secondary' | 'outline' => {
  switch (state) {
    case AccountingRecordState.PendingPosting: {
      return 'outline'
    }
    case AccountingRecordState.Posted: {
      return 'default'
    }
    default: {
      return 'default'
    }
  }
}

export const RecordListTable = ({
  records,
  loading = false,
}: RecordListTableProps) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">加载中...</div>
      </div>
    )
  }

  if (records.length === 0) {
    return null
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px]">时间</TableHead>
            <TableHead>标题</TableHead>
            <TableHead className="w-[100px]">类型</TableHead>
            <TableHead className="w-[100px]">金额</TableHead>
            <TableHead className="w-[100px]">渠道</TableHead>
            <TableHead className="w-[100px]">状态</TableHead>
            <TableHead className="w-[100px]">关联数</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {records.map((record) => (
            <TableRow key={record.id}>
              <TableCell className="text-sm text-gray-600 dark:text-gray-400">
                {new Date(record.recordTime).toLocaleString('zh-CN', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </TableCell>
              <TableCell className="font-medium">{record.title}</TableCell>
              <TableCell>
                <Badge variant="outline">
                  {getAccountingTypeLabel(record.accountingType)}
                </Badge>
              </TableCell>
              <TableCell
                className={cn(
                  'font-medium',
                  record.accountingType === AccountingType.Income
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                )}
              >
                {formatAmount(record.amount, record.accountingType)}
              </TableCell>
              <TableCell className="text-sm text-gray-600 dark:text-gray-400">
                {getAccountingChannelLabel(record.channel)}
              </TableCell>
              <TableCell>
                <Badge variant={getStateBadgeVariant(record.state)}>
                  {getAccountingRecordStateLabel(record.state)}
                </Badge>
              </TableCell>
              <TableCell className="text-sm text-gray-600 dark:text-gray-400">
                {record.relatedCount > 0 ? (
                  <span className="inline-flex items-center px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs">
                    {record.relatedCount}
                  </span>
                ) : (
                  '-'
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
