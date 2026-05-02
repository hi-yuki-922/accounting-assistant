/**
 * 确认模式管理
 * 通过 localStorage 持久化用户偏好
 */

const STORAGE_KEY = 'confirmation-mode'

export type ConfirmationMode = 'on' | 'off'

/**
 * 获取确认模式（默认开启）
 */
export const getConfirmationMode = (): ConfirmationMode => {
  const saved = localStorage.getItem(STORAGE_KEY)
  return saved === 'off' ? 'off' : 'on'
}

/**
 * 设置确认模式
 */
export const setConfirmationMode = (mode: ConfirmationMode): void => {
  localStorage.setItem(STORAGE_KEY, mode)
}

/**
 * 切换确认模式
 */
export const toggleConfirmationMode = (): ConfirmationMode => {
  const current = getConfirmationMode()
  const next = current === 'on' ? 'off' : 'on'
  setConfirmationMode(next)
  return next
}
