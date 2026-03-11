/**
 * Vue Router 配置
 */

import { createRouter, createWebHashHistory } from 'vue-router'
import type { App } from 'vue'
import routes from './routes'

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior(_to, _from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  },
})

// 全局前置守卫
router.beforeEach((to, _from, next) => {
  // 设置页面标题
  if (to.meta.title) {
    document.title = `${to.meta.title} - 记账助手`
  } else {
    document.title = '记账助手'
  }
  next()
})

// 导出路由实例
export function setupRouter(app: App) {
  app.use(router)
}

export default router
