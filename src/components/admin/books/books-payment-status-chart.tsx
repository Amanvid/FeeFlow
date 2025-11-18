"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

interface BooksPaymentStatusChartProps {
  fullyPaid: number;
  partiallyPaid: number;
  owing: number;
  noBooksRequired: number;
}

const COLORS = {
  fullyPaid: '#10b981', // green
  partiallyPaid: '#f59e0b', // yellow
  owing: '#ef4444', // red
  noBooksRequired: '#6b7280', // gray
};

export default function BooksPaymentStatusChart({
  fullyPaid,
  partiallyPaid,
  owing,
  noBooksRequired,
}: BooksPaymentStatusChartProps) {
  const data = [
    { name: 'Fully Paid', value: fullyPaid, color: COLORS.fullyPaid },
    { name: 'Partially Paid', value: partiallyPaid, color: COLORS.partiallyPaid },
    { name: 'Owing', value: owing, color: COLORS.owing },
    { name: 'No Books Required', value: noBooksRequired, color: COLORS.noBooksRequired },
  ].filter(item => item.value > 0); // Only show categories with data

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium">{data.name}</p>
          <p className="text-sm text-gray-600">
            {data.value} students ({((data.value / (fullyPaid + partiallyPaid + owing + noBooksRequired)) * 100).toFixed(1)}%)
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