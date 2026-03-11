<script setup lang="ts">
/**
 * 404 页面未找到
 */

import { useRouter } from 'vue-router'
import { Button } from '@/components/ui/button'
import { Icon } from '@iconify/vue'

const router = useRouter()

/**
 * 返回首页
 */
const goHome = () => {
  router.push('/')
}
</script>

<template>
  <div class="not-found">
    <div class="content">
      <div class="icon-wrapper">
        <Icon icon="lucide:search-x" class="icon" />
      </div>
      <h1 class="title">404</h1>
      <p class="description">抱歉，您访问的页面不存在</p>
      <Button @click="goHome" class="home-button">
        <Icon icon="lucide:home" class="mr-2" />
        返回首页
      </Button>
    </div>
  </div>
</template>

<style scoped>
.not-found {
  @apply flex items-center justify-center min-h-[60vh];
}

.content {
  @apply flex flex-col items-center text-center;
}

.icon-wrapper {
  @apply w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-6;
}

.icon {
  @apply w-12 h-12 text-muted-foreground;
}

.title {
  @apply text-6xl font-bold text-foreground mb-2;
}

.description {
  @apply text-muted-foreground mb-6;
}

.home-button {
  @apply min-w-32;
}
</style>
