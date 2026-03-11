<script setup lang="ts">
/**
 * 数据管理页面
 */

import { ref } from 'vue'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Icon } from '@iconify/vue'

/**
 * 数据统计
 */
const dataStats = ref({
  totalRecords: 256,
  totalAccounts: 5,
  lastBackup: '2026-03-10 14:30',
  dataSize: '1.2 MB',
})

/**
 * 导出数据
 */
const exportData = () => {
  console.log('导出数据')
}

/**
 * 导入数据
 */
const importData = () => {
  console.log('导入数据')
}

/**
 * 备份数据
 */
const backupData = () => {
  console.log('备份数据')
}

/**
 * 清除数据
 */
const clearData = () => {
  console.log('清除数据')
}
</script>

<template>
  <div class="data-settings">
    <!-- 页面头部 -->
    <div class="page-header">
      <h2 class="page-title">数据管理</h2>
      <p class="page-subtitle">管理您的数据</p>
    </div>

    <!-- 数据统计 -->
    <Card class="stats-card">
      <CardHeader>
        <CardTitle>数据统计</CardTitle>
        <CardDescription>查看您的数据概览</CardDescription>
      </CardHeader>
      <CardContent>
        <div class="stats-grid">
          <div class="stat-item">
            <Icon icon="lucide:file-text" class="stat-icon" />
            <div class="stat-info">
              <p class="stat-value">{{ dataStats.totalRecords }}</p>
              <p class="stat-label">交易记录</p>
            </div>
          </div>
          <div class="stat-item">
            <Icon icon="lucide:wallet" class="stat-icon" />
            <div class="stat-info">
              <p class="stat-value">{{ dataStats.totalAccounts }}</p>
              <p class="stat-label">账户数量</p>
            </div>
          </div>
          <div class="stat-item">
            <Icon icon="lucide:hard-drive" class="stat-icon" />
            <div class="stat-info">
              <p class="stat-value">{{ dataStats.dataSize }}</p>
              <p class="stat-label">数据大小</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- 数据操作 -->
    <Card class="operations-card">
      <CardHeader>
        <CardTitle>数据操作</CardTitle>
        <CardDescription>导入、导出和备份数据</CardDescription>
      </CardHeader>
      <CardContent>
        <div class="operations-list">
          <div class="operation-item">
            <div class="operation-info">
              <Icon icon="lucide:download" class="operation-icon" />
              <div class="operation-text">
                <p class="operation-title">导出数据</p>
                <p class="operation-description">将数据导出为 CSV 或 JSON 文件</p>
              </div>
            </div>
            <Button variant="outline" @click="exportData">导出</Button>
          </div>

          <div class="operation-item">
            <div class="operation-info">
              <Icon icon="lucide:upload" class="operation-icon" />
              <div class="operation-text">
                <p class="operation-title">导入数据</p>
                <p class="operation-description">从文件导入数据</p>
              </div>
            </div>
            <Button variant="outline" @click="importData">导入</Button>
          </div>

          <div class="operation-item">
            <div class="operation-info">
              <Icon icon="lucide:cloud" class="operation-icon" />
              <div class="operation-text">
                <p class="operation-title">备份数据</p>
                <p class="operation-description">上次备份: {{ dataStats.lastBackup }}</p>
              </div>
            </div>
            <Button variant="outline" @click="backupData">备份</Button>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- 危险操作 -->
    <Card class="danger-card">
      <CardHeader>
        <CardTitle class="text-red">危险操作</CardTitle>
        <CardDescription>以下操作不可恢复，请谨慎操作</CardDescription>
      </CardHeader>
      <CardContent>
        <div class="danger-item">
          <div class="danger-info">
            <p class="danger-title">清除所有数据</p>
            <p class="danger-description">删除所有交易记录和账户数据</p>
          </div>
          <Button variant="destructive" @click="clearData">清除数据</Button>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<style scoped>
.data-settings {
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

.stats-grid {
  @apply grid grid-cols-3 gap-4;
}

.stat-item {
  @apply flex items-center gap-3 p-4 rounded-lg bg-muted/50;
}

.stat-icon {
  @apply w-8 h-8 text-primary;
}

.stat-info {
  @apply flex flex-col;
}

.stat-value {
  @apply text-xl font-bold text-foreground;
}

.stat-label {
  @apply text-xs text-muted-foreground;
}

.operations-list {
  @apply space-y-4;
}

.operation-item {
  @apply flex items-center justify-between gap-4;
}

.operation-info {
  @apply flex items-center gap-3;
}

.operation-icon {
  @apply w-5 h-5 text-muted-foreground;
}

.operation-text {
  @apply flex flex-col;
}

.operation-title {
  @apply text-sm font-medium text-foreground;
}

.operation-description {
  @apply text-xs text-muted-foreground;
}

.danger-card {
  @apply border-red/30;
}

.text-red {
  @apply text-red;
}

.danger-item {
  @apply flex items-center justify-between gap-4;
}

.danger-info {
  @apply flex flex-col;
}

.danger-title {
  @apply text-sm font-medium text-foreground;
}

.danger-description {
  @apply text-xs text-muted-foreground;
}
</style>
