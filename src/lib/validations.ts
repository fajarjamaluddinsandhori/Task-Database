import { z } from "zod";

import { classStatusList, materialTypeList } from "@/types/domain";

export const classFormSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(3, "Nama kelas minimal 3 karakter."),
  courseCode: z.string().trim().max(30, "Kode mata kuliah maksimal 30 karakter.").optional(),
  semesterLabel: z.string().min(3, "Label semester minimal 3 karakter."),
  participantCount: z.coerce.number().int().min(0, "Jumlah peserta tidak boleh negatif."),
  status: z.enum(classStatusList),
});

export const materialMetadataSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(3, "Judul materi minimal 3 karakter."),
  description: z
    .string()
    .trim()
    .max(500, "Deskripsi maksimal 500 karakter.")
    .optional()
    .transform((value) => value || ""),
  materialType: z.enum(materialTypeList),
});

export const distributionFormSchema = z.object({
  materialId: z.string().uuid("Materi wajib dipilih."),
  classIds: z.array(z.string().uuid()).min(1, "Pilih minimal satu kelas."),
});

export const deleteEntitySchema = z.object({
  id: z.string().uuid("ID data tidak valid."),
});

export const setupEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.url("NEXT_PUBLIC_SUPABASE_URL harus berupa URL valid."),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(
    1,
    "SUPABASE_SERVICE_ROLE_KEY wajib diisi.",
  ),
});

export type ClassFormInput = z.infer<typeof classFormSchema>;
export type MaterialMetadataInput = z.infer<typeof materialMetadataSchema>;
export type DistributionFormInput = z.infer<typeof distributionFormSchema>;
