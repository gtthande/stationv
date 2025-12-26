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

export interface ModulePieProps {
  data: { name: string; value: number }[];
  colors?: string[];
}

export default function ModulePie({ data, colors }: ModulePieProps) {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [chartColors, setChartColors] = useState<ReturnType<typeof getChartTheme> | null>(null);
  const [pieColors, setPieColors] = useState<string[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      const isDark = theme === 'dark';
      setChartColors(getChartTheme(isDark));
      // Use provided colors or fallback to theme-aware palette
      if (colors && colors.length > 0) {
        setPieColors(colors);
      } else {
        setPieColors(getPieChartColors(isDark));
      }
    }
  }, [mounted, theme, colors]);

  // Default pastel palette as fallback
  const defaultColorsLight = ['#93c5fd', '#a5b4fc', '#f0abfc', '#fcd34d', '#fecaca'];
  const defaultColorsDark = ['#60a5fa', '#818cf8', '#e879f9', '#fde047', '#fca5a5'];
  const palette = pieColors.length > 0 ? pieColors : (theme === 'dark' ? defaultColorsDark : defaultColorsLight);

  if (!mounted || !chartColors) {
    return <div className="h-[120px] w-full" />;
  }

  return (
    <ResponsiveContainer width="100%" height={120}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          innerRadius={40}
          outerRadius={60}
          paddingAngle={2}
          label={false}
          labelLine={false}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={palette[index % palette.length]} />
          ))}
        </Pie>
        <Tooltip 
          contentStyle={{
            backgroundColor: chartColors.tooltipBg,
            border: `1px solid ${chartColors.tooltipBorder}`,
            borderRadius: '12px',
            padding: '10px 14px',
            color: chartColors.tooltipText,
            fontSize: '12px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          }}
          formatter={(value: number | undefined, name: string | undefined) => [value ?? 0, name ?? '']}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

