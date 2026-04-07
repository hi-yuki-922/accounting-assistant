/**
 * 冲账对话框组件
 */

import { format } from 'date-fns'
import { useState, useEffect, useMemo } from 'react'
import { toast } from 'sonner'

import { accounting } from '@/api/commands/accounting'
import type { RecordWithCountDto } from '@/api/commands/accounting-book/type'
import {
  AccountingChannel,
  ACCOUNTING_CHANNEL_DISPLAY_TEXT,
} from '@/api/commands/accounting/enums'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { formatRawAmount } from '@/lib/formatters'
import { cn } from '@/lib/utils'

type WriteOffDialogProps = {
  /** 是否打开对话框 */
  open: boolean
  /** 关闭回调 */
  onClose: () => void
  /** 操作成功回调 */
  onSuccess: () => void
  /** 原始记录 */
  record: RecordWithCountDto
}

/** 获取当前时间的 "YYYY-MM-DD HH:mm:ss" 格式字符串 */
const getCurrentRecordTime = (): string =>
  format(new Date(), 'yyyy-MM-dd HH:mm:ss')

export const WriteOffDialog: React.FC<WriteOffDialogProps> = ({
  open,
  onClose,
  onSuccess,
  record,
}) => {
  const [writeOffAmount, setWriteOffAmount] = useState('')
  const [channel, setChannel] = useState<string>(record.channel)
  const [remark, setRemark] = useState('')
  const [loading, setLoading] = useState(false)

  // 打开时重置表单并设置默认值
  useEffect(() => {
    if (open) {
      setWriteOffAmount('')
      setChannel(record.channel)
      setRemark('')
    }
  }, [open, record.channel])

  // 实时计算冲账后净金额：当前可冲账金额 + 本次冲账金额
  const netAmount = useMemo(() => {
    const writeOffNum = Number.parseFloat(writeOffAmount) || 0
    return record.netAmount + writeOffNum
  }, [record.netAmount, writeOffAmount])

  // 冲账后净金额不能小于 0
  const isNetAmountInvalid = netAmount < 0

  const handleSubmit = async () => {
    const writeOffNum = Number.parseFloat(writeOffAmount)

    if (!writeOffAmount || Number.isNaN(writeOffNum)) {
      toast.error('请输入冲账金额')
      return
    }

    if (isNetAmountInvalid) {
      toast.error('冲账后净金额不能小于 0')
      return
    }

    setLoading(true)

    const result = await accounting.createWriteOff({
      originalRecordId: record.id,
      amount: writeOffNum,
      channel,
      remark: remark.trim() || undefined,
      recordTime: getCurrentRecordTime(),
    })

    result.match(
      () => {
        toast.success('冲账成功')
        onSuccess()
        onClose()
      },
      (error) => {
        toast.error(`冲账失败：${error.message}`)
      }
    )

    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>冲账</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* 原始记录信息 */}
          <div className="space-y-2 rounded-lg border bg-muted/50 p-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">标题</span>
              <span className="font-medium">{record.title}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">原始金额</span>
              <span className="font-medium">
                {formatRawAmount(record.originalAmount)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">可冲账金额</span>
              <span className="font-medium">
                {formatRawAmount(record.netAmount)}
              </span>
            </div>
          </div>

          {/* 冲账金额 */}
          <div className="space-y-2">
            <Label htmlFor="write-off-amount">
              冲账金额 <span className="text-destructive">*</span>
            </Label>
            <Input
              id="write-off-amount"
              type="number"
              step={0.01}
              value={writeOffAmount}
              onChange={(e) => setWriteOffAmount(e.target.value)}
              placeholder="请输入冲账金额（支持正负数）"
            />
          </div>

          {/* 净金额实时显示 */}
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">冲账后净金额</span>
              <span
                className={cn(
                  'font-medium',
                  isNetAmountInvalid
                    ? 'text-red-600 dark:text-red-400'
                    : 'text-green-600 dark:text-green-400'
                )}
              >
                {formatRawAmount(netAmount)}
              </span>
            </div>
            {isNetAmountInvalid && (
              <p className="text-xs text-destructive">冲账后净金额不能小于 0</p>
            )}
          </div>

          {/* 渠道 */}
          <div className="space-y-2">
            <Label htmlFor="write-off-channel">渠道</Label>
            <Select value={channel} onValueChange={setChannel}>
              <SelectTrigger id="write-off-channel" className="w-full">
                <SelectValue placeholder="选择渠道" />
              </SelectTrigger>
              <SelectContent>
                {(
                  Object.entries(ACCOUNTING_CHANNEL_DISPLAY_TEXT) as [
                    string,
                    string,
                  ][]
                ).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 备注 */}
          <div className="space-y-2">
            <Label htmlFor="write-off-remark">备注</Label>
            <Textarea
              id="write-off-remark"
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
          <Button
            onClick={handleSubmit}
            disabled={loading || isNetAmountInvalid}
          >
            {loading ? '提交中...' : '确认冲账'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
