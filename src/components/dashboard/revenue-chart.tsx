import * as React from "react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend } from "recharts"
import { ChartDataPoint } from "@/types/dashboard"
import { formatCurrency } from "@/lib/formatters"

interface RevenueChartProps {
  data: ChartDataPoint[]
  className?: string
}

export function RevenueChart({ data, className }: RevenueChartProps) {
  const chartConfig = {
    income: {
      label: "收入",
      color: "hsl(var(--chart-1))",
    },
    expense: {
      label: "支出",
      color: "hsl(var(--chart-2))",
    },
  }

  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <CardTitle>收支趋势</CardTitle>
        <CardDescription>最近6个月的收入和支出情况</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[250px] w-full sm:h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
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
                tickFormatter={(value) => formatCurrency(value, "", 0)}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value: number, name: string) => [
                      formatCurrency(value),
                      name,
                    ]}
                  />
                }
              />
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
                dot={{ fill: "hsl(var(--chart-1))", strokeWidth: 2, r: 3, sm: { r: 4 } } as any}
                activeDot={{ r: 5 }}
              />
              <Line
                type="monotone"
                dataKey="expense"
                stroke="hsl(var(--chart-2))"
                strokeWidth={2}
                dot={{ fill: "hsl(var(--chart-2))", strokeWidth: 2, r: 3, sm: { r: 4 } } as any}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
