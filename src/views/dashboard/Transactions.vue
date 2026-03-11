<script setup lang="ts">
/**
 * 交易记录页面
 * 显示所有收支记录，支持筛选和搜索
 */

import { ref, computed } from 'vue'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Icon } from '@iconify/vue'

/**
 * 交易记录数据
 */
const transactions = ref([
  { id: 1, title: '工资收入', amount: 8500.00, date: '2026-03-10', type: 'income', category: '工资', remark: '3月份工资' },
  { id: 2, title: '超市购物', amount: 328.50, date: '2026-03-09', type: 'expense', category: '生活', remark: '日常用品采购' },
  { id: 3, title: '交通费', amount: 56.00, date: '2026-03-08', type: 'expense', category: '交通', remark: '地铁通勤' },
  { id: 4, title: '餐饮', amount: 128.00, date: '2026-03-08', type: 'expense', category: '餐饮', remark: '工作午餐' },
  { id: 5, title: '投资收益', amount: 40.50, date: '2026-03-07', type: 'income', category: '投资', remark: '基金分红' },
  { id: 6, title: '房租', amount: 2800.00, date: '2026-03-05', type: 'expense', category: '居住', remark: '3月份房租' },
  { id: 7, title: '话费充值', amount: 100.00, date: '2026-03-04', type: 'expense', category: '通讯', remark: '手机话费' },
  { id: 8, title: '兼职收入', amount: 600.00, date: '2026-03-03', type: 'income', category: '兼职', remark: '周末兼职' },
])

const searchQuery = ref('')
const selectedType = ref<'all' | 'income' | 'expense'>('all')

/**
 * 筛选后的交易记录
 */
const filteredTransactions = computed(() => {
  let result = transactions.value

  if (selectedType.value !== 'all') {
    result = result.filter(t => t.type === selectedType.value)
  }

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(t =>
      t.title.toLowerCase().includes(query) ||
      t.category.toLowerCase().includes(query) ||
      t.remark.toLowerCase().includes(query)
    )
  }

  return result
})
</script>

<template>
  <div class="transactions-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h2 class="page-title">交易记录</h2>
        <p class="page-subtitle">管理您的所有收支记录</p>
      </div>
      <Button class="add-button">
        <Icon icon="lucide:plus" class="mr-2" />
        记一笔
      </Button>
    </div>

    <!-- 筛选和搜索 -->
    <Card class="filter-card">
      <CardContent class="filter-content">
        <div class="filter-group">
          <label class="filter-label">类型</label>
          <div class="filter-options">
            <button
              class="filter-option"
              :class="{ active: selectedType === 'all' }"
              @click="selectedType = 'all'"
            >
              全部
            </button>
            <button
              class="filter-option"
              :class="{ active: selectedType === 'income' }"
              @click="selectedType = 'income'"
            >
              收入
            </button>
            <button
              class="filter-option"
              :class="{ active: selectedType === 'expense' }"
              @click="selectedType = 'expense'"
            >
              支出
            </button>
          </div>
        </div>
        <div class="search-group">
          <Icon icon="lucide:search" class="search-icon" />
          <Input
            v-model="searchQuery"
            placeholder="搜索交易记录..."
            class="search-input"
          />
        </div>
      </CardContent>
    </Card>

    <!-- 交易列表 -->
    <Card class="transactions-card">
      <CardContent class="transactions-content">
        <div v-if="filteredTransactions.length > 0" class="transactions-list">
          <div
            v-for="transaction in filteredTransactions"
            :key="transaction.id"
            class="transaction-item"
          >
            <div class="transaction-icon">
              <Icon :icon="transaction.type === 'income' ? 'lucide:arrow-down-left' : 'lucide:shopping-bag'" />
            </div>
            <div class="transaction-info">
              <div class="transaction-main">
                <p class="transaction-title">{{ transaction.title }}</p>
                <Badge :variant="transaction.type === 'income' ? 'default' : 'secondary'" class="transaction-type">
                  {{ transaction.type === 'income' ? '收入' : '支出' }}
                </Badge>
              </div>
              <p class="transaction-meta">{{ transaction.category }} · {{ transaction.remark }}</p>
              <p class="transaction-date">{{ transaction.date }}</p>
            </div>
            <div class="transaction-amount">
              <p :class="['amount-text', transaction.type]">
                {{ transaction.type === 'income' ? '+' : '-' }}¥{{ transaction.amount.toLocaleString() }}
              </p>
            </div>
          </div>
        </div>
        <div v-else class="empty-state">
          <Icon icon="lucide:inbox" class="empty-icon" />
          <p class="empty-text">暂无交易记录</p>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<style scoped>
@reference "@/styles/tailwind.css";
.transactions-page {
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

.add-button {
  @apply shrink-0;
}

.filter-card {
  @apply border-none;
}

.filter-content {
  @apply flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4;
}

.filter-group {
  @apply flex flex-col gap-2;
}

.filter-label {
  @apply text-sm font-medium text-foreground;
}

.filter-options {
  @apply flex gap-2;
}

.filter-option {
  @apply px-4 py-2 rounded-lg text-sm font-medium transition-colors;
}

.filter-option {
  @apply bg-muted text-muted-foreground hover:bg-muted/80;
}

.filter-option.active {
  @apply bg-primary text-primary-foreground;
}

.search-group {
  @apply relative flex-1 w-full md:max-w-md;
}

.search-icon {
  @apply absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground;
}

.search-input {
  @apply pl-10;
}

.transactions-card {
  @apply border-none;
}

.transactions-content {
  @apply p-0;
}

.transactions-list {
  @apply divide-y divide-border;
}

.transaction-item {
  @apply flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors;
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

.transaction-main {
  @apply flex items-center gap-2;
}

.transaction-title {
  @apply text-sm font-medium text-foreground;
}

.transaction-type {
  @apply shrink-0;
}

.transaction-meta {
  @apply text-xs text-muted-foreground mt-1;
}

.transaction-date {
  @apply text-xs text-muted-foreground mt-0.5;
}

.transaction-amount {
  @apply shrink-0;
}

.amount-text {
  @apply text-lg font-semibold;
}

.amount-text.income {
  @apply text-green;
}

.amount-text.expense {
  @apply text-red;
}

.empty-state {
  @apply flex flex-col items-center justify-center py-16 text-center;
}

.empty-icon {
  @apply w-16 h-16 text-muted-foreground mb-4;
}

.empty-text {
  @apply text-sm text-muted-foreground;
}
</style>
