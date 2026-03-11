<script setup lang="ts">
/**
 * 偏好设置页面
 */

import { ref } from 'vue'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Icon } from '@iconify/vue'

/**
 * 偏好设置数据
 */
const preferences = ref({
  theme: 'system',
  language: 'zh-CN',
  currency: 'CNY',
  startPage: 'dashboard',
  showAnimation: true,
  compactMode: false,
})

/**
 * 主题选项
 */
const themeOptions = [
  { value: 'light', label: '亮色' },
  { value: 'dark', label: '暗色' },
  { value: 'system', label: '跟随系统' },
]

/**
 * 货币选项
 */
const currencyOptions = [
  { value: 'CNY', label: '人民币 (¥)' },
  { value: 'USD', label: '美元 ($)' },
  { value: 'EUR', label: '欧元 (€)' },
]
</script>

<template>
  <div class="preferences-settings">
    <!-- 页面头部 -->
    <div class="page-header">
      <h2 class="page-title">偏好设置</h2>
      <p class="page-subtitle">自定义应用行为</p>
    </div>

    <!-- 外观设置 -->
    <Card class="appearance-card">
      <CardHeader>
        <CardTitle>外观</CardTitle>
        <CardDescription>自定义应用外观</CardDescription>
      </CardHeader>
      <CardContent>
        <div class="settings-list">
          <div class="setting-item">
            <div class="setting-info">
              <p class="setting-label">主题模式</p>
              <p class="setting-description">选择应用的主题</p>
            </div>
            <div class="setting-control">
              <div class="theme-options">
                <button
                  v-for="option in themeOptions"
                  :key="option.value"
                  class="theme-option"
                  :class="{ active: preferences.theme === option.value }"
                  @click="preferences.theme = option.value"
                >
                  <Icon
                    :icon="option.value === 'light' ? 'lucide:sun' : option.value === 'dark' ? 'lucide:moon' : 'lucide:laptop'"
                    class="option-icon"
                  />
                  <span>{{ option.label }}</span>
                </button>
              </div>
            </div>
          </div>

          <div class="setting-item">
            <div class="setting-info">
              <p class="setting-label">动画效果</p>
              <p class="setting-description">启用界面动画</p>
            </div>
            <button
              class="toggle-button"
              :class="{ active: preferences.showAnimation }"
              @click="preferences.showAnimation = !preferences.showAnimation"
            >
              <div class="toggle-track">
                <div class="toggle-thumb" />
              </div>
            </button>
          </div>

          <div class="setting-item">
            <div class="setting-info">
              <p class="setting-label">紧凑模式</p>
              <p class="setting-description">减少界面间距</p>
            </div>
            <button
              class="toggle-button"
              :class="{ active: preferences.compactMode }"
              @click="preferences.compactMode = !preferences.compactMode"
            >
              <div class="toggle-track">
                <div class="toggle-thumb" />
              </div>
            </button>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- 默认设置 -->
    <Card class="defaults-card">
      <CardHeader>
        <CardTitle>默认设置</CardTitle>
        <CardDescription>设置默认值</CardDescription>
      </CardHeader>
      <CardContent>
        <div class="settings-list">
          <div class="setting-item">
            <div class="setting-info">
              <p class="setting-label">默认货币</p>
              <p class="setting-description">选择默认货币单位</p>
            </div>
            <select v-model="preferences.currency" class="select-input">
              <option v-for="option in currencyOptions" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<style scoped>
.preferences-settings {
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

.settings-list {
  @apply space-y-4;
}

.setting-item {
  @apply flex items-center justify-between gap-4;
}

.setting-info {
  @apply flex flex-col;
}

.setting-label {
  @apply text-sm font-medium text-foreground;
}

.setting-description {
  @apply text-xs text-muted-foreground mt-0.5;
}

.setting-control {
  @apply shrink-0;
}

.theme-options {
  @apply flex items-center gap-2;
}

.theme-option {
  @apply flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors bg-muted text-muted-foreground hover:bg-muted/80;
}

.theme-option.active {
  @apply bg-primary text-primary-foreground;
}

.option-icon {
  @apply w-4 h-4;
}

.toggle-button {
  @apply relative w-11 h-6 rounded-full transition-colors;
}

.toggle-button {
  @apply bg-muted;
}

.toggle-button.active {
  @apply bg-primary;
}

.toggle-track {
  @apply absolute inset-0.5;
}

.toggle-thumb {
  @apply absolute top-0 left-0 w-5 h-5 rounded-full bg-background transition-transform shadow-sm;
}

.toggle-button.active .toggle-thumb {
  @apply translate-x-5;
}

.select-input {
  @apply w-40 px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/50;
}
</style>
