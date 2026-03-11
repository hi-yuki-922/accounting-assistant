<script setup lang="ts">
/**
 * 侧边栏导航组件
 * PC 端主导航
 */

import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { Icon } from '@iconify/vue'

const route = useRoute()

/**
 * 导航菜单项配置
 */
interface NavItem {
  name: string
  path: string
  icon: string
  badge?: number
}

const navItems: NavItem[] = [
  {
    name: '仪表盘',
    path: '/dashboard',
    icon: 'lucide:layout-dashboard',
  },
  {
    name: '图表分析',
    path: '/charts',
    icon: 'lucide:bar-chart-3',
  },
  {
    name: '交易记录',
    path: '/dashboard/transactions',
    icon: 'lucide:wallet',
  },
  {
    name: '账户管理',
    path: '/dashboard/accounts',
    icon: 'lucide:banknote',
  },
  {
    name: '设置',
    path: '/settings',
    icon: 'lucide:settings',
  },
]

/**
 * 当前激活的导航项
 */
const activePath = computed(() => route.path)

/**
 * 判断是否为激活状态
 */
const isActive = (path: string) => {
  return activePath.value === path || activePath.value.startsWith(path + '/')
}
</script>

<template>
  <aside class="sidebar">
    <div class="sidebar-header">
      <div class="logo">
        <Icon icon="lucide:book-open" class="logo-icon" />
        <span class="logo-text">记账助手</span>
      </div>
    </div>

    <nav class="sidebar-nav">
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
            <span
              v-if="item.badge"
              class="nav-badge"
            >
              {{ item.badge }}
            </span>
          </router-link>
        </li>
      </ul>
    </nav>

    <div class="sidebar-footer">
      <div class="user-profile">
        <div class="avatar">
          <Icon icon="lucide:user" class="avatar-icon" />
        </div>
        <div class="user-info">
          <div class="user-name">用户</div>
          <div class="user-role">个人版</div>
        </div>
      </div>
    </div>
  </aside>
</template>

<style scoped>
@reference "@/styles/tailwind.css";

.sidebar {
  @apply fixed left-0 top-0 bottom-0 w-64 bg-sidebar border-r border-sidebar-border flex flex-col z-20;
}

.sidebar-header {
  @apply h-16 flex items-center px-6 border-b border-sidebar-border;
}

.logo {
  @apply flex items-center gap-2;
}

.logo-icon {
  @apply w-8 h-8 text-primary;
}

.logo-text {
  @apply text-lg font-semibold text-sidebar-foreground;
}

.sidebar-nav {
  @apply flex-1 overflow-y-auto py-4;
}

.nav-list {
  @apply space-y-1 px-3;
}

.nav-item {
  @apply list-none;
}

.nav-link {
  @apply flex items-center gap-3 px-3 py-2.5 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors;
}

.nav-link.active {
  @apply bg-sidebar-primary text-sidebar-primary-foreground;
}

.nav-icon {
  @apply w-5 h-5 shrink-0;
}

.nav-text {
  @apply flex-1 font-medium text-sm;
}

.nav-badge {
  @apply min-w-5 h-5 px-1.5 flex items-center justify-center bg-destructive text-destructive-foreground text-xs rounded-full;
}

.sidebar-footer {
  @apply p-4 border-t border-sidebar-border;
}

.user-profile {
  @apply flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-sidebar-accent cursor-pointer transition-colors;
}

.avatar {
  @apply w-10 h-10 rounded-full bg-sidebar-primary flex items-center justify-center;
}

.avatar-icon {
  @apply w-5 h-5 text-sidebar-primary-foreground;
}

.user-info {
  @apply flex-1 min-w-0;
}

.user-name {
  @apply text-sm font-medium text-sidebar-foreground truncate;
}

.user-role {
  @apply text-xs text-muted-foreground;
}
</style>
