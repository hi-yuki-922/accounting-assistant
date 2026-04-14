/**
 * 节列表管理 Hook
 * 管理指定会话下的 Section 列表和摘要，提供节展开/折叠状态管理
 */

import { useCallback, useEffect, useState } from 'react'

import { getSectionSummaries } from '@/ai/storage/session-store'
import type { SectionSummary } from '@/ai/storage/types'

/** 默认展开最近 N 节 */
const DEFAULT_EXPAND_COUNT = 3

/**
 * Section 展开状态条目
 */
export type SectionEntry = {
  sectionFile: string
  collapsed: boolean
  /** 预渲染的用户消息（乐观更新） */
  initialMessage?: string
}

/**
 * useSectionList 状态和操作接口
 */
export type UseSectionListState = {
  /** 节列表（含折叠状态） */
  sections: SectionEntry[]
  /** 节摘要映射 */
  summaries: SectionSummary[]
  /** 当前活跃节文件名 */
  activeSectionFile: string | null

  /** 新增节（可附带初始消息用于乐观渲染） */
  addSection: (sectionFile: string, initialMessage?: string) => void
  /** 切换活跃节 */
  setActive: (sectionFile: string) => void
  /** 切换折叠状态 */
  toggleCollapse: (sectionFile: string) => void
  /** 刷新摘要列表 */
  refreshSummaries: () => Promise<void>
}

/**
 * 节列表管理 Hook
 * @param sessionId - 会话 ID，变化时重新加载
 */
export const useSectionList = (
  sessionId: number | null
): UseSectionListState => {
  const [sections, setSections] = useState<SectionEntry[]>([])
  const [summaries, setSummaries] = useState<SectionSummary[]>([])
  const [activeSectionFile, setActiveSectionFile] = useState<string | null>(
    null
  )

  // 加载会话的节列表和摘要
  const loadSections = useCallback(async () => {
    if (!sessionId) {
      setSections([])
      setSummaries([])
      setActiveSectionFile(null)
      return
    }

    const loadedSummaries = await getSectionSummaries(sessionId)

    // 同一 sectionFile 可能存在多条摘要记录，去重保留最新
    const dedupMap = new Map<string, (typeof loadedSummaries)[number]>()
    for (const s of loadedSummaries) {
      dedupMap.set(s.sectionFile, s)
    }
    const uniqueSummaries = [...dedupMap.values()]
    setSummaries(uniqueSummaries)

    // 按节文件名排序（section_001, section_002, ...）
    const sorted = [...uniqueSummaries].toSorted((a, b) =>
      a.sectionFile.localeCompare(b.sectionFile, undefined, {
        numeric: true,
      })
    )

    // 最近 N 节默认展开，其余折叠
    const entries: SectionEntry[] = sorted.map((s, idx) => ({
      sectionFile: s.sectionFile,
      collapsed: idx < sorted.length - DEFAULT_EXPAND_COUNT,
    }))
    setSections(entries)

    // 活跃节设为最后一节（如有的话）
    if (sorted.length > 0) {
      setActiveSectionFile(sorted.at(-1)?.sectionFile ?? null)
    } else {
      setActiveSectionFile(null)
    }
  }, [sessionId])

  useEffect(() => {
    loadSections()
  }, [loadSections])

  const addSection = useCallback(
    (sectionFile: string, initialMessage?: string) => {
      setSections((prev) => [
        ...prev,
        { sectionFile, collapsed: false, initialMessage },
      ])
      setActiveSectionFile(sectionFile)
    },
    []
  )

  const setActive = useCallback((sectionFile: string) => {
    setActiveSectionFile(sectionFile)
  }, [])

  const toggleCollapse = useCallback((sectionFile: string) => {
    setSections((prev) =>
      prev.map((s) =>
        s.sectionFile === sectionFile ? { ...s, collapsed: !s.collapsed } : s
      )
    )
  }, [])

  const refreshSummaries = useCallback(async () => {
    if (!sessionId) {
      return
    }
    const loadedSummaries = await getSectionSummaries(sessionId)
    setSummaries(loadedSummaries)
  }, [sessionId])

  return {
    sections,
    summaries,
    activeSectionFile,
    addSection,
    setActive,
    toggleCollapse,
    refreshSummaries,
  }
}
