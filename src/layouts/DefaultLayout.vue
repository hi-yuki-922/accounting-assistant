<script setup lang="ts">
/**
 * 默认布局组件
 * PC 端主布局，包含侧边栏、头部和主内容区
 * 支持响应式设计，在小屏幕下自动切换为移动端布局
 */

import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { Icon } from '@iconify/vue'
import MobileNav from '@/components/layout/MobileNav.vue'

const route = useRoute()
const sidebarCollapsed = ref(false)
const isMobile = ref(false)

/**
 * 页面标题
 */
const pageTitle = computed(() => {
  return route.meta.title as string || ''
})

/**
 * 检查是否为移动设备
 */
const checkMobile = () => {
  isMobile.value = window.innerWidth < 1024
}

/**
 * 移动端菜单切换
 */
const toggleMenu = () => {
  if (isMobile.value) {
    sidebarCollapsed.value = !sidebarCollapsed.value
  } else {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }
}

/**
 * 判断是否显示底部导航
 */
const showBottomNav = computed(() => {
  const hideNavPaths = ['/settings', '/charts/income', '/charts/expense', '/charts/trend']
  return isMobile.value && !hideNavPaths.some(path => route.path.startsWith(path))
})

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
})
</script>

<template>
  <div class="layout">
    <!-- 侧边栏 (PC 端显示) -->
    <aside
      class="sidebar-container hidden lg:flex"
      :class="{ collapsed: sidebarCollapsed }"
    >
      <div class="sidebar-content">
        <div class="sidebar-header">
          <div class="logo">
            <Icon icon="lucide:book-open" class="logo-icon" />
            <span v-show="!sidebarCollapsed" class="logo-text">记账助手</span>
          </div>
        </div>

        <nav class="sidebar-nav">
          <ul class="nav-list">
            <li class="nav-item">
              <router-link
                to="/dashboard"
                class="nav-link"
                active-class="active"
              >
                <Icon icon="lucide:layout-dashboard" class="nav-icon" />
                <span v-show="!sidebarCollapsed" class="nav-text">仪表盘</span>
              </router-link>
            </li>
            <li class="nav-item">
              <router-link
                to="/charts"
                class="nav-link"
                active-class="active"
              >
                <Icon icon="lucide:bar-chart-3" class="nav-icon" />
                <span v-show="!sidebarCollapsed" class="nav-text">图表分析</span>
              </router-link>
            </li>
            <li class="nav-item">
              <router-link
                to="/dashboard/transactions"
                class="nav-link"
                active-class="active"
              >
                <Icon icon="lucide:wallet" class="nav-icon" />
                <span v-show="!sidebarCollapsed" class="nav-text">交易记录</span>
              </router-link>
            </li>
            <li class="nav-item">
              <router-link
                to="/dashboard/accounts"
                class="nav-link"
                active-class="active"
              >
                <Icon icon="lucide:banknote" class="nav-icon" />
                <span v-show="!sidebarCollapsed" class="nav-text">账户管理</span>
              </router-link>
            </li>
            <li class="nav-item">
              <router-link
                to="/settings"
                class="nav-link"
                active-class="active"
              >
                <Icon icon="lucide:settings" class="nav-icon" />
                <span v-show="!sidebarCollapsed" class="nav-text">设置</span>
              </router-link>
            </li>
          </ul>
        </nav>

        <div class="sidebar-footer">
          <button
            class="collapse-button"
            @click="toggleMenu"
          >
            <Icon
              :icon="sidebarCollapsed ? 'lucide:chevron-right' : 'lucide:chevron-left'"
              class="collapse-icon"
            />
          </button>
        </div>
      </div>
    </aside>

    <!-- 主内容区 -->
    <div
      class="main-content"
      :class="{
        'sidebar-collapsed': sidebarCollapsed,
        'mobile': isMobile
      }"
    >
      <!-- 头部 -->
      <header class="main-header">
        <div class="header-left">
          <!-- 移动端菜单按钮 -->
          <button
            v-if="isMobile"
            class="menu-button"
            @click="toggleMenu"
          >
            <Icon icon="lucide:menu" class="menu-icon" />
          </button>
          <h1 class="page-title">{{ pageTitle }}</h1>
        </div>
        <div class="header-right">
          <!-- 搜索框 -->
          <div class="search-box hidden md:flex">
            <Icon icon="lucide:search" class="search-icon" />
            <input
              type="text"
              placeholder="搜索..."
              class="search-input"
            />
          </div>
          <!-- 通知 -->
          <button class="icon-button">
            <Icon icon="lucide:bell" class="action-icon" />
          </button>
          <!-- 主题切换 -->
          <button class="icon-button">
            <Icon icon="lucide:sun" class="action-icon dark:hidden" />
            <Icon icon="lucide:moon" class="action-icon hidden dark:block" />
          </button>
        </div>
      </header>

      <!-- 路由视图 -->
      <main class="content">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>

      <!-- 移动端底部导航 -->
      <MobileNav v-if="showBottomNav" />
    </div>

    <!-- 移动端侧边栏遮罩 -->
    <div
      v-if="isMobile && !sidebarCollapsed"
      class="sidebar-overlay"
      @click="toggleMenu"
    />

    <!-- 移动端侧边栏 (移动端显示) -->
    <aside
      v-if="isMobile"
      class="mobile-sidebar lg:hidden"
      :class="{ open: !sidebarCollapsed }"
    >
      <div class="mobile-sidebar-header">
        <div class="logo">
          <Icon icon="lucide:book-open" class="logo-icon" />
          <span class="logo-text">记账助手</span>
        </div>
        <button class="close-button" @click="toggleMenu">
          <Icon icon="lucide:x" class="close-icon" />
        </button>
      </div>
      <nav class="mobile-nav">
        <router-link
          to="/dashboard"
          class="mobile-nav-link"
          @click="sidebarCollapsed = true"
        >
          <Icon icon="lucide:layout-dashboard" class="nav-icon" />
          <span>仪表盘</span>
        </router-link>
        <router-link
          to="/charts"
          class="mobile-nav-link"
          @click="sidebarCollapsed = true"
        >
          <Icon icon="lucide:bar-chart-3" class="nav-icon" />
          <span>图表分析</span>
        </router-link>
        <router-link
          to="/dashboard/transactions"
          class="mobile-nav-link"
          @click="sidebarCollapsed = true"
        >
          <Icon icon="lucide:wallet" class="nav-icon" />
          <span>交易记录</span>
        </router-link>
        <router-link
          to="/dashboard/accounts"
          class="mobile-nav-link"
          @click="sidebarCollapsed = true"
        >
          <Icon icon="lucide:banknote" class="nav-icon" />
          <span>账户管理</span>
        </router-link>
        <router-link
          to="/settings"
          class="mobile-nav-link"
          @click="sidebarCollapsed = true"
        >
          <Icon icon="lucide:settings" class="nav-icon" />
          <span>设置</span>
        </router-link>
      </nav>
    </aside>
  </div>
