"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  createMaterialRecord,
  deleteMaterialRecord,
  getMaterialEntityById,
  removeMaterialFile,
  updateMaterialRecord,
  uploadMaterialFile,
} from "@/lib/repositories/materials";
import { deleteEntitySchema, materialMetadataSchema } from "@/lib/validations";
import type { ActionState } from "@/types/domain";

function revalidateMaterialPaths(id?: string) {
  revalidatePath("/");
  revalidatePath("/materials");
  revalidatePath("/distribution");

  if (id) {
    revalidatePath(`/materials/${id}`);
  }
}

function getUploadedFile(formData: FormData) {
  const fileValue = formData.get("file");

  if (!(fileValue instanceof File) || fileValue.size === 0) {
    return null;
  }

  return fileValue;
}

function validateMaterialFile(params: { file: File | null; hasExistingStoragePath: boolean }) {
  if (!params.file && !params.hasExistingStoragePath) {
    return "File materi wajib diunggah untuk materi baru.";
  }

  return null;
}

export async function saveMaterialAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = materialMetadataSchema.safeParse({
    id: formData.get("id") || undefined,
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    materialType: formData.get("materialType"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Data materi belum valid. Cek lagi form Anda.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const file = getUploadedFile(formData);
  const fileValidationMessage = validateMaterialFile({
    file,
    hasExistingStoragePath: Boolean(formData.get("existingStoragePath")),
  });

  if (fileValidationMessage) {
    return {
      status: "error",
      message: fileValidationMessage,
    };
  }

  try {
    let materialId = parsed.data.id;
    const existingStoragePath = (formData.get("existingStoragePath") as string) || null;
    const existingPublicUrl = (formData.get("existingPublicUrl") as string) || null;
    const existingFileName = (formData.get("existingFileName") as string) || null;
    const existingMimeType = (formData.get("existingMimeType") as string) || null;
    const existingSizeBytesRaw = formData.get("existingSizeBytes");
    const existingSizeBytes =
      typeof existingSizeBytesRaw === "string" && existingSizeBytesRaw.length > 0
        ? Number(existingSizeBytesRaw)
        : null;

    const basePayload = {
      title: parsed.data.title,
      description: parsed.data.description || null,
      material_type: parsed.data.materialType,
      storage_path: existingStoragePath ?? "",
      public_url: existingPublicUrl ?? "",
      original_file_name: existingFileName ?? "",
      mime_type: existingMimeType ?? "application/octet-stream",
      size_bytes: existingSizeBytes ?? 0,
    };

    if (materialId) {
      await updateMaterialRecord(materialId, basePayload);
    } else {
      materialId = await createMaterialRecord({
        ...basePayload,
        uploaded_at: new Date().toISOString(),
      });
    }

    if (!materialId) {
      throw new Error("ID materi gagal dibuat.");
    }

    if (file) {
      const uploadResult = await uploadMaterialFile(
        file,
        materialId,
        existingStoragePath,
      );

      await updateMaterialRecord(materialId, {
        storage_path: uploadResult.storagePath,
        public_url: uploadResult.publicUrl,
        original_file_name: uploadResult.originalFileName,
        size_bytes: uploadResult.sizeBytes,
        mime_type: uploadResult.mimeType,
      });
    }

    revalidateMaterialPaths(materialId);

    return {
      status: "success",
      message: materialId === parsed.data.id ? "Materi berhasil diperbarui." : "Materi baru berhasil diunggah.",
    };
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Gagal menyimpan materi.",
    };
  }
}

export async function deleteMaterialAction(formData: FormData) {
  const parsed = deleteEntitySchema.safeParse({
    id: formData.get("id"),
  });

  if (!parsed.success) {
    redirect("/materials?error=id-materi");
  }

  const existingMaterial = await getMaterialEntityById(parsed.data.id);

  if (existingMaterial?.storagePath) {
    await removeMaterialFile(existingMaterial.storagePath);
  }

  await deleteMaterialRecord(parsed.data.id);
  revalidateMaterialPaths(parsed.data.id);
  redirect("/materials");
}
