/**
 * Chat 模块枚举定义
 * 与 Rust 后端 src-tauri/src/entity/chat_message.rs 中的枚举定义对齐
 */

/**
 * 消息角色枚举
 * 与 Rust 后端 MessageRole 枚举对齐
 */
export enum MessageRole {
  User = 'user',
  Assistant = 'assistant',
  System = 'system',
}

/**
 * 消息状态枚举
 * 与 Rust 后端 MessageState 枚举对齐
 */
export enum MessageState {
  Sending = 'sending',
  Sent = 'sent',
  Completed = 'completed',
  Failed = 'failed',
}
