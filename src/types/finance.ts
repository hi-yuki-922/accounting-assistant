/**
 * 财务记录基础接口
 */
export interface FinanceRecord {
  /** 记录 ID */
  id: string
  /** 记录类型：收入、支出、投资 */
  type: "income" | "expense" | "investment"
  /** 记录渠道 */
  channel: "cash" | "bank" | "credit_card" | "alipay" | "wechat_pay" | "other"
  /** 金额 */
  amount: number
  /** 日期 */
  date: Date
  /** 分类 */
  category: string
  /** 子分类 */
  subcategory?: string
  /** 描述 */
  description: string
  /** 备注 */
  notes?: string
  /** 附件 */
  attachments?: string[]
  /** 创建时间 */
  createdAt: Date
  /** 更新时间 */
  updatedAt: Date
}

/**
 * 财务分类接口
 */
export interface FinanceCategory {
  /** 分类 ID */
  id: string
  /** 分类名称 */
  name: string
  /** 父分类 ID */
  parentId?: string
  /** 图标 */
  icon?: string
  /** 颜色 */
  color?: string
  /** 是否启用 */
  enabled: boolean
  /** 排序顺序 */
  order: number
}

/**
 * 财务统计接口
 */
export interface FinanceStats {
  /** 总资产 */
  totalAssets: number
  /** 本月收入 */
  monthlyIncome: number
  /** 本月支出 */
  monthlyExpense: number
  /** 净资产 */
  netAssets: number
  /** 收入趋势 */
  incomeTrend: {
    value: number
    isPositive: boolean
  }
  /** 支出趋势 */
  expenseTrend: {
    value: number
    isPositive: boolean
  }
}

/**
 * 月度财务数据接口
 */
export interface MonthlyFinanceData {
  /** 月份 */
  month: string
  /** 年份 */
  year: number
  /** 月份 */
  monthNumber: number
  /** 总收入 */
  totalIncome: number
  /** 总支出 */
  totalExpense: number
  /** 净收入 */
  netIncome: number
  /** 交易数量 */
  transactionCount: number
}

/**
 * 账户接口
 */
export interface Account {
  /** 账户 ID */
  id: string
  /** 账户名称 */
  name: string
  /** 账户类型 */
  type: "checking" | "savings" | "credit_card" | "investment" | "cash"
  /** 当前余额 */
  balance: number
  /** 账户号 */
  accountNumber?: string
  /** 银行名称 */
  bankName?: string
  /** 货币 */
  currency: string
  /** 是否启用 */
  enabled: boolean
}

/**
 * 预算接口
 */
export interface Budget {
  /** 预算 ID */
  id: string
  /** 预算名称 */
  name: string
  /** 预算金额 */
  amount: number
  /** 已用金额 */
  usedAmount: number
  /** 周期 */
  period: "monthly" | "weekly" | "daily" | "yearly"
  /** 分类 */
  category?: string
  /** 开始日期 */
  startDate: Date
  /** 结束日期 */
  endDate: Date
  /** 是否提醒 */
  alertEnabled: boolean
  /** 提醒阈值 */
  alertThreshold: number
}
