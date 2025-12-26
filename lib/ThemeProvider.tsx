'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';
import type { ThemeProviderProps } from 'next-themes/dist/types';

// Wrapper to allow using next-themes in server components
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      {...props}
      defaultTheme="light"
      enableSystem={false}
      attribute="class"
    >
      {children}
    </NextThemesProvider>
  );
}

