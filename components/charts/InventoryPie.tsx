// components/charts/InventoryPie.tsx
'use client';

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { getChartTheme, getPieChartColors } from '@/lib/chartTheme';

const data = [
  { name: 'In Stock', value: 45 },
  { name: 'Out', value: 25 },
  { name: 'Withheld', value: 10 },
  { name: 'Available', value: 20 },
];

export default function InventoryPie() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [colors, setColors] = useState<ReturnType<typeof getChartTheme> | null>(null);
  const [pieColors, setPieColors] = useState<string[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      const isDark = theme === 'dark';
      setColors(getChartTheme(isDark));
      setPieColors(getPieChartColors(isDark));
    }
  }, [mounted, theme]);

  if (!mounted || !colors || pieColors.length === 0) {
    return <div className="h-[300px] w-full" />;
  }

  return (
    <ResponsiveContainer width="100%" height={320}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={3}
          dataKey="value"
          label={false}
          labelLine={false}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
          ))}
        </Pie>
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
          formatter={(value: number | undefined, name: string | undefined) => [value ?? 0, name ?? '']}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

