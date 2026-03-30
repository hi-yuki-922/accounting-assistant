import {
  Wallet,
  TrendingUp,
  TrendingDown,
  PieChart,
  Plus,
  BarChart3,
  Upload,
} from 'lucide-react'

import type {
  StatsCardData,
  TransactionRecord,
  ChartDataPoint,
  QuickAction,
  UserInfo,
} from '@/types/dashboard'
import type {
  FinanceCategory,
  FinanceStats,
  MonthlyFinanceData,
} from '@/types/finance'

/**
 * 模拟统计卡片数据
 */
export const mockStatsCards: StatsCardData[] = [
  {
    icon: Wallet,
    iconColor: 'text-chart-1',
    title: '总资产',
    trend: {
      isPositive: true,
      value: 8.5,
    },
    value: '128,500.00',
  },
  {
    icon: TrendingUp,
    iconColor: 'text-chart-2',
    title: '本月收入',
    trend: {
      isPositive: true,
      value: 12.5,
    },
    value: '32,000.00',
  },
  {
    icon: TrendingDown,
    iconColor: 'text-destructive',
    title: '本月支出',
    trend: {
      isPositive: false,
      value: -5.2,
    },
    value: '18,500.00',
  },
  {
    icon: PieChart,
    iconColor: 'text-chart-3',
    title: '净资产',
    trend: {
      isPositive: true,
      value: 6.8,
    },
    value: '110,000.00',
  },
]

/**
 * 模拟交易记录数据
 */
export const mockTransactions: TransactionRecord[] = [
  {
    amount: 28_000,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=company',
    category: '工资收入',
    date: '2024-03-15',
    description: '3月份工资',
    id: '1',
    status: 'completed',
    type: 'income',
  },
  {
    amount: 328,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=food',
    category: '餐饮消费',
    date: '2024-03-14',
    description: '商务午餐',
    id: '2',
    status: 'completed',
    type: 'expense',
  },
  {
    amount: 150,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=transport',
    category: '交通费用',
    date: '2024-03-13',
    description: '打车费用',
    id: '3',
    status: 'completed',
    type: 'expense',
  },
  {
    amount: 4500,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=invest',
    category: '投资收益',
    date: '2024-03-12',
    description: '基金分红',
    id: '4',
    status: 'completed',
    type: 'income',
  },
  {
    amount: 899,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=shopping',
    category: '购物消费',
    date: '2024-03-11',
    description: '购买办公用品',
    id: '5',
    status: 'completed',
    type: 'expense',
  },
  {
    amount: 3500,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=rent',
    category: '居住费用',
    date: '2024-03-10',
    description: '3月份房租',
    id: '6',
    status: 'completed',
    type: 'expense',
  },
  {
    amount: 580,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=entertainment',
    category: '娱乐消费',
    date: '2024-03-09',
    description: '周末聚餐',
    id: '7',
    status: 'completed',
    type: 'expense',
  },
  {
    amount: 3200,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=freelance',
    category: '兼职收入',
    date: '2024-03-08',
    description: '项目咨询费',
    id: '8',
    status: 'completed',
    type: 'income',
  },
  {
    amount: 230,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=train',
    category: '交通费用',
    date: '2024-03-07',
    description: '高铁票',
    id: '9',
    status: 'completed',
    type: 'expense',
  },
  {
    amount: 680,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=medical',
    category: '医疗费用',
    date: '2024-03-06',
    description: '药品购买',
    id: '10',
    status: 'completed',
    type: 'expense',
  },
  {
    amount: 1200,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sell',
    category: '其他收入',
    date: '2024-03-05',
    description: '二手物品出售',
    id: '11',
    status: 'completed',
    type: 'income',
  },
  {
    amount: 499,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=education',
    category: '教育费用',
    date: '2024-03-04',
    description: '在线课程',
    id: '12',
    status: 'pending',
    type: 'expense',
  },
  {
    amount: 156,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=coffee',
    category: '餐饮消费',
    date: '2024-03-03',
    description: '早餐咖啡',
    id: '13',
    status: 'completed',
    type: 'expense',
  },
  {
    amount: 2399,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=repair',
    category: '购物消费',
    date: '2024-03-02',
    description: '笔记本电脑维修',
    id: '14',
    status: 'completed',
    type: 'expense',
  },
  {
    amount: 3000,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=bonus',
    category: '工资收入',
    date: '2024-03-01',
    description: '年终奖发放',
    id: '15',
    status: 'completed',
    type: 'income',
  },
]

/**
 * 模拟图表数据
 */
export const mockChartData: ChartDataPoint[] = [
  { expense: 15_000, income: 28_000, month: '10月' },
  { expense: 18_000, income: 32_000, month: '11月' },
  { expense: 22_000, income: 29_000, month: '12月' },
  { expense: 17_000, income: 35_000, month: '1月' },
  { expense: 19_000, income: 30_000, month: '2月' },
  { expense: 18_500, income: 32_000, month: '3月' },
]

