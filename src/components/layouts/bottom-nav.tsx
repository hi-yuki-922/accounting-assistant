import { useLocation } from '@tanstack/react-router'
import {
  HomeIcon,
  FileTextIcon,
  BookIcon,
  BarChart3Icon,
  MessageSquareIcon,
  SettingsIcon,
} from 'lucide-react'
import * as React from 'react'

import { cn } from '@/lib/utils'

interface BottomNavProps {
  className?: string
}

export const BottomNav = ({ className }: BottomNavProps) => {
  const location = useLocation()

  const navItems = [
    { href: '/dashboard', icon: HomeIcon, label: '首页' },
    { href: '/records', icon: FileTextIcon, label: '记录' },
    { href: '/books', icon: BookIcon, label: '账本' },
    { href: '/statistics', icon: BarChart3Icon, label: '统计' },
    { href: '/chatbot', icon: MessageSquareIcon, label: 'AI' },
    { href: '/settings', icon: SettingsIcon, label: '设置' },
  ]

  return (
    <nav
      className={cn(
        'fixed bottom-0 left-0 right-0 border-t bg-background md:hidden',
        className
      )}
    >
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = location.pathname === item.href
          return (
            <a
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-1 p-2 text-sm',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <item.icon
                className={cn('h-5 w-5', isActive && 'fill-current')}
              />
              <span className="text-xs">{item.label}</span>
            </a>
          )
        })}
      </div>
    </nav>
  )
}
