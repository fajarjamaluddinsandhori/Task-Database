import { Card, CardContent } from "@/components/ui/card";
import type { SetupStatus } from "@/types/domain";

interface SetupBannerProps {
  setup: SetupStatus & {
    steps?: string[];
  };
}

export function SetupBanner({ setup }: SetupBannerProps) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="space-y-4 bg-gradient-to-r from-slate-950 via-slate-900 to-sky-900 text-white">
        <div>
          <p className="text-sm font-medium text-sky-200">Status penyimpanan</p>
          <h3 className="text-lg font-semibold text-white">
            {setup.mode === "supabase" ? "Supabase aktif" : "Mode lokal aktif"}
          </h3>
        </div>

        <p className="text-sm leading-6 text-slate-200">{setup.message}</p>

        {setup.mode === "local" && setup.missingKeys.length > 0 ? (
          <div className="rounded-2xl border border-amber-300/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
            Env yang masih kosong: {setup.missingKeys.join(", ")}
          </div>
        ) : null}

        {setup.steps?.length ? (
          <ol className="space-y-2 text-sm leading-6 text-slate-200">
            {setup.steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        ) : null}
      </CardContent>
    </Card>
  );
}
