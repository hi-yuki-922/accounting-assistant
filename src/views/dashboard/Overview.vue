<script setup lang="ts">
/**
 * 仪表盘概览页面
 * 显示财务概况、最近交易、快捷操作等
 */

import { ref } from 'vue'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Icon } from '@iconify/vue'

/**
 * 财务概览数据
 */
const overviewData = ref({
  totalBalance: 12580.50,
  monthlyIncome: 8540.00,
  monthlyExpense: 3260.50,
  savingsRate: 61.8,
})

/**
 * 最近交易记录
 */
const recentTransactions = ref([
  { id: 1, title: '工资收入', amount: 8500.00, date: '2026-03-10', type: 'income', category: '工资' },
  { id: 2, title: '超市购物', amount: 328.50, date: '2026-03-09', type: 'expense', category: '生活' },
  { id: 3, title: '交通费', amount: 56.00, date: '2026-03-08', type: 'expense', category: '交通' },
  { id: 4, title: '餐饮', amount: 128.00, date: '2026-03-08', type: 'expense', category: '餐饮' },
  { id: 5, title: '投资收益', amount: 40.50, date: '2026-03-07', type: 'income', category: '投资' },
])

/**
 * 快捷操作
 */
const quickActions = [
  { icon: 'lucide:plus', label: '记一笔', color: 'text-blue' },
  { icon: 'lucide:repeat', label: '转账', color: 'text-green' },
  { icon: 'lucide:file-text', label: '账单', color: 'text-purple' },
  { icon: 'lucide:pie-chart', label: '统计', color: 'text-cyan' },
]
</script>

<template>
  <div class="dashboard-overview">
    <!-- 欢迎区域 -->
    <div class="welcome-section">
      <h2 class="welcome-title">欢迎回来</h2>
      <p class="welcome-subtitle">查看您的财务概况</p>
    </div>

    <!-- 财务概览卡片 -->
    <div class="overview-cards">
      <Card class="overview-card primary">
        <CardContent class="card-content">
          <div class="card-icon">
            <Icon icon="lucide:wallet" />
          </div>
          <div class="card-info">
            <p class="card-label">总余额</p>
            <p class="card-value">¥{{ overviewData.totalBalance.toLocaleString() }}</p>
          </div>
        </CardContent>
      </Card>

      <Card class="overview-card">
        <CardContent class="card-content">
          <div class="card-icon income">
            <Icon icon="lucide:arrow-down-left" />
          </div>
          <div class="card-info">
            <p class="card-label">本月收入</p>
            <p class="card-value">¥{{ overviewData.monthlyIncome.toLocaleString() }}</p>
          </div>
        </CardContent>
      </Card>

      <Card class="overview-card">
        <CardContent class="card-content">
          <div class="card-icon expense">
            <Icon icon="lucide:arrow-up-right" />
          </div>
          <div class="card-info">
            <p class="card-label">本月支出</p>
            <p class="card-value">¥{{ overviewData.monthlyExpense.toLocaleString() }}</p>
          </div>
        </CardContent>
      </Card>

      <Card class="overview-card">
        <CardContent class="card-content">
          <div class="card-icon savings">
            <Icon icon="lucide:piggy-bank" />
          </div>
          <div class="card-info">
            <p class="card-label">储蓄率</p>
            <p class="card-value">{{ overviewData.savingsRate }}%</p>
          </div>
        </CardContent>
      </Card>
    </div>

    <div class="content-grid">
      <!-- 快捷操作 -->
      <Card class="quick-actions-card">
        <CardHeader>
          <CardTitle>快捷操作</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="quick-actions-grid">
            <Button
              v-for="action in quickActions"
              :key="action.label"
              variant="ghost"
              class="quick-action-button"
            >
              <Icon :icon="action.icon" :class="action.color" />
              <span>{{ action.label }}</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      <!-- 最近交易 -->
      <Card class="recent-transactions-card">
        <CardHeader class="card-header-with-action">
          <div class="header-left">
            <CardTitle>最近交易</CardTitle>
          </div>
          <Button variant="ghost" size="sm">查看全部</Button>
        </CardHeader>
        <CardContent>
          <div class="transactions-list">
            <div
              v-for="transaction in recentTransactions"
              :key="transaction.id"
              class="transaction-item"
            >
              <div class="transaction-icon">
                <Icon :icon="transaction.type === 'income' ? 'lucide:arrow-down-left' : 'lucide:shopping-bag'" />
              </div>
              <div class="transaction-info">
                <p class="transaction-title">{{ transaction.title }}</p>
                <p class="transaction-meta">{{ transaction.category }} · {{ transaction.date }}</p>
              </div>
              <div class="transaction-amount">
                <Badge :variant="transaction.type === 'income' ? 'default' : 'secondary'">
                  {{ transaction.type === 'income' ? '+' : '-' }}¥{{ transaction.amount.toLocaleString() }}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>

<style scoped>
@reference "@/styles/tailwind.css";
.dashboard-overview {
  @apply space-y-6;
}

.welcome-section {
  @apply mb-2;
}

.welcome-title {
  @apply text-2xl font-semibold text-foreground;
}

.welcome-subtitle {
  @apply text-sm text-muted-foreground mt-1;
}

.overview-cards {
  @apply grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4;
}

.overview-card {
  @apply border-none;
}

.overview-card.primary {
  @apply bg-gradient-to-br from-blue/10 to-blue/5 dark:from-blue/20 dark:to-blue/10;
}

.card-content {
  @apply p-4 lg:p-6 flex items-center gap-4;
}

.card-icon {
  @apply w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0;
}

.card-icon.income {
  @apply bg-green/10;
}

.card-icon.expense {
  @apply bg-red/10;
}

.card-icon.savings {
  @apply bg-purple/10;
}

.card-icon svg {
  @apply w-6 h-6 text-primary;
}

.card-icon.income svg {
  @apply text-green;
}

.card-icon.expense svg {
  @apply text-red;
}

.card-icon.savings svg {
  @apply text-purple;
}

.card-info {
  @apply flex-1 min-w-0;
}

.card-label {
  @apply text-sm text-muted-foreground;
}

.card-value {
  @apply text-xl lg:text-2xl font-semibold text-foreground mt-1;
}

.content-grid {
  @apply grid grid-cols-1 lg:grid-cols-3 gap-6;
}

.quick-actions-card {
  @apply lg:col-span-1;
}

.recent-transactions-card {
  @apply lg:col-span-2;
}

.quick-actions-grid {
  @apply grid grid-cols-2 gap-2;
}

.quick-action-button {
  @apply h-auto flex-col gap-2 py-4;
}

.card-header-with-action {
  @apply flex items-center justify-between;
}

.transactions-list {
  @apply space-y-3;
}

.transaction-item {
  @apply flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors;
}

.transaction-icon {
  @apply w-10 h-10 rounded-full bg-muted flex items-center justify-center shrink-0;
}

.transaction-icon svg {
  @apply w-5 h-5 text-muted-foreground;
}

.transaction-info {
  @apply flex-1 min-w-0;
}

.transaction-title {
  @apply text-sm font-medium text-foreground;
}

.transaction-meta {
  @apply text-xs text-muted-foreground mt-0.5;
}

.transaction-amount {
  @apply shrink-0;
}
</style>
