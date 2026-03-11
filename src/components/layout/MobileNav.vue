<script setup lang="ts">
/**
 * 移动端底部导航栏
 */

import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

/**
 * 导航项配置
 */
interface NavItem {
  name: string
  path: string
  icon: string
}

const navItems: NavItem[] = [
  {
    name: '首页',
    path: '/dashboard',
    icon: 'lucide:home',
  },
  {
    name: '图表',
    path: '/charts',
    icon: 'lucide:bar-chart-2',
  },
  {
    name: '记录',
    path: '/dashboard/transactions',
    icon: 'lucide:plus-circle',
  },
  {
    name: '账户',
    path: '/dashboard/accounts',
    icon: 'lucide:wallet',
  },
  {
    name: '我的',
    path: '/settings',
    icon: 'lucide:user',
  },
]

/**
 * 当前路径
 */
const currentPath = computed(() => route.path)

/**
 * 判断是否激活
 */
const isActive = (path: string) => {
  return currentPath.value === path || currentPath.value.startsWith(path + '/')
}
</script>

<template>
  <nav class="mobile-nav lg:hidden">
    <ul class="nav-list">
      <li
        v-for="item in navItems"
        :key="item.path"
        class="nav-item"
      >
        <router-link
          :to="item.path"
          class="nav-link"
          :class="{ active: isActive(item.path) }"
        >
          <Icon :icon="item.icon" class="nav-icon" />
          <span class="nav-text">{{ item.name }}</span>
        </router-link>
      </li>
    </ul>
  </nav>
</template>

<style scoped>
@reference "@/styles/tailwind.css";
.mobile-nav {
  @apply fixed bottom-0 left-0 right-0 h-16 bg-background border-t border-border z-40;
}

.nav-list {
  @apply flex items-center justify-around h-full;
}

.nav-item {
  @apply list-none;
}

.nav-link {
  @apply flex flex-col items-center gap-1 py-1 px-2 text-muted-foreground transition-colors;
}

.nav-link.active {
  @apply text-primary;
}

.nav-icon {
  @apply w-6 h-6;
}

.nav-text {
  @apply text-xs;
}
</style>
