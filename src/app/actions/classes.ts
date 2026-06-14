"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  createClassRecord,
  deleteClassRecord,
  updateClassRecord,
} from "@/lib/repositories/classes";
import { deleteEntitySchema, classFormSchema } from "@/lib/validations";
import type { ActionState } from "@/types/domain";

function revalidateClassPaths() {
  revalidatePath("/");
  revalidatePath("/classes");
  revalidatePath("/distribution");
}

export async function saveClassAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const rawValues = {
    id: formData.get("id") || undefined,
    name: formData.get("name"),
    courseCode: formData.get("courseCode") || undefined,
    semesterLabel: formData.get("semesterLabel"),
    participantCount: formData.get("participantCount"),
    status: formData.get("status"),
  };

  const parsed = classFormSchema.safeParse(rawValues);

  if (!parsed.success) {
    return {
      status: "error",
      message: "Data kelas belum valid. Cek lagi form Anda.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const payload = {
      name: parsed.data.name,
      course_code: parsed.data.courseCode?.trim() || null,
      semester_label: parsed.data.semesterLabel,
      participant_count: parsed.data.participantCount,
      status: parsed.data.status,
    } as const;

    if (parsed.data.id) {
      await updateClassRecord(parsed.data.id, payload);
      revalidateClassPaths();
      return {
        status: "success",
        message: "Kelas berhasil diperbarui.",
      };
    }

    const id = await createClassRecord(payload);
    void id;
    revalidateClassPaths();

    return {
      status: "success",
      message: "Kelas baru berhasil ditambahkan.",
    };
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Gagal menyimpan kelas.",
    };
  }
}

export async function deleteClassAction(formData: FormData) {
  const parsed = deleteEntitySchema.safeParse({
    id: formData.get("id"),
  });

  if (!parsed.success) {
    redirect("/classes?error=id-kelas");
  }

  await deleteClassRecord(parsed.data.id);
  revalidateClassPaths();
  redirect("/classes");
}
