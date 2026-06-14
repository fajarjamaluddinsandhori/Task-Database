import type { ActionState } from "@/types/domain";

interface FormFeedbackProps {
  state: ActionState;
}

export function FormFeedback({ state }: FormFeedbackProps) {
  if (state.status === "idle" || !state.message) {
    return null;
  }

  const toneClassName =
    state.status === "success"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : state.status === "setup"
        ? "border-amber-200 bg-amber-50 text-amber-700"
        : "border-rose-200 bg-rose-50 text-rose-700";

  return (
    <div className={`rounded-2xl border px-4 py-3 text-sm ${toneClassName}`}>
      {state.message}
    </div>
  );
}
