'use client';

import { useRouter } from 'next/navigation';
import ModuleBar from '@/components/charts/ModuleBar';
import ModuleLine from '@/components/charts/ModuleLine';
import ModulePie from '@/components/charts/ModulePie';

interface Metric {
  label: string;
  value: number;
}

interface SummaryCardProps {
  title: string;
  description: string;
  data: { name: string; value: number }[];
  chartType?: 'bar' | 'line' | 'pie';
  href: string;
  metrics?: Metric[];
}

export default function SummaryCard({
  title,
  description,
  data,
  chartType = 'bar',
  href,
  metrics,
}: SummaryCardProps) {
  const router = useRouter();
  
  let ChartComponent: any = ModuleBar;
  if (chartType === 'line') ChartComponent = ModuleLine;
  if (chartType === 'pie') ChartComponent = ModulePie;

  return (
    <div
      onClick={() => router.push(href)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          router.push(href);
        }
      }}
      className="cursor-pointer rounded-2xl border border-border/40 bg-card p-5 shadow-sm transition-colors hover:bg-muted space-y-3"
    >
      <div>
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <ChartComponent data={data} />
      {metrics && (
        <div className="flex justify-between text-xs text-muted-foreground pt-2 border-t border-border/20">
          {metrics.map((m) => (
            <div key={m.label} className="flex flex-col items-center">
              <span className="font-medium">{m.value}</span>
              <span>{m.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

