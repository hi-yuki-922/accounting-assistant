/**
 * Order 模块类型定义
 * 与 Rust 后端 order::Model / DTO 对齐
 */

/**
 * 订单类型枚举
 */
export const OrderType = {
  Sales: 'Sales',
  Purchase: 'Purchase',
} as const

export type OrderType = (typeof OrderType)[keyof typeof OrderType]

/**
 * 订单状态枚举
 */
export const OrderStatus = {
  Pending: 'Pending',
  Settled: 'Settled',
  Cancelled: 'Cancelled',
} as const

export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus]

/**
 * 订单类型显示文本映射
 */
export const ORDER_TYPE_DISPLAY_TEXT = {
  [OrderType.Sales]: '销售',
  [OrderType.Purchase]: '采购',
} as const

/**
 * 订单状态显示文本映射
 */
export const ORDER_STATUS_DISPLAY_TEXT = {
  [OrderStatus.Pending]: '待结账',
  [OrderStatus.Settled]: '已结账',
  [OrderStatus.Cancelled]: '已取消',
} as const

/**
 * 订单业务类型枚举
 */
export const OrderSubType = {
  Wholesale: 'Wholesale',
  Retail: 'Retail',
  WholesalePurchase: 'WholesalePurchase',
  PeerTransfer: 'PeerTransfer',
} as const

export type OrderSubType = (typeof OrderSubType)[keyof typeof OrderSubType]

export const ORDER_SUB_TYPE_DISPLAY_TEXT: Record<OrderSubType, string> = {
  Wholesale: '批发',
  Retail: '零售',
  WholesalePurchase: '批发进货',
  PeerTransfer: '同行调货',
} as const

/** 销售订单可选的业务类型 */
export const SALES_SUB_TYPES: OrderSubType[] = [
  OrderSubType.Wholesale,
  OrderSubType.Retail,
]

/** 采购订单可选的业务类型 */
export const PURCHASE_SUB_TYPES: OrderSubType[] = [
  OrderSubType.WholesalePurchase,
  OrderSubType.PeerTransfer,
]

/**
 * 订单模型
 * 与 Rust 后端 order::Model 对齐
 */
export type Order = {
  id: number
  orderNo: string
  orderType: OrderType
  customerId?: number
  totalAmount: number
  actualAmount: number
  subType: string
  status: OrderStatus
  channel: string
  remark?: string
  createAt: string
  settledAt?: string
}

/**
 * 订单明细模型
 * 与 Rust 后端 order_item::Model 对齐
 */
export type OrderItem = {
  id: number
  orderId: number
  productId: number
  productName: string
  quantity: number
  unit: string
  unitPrice: number
  subtotal: number
  remark?: string
}

/**
 * 订单详情（含明细）
 * 与 Rust 后端 OrderDetail 对齐
 */
export type OrderDetail = {
  order: Order
  items: OrderItem[]
}

/**
 * 创建订单明细 DTO
 */
export type CreateOrderItemDto = {
  productId: number
  productName: string
  quantity: number
  unit: string
  unitPrice: number
  remark?: string
}

/**
 * 创建订单 DTO
 */
export type CreateOrderDto = {
  orderType: string
  customerId?: number
  items: CreateOrderItemDto[]
  remark?: string
  actualAmount?: number
  subType?: string
}

/**
 * 结账订单 DTO
 */
export type SettleOrderDto = {
  orderId: number
  channel: string
  actualAmount?: number
}

/**
 * 编辑订单 DTO
 */
export type UpdateOrderDto = {
  orderId: number
  items?: CreateOrderItemDto[]
  remark?: string
}

/**
 * 分页查询订单 DTO
 */
export type QueryOrdersDto = {
  page?: number
  pageSize?: number
  startTime?: string
  endTime?: string
  status?: string
  minAmount?: number
  maxAmount?: number
  channel?: string
  orderType?: string
}

/**
 * 分页查询结果
 */
export type QueryOrdersResult = {
  orders: Order[]
  total: number
}

/**
 * 结算预览 — 品类分组项
 */
export type SettlePreviewItem = {
  categoryId: number
  categoryName: string
  amount: number
  bookId: number
  bookName: string
}

/**
 * 结算预览 — 折扣冲账项
 */
export type WriteOffPreviewItem = {
  categoryName: string
  writeOffAmount: number
  categoryId: number
}

/**
 * 结算预览结果
 */
export type SettlePreview = {
  categoryGroups: SettlePreviewItem[]
  writeOffPreview?: WriteOffPreviewItem[]
  discountAmount?: number
}
