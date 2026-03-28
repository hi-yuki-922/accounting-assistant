/**
 * 记录筛选器组件
 * 提供时间范围、类型、渠道、状态筛选
 */

import { format } from 'date-fns'
import { Calendar as CalendarIcon, Filter } from 'lucide-react'

import {
  AccountingType,
  AccountingChannel,
  AccountingRecordState,
} from '@/api/commands/accounting'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Label } from '@/components/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

export type RecordFilterProps = {
  /** 开始时间 */
  startTime?: Date | null
  /** 结束时间 */
  endTime?: Date | null
  /** 记账类型 */
  accountingType?: AccountingType
  /** 记账渠道 */
  channel?: AccountingChannel
  /** 记录状态 */
  state?: AccountingRecordState
  /** 筛选变更回调 */
  onChange: (filters: {
    startTime?: Date | null
    endTime?: Date | null
    accountingType?: AccountingType
    channel?: AccountingChannel
    state?: AccountingRecordState
  }) => void
}

export const RecordFilter: React.FC<RecordFilterProps> = ({
  startTime,
  endTime,
  accountingType,
  channel,
  state,
  onChange,
}) => {
  const handleStartTimeChange = (date: Date | undefined) => {
    onChange({ startTime: date || null })
  }

  const handleEndTimeChange = (date: Date | undefined) => {
    onChange({ endTime: date || null })
  }

  const handleReset = () => {
    onChange({
      startTime: null,
      endTime: null,
      accountingType: undefined,
      channel: undefined,
      state: undefined,
    })
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 mb-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Filter className="w-5 h-5 text-gray-500" />
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            筛选条件
          </h3>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        {/* 开始时间 */}
        <div className="space-y-2">
          <Label htmlFor="start-time">开始时间</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="start-time"
                variant="outline"
                className={cn(
                  'w-full justify-start text-left font-normal',
                  !startTime && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {startTime ? format(startTime, 'PPP') : <span>选择日期</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={startTime || undefined}
                onSelect={handleStartTimeChange}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* 结束时间 */}
        <div className="space-y-2">
          <Label htmlFor="end-time">结束时间</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="end-time"
                variant="outline"
                className={cn(
                  'w-full justify-start text-left font-normal',
                  !endTime && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {endTime ? format(endTime, 'PPP') : <span>选择日期</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={endTime || undefined}
                onSelect={handleEndTimeChange}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* 记账类型 */}
        <div className="space-y-2">
          <Label htmlFor="accounting-type">类型</Label>
          <Select
            value={accountingType || 'all'}
            onValueChange={(value) =>
              onChange({
                accountingType:
                  value === 'all' ? undefined : (value as AccountingType),
              })
            }
          >
            <SelectTrigger id="accounting-type">
              <SelectValue placeholder="全部" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部</SelectItem>
              <SelectItem value={AccountingType.Income}>收入</SelectItem>
              <SelectItem value={AccountingType.Expenditure}>支出</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* 记账渠道 */}
        <div className="space-y-2">
          <Label htmlFor="channel">渠道</Label>
          <Select
            value={channel || 'all'}
            onValueChange={(value) =>
              onChange({
                channel:
                  value === 'all' ? undefined : (value as AccountingChannel),
              })
            }
          >
            <SelectTrigger id="channel">
              <SelectValue placeholder="全部" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部</SelectItem>
              <SelectItem value={AccountingChannel.Cash}>现金</SelectItem>
              <SelectItem value={AccountingChannel.Wechat}>微信</SelectItem>
              <SelectItem value={AccountingChannel.AliPay}>支付宝</SelectItem>
              <SelectItem value={AccountingChannel.BankCard}>银行卡</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* 记录状态 */}
        <div className="space-y-2">
          <Label htmlFor="state">状态</Label>
          <Select
            value={state || 'all'}
            onValueChange={(value) =>
              onChange({
                state:
                  value === 'all'
                    ? undefined
                    : (value as AccountingRecordState),
              })
            }
          >
            <SelectTrigger id="state">
              <SelectValue placeholder="全部" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部</SelectItem>
              <SelectItem value={AccountingRecordState.PendingPosting}>
                待过账
              </SelectItem>
              <SelectItem value={AccountingRecordState.Posted}>
                已过账
              </SelectItem>
              {/*<SelectItem value={AccountingRecordState.Cancelled}>*/}
              {/*  已取消*/}
              {/*</SelectItem>*/}
            </SelectContent>
          </Select>
        </div>

        {/* 重置按钮 */}
        <div className="flex items-end">
          <Button variant="outline" className="w-full" onClick={handleReset}>
            重置筛选
          </Button>
        </div>
      </div>
    </div>
  )
}
