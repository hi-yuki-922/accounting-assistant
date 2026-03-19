/**
 * AI 聊天机器人页面
 * 使用 ai-elements 组件构建对话界面
 */

import type { ChatStatus } from 'ai'
import { streamText } from 'ai'
import {
  MessageSquare,
  Plus,
  MoreVertical,
  Settings,
  Trash2,
  Edit2,
  Check,
  X,
  Paperclip,
} from 'lucide-react'
import * as React from 'react'
import { useState, useEffect, useRef } from 'react'

import { chat, MessageRole, MessageState } from '@/api/commands'
import {
  Attachment,
  AttachmentPreview,
  AttachmentRemove,
  Attachments,
} from '@/components/ai-elements/attachments'
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from '@/components/ai-elements/conversation'
import {
  Message,
  MessageContent,
  MessageResponse,
} from '@/components/ai-elements/message'
import {
  PromptInput,
  PromptInputActionAddAttachments,
  PromptInputActionMenu,
  PromptInputActionMenuContent,
  PromptInputActionMenuTrigger,
  PromptInputBody,
  PromptInputButton,
  PromptInputFooter,
  PromptInputHeader,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
  usePromptInputAttachments,
} from '@/components/ai-elements/prompt-input'
import type { PromptInputMessage } from '@/components/ai-elements/prompt-input'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  createFinanceAgent,
  createZAiProvider,
  getApiKey,
  getModelName,
} from '@/lib/ai-provider'
import { financeTools } from '@/lib/chat-tools'
import { cn } from '@/lib/utils'
import type { ChatMessage, ChatSession } from '@/types/chat'

// 附件预览组件
const PromptInputAttachmentsDisplay = () => {
  const attachments = usePromptInputAttachments()

  if (attachments.files.length === 0) {
    return null
  }

  return (
    <Attachments variant="inline">
      {attachments.files.map((attachment) => (
        <Attachment
          data={attachment}
          key={attachment.id}
          onRemove={() => attachments.remove(attachment.id)}
        >
          <AttachmentPreview />
          <AttachmentRemove />
        </Attachment>
      ))}
    </Attachments>
  )
}

