import { createFileRoute } from '@tanstack/react-router'

import { AppLayout } from '@/components/layouts/app-layout'
import { BottomNav } from '@/components/layouts/bottom-nav'
import {
  mockStatsCards,
  mockChartData,
  mockTransactions,
  mockQuickActions,
} from '@/lib/mock-data'
import { QuickActions } from '@/pages/dashboard/components/quick-actions'
import { RevenueChart } from '@/pages/dashboard/components/revenue-chart'
import { StatsCard } from '@/pages/dashboard/components/stats-card'
import { TransactionsTable } from '@/pages/dashboard/components/transactions-table'

const DashboardRoute = () => (
  <AppLayout>
    <div className="space-y-4 sm:space-y-6 pb-20 md:pb-0">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold sm:text-2xl md:text-3xl">仪表板</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            欢迎使用会计助手！
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:gap-6">
        {/* 统计卡片 */}
        <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {mockStatsCards.map((card) => (
            <StatsCard key={card.title} data={card} />
          ))}
        </div>

        <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
          {/* 收支趋势图表 */}
          <RevenueChart data={mockChartData} />

          {/* 快速操作 */}
          <QuickActions actions={mockQuickActions} />
        </div>

        {/* 最近交易记录 */}
        <TransactionsTable data={mockTransactions.slice(0, 10)} />
      </div>
    </div>
    <BottomNav />
  </AppLayout>
)

export const Route = createFileRoute('/dashboard')({
  component: DashboardRoute,
})
