"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, Cell } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface BooksPurchaseChartProps {
  booksPurchasedByClass: Record<string, number>
  totalBooksPurchased: number
  showComparison?: boolean
  showPurchasedOnly?: boolean
  title?: string
  description?: string
  newStudentsByClass?: Record<string, number>
  oldStudentsByClass?: Record<string, number>
  fullyPaidByClass?: Record<string, number>
  partiallyPaidByClass?: Record<string, number>
}

const classOrder = [
  'Creche', 'Nursery 1', 'Nursery 2', 'KG 1', 'KG 2', 
  'BS 1', 'BS 2', 'BS 3', 'BS 4', 'BS 5', 'BS 6'
]

const colors = {
  purchased: "#3b82f6",
  total: "#10b981",
  comparison: ["#3b82f6", "#10b981"]
}

export default function BooksPurchaseChart({
  booksPurchasedByClass,
  totalBooksPurchased,
  showComparison = false,
  showPurchasedOnly = false,
  title = "Books Purchase by Class",
  description = "Number of books purchased by class",
  newStudentsByClass,
  oldStudentsByClass,
  fullyPaidByClass,
  partiallyPaidByClass
}: BooksPurchaseChartProps) {
  
  // Prepare data for chart
  const chartData = classOrder.map(className => ({
    class: className,
    purchased: booksPurchasedByClass[className] || 0,
    total: totalBooksPurchased,
    fullyPaid: fullyPaidByClass?.[className] || 0,
    partiallyPaid: partiallyPaidByClass?.[className] || 0
  }))

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border bg-background p-2 shadow-sm">
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col">
              <span className="text-[0.70rem] uppercase text-muted-foreground">
                Class
              </span>
              <span className="font-bold text-muted-foreground">
                {label}
              </span>
            </div>
            {payload.map((entry: any, index: number) => (
              <div key={index} className="flex flex-col">
                <span className="text-[0.70rem] uppercase text-muted-foreground">
                  {entry.dataKey === 'fullyPaid' ? 'Fully Paid Books' : 
                   entry.dataKey === 'partiallyPaid' ? 'Partially Paid Books' : 'Total Books'}
                </span>
                <span className="font-bold" style={{ color: entry.color }}>
                  {entry.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      )
    }
    return null
  }

  if (showPurchasedOnly) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={chartData}>
              <XAxis 
                dataKey="class" 
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 12 }}
                allowDecimals={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                formatter={(value, entry, index) => {
                  const totalFullyPaid = chartData.reduce((sum, item) => sum + item.fullyPaid, 0)
                  const totalPartiallyPaid = chartData.reduce((sum, item) => sum + item.partiallyPaid, 0)
                  
                  if (value === 'Fully Paid Books') {
                    return `${value} (${totalFullyPaid})`
                  } else if (value === 'Partially Paid Books') {
                    return `${value} (${totalPartiallyPaid})`
                  }
                  return value
                }}
              />
              <Bar 
                dataKey="fullyPaid" 
                fill="#3b82f6" 
                name="Fully Paid Books" 
                radius={[2, 2, 0, 0]}
              />
              <Bar 
                dataKey="partiallyPaid" 
                fill="#f59e0b" 
                name="Partially Paid Books" 
                radius={[2, 2, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={chartData}>
            <XAxis 
              dataKey="class" 
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis 
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12 }}
              allowDecimals={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              formatter={(value, entry, index) => {
                const totalFullyPaid = chartData.reduce((sum, item) => sum + item.fullyPaid, 0)
                const totalPartiallyPaid = chartData.reduce((sum, item) => sum + item.partiallyPaid, 0)
                
                if (value === 'Fully Paid Books') {
                  return `${value} (${totalFullyPaid})`
                } else if (value === 'Partially Paid Books') {
                  return `${value} (${totalPartiallyPaid})`
                }
                return value
              }}
            />
            <Bar 
              dataKey="fullyPaid" 
              fill="#3b82f6" 
              name="Fully Paid Books" 
              radius={[2, 2, 0, 0]}
            />
            <Bar 
              dataKey="partiallyPaid" 
              fill="#f59e0b" 
              name="Partially Paid Books" 
              radius={[2, 2, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}