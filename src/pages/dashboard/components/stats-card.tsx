import * as React from 'react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency, formatPercentage } from '@/lib/formatters'
import { cn } from '@/lib/utils'
import type { StatsCardData } from '@/types/dashboard'

type StatsCardProps = {
  data: StatsCardData
  className?: string
}

export const StatsCard = ({ data, className }: StatsCardProps) => {
  const getTrendBadgeVariant = () => {
    if (!data.trend) {
      return 'default'
    }
    return data.trend.isPositive ? 'default' : 'destructive'
  }

  return (
    <Card className={cn('transition-all hover:shadow-md', className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
          {data.title}
        </CardTitle>
        <div
          className={cn(
            'rounded-full p-1.5 sm:p-2',
            data.iconColor || 'text-primary'
          )}
        >
          {data.icon && <data.icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
        </div>
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col gap-2">
          <div className="text-xl sm:text-2xl font-bold">
            {formatCurrency(Number.parseFloat(data.value.replaceAll(',', '')))}
          </div>
          {data.trend && (
            <div className="flex items-center gap-2">
              <Badge
                variant={getTrendBadgeVariant() as 'default' | 'destructive'}
                className="text-[10px] sm:text-xs"
              >
                {formatPercentage(data.trend.value)}
              </Badge>
              <span className="text-[10px] sm:text-xs text-muted-foreground">
                较上月
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
