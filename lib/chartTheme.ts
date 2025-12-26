// lib/chartTheme.ts
// Client-side helper for theme-aware chart colors
'use client';

import { useTheme } from 'next-themes';

export interface ChartThemeColors {
  stroke: string;
  grid: string;
  axis: string;
  text: string;
  tooltipBg: string;
  tooltipBorder: string;
  tooltipText: string;
}

/**
 * Get theme-aware colors for charts by reading CSS variables
 * Call this on the client side after mount
 */
export function getChartTheme(isDark: boolean): ChartThemeColors {
  if (typeof window === 'undefined') {
    // SSR fallback
    return {
      stroke: isDark ? '#7dd3fc' : '#3b82f6',
      grid: isDark ? '#374151' : '#e5e7eb',
      axis: isDark ? '#9ca3af' : '#6b7280',
      text: isDark ? '#d1d5db' : '#374151',
      tooltipBg: isDark ? '#1f2937' : '#ffffff',
      tooltipBorder: isDark ? '#374151' : '#e5e7eb',
      tooltipText: isDark ? '#f3f4f6' : '#111827',
    };
  }

  const root = document.documentElement;
  const computedStyle = getComputedStyle(root);

  // Get CSS variable values
  const getVar = (varName: string, fallback: string) => {
    const value = computedStyle.getPropertyValue(varName).trim();
    return value || fallback;
  };

  // Derive colors from theme variables
  const background = getVar('--background', isDark ? '222.2 84% 4.9%' : '0 0% 100%');
  const foreground = getVar('--foreground', isDark ? '210 40% 98%' : '222.2 84% 4.9%');
  const muted = getVar('--muted', isDark ? '217.2 32.6% 17.5%' : '210 40% 96.1%');
  const mutedForeground = getVar('--muted-foreground', isDark ? '215 20.2% 65.1%' : '215.4 16.3% 46.9%');
  const border = getVar('--border', isDark ? '217.2 32.6% 17.5%' : '214.3 31.8% 91.4%');

  // Create muted accent color for strokes (fintech blue)
  // Use the primary accent color from fintech palette
  const strokeColor = isDark 
    ? 'hsl(217 91% 65%)' // Slightly lighter for dark mode
    : 'hsl(217 91% 60%)'; // Muted blue #4f8ef7

  return {
    stroke: strokeColor,
    grid: `hsl(${border})`,
    axis: `hsl(${mutedForeground})`,
    text: `hsl(${foreground})`,
    tooltipBg: `hsl(${background})`,
    tooltipBorder: `hsl(${border})`,
    tooltipText: `hsl(${foreground})`,
  };
}

/**
 * Get a soft color palette for pie charts
 * Returns muted, theme-aware colors
 */
export function getPieChartColors(isDark: boolean): string[] {
  if (isDark) {
    // Soft, muted pastels for dark mode
    return [
      'hsl(217 91% 65%)', // Muted blue
      'hsl(270 91% 75%)', // Soft purple
      'hsl(173 80% 50%)', // Soft teal
      'hsl(200 70% 65%)', // Light sky blue
    ];
  } else {
    // Soft, muted pastels for light mode (fintech palette)
    return [
      'hsl(217 91% 70%)', // Soft blue (primary accent)
      'hsl(270 91% 80%)', // Soft purple (secondary accent)
      'hsl(173 80% 60%)', // Soft teal
      'hsl(200 70% 75%)', // Light sky blue
    ];
  }
}

/**
 * React hook for theme-aware chart colors
 * Returns barColor, gridColor, and axisColor based on current theme
 */
export function useChartTheme(color?: string) {
  const { theme } = useTheme();
  // Default colors if not provided
  const defaultLight = { bar: '#4f8ef7', grid: '#e5e7eb', axis: '#6b7280' };
  const defaultDark = { bar: '#60a5fa', grid: '#374151', axis: '#d1d5db' };
  const palette = theme === 'dark' ? defaultDark : defaultLight;

  return {
    barColor: color || palette.bar,
    gridColor: palette.grid,
    axisColor: palette.axis,
  };
}

