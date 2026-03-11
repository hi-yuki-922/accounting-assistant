<script setup lang="ts">
/**
 * 主头部组件
 * 包含搜索、通知、主题切换等功能
 */

import { ref } from 'vue'
import { Icon } from '@iconify/vue'

interface Props {
  title?: string
}

withDefaults(defineProps<Props>(), {
  title: '',
})

const emit = defineEmits<{
  menuToggle: []
}>()

const searchQuery = ref('')

/**
 * 搜索处理
 */
const handleSearch = () => {
  // 搜索逻辑待实现
  console.log('搜索:', searchQuery.value)
}

/**
 * 移动端菜单切换
 */
const toggleMenu = () => {
  emit('menuToggle')
}
</script>

<template>
  <header class="header">
    <!-- 移动端菜单按钮 -->
    <button
      class="menu-button lg:hidden"
      @click="toggleMenu"
    >
      <Icon icon="lucide:menu" class="menu-icon" />
    </button>

    <!-- 页面标题 -->
    <h1 class="page-title">
      {{ title }}
    </h1>

    <!-- 右侧操作区 -->
    <div class="header-actions">
      <!-- 搜索框 -->
      <div class="search-box hidden md:flex">
        <Icon icon="lucide:search" class="search-icon" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="搜索..."
          class="search-input"
          @keyup.enter="handleSearch"
        />
      </div>

      <!-- 通知按钮 -->
      <button class="action-button">
        <Icon icon="lucide:bell" class="action-icon" />
        <span class="notification-dot" />
      </button>

      <!-- 主题切换 -->
      <button class="action-button">
        <Icon icon="lucide:sun" class="action-icon dark:hidden" />
        <Icon icon="lucide:moon" class="action-icon hidden dark:block" />
      </button>
    </div>
  </header>
</template>

<style scoped>
@reference "@/styles/tailwind.css";

.header {
  @apply h-16 flex items-center justify-between px-4 lg:px-6 border-b border-border bg-background z-10;
}

.menu-button {
  @apply p-2 rounded-lg hover:bg-accent text-foreground transition-colors;
}

.menu-icon {
  @apply w-6 h-6;
}

.page-title {
  @apply text-lg lg:text-xl font-semibold text-foreground;
}

.header-actions {
  @apply flex items-center gap-2;
}

.search-box {
  @apply flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-lg border border-border focus-within:ring-2 focus-within:ring-ring/50;
}

.search-icon {
  @apply w-4 h-4 text-muted-foreground;
}

.search-input {
  @apply flex-1 bg-transparent border-none outline-none text-sm text-foreground placeholder:text-muted-foreground;
  width: 200px;
}

.action-button {
  @apply relative p-2 rounded-lg hover:bg-accent text-foreground transition-colors;
}

.action-icon {
  @apply w-5 h-5;
}

.notification-dot {
  @apply absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full;
}
</style>
