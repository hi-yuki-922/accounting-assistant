/**
 * API 命令统一导出
 * 使用 ES Modules 方式导出所有模块
 */

// 导出各个模块
export * from './chat'
export * from './accounting'
export * from './accounting-book'
export * from './attachment'
export * from './category'
export * from './customer'
export * from './product'
export * from './order'

// 便捷导入
export { chat } from './chat'
export { accounting } from './accounting'
export { accountingBook } from './accounting-book'
export { attachment } from './attachment'
export { categoryApi } from './category'
export { customerApi } from './customer'
export { productApi } from './product'
export { orderApi } from './order'

// 重新导出 tryCMD
export { tryCMD } from '@/lib'
