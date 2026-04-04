/**
 * 编辑记账记录对话框组件
 */

import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { Calendar as CalendarIcon } from 'lucide-react'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'

import { accounting } from '@/api/commands/accounting'
import type { RecordWithCountDto } from '@/api/commands/accounting-book/type'
import {
  ACCOUNTING_CHANNEL_DISPLAY_TEXT,
  ACCOUNTING_TYPE_DISPLAY_TEXT,
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

type EditRecordDialogProps = {
  /** 是否打开对话框 */
  open: boolean
  /** 关闭回调 */
  onClose: () => void
  /** 操作成功回调 */
  onSuccess: () => void
  /** 要编辑的记录 */
  record: RecordWithCountDto
}

/** 将日期和时间组合为后端所需的格式 "YYYY-MM-DD HH:mm:ss" */
const formatRecordTime = (date: Date, time: string): string =>
  `${format(date, 'yyyy-MM-dd')} ${time}:00`

export const EditRecordDialog: React.FC<EditRecordDialogProps> = ({
  open,
  onClose,
  onSuccess,
  record,
}) => {
  const [title, setTitle] = useState('')
  const [amount, setAmount] = useState('')
  const [channel, setChannel] = useState('')
  const [date, setDate] = useState<Date>(new Date())
  const [time, setTime] = useState('00:00')
  const [remark, setRemark] = useState('')
  const [loading, setLoading] = useState(false)

  // 编辑模式时初始化表单数据
  useEffect(() => {
    if (open && record) {
      setTitle(record.title)
      setAmount(String(record.amount))
      setChannel(record.channel)
      setRemark(record.remark || '')

      // 解析记录时间
      const recordDate = new Date(record.recordTime)
      setDate(recordDate)
      setTime(format(recordDate, 'HH:mm'))
    }
  }, [open, record])

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

    const result = await accounting.update({
      id: record.id,
      title: title.trim(),
      amount: amountNum,
      recordTime: formatRecordTime(date, time),
      remark: remark.trim() || null,
    })

    result.match(
      () => {
        toast.success('修改成功')
        onSuccess()
        onClose()
      },
      (error) => {
        toast.error(`修改失败：${error.message}`)
      }
    )

    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>编辑记录</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* 标题 */}
          <div className="space-y-2">
            <Label htmlFor="edit-title">
              标题 <span className="text-destructive">*</span>
            </Label>
            <Input
              id="edit-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="请输入标题"
            />
          </div>

          {/* 金额 */}
          <div className="space-y-2">
            <Label htmlFor="edit-amount">
              金额 <span className="text-destructive">*</span>
            </Label>
            <Input
              id="edit-amount"
              type="number"
              min={0.01}
              step={0.01}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="请输入金额"
            />
          </div>

          {/* 类型（只读显示） */}
          <div className="space-y-2">
            <Label>类型</Label>
            <div className="h-8 flex items-center text-sm text-muted-foreground border rounded-lg px-2.5 bg-muted/50">
              {ACCOUNTING_TYPE_DISPLAY_TEXT[record.accountingType] ||
                record.accountingType}
            </div>
          </div>

          {/* 渠道 */}
          <div className="space-y-2">
            <Label htmlFor="edit-channel">渠道</Label>
            <Select value={channel} onValueChange={setChannel}>
              <SelectTrigger id="edit-channel" className="w-full">
                <SelectValue placeholder="选择渠道" />
              </SelectTrigger>
              <SelectContent>
                {(
                  Object.keys(
                    ACCOUNTING_CHANNEL_DISPLAY_TEXT
                  ) as (keyof typeof ACCOUNTING_CHANNEL_DISPLAY_TEXT)[]
                ).map((key) => (
                  <SelectItem key={key} value={key}>
                    {ACCOUNTING_CHANNEL_DISPLAY_TEXT[key]}
                  </SelectItem>
                ))}
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
            <Label htmlFor="edit-time">时间</Label>
            <Input
              id="edit-time"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </div>

          {/* 备注 */}
          <div className="space-y-2">
            <Label htmlFor="edit-remark">备注</Label>
            <Textarea
              id="edit-remark"
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
            {loading ? '保存中...' : '保存'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
