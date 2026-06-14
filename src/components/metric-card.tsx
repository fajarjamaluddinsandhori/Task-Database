import { Card, CardContent } from "@/components/ui/card";
import type { DashboardMetric } from "@/types/domain";

interface MetricCardProps {
  metric: DashboardMetric;
}

export function MetricCard({ metric }: MetricCardProps) {
  return (
    <Card>
      <CardContent className="space-y-3">
        <div className="h-1.5 w-12 rounded-full bg-sky-500/80" />
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
          {metric.label}
        </p>
        <p className="text-3xl font-semibold tracking-tight text-slate-900">
          {metric.value}
        </p>
        <p className="text-sm leading-6 text-slate-600">{metric.helperText}</p>
      </CardContent>
    </Card>
  );
}
