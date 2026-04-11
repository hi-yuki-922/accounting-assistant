/**
 * Section 索引 Dialog 组件
 * 以对话框形式展示当前会话所有节的列表，支持跳转和引用操作
 */

import { List, Locate, Quote } from 'lucide-react'
import { useCallback, useState } from 'react'

import type { SectionSummary } from '@/ai/storage/types'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'

export type SectionIndexDialogProps = {
  /** 节摘要列表 */
  summaries: SectionSummary[]
  /** 跳转到指定节 */
  onJump: (sectionFile: string) => void
  /** 引用指定节 */
  onQuote: (sectionFile: string) => void
  className?: string
}

export const SectionIndexDialog = ({
  summaries,
  onJump,
  onQuote,
  className,
}: SectionIndexDialogProps) => {
  const [open, setOpen] = useState(false)

  // 按文件名排序
  const sorted = [...summaries].toSorted((a, b) =>
    a.sectionFile.localeCompare(b.sectionFile, undefined, { numeric: true })
  )

  const handleJump = useCallback(
    (sectionFile: string) => {
      setOpen(false)
      onJump(sectionFile)
    },
    [onJump]
  )

  const handleQuote = useCallback(
    (sectionFile: string) => {
      setOpen(false)
      onQuote(sectionFile)
    },
    [onQuote]
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn('h-9 w-9 shrink-0 rounded-xl', className)}
          title="节索引"
        >
          <List className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent
        className="max-w-md"
        onCloseAutoFocus={(e) => {
          // Dialog 关闭时默认恢复焦点到触发按钮，
          // 若刚执行了引用操作，由 PromptInput 的 useEffect 负责聚焦 textarea
          e.preventDefault()
        }}
      >
        <DialogHeader>
          <DialogTitle>对话节索引 ({summaries.length})</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh]">
          <div className="space-y-1 pr-2">
            {sorted.length === 0 && (
              <div className="py-8 text-center text-sm text-muted-foreground">
                暂无对话节
              </div>
            )}
            {sorted.map((s, idx) => (
              <div
                key={s.sectionFile}
                className="flex items-start gap-2 rounded-lg border p-3"
              >
                <span className="mt-0.5 shrink-0 text-xs font-medium text-muted-foreground">
                  #{idx + 1}
                </span>
                <span className="min-w-0 flex-1 text-sm leading-relaxed">
                  {s.summary}
                </span>
                <div className="flex shrink-0 items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => handleJump(s.sectionFile)}
                    title="跳转到此节"
                  >
                    <Locate className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => handleQuote(s.sectionFile)}
                    title="引用此节"
                  >
                    <Quote className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
