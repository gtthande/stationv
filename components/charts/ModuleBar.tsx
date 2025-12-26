'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useChartTheme } from '@/lib/chartTheme';

export interface ModuleBarProps {
  data: { name: string; value: number }[];
  color?: string;
}

export default function ModuleBar({ data, color }: ModuleBarProps) {
  const { barColor, gridColor, axisColor } = useChartTheme(color);
  return (
    <ResponsiveContainer width="100%" height={120}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
        <XAxis dataKey="name" stroke={axisColor} />
        <YAxis stroke={axisColor} />
        <Tooltip />
        <Bar dataKey="value" fill={barColor} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

