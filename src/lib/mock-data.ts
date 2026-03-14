import { StatsCardData, TransactionRecord, ChartDataPoint, QuickAction, UserInfo } from "@/types/dashboard"
import { FinanceRecord, FinanceCategory, FinanceStats, MonthlyFinanceData } from "@/types/finance"

/**
 * 模拟统计卡片数据
 */
export const mockStatsCards: StatsCardData[] = [
  {
    title: "总资产",
    value: "128,500.00",
    trend: {
      value: 8.5,
      isPositive: true,
    },
    icon: "Wallet",
    iconColor: "text-blue-500",
  },
  {
    title: "本月收入",
    value: "32,000.00",
    trend: {
      value: 12.5,
      isPositive: true,
    },
    icon: "TrendingUp",
    iconColor: "text-green-500",
  },
  {
    title: "本月支出",
    value: "18,500.00",
    trend: {
      value: -5.2,
      isPositive: false,
    },
    icon: "TrendingDown",
    iconColor: "text-red-500",
  },
  {
    title: "净资产",
    value: "110,000.00",
    trend: {
      value: 6.8,
      isPositive: true,
    },
    icon: "PieChart",
    iconColor: "text-purple-500",
  },
]

/**
 * 模拟交易记录数据
 */
export const mockTransactions: TransactionRecord[] = [
  {
    id: "1",
    date: "2024-03-15",
    type: "income",
    category: "工资收入",
    amount: 28000,
    description: "3月份工资",
    status: "completed",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=company",
  },
  {
    id: "2",
    date: "2024-03-14",
    type: "expense",
    category: "餐饮消费",
    amount: 328,
    description: "商务午餐",
    status: "completed",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=food",
  },
  {
    id: "3",
    date: "2024-03-13",
    type: "expense",
    category: "交通费用",
    amount: 150,
    description: "打车费用",
    status: "completed",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=transport",
  },
  {
    id: "4",
    date: "2024-03-12",
    type: "income",
    category: "投资收益",
    amount: 4500,
    description: "基金分红",
    status: "completed",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=invest",
  },
  {
    id: "5",
    date: "2024-03-11",
    type: "expense",
    category: "购物消费",
    amount: 899,
    description: "购买办公用品",
    status: "completed",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=shopping",
  },
  {
    id: "6",
    date: "2024-03-10",
    type: "expense",
    category: "居住费用",
    amount: 3500,
    description: "3月份房租",
    status: "completed",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=rent",
  },
  {
    id: "7",
    date: "2024-03-09",
    type: "expense",
    category: "娱乐消费",
    amount: 580,
    description: "周末聚餐",
    status: "completed",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=entertainment",
  },
  {
    id: "8",
    date: "2024-03-08",
    type: "income",
    category: "兼职收入",
    amount: 3200,
    description: "项目咨询费",
    status: "completed",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=freelance",
  },
  {
    id: "9",
    date: "2024-03-07",
    type: "expense",
    category: "交通费用",
    amount: 230,
    description: "高铁票",
    status: "completed",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=train",
  },
  {
    id: "10",
    date: "2024-03-06",
    type: "expense",
    category: "医疗费用",
    amount: 680,
    description: "药品购买",
    status: "completed",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=medical",
  },
  {
    id: "11",
    date: "2024-03-05",
    type: "income",
    category: "其他收入",
    amount: 1200,
    description: "二手物品出售",
    status: "completed",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sell",
  },
  {
    id: "12",
    date: "2024-03-04",
    type: "expense",
    category: "教育费用",
    amount: 499,
    description: "在线课程",
    status: "pending",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=education",
  },
  {
    id: "13",
    date: "2024-03-03",
    type: "expense",
    category: "餐饮消费",
    amount: 156,
    description: "早餐咖啡",
    status: "completed",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=coffee",
  },
  {
    id: "14",
    date: "2024-03-02",
    type: "expense",
    category: "购物消费",
    amount: 2399,
    description: "笔记本电脑维修",
    status: "completed",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=repair",
  },
  {
    id: "15",
    date: "2024-03-01",
    type: "income",
    category: "工资收入",
    amount: 3000,
    description: "年终奖发放",
    status: "completed",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=bonus",
  },
]

/**
 * 模拟图表数据
 */
export const mockChartData: ChartDataPoint[] = [
  { month: "10月", income: 28000, expense: 15000 },
  { month: "11月", income: 32000, expense: 18000 },
  { month: "12月", income: 29000, expense: 22000 },
  { month: "1月", income: 35000, expense: 17000 },
  { month: "2月", income: 30000, expense: 19000 },
  { month: "3月", income: 32000, expense: 18500 },
]

