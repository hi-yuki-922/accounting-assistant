/**
 * 订单任务看板组件
 * 五列布局（320px 固定列宽，横向滚动）+ 菜单栏
 */

import { RefreshCw } from 'lucide-react'
import { useState } from 'react'

import type { Order } from '@/api/commands/order/type'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { formatDate } from '@/lib/formatters'

import { BoardColumnView } from './board-column'
import { useOrderBoard } from './use-order-board'
import type { DateRange } from './use-order-board'

export type OrderTaskBoardProps = {
  onCardClick: (order: Order) => void
}

/** 获取今天的日期 */
function todayDate(): Date {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

/** Date -> YYYY-MM-DD */
function formatDateStr(d: Date): string {
  return d.toISOString().slice(0, 10)
}

/** 日期范围限制 7 天 */
const MAX_RANGE_DAYS = 7

export const OrderTaskBoard: React.FC<OrderTaskBoardProps> = ({
  onCardClick,
}) => {
  const { columns, loading, dateRange, setDateRange, refreshAll } =
    useOrderBoard()

  // 日期选择器状态
  const [calendarOpen, setCalendarOpen] = useState(false)
  const [rangeFrom, setRangeFrom] = useState<Date | undefined>(todayDate())
  const [rangeTo, setRangeTo] = useState<Date | undefined>(todayDate())

  /** 处理日期选择 */
  const handleCalendarSelect = (date: Date | undefined) => {
    if (!date) {
      return
    }

    let newFrom: Date
    let newTo: Date

    if (!rangeFrom || (rangeFrom && rangeTo && rangeFrom !== rangeTo)) {
      // 开始新的选择
      newFrom = date
      newTo = date
    } else {
      // 已有 from，选择 to
      if (date < rangeFrom) {
        newFrom = date
        newTo = rangeFrom
      } else {
        newFrom = rangeFrom
        newTo = date
      }
      // 限制最大 7 天
      const diffMs = newTo.getTime() - newFrom.getTime()
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
      if (diffDays >= MAX_RANGE_DAYS) {
        newTo = new Date(
          newFrom.getTime() + (MAX_RANGE_DAYS - 1) * 24 * 60 * 60 * 1000
        )
      }
    }

    setRangeFrom(newFrom)
    setRangeTo(newTo)

    // 如果选好了范围，应用并关闭
    if (newFrom && newTo && newFrom !== rangeFrom) {
      const newRange: DateRange = {
        from: formatDateStr(newFrom),
        to: formatDateStr(newTo),
      }
      setDateRange(newRange)
      setCalendarOpen(false)
    }
  }

  /** 快捷选择：今天 */
  const setToday = () => {
    const today = todayDate()
    setRangeFrom(today)
    setRangeTo(today)
    setDateRange({ from: formatDateStr(today), to: formatDateStr(today) })
    setCalendarOpen(false)
  }

  /** 快捷选择：近 3 天 */
  const setLast3Days = () => {
    const to = todayDate()
    const from = new Date(to.getTime() - 2 * 24 * 60 * 60 * 1000)
    setRangeFrom(from)
    setRangeTo(to)
    setDateRange({ from: formatDateStr(from), to: formatDateStr(to) })
    setCalendarOpen(false)
  }

  /** 快捷选择：近 7 天 */
  const setLast7Days = () => {
    const to = todayDate()
    const from = new Date(to.getTime() - 6 * 24 * 60 * 60 * 1000)
    setRangeFrom(from)
    setRangeTo(to)
    setDateRange({ from: formatDateStr(from), to: formatDateStr(to) })
    setCalendarOpen(false)
  }

  // 日期显示文本
  const dateDisplayText =
    dateRange.from === dateRange.to
      ? formatDate(dateRange.from, 'short')
      : `${formatDate(dateRange.from, 'short')} ~ ${formatDate(dateRange.to, 'short')}`

  return (
    <div className="absolute inset-0 flex flex-col overflow-hidden">
      {/* 菜单栏 */}
      <div className="flex items-center justify-between border-b border-border px-3 py-2">
        <div className="flex items-center gap-2">
          <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="text-xs">
                {dateDisplayText}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-3 space-y-2" align="start">
              <Calendar
                mode="single"
                selected={rangeFrom}
                onSelect={handleCalendarSelect}
                numberOfMonths={1}
              />
              <div className="flex gap-1.5 pt-1 border-t border-border">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs flex-1"
                  onClick={setToday}
                >
                  今天
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs flex-1"
                  onClick={setLast3Days}
                >
                  近 3 天
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs flex-1"
                  onClick={setLast7Days}
                >
                  近 7 天
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={refreshAll}
          disabled={loading}
        >
          <RefreshCw
            className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`}
          />
        </Button>
      </div>

      {/* 五列看板 */}
      <div className="flex min-h-0 flex-1 overflow-x-auto overflow-y-hidden">
        {columns.map((column) => (
          <BoardColumnView
            key={column.key}
            column={column}
            onCardClick={onCardClick}
          />
        ))}
      </div>
    </div>
  )
}
