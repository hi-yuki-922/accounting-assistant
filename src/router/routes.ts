/**
 * 路由配置
 * 根据应用结构定义所有路由
 */

import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/dashboard',
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/layouts/DefaultLayout.vue'),
    children: [
      {
        path: '',
        name: 'DashboardOverview',
        component: () => import('@/views/dashboard/Overview.vue'),
        meta: {
          title: '仪表盘',
        },
      },
      {
        path: 'transactions',
        name: 'Transactions',
        component: () => import('@/views/dashboard/Transactions.vue'),
        meta: {
          title: '交易记录',
        },
      },
      {
        path: 'accounts',
        name: 'Accounts',
        component: () => import('@/views/dashboard/Accounts.vue'),
        meta: {
          title: '账户管理',
        },
      },
    ],
  },
  {
    path: '/charts',
    name: 'Charts',
    component: () => import('@/layouts/DefaultLayout.vue'),
    children: [
      {
        path: '',
        name: 'ChartsOverview',
        component: () => import('@/views/charts/Overview.vue'),
        meta: {
          title: '图表分析',
        },
      },
      {
        path: 'income',
        name: 'ChartsIncome',
        component: () => import('@/views/charts/Income.vue'),
        meta: {
          title: '收入分析',
        },
      },
      {
        path: 'expense',
        name: 'ChartsExpense',
        component: () => import('@/views/charts/Expense.vue'),
        meta: {
          title: '支出分析',
        },
      },
      {
        path: 'trend',
        name: 'ChartsTrend',
        component: () => import('@/views/charts/Trend.vue'),
        meta: {
          title: '趋势分析',
        },
      },
    ],
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('@/layouts/DefaultLayout.vue'),
    children: [
      {
        path: '',
        name: 'SettingsOverview',
        component: () => import('@/views/settings/Overview.vue'),
        meta: {
          title: '设置',
        },
      },
      {
        path: 'profile',
        name: 'SettingsProfile',
        component: () => import('@/views/settings/Profile.vue'),
        meta: {
          title: '个人资料',
        },
      },
      {
        path: 'preferences',
        name: 'SettingsPreferences',
        component: () => import('@/views/settings/Preferences.vue'),
        meta: {
          title: '偏好设置',
        },
      },
      {
        path: 'data',
        name: 'SettingsData',
        component: () => import('@/views/settings/Data.vue'),
        meta: {
          title: '数据管理',
        },
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFound.vue'),
    meta: {
      title: '页面未找到',
    },
  },
]

export default routes
