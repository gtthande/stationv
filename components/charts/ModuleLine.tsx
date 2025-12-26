'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useChartTheme } from '@/lib/chartTheme';

export interface ModuleLineProps {
  data: { name: string; value: number }[];
  color?: string;
}

export default function ModuleLine({ data, color }: ModuleLineProps) {
  const { barColor, gridColor, axisColor } = useChartTheme(color);
  return (
    <ResponsiveContainer width="100%" height={120}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
        <XAxis dataKey="name" stroke={axisColor} />
        <YAxis stroke={axisColor} />
        <Tooltip />
        <Line 
          type="monotone" 
          dataKey="value" 
          stroke={barColor} 
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

