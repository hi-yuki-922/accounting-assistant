/**
 * 订单管理页面
 * 支持卡片/列表双视图切换
 * 卡片视图：仅展示今日订单，类型+状态双 Tab 筛选
 * 列表视图：全部历史订单，多维度筛选+分页
 */

import { FileText, LayoutGrid, List, Plus, Search } from 'lucide-react'
import { useState, useEffect, useCallback, useMemo } from 'react'
import { toast } from 'sonner'

import { ACCOUNTING_CHANNEL_DISPLAY_TEXT } from '@/api/commands/accounting/enums'
import { orderApi } from '@/api/commands/order'
import type { Order, QueryOrdersDto } from '@/api/commands/order/type'
import {
  ORDER_STATUS_DISPLAY_TEXT,
  ORDER_TYPE_DISPLAY_TEXT,
} from '@/api/commands/order/type'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { formatCurrency, formatDate } from '@/lib/formatters'

import { CancelOrderConfirmDialog } from './cancel-order-confirm-dialog'
import { CreateOrderDialog } from './create-order-dialog'
import { OrderCard } from './order-card'
import { OrderDetailDialog } from './order-detail-dialog'
import { SettleOrderDialog } from './settle-order-dialog'

/** 视图模式 */
type ViewMode = 'card' | 'list'

/** 类型 Tab */
type TypeTab = 'all' | 'Sales' | 'Purchase'
/** 状态 Tab */
type StatusTab = 'all' | 'Pending' | 'Settled' | 'Cancelled'

const TYPE_TABS: { value: TypeTab; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'Sales', label: '销售订单' },
  { value: 'Purchase', label: '采购订单' },
]

const STATUS_TABS: { value: StatusTab; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'Pending', label: '待结账' },
  { value: 'Settled', label: '已结账' },
  { value: 'Cancelled', label: '已取消' },
]

/** 判断是否是今天 */
const isToday = (timeStr: string) => {
  const date = new Date(timeStr)
  const today = new Date()
  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  )
}

/** 订单状态 Badge 颜色 */
const STATUS_STYLE: Record<string, string> = {
  Pending:
    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  Settled:
    'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  Cancelled: 'bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400',
}

