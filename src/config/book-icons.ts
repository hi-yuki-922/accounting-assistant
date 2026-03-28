/**
 * 账本图标配置
 * 提供预设的账本图标选项
 */
import type { LucideIcon } from 'lucide-react'
import {
  Banknote,
  Book,
  Briefcase,
  Building2,
  Calculator,
  Car,
  Coins,
  CreditCard,
  Folder,
  FolderOpen,
  Gift,
  Heart,
  Home,
  Landmark,
  PiggyBank,
  Plane,
  ShoppingBag,
  Star,
  Utensils,
  Wallet,
} from 'lucide-react'

export interface BookIcon {
  /** 图标 ID */
  id: string
  /** 图标名称 */
  name: string
  /** 图标组件名（lucide-react） */
  component: LucideIcon
}

/**
 * 账本图标选项列表
 */
export const BOOK_ICONS: BookIcon[] = [
  { id: 'folder', name: '文件夹', component: Folder },
  { id: 'folder-open', name: '打开的文件夹', component: FolderOpen },
  { id: 'briefcase', name: '公文包', component: Briefcase },
  { id: 'wallet', name: '钱包', component: Wallet },
  { id: 'piggy-bank', name: '储蓄罐', component: PiggyBank },
  { id: 'credit-card', name: '信用卡', component: CreditCard },
  { id: 'banknote', name: '钞票', component: Banknote },
  { id: 'coins', name: '硬币', component: Coins },
  { id: 'landmark', name: '银行', component: Landmark },
  { id: 'building-2', name: '建筑', component: Building2 },
  { id: 'home', name: '家庭', component: Home },
  { id: 'car', name: '汽车', component: Car },
  { id: 'utensils', name: '餐具', component: Utensils },
  { id: 'shopping-bag', name: '购物袋', component: ShoppingBag },
  { id: 'gift', name: '礼物', component: Gift },
  { id: 'plane', name: '飞机', component: Plane },
  { id: 'heart', name: '爱心', component: Heart },
  { id: 'star', name: '星星', component: Star },
  { id: 'book', name: '账本', component: Book },
  { id: 'calculator', name: '计算器', component: Calculator },
]

/**
 * 获取默认图标
 */
export const DEFAULT_BOOK_ICON = Folder

/**
 * 根据图标 ID 获取图标配置
 */
export const getBookIconById = (id: string): BookIcon | undefined =>
  BOOK_ICONS.find((icon) => icon.id === id)