/**
 * 模拟快速操作数据
 */
export const mockQuickActions: QuickAction[] = [
  {
    description: '快速记录收入或支出',
    icon: Plus,
    id: 'add-record',
    primary: true,
    title: '记一笔',
  },
  {
    description: '查看详细的财务分析报告',
    icon: BarChart3,
    id: 'view-reports',
    primary: false,
    title: '查看报表',
  },
  {
    description: '导入银行对账单或其他数据',
    icon: Upload,
    id: 'import-data',
    primary: false,
    title: '数据导入',
  },
]

/**
 * 模拟用户信息
 */
export const mockUserInfo: UserInfo = {
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
  email: 'zhangsan@example.com',
  id: 'user_123',
  membershipLevel: '黄金会员',
  name: '张三',
}

/**
 * 模拟财务统计数据
 */
export const mockFinanceStats: FinanceStats = {
  expenseTrend: {
    isPositive: false,
    value: -5.2,
  },
  incomeTrend: {
    isPositive: true,
    value: 12.5,
  },
  monthlyExpense: 18_500,
  monthlyIncome: 32_000,
  netAssets: 110_000,
  totalAssets: 128_500,
}

/**
 * 模拟财务分类数据
 */
export const mockFinanceCategories: FinanceCategory[] = [
  {
    color: '#22c55e',
    enabled: true,
    icon: 'DollarSign',
    id: 'cat_income_salary',
    name: '工资收入',
    order: 1,
  },
  {
    color: '#3b82f6',
    enabled: true,
    icon: 'TrendingUp',
    id: 'cat_income_investment',
    name: '投资收益',
    order: 2,
  },
  {
    color: '#f97316',
    enabled: true,
    icon: 'Utensils',
    id: 'cat_expense_food',
    name: '餐饮消费',
    order: 1,
  },
  {
    color: '#8b5cf6',
    enabled: true,
    icon: 'Car',
    id: 'cat_expense_transport',
    name: '交通费用',
    order: 2,
  },
  {
    color: '#ec4899',
    enabled: true,
    icon: 'ShoppingBag',
    id: 'cat_expense_shopping',
    name: '购物消费',
    order: 3,
  },
  {
    color: '#06b6d4',
    enabled: true,
    icon: 'Home',
    id: 'cat_expense_housing',
    name: '居住费用',
    order: 4,
  },
]

/**
 * 模拟月度财务数据
 */
export const mockMonthlyFinanceData: MonthlyFinanceData[] = [
  {
    month: '2024年10月',
    monthNumber: 10,
    netIncome: 13_000,
    totalExpense: 15_000,
    totalIncome: 28_000,
    transactionCount: 45,
    year: 2024,
  },
  {
    month: '2024年11月',
    monthNumber: 11,
    netIncome: 14_000,
    totalExpense: 18_000,
    totalIncome: 32_000,
    transactionCount: 52,
    year: 2024,
  },
  {
    month: '2024年12月',
    monthNumber: 12,
    netIncome: 7000,
    totalExpense: 22_000,
    totalIncome: 29_000,
    transactionCount: 38,
    year: 2024,
  },
  {
    month: '2025年1月',
    monthNumber: 1,
    netIncome: 18_000,
    totalExpense: 17_000,
    totalIncome: 35_000,
    transactionCount: 48,
    year: 2025,
  },
  {
    month: '2025年2月',
    monthNumber: 2,
    netIncome: 11_000,
    totalExpense: 19_000,
    totalIncome: 30_000,
    transactionCount: 41,
    year: 2025,
  },
  {
    month: '2025年3月',
    monthNumber: 3,
    netIncome: 13_500,
    totalExpense: 18_500,
    totalIncome: 32_000,
    transactionCount: 55,
    year: 2025,
  },
]

/**
 * 获取随机交易记录（用于测试）
 */
export const getRandomTransaction = (): TransactionRecord => {
  const randomIndex = Math.floor(Math.random() * mockTransactions.length)
  return { ...mockTransactions[randomIndex] }
}

/**
 * 获取指定数量的交易记录
 */
export const getTransactions = (count = 10): TransactionRecord[] =>
  mockTransactions.slice(0, count)

/**
 * 根据类型筛选交易记录
 */
export const getTransactionsByType = (
  type: 'income' | 'expense'
): TransactionRecord[] =>
  mockTransactions.filter((transaction) => transaction.type === type)

/**
 * 计算总收入
 */
export const calculateTotalIncome = (): number =>
  mockTransactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)

/**
 * 计算总支出
 */
export const calculateTotalExpense = (): number =>
  mockTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)
