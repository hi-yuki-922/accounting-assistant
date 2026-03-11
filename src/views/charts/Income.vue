<script setup lang="ts">
/**
 * 收入分析页面
 */

import { ref } from 'vue'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Icon } from '@iconify/vue'

/**
 * 收入分类数据
 */
const incomeCategories = ref([
  { name: '工资', amount: 12700.00, percentage: 80.2, color: 'bg-blue' },
  { name: '兼职', amount: 1500.00, percentage: 9.5, color: 'bg-green' },
  { name: '投资', amount: 1200.00, percentage: 7.6, color: 'bg-purple' },
  { name: '其他', amount: 440.00, percentage: 2.7, color: 'bg-cyan' },
])

/**
 * 月度收入数据
 * 注：数据将用于图表组件
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const monthlyData = ref([
  { month: '2026-01', amount: 14200.00 },
  { month: '2026-02', amount: 15800.00 },
  { month: '2026-03', amount: 15840.00 },
])
</script>

<template>
  <div class="income-analysis">
    <!-- 页面头部 -->
    <div class="page-header">
      <h2 class="page-title">收入分析</h2>
      <p class="page-subtitle">详细分析您的收入来源</p>
    </div>

    <!-- 收入总览 -->
    <Card class="overview-card">
      <CardContent class="overview-content">
        <div class="overview-icon">
          <Icon icon="lucide:trending-up" />
        </div>
        <div class="overview-info">
          <p class="overview-label">本月总收入</p>
          <p class="overview-value">¥15,840.00</p>
        </div>
      </CardContent>
    </Card>

    <div class="analysis-grid">
      <!-- 收入来源分类 -->
      <Card class="category-card">
        <CardHeader>
          <CardTitle>收入来源</CardTitle>
          <CardDescription>按来源分类统计</CardDescription>
        </CardHeader>
        <CardContent>
          <div class="category-list">
            <div
              v-for="category in incomeCategories"
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
          <CardTitle>收入趋势</CardTitle>
          <CardDescription>近三月收入变化</CardDescription>
        </CardHeader>
        <CardContent>
          <div class="chart-placeholder">
            <Icon icon="lucide:line-chart" class="placeholder-icon" />
            <p class="placeholder-text">收入趋势图表</p>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>

<style scoped>
.income-analysis {
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
  @apply bg-gradient-to-br from-green/10 to-green/5 dark:from-green/20 dark:to-green/10 border-none;
}

.overview-content {
  @apply p-6 flex items-center gap-4;
}

.overview-icon {
  @apply w-14 h-14 rounded-xl bg-green/20 flex items-center justify-center;
}

.overview-icon svg {
  @apply w-7 h-7 text-green;
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
