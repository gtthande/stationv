// components/charts/InventoryLine.tsx
'use client';

import {
  LineChart,
  Line,
  Area,
  AreaChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { getChartTheme } from '@/lib/chartTheme';

const data = [
  { name: 'Jan', value: 20 },
  { name: 'Feb', value: 35 },
  { name: 'Mar', value: 25 },
  { name: 'Apr', value: 40 },
  { name: 'May', value: 30 },
  { name: 'Jun', value: 50 },
];

export default function InventoryLine() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [colors, setColors] = useState<ReturnType<typeof getChartTheme> | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      const isDark = theme === 'dark';
      setColors(getChartTheme(isDark));
    }
  }, [mounted, theme]);

  if (!mounted || !colors) {
    return <div className="h-[300px] w-full" />;
  }

  return (
    <ResponsiveContainer width="100%" height={320}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={colors.stroke} stopOpacity={0.3} />
            <stop offset="95%" stopColor={colors.stroke} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid 
          strokeDasharray="3 3" 
          stroke={colors.grid} 
          strokeOpacity={0.15}
          vertical={false}
        />
        <XAxis 
          dataKey="name" 
          stroke={colors.axis}
          tick={{ fill: colors.axis, fontSize: 11, opacity: 0.7 }}
          axisLine={false}
        />
        <YAxis 
          stroke={colors.axis}
          tick={{ fill: colors.axis, fontSize: 11, opacity: 0.7 }}
          axisLine={false}
        />
        <Tooltip 
          contentStyle={{
            backgroundColor: colors.tooltipBg,
            border: `1px solid ${colors.tooltipBorder}`,
            borderRadius: '12px',
            padding: '10px 14px',
            color: colors.tooltipText,
            fontSize: '12px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          }}
        />
        <Area
          type="monotone"
          dataKey="value"
          stroke={colors.stroke}
          strokeWidth={1.2}
          fill="url(#colorValue)"
          dot={false}
          activeDot={{ r: 4, fill: colors.stroke, strokeWidth: 2 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

