/**
 * 记录列表表格组件
 * 展示账本内的记账记录，支持排序、批量选中、冲账详情 HoverCard 等功能
 */

import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Pencil,
  Trash2,
  CheckCircle,
  ArrowLeftRight,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'

import type { AccountingChannel } from '@/api/commands/accounting'
import {
  AccountingType,
  AccountingRecordState,
  ACCOUNTING_TYPE_DISPLAY_TEXT,
  ACCOUNTING_CHANNEL_DISPLAY_TEXT,
  ACCOUNTING_RECORD_STATE_DISPLAY_TEXT,
} from '@/api/commands/accounting'
import { accountingBook } from '@/api/commands/accounting-book'
import type {
  RecordWithCountDto,
  RecordWriteOffDetails,
} from '@/api/commands/accounting-book/type'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card'
import { Spinner } from '@/components/ui/spinner'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  formatDate,
  formatRawAmount,
  formatSignedAmount,
} from '@/lib/formatters'
import { cn } from '@/lib/utils'

/** 表格组件属性 */
type RecordListTableProps = {
  /** 记录列表 */
  records: RecordWithCountDto[]
  /** 加载中状态 */
  loading?: boolean
  /** 选中的记录 ID 集合 */
  selectedIds: Set<number>
  /** 选中状态变更回调 */
  onSelectionChange: (ids: Set<number>) => void
  /** 排序字段 */
  sortField?: string
  /** 排序方向 */
  sortDirection?: 'asc' | 'desc'
  /** 排序变更回调 */
  onSortChange: (field: string, direction: 'asc' | 'desc') => void
  /** 编辑回调 */
  onEdit: (record: RecordWithCountDto) => void
  /** 删除回调 */
  onDelete: (record: RecordWithCountDto) => void
  /** 入账回调 */
  onPost: (record: RecordWithCountDto) => void
  /** 冲账回调 */
  onWriteOff: (record: RecordWithCountDto) => void
}

/** 判断是否为收入类型 */
const isIncomeType = (type: AccountingType): boolean =>
  type === AccountingType.Income || type === AccountingType.InvestmentIncome

/** 获取记账类型显示文本 */
const getAccountingTypeLabel = (type: AccountingType): string =>
  ACCOUNTING_TYPE_DISPLAY_TEXT[type] || '未知'

/** 获取记账渠道显示文本 */
const getAccountingChannelLabel = (channel: AccountingChannel): string =>
  ACCOUNTING_CHANNEL_DISPLAY_TEXT[channel] || '未知'

/** 获取记录状态显示文本 */
const getAccountingRecordStateLabel = (state: AccountingRecordState): string =>
  ACCOUNTING_RECORD_STATE_DISPLAY_TEXT[state] || '未知'

/** 获取状态 Badge 的 variant */
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

/** 获取类型 Badge 的样式 */
const getTypeBadgeStyle = (
  type: AccountingType
): {
  variant: 'default' | 'secondary' | 'outline' | 'destructive'
  className?: string
} => {
  switch (type) {
    case AccountingType.Income:
    case AccountingType.InvestmentIncome: {
      return { variant: 'destructive' }
    }
    case AccountingType.Expenditure:
    case AccountingType.InvestmentLoss: {
      return {
        variant: 'outline',
        className:
          'border-green-300 text-green-700 dark:border-green-700 dark:text-green-400',
      }
    }
    default: {
      return { variant: 'secondary' }
    }
  }
}

/** 判断记录是否可以勾选（仅待入账状态） */
const isSelectable = (record: RecordWithCountDto): boolean =>
  record.state === AccountingRecordState.PendingPosting

/** 排序图标组件 */
type SortIconProps = {
  field: string
  sortField?: string
  sortDirection?: 'asc' | 'desc'
}

const SortIcon = ({ field, sortField, sortDirection }: SortIconProps) => {
  if (sortField !== field) {
    return <ArrowUpDown className="ml-1 inline size-3.5 opacity-50" />
  }
  if (sortDirection === 'asc') {
    return <ArrowUp className="ml-1 inline size-3.5" />
  }
  return <ArrowDown className="ml-1 inline size-3.5" />
}

/** 可排序的表头单元格 */
type SortableTableHeadProps = {
  field: string
  sortField?: string
  sortDirection?: 'asc' | 'desc'
  onSortChange: (field: string, direction: 'asc' | 'desc') => void
  className?: string
  children: React.ReactNode
}

