"use client";

import { useActionState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

import { saveMaterialAction } from "@/app/actions/materials";
import { initialActionState } from "@/app/actions/state";
import { FormFeedback } from "@/components/form-feedback";
import { SubmitButton } from "@/components/submit-button";
import { getMaterialTypeLabel } from "@/lib/utils";
import { materialTypeList, type Material } from "@/types/domain";

interface MaterialFormProps {
  defaultValue?: Material;
  submitLabel: string;
}

export function MaterialForm({ defaultValue, submitLabel }: MaterialFormProps) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction] = useActionState(saveMaterialAction, initialActionState);

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
      <input
        name="existingStoragePath"
        type="hidden"
        value={defaultValue?.storagePath ?? ""}
      />
      <input name="existingPublicUrl" type="hidden" value={defaultValue?.publicUrl ?? ""} />
      <input
        name="existingFileName"
        type="hidden"
        value={defaultValue?.originalFileName ?? ""}
      />
      <input name="existingMimeType" type="hidden" value={defaultValue?.mimeType ?? ""} />
      <input
        name="existingSizeBytes"
        type="hidden"
        value={defaultValue?.sizeBytes ?? ""}
      />

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700" htmlFor="title">
          Judul materi
        </label>
        <input
          className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm"
          defaultValue={defaultValue?.title}
          id="title"
          name="title"
          placeholder="Modul React Hooks"
        />
        {state.fieldErrors?.title ? (
          <p className="text-sm text-rose-600">{state.fieldErrors.title[0]}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700" htmlFor="description">
          Deskripsi singkat
        </label>
        <textarea
          className="min-h-28 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm"
          defaultValue={defaultValue?.description ?? ""}
          id="description"
          name="description"
          placeholder="Jelaskan isi materi dan tujuan penggunaannya."
        />
        {state.fieldErrors?.description ? (
          <p className="text-sm text-rose-600">{state.fieldErrors.description[0]}</p>
        ) : null}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700" htmlFor="materialType">
            Tipe materi
          </label>
          <select
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm"
            defaultValue={defaultValue?.materialType ?? "pdf"}
            id="materialType"
            name="materialType"
          >
            {materialTypeList.map((type) => (
              <option key={type} value={type}>
                {getMaterialTypeLabel(type)}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700" htmlFor="file">
            File materi
          </label>
          <input
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm"
            id="file"
            name="file"
            type="file"
          />
          <p className="text-xs text-slate-500">
            Wajib diisi saat membuat materi baru. Saat edit, boleh dikosongkan untuk
            mempertahankan file lama.
          </p>
        </div>
      </div>

      {defaultValue?.originalFileName ? (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
          File saat ini: {defaultValue.originalFileName}
        </div>
      ) : null}

      <FormFeedback state={state} />
      <SubmitButton label={submitLabel} pendingLabel="Menyimpan materi..." />
    </form>
  );
}
