/**
 * API 命令统一导出
 * 使用 ES Modules 方式导出所有模块
 */

// 导出各个模块
export * from './chat'
export * from './accounting'
export * from './accounting-book'
export * from './attachment'
export * from './customer'

// 便捷导入
export { chat } from './chat'
export { accounting } from './accounting'
export { accountingBook } from './accounting-book'
export { attachment } from './attachment'
export { customerApi } from './customer'

// 重新导出 tryCMD
export { tryCMD } from '@/lib'
