/**
 * 导航菜单配置
 */
export const NAV_MENU_ITEMS = [
  {
    description: '查看财务概览',
    href: '/dashboard',
    icon: 'Home',
    label: '仪表板',
  },
  {
    description: '管理收支记录',
    href: '/records',
    icon: 'FileText',
    label: '记录',
  },
  {
    description: '财务数据分析',
    href: '/statistics',
    icon: 'BarChart3',
    label: '统计',
  },
  {
    description: '应用配置',
    href: '/settings',
    icon: 'Settings',
    label: '设置',
  },
] as const

/**
 * 财务分类定义
 */
export const FINANCE_CATEGORIES = {
  expense: [
    { color: '#f97316', icon: 'Utensils', id: 'food', name: '餐饮消费' },
    { color: '#8b5cf6', icon: 'Car', id: 'transport', name: '交通费用' },
    { color: '#ec4899', icon: 'ShoppingBag', id: 'shopping', name: '购物消费' },
    { color: '#06b6d4', icon: 'Home', id: 'housing', name: '居住费用' },
    { color: '#f59e0b', icon: 'Smile', id: 'entertainment', name: '娱乐消费' },
    { color: '#6366f1', icon: 'BookOpen', id: 'education', name: '教育费用' },
    { color: '#ef4444', icon: 'HeartPulse', id: 'medical', name: '医疗费用' },
    { color: '#6b7280', icon: 'MinusCircle', id: 'other', name: '其他支出' },
  ],
  income: [
    { color: '#22c55e', icon: 'DollarSign', id: 'salary', name: '工资收入' },
    {
      color: '#3b82f6',
      icon: 'TrendingUp',
      id: 'investment',
      name: '投资收益',
    },
    { color: '#8b5cf6', icon: 'Briefcase', id: 'freelance', name: '兼职收入' },
    { color: '#06b6d4', icon: 'PlusCircle', id: 'other', name: '其他收入' },
  ],
} as const

/**
 * 记录渠道定义
 */
export const RECORD_CHANNELS = [
  { color: '#22c55e', icon: 'Banknote', id: 'cash', name: '现金' },
  { color: '#3b82f6', icon: 'CreditCard', id: 'bank', name: '银行卡' },
  { color: '#f59e0b', icon: 'CreditCard', id: 'credit_card', name: '信用卡' },
  { color: '#1677ff', icon: 'Smartphone', id: 'alipay', name: '支付宝' },
  {
    color: '#07c160',
    icon: 'MessageCircle',
    id: 'wechat_pay',
    name: '微信支付',
  },
  { color: '#6b7280', icon: 'MoreHorizontal', id: 'other', name: '其他' },
] as const

/**
 * 图表颜色配置
 */
export const CHART_COLORS = {
  background: 'rgba(255, 255, 255, 0.1)',
  expense: '#ef4444',
  grid: 'rgba(0, 0, 0, 0.05)',
  income: '#22c55e',
  pieColors: [
    // 收入
    '#22c55e',
    // 投资收益
    '#3b82f6',
    // 餐饮消费
    '#f59e0b',
    // 交通费用
    '#8b5cf6',
    // 购物消费
    '#ec4899',
    // 居住费用
    '#06b6d4',
    // 娱乐消费
    '#f97316',
    // 教育费用
    '#6366f1',
  ],
  text: '#64748b',
} as const

/**
 * 响应式断点常量
 */
export const BREAKPOINTS = {
  '2xl': 1536,
  lg: 1024,
  md: 768,
  sm: 640,
  xl: 1280,
} as const

/**
 * 侧边栏宽度常量
 */
export const SIDEBAR_WIDTHS = {
  collapsed: '3rem',
  expanded: '16rem',
  mobile: '18rem',
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
  cachedData: 'cached_data',
  sidebarState: 'sidebar_state',
  theme: 'theme',
  userPreferences: 'user_preferences',
} as const

/**
 * 日期格式常量
 */
export const DATE_FORMATS = {
  display: 'yyyy年MM月dd日',
  long: 'yyyy年MM月dd日 HH:mm',
  short: 'yyyy-MM-dd',
  time: 'HH:mm',
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
  defaultSortColumn: 'date',
  defaultSortDirection: 'desc' as const,
  filterableColumns: ['type', 'category', 'status'],
  sortableColumns: ['date', 'amount', 'category'],
} as const

/**
 * 状态标签常量
 */
export const STATUS_LABELS = {
  cancelled: {
    color: 'bg-red-500',
    label: '已取消',
    textColor: 'text-red-700',
  },
  completed: {
    color: 'bg-green-500',
    label: '已完成',
    textColor: 'text-green-700',
  },
  pending: {
    color: 'bg-yellow-500',
    label: '待处理',
    textColor: 'text-yellow-700',
  },
} as const

/**
 * 金额范围常量
 */
export const AMOUNT_RANGES = {
  large: 100_000,
  medium: 10_000,
  small: 1000,
} as const

/**
 * 会员等级常量
 */
export const MEMBERSHIP_LEVELS = [
  { color: '#6b7280', level: 1, name: '普通会员' },
  { color: '#f59e0b', level: 2, name: '黄金会员' },
  { color: '#6b7280', level: 3, name: '铂金会员' },
  { color: '#06b6d4', level: 4, name: '钻石会员' },
] as const

/**
 * 通知类型常量
 */
export const NOTIFICATION_TYPES = {
  error: 'error',
  info: 'info',
  success: 'success',
  warning: 'warning',
} as const

/**
 * 货币符号常量
 */
export const CURRENCY_SYMBOLS = {
  CNY: '¥',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
  USD: '$',
} as const

/**
 * 时间间隔常量（用于数据刷新等）
 */
export const TIME_INTERVALS = {
  day: 24 * 60 * 60 * 1000,
  hour: 60 * 60 * 1000,
  minute: 60 * 1000,
  week: 7 * 24 * 60 * 60 * 1000,
} as const

/**
 * 最大长度限制常量
 */
export const MAX_LENGTHS = {
  categoryName: 20,
  description: 200,
  notes: 500,
  recordCount: 1000,
} as const
