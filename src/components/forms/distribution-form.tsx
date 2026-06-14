"use client";

import { useActionState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

import { createDistributionAction } from "@/app/actions/distribution";
import { initialActionState } from "@/app/actions/state";
import { FormFeedback } from "@/components/form-feedback";
import { SubmitButton } from "@/components/submit-button";
import { getMaterialTypeLabel } from "@/lib/utils";
import { type Classroom, type Material } from "@/types/domain";

interface DistributionFormProps {
  classes: Classroom[];
  materials: Material[];
}

export function DistributionForm({ classes, materials }: DistributionFormProps) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction] = useActionState(createDistributionAction, initialActionState);

  useEffect(() => {
    if (state.status !== "success") {
      return;
    }

    router.refresh();
    formRef.current?.reset();
  }, [router, state.status]);

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700" htmlFor="materialId">
          Pilih materi
        </label>
        <select
          className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm"
          id="materialId"
          name="materialId"
        >
          <option value="">Pilih salah satu materi</option>
          {materials.map((material) => (
            <option key={material.id} value={material.id}>
              {material.title} · {getMaterialTypeLabel(material.materialType)}
            </option>
          ))}
        </select>
        {state.fieldErrors?.materialId ? (
          <p className="text-sm text-rose-600">{state.fieldErrors.materialId[0]}</p>
        ) : null}
      </div>

      <div className="space-y-3">
        <div>
          <p className="text-sm font-medium text-slate-700">Pilih kelas target</p>
          <p className="text-xs text-slate-500">
            Satu submit akan membuat distribusi untuk banyak kelas sekaligus.
          </p>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {classes.map((classItem) => (
            <label
              key={classItem.id}
              className="flex items-start gap-3 rounded-2xl border border-slate-200 px-4 py-3 text-sm"
            >
              <input name="classIds" type="checkbox" value={classItem.id} />
              <span>
                <span className="block font-medium text-slate-900">{classItem.name}</span>
                <span className="block text-slate-500">
                  {classItem.courseCode ?? "Tanpa kode"} · {classItem.semesterLabel} ·{" "}
                  {classItem.participantCount} peserta
                </span>
              </span>
            </label>
          ))}
        </div>
        {state.fieldErrors?.classIds ? (
          <p className="text-sm text-rose-600">{state.fieldErrors.classIds[0]}</p>
        ) : null}
      </div>

      <FormFeedback state={state} />
      <SubmitButton
        label="Distribusikan ke kelas terpilih"
        pendingLabel="Menyimpan distribusi..."
      />
    </form>
  );
}
