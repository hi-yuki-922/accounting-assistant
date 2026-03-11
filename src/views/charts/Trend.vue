<script setup lang="ts">
/**
 * 趋势分析页面
 */

import { ref } from 'vue'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Icon } from '@iconify/vue'

/**
 * 趋势数据
 */
const trendData = ref({
  currentMonth: {
    income: 15840.00,
    expense: 8260.50,
    net: 7579.50,
  },
  lastMonth: {
    income: 15800.00,
    expense: 8520.00,
    net: 7280.00,
  },
  trend: {
    income: 0.3,
    expense: -3.0,
    net: 4.1,
  },
})

/**
 * 年度数据
 * 注：数据将用于图表组件
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const yearlyData = ref([
  { month: '1月', income: 14200, expense: 7850 },
  { month: '2月', income: 15800, expense: 8520 },
  { month: '3月', income: 15840, expense: 8260.50 },
])
</script>

<template>
  <div class="trend-analysis">
    <!-- 页面头部 -->
    <div class="page-header">
      <h2 class="page-title">趋势分析</h2>
      <p class="page-subtitle">分析您的财务趋势变化</p>
    </div>

    <!-- 对比卡片 -->
    <div class="comparison-cards">
      <Card class="comparison-card">
        <CardContent class="card-content">
          <div class="card-header">
            <p class="card-label">收入环比</p>
            <Badge :variant="trendData.trend.income >= 0 ? 'default' : 'secondary'" class="trend-badge">
              <Icon :icon="trendData.trend.income >= 0 ? 'lucide:trending-up' : 'lucide:trending-down'" class="trend-icon" />
              {{ Math.abs(trendData.trend.income) }}%
            </Badge>
          </div>
          <p class="card-value">¥{{ trendData.currentMonth.income.toLocaleString() }}</p>
          <p class="card-comparison">上月: ¥{{ trendData.lastMonth.income.toLocaleString() }}</p>
        </CardContent>
      </Card>

      <Card class="comparison-card">
        <CardContent class="card-content">
          <div class="card-header">
            <p class="card-label">支出环比</p>
            <Badge :variant="trendData.trend.expense <= 0 ? 'default' : 'secondary'" class="trend-badge">
              <Icon :icon="trendData.trend.expense <= 0 ? 'lucide:trending-down' : 'lucide:trending-up'" class="trend-icon" />
              {{ Math.abs(trendData.trend.expense) }}%
            </Badge>
          </div>
          <p class="card-value">¥{{ trendData.currentMonth.expense.toLocaleString() }}</p>
          <p class="card-comparison">上月: ¥{{ trendData.lastMonth.expense.toLocaleString() }}</p>
        </CardContent>
      </Card>

      <Card class="comparison-card">
        <CardContent class="card-content">
          <div class="card-header">
            <p class="card-label">净收入环比</p>
            <Badge :variant="trendData.trend.net >= 0 ? 'default' : 'secondary'" class="trend-badge">
              <Icon :icon="trendData.trend.net >= 0 ? 'lucide:trending-up' : 'lucide:trending-down'" class="trend-icon" />
              {{ Math.abs(trendData.trend.net) }}%
            </Badge>
          </div>
          <p class="card-value">¥{{ trendData.currentMonth.net.toLocaleString() }}</p>
          <p class="card-comparison">上月: ¥{{ trendData.lastMonth.net.toLocaleString() }}</p>
        </CardContent>
      </Card>
    </div>

    <!-- 趋势图表 -->
    <Card class="chart-card">
      <CardHeader>
        <CardTitle>收支趋势图</CardTitle>
        <CardDescription>展示收入和支出的变化趋势</CardDescription>
      </CardHeader>
      <CardContent>
        <div class="chart-placeholder">
          <Icon icon="lucide:bar-chart-3" class="placeholder-icon" />
          <p class="placeholder-text">收支对比趋势图表</p>
          <p class="placeholder-subtext">图表组件待集成</p>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<style scoped>
.trend-analysis {
  @apply space-y-6;
}

.page-header {
  @apply flex flex-col;
}

.page-title {
  @apply text-2xl font-semibold text-foreground;
}

.page-subtitle {
  @apply text-sm text-muted-foreground mt-1;
}

.comparison-cards {
  @apply grid grid-cols-1 sm:grid-cols-3 gap-4;
}

.comparison-card {
  @apply border-none;
}

.card-content {
  @apply p-5;
}

.card-header {
  @apply flex items-center justify-between mb-2;
}

.card-label {
  @apply text-sm text-muted-foreground;
}

.trend-badge {
  @apply flex items-center gap-1;
}

.trend-icon {
  @apply w-3 h-3;
}

.card-value {
  @apply text-2xl font-bold text-foreground;
}

.card-comparison {
  @apply text-xs text-muted-foreground mt-2;
}

.chart-card {
  @apply border-none;
}

.chart-placeholder {
  @apply flex flex-col items-center justify-center h-72 bg-muted/30 rounded-lg;
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
</style>
