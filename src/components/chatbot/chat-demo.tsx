/**
 * 聊天组件使用示例
 * 展示不同的架构使用方式
 */

import * as React from 'react'

import { useChatbot } from '@/hooks/use-chatbot'
import type { ChatMessage, ChatSession } from '@/types/chat'

import { ChatControls } from './chat-controls'
import { SessionDrawer } from './session-drawer'

/**
 * 使用单一 Hook 的方式（推荐）
 * 这是最简洁的使用方式
 */
export function ChatSimple() {
  // 直接使用 Hook，所有状态和方法都在这里
  const chatbotState = useChatbot()

  // 解构需要的状态和方法
  const {
    sessions,
    currentSession,
    messages,
    input,
    isLoading,
    isDrawerOpen,
    editingSessionId,
    editingTitle,
    setInput,
    setIsDrawerOpen,
    setEditingTitle,
    onSelectSession,
    onDeleteSession,
    onStartRenameSession,
    onSaveSessionTitle,
    onCancelRenameSession,
    onSendMessage,
    onCreateNewSession,
  } = chatbotState

  return (
    <div className="h-screen flex">
      {/* 主聊天区域 */}
      <div className="flex-1 flex flex-col">
        <div className="p-4 border-b">
          <h1 className="text-xl font-semibold">聊天助手</h1>
        </div>

        {/* 消息列表 */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`p-3 rounded-lg ${
                message.role === 'user'
                  ? 'bg-primary text-primary-foreground ml-8'
                  : 'bg-muted mr-8'
              }`}
            >
              {message.content}
            </div>
          ))}
          {isLoading && (
            <div className="p-3 rounded-lg bg-muted mr-8">思考中...</div>
          )}
        </div>

        {/* 输入框 */}
        <div className="p-4 border-t">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !isLoading) {
                onSendMessage({ files: [], text: input })
              }
            }}
            placeholder="输入消息..."
            className="w-full p-2 border rounded-lg"
            disabled={isLoading}
          />
        </div>
      </div>

      {/* 会话抽屉 */}
      <SessionDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        sessions={sessions}
        currentSession={currentSession}
        onSelectSession={onSelectSession}
        onDeleteSession={onDeleteSession}
        onStartRenameSession={onStartRenameSession}
        onSaveSessionTitle={onSaveSessionTitle}
        onCancelRenameSession={onCancelRenameSession}
        onCreateNewSession={onCreateNewSession}
        isLoading={isLoading}
        editingSessionId={editingSessionId}
        editingTitle={editingTitle}
        setEditingTitle={setEditingTitle}
      />
    </div>
  )
}

/**
 * 使用复合组件的方式（保持向后兼容）
 * 适合需要更细粒度控制的场景
 */
export function ChatWithControls() {
  return (
    <div className="h-screen flex">
      <ChatControls initialSessions={[]}>
        {({
          sessions,
          currentSession,
          messages,
          input,
          isLoading,
          isDrawerOpen,
          setInput,
          setIsDrawerOpen,
          onSelectSession,
          onDeleteSession,
          onSendMessage,
          onCreateNewSession,
        }) => (
          <>
            {/* 主聊天区域 */}
            <div className="flex-1 flex flex-col">
              <div className="p-4 border-b">
                <h1 className="text-xl font-semibold">聊天助手（复合组件）</h1>
              </div>

              {/* 消息列表 */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`p-3 rounded-lg ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground ml-8'
                        : 'bg-muted mr-8'
                    }`}
                  >
                    {message.content}
                  </div>
                ))}
                {isLoading && (
                  <div className="p-3 rounded-lg bg-muted mr-8">思考中...</div>
                )}
              </div>

              {/* 输入框 */}
              <div className="p-4 border-t">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !isLoading) {
                      onSendMessage({ files: [], text: input })
                    }
                  }}
                  placeholder="输入消息..."
                  className="w-full p-2 border rounded-lg"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* 会话抽屉 */}
            <SessionDrawer
              isOpen={isDrawerOpen}
              onClose={() => setIsDrawerOpen(false)}
              sessions={sessions}
              currentSession={currentSession}
              onSelectSession={onSelectSession}
              onDeleteSession={onDeleteSession}
              onCreateNewSession={onCreateNewSession}
              isLoading={isLoading}
              // 注意：这里需要添加其他必要的 props
            />
          </>
        )}
      </ChatControls>
    </div>
  )
}
