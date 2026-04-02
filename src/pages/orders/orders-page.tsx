/**
 * 订单列表页面
 * 展示订单卡片列表，支持状态 Tab 切换、创建/结账/取消
 */

import { FileText, Plus } from 'lucide-react'
import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'

import { orderApi } from '@/api/commands/order'
import type { Order } from '@/api/commands/order/type'
import { ORDER_STATUS_DISPLAY_TEXT } from '@/api/commands/order/type'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { CancelOrderConfirmDialog } from './cancel-order-confirm-dialog'
import { CreateOrderDialog } from './create-order-dialog'
import { OrderCard } from './order-card'
import { SettleOrderDialog } from './settle-order-dialog'

/** Tab 选项 */
type TabValue = 'all' | 'Pending' | 'Settled' | 'Cancelled'

const TABS: { value: TabValue; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'Pending', label: '待结账' },
  { value: 'Settled', label: '已结账' },
  { value: 'Cancelled', label: '已取消' },
]

export const OrdersPage = () => {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<TabValue>('all')

  // 弹窗状态
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [settleDialogOpen, setSettleDialogOpen] = useState(false)
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [settlingOrder, setSettlingOrder] = useState<Order | null>(null)
  const [cancellingOrder, setCancellingOrder] = useState<Order | null>(null)
  const [saving, setSaving] = useState(false)

  // 加载订单列表
  const loadOrders = useCallback(async () => {
    setLoading(true)
    const result =
      activeTab === 'all'
        ? await orderApi.getAll()
        : await orderApi.getByStatus(activeTab)

    result.match(
      (data) => {
        setOrders(data)
        setLoading(false)
      },
      (error) => {
        toast.error(`加载订单列表失败: ${error.message}`)
        setLoading(false)
      }
    )
  }, [activeTab])

  useEffect(() => {
    loadOrders()
  }, [loadOrders])

  // Tab 切换
  const handleTabChange = (value: string) => {
    setActiveTab(value as TabValue)
  }

  // 创建订单
  const handleCreate = async (data: Parameters<typeof orderApi.create>[0]) => {
    setSaving(true)
    const result = await orderApi.create(data)
    result.match(
      () => {
        toast.success('订单创建成功')
        void loadOrders()
        setCreateDialogOpen(false)
      },
      (error) => toast.error(`创建失败: ${error.message}`)
    )
    setSaving(false)
  }

  // 结账订单
  const handleSettle = async (actualAmount: number) => {
    if (!settlingOrder) {
      return
    }
    setSaving(true)
    const result = await orderApi.settle({
      orderId: settlingOrder.id,
      actualAmount,
    })
    result.match(
      () => {
        toast.success('订单已结账，记账记录已自动生成')
        void loadOrders()
        setSettleDialogOpen(false)
        setSettlingOrder(null)
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
        void loadOrders()
        setCancelDialogOpen(false)
        setCancellingOrder(null)
      },
      (error) => toast.error(`取消失败: ${error.message}`)
    )
    setSaving(false)
  }

  if (loading) {
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
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          创建订单
        </Button>
      </div>

      {/* 状态 Tab 切换 */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="mb-6">
        <TabsList>
          {TABS.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* 订单列表 */}
      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <FileText className="h-16 w-16 mb-4 opacity-30" />
          <p className="text-lg font-medium">暂无订单数据</p>
          <p className="text-sm mt-1">
            {activeTab !== 'all'
              ? `没有${ORDER_STATUS_DISPLAY_TEXT[activeTab]}的订单`
              : '点击「创建订单」按钮添加第一个订单'}
          </p>
          {activeTab === 'all' && (
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
          {orders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onRefresh={loadOrders}
              onSettle={(o) => {
                setSettlingOrder(o)
                setSettleDialogOpen(true)
              }}
              onCancel={(o) => {
                setCancellingOrder(o)
                setCancelDialogOpen(true)
              }}
            />
          ))}
        </div>
      )}

      {/* 创建订单弹窗 */}
      <CreateOrderDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onConfirm={handleCreate}
        loading={saving}
      />

      {/* 结账弹窗 */}
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
