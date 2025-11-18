"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, Cell } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface ClassEnrollmentChartProps {
  classEnrollment: Record<string, number>
  newAdmissionsByClass: Record<string, number>
  showComparison?: boolean
  showNewOnly?: boolean
  totalStudents: number
}

const classOrder = [
  'Creche', 'Nursery 1', 'Nursery 2', 'KG 1', 'KG 2', 
  'BS 1', 'BS 2', 'BS 3', 'BS 4', 'BS 5'
]

const colors = {
  total: "#3b82f6",
  new: "#10b981",
  comparison: ["#3b82f6", "#10b981"]
}

export default function ClassEnrollmentChart({
  classEnrollment,
  newAdmissionsByClass,
  totalStudents,
  showComparison = false,
  showNewOnly = false
}: ClassEnrollmentChartProps) {
  
  // Prepare data for chart
  const chartData = classOrder.map(className => ({
    class: className,
    total: classEnrollment[className] || 0,
    new: newAdmissionsByClass[className] || 0
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
                  {entry.dataKey === 'total' ? 'Total Students' : 'New Admissions'}
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

  if (showNewOnly) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>New Admissions by Class</CardTitle>
          <CardDescription>New students admitted this academic term</CardDescription>
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
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="new" fill={colors.new} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    )
  }

  if (showComparison) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Class Enrollment vs New Admissions Comparison</CardTitle>
          <CardDescription>Comparison of total enrollment and new admissions by class</CardDescription>
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
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                formatter={(value, entry, index) => {
                  const totalEnrollment = chartData.reduce((sum, item) => sum + item.total, 0)
                  const newAdmissions = chartData.reduce((sum, item) => sum + item.new, 0)
                  
                  if (value === 'Total Enrollment') {
                    return `${value} (${totalEnrollment})`
                  } else if (value === 'New Admissions') {
                    return `${value} (${newAdmissions})`
                  }
                  return value
                }}
              />
              <Bar 
                dataKey="total" 
                fill={colors.total} 
                name="Total Enrollment" 
                radius={[2, 2, 0, 0]}
              />
              <Bar 
                dataKey="new" 
                fill={colors.new} 
                name="New Admissions" 
                radius={[2, 2, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    )
  }

  return (
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
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="total" fill={colors.total} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}