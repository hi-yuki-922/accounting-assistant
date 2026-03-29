import {
  HomeIcon,
  FileTextIcon,
  BookIcon,
  BarChart3Icon,
  SettingsIcon,
  BellIcon,
  MoonIcon,
  SunIcon,
  MessageSquareIcon,
} from 'lucide-react'
import * as React from 'react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { cn } from '@/lib/utils'

interface AppLayoutProps {
  children: React.ReactNode
}

export const AppLayout = ({ children }: AppLayoutProps) => {
  const [theme, setTheme] = React.useState<'light' | 'dark'>('light')

  const handleThemeToggle = React.useCallback(
    () => setTheme((prev) => (prev === 'light' ? 'dark' : 'light')),
    []
  )

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2 p-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <FileTextIcon className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold">会计助手</span>
              <span className="text-xs text-sidebar-foreground/70">
                财务管理
              </span>
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <a href="/dashboard" className="flex items-center gap-2">
                      <HomeIcon className="h-4 w-4" />
                      <span>仪表板</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <a href="/records" className="flex items-center gap-2">
                      <FileTextIcon className="h-4 w-4" />
                      <span>记录</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <a href="/books" className="flex items-center gap-2">
                      <BookIcon className="h-4 w-4" />
                      <span>账本</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <a href="/statistics" className="flex items-center gap-2">
                      <BarChart3Icon className="h-4 w-4" />
                      <span>统计</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <a href="/chatbot" className="flex items-center gap-2">
                      <MessageSquareIcon className="h-4 w-4" />
                      <span>AI 助手</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <a href="/settings" className="flex items-center gap-2">
                      <SettingsIcon className="h-4 w-4" />
                      <span>设置</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <div className="flex items-center gap-2 p-2">
            <Avatar className="h-8 w-8">
              <AvatarImage
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"
                alt="用户头像"
              />
              <AvatarFallback>用户</AvatarFallback>
            </Avatar>
            <div className="flex flex-1 flex-col">
              <span className="text-sm font-medium">张三</span>
              <span className="text-xs text-sidebar-foreground/70">
                zhang@example.com
              </span>
            </div>
          </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 sm:h-16 items-center gap-2 sm:gap-4 border-b px-2 sm:px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4 self-center!" />
          <div className="flex flex-1 items-center justify-end gap-1 sm:gap-2">
            <Button variant="ghost" size="icon-sm" onClick={handleThemeToggle}>
              {theme === 'light' ? (
                <MoonIcon className="h-4 w-4" />
              ) : (
                <SunIcon className="h-4 w-4" />
              )}
              <span className="sr-only">切换主题</span>
            </Button>
            <Button variant="ghost" size="icon-sm">
              <BellIcon className="h-4 w-4" />
              <span className="sr-only">通知</span>
            </Button>
            <Avatar className="h-8 w-8">
              <AvatarImage
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"
                alt="用户头像"
              />
              <AvatarFallback>用户</AvatarFallback>
            </Avatar>
          </div>
        </header>
        <main className={cn('flex-1 p-2 sm:p-4 md:p-6')}>{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}
