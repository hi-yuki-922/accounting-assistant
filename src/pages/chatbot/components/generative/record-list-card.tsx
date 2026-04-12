/**
 * 记账记录列表卡片
 * 展示搜索/创建/更新记录后的结果列表，行点击打开 RecordDetailDialog
 */

import { useState } from 'react'

import {
  ACCOUNTING_CHANNEL_DISPLAY_TEXT,
  ACCOUNTING_TYPE_DISPLAY_TEXT,
} from '@/api/commands/accounting'
import type { AccountingRecord } from '@/api/commands/accounting'
import { RecordDetailDialog } from '@/pages/books/components/record-detail-dialog'

export type RecordListCardProps = {
  result: unknown
}

export const RecordListCard = ({ result }: RecordListCardProps) => {
  const [selectedRecordId, setSelectedRecordId] = useState<number | null>(null)
  const parsed = result as {
    success?: boolean
    message?: string
    data?: { items?: AccountingRecord[] } | AccountingRecord[]
  }

  const records = extractRecords(parsed)
  const message = parsed?.message

  if (!records || records.length === 0) {
    return (
      <div className="rounded-lg border p-3">
        <p className="text-sm text-muted-foreground">
          {message ?? '未找到记录'}
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="rounded-lg border">
        {message && (
          <div className="border-b px-3 py-2 text-xs text-muted-foreground">
            {message}
          </div>
        )}
        <div className="divide-y">
          {records.map((record) => (
            <button
              key={record.id}
              type="button"
              className="flex w-full items-center gap-3 overflow-hidden px-3 py-2 text-left hover:bg-muted/50"
              onClick={() => setSelectedRecordId(record.id)}
            >
              <span className="truncate text-sm">{record.title}</span>
              <span
                className={`ml-auto text-sm font-medium ${
                  record.accountingType === 'Income' ||
                  record.accountingType === 'InvestmentIncome'
                    ? 'text-red-500'
                    : 'text-green-500'
                }`}
              >
                {record.accountingType === 'Income' ||
                record.accountingType === 'InvestmentIncome'
                  ? '+'
                  : '-'}
                ¥{record.amount.toFixed(2)}
              </span>
              <span className="text-xs text-muted-foreground">
                {ACCOUNTING_TYPE_DISPLAY_TEXT[record.accountingType] ??
                  record.accountingType}
              </span>
            </button>
          ))}
        </div>
      </div>

      <RecordDetailDialog
        open={selectedRecordId !== null}
        recordId={selectedRecordId}
        onClose={() => setSelectedRecordId(null)}
      />
    </>
  )
}

function extractRecords(
  data: Record<string, unknown>
): AccountingRecord[] | null {
  if (Array.isArray(data)) {
    return data
  }
  if (Array.isArray(data?.data)) {
    return data.data as AccountingRecord[]
  }
  if (data?.data && typeof data.data === 'object') {
    const d = data.data as Record<string, unknown>
    if (Array.isArray(d?.items)) {
      return d.items as AccountingRecord[]
    }
  }
  return null
}
