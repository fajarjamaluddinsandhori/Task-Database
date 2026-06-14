import { isSupabaseConfigured } from "@/lib/env";
import {
  createLocalId,
  mutateLocalDatabase,
  readLocalDatabase,
  removeLocalMaterialFile,
  saveLocalMaterialFile,
} from "@/lib/local-store";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { slugifyFileName } from "@/lib/utils";
import type { Database } from "@/types/database";
import { materialStorageBucket, type Material } from "@/types/domain";

function mapMaterialRow(row: Database["public"]["Tables"]["materials"]["Row"]): Material {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    materialType: row.material_type,
    uploadedAt: row.uploaded_at,
    originalFileName: row.original_file_name,
    sizeBytes: row.size_bytes,
    mimeType: row.mime_type,
    storagePath: row.storage_path,
    publicUrl: row.public_url,
  };
}

export async function listMaterialEntities() {
  if (!isSupabaseConfigured()) {
    const database = await readLocalDatabase();
    return database.materials
      .slice()
      .sort((a, b) => b.uploaded_at.localeCompare(a.uploaded_at))
      .map(mapMaterialRow);
  }

  const supabase = createSupabaseServerClient();

  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("materials")
    .select("*")
    .order("uploaded_at", { ascending: false });

  if (error) {
    throw new Error(`Gagal mengambil data materi: ${error.message}`);
  }

  return (data ?? []).map(mapMaterialRow);
}

export async function getMaterialEntityById(id: string) {
  if (!isSupabaseConfigured()) {
    const database = await readLocalDatabase();
    const row = database.materials.find((item) => item.id === id);
    return row ? mapMaterialRow(row) : null;
  }

  const supabase = createSupabaseServerClient();

  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from("materials")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(`Gagal mengambil detail materi: ${error.message}`);
  }

  return data ? mapMaterialRow(data) : null;
}

export async function createMaterialRecord(
  payload: Database["public"]["Tables"]["materials"]["Insert"],
) {
  if (!isSupabaseConfigured()) {
    const id = createLocalId();
    const row: Database["public"]["Tables"]["materials"]["Row"] = {
      id,
      title: payload.title,
      description: payload.description ?? null,
      original_file_name: payload.original_file_name,
      storage_path: payload.storage_path,
      public_url: payload.public_url,
      mime_type: payload.mime_type,
      size_bytes: payload.size_bytes,
      material_type: payload.material_type ?? "pdf",
      uploaded_at: payload.uploaded_at ?? new Date().toISOString(),
    };

    await mutateLocalDatabase((database) => {
      database.materials.unshift(row);
      return id;
    });

    return id;
  }

  const supabase = createSupabaseServerClient();

  if (!supabase) {
    throw new Error("Supabase belum dikonfigurasi.");
  }

  const { data, error } = await supabase.from("materials").insert(payload).select("id").single();

  if (error) {
    throw new Error(`Gagal menambah materi: ${error.message}`);
  }

  return data.id;
}

export async function updateMaterialRecord(
  id: string,
  payload: Database["public"]["Tables"]["materials"]["Update"],
) {
  if (!isSupabaseConfigured()) {
    await mutateLocalDatabase((database) => {
      const index = database.materials.findIndex((item) => item.id === id);

      if (index === -1) {
        throw new Error("Materi tidak ditemukan.");
      }

      database.materials[index] = {
        ...database.materials[index],
        ...payload,
      };
    });

    return;
  }

  const supabase = createSupabaseServerClient();

  if (!supabase) {
    throw new Error("Supabase belum dikonfigurasi.");
  }

  const { error } = await supabase.from("materials").update(payload).eq("id", id);

  if (error) {
    throw new Error(`Gagal memperbarui materi: ${error.message}`);
  }
}

export async function deleteMaterialRecord(id: string) {
  if (!isSupabaseConfigured()) {
    await mutateLocalDatabase((database) => {
      database.materials = database.materials.filter((item) => item.id !== id);
      database.materialDistributions = database.materialDistributions.filter(
        (item) => item.material_id !== id,
      );
    });

    return;
  }

  const supabase = createSupabaseServerClient();

  if (!supabase) {
    throw new Error("Supabase belum dikonfigurasi.");
  }

  const { error } = await supabase.from("materials").delete().eq("id", id);

  if (error) {
    throw new Error(`Gagal menghapus materi: ${error.message}`);
  }
}

export async function uploadMaterialFile(file: File, materialId: string, currentPath?: string | null) {
  if (!isSupabaseConfigured()) {
    return saveLocalMaterialFile(file, materialId, currentPath);
  }

  const supabase = createSupabaseServerClient();

  if (!supabase) {
    throw new Error("Supabase belum dikonfigurasi.");
  }

  if (currentPath) {
    await supabase.storage.from(materialStorageBucket).remove([currentPath]);
  }

  const sanitizedFileName = slugifyFileName(file.name);
  const storagePath = `${materialId}/${Date.now()}-${sanitizedFileName}`;

  const { error } = await supabase.storage.from(materialStorageBucket).upload(storagePath, file, {
    upsert: true,
    contentType: file.type || undefined,
  });

  if (error) {
    throw new Error(`Gagal mengunggah file: ${error.message}`);
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(materialStorageBucket).getPublicUrl(storagePath);

  return {
    storagePath,
    publicUrl,
    originalFileName: file.name,
    sizeBytes: file.size,
    mimeType: file.type || "application/octet-stream",
  };
}

export async function removeMaterialFile(storagePath: string | null) {
  if (!storagePath) {
    return;
  }

  if (!isSupabaseConfigured()) {
    await removeLocalMaterialFile(storagePath);
    return;
  }

  const supabase = createSupabaseServerClient();

  if (!supabase) {
    throw new Error("Supabase belum dikonfigurasi.");
  }

  const { error } = await supabase.storage.from(materialStorageBucket).remove([storagePath]);

  if (error) {
    throw new Error(`Gagal menghapus file dari bucket: ${error.message}`);
  }
}