export const OrdersPage = () => {
  // 视图模式
  const [viewMode, setViewMode] = useState<ViewMode>('card')

  // 卡片视图状态
  const [allOrders, setAllOrders] = useState<Order[]>([])
  const [typeTab, setTypeTab] = useState<TypeTab>('all')
  const [statusTab, setStatusTab] = useState<StatusTab>('all')

  // 列表视图状态
  const [listOrders, setListOrders] = useState<Order[]>([])
  const [listTotal, setListTotal] = useState(0)
  const [listPage, setListPage] = useState(1)
  const [listFilters, setListFilters] = useState<{
    status?: string
    orderType?: string
    channel?: string
    startTime?: string
    endTime?: string
  }>({})

  const [loading, setLoading] = useState(true)

  // 弹窗状态
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [settleDialogOpen, setSettleDialogOpen] = useState(false)
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)
  const [settlingOrder, setSettlingOrder] = useState<Order | null>(null)
  const [cancellingOrder, setCancellingOrder] = useState<Order | null>(null)
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)

  // 加载所有订单（用于卡片视图）
  const loadAllOrders = useCallback(async () => {
    setLoading(true)
    const result = await orderApi.getAll()
    result.match(
      (data) => {
        setAllOrders(data)
        setLoading(false)
      },
      (error) => {
        toast.error(`加载订单列表失败: ${error.message}`)
        setLoading(false)
      }
    )
  }, [])

  // 加载列表视图数据（分页查询）
  const loadListOrders = useCallback(
    async (page = 1) => {
      setLoading(true)
      const query: QueryOrdersDto = {
        page,
        pageSize: 20,
        ...listFilters,
      }
      const result = await orderApi.query(query)
      result.match(
        (data) => {
          setListOrders(data.orders)
          setListTotal(data.total)
          setListPage(page)
          setLoading(false)
        },
        (error) => {
          toast.error(`加载订单列表失败: ${error.message}`)
          setLoading(false)
        }
      )
    },
    [listFilters]
  )

  // 初始加载
  useEffect(() => {
    if (viewMode === 'card') {
      void loadAllOrders()
    } else {
      void loadListOrders(1)
    }
  }, [viewMode, loadAllOrders, loadListOrders])

  // 卡片视图：今日订单 + 类型/状态筛选
  const todayOrders = useMemo(() => {
    let filtered = allOrders.filter((o) => isToday(o.createAt))
    if (typeTab !== 'all') {
      filtered = filtered.filter((o) => o.orderType === typeTab)
    }
    if (statusTab !== 'all') {
      filtered = filtered.filter((o) => o.status === statusTab)
    }
    return filtered
  }, [allOrders, typeTab, statusTab])

  // 列表视图总页数
  const totalPages = Math.ceil(listTotal / 20)

  // 创建订单
  const handleCreate = async (data: Parameters<typeof orderApi.create>[0]) => {
    setSaving(true)
    const result = await orderApi.create(data)
    result.match(
      () => {
        toast.success('订单创建成功')
        if (viewMode === 'card') {
          void loadAllOrders()
        } else {
          void loadListOrders(1)
        }
        setCreateDialogOpen(false)
      },
      (error) => toast.error(`创建失败: ${error.message}`)
    )
    setSaving(false)
  }

  // 结账订单
  const handleSettle = async (data: {
    channel: string
    actualAmount: number
  }) => {
    if (!settlingOrder) {
      return
    }
    setSaving(true)
    const result = await orderApi.settle({
      orderId: settlingOrder.id,
      channel: data.channel,
      actualAmount: data.actualAmount,
    })
    result.match(
      () => {
        toast.success('订单已结账，记账记录已自动生成')
        if (viewMode === 'card') {
          void loadAllOrders()
        } else {
          void loadListOrders(listPage)
        }
        setSettleDialogOpen(false)
        setSettlingOrder(null)
        // 如果详情弹窗开着，也刷新
        if (detailDialogOpen && selectedOrderId) {
          setDetailDialogOpen(false)
        }
      },
      (error) => toast.error(`结账失败: ${error.message}`)
    )
    setSaving(false)
  }

  // 取消订单
  const handleCancel = async () => {
    if (!cancellingOrder) {
      return
    }
    setSaving(true)
    const result = await orderApi.cancel(cancellingOrder.id)
    result.match(
      () => {
        toast.success('订单已取消')
        if (viewMode === 'card') {
          void loadAllOrders()
        } else {
          void loadListOrders(listPage)
        }
        setCancelDialogOpen(false)
        setCancellingOrder(null)
        if (detailDialogOpen && selectedOrderId) {
          setDetailDialogOpen(false)
        }
      },
      (error) => toast.error(`取消失败: ${error.message}`)
    )
    setSaving(false)
  }

  // 打开订单详情
  const handleOrderClick = (order: Order) => {
    setSelectedOrderId(order.id)
    setDetailDialogOpen(true)
  }

  // 刷新列表
  const handleRefresh = () => {
    if (viewMode === 'card') {
      void loadAllOrders()
    } else {
      void loadListOrders(listPage)
    }
  }

  if (loading && allOrders.length === 0 && listOrders.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">加载中...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 页头 */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-foreground">订单管理</h1>
        <div className="flex items-center gap-3">
          {/* 视图切换 */}
          <div className="flex items-center border rounded-lg p-1">
            <Button
              variant={viewMode === 'card' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('card')}
            >
              <LayoutGrid className="h-4 w-4 mr-1" />
              卡片
            </Button>
            <Button
              variant={viewMode === 'list' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4 mr-1" />
              列表
            </Button>
          </div>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            创建订单
          </Button>
        </div>
      </div>

      {/* 卡片视图 */}
      {viewMode === 'card' && (
        <>
          {/* 双排 Tab */}
          <div className="flex flex-wrap gap-2 mb-6">
            {/* 类型 Tab */}
            <Tabs
              value={typeTab}
              onValueChange={(v) => setTypeTab(v as TypeTab)}
            >
              <TabsList>
                {TYPE_TABS.map((tab) => (
                  <TabsTrigger key={tab.value} value={tab.value}>
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>

            {/* 状态 Tab */}
            <Tabs
              value={statusTab}
              onValueChange={(v) => setStatusTab(v as StatusTab)}
            >
              <TabsList>
                {STATUS_TABS.map((tab) => (
                  <TabsTrigger key={tab.value} value={tab.value}>
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>

          {/* 卡片列表 */}
          {todayOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <FileText className="h-16 w-16 mb-4 opacity-30" />
              <p className="text-lg font-medium">今日暂无订单</p>
              <p className="text-sm mt-1">
                {typeTab !== 'all' || statusTab !== 'all'
                  ? '当前筛选条件下没有匹配的订单'
                  : '点击「创建订单」按钮添加第一个订单'}
              </p>
              {typeTab === 'all' && statusTab === 'all' && (
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => setCreateDialogOpen(true)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  创建订单
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {todayOrders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onClick={handleOrderClick}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* 列表视图 */}
      {viewMode === 'list' && (
        <>
          {/* 筛选栏 */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6 p-4 border rounded-lg bg-card">
            <div className="space-y-1">
              <Label className="text-xs">开始时间</Label>
              <Input
                type="date"
                className="h-8 text-sm"
                value={listFilters.startTime ?? ''}
                onChange={(e) =>
                  setListFilters((prev) => ({
                    ...prev,
                    startTime: e.target.value || undefined,
                  }))
                }
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">结束时间</Label>
              <Input
                type="date"
                className="h-8 text-sm"
                value={listFilters.endTime ?? ''}
                onChange={(e) =>
                  setListFilters((prev) => ({
                    ...prev,
                    endTime: e.target.value || undefined,
                  }))
                }
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">状态</Label>
              <Select
                value={listFilters.status ?? 'all'}
                onValueChange={(v) =>
                  setListFilters((prev) => ({
                    ...prev,
                    status: v === 'all' ? undefined : v,
                  }))
                }
              >
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部</SelectItem>
                  <SelectItem value="Pending">待结账</SelectItem>
                  <SelectItem value="Settled">已结账</SelectItem>
                  <SelectItem value="Cancelled">已取消</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">类型</Label>
              <Select
                value={listFilters.orderType ?? 'all'}
                onValueChange={(v) =>
                  setListFilters((prev) => ({
                    ...prev,
                    orderType: v === 'all' ? undefined : v,
                  }))
                }
              >
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部</SelectItem>
                  <SelectItem value="Sales">销售</SelectItem>
                  <SelectItem value="Purchase">采购</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">支付渠道</Label>
              <Select
                value={listFilters.channel ?? 'all'}
                onValueChange={(v) =>
                  setListFilters((prev) => ({
                    ...prev,
                    channel: v === 'all' ? undefined : v,
                  }))
                }
              >
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部</SelectItem>
                  {Object.entries(ACCOUNTING_CHANNEL_DISPLAY_TEXT).map(
                    ([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* 订单表格 */}
          {listOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <FileText className="h-16 w-16 mb-4 opacity-30" />
              <p className="text-lg font-medium">暂无订单数据</p>
              <p className="text-sm mt-1">调整筛选条件或创建新订单</p>
            </div>
          ) : (
            <>
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>订单编号</TableHead>
                      <TableHead>类型</TableHead>
                      <TableHead>状态</TableHead>
                      <TableHead className="text-right">应收</TableHead>
                      <TableHead className="text-right">实收</TableHead>
                      <TableHead>渠道</TableHead>
                      <TableHead>创建时间</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {listOrders.map((order) => (
                      <TableRow
                        key={order.id}
                        className="cursor-pointer"
                        onClick={() => handleOrderClick(order)}
                      >
                        <TableCell className="font-medium">
                          {order.orderNo}
                        </TableCell>
                        <TableCell>
                          {ORDER_TYPE_DISPLAY_TEXT[order.orderType]}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                              STATUS_STYLE[order.status] ?? ''
                            }`}
                          >
                            {ORDER_STATUS_DISPLAY_TEXT[order.status]}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(order.totalAmount)}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(order.actualAmount)}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {order.channel !== 'Unknown'
                            ? (ACCOUNTING_CHANNEL_DISPLAY_TEXT[
                                order.channel as keyof typeof ACCOUNTING_CHANNEL_DISPLAY_TEXT
                              ] ?? order.channel)
                            : '-'}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {formatDate(order.createAt, 'datetime')}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* 分页 */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <span className="text-sm text-muted-foreground">
                    共 {listTotal} 条记录
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={listPage <= 1}
                      onClick={() => void loadListOrders(listPage - 1)}
                    >
                      上一页
                    </Button>
                    <span className="text-sm">
                      {listPage} / {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={listPage >= totalPages}
                      onClick={() => void loadListOrders(listPage + 1)}
                    >
                      下一页
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* 创建订单弹窗 */}
      <CreateOrderDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onConfirm={handleCreate}
        loading={saving}
      />

      {/* 订单详情弹窗 */}
      <OrderDetailDialog
        open={detailDialogOpen}
        orderId={selectedOrderId}
        onClose={() => {
          setDetailDialogOpen(false)
          setSelectedOrderId(null)
        }}
        onRefresh={handleRefresh}
      />

      {/* 结账弹窗（从详情 Dialog 触发） */}
      <SettleOrderDialog
        open={settleDialogOpen}
        order={settlingOrder}
        onClose={() => {
          setSettleDialogOpen(false)
          setSettlingOrder(null)
        }}
        onConfirm={handleSettle}
        loading={saving}
      />

      {/* 取消确认弹窗 */}
      <CancelOrderConfirmDialog
        open={cancelDialogOpen}
        order={cancellingOrder}
        onClose={() => {
          setCancelDialogOpen(false)
          setCancellingOrder(null)
        }}
        onConfirm={handleCancel}
        loading={saving}
      />
    </div>
  )
}
