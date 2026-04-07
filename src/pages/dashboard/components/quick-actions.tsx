import * as React from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { QuickAction } from '@/types/dashboard'

type QuickActionsProps = {
  actions: QuickAction[]
  className?: string
}

export const QuickActions = ({ actions, className }: QuickActionsProps) => (
  <Card className={cn('', className)}>
    <CardHeader>
      <CardTitle>快速操作</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="grid gap-3 sm:gap-4 md:grid-cols-3">
        {actions.map((action) => (
          <Button
            key={action.id}
            variant={action.primary ? 'default' : 'outline'}
            className={cn(
              'h-auto flex-col items-start gap-2 p-3 sm:p-4 text-left',
              action.primary && 'bg-primary hover:bg-primary/90'
            )}
            onClick={action.handleClick}
          >
            <div className="flex w-full items-center justify-between">
              {action.icon && <action.icon className="h-4 w-4 sm:h-5 sm:w-5" />}
              <div className="h-2 w-2 rounded-full bg-current" />
            </div>
            <div className="flex flex-col items-start gap-1">
              <span className="font-semibold text-sm sm:text-base">
                {action.title}
              </span>
              <span className="text-xs sm:text-sm opacity-80">
                {action.description}
              </span>
            </div>
          </Button>
        ))}
      </div>
    </CardContent>
  </Card>
)