export const ChatbotPage = () => {
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [chatStatus, setChatStatus] = useState<ChatStatus>('submitted')
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [editingSessionId, setEditingSessionId] = useState<number | null>(null)
  const [editingTitle, setEditingTitle] = useState('')

  const scrollRef = useRef<HTMLDivElement>(null)
  const agentRef = useRef<ReturnType<typeof createFinanceAgent> | null>(null)

  // 获取 API Key 和模型名称
  const apiKey = getApiKey()
  const modelName = getModelName()

  // 初始化 Agent
  useEffect(() => {
    if (apiKey) {
      agentRef.current = createFinanceAgent(apiKey, financeTools, modelName)
    }
  }, [apiKey, modelName])

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

  // 自动滚动到底部
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

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
        model: modelName,
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

  const createTempSession = async (): Promise<ChatSession> => {
    const result = await chat.createSession({
      model: modelName,
      title: '新对话',
    })
    if (result.isOk()) {
      const newSession = result.value
      setSessions([newSession, ...sessions])
      setCurrentSession(newSession)
      return newSession
    }
    throw new Error('创建会话失败')
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

  const startRenameSession = (session: ChatSession) => {
    setEditingSessionId(session.id)
    setEditingTitle(session.title)
  }

  const saveSessionTitle = async (sessionId: number) => {
    try {
      const result = await chat.updateSessionTitle(
        sessionId,
        editingTitle.trim()
      )
      if (result.isOk()) {
        setSessions((prev) =>
          prev.map((s) =>
            s.id === sessionId ? { ...s, title: editingTitle.trim() } : s
          )
        )
        if (currentSession?.id === sessionId) {
          setCurrentSession((prev) =>
            prev ? { ...prev, title: editingTitle.trim() } : null
          )
        }
        setEditingSessionId(null)
        setEditingTitle('')
      } else {
        console.error('更新会话标题失败:', result.error)
      }
    } catch (error) {
      console.error('更新会话标题失败:', error)
    }
  }

  const cancelRenameSession = () => {
    setEditingSessionId(null)
    setEditingTitle('')
  }

  const sendMessage = async (message: PromptInputMessage) => {
    const { text: userContent, files } = message
    if (!userContent.trim() && files.length === 0) {
      return
    }

    setInput('')

    // 如果没有当前会话，先创建临时会话
    let session = currentSession
    if (!session) {
      session = await createTempSession()
    }

    setIsLoading(true)
    setChatStatus('submitted')

    try {
      // 保存用户消息
      const userResult = await chat.createMessage({
        content: userContent,
        role: MessageRole.User,
        session_id: session.id,
        state: MessageState.Completed,
      })

      if (userResult.isErr()) {
        console.error('保存用户消息失败:', userResult.error)
        throw new Error('保存用户消息失败')
      }

      setMessages((prev) => [...prev, userResult.value])

      // 创建占位符助手消息
      const assistantResult = await chat.createMessage({
        content: '',
        role: MessageRole.Assistant,
        session_id: session.id,
        state: MessageState.Sending,
      })

      if (assistantResult.isErr()) {
        console.error('创建助手消息失败:', assistantResult.error)
        throw new Error('创建助手消息失败')
      }

      setMessages((prev) => [...prev, assistantResult.value])

      // 准备历史消息
      const historyMessages = await chat.getMessages(session.id)
      if (historyMessages.isErr()) {
        console.error('获取历史消息失败:', historyMessages.error)
        throw new Error('获取历史消息失败')
      }

      // 使用 ToolLoopAgent 进行真实 AI 调用
      const agent = agentRef.current
      if (!agent) {
        throw new Error('AI Agent 未初始化，请检查 API Key 配置')
      }

      setChatStatus('streaming')

      // 使用 streamText 进行真实的 AI 调用
      if (!apiKey) {
        throw new Error('API Key 未配置')
      }
      const provider = createZAiProvider(apiKey)
      const model = provider(modelName)

      // 构建消息历史
      const messages = historyMessages.value.map((msg) => ({
        content: msg.content,
        role: msg.role as 'user' | 'assistant' | 'system',
      }))

      let aiResponse = ''
      const result = streamText({
        messages,
        model,
      })

      // 处理流式响应
      for await (const chunk of result.textStream) {
        aiResponse += chunk
        // 实时更新消息内容
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantResult.value.id
              ? { ...msg, content: aiResponse }
              : msg
          )
        )
      }

      // 更新消息内容和状态
      await chat.updateMessageContent({
        content: aiResponse,
        id: assistantResult.value.id,
      })
      await chat.updateMessageState(
        assistantResult.value.id,
        MessageState.Completed
      )

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantResult.value.id
            ? {
                ...msg,
                content: aiResponse,
                state: MessageState.Completed,
              }
            : msg
        )
      )

      // 首轮对话后自动生成标题
      if (session.title === '新对话') {
        generateSessionTitle(session.id, userContent)
      }
    } catch (error) {
      console.error('发送消息失败:', error)

      // 更新错误状态
      setChatStatus('error')
      setMessages((prev) => {
        const lastMessage = prev.at(-1)
        if (lastMessage && lastMessage.role === MessageRole.Assistant) {
          return prev.map((msg) =>
            msg.id === lastMessage.id
              ? {
                  ...msg,
                  content:
                    '抱歉，处理您的请求时出现错误。请检查 API Key 配置或稍后重试。',
                  state: MessageState.Failed,
                }
              : msg
          )
        }
        return prev
      })
    } finally {
      setIsLoading(false)
    }
  }

  const generateSessionTitle = async (
    sessionId: number,
    firstMessage: string
  ) => {
    try {
      const agent = agentRef.current
      if (!agent) {
        // 如果没有 Agent，使用简单截断作为降级方案
        const newTitle = firstMessage.slice(0, 20)
        await chat.updateSessionTitle(sessionId, newTitle)
        setSessions((prev) =>
          prev.map((s) => (s.id === sessionId ? { ...s, title: newTitle } : s))
        )
        if (currentSession?.id === sessionId) {
          setCurrentSession((prev) =>
            prev ? { ...prev, title: newTitle } : null
          )
        }
        return
      }

      // 使用 AI 生成简洁的会话标题
      if (!apiKey) {
        throw new Error('API Key 未配置')
      }
      const provider = createZAiProvider(apiKey)
      const model = provider(modelName)

      const result = streamText({
        messages: [
          {
            content: `请根据以下对话内容生成一个简洁的会话标题（不超过 10 个字）：\n${firstMessage}`,
            role: 'user',
          },
        ],
        model,
      })

      let newTitle = ''
      for await (const chunk of result.textStream) {
        newTitle += chunk
      }

      newTitle = newTitle.trim().slice(0, 20)
      await chat.updateSessionTitle(sessionId, newTitle)
      setSessions((prev) =>
        prev.map((s) => (s.id === sessionId ? { ...s, title: newTitle } : s))
      )
      if (currentSession?.id === sessionId) {
        setCurrentSession((prev) =>
          prev ? { ...prev, title: newTitle } : null
        )
      }
    } catch (error) {
      console.error('生成会话标题失败，使用降级方案:', error)
      // 降级方案：简单截断
      try {
        const newTitle = firstMessage.slice(0, 20)
        await chat.updateSessionTitle(sessionId, newTitle)
        setSessions((prev) =>
          prev.map((s) => (s.id === sessionId ? { ...s, title: newTitle } : s))
        )
        if (currentSession?.id === sessionId) {
          setCurrentSession((prev) =>
            prev ? { ...prev, title: newTitle } : null
          )
        }
      } catch (updateError) {
        console.error('更新会话标题失败:', updateError)
      }
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
              <ConversationEmptyState
                icon={<MessageSquare className="size-12" />}
                title="开始新的对话"
                description="询问关于您的财务数据的问题，获取专业的财务建议"
              />
            </div>
          ) : (
            <Conversation>
              <ConversationContent>
                {messages.map((message) => (
                  <Message from={message.role} key={message.id}>
                    <MessageContent>
                      <MessageResponse>{message.content}</MessageResponse>
                    </MessageContent>
                  </Message>
                ))}
              </ConversationContent>
              <ConversationScrollButton />
            </Conversation>
          )}
        </ScrollArea>
      </div>

      {/* 输入区域 */}
      <div className="border-t p-4">
        <PromptInput
          accept="image/*,.pdf,.txt,.md,.csv,.json"
          maxFiles={5}
          maxFileSize={10_485_760} // 10MB
          multiple
          onSubmit={sendMessage}
        >
          <PromptInputHeader>
            <PromptInputAttachmentsDisplay />
          </PromptInputHeader>
          <PromptInputBody>
            <PromptInputTextarea
              onChange={(e) => setInput(e.target.value)}
              value={input}
            />
          </PromptInputBody>
          <PromptInputFooter>
            <PromptInputTools>
              <PromptInputActionMenu>
                <PromptInputActionMenuTrigger />
                <PromptInputActionMenuContent>
                  <PromptInputActionAddAttachments label="上传文件" />
                </PromptInputActionMenuContent>
              </PromptInputActionMenu>
              <PromptInputButton tooltip={{ content: '附件', shortcut: '⌘U' }}>
                <Paperclip className="size-4" />
              </PromptInputButton>
            </PromptInputTools>
            <PromptInputSubmit status={chatStatus} />
          </PromptInputFooter>
        </PromptInput>
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
                <X className="h-4 w-4" />
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
                    'group flex cursor-pointer items-center justify-between rounded-lg border p-3 hover:bg-accent',
                    currentSession?.id === session.id && 'bg-accent'
                  )}
                  onClick={() => selectSession(session)}
                >
                  <div className="flex-1">
                    {editingSessionId === session.id ? (
                      <div className="flex items-center gap-2">
                        <Input
                          value={editingTitle}
                          onChange={(e) => setEditingTitle(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault()
                              saveSessionTitle(session.id)
                            } else if (e.key === 'Escape') {
                              cancelRenameSession()
                            }
                          }}
                          className="h-8 w-40"
                          autoFocus
                        />
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6"
                          onClick={(e) => {
                            e.stopPropagation()
                            saveSessionTitle(session.id)
                          }}
                        >
                          <Check className="h-3 w-3" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6"
                          onClick={(e) => {
                            e.stopPropagation()
                            cancelRenameSession()
                          }}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <p className="font-medium">{session.title}</p>
                    )}
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
                          startRenameSession(session)
                        }}
                      >
                        <Edit2 className="mr-2 h-4 w-4" />
                        重命名
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteSession(session.id)
                        }}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
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
