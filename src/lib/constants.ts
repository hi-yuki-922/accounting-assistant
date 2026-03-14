/**
 * 导航菜单配置
 */
export const NAV_MENU_ITEMS = [
  {
    href: "/dashboard",
    icon: "Home",
    label: "仪表板",
    description: "查看财务概览",
  },
  {
    href: "/records",
    icon: "FileText",
    label: "记录",
    description: "管理收支记录",
  },
  {
    href: "/statistics",
    icon: "BarChart3",
    label: "统计",
    description: "财务数据分析",
  },
  {
    href: "/settings",
    icon: "Settings",
    label: "设置",
    description: "应用配置",
  },
] as const

/**
 * 财务分类定义
 */
export const FINANCE_CATEGORIES = {
  income: [
    { id: "salary", name: "工资收入", icon: "DollarSign", color: "#22c55e" },
    { id: "investment", name: "投资收益", icon: "TrendingUp", color: "#3b82f6" },
    { id: "freelance", name: "兼职收入", icon: "Briefcase", color: "#8b5cf6" },
    { id: "other", name: "其他收入", icon: "PlusCircle", color: "#06b6d4" },
  ],
  expense: [
    { id: "food", name: "餐饮消费", icon: "Utensils", color: "#f97316" },
    { id: "transport", name: "交通费用", icon: "Car", color: "#8b5cf6" },
    { id: "shopping", name: "购物消费", icon: "ShoppingBag", color: "#ec4899" },
    { id: "housing", name: "居住费用", icon: "Home", color: "#06b6d4" },
    { id: "entertainment", name: "娱乐消费", icon: "Smile", color: "#f59e0b" },
    { id: "education", name: "教育费用", icon: "BookOpen", color: "#6366f1" },
    { id: "medical", name: "医疗费用", icon: "HeartPulse", color: "#ef4444" },
    { id: "other", name: "其他支出", icon: "MinusCircle", color: "#6b7280" },
  ],
} as const

/**
 * 记录渠道定义
 */
export const RECORD_CHANNELS = [
  { id: "cash", name: "现金", icon: "Banknote", color: "#22c55e" },
  { id: "bank", name: "银行卡", icon: "CreditCard", color: "#3b82f6" },
  { id: "credit_card", name: "信用卡", icon: "CreditCard", color: "#f59e0b" },
  { id: "alipay", name: "支付宝", icon: "Smartphone", color: "#1677ff" },
  { id: "wechat_pay", name: "微信支付", icon: "MessageCircle", color: "#07c160" },
  { id: "other", name: "其他", icon: "MoreHorizontal", color: "#6b7280" },
] as const

/**
 * 图表颜色配置
 */
export const CHART_COLORS = {
  income: "#22c55e",
  expense: "#ef4444",
  background: "rgba(255, 255, 255, 0.1)",
  grid: "rgba(0, 0, 0, 0.05)",
  text: "#64748b",
  pieColors: [
    "#22c55e", // 收入
    "#3b82f6", // 投资收益
    "#f59e0b", // 餐饮消费
    "#8b5cf6", // 交通费用
    "#ec4899", // 购物消费
    "#06b6d4", // 居住费用
    "#f97316", // 娱乐消费
    "#6366f1", // 教育费用
  ],
} as const

/**
 * 响应式断点常量
 */
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
} as const

/**
 * 侧边栏宽度常量
 */
export const SIDEBAR_WIDTHS = {
  expanded: "16rem",
  collapsed: "3rem",
  mobile: "18rem",
} as const

/**
 * 动画持续时间常量
 */
export const ANIMATION_DURATION = {
  fast: 150,
  normal: 200,
  slow: 300,
} as const

/**
 * 本地存储键名常量
 */
export const STORAGE_KEYS = {
  theme: "theme",
  sidebarState: "sidebar_state",
  userPreferences: "user_preferences",
  cachedData: "cached_data",
} as const

/**
 * 日期格式常量
 */
export const DATE_FORMATS = {
  display: "yyyy年MM月dd日",
  short: "yyyy-MM-dd",
  long: "yyyy年MM月dd日 HH:mm",
  time: "HH:mm",
} as const

/**
 * 分页常量
 */
export const PAGINATION = {
  defaultPageSize: 10,
  pageSizeOptions: [10, 20, 50, 100],
} as const

/**
 * 表格配置常量
 */
export const TABLE_CONFIG = {
  defaultSortColumn: "date",
  defaultSortDirection: "desc" as const,
  sortableColumns: ["date", "amount", "category"],
  filterableColumns: ["type", "category", "status"],
} as const

/**
 * 状态标签常量
 */
export const STATUS_LABELS = {
  completed: { label: "已完成", color: "bg-green-500", textColor: "text-green-700" },
  pending: { label: "待处理", color: "bg-yellow-500", textColor: "text-yellow-700" },
  cancelled: { label: "已取消", color: "bg-red-500", textColor: "text-red-700" },
} as const

/**
 * 金额范围常量
 */
export const AMOUNT_RANGES = {
  small: 1000,
  medium: 10000,
  large: 100000,
} as const

/**
 * 会员等级常量
 */
export const MEMBERSHIP_LEVELS = [
  { level: 1, name: "普通会员", color: "#6b7280" },
  { level: 2, name: "黄金会员", color: "#f59e0b" },
  { level: 3, name: "铂金会员", color: "#6b7280" },
  { level: 4, name: "钻石会员", color: "#06b6d4" },
] as const

/**
 * 通知类型常量
 */
export const NOTIFICATION_TYPES = {
  success: "success",
  error: "error",
  warning: "warning",
  info: "info",
} as const

/**
 * 货币符号常量
 */
export const CURRENCY_SYMBOLS = {
  CNY: "¥",
  USD: "$",
  EUR: "€",
  GBP: "£",
  JPY: "¥",
} as const

/**
 * 时间间隔常量（用于数据刷新等）
 */
export const TIME_INTERVALS = {
  minute: 60 * 1000,
  hour: 60 * 60 * 1000,
  day: 24 * 60 * 60 * 1000,
  week: 7 * 24 * 60 * 60 * 1000,
} as const

/**
 * 最大长度限制常量
 */
export const MAX_LENGTHS = {
  description: 200,
  notes: 500,
  categoryName: 20,
  recordCount: 1000,
} as const
