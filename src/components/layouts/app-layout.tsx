import { Link, useLocation } from '@tanstack/react-router'
import {
  HomeIcon,
  BookIcon,
  MoonIcon,
  SunIcon,
  MessageSquareIcon,
  UsersIcon,
  PackageIcon,
  ClipboardListIcon,
  TagIcon,
  SettingsIcon,
  ChevronDownIcon,
  CalculatorIcon,
  DatabaseIcon,
} from 'lucide-react'
import { useTheme } from 'next-themes'
import * as React from 'react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

type AppLayoutProps = {
  children: React.ReactNode
}

const mainNavItems = [
  { href: '/dashboard', label: '总览', icon: HomeIcon },
  { href: '/books', label: '账本', icon: BookIcon },
  { href: '/orders', label: '订单管理', icon: ClipboardListIcon },
  { href: '/chatbot', label: 'AI 助手', icon: MessageSquareIcon },
]

const baseDataItems = [
  { href: '/customers', label: '客户管理', icon: UsersIcon },
  { href: '/products', label: '商品管理', icon: PackageIcon },
  { href: '/categories', label: '品类管理', icon: TagIcon },
]

const baseDataPaths = new Set(['/customers', '/products', '/categories'])

export const AppLayout = ({ children }: AppLayoutProps) => {
  const { resolvedTheme, setTheme } = useTheme()
  const location = useLocation()

  return (
    <div className="flex h-svh flex-col">
      {/* 顶部导航栏 */}
      <header className="flex h-14 items-center border-b px-4">
        {/* 品牌区 */}
        <div className="flex items-center gap-2 mr-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <CalculatorIcon className="h-5 w-5" />
          </div>
          <span className="text-sm font-semibold">Accounting-Assistant</span>
        </div>

        {/* 一级导航菜单 */}
        <nav className="flex items-center gap-1">
          {mainNavItems.map((item) => {
            const isActive = location.pathname === item.href
            return (
              <Link
                key={item.href}
                to={item.href}
                className={
                  'flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors ' +
                  (isActive
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground')
                }
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            )
          })}

          {/* 基础资料二级下拉 */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={
                  'flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ' +
                  (baseDataPaths.has(location.pathname)
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground')
                }
              >
                <DatabaseIcon className="h-4 w-4" />
                基础资料
                <ChevronDownIcon className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {baseDataItems.map((item) => (
                <DropdownMenuItem key={item.href} asChild>
                  <Link to={item.href} className="flex items-center gap-2">
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>

        {/* 右侧工具区 */}
        <div className="ml-auto flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() =>
              setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
            }
          >
            {resolvedTheme === 'dark' ? (
              <SunIcon className="h-4 w-4" />
            ) : (
              <MoonIcon className="h-4 w-4" />
            )}
            <span className="sr-only">切换主题</span>
          </Button>

          {/* 用户头像下拉 */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 rounded-md px-2 py-1 text-sm hover:bg-accent/50">
                <Avatar className="h-7 w-7">
                  <AvatarImage
                    src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"
                    alt="用户头像"
                  />
                  <AvatarFallback>张</AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">张三</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link to="/settings" className="flex items-center gap-2">
                  <SettingsIcon className="h-4 w-4" />
                  设置
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* 内容区域 */}
      <main className="flex-1 overflow-hidden p-2 sm:p-4 md:p-6">
        {children}
      </main>
    </div>
  )
}
