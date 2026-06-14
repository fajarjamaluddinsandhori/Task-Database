"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  upsertDistributions,
  deleteDistributionRecord,
} from "@/lib/repositories/distributions";
import { deleteEntitySchema, distributionFormSchema } from "@/lib/validations";
import type { ActionState } from "@/types/domain";

function revalidateDistributionPaths() {
  revalidatePath("/");
  revalidatePath("/classes");
  revalidatePath("/materials");
  revalidatePath("/distribution");
}

export async function createDistributionAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = distributionFormSchema.safeParse({
    materialId: formData.get("materialId"),
    classIds: formData.getAll("classIds"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Form distribusi belum valid.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const payload = parsed.data.classIds.map((classId) => {
      return {
        class_id: classId,
        material_id: parsed.data.materialId,
        distributed_at: new Date().toISOString(),
      };
    });

    await upsertDistributions(payload);
    revalidateDistributionPaths();

    return {
      status: "success",
      message: "Distribusi untuk kelas terpilih berhasil disimpan.",
    };
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Gagal menyimpan distribusi.",
    };
  }
}

export async function deleteDistributionAction(formData: FormData) {
  const parsed = deleteEntitySchema.safeParse({
    id: formData.get("id"),
  });

  if (!parsed.success) {
    redirect("/distribution?error=id-distribusi");
  }

  await deleteDistributionRecord(parsed.data.id);
  revalidateDistributionPaths();
  redirect("/distribution");
}
