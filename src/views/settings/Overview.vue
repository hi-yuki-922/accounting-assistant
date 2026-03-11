<script setup lang="ts">
/**
 * 设置概览页面
 */

import { ref } from 'vue'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Icon } from '@iconify/vue'

/**
 * 设置项配置
 */
interface SettingItem {
  icon: string
  title: string
  description: string
  path: string
}

const settingItems = ref<SettingItem[]>([
  {
    icon: 'lucide:user',
    title: '个人资料',
    description: '管理您的账户信息',
    path: '/settings/profile',
  },
  {
    icon: 'lucide:sliders-horizontal',
    title: '偏好设置',
    description: '自定义应用行为',
    path: '/settings/preferences',
  },
  {
    icon: 'lucide:database',
    title: '数据管理',
    description: '导入、导出和备份数据',
    path: '/settings/data',
  },
  {
    icon: 'lucide:moon',
    title: '外观主题',
    description: '切换亮色/暗色主题',
    path: '/settings/appearance',
  },
  {
    icon: 'lucide:bell',
    title: '通知设置',
    description: '管理通知和提醒',
    path: '/settings/notifications',
  },
  {
    icon: 'lucide:shield',
    title: '隐私与安全',
    description: '管理安全设置',
    path: '/settings/security',
  },
])
</script>

<template>
  <div class="settings-overview">
    <!-- 页面头部 -->
    <div class="page-header">
      <h2 class="page-title">设置</h2>
      <p class="page-subtitle">管理您的应用设置</p>
    </div>

    <!-- 设置项列表 -->
    <div class="settings-grid">
      <router-link
        v-for="item in settingItems"
        :key="item.path"
        :to="item.path"
        class="setting-card"
      >
        <Card class="card-wrapper">
          <CardContent class="card-content">
            <div class="setting-icon">
              <Icon :icon="item.icon" />
            </div>
            <div class="setting-info">
              <p class="setting-title">{{ item.title }}</p>
              <p class="setting-description">{{ item.description }}</p>
            </div>
            <Icon icon="lucide:chevron-right" class="arrow-icon" />
          </CardContent>
        </Card>
      </router-link>
    </div>

    <!-- 关于信息 -->
    <Card class="about-card">
      <CardHeader>
        <CardTitle>关于</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="about-content">
          <div class="about-item">
            <span class="about-label">版本</span>
            <span class="about-value">0.1.0</span>
          </div>
          <div class="about-item">
            <span class="about-label">开发者</span>
            <span class="about-value">Accounting Assistant Team</span>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<style scoped>
.settings-overview {
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

.settings-grid {
  @apply grid grid-cols-1 sm:grid-cols-2 gap-4;
}

.setting-card {
  @apply block no-underline;
}

.card-wrapper {
  @apply hover:shadow-md transition-all hover:border-primary/30;
}

.card-content {
  @apply p-4 flex items-center gap-4;
}

.setting-icon {
  @apply w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0;
}

.setting-icon svg {
  @apply w-5 h-5 text-primary;
}

.setting-info {
  @apply flex-1 min-w-0;
}

.setting-title {
  @apply text-sm font-medium text-foreground;
}

.setting-description {
  @apply text-xs text-muted-foreground mt-0.5;
}

.arrow-icon {
  @apply w-5 h-5 text-muted-foreground shrink-0;
}

.about-card {
  @apply mt-6;
}

.about-content {
  @apply space-y-3;
}

.about-item {
  @apply flex items-center justify-between;
}

.about-label {
  @apply text-sm text-muted-foreground;
}

.about-value {
  @apply text-sm font-medium text-foreground;
}
</style>
