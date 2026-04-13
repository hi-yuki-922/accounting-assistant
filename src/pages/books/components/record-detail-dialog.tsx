/**
 * 记账记录详情弹窗
 * 通过 accounting.get() 获取完整记录并展示
 * 参考 OrderDetailDialog 模式
 */

import { useEffect, useState } from 'react'

import {
  ACCOUNTING_CHANNEL_DISPLAY_TEXT,
  ACCOUNTING_RECORD_STATE_DISPLAY_TEXT,
  ACCOUNTING_TYPE_DISPLAY_TEXT,
  accounting,
} from '@/api/commands/accounting'
import type { AccountingRecord } from '@/api/commands/accounting'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

export type RecordDetailDialogProps = {
  open: boolean
  recordId: number | null
  onClose: () => void
}

export const RecordDetailDialog = ({
  open,
  recordId,
  onClose,
}: RecordDetailDialogProps) => {
  const [record, setRecord] = useState<AccountingRecord | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open || !recordId) {
      setRecord(null)
      return
    }

    setLoading(true)
    const loadRecord = async () => {
      try {
        const res = await accounting.get(recordId)
        if (res.isOk()) {
          setRecord(res.value)
        }
      } finally {
        setLoading(false)
      }
    }
    // eslint-disable-next-line eslint-plugin-promise/prefer-await-to-then
    loadRecord().catch(() => {
      /* ignore */
    })
  }, [open, recordId])

  const handleClose = () => {
    setRecord(null)
    onClose()
  }

  const isIncome =
    record?.accountingType === 'Income' ||
    record?.accountingType === 'InvestmentIncome'

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>记录详情</DialogTitle>
        </DialogHeader>

        {loading && (
          <p className="py-8 text-center text-sm text-muted-foreground">
            加载中...
          </p>
        )}

        {!loading && record && (
          <div className="space-y-4">
            {/* 标题 + 金额 */}
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-medium">{record.title}</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  ID: {record.id}
                </p>
              </div>
              <span
                className={`text-lg font-bold ${
                  isIncome ? 'text-red-500' : 'text-green-500'
                }`}
              >
                {isIncome ? '+' : '-'}¥{record.amount.toFixed(2)}
              </span>
            </div>

            {/* 基本信息 */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-muted-foreground">记账类型：</span>
                <span>
                  {ACCOUNTING_TYPE_DISPLAY_TEXT[record.accountingType] ??
                    record.accountingType}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">支付渠道：</span>
                <span>
                  {ACCOUNTING_CHANNEL_DISPLAY_TEXT[record.channel] ??
                    record.channel}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">记录时间：</span>
                <span>{record.recordTime}</span>
              </div>
              <div>
                <span className="text-muted-foreground">状态：</span>
                <span>
                  {ACCOUNTING_RECORD_STATE_DISPLAY_TEXT[record.state] ??
                    record.state}
                </span>
              </div>
              {record.remark && (
                <div className="col-span-2">
                  <span className="text-muted-foreground">备注：</span>
                  <span>{record.remark}</span>
                </div>
              )}
              {record.writeOffId && (
                <div className="col-span-2">
                  <span className="text-muted-foreground">关联冲账 ID：</span>
                  <span>{record.writeOffId}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
