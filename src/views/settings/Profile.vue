<script setup lang="ts">
/**
 * 个人资料设置页面
 */

import { ref } from 'vue'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Icon } from '@iconify/vue'

/**
 * 用户资料数据
 */
const profile = ref({
  nickname: '用户',
  email: 'user@example.com',
  phone: '138****8888',
  avatar: '',
})
</script>

<template>
  <div class="profile-settings">
    <!-- 页面头部 -->
    <div class="page-header">
      <h2 class="page-title">个人资料</h2>
      <p class="page-subtitle">管理您的账户信息</p>
    </div>

    <!-- 头像设置 -->
    <Card class="avatar-card">
      <CardHeader>
        <CardTitle>头像</CardTitle>
        <CardDescription>设置您的头像</CardDescription>
      </CardHeader>
      <CardContent>
        <div class="avatar-section">
          <div class="avatar-wrapper">
            <div class="avatar">
              <Icon icon="lucide:user" class="avatar-icon" />
            </div>
            <Button variant="outline" size="sm">更换头像</Button>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- 基本信息 -->
    <Card class="info-card">
      <CardHeader>
        <CardTitle>基本信息</CardTitle>
        <CardDescription>更新您的个人资料</CardDescription>
      </CardHeader>
      <CardContent>
        <div class="info-form">
          <div class="form-item">
            <label class="form-label">昵称</label>
            <Input v-model="profile.nickname" placeholder="请输入昵称" />
          </div>
          <div class="form-item">
            <label class="form-label">邮箱</label>
            <Input v-model="profile.email" type="email" placeholder="请输入邮箱" />
          </div>
          <div class="form-item">
            <label class="form-label">手机号</label>
            <Input v-model="profile.phone" disabled placeholder="已绑定手机号" />
          </div>
          <Button class="save-button">保存更改</Button>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<style scoped>
.profile-settings {
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

.avatar-card {
  @apply border-none;
}

.avatar-section {
  @apply flex items-center gap-6;
}

.avatar-wrapper {
  @apply flex items-center gap-4;
}

.avatar {
  @apply w-20 h-20 rounded-full bg-muted flex items-center justify-center;
}

.avatar-icon {
  @apply w-10 h-10 text-muted-foreground;
}

.info-card {
  @apply border-none;
}

.info-form {
  @apply space-y-4;
}

.form-item {
  @apply flex flex-col gap-2;
}

.form-label {
  @apply text-sm font-medium text-foreground;
}

.save-button {
  @apply mt-4;
}
</style>
