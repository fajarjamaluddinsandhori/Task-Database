import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";

interface PageHeaderProps {
  eyebrow: string;
  title: string;
  description: string;
  actionLabel?: string;
  actionIcon?: ReactNode;
  action?: ReactNode;
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actionLabel,
  actionIcon,
  action,
}: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-5 rounded-[28px] border border-slate-200/80 bg-white/95 p-6 shadow-sm shadow-slate-200/70 backdrop-blur md:flex-row md:items-center md:justify-between">
      <div className="space-y-3">
        <span className="inline-flex w-fit items-center rounded-full border border-sky-100 bg-sky-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-sky-700">
          {eyebrow}
        </span>
        <div className="space-y-2">
          <h2 className="text-3xl font-semibold tracking-tight text-slate-900">
            {title}
          </h2>
          <p className="max-w-2xl text-sm leading-6 text-slate-600">{description}</p>
        </div>
      </div>

      {action ? (
        action
      ) : actionLabel ? (
        <Button className="gap-2 self-start md:self-auto" type="button">
          {actionIcon}
          <span>{actionLabel}</span>
        </Button>
      ) : null}
    </div>
  );
}
