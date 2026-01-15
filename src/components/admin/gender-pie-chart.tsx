"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

interface GenderPieChartProps {
  maleCount: number;
  femaleCount: number;
}

const GENDER_COLORS = {
  male: "#3b82f6",
  female: "#ec4899",
};

export default function GenderPieChart({
  maleCount,
  femaleCount,
}: GenderPieChartProps) {
  const data = [
    { name: "Male Students", value: maleCount, color: GENDER_COLORS.male },
    { name: "Female Students", value: femaleCount, color: GENDER_COLORS.female },
  ].filter(item => item.value > 0);

  const total = maleCount + femaleCount || 1;

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium">{item.name}</p>
          <p className="text-sm text-gray-600">
            {item.value} students ({((item.value / total) * 100).toFixed(1)}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={2}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value, entry: any) => (
              <span style={{ color: entry.color }}>{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

