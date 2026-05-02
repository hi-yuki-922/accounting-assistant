/**
 * 订单看板事件发射器
 * 全局单例，供 AI 通知工具和看板组件共享使用
 */

type EventHandler<T = unknown> = (payload: T) => void

type EventsMap = {
  'order-board:refresh': { orderType: 'Sales' | 'Purchase' | 'All' }
}

// 轻量 mitt 风格事件总线
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type EventMap = Record<string, any>
function createEmitter<E extends EventMap>() {
  const listeners = new Map<keyof E, Set<EventHandler>>()
  return {
    on<K extends keyof E>(event: K, handler: EventHandler<E[K]>) {
      if (!listeners.has(event)) {
        listeners.set(event, new Set())
      }
      listeners.get(event)!.add(handler as EventHandler)
    },
    off<K extends keyof E>(event: K, handler: EventHandler<E[K]>) {
      listeners.get(event)?.delete(handler as EventHandler)
    },
    emit<K extends keyof E>(event: K, payload: E[K]) {
      listeners.get(event)?.forEach((fn) => fn(payload))
    },
  }
}

export type OrderBoardEvents = EventsMap
export const orderBoardEmitter = createEmitter<OrderBoardEvents>()
