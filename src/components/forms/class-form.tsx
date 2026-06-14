"use client";

import { useActionState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

import { saveClassAction } from "@/app/actions/classes";
import { initialActionState } from "@/app/actions/state";
import { FormFeedback } from "@/components/form-feedback";
import { SubmitButton } from "@/components/submit-button";
import { classStatusList, type Classroom } from "@/types/domain";

interface ClassFormProps {
  defaultValue?: Classroom;
  submitLabel: string;
}

export function ClassForm({ defaultValue, submitLabel }: ClassFormProps) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction] = useActionState(saveClassAction, initialActionState);

  useEffect(() => {
    if (state.status !== "success") {
      return;
    }

    router.refresh();

    if (!defaultValue) {
      formRef.current?.reset();
    }
  }, [defaultValue, router, state.status]);

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      <input name="id" type="hidden" value={defaultValue?.id ?? ""} />

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700" htmlFor="name">
            Nama kelas
          </label>
          <input
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm"
            defaultValue={defaultValue?.name}
            id="name"
            name="name"
            placeholder="Algoritma A"
          />
          {state.fieldErrors?.name ? (
            <p className="text-sm text-rose-600">{state.fieldErrors.name[0]}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700" htmlFor="courseCode">
            Kode mata kuliah
          </label>
          <input
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm"
            defaultValue={defaultValue?.courseCode ?? ""}
            id="courseCode"
            name="courseCode"
            placeholder="IF201"
          />
          {state.fieldErrors?.courseCode ? (
            <p className="text-sm text-rose-600">{state.fieldErrors.courseCode[0]}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700" htmlFor="semesterLabel">
            Semester
          </label>
          <input
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm"
            defaultValue={defaultValue?.semesterLabel}
            id="semesterLabel"
            name="semesterLabel"
            placeholder="Semester 4"
          />
          {state.fieldErrors?.semesterLabel ? (
            <p className="text-sm text-rose-600">{state.fieldErrors.semesterLabel[0]}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700" htmlFor="participantCount">
            Jumlah peserta
          </label>
          <input
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm"
            defaultValue={defaultValue?.participantCount ?? 20}
            id="participantCount"
            min={0}
            name="participantCount"
            type="number"
          />
          {state.fieldErrors?.participantCount ? (
            <p className="text-sm text-rose-600">{state.fieldErrors.participantCount[0]}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700" htmlFor="status">
            Status
          </label>
          <select
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm"
            defaultValue={defaultValue?.status ?? "active"}
            id="status"
            name="status"
          >
            {classStatusList.map((status) => (
              <option key={status} value={status}>
                {status === "active" ? "Aktif" : "Arsip"}
              </option>
            ))}
          </select>
        </div>
      </div>

      <FormFeedback state={state} />
      <SubmitButton label={submitLabel} pendingLabel="Menyimpan kelas..." />
    </form>
  );
}