</template>

<style scoped>
@reference "@/styles/tailwind.css";
.layout {
  @apply flex min-h-screen bg-background;
}

/* PC 端侧边栏 */
.sidebar-container {
  @apply fixed left-0 top-0 bottom-0 w-64 bg-sidebar border-r border-sidebar-border z-30 transition-all duration-300;
}

.sidebar-container.collapsed {
  @apply w-16;
}

.sidebar-content {
  @apply flex flex-col h-full;
}

.sidebar-header {
  @apply h-16 flex items-center justify-center px-4 border-b border-sidebar-border;
}

.logo {
  @apply flex items-center gap-2;
}

.logo-icon {
  @apply w-8 h-8 text-primary shrink-0;
}

.logo-text {
  @apply text-lg font-semibold text-sidebar-foreground whitespace-nowrap;
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
  @apply flex-1 font-medium text-sm whitespace-nowrap;
}

.sidebar-footer {
  @apply p-4 border-t border-sidebar-border;
}

.collapse-button {
  @apply w-full flex items-center justify-center p-2 rounded-lg hover:bg-sidebar-accent text-sidebar-foreground transition-colors;
}

.collapse-icon {
  @apply w-5 h-5;
}

/* 主内容区 */
.main-content {
  @apply flex-1 ml-0 lg:ml-64 transition-all duration-300 min-h-screen flex flex-col;
}

.main-content.sidebar-collapsed {
  @apply lg:ml-16;
}

.main-content.mobile {
  @apply pb-16;
}

/* 头部 */
.main-header {
  @apply h-16 flex items-center justify-between px-4 lg:px-6 border-b border-border bg-background sticky top-0 z-10;
}

.header-left {
  @apply flex items-center gap-3;
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

.header-right {
  @apply flex items-center gap-2;
}

.search-box {
  @apply flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-lg border border-border focus-within:ring-2 focus-within:ring-ring/50;
}

.search-icon {
  @apply w-4 h-4 text-muted-foreground;
}

.search-input {
  @apply flex-1 bg-transparent border-none outline-none text-sm text-foreground placeholder:text-muted-foreground w-40 lg:w-48;
}

.icon-button {
  @apply p-2 rounded-lg hover:bg-accent text-foreground transition-colors;
}

.action-icon {
  @apply w-5 h-5;
}

/* 内容区 */
.content {
  @apply flex-1 p-4 lg:p-6;
}

/* 移动端侧边栏 */
.sidebar-overlay {
  @apply fixed inset-0 bg-black/50 z-20;
}

.mobile-sidebar {
  @apply fixed left-0 top-0 bottom-0 w-72 bg-sidebar z-30 transform -translate-x-full transition-transform duration-300;
}

.mobile-sidebar.open {
  @apply translate-x-0;
}

.mobile-sidebar-header {
  @apply h-16 flex items-center justify-between px-4 border-b border-sidebar-border;
}

.close-button {
  @apply p-2 rounded-lg hover:bg-sidebar-accent text-sidebar-foreground transition-colors;
}

.close-icon {
  @apply w-5 h-5;
}

.mobile-nav {
  @apply p-4 space-y-1;
}

.mobile-nav-link {
  @apply flex items-center gap-3 px-3 py-3 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors;
}

.mobile-nav-link.router-link-active {
  @apply bg-sidebar-primary text-sidebar-primary-foreground;
}

/* 动画过渡 */
.fade-enter-active,
.fade-leave-active {
  @apply transition-opacity duration-200;
}

.fade-enter-from,
.fade-leave-to {
  @apply opacity-0;
}
</style>
