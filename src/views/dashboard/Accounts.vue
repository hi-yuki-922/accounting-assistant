<script setup lang="ts">
/**
 * 账户管理页面
 * 管理所有账户，包括银行卡、现金、支付宝、微信等
 */

import { ref, computed } from 'vue'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Icon } from '@iconify/vue'

/**
 * 账户数据
 */
interface Account {
  id: number
  name: string
  type: 'bank' | 'cash' | 'alipay' | 'wechat' | 'investment'
  balance: number
  icon: string
  iconColor: string
}

const accounts = ref<Account[]>([
  { id: 1, name: '工商银行储蓄卡', type: 'bank', balance: 12580.50, icon: 'lucide:landmark', iconColor: 'text-blue' },
  { id: 2, name: '支付宝', type: 'alipay', balance: 3260.00, icon: 'lucide:wallet', iconColor: 'text-cyan' },
  { id: 3, name: '微信支付', type: 'wechat', balance: 1850.80, icon: 'lucide:message-circle', iconColor: 'text-green' },
  { id: 4, name: '现金', type: 'cash', balance: 520.00, icon: 'lucide:banknote', iconColor: 'text-yellow' },
  { id: 5, name: '投资账户', type: 'investment', balance: 85000.00, icon: 'lucide:trending-up', iconColor: 'text-purple' },
])

/**
 * 总余额
 */
const totalBalance = computed(() => {
  return accounts.value.reduce((sum, account) => sum + account.balance, 0)
})

/**
 * 添加账户
 */
const addAccount = () => {
  // 添加账户逻辑
  console.log('添加账户')
}
</script>

<template>
  <div class="accounts-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h2 class="page-title">账户管理</h2>
        <p class="page-subtitle">管理您的所有账户</p>
      </div>
      <Button class="add-button">
        <Icon icon="lucide:plus" class="mr-2" />
        添加账户
      </Button>
    </div>

    <!-- 总资产卡片 -->
    <Card class="total-assets-card">
      <CardContent class="total-assets-content">
        <div class="assets-info">
          <p class="assets-label">总资产</p>
          <p class="assets-value">¥{{ totalBalance.toLocaleString() }}</p>
        </div>
        <div class="assets-icon">
          <Icon icon="lucide:pie-chart" />
        </div>
      </CardContent>
    </Card>

    <!-- 账户列表 -->
    <div class="accounts-grid">
      <Card
        v-for="account in accounts"
        :key="account.id"
        class="account-card"
      >
        <CardHeader class="account-header">
          <div class="account-icon-wrapper" :class="account.iconColor">
            <Icon :icon="account.icon" class="account-icon" />
          </div>
          <div class="account-info">
            <CardTitle class="account-name">{{ account.name }}</CardTitle>
            <CardDescription class="account-type">{{ account.type }}</CardDescription>
          </div>
        </CardHeader>
        <CardContent class="account-content">
          <div class="account-balance">
            <p class="balance-label">余额</p>
            <p class="balance-value">¥{{ account.balance.toLocaleString() }}</p>
          </div>
          <div class="account-actions">
            <Button variant="ghost" size="sm">
              <Icon icon="lucide:edit" class="mr-1" />
              编辑
            </Button>
            <Button variant="ghost" size="sm">
              <Icon icon="lucide:more-horizontal" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- 添加新账户卡片 -->
    <Card class="add-account-card" @click="addAccount">
      <CardContent class="add-account-content">
        <Icon icon="lucide:plus-circle" class="add-icon" />
        <p class="add-text">添加新账户</p>
      </CardContent>
    </Card>
  </div>
</template>

<style scoped>
@reference "@/styles/tailwind.css";
.accounts-page {
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

.total-assets-card {
  @apply bg-gradient-to-br from-blue/10 to-purple/10 dark:from-blue/20 dark:to-purple/20 border-none;
}

.total-assets-content {
  @apply p-6 flex items-center justify-between;
}

.assets-info {
  @apply flex flex-col;
}

.assets-label {
  @apply text-sm text-muted-foreground;
}

.assets-value {
  @apply text-3xl font-bold text-foreground mt-1;
}

.assets-icon {
  @apply w-12 h-12 text-primary opacity-50;
}

.accounts-grid {
  @apply grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4;
}

.account-card {
  @apply hover:shadow-md transition-shadow;
}

.account-header {
  @apply flex items-start gap-3 pb-3;
}

.account-icon-wrapper {
  @apply w-12 h-12 rounded-xl bg-muted flex items-center justify-center shrink-0;
}

.account-icon {
  @apply w-6 h-6;
}

.account-info {
  @apply flex flex-col min-w-0;
}

.account-name {
  @apply text-base font-semibold truncate;
}

.account-type {
  @apply text-xs text-muted-foreground mt-0.5;
}

.account-content {
  @apply pt-0 space-y-3;
}

.account-balance {
  @apply flex flex-col;
}

.balance-label {
  @apply text-xs text-muted-foreground;
}

.balance-value {
  @apply text-xl font-bold text-foreground mt-0.5;
}

.account-actions {
  @apply flex items-center gap-1 pt-2 border-t border-border/50;
}

.add-account-card {
  @apply border-2 border-dashed border-muted hover:border-primary/50 hover:bg-primary/5 cursor-pointer transition-all;
}

.add-account-content {
  @apply p-6 flex flex-col items-center justify-center min-h-[160px];
}

.add-icon {
  @apply w-12 h-12 text-muted-foreground mb-2;
}

.add-text {
  @apply text-sm font-medium text-muted-foreground;
}
</style>
