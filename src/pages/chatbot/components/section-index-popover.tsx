/**
 * Section 索引 Popover 组件
 * 展示当前会话所有节的列表，支持跳转和引用操作
 */

import { List, Quote } from 'lucide-react'

import type { SectionSummary } from '@/ai/storage/types'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'

export type SectionIndexPopoverProps = {
  /** 节摘要列表 */
  summaries: SectionSummary[]
  /** 跳转到指定节 */
  onJump: (sectionFile: string) => void
  /** 引用指定节 */
  onQuote: (sectionFile: string) => void
  className?: string
}

export const SectionIndexPopover = ({
  summaries,
  onJump,
  onQuote,
  className,
}: SectionIndexPopoverProps) => {
  // 按文件名排序
  const sorted = [...summaries].toSorted((a, b) =>
    a.sectionFile.localeCompare(b.sectionFile, undefined, { numeric: true })
  )

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn('h-9 w-9 shrink-0 rounded-xl', className)}
          title="节索引"
        >
          <List className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-72 p-0">
        <div className="px-3 py-2 text-xs font-medium text-muted-foreground">
          对话节索引 ({summaries.length})
        </div>
        <ScrollArea className="max-h-[300px]">
          <div className="space-y-0.5 px-1 pb-1">
            {sorted.length === 0 && (
              <div className="px-3 py-4 text-center text-sm text-muted-foreground">
                暂无对话节
              </div>
            )}
            {sorted.map((s, idx) => (
              <div
                key={s.sectionFile}
                className="flex items-center gap-2 rounded-md px-3 py-2 hover:bg-accent"
              >
                <button
                  className="flex min-w-0 flex-1 items-center gap-2 text-left text-sm"
                  onClick={() => onJump(s.sectionFile)}
                >
                  <span className="shrink-0 text-xs font-medium text-muted-foreground">
                    #{idx + 1}
                  </span>
                  <span className="truncate">{s.summary}</span>
                </button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 shrink-0"
                  onClick={() => onQuote(s.sectionFile)}
                  title="引用此节"
                >
                  <Quote className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}
