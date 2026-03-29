/**
 * API 模块统一导出
 * 使用 ES Modules 方式
 */

// 导出所有命令
export * from './commands'

// 便捷导入
export { chat } from './commands/chat'
export { accounting } from './commands/accounting'
export { accountingBook } from './commands/accounting-book'
export { attachment } from './commands/attachment'

// 重新导出 tryCMD
export { tryCMD } from '@/lib'
