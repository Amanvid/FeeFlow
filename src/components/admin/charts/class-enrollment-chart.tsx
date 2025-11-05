
"use client";

import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

interface ClassEnrollmentChartProps {
  data: { name: string; students: number }[];
}

export default function ClassEnrollmentChart({ data }: ClassEnrollmentChartProps) {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <XAxis
          dataKey="name"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${value}`}
          allowDecimals={false}
        />
        <Tooltip
          cursor={{ fill: "hsl(var(--muted))" }}
          contentStyle={{ 
            backgroundColor: "hsl(var(--background))",
            borderColor: "hsl(var(--border))"
          }}
        />
        <Bar dataKey="students" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
