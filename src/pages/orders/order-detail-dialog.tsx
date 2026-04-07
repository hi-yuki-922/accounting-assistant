/**
 * 订单详情对话框
 * 展示订单完整信息、明细列表、关联记账记录、操作按钮
 * 用于在列表页中以 Dialog 形式展示，替代独立详情页
 */

import { Pencil } from 'lucide-react'
import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'

import { ACCOUNTING_CHANNEL_DISPLAY_TEXT } from '@/api/commands/accounting/enums'
import { orderApi } from '@/api/commands/order'
import type { OrderDetail as OrderDetailType } from '@/api/commands/order/type'
import {
  ORDER_STATUS_DISPLAY_TEXT,
  ORDER_TYPE_DISPLAY_TEXT,
} from '@/api/commands/order/type'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatCurrency, formatDate } from '@/lib/formatters'

import { CancelOrderConfirmDialog } from './cancel-order-confirm-dialog'
import { EditOrderDialog } from './edit-order-dialog'
import { SettleOrderDialog } from './settle-order-dialog'

/** 订单状态对应的 Badge 变体 */
const STATUS_BADGE_MAP = {
  Pending: 'outline' as const,
  Settled: 'default' as const,
  Cancelled: 'secondary' as const,
}

export type OrderDetailDialogProps = {
  open: boolean
  orderId: number | null
  onClose: () => void
  onRefresh: () => void
}

export const OrderDetailDialog: React.FC<OrderDetailDialogProps> = ({
  open,
  orderId,
  onClose,
  onRefresh,
}) => {
  const [detail, setDetail] = useState<OrderDetailType | null>(null)
  const [loading, setLoading] = useState(true)

  // 弹窗状态
  const [settleDialogOpen, setSettleDialogOpen] = useState(false)
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  // 加载订单详情
  const loadDetail = useCallback(async () => {
    if (!orderId) {
      return
    }
    setLoading(true)
    const result = await orderApi.getById(orderId)
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
  }, [orderId])

  useEffect(() => {
    if (open && orderId) {
      loadDetail()
    }
  }, [open, orderId, loadDetail])

  // 结账
  const handleSettle = async (data: {
    channel: string
    actualAmount: number
  }) => {
    if (!detail) {
      return
    }
    setSaving(true)
    const result = await orderApi.settle({
      orderId: detail.order.id,
      channel: data.channel,
      actualAmount: data.actualAmount,
    })
    result.match(
      () => {
        toast.success('订单已结账，记账记录已自动生成')
        void loadDetail()
        void onRefresh()
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
        void onRefresh()
        setCancelDialogOpen(false)
      },
      (error) => toast.error(`取消失败: ${error.message}`)
    )
    setSaving(false)
  }

  // 编辑完成
  const handleEditComplete = () => {
    setEditDialogOpen(false)
    void loadDetail()
    void onRefresh()
  }

  if (!detail) {
    return (
      <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
        <DialogContent className="sm:max-w-2xl">
          <div className="flex items-center justify-center py-12">
            <div className="text-muted-foreground">
              {loading ? '加载中...' : '订单不存在'}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  const { order, items } = detail

  return (
    <>
      <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <DialogTitle className="text-xl">{order.orderNo}</DialogTitle>
              <Badge variant={STATUS_BADGE_MAP[order.status]}>
                {ORDER_STATUS_DISPLAY_TEXT[order.status]}
              </Badge>
              <Badge variant="secondary">
                {ORDER_TYPE_DISPLAY_TEXT[order.orderType]}
              </Badge>
            </div>
          </DialogHeader>

          {/* 订单基本信息 */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm py-4">
            <div>
              <span className="text-muted-foreground">创建时间</span>
              <p className="font-medium mt-1">
                {formatDate(order.createAt, 'datetime')}
              </p>
            </div>
            {order.channel !== 'Unknown' && (
              <div>
                <span className="text-muted-foreground">支付渠道</span>
                <p className="font-medium mt-1">
                  {ACCOUNTING_CHANNEL_DISPLAY_TEXT[
                    order.channel as keyof typeof ACCOUNTING_CHANNEL_DISPLAY_TEXT
                  ] ?? order.channel}
                </p>
              </div>
            )}
            <div>
              <span className="text-muted-foreground">应收金额</span>
              <p className="font-medium mt-1">
                {formatCurrency(order.totalAmount)}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">实收金额</span>
              <p className="font-medium mt-1">
                {formatCurrency(order.actualAmount)}
              </p>
            </div>
            {order.settledAt && (
              <div>
                <span className="text-muted-foreground">结账时间</span>
                <p className="font-medium mt-1">
                  {formatDate(order.settledAt, 'datetime')}
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

          {/* 订单明细 */}
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
                    {formatCurrency(item.unitPrice)}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(item.subtotal)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {item.remark || '-'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* 合计 */}
          <div className="flex justify-end mt-2 text-sm">
            <div className="flex gap-8">
              <div>
                <span className="text-muted-foreground">应收：</span>
                <span className="font-bold text-lg">
                  {formatCurrency(order.totalAmount)}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">实收：</span>
                <span className="font-bold text-lg">
                  {formatCurrency(order.actualAmount)}
                </span>
              </div>
            </div>
          </div>

          {/* 操作按钮 */}
          {order.status === 'Pending' && (
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setEditDialogOpen(true)}
                disabled={saving}
              >
                <Pencil className="h-4 w-4 mr-1" />
                编辑
              </Button>
              <Button
                onClick={() => setSettleDialogOpen(true)}
                disabled={saving}
              >
                结账
              </Button>
              <Button
                variant="outline"
                onClick={() => setCancelDialogOpen(true)}
                disabled={saving}
                className="text-destructive"
              >
                取消订单
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>

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

      {/* 编辑弹窗 */}
      {editDialogOpen && detail && (
        <EditOrderDialog
          open={editDialogOpen}
          order={order}
          items={items}
          onClose={() => setEditDialogOpen(false)}
          onConfirm={handleEditComplete}
          loading={saving}
        />
      )}
    </>
  )
}
