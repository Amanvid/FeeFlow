"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, UserPlus } from "lucide-react"

interface CombinedChartProps {
  enrollmentChartData: Array<{ name: string; students: number }>
  newAdmissionsChartData: Array<{ name: string; admissions: number }>
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-300 rounded-lg shadow-lg">
        <p className="font-semibold text-gray-800">{`Class: ${label}`}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {`${entry.dataKey === 'enrollment' ? 'Total Enrollment' : 'New Admissions'}: ${entry.value} students`}
          </p>
        ))}
      </div>
    )
  }
  return null
}

const CustomLegend = ({ payload, totalStudents, totalAdmissions }: any) => {
  return (
    <div className="flex justify-center items-center gap-8 pt-4">
      {payload?.map((entry: any, index: number) => {
        const isEnrollment = entry.dataKey === 'enrollment'
        const total = isEnrollment ? totalStudents : totalAdmissions
        
        return (
          <div key={index} className="flex items-center gap-2">
            <div 
              className="w-4 h-4 rounded"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm font-medium text-gray-700">
              {entry.value} ({total})
            </span>
          </div>
        )
      })}
    </div>
  )
}

export default function CombinedEnrollmentAdmissionsChart({ enrollmentChartData, newAdmissionsChartData }: CombinedChartProps) {
  // Color palettes matching the original charts
  const enrollmentColors = [
    "#3b82f6", // blue
    "#06b6d4", // cyan
    "#10b981", // emerald
    "#84cc16", // lime
    "#f59e0b", // amber
    "#ef4444", // red
    "#8b5cf6", // violet
    "#ec4899", // pink
    "#6366f1", // indigo
    "#14b8a6", // teal
    "#f97316", // orange
    "#06b6d4", // cyan
  ];

  const admissionColors = [
    "#8b5cf6", // violet
    "#a855f7", // purple
    "#c084fc", // fuchsia
    "#d946ef", // pink
    "#ec4899", // rose
    "#f43f5e", // red
    "#f97316", // orange
    "#fbbf24", // amber
    "#84cc16", // lime
    "#22c55e", // green
    "#10b981", // emerald
    "#06b6d4", // cyan
  ];

  // Calculate totals
  const totalStudents = enrollmentChartData.reduce((sum, item) => sum + item.students, 0);
  const totalAdmissions = newAdmissionsChartData.reduce((sum, item) => sum + item.admissions, 0);

  // Combine the data with color assignments
  const combinedData = enrollmentChartData.map((enrollmentItem, index) => {
    const admissionItem = newAdmissionsChartData.find(admission => admission.name === enrollmentItem.name)
    return {
      class: enrollmentItem.name,
      enrollment: enrollmentItem.students,
      admissions: admissionItem?.admissions || 0,
      enrollmentColor: enrollmentColors[index % enrollmentColors.length],
      admissionColor: admissionColors[index % admissionColors.length]
    }
  })

  return (
    <div className="space-y-6">
      {/* Chart */}
      <div className="w-full h-[500px] bg-white p-6 rounded-lg shadow-lg">
        <h3 className="text-xl font-bold text-gray-800 mb-6 text-center">
          Class Enrollment vs New Admissions Comparison
        </h3>
      <ResponsiveContainer width="100%" height="90%">
        <BarChart
          data={combinedData}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 60,
          }}
          barCategoryGap="20%"
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
          <XAxis 
            dataKey="class" 
            tick={{ fontSize: 12, fill: '#374151' }}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis 
            tick={{ fontSize: 12, fill: '#374151' }}
            label={{ value: 'Number of Students', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            wrapperStyle={{ paddingTop: '20px' }}
            iconType="rect"
            content={<CustomLegend totalStudents={totalStudents} totalAdmissions={totalAdmissions} />}
          />
          
          {/* Enrollment bars with individual colors */}
          <Bar 
            dataKey="enrollment" 
            name="Total Enrollment"
            strokeWidth={1}
            radius={[2, 2, 0, 0]}
          >
            {combinedData.map((entry, index) => (
              <Cell key={`enrollment-${index}`} fill={entry.enrollmentColor} />
            ))}
          </Bar>
          
          {/* Admissions bars with individual colors */}
          <Bar 
            dataKey="admissions" 
            name="New Admissions"
            strokeWidth={1}
            radius={[2, 2, 0, 0]}
          >
            {combinedData.map((entry, index) => (
              <Cell key={`admissions-${index}`} fill={entry.admissionColor} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  </div>
  )
}