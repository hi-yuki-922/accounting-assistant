/**
 * 添加记账记录对话框组件
 */

import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { Calendar as CalendarIcon } from 'lucide-react'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'

import { accounting } from '@/api/commands/accounting'
import {
  AccountingType,
  AccountingChannel,
  ACCOUNTING_TYPE_DISPLAY_TEXT,
  ACCOUNTING_CHANNEL_DISPLAY_TEXT,
} from '@/api/commands/accounting/enums'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
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
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

type AddRecordDialogProps = {
  /** 是否打开对话框 */
  open: boolean
  /** 关闭回调 */
  onClose: () => void
  /** 操作成功回调 */
  onSuccess: () => void
  /** 账本 ID */
  bookId: number
}

/** 获取当前时间的 HH:mm 格式字符串 */
const getCurrentTime = (): string => format(new Date(), 'HH:mm')

/** 将日期和时间组合为后端所需的格式 "YYYY-MM-DD HH:mm:ss" */
const formatRecordTime = (date: Date, time: string): string =>
  `${format(date, 'yyyy-MM-dd')} ${time}:00`

export const AddRecordDialog: React.FC<AddRecordDialogProps> = ({
  open,
  onClose,
  onSuccess,
  bookId,
}) => {
  const [title, setTitle] = useState('')
  const [amount, setAmount] = useState('')
  const [accountingType, setAccountingType] = useState<string>(
    AccountingType.Expenditure
  )
  const [channel, setChannel] = useState<string>(AccountingChannel.Unknown)
  const [date, setDate] = useState<Date>(new Date())
  const [time, setTime] = useState(getCurrentTime())
  const [remark, setRemark] = useState('')
  const [loading, setLoading] = useState(false)

  // 打开时重置表单
  useEffect(() => {
    if (open) {
      setTitle('')
      setAmount('')
      setAccountingType(AccountingType.Expenditure)
      setChannel(AccountingChannel.Unknown)
      setDate(new Date())
      setTime(getCurrentTime())
      setRemark('')
    }
  }, [open])

  const handleSubmit = async () => {
    // 验证标题
    if (!title.trim()) {
      toast.error('请输入标题')
      return
    }

    // 验证金额
    const amountNum = Number.parseFloat(amount)
    if (!amountNum || amountNum <= 0) {
      toast.error('金额必须大于 0')
      return
    }

    setLoading(true)

    const result = await accounting.add({
      title: title.trim(),
      amount: amountNum,
      recordTime: formatRecordTime(date, time),
      accountingType,
      channel,
      remark: remark.trim() || undefined,
      bookId,
    })

    result.match(
      () => {
        toast.success('添加成功')
        onSuccess()
        onClose()
      },
      (error) => {
        toast.error(`添加失败：${error.message}`)
      }
    )

    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>记一笔</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* 标题 */}
          <div className="space-y-2">
            <Label htmlFor="record-title">
              标题 <span className="text-red-500">*</span>
            </Label>
            <Input
              id="record-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="请输入标题"
            />
          </div>

          {/* 金额 */}
          <div className="space-y-2">
            <Label htmlFor="record-amount">
              金额 <span className="text-red-500">*</span>
            </Label>
            <Input
              id="record-amount"
              type="number"
              min={0.01}
              step={0.01}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="请输入金额"
            />
          </div>

          {/* 类型 */}
          <div className="space-y-2">
            <Label htmlFor="record-type">类型</Label>
            <Select value={accountingType} onValueChange={setAccountingType}>
              <SelectTrigger id="record-type" className="w-full">
                <SelectValue placeholder="选择类型" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={AccountingType.Income}>
                  {ACCOUNTING_TYPE_DISPLAY_TEXT[AccountingType.Income]}
                </SelectItem>
                <SelectItem value={AccountingType.Expenditure}>
                  {ACCOUNTING_TYPE_DISPLAY_TEXT[AccountingType.Expenditure]}
                </SelectItem>
                <SelectItem value={AccountingType.InvestmentIncome}>
                  {
                    ACCOUNTING_TYPE_DISPLAY_TEXT[
                      AccountingType.InvestmentIncome
                    ]
                  }
                </SelectItem>
                <SelectItem value={AccountingType.InvestmentLoss}>
                  {ACCOUNTING_TYPE_DISPLAY_TEXT[AccountingType.InvestmentLoss]}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 渠道 */}
          <div className="space-y-2">
            <Label htmlFor="record-channel">渠道</Label>
            <Select value={channel} onValueChange={setChannel}>
              <SelectTrigger id="record-channel" className="w-full">
                <SelectValue placeholder="选择渠道" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={AccountingChannel.Cash}>
                  {ACCOUNTING_CHANNEL_DISPLAY_TEXT[AccountingChannel.Cash]}
                </SelectItem>
                <SelectItem value={AccountingChannel.AliPay}>
                  {ACCOUNTING_CHANNEL_DISPLAY_TEXT[AccountingChannel.AliPay]}
                </SelectItem>
                <SelectItem value={AccountingChannel.Wechat}>
                  {ACCOUNTING_CHANNEL_DISPLAY_TEXT[AccountingChannel.Wechat]}
                </SelectItem>
                <SelectItem value={AccountingChannel.BankCard}>
                  {ACCOUNTING_CHANNEL_DISPLAY_TEXT[AccountingChannel.BankCard]}
                </SelectItem>
                <SelectItem value={AccountingChannel.Unknown}>
                  {ACCOUNTING_CHANNEL_DISPLAY_TEXT[AccountingChannel.Unknown]}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 日期选择 */}
          <div className="space-y-2">
            <Label>日期</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !date && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, 'yyyy-MM-dd') : <span>选择日期</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  locale={zhCN}
                  mode="single"
                  selected={date}
                  onSelect={(selected) => selected && setDate(selected)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* 时间 */}
          <div className="space-y-2">
            <Label htmlFor="record-time">时间</Label>
            <Input
              id="record-time"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </div>

          {/* 备注 */}
          <div className="space-y-2">
            <Label htmlFor="record-remark">备注</Label>
            <Textarea
              id="record-remark"
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              placeholder="请输入备注（可选）"
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            取消
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? '提交中...' : '确认添加'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
