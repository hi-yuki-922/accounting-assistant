import * as React from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from 'recharts'

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { formatCurrency } from '@/lib/formatters'
import { cn } from '@/lib/utils'
import type { ChartDataPoint } from '@/types/dashboard'

type RevenueChartProps = {
  data: ChartDataPoint[]
  className?: string
}

export const RevenueChart = ({ data, className }: RevenueChartProps) => {
  const formatCurrencyValue = (value: number) => formatCurrency(value, '', 0)
  const formatTooltipValue = (value: number, name: string) =>
    [formatCurrency(value), name] as const

  const chartConfig = {
    expense: {
      color: 'hsl(var(--chart-2))',
      label: '支出',
    },
    income: {
      color: 'hsl(var(--chart-1))',
      label: '收入',
    },
  }

  return (
    <Card className={cn('', className)}>
      <CardHeader>
        <CardTitle>收支趋势</CardTitle>
        <CardDescription>最近6个月的收入和支出情况</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={chartConfig}
          className="h-[250px] w-full sm:h-[300px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ bottom: 5, left: 20, right: 30, top: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="month"
                className="text-[10px] sm:text-xs text-muted-foreground"
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                className="text-[10px] sm:text-xs text-muted-foreground"
                axisLine={false}
                tickLine={false}
                tickFormatter={formatCurrencyValue}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Legend
                verticalAlign="top"
                height={36}
                className="text-[10px] sm:text-xs"
              />
              <Line
                type="monotone"
                dataKey="income"
                stroke="hsl(var(--chart-1))"
                strokeWidth={2}
                dot={
                  {
                    fill: 'hsl(var(--chart-1))',
                    r: 3,
                    sm: { r: 4 },
                    strokeWidth: 2,
                  } as Record<string, unknown>
                }
                activeDot={{ r: 5 }}
              />
              <Line
                type="monotone"
                dataKey="expense"
                stroke="hsl(var(--chart-2))"
                strokeWidth={2}
                dot={
                  {
                    fill: 'hsl(var(--chart-2))',
                    r: 3,
                    sm: { r: 4 },
                    strokeWidth: 2,
                  } as Record<string, unknown>
                }
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