/**
 * 模拟快速操作数据
 */
export const mockQuickActions: QuickAction[] = [
  {
    id: "add-record",
    title: "记一笔",
    description: "快速记录收入或支出",
    icon: "Plus",
    primary: true,
    onClick: () => {
      console.log("添加记录")
    },
  },
  {
    id: "view-reports",
    title: "查看报表",
    description: "查看详细的财务分析报告",
    icon: "BarChart3",
    primary: false,
    onClick: () => {
      console.log("查看报表")
    },
  },
  {
    id: "import-data",
    title: "数据导入",
    description: "导入银行对账单或其他数据",
    icon: "Upload",
    primary: false,
    onClick: () => {
      console.log("导入数据")
    },
  },
]

/**
 * 模拟用户信息
 */
export const mockUserInfo: UserInfo = {
  id: "user_123",
  name: "张三",
  email: "zhangsan@example.com",
  avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix",
  membershipLevel: "黄金会员",
}

/**
 * 模拟财务统计数据
 */
export const mockFinanceStats: FinanceStats = {
  totalAssets: 128500,
  monthlyIncome: 32000,
  monthlyExpense: 18500,
  netAssets: 110000,
  incomeTrend: {
    value: 12.5,
    isPositive: true,
  },
  expenseTrend: {
    value: -5.2,
    isPositive: false,
  },
}

/**
 * 模拟财务分类数据
 */
export const mockFinanceCategories: FinanceCategory[] = [
  {
    id: "cat_income_salary",
    name: "工资收入",
    icon: "DollarSign",
    color: "#22c55e",
    enabled: true,
    order: 1,
  },
  {
    id: "cat_income_investment",
    name: "投资收益",
    icon: "TrendingUp",
    color: "#3b82f6",
    enabled: true,
    order: 2,
  },
  {
    id: "cat_expense_food",
    name: "餐饮消费",
    icon: "Utensils",
    color: "#f97316",
    enabled: true,
    order: 1,
  },
  {
    id: "cat_expense_transport",
    name: "交通费用",
    icon: "Car",
    color: "#8b5cf6",
    enabled: true,
    order: 2,
  },
  {
    id: "cat_expense_shopping",
    name: "购物消费",
    icon: "ShoppingBag",
    color: "#ec4899",
    enabled: true,
    order: 3,
  },
  {
    id: "cat_expense_housing",
    name: "居住费用",
    icon: "Home",
    color: "#06b6d4",
    enabled: true,
    order: 4,
  },
]

/**
 * 模拟月度财务数据
 */
export const mockMonthlyFinanceData: MonthlyFinanceData[] = [
  {
    month: "2024年10月",
    year: 2024,
    monthNumber: 10,
    totalIncome: 28000,
    totalExpense: 15000,
    netIncome: 13000,
    transactionCount: 45,
  },
  {
    month: "2024年11月",
    year: 2024,
    monthNumber: 11,
    totalIncome: 32000,
    totalExpense: 18000,
    netIncome: 14000,
    transactionCount: 52,
  },
  {
    month: "2024年12月",
    year: 2024,
    monthNumber: 12,
    totalIncome: 29000,
    totalExpense: 22000,
    netIncome: 7000,
    transactionCount: 38,
  },
  {
    month: "2025年1月",
    year: 2025,
    monthNumber: 1,
    totalIncome: 35000,
    totalExpense: 17000,
    netIncome: 18000,
    transactionCount: 48,
  },
  {
    month: "2025年2月",
    year: 2025,
    monthNumber: 2,
    totalIncome: 30000,
    totalExpense: 19000,
    netIncome: 11000,
    transactionCount: 41,
  },
  {
    month: "2025年3月",
    year: 2025,
    monthNumber: 3,
    totalIncome: 32000,
    totalExpense: 18500,
    netIncome: 13500,
    transactionCount: 55,
  },
]

/**
 * 获取随机交易记录（用于测试）
 */
export function getRandomTransaction(): TransactionRecord {
  const randomIndex = Math.floor(Math.random() * mockTransactions.length)
  return { ...mockTransactions[randomIndex] }
}

/**
 * 获取指定数量的交易记录
 */
export function getTransactions(count: number = 10): TransactionRecord[] {
  return mockTransactions.slice(0, count)
}

/**
 * 根据类型筛选交易记录
 */
export function getTransactionsByType(type: "income" | "expense"): TransactionRecord[] {
  return mockTransactions.filter((transaction) => transaction.type === type)
}

/**
 * 计算总收入
 */
export function calculateTotalIncome(): number {
  return mockTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0)
}

/**
 * 计算总支出
 */
export function calculateTotalExpense(): number {
  return mockTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0)
}
