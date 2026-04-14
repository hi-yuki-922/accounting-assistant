/**
 * Chatbot 页面组件
 * 协调 hooks 之间的数据流，管理布局和消息路由
 */

import { useCallback, useEffect, useRef, useState } from 'react'

import { route } from '@/ai/router'
import { AppLayout } from '@/components/layouts/app-layout'
import { BottomNav } from '@/components/layouts/bottom-nav'
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useSectionList } from '@/hooks/use-section-list'
import { useSessionList } from '@/hooks/use-session-list'
import {
  getConfirmationMode,
  setConfirmationMode,
} from '@/lib/confirmation-mode'
import type { ConfirmationMode } from '@/lib/confirmation-mode'
import { MenuBar } from '@/pages/chatbot/components/menu-bar'
import { PromptInput } from '@/pages/chatbot/components/prompt-input'
import { SectionCard } from '@/pages/chatbot/components/section-card'
import { SectionIndexDialog } from '@/pages/chatbot/components/section-index-dialog'
import { SessionListSheet } from '@/pages/chatbot/components/session-list-sheet'
import type { PromptSubmitPayload, SectionCardHandle } from '@/types/chatbot'

export const ChatbotPage = () => {
  // 会话管理
  const {
    sessions,
    activeSessionId,
    loadTodayLastSession,
    isLoading: isSessionLoading,
    createSession: createNewSession,
    renameSession,
    switchSession,
    generateSummary,
  } = useSessionList()

  // 节列表管理
  const {
    sections,
    summaries,
    activeSectionFile,
    addSection,
    setActive,
    toggleCollapse,
    refreshSummaries,
  } = useSectionList(activeSessionId)

  // 引用状态
  const [referenceSectionFile, setReferenceSectionFile] = useState<
    string | null
  >(null)

  // Section 卡片 ref 映射
  const sectionRefs = useRef<Map<string, SectionCardHandle>>(new Map())

  // 当前活跃会话
  const activeSession = sessions.find((s) => s.id === activeSessionId)

  // 是否有节正在流式
  const [streamingSection, setStreamingSection] = useState<string | null>(null)

  // 会话列表 Sheet 状态
  const [sessionSheetOpen, setSessionSheetOpen] = useState(false)

  // 确认模式
  const [confirmationMode, setConfirmMode] = useState<ConfirmationMode>(
    getConfirmationMode()
  )
  const handleToggleConfirmation = useCallback(() => {
    const next = confirmationMode === 'on' ? 'off' : 'on'
    setConfirmationMode(next)
    setConfirmMode(next)
  }, [confirmationMode])

  // 首次进入自动加载
  const initializedRef = useRef(false)
  useEffect(() => {
    if (!initializedRef.current) {
      initializedRef.current = true
      loadTodayLastSession()
    }
  }, [loadTodayLastSession])

  // 获取节摘要文本
  const getSummaryText = useCallback(
    (sectionFile: string) =>
      summaries.find((s) => s.sectionFile === sectionFile)?.summary,
    [summaries]
  )

  // 消息路由：处理 PromptInput 提交
  const handleSubmit = useCallback(
    async (payload: PromptSubmitPayload) => {
      if (!activeSessionId) {
        return
      }

      let targetSectionFile: string

      if (payload.referenceSectionFile) {
        // 引用续接模式
        targetSectionFile = payload.referenceSectionFile
        // 确保目标节展开
        const section = sections.find(
          (s) => s.sectionFile === targetSectionFile
        )
        if (section?.collapsed) {
          toggleCollapse(targetSectionFile)
        }
      } else {
        // 新建节模式
        const routeResult = await route(activeSessionId)
        targetSectionFile = routeResult.sectionFile
        addSection(targetSectionFile, payload.content)
      }

      setActive(targetSectionFile)
      setStreamingSection(targetSectionFile)

      // 等待 ref 就绪后发送消息
      // 使用 requestAnimationFrame 确保 SectionCard 已渲染
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const handle = sectionRefs.current.get(targetSectionFile)
          handle?.send(payload.content)
        })
      })

      // 清除引用状态
      setReferenceSectionFile(null)
    },
    [activeSessionId, sections, toggleCollapse, addSection, setActive]
  )

  // 停止流式
  const handleStop = useCallback(() => {
    if (streamingSection) {
      sectionRefs.current.get(streamingSection)?.stop()
    }
  }, [streamingSection])

  // 引用节
  const handleQuote = useCallback((sectionFile: string) => {
    setReferenceSectionFile(sectionFile)
  }, [])

  // 跳转到节（展开并滚动）
  const handleJump = useCallback(
    (sectionFile: string) => {
      const section = sections.find((s) => s.sectionFile === sectionFile)
      if (section?.collapsed) {
        toggleCollapse(sectionFile)
      }
      setActive(sectionFile)
      // 滚动到目标节
      requestAnimationFrame(() => {
        const el = document.querySelector(`#section-${sectionFile}`)
        el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      })
    },
    [sections, toggleCollapse, setActive]
  )

  // 流式完成回调
  const handleStreamComplete = useCallback(
    (sectionFile: string) => () => {
      setStreamingSection((prev) => (prev === sectionFile ? null : prev))
      refreshSummaries()
    },
    [refreshSummaries]
  )

  // 是否有节正在流式
  const isStreaming = streamingSection !== null

  return (
    <AppLayout>
      <div className="-m-2 flex h-[calc(100dvh-3.5rem)] flex-col overflow-hidden pb-14 sm:-m-4 sm:h-[calc(100dvh-4rem)] md:-m-6 md:h-[calc(100dvh-4rem)] md:pb-0">
        <ResizablePanelGroup orientation="horizontal">
          {/* 左侧：任务看板占位 */}
          <ResizablePanel defaultSize={60} minSize={30}>
            <div className="flex h-full items-center justify-center text-muted-foreground">
              <p className="text-sm">任务看板（后续实现）</p>
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* 右侧：Section 对话区域 */}
          <ResizablePanel defaultSize={40} minSize={20}>
            <div className="flex h-full flex-col overflow-hidden">
              {/* 菜单栏 */}
              <MenuBar
                title={activeSession?.title}
                onCreateSession={() => createNewSession()}
                onRenameSession={(newTitle) => {
                  if (activeSessionId) {
                    renameSession(activeSessionId, newTitle)
                  }
                }}
                onOpenSessionList={() => setSessionSheetOpen(true)}
              />

              {/* Section 列表 */}
              <ScrollArea className="min-h-0 min-w-0 flex-1">
                <div className="space-y-2 p-4">
                  {sections.length === 0 && !isSessionLoading && (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <p className="text-sm text-muted-foreground">
                        你可以问我关于订单、记账、客户等问题
                      </p>
                    </div>
                  )}

                  {sections.map((section, idx) => (
                    <div
                      key={section.sectionFile}
                      id={`section-${section.sectionFile}`}
                    >
                      <SectionCard
                        ref={(el) => {
                          if (el) {
                            sectionRefs.current.set(section.sectionFile, el)
                          } else {
                            sectionRefs.current.delete(section.sectionFile)
                          }
                        }}
                        sessionId={activeSessionId as number}
                        sectionFile={section.sectionFile}
                        index={idx + 1}
                        summary={summaries.find(
                          (s) => s.sectionFile === section.sectionFile
                        )}
                        collapsed={section.collapsed}
                        isActive={activeSectionFile === section.sectionFile}
                        onToggleCollapse={toggleCollapse}
                        onQuote={handleQuote}
                        onStreamComplete={handleStreamComplete(
                          section.sectionFile
                        )}
                        confirmationMode={confirmationMode}
                        initialMessage={section.initialMessage}
                      />
                    </div>
                  ))}
                </div>
              </ScrollArea>

              {/* 底部输入框 */}
              <PromptInput
                isStreaming={isStreaming}
                referenceSectionFile={referenceSectionFile}
                referenceSummary={
                  referenceSectionFile
                    ? getSummaryText(referenceSectionFile)
                    : undefined
                }
                onSubmit={handleSubmit}
                onStop={handleStop}
                onCancelReference={() => setReferenceSectionFile(null)}
                sectionIndexSlot={
                  <SectionIndexDialog
                    summaries={summaries}
                    onJump={handleJump}
                    onQuote={handleQuote}
                  />
                }
                confirmationMode={confirmationMode}
                onToggleConfirmation={handleToggleConfirmation}
              />
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
      <BottomNav />

      {/* 会话列表 Sheet 抽屉 */}
      <SessionListSheet
        open={sessionSheetOpen}
        onOpenChange={setSessionSheetOpen}
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSwitchSession={switchSession}
        onRenameSession={renameSession}
        onGenerateSummary={generateSummary}
      />
    </AppLayout>
  )
}
