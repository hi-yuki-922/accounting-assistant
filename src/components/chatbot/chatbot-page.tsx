/**
 * AI 聊天机器人页面
 * 使用拆分的组件构建对话界面
 */

import { MessageSquare, Settings } from 'lucide-react'
import * as React from 'react'

import { chat } from '@/api/commands'
import { Button } from '@/components/ui/button'
import { getApiKey, getModelName } from '@/lib/ai-provider'

import { ChatControls } from './chat-controls'
import { ChatHeader } from './chat-header'
import { MessageInput } from './message-input'
import { MessageList } from './message-list'
import { SessionDrawer } from './session-drawer'

export const ChatbotPage = () => {
  // 检查 API Key 配置
  const apiKey = getApiKey()
  const modelName = getModelName()

  if (!apiKey) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center space-y-4">
          <MessageSquare className="mx-auto h-16 w-16 text-muted-foreground" />
          <h2 className="text-xl font-semibold">请先配置 AI API Key</h2>
          <p className="text-muted-foreground">
            在设置页面添加智谱 AI API Key 后即可使用聊天功能
          </p>
          <Button asChild>
            <a href="/settings">
              <Settings className="mr-2 h-4 w-4" />
              前往设置
            </a>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <ChatControls>
      {({
        sessions,
        setSessions,
        currentSession,
        setCurrentSession,
        messages,
        setIsDrawerOpen,
        setMessages,
        input,
        setInput,
        isLoading,
        setIsLoading,
        chatStatus,
        isDrawerOpen,
        editingSessionId,
        editingTitle,
        setEditingTitle,
        onSelectSession,
        onDeleteSession,
        onStartRenameSession,
        onSaveSessionTitle,
        onCancelRenameSession,
        onSendMessage,
      }) => (
        <div className="flex h-[calc(100vh-8rem)] flex-col md:h-[calc(100vh-9rem)]">
          <ChatHeader
            currentSession={currentSession}
            isLoading={isLoading}
            onCreateNewSession={async () => {
              setIsLoading(true)
              const newSession = await chat.createSession({
                model: modelName,
                title: `对话 ${sessions.length + 1}`,
              })
              if (newSession.isOk()) {
                setSessions([newSession.value, ...sessions])
                setCurrentSession(newSession.value)
                setMessages([])
                setIsDrawerOpen(false)
              }
              setIsLoading(false)
            }}
            onToggleDrawer={() => setIsDrawerOpen(true)}
          />

          <MessageList messages={messages} />

          <div className="border-t p-4">
            <MessageInput
              inputValue={input}
              onInputChange={setInput}
              onSubmit={onSendMessage}
              chatStatus={chatStatus}
            />
          </div>

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
            onCreateNewSession={async () => {
              setIsLoading(true)
              const newSession = await chat.createSession({
                model: modelName,
                title: `对话 ${sessions.length + 1}`,
              })
              if (newSession.isOk()) {
                setSessions([newSession.value, ...sessions])
                setCurrentSession(newSession.value)
                setMessages([])
                setIsDrawerOpen(false)
              }
              setIsLoading(false)
            }}
            isLoading={isLoading}
            editingSessionId={editingSessionId}
            editingTitle={editingTitle}
            setEditingTitle={setEditingTitle}
          />
        </div>
      )}
    </ChatControls>
  )
}
