<script setup lang="ts">
/**
 * 图表分析概览页面
 * 显示收支图表和统计分析
 */

import { ref } from 'vue'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Icon } from '@iconify/vue'

/**
 * 图表类型
 */
type ChartPeriod = 'week' | 'month' | 'year'

const selectedPeriod = ref<ChartPeriod>('month')

/**
 * 收支数据
 */
const summaryData = ref({
  totalIncome: 15840.00,
  totalExpense: 8260.50,
  netIncome: 7579.50,
  savingsRate: 47.9,
})

/**
 * 支出分类数据
 */
const expenseCategories = ref([
  { name: '居住', amount: 2800.00, percentage: 33.9, color: 'bg-blue' },
  { name: '餐饮', amount: 1560.00, percentage: 18.9, color: 'bg-green' },
  { name: '交通', amount: 890.00, percentage: 10.8, color: 'bg-purple' },
  { name: '购物', amount: 1250.00, percentage: 15.1, color: 'bg-red' },
  { name: '娱乐', amount: 680.50, percentage: 8.2, color: 'bg-cyan' },
  { name: '其他', amount: 1080.00, percentage: 13.1, color: 'bg-yellow' },
])
</script>

<template>
  <div class="charts-overview">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h2 class="page-title">图表分析</h2>
        <p class="page-subtitle">查看您的财务分析报表</p>
      </div>
      <div class="period-selector">
        <Button
          v-for="period in ['week', 'month', 'year'] as ChartPeriod[]"
          :key="period"
          :variant="selectedPeriod === period ? 'default' : 'ghost'"
          size="sm"
          @click="selectedPeriod = period"
        >
          {{ period === 'week' ? '本周' : period === 'month' ? '本月' : '本年' }}
        </Button>
      </div>
    </div>

    <!-- 收支概况卡片 -->
    <div class="summary-cards">
      <Card class="summary-card">
        <CardContent class="card-content">
          <div class="card-icon income">
            <Icon icon="lucide:arrow-down-left" />
          </div>
          <div class="card-info">
            <p class="card-label">总收入</p>
            <p class="card-value">¥{{ summaryData.totalIncome.toLocaleString() }}</p>
          </div>
        </CardContent>
      </Card>

      <Card class="summary-card">
        <CardContent class="card-content">
          <div class="card-icon expense">
            <Icon icon="lucide:arrow-up-right" />
          </div>
          <div class="card-info">
            <p class="card-label">总支出</p>
            <p class="card-value">¥{{ summaryData.totalExpense.toLocaleString() }}</p>
          </div>
        </CardContent>
      </Card>

      <Card class="summary-card">
        <CardContent class="card-content">
          <div class="card-icon net">
            <Icon icon="lucide:trending-up" />
          </div>
          <div class="card-info">
            <p class="card-label">净收入</p>
            <p class="card-value">¥{{ summaryData.netIncome.toLocaleString() }}</p>
          </div>
        </CardContent>
      </Card>

      <Card class="summary-card">
        <CardContent class="card-content">
          <div class="card-icon savings">
            <Icon icon="lucide:piggy-bank" />
          </div>
          <div class="card-info">
            <p class="card-label">储蓄率</p>
            <p class="card-value">{{ summaryData.savingsRate }}%</p>
          </div>
        </CardContent>
      </Card>
    </div>

    <div class="charts-grid">
      <!-- 收支趋势图 -->
      <Card class="trend-card">
        <CardHeader>
          <div class="card-header-content">
            <CardTitle>收支趋势</CardTitle>
            <CardDescription>展示近期收支变化</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div class="chart-placeholder">
            <Icon icon="lucide:bar-chart-3" class="placeholder-icon" />
            <p class="placeholder-text">收支趋势图表</p>
            <p class="placeholder-subtext">图表组件待集成</p>
          </div>
        </CardContent>
      </Card>

      <!-- 支出分类图 -->
      <Card class="category-card">
        <CardHeader>
          <div class="card-header-content">
            <CardTitle>支出分类</CardTitle>
            <CardDescription>各类支出占比</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div class="expense-categories">
            <div
              v-for="category in expenseCategories"
              :key="category.name"
              class="category-item"
            >
              <div class="category-info">
                <div class="category-header">
                  <span class="category-name">{{ category.name }}</span>
                  <span class="category-percentage">{{ category.percentage }}%</span>
                </div>
                <div class="category-bar">
                  <div
                    class="bar-fill"
                    :class="category.color"
                    :style="{ width: category.percentage + '%' }"
                  />
                </div>
                <span class="category-amount">¥{{ category.amount.toLocaleString() }}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>

<style scoped>
.charts-overview {
  @apply space-y-6;
}

.page-header {
  @apply flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4;
}

.header-left {
  @apply flex flex-col;
}

.page-title {
  @apply text-2xl font-semibold text-foreground;
}

.page-subtitle {
  @apply text-sm text-muted-foreground mt-1;
}

.period-selector {
  @apply flex items-center gap-2;
}

.summary-cards {
  @apply grid grid-cols-2 lg:grid-cols-4 gap-4;
}

.summary-card {
  @apply border-none;
}

.card-content {
  @apply p-4 flex items-center gap-3;
}

.card-icon {
  @apply w-10 h-10 rounded-lg flex items-center justify-center shrink-0;
}

.card-icon.income {
  @apply bg-green/10;
}

.card-icon.expense {
  @apply bg-red/10;
}

.card-icon.net {
  @apply bg-blue/10;
}

.card-icon.savings {
  @apply bg-purple/10;
}

.card-icon svg {
  @apply w-5 h-5;
}

.card-icon.income svg {
  @apply text-green;
}

.card-icon.expense svg {
  @apply text-red;
}

.card-icon.net svg {
  @apply text-blue;
}

.card-icon.savings svg {
  @apply text-purple;
}

.card-info {
  @apply flex flex-col min-w-0;
}

.card-label {
  @apply text-xs text-muted-foreground;
}

.card-value {
  @apply text-base lg:text-lg font-semibold text-foreground mt-0.5;
}

.charts-grid {
  @apply grid grid-cols-1 lg:grid-cols-2 gap-6;
}

.trend-card {
  @apply lg:col-span-2;
}

.card-header-content {
  @apply flex flex-col gap-1;
}

.chart-placeholder {
  @apply flex flex-col items-center justify-center h-64 bg-muted/30 rounded-lg;
}

.placeholder-icon {
  @apply w-16 h-16 text-muted-foreground/50 mb-4;
}

.placeholder-text {
  @apply text-sm font-medium text-muted-foreground;
}

.placeholder-subtext {
  @apply text-xs text-muted-foreground/70 mt-1;
}

.expense-categories {
  @apply space-y-4;
}

.category-item {
  @apply flex flex-col;
}

.category-info {
  @apply flex flex-col gap-2;
}

.category-header {
  @apply flex items-center justify-between;
}

.category-name {
  @apply text-sm font-medium text-foreground;
}

.category-percentage {
  @apply text-sm font-semibold text-muted-foreground;
}

.category-bar {
  @apply h-2 w-full bg-muted rounded-full overflow-hidden;
}

.bar-fill {
  @apply h-full rounded-full transition-all duration-500;
}

.category-amount {
  @apply text-xs text-muted-foreground;
}
</style>
