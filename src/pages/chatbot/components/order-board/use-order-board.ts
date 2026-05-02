/**
 * useOrderBoard hook
 * 按日期范围分类型查询订单、事件订阅刷新
 */

import { useCallback, useEffect, useRef, useState } from 'react'

import { orderApi } from '@/api/commands/order'
import type { Order, OrderType, OrderStatus } from '@/api/commands/order/type'
import { orderBoardEmitter } from '@/lib/order-board-events'

/** 看板列定义 */
export type BoardColumnKey =
  | 'sales-pending'
  | 'sales-settled'
  | 'purchase-pending'
  | 'purchase-settled'
  | 'cancelled'

export type BoardColumn = {
  key: BoardColumnKey
  title: string
  orders: Order[]
}

/** 日期范围 */
export type DateRange = {
  from: string // YYYY-MM-DD
  to: string // YYYY-MM-DD
}

/** 获取今天的日期字符串 */
function today(): string {
  return new Date().toISOString().slice(0, 10)
}

/** 格式化日期为查询参数 */
function toQueryDate(date: string, isEnd: boolean): string {
  return isEnd ? `${date}T23:59:59` : `${date}T00:00:00`
}

/** 按列定义和查询条件加载订单 */
async function fetchColumnOrders(
  orderType?: OrderType,
  status?: OrderStatus,
  dateRange?: DateRange
): Promise<Order[]> {
  const result = await orderApi.query({
    page: 1,
    pageSize: 200,
    startTime: dateRange ? toQueryDate(dateRange.from, false) : undefined,
    endTime: dateRange ? toQueryDate(dateRange.to, true) : undefined,
    orderType,
    status,
  })
  return result.isOk() ? result.value.orders : []
}

/** 五列看板定义 */
const COLUMN_DEFS: {
  key: BoardColumnKey
  title: string
  orderType?: OrderType
  status?: OrderStatus
}[] = [
  {
    key: 'sales-pending',
    title: '销售-待结账',
    orderType: 'Sales',
    status: 'Pending',
  },
  {
    key: 'sales-settled',
    title: '销售-已结账',
    orderType: 'Sales',
    status: 'Settled',
  },
  {
    key: 'purchase-pending',
    title: '采购-待结账',
    orderType: 'Purchase',
    status: 'Pending',
  },
  {
    key: 'purchase-settled',
    title: '采购-已结账',
    orderType: 'Purchase',
    status: 'Settled',
  },
  { key: 'cancelled', title: '已取消', status: 'Cancelled' },
]

const DEFAULT_COLUMNS: BoardColumn[] = COLUMN_DEFS.map((def) => ({
  key: def.key,
  title: def.title,
  orders: [],
}))

export type UseOrderBoardReturn = {
  columns: BoardColumn[]
  loading: boolean
  dateRange: DateRange
  setDateRange: (range: DateRange) => void
  refreshAll: () => void
  refreshByType: (orderType: 'Sales' | 'Purchase' | 'All') => void
}

export function useOrderBoard(): UseOrderBoardReturn {
  const [columns, setColumns] = useState<BoardColumn[]>(DEFAULT_COLUMNS)
  const [loading, setLoading] = useState(false)
  const [dateRange, setDateRangeState] = useState<DateRange>({
    from: today(),
    to: today(),
  })
  const dateRangeRef = useRef(dateRange)
  dateRangeRef.current = dateRange

  /** 加载指定列的数据 */
  const loadColumns = useCallback(async (columnKeys: BoardColumnKey[]) => {
    const defs = COLUMN_DEFS.filter((d) => columnKeys.includes(d.key))
    const results = await Promise.all(
      defs.map((def) =>
        fetchColumnOrders(def.orderType, def.status, dateRangeRef.current)
      )
    )
    setColumns((prev) =>
      prev.map((col) => {
        const idx = defs.findIndex((d) => d.key === col.key)
        if (idx === -1) {
          return col
        }
        return { ...col, orders: results[idx] }
      })
    )
  }, [])

  /** 刷新全部列 */
  const refreshAll = useCallback(() => {
    setLoading(true)
    const allKeys = COLUMN_DEFS.map((d) => d.key)
    void loadColumns(allKeys).finally(() => {
      setLoading(false)
    })
  }, [loadColumns])

  /** 按订单类型定向刷新 */
  const refreshByType = useCallback(
    (orderType: 'Sales' | 'Purchase' | 'All') => {
      const keys: BoardColumnKey[] =
        orderType === 'Sales'
          ? ['sales-pending', 'sales-settled']
          : (orderType === 'Purchase'
            ? ['purchase-pending', 'purchase-settled']
            : COLUMN_DEFS.map((d) => d.key))
      void loadColumns(keys)
    },
    [loadColumns]
  )

  /** 设置日期范围并刷新 */
  const setDateRange = useCallback((range: DateRange) => {
    setDateRangeState(range)
    // 直接用新范围加载（不能依赖 state 立即生效）
    setLoading(true)
    const allKeys = COLUMN_DEFS.map((d) => d.key)
    const defs = COLUMN_DEFS
    Promise.all(
      defs.map((def) => fetchColumnOrders(def.orderType, def.status, range))
    )
      .then((results) => {
        setColumns((prev) =>
          prev.map((col, i) => ({ ...col, orders: results[i] }))
        )
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  // 首次加载
  useEffect(() => {
    refreshAll()
  }, [refreshAll])

  // 订阅看板刷新事件
  useEffect(() => {
    const handler = (payload: { orderType: 'Sales' | 'Purchase' | 'All' }) => {
      refreshByType(payload.orderType)
    }
    orderBoardEmitter.on('order-board:refresh', handler)
    return () => {
      orderBoardEmitter.off('order-board:refresh', handler)
    }
  }, [refreshByType])

  return {
    columns,
    loading,
    dateRange,
    setDateRange,
    refreshAll,
    refreshByType,
  }
}
