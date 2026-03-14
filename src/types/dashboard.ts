/**
 * 统计卡片数据接口
 */
export interface StatsCardData {
  /** 卡片标题 */
  title: string
  /** 显示数值 */
  value: string
  /** 趋势百分比 */
  trend?: {
    /** 趋势值 */
    value: number
    /** 是否为正向趋势 */
    isPositive: boolean
  }
  /** 图标组件名 */
  icon: string
  /** 图标颜色 */
  iconColor?: string
}

/**
 * 交易记录接口
 */
export interface TransactionRecord {
  /** 记录 ID */
  id: string
  /** 日期 */
  date: string
  /** 类型：收入或支出 */
  type: "income" | "expense"
  /** 分类 */
  category: string
  /** 金额 */
  amount: number
  /** 描述 */
  description: string
  /** 状态 */
  status: "completed" | "pending" | "cancelled"
  /** 头像 URL */
  avatar?: string
}

/**
 * 图表数据点接口
 */
export interface ChartDataPoint {
  /** 月份标签 */
  month: string
  /** 收入数据 */
  income: number
  /** 支出数据 */
  expense: number
}

/**
 * 图表配置接口
 */
export interface ChartConfig {
  /** 图表标题 */
  title: string
  /** 图表类型 */
  type: "line" | "bar" | "pie"
  /** 数据源 */
  data: ChartDataPoint[] | number[]
  /** 颜色配置 */
  colors: {
    income: string
    expense: string
    background: string
  }
}

/**
 * 快速操作接口
 */
export interface QuickAction {
  /** 操作 ID */
  id: string
  /** 操作标题 */
  title: string
  /** 操作描述 */
  description: string
  /** 图标组件名 */
  icon: string
  /** 是否为主要操作 */
  primary?: boolean
  /** 点击处理函数 */
  onClick?: () => void
}

/**
 * 用户信息接口
 */
export interface UserInfo {
  /** 用户 ID */
  id: string
  /** 用户名 */
  name: string
  /** 邮箱 */
  email: string
  /** 头像 URL */
  avatar: string
  /** 会员等级 */
  membershipLevel: string
}
