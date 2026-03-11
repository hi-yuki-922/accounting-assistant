<script setup lang="ts">
/**
 * 支出分析页面
 */

import { ref } from 'vue'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Icon } from '@iconify/vue'

/**
 * 支出分类数据
 */
const expenseCategories = ref([
  { name: '居住', amount: 2800.00, percentage: 33.9, color: 'bg-blue' },
  { name: '餐饮', amount: 1560.00, percentage: 18.9, color: 'bg-green' },
  { name: '购物', amount: 1250.00, percentage: 15.1, color: 'bg-red' },
  { name: '交通', amount: 890.00, percentage: 10.8, color: 'bg-purple' },
  { name: '娱乐', amount: 680.50, percentage: 8.2, color: 'bg-cyan' },
  { name: '其他', amount: 1080.00, percentage: 13.1, color: 'bg-yellow' },
])

/**
 * 月度支出数据
 * 注：数据将用于图表组件
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const monthlyData = ref([
  { month: '2026-01', amount: 7850.00 },
  { month: '2026-02', amount: 8520.00 },
  { month: '2026-03', amount: 8260.50 },
])
</script>

<template>
  <div class="expense-analysis">
    <!-- 页面头部 -->
    <div class="page-header">
      <h2 class="page-title">支出分析</h2>
      <p class="page-subtitle">详细分析您的支出构成</p>
    </div>

    <!-- 支出总览 -->
    <Card class="overview-card">
      <CardContent class="overview-content">
        <div class="overview-icon">
          <Icon icon="lucide:trending-down" />
        </div>
        <div class="overview-info">
          <p class="overview-label">本月总支出</p>
          <p class="overview-value">¥8,260.50</p>
        </div>
      </CardContent>
    </Card>

    <div class="analysis-grid">
      <!-- 支出分类 -->
      <Card class="category-card">
        <CardHeader>
          <CardTitle>支出分类</CardTitle>
          <CardDescription>按类别统计支出</CardDescription>
        </CardHeader>
        <CardContent>
          <div class="category-list">
            <div
              v-for="category in expenseCategories"
              :key="category.name"
              class="category-item"
            >
              <div class="category-info">
                <span class="category-name">{{ category.name }}</span>
                <span class="category-amount">¥{{ category.amount.toLocaleString() }}</span>
              </div>
              <div class="category-bar">
                <div
                  class="bar-fill"
                  :class="category.color"
                  :style="{ width: category.percentage + '%' }"
                />
              </div>
              <span class="category-percentage">{{ category.percentage }}%</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- 趋势图表 -->
      <Card class="trend-card">
        <CardHeader>
          <CardTitle>支出趋势</CardTitle>
          <CardDescription>近三月支出变化</CardDescription>
        </CardHeader>
        <CardContent>
          <div class="chart-placeholder">
            <Icon icon="lucide:line-chart" class="placeholder-icon" />
            <p class="placeholder-text">支出趋势图表</p>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>

<style scoped>
.expense-analysis {
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

.overview-card {
  @apply bg-gradient-to-br from-red/10 to-red/5 dark:from-red/20 dark:to-red/10 border-none;
}

.overview-content {
  @apply p-6 flex items-center gap-4;
}

.overview-icon {
  @apply w-14 h-14 rounded-xl bg-red/20 flex items-center justify-center;
}

.overview-icon svg {
  @apply w-7 h-7 text-red;
}

.overview-info {
  @apply flex flex-col;
}

.overview-label {
  @apply text-sm text-muted-foreground;
}

.overview-value {
  @apply text-3xl font-bold text-foreground mt-1;
}

.analysis-grid {
  @apply grid grid-cols-1 lg:grid-cols-2 gap-6;
}

.category-list {
  @apply space-y-4;
}

.category-item {
  @apply flex flex-col gap-2;
}

.category-info {
  @apply flex items-center justify-between;
}

.category-name {
  @apply text-sm font-medium text-foreground;
}

.category-amount {
  @apply text-sm font-semibold text-foreground;
}

.category-bar {
  @apply h-2 w-full bg-muted rounded-full overflow-hidden;
}

.bar-fill {
  @apply h-full rounded-full;
}

.category-percentage {
  @apply text-xs text-muted-foreground text-right;
}

.chart-placeholder {
  @apply flex flex-col items-center justify-center h-48 bg-muted/30 rounded-lg;
}

.placeholder-icon {
  @apply w-12 h-12 text-muted-foreground/50 mb-3;
}

.placeholder-text {
  @apply text-sm text-muted-foreground;
}
</style>