const SortableTableHead = ({
  field,
  sortField,
  sortDirection,
  onSortChange,
  className,
  children,
}: SortableTableHeadProps) => {
  const handleClick = () => {
    if (sortField === field) {
      // 同一字段：切换排序方向
      onSortChange(field, sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      // 新字段：默认升序
      onSortChange(field, 'asc')
    }
  }

  return (
    <TableHead
      className={cn('cursor-pointer select-none', className)}
      onClick={handleClick}
    >
      <span className="inline-flex items-center gap-0.5">
        {children}
        <SortIcon
          field={field}
          sortField={sortField}
          sortDirection={sortDirection}
        />
      </span>
    </TableHead>
  )
}

/** 冲账详情 HoverCard 组件 */
type WriteOffHoverCardProps = {
  record: RecordWithCountDto
  children: React.ReactNode
}

const WriteOffHoverCard = ({ record, children }: WriteOffHoverCardProps) => {
  const cacheRef = useRef<Map<number, RecordWriteOffDetails>>(new Map())
  const [details, setDetails] = useState<RecordWriteOffDetails | null>(null)
  const [loading, setLoading] = useState(false)
  const [loaded, setLoaded] = useState(false)

  // 当关联数变化时清除缓存，确保新冲账记录能被加载
  useEffect(() => {
    setLoaded(false)
    setDetails(null)
    cacheRef.current.delete(record.id)
  }, [record.id, record.relatedCount])

  const handleOpenChange = useCallback(
    async (open: boolean) => {
      if (!open || loaded) {
        return
      }

      // 检查缓存
      const cached = cacheRef.current.get(record.id)
      if (cached) {
        setDetails(cached)
        setLoaded(true)
        return
      }

      setLoading(true)
      const result = await accountingBook.getRecordWriteOffDetails(record.id)
      setLoading(false)

      if (result.isErr()) {
        toast.error('加载冲账详情失败', {
          description: result.error.message,
        })
        return
      }

      const data = result.value
      // Decimal 字段从字符串转换为数字
      const normalizedData = {
        ...data,
        originalAmount: Number(data.originalAmount),
        writeOffRecords: data.writeOffRecords.map((wo) => ({
          ...wo,
          amount: Number(wo.amount),
        })),
      }
      cacheRef.current.set(record.id, normalizedData)
      setDetails(normalizedData)
      setLoaded(true)
    },
    [record.id, loaded]
  )

  return (
    <HoverCard onOpenChange={handleOpenChange} openDelay={200}>
      <HoverCardTrigger asChild>
        <span className="cursor-pointer underline decoration-dotted underline-offset-4">
          {children}
        </span>
      </HoverCardTrigger>
      <HoverCardContent className="w-72 p-3" side="left">
        {loading ? (
          <div className="flex items-center justify-center py-4">
            <Spinner className="size-5" />
            <span className="ml-2 text-sm text-muted-foreground">
              加载中...
            </span>
          </div>
        ) : (details ? (
          <div className="space-y-3">
            {/* 原始金额 */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">原始金额</span>
              <span className="font-medium">
                {formatRawAmount(details.originalAmount)}
              </span>
            </div>

            {/* 冲账记录列表 */}
            {details.writeOffRecords.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs font-medium text-muted-foreground">
                  冲账记录
                </div>
                <div className="space-y-1.5">
                  {details.writeOffRecords.map((wo) => (
                    <div
                      key={wo.id}
                      className="flex items-center justify-between rounded-md bg-muted/50 px-2 py-1.5 text-sm"
                    >
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs text-muted-foreground">
                          {formatDate(wo.recordTime, 'datetime-compact')}
                        </span>
                        {wo.remark && (
                          <span className="text-xs text-muted-foreground">
                            {wo.remark}
                          </span>
                        )}
                      </div>
                      <span
                        className={cn(
                          'font-medium',
                          wo.amount > 0
                            ? 'text-red-600 dark:text-red-400'
                            : 'text-green-600 dark:text-green-400'
                        )}
                      >
                        {wo.amount > 0
                          ? `+${formatRawAmount(wo.amount)}`
                          : formatRawAmount(wo.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 净合计 */}
            <div className="flex items-center justify-between border-t pt-2">
              <span className="text-sm font-medium">净合计</span>
              <span
                className={cn(
                  'font-semibold',
                  record.netAmount === 0
                    ? 'text-muted-foreground'
                    : isIncomeType(record.accountingType)
                      ? 'text-red-600 dark:text-red-400'
                      : 'text-green-600 dark:text-green-400'
                )}
              >
                {formatRawAmount(record.netAmount)}
              </span>
            </div>
          </div>
        ) : null)}
      </HoverCardContent>
    </HoverCard>
  )
}

/** 金额单元格 */
type AmountCellProps = {
  record: RecordWithCountDto
}

const AmountCell = ({ record }: AmountCellProps) => {
  const { netAmount, accountingType, relatedCount } = record

  // 净金额为 0 时灰色文字，收入红色，支出绿色
  const amountClassName = cn(
    'font-medium',
    netAmount === 0
      ? 'text-muted-foreground'
      : (isIncomeType(accountingType)
        ? 'text-red-600 dark:text-red-400'
        : 'text-green-600 dark:text-green-400')
  )

  const formattedAmount = formatSignedAmount(
    netAmount,
    isIncomeType(accountingType)
  )

  // 有关联冲账记录时显示 HoverCard
  if (relatedCount > 0) {
    return (
      <WriteOffHoverCard record={record}>
        <span className={amountClassName}>{formattedAmount}</span>
      </WriteOffHoverCard>
    )
  }

  return <span className={amountClassName}>{formattedAmount}</span>
}

/** 操作列 */
type ActionCellProps = {
  record: RecordWithCountDto
  onEdit: (record: RecordWithCountDto) => void
  onDelete: (record: RecordWithCountDto) => void
  onPost: (record: RecordWithCountDto) => void
  onWriteOff: (record: RecordWithCountDto) => void
}

const ActionCell = ({
  record,
  onEdit,
  onDelete,
  onPost,
  onWriteOff,
}: ActionCellProps) => {
  const isPending = record.state === AccountingRecordState.PendingPosting
  const isPosted = record.state === AccountingRecordState.Posted
  const isWriteOff = record.accountingType === AccountingType.WriteOff

  if (isPending) {
    return (
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="xs"
          onClick={() => onEdit(record)}
          title="编辑"
        >
          <Pencil className="size-3" />
          编辑
        </Button>
        <Button
          variant="ghost"
          size="xs"
          onClick={() => onDelete(record)}
          title="删除"
        >
          <Trash2 className="size-3" />
          删除
        </Button>
        <Button
          variant="ghost"
          size="xs"
          onClick={() => onPost(record)}
          title="入账"
        >
          <CheckCircle className="size-3" />
          入账
        </Button>
      </div>
    )
  }

  if (isPosted && !isWriteOff) {
    return (
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="xs"
          onClick={() => onWriteOff(record)}
          title="冲账"
        >
          <ArrowLeftRight className="size-3" />
          冲账
        </Button>
      </div>
    )
  }

  return null
}

/** 主表格组件 */
export const RecordListTable = ({
  records,
  loading = false,
  selectedIds,
  onSelectionChange,
  sortField,
  sortDirection,
  onSortChange,
  onEdit,
  onDelete,
  onPost,
  onWriteOff,
}: RecordListTableProps) => {
  // 计算当前页可勾选的记录
  const selectableRecords = useMemo(
    () => records.filter(isSelectable),
    [records]
  )

  // 全选状态：所有可勾选记录都被选中时为 true
  const isAllSelected = useMemo(
    () =>
      selectableRecords.length > 0 &&
      selectableRecords.every((r) => selectedIds.has(r.id)),
    [selectableRecords, selectedIds]
  )

  // 部分选中状态
  const isPartialSelected = useMemo(
    () =>
      !isAllSelected && selectableRecords.some((r) => selectedIds.has(r.id)),
    [isAllSelected, selectableRecords, selectedIds]
  )

  /** 全选/取消全选 */
  const handleSelectAll = useCallback(() => {
    if (isAllSelected) {
      // 取消选择当前页所有可勾选记录
      const newIds = new Set(selectedIds)
      for (const r of selectableRecords) {
        newIds.delete(r.id)
      }
      onSelectionChange(newIds)
    } else {
      // 选中当前页所有可勾选记录
      const newIds = new Set(selectedIds)
      for (const r of selectableRecords) {
        newIds.add(r.id)
      }
      onSelectionChange(newIds)
    }
  }, [isAllSelected, selectedIds, selectableRecords, onSelectionChange])

  /** 单条记录勾选 */
  const handleSelectRecord = useCallback(
    (recordId: number, checked: boolean) => {
      const newIds = new Set(selectedIds)
      if (checked) {
        newIds.add(recordId)
      } else {
        newIds.delete(recordId)
      }
      onSelectionChange(newIds)
    },
    [selectedIds, onSelectionChange]
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner className="size-6" />
        <span className="ml-2 text-muted-foreground">加载中...</span>
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
            {/* 复选框列 */}
            <TableHead className="w-[40px] px-3">
              <Checkbox
                checked={
                  isAllSelected || (isPartialSelected && 'indeterminate')
                }
                onCheckedChange={handleSelectAll}
                aria-label="全选"
              />
            </TableHead>

            {/* 时间列 - 可排序 */}
            <SortableTableHead
              field="recordTime"
              sortField={sortField}
              sortDirection={sortDirection}
              onSortChange={onSortChange}
              className="w-[180px]"
            >
              时间
            </SortableTableHead>

            {/* 标题列 */}
            <TableHead>标题</TableHead>

            {/* 类型列 */}
            <TableHead className="w-[100px]">类型</TableHead>

            {/* 金额列 */}
            <TableHead className="w-[120px]">金额</TableHead>

            {/* 渠道列 - 可排序 */}
            <SortableTableHead
              field="channel"
              sortField={sortField}
              sortDirection={sortDirection}
              onSortChange={onSortChange}
              className="w-[100px]"
            >
              渠道
            </SortableTableHead>

            {/* 状态列 - 可排序 */}
            <SortableTableHead
              field="state"
              sortField={sortField}
              sortDirection={sortDirection}
              onSortChange={onSortChange}
              className="w-[100px]"
            >
              状态
            </SortableTableHead>

            {/* 关联数列 - 可排序 */}
            <SortableTableHead
              field="relatedCount"
              sortField={sortField}
              sortDirection={sortDirection}
              onSortChange={onSortChange}
              className="w-[80px]"
            >
              关联数
            </SortableTableHead>

            {/* 操作列 */}
            <TableHead className="w-[200px]">操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {records.map((record) => {
            const selectable = isSelectable(record)

            return (
              <TableRow key={record.id}>
                {/* 复选框 */}
                <TableCell className="px-3">
                  <Checkbox
                    checked={selectable ? selectedIds.has(record.id) : false}
                    disabled={!selectable}
                    onCheckedChange={(checked) =>
                      handleSelectRecord(record.id, !!checked)
                    }
                    aria-label={`选择记录 ${record.title}`}
                  />
                </TableCell>

                {/* 时间 */}
                <TableCell className="text-sm text-muted-foreground">
                  {formatDate(record.recordTime, 'datetime-compact')}
                </TableCell>

                {/* 标题 */}
                <TableCell className="font-medium">{record.title}</TableCell>

                {/* 类型 */}
                <TableCell>
                  <Badge
                    variant={getTypeBadgeStyle(record.accountingType).variant}
                    className={
                      getTypeBadgeStyle(record.accountingType).className
                    }
                  >
                    {getAccountingTypeLabel(record.accountingType)}
                  </Badge>
                </TableCell>

                {/* 金额 */}
                <TableCell>
                  <AmountCell record={record} />
                </TableCell>

                {/* 渠道 */}
                <TableCell className="text-sm text-muted-foreground">
                  {getAccountingChannelLabel(record.channel)}
                </TableCell>

                {/* 状态 */}
                <TableCell>
                  <Badge variant={getStateBadgeVariant(record.state)}>
                    {getAccountingRecordStateLabel(record.state)}
                  </Badge>
                </TableCell>

                {/* 关联数 */}
                <TableCell className="text-sm text-muted-foreground">
                  {record.relatedCount > 0 ? (
                    <span className="inline-flex items-center px-2 py-1 rounded-full bg-secondary text-secondary-foreground text-xs">
                      {record.relatedCount}
                    </span>
                  ) : (
                    '-'
                  )}
                </TableCell>

                {/* 操作 */}
                <TableCell>
                  <ActionCell
                    record={record}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onPost={onPost}
                    onWriteOff={onWriteOff}
                  />
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
