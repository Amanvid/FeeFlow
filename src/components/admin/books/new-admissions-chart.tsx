"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface NewAdmissionsChartProps {
  data: Array<{
    name: string;
    admissions: number;
  }>;
}

export default function NewAdmissionsChart({ data }: NewAdmissionsChartProps) {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium">{label}</p>
          <p className="text-sm text-gray-600">
            {payload[0].value} new admissions
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis 
            dataKey="name" 
            tick={{ fontSize: 12, fill: "#64748b" }}
            angle={-45}
            textAnchor="end"
            height={80}
            interval={0}
          />
          <YAxis tick={{ fontSize: 12, fill: "#64748b" }} />
          <Tooltip content={<CustomTooltip />} />
          <Bar 
            dataKey="admissions" 
            fill="#8b5cf6" // purple
            radius={[4, 4, 0, 0]}
            stroke="#7c3aed"
            strokeWidth={1}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}