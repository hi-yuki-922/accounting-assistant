<script setup lang="ts">
/**
 * 移动端布局组件
 * 专门为小屏幕设备优化
 */

import { computed } from 'vue'
import { useRoute } from 'vue-router'
import MobileNav from '@/components/layout/MobileNav.vue'

const route = useRoute()

/**
 * 页面标题
 */
const pageTitle = computed(() => {
  return route.meta.title as string || ''
})

/**
 * 判断是否显示底部导航
 */
const showBottomNav = computed(() => {
  const hideNavPaths = ['/settings', '/charts/income', '/charts/expense', '/charts/trend']
  return !hideNavPaths.some(path => route.path.startsWith(path))
})
</script>

<template>
  <div class="mobile-layout lg:hidden">
    <!-- 头部 -->
    <header class="mobile-header">
      <h1 class="page-title">{{ pageTitle }}</h1>
      <button class="header-button">
        <Icon icon="lucide:bell" class="header-icon" />
      </button>
    </header>

    <!-- 主内容区 -->
    <main class="mobile-content">
      <router-view v-slot="{ Component }">
        <transition name="slide" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <!-- 底部导航 -->
    <MobileNav v-if="showBottomNav" />
  </div>
</template>

<style scoped>
@reference "@/styles/tailwind.css";

.mobile-layout {
  @apply flex flex-col min-h-screen bg-background pb-16;
}

.mobile-header {
  @apply flex items-center justify-between h-14 px-4 border-b border-border bg-background sticky top-0 z-10;
}

.page-title {
  @apply text-base font-semibold text-foreground;
}

.header-button {
  @apply p-2 rounded-lg hover:bg-accent text-foreground transition-colors;
}

.header-icon {
  @apply w-5 h-5;
}

.mobile-content {
  @apply flex-1 p-4;
}

/* 动画过渡 */
.slide-enter-active,
.slide-leave-active {
  @apply transition-all duration-300;
}

.slide-enter-from {
  @apply opacity-0 translate-x-4;
}

.slide-leave-to {
  @apply opacity-0 -translate-x-4;
}
</style>
