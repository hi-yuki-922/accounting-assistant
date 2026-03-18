import {
  MessageSquare,
  Plus,
  MoreVertical,
  Send,
  Paperclip,
  Settings,
} from 'lucide-react'
import * as React from 'react'
import { useState, useEffect, useRef } from 'react'

import { chat } from '@/api/commands'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import type { ChatMessage, ChatSession } from '@/types/chat'

export const ChatbotPage = () => {
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [apiKey, setApiKey] = useState<string>('')
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  // 加载 API Key
  useEffect(() => {
    const savedApiKey = localStorage.getItem('zhipu_api_key')
    if (savedApiKey) {
      setApiKey(savedApiKey)
    }
  }, [])

  // 自动滚动到底部
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  // 加载会话列表
  const loadSessions = async () => {
    try {
      const result = await chat.getAllSessions()
      if (result.isOk()) {
        setSessions(result.value)
      } else {
        console.error('加载会话列表失败:', result.error)
      }
    } catch (error) {
      console.error('加载会话列表失败:', error)
    }
  }

  useEffect(() => {
    loadSessions()
  }, [])

  const loadMessages = async (sessionId: number) => {
    try {
      const result = await chat.getMessages(sessionId)
      if (result.isOk()) {
        setMessages(result.value)
      } else {
        console.error('加载消息失败:', result.error)
      }
    } catch (error) {
      console.error('加载消息失败:', error)
    }
  }

  const createNewSession = async () => {
    try {
      const result = await chat.createSession({
        title: `对话 ${sessions.length + 1}`,
      })
      if (result.isOk()) {
        const newSession = result.value
        setSessions([newSession, ...sessions])
        setCurrentSession(newSession)
        setMessages([])
        setIsDrawerOpen(false)
      } else {
        console.error('创建会话失败:', result.error)
      }
    } catch (error) {
      console.error('创建会话失败:', error)
    }
  }

  const selectSession = (session: ChatSession) => {
    setCurrentSession(session)
    loadMessages(session.id)
    setIsDrawerOpen(false)
  }

  const deleteSession = async (sessionId: number) => {
    try {
      const result = await chat.deleteSession(sessionId)
      if (result.isOk()) {
        setSessions((prev) => prev.filter((s) => s.id !== sessionId))
        if (currentSession?.id === sessionId) {
          setCurrentSession(null)
          setMessages([])
        }
      } else {
        console.error('删除会话失败:', result.error)
      }
    } catch (error) {
      console.error('删除会话失败:', error)
    }
  }

  const sendMessage = async () => {
    if (!input.trim() || !currentSession || isLoading) {
      return
    }

    try {
      // 保存用户消息
      const userResult = await chat.createMessage({
        content: input,
        role: 'user',
        session_id: currentSession.id,
        state: chat.MessageState.Sending,
      })

      if (userResult.isErr()) {
        console.error('保存用户消息失败:', userResult.error)
        return
      }

      const savedUserMessage = userResult.value
      setMessages((prev) => [...prev, savedUserMessage])
      setInput('')
      setIsLoading(true)

      // 更新用户消息状态为已发送
      await chat.updateMessageState(savedUserMessage.id, chat.MessageState.Sent)

      // TODO: 集成 AI SDK 获取实际回复
      // 暂时创建占位回复，后续需要替换为真实的 AI 回复
      const assistantResult = await chat.createMessage({
        content: '正在处理您的请求...',
        role: 'assistant',
        session_id: currentSession.id,
        state: chat.MessageState.Sending,
      })

      if (assistantResult.isOk()) {
        const savedAssistantMessage = assistantResult.value
        setMessages((prev) => [...prev, savedAssistantMessage])

        // 模拟 AI 处理延迟
        setTimeout(async () => {
          try {
            // 这里应该调用实际的 AI SDK 获取回复
            const aiResponse = `收到您的消息：${input}\n\n作为您的 AI 财务助手，我可以帮助您：\n- 分析收支记录\n- 提供理财建议\n- 生成财务报表\n\n请问您需要什么帮助？`

            await chat.updateMessageContent(
              savedAssistantMessage.id,
              aiResponse
            )
            await chat.updateMessageState(
              savedAssistantMessage.id,
              chat.MessageState.Completed
            )

            // 更新消息列表中的状态
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === savedAssistantMessage.id
                  ? {
                      ...msg,
                      content: aiResponse,
                      state: chat.MessageState.Completed,
                    }
                  : msg
              )
            )
          } catch (error) {
            console.error('更新 AI 回复失败:', error)
            await chat.updateMessageState(
              savedAssistantMessage.id,
              chat.MessageState.Failed
            )
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === savedAssistantMessage.id
                  ? { ...msg, state: chat.MessageState.Failed }
                  : msg
              )
            )
          }
        }, 1000)
      } else {
        console.error('保存助手消息失败:', assistantResult.error)
      }
    } catch (error) {
      console.error('发送消息失败:', error)
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

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
    <div className="flex h-[calc(100vh-8rem)] flex-col md:h-[calc(100vh-9rem)]">
      {/* 头部 */}
      <div className="flex items-center justify-between border-b p-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsDrawerOpen(true)}
          >
            <MessageSquare className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-lg font-semibold">
              {currentSession?.title || 'AI 财务助手'}
            </h2>
            <p className="text-sm text-muted-foreground">
              {currentSession ? '继续对话' : '开始新的对话'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={createNewSession}
            disabled={isLoading}
          >
            <Plus className="mr-2 h-4 w-4" />
            新对话
          </Button>
        </div>
      </div>

      {/* 消息列表 */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full p-4" ref={scrollRef}>
          {messages.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <div className="text-center space-y-4">
                <MessageSquare className="mx-auto h-16 w-16 text-muted-foreground" />
                <h3 className="text-lg font-semibold">开始新的对话</h3>
                <p className="text-muted-foreground">
                  询问关于您的财务数据的问题，获取专业的财务建议
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    'flex gap-3',
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  {message.role === 'assistant' && (
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>AI</AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={cn(
                      'max-w-[80%] rounded-lg px-4 py-2',
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    )}
                  >
                    <p className="text-sm whitespace-pre-wrap">
                      {message.content}
                    </p>
                    {message.state === 'sending' && (
                      <span className="ml-2 text-xs text-muted-foreground">
                        发送中...
                      </span>
                    )}
                  </div>
                  {message.role === 'user' && (
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"
                        alt="用户头像"
                      />
                      <AvatarFallback>用户</AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>AI</AvatarFallback>
                  </Avatar>
                  <div className="bg-muted rounded-lg px-4 py-2">
                    <div className="flex gap-1">
                      <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground" />
                      <div
                        className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground"
                        style={{ animationDelay: '0.1s' }}
                      />
                      <div
                        className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground"
                        style={{ animationDelay: '0.2s' }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* 输入区域 */}
      <div className="border-t p-4">
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" disabled={isLoading}>
            <Paperclip className="h-5 w-5" />
          </Button>
          <Input
            placeholder="输入消息..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
            className="flex-1"
          />
          <Button onClick={sendMessage} disabled={isLoading || !input.trim()}>
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* 会话列表抽屉 */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
          <div className="fixed inset-y-0 left-0 z-50 h-full w-80 border-r bg-background p-4">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">对话列表</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsDrawerOpen(false)}
              >
                ✕
              </Button>
            </div>
            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={createNewSession}
                disabled={isLoading}
              >
                <Plus className="mr-2 h-4 w-4" />
                新对话
              </Button>
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className={cn(
                    'flex cursor-pointer items-center justify-between rounded-lg border p-3 hover:bg-accent',
                    currentSession?.id === session.id && 'bg-accent'
                  )}
                  onClick={() => selectSession(session)}
                >
                  <div className="flex-1">
                    <p className="font-medium">{session.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(session.updated_at).toLocaleDateString()}
                    </p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteSession(session.id)
                        }}
                      >
                        删除对话
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
