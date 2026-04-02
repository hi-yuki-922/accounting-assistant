/**
 * 订单详情页面
 * 展示订单完整信息、明细列表、关联记账记录、结账/取消操作
 */

import { useParams, useNavigate } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'

import { ACCOUNTING_CHANNEL_DISPLAY_TEXT } from '@/api/commands/accounting/enums'
import { orderApi } from '@/api/commands/order'
import type { OrderDetail, Order } from '@/api/commands/order/type'
import {
  ORDER_STATUS_DISPLAY_TEXT,
  ORDER_TYPE_DISPLAY_TEXT,
} from '@/api/commands/order/type'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

import { CancelOrderConfirmDialog } from './cancel-order-confirm-dialog'
import { SettleOrderDialog } from './settle-order-dialog'

/** 格式化金额 */
const formatAmount = (amount: number) => `¥${amount.toFixed(2)}`

/** 格式化时间 */
const formatDateTime = (timeStr: string) =>
  new Date(timeStr).toLocaleString('zh-CN')

/** 订单状态对应的 Badge 变体 */
const STATUS_BADGE_MAP = {
  Pending: 'outline' as const,
  Settled: 'default' as const,
  Cancelled: 'secondary' as const,
}

export const OrderDetailPage = () => {
  const { orderId } = useParams({ strict: false }) as { orderId: string }
  const navigate = useNavigate()
  const [detail, setDetail] = useState<OrderDetail | null>(null)
  const [loading, setLoading] = useState(true)

  // 弹窗状态
  const [settleDialogOpen, setSettleDialogOpen] = useState(false)
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  // 加载订单详情
  const loadDetail = useCallback(async () => {
    const id = Number.parseInt(orderId, 10)
    if (Number.isNaN(id)) {
      toast.error('无效的订单 ID')
      navigate({ to: '/orders' })
      return
    }

    const result = await orderApi.getById(id)
    result.match(
      (data) => {
        setDetail(data)
        setLoading(false)
      },
      (error) => {
        toast.error(`加载订单详情失败: ${error.message}`)
        setLoading(false)
      }
    )
  }, [orderId, navigate])

  useEffect(() => {
    loadDetail()
  }, [loadDetail])

  // 结账
  const handleSettle = async (actualAmount: number) => {
    if (!detail) {
      return
    }
    setSaving(true)
    const result = await orderApi.settle({
      orderId: detail.order.id,
      actualAmount,
    })
    result.match(
      () => {
        toast.success('订单已结账，记账记录已自动生成')
        void loadDetail()
        setSettleDialogOpen(false)
      },
      (error) => toast.error(`结账失败: ${error.message}`)
    )
    setSaving(false)
  }

  // 取消
  const handleCancel = async () => {
    if (!detail) {
      return
    }
    setSaving(true)
    const result = await orderApi.cancel(detail.order.id)
    result.match(
      () => {
        toast.success('订单已取消')
        void loadDetail()
        setCancelDialogOpen(false)
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

  if (!detail) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <p className="text-lg font-medium">订单不存在</p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => navigate({ to: '/orders' })}
        >
          返回列表
        </Button>
      </div>
    )
  }

  const { order, items } = detail

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* 页头 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate({ to: '/orders' })}
            aria-label="返回订单列表"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold text-foreground">
            {order.orderNo}
          </h1>
          <Badge variant={STATUS_BADGE_MAP[order.status]}>
            {ORDER_STATUS_DISPLAY_TEXT[order.status]}
          </Badge>
        </div>

        {/* 操作按钮 - 仅待结账状态显示 */}
        {order.status === 'Pending' && (
          <div className="flex gap-2">
            <Button onClick={() => setSettleDialogOpen(true)}>结账</Button>
            <Button
              variant="outline"
              onClick={() => setCancelDialogOpen(true)}
              className="text-destructive"
            >
              取消订单
            </Button>
          </div>
        )}
      </div>

      {/* 订单基本信息 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">订单信息</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">订单类型</span>
              <p className="font-medium mt-1">
                {ORDER_TYPE_DISPLAY_TEXT[order.orderType]}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">支付渠道</span>
              <p className="font-medium mt-1">
                {ACCOUNTING_CHANNEL_DISPLAY_TEXT[
                  order.channel as keyof typeof ACCOUNTING_CHANNEL_DISPLAY_TEXT
                ] ?? order.channel}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">创建时间</span>
              <p className="font-medium mt-1">
                {formatDateTime(order.createAt)}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">应收金额</span>
              <p className="font-medium mt-1">
                {formatAmount(order.totalAmount)}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">实收金额</span>
              <p className="font-medium mt-1">
                {formatAmount(order.actualAmount)}
              </p>
            </div>
            {order.settledAt && (
              <div>
                <span className="text-muted-foreground">结账时间</span>
                <p className="font-medium mt-1">
                  {formatDateTime(order.settledAt)}
                </p>
              </div>
            )}
            {order.remark && (
              <div className="col-span-2 md:col-span-3">
                <span className="text-muted-foreground">备注</span>
                <p className="font-medium mt-1">{order.remark}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 订单明细 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">订单明细</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>商品名称</TableHead>
                <TableHead className="text-right">数量</TableHead>
                <TableHead>单位</TableHead>
                <TableHead className="text-right">单价</TableHead>
                <TableHead className="text-right">小计</TableHead>
                <TableHead>备注</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">
                    {item.productName}
                  </TableCell>
                  <TableCell className="text-right">
                    {item.quantity.toString()}
                  </TableCell>
                  <TableCell>{item.unit}</TableCell>
                  <TableCell className="text-right">
                    {formatAmount(item.unitPrice)}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatAmount(item.subtotal)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {item.remark || '-'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* 合计 */}
          <div className="flex justify-end mt-4 text-sm">
            <div className="flex gap-8">
              <div>
                <span className="text-muted-foreground">应收：</span>
                <span className="font-bold text-lg">
                  {formatAmount(order.totalAmount)}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">实收：</span>
                <span className="font-bold text-lg">
                  {formatAmount(order.actualAmount)}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 结账弹窗 */}
      <SettleOrderDialog
        open={settleDialogOpen}
        order={order}
        onClose={() => setSettleDialogOpen(false)}
        onConfirm={handleSettle}
        loading={saving}
      />

      {/* 取消确认弹窗 */}
      <CancelOrderConfirmDialog
        open={cancelDialogOpen}
        order={order}
        onClose={() => setCancelDialogOpen(false)}
        onConfirm={handleCancel}
        loading={saving}
      />
    </div>
  )
}
