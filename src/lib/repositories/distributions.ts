import { createLocalId, mutateLocalDatabase, readLocalDatabase } from "@/lib/local-store";
import { isSupabaseConfigured } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import type { Database } from "@/types/database";
import type { MaterialDistribution } from "@/types/domain";

function mapDistributionRow(
  row: Database["public"]["Tables"]["material_distributions"]["Row"],
): MaterialDistribution {
  return {
    id: row.id,
    classId: row.class_id,
    materialId: row.material_id,
    distributedAt: row.distributed_at,
    className: "",
    courseCode: null,
    semesterLabel: "",
    materialTitle: "",
    originalFileName: "",
  };
}

export async function listDistributionEntities() {
  if (!isSupabaseConfigured()) {
    const database = await readLocalDatabase();
    return database.materialDistributions
      .slice()
      .sort((a, b) => b.distributed_at.localeCompare(a.distributed_at))
      .map(mapDistributionRow);
  }

  const supabase = createSupabaseServerClient();

  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("material_distributions")
    .select("*")
    .order("distributed_at", { ascending: false });

  if (error) {
    throw new Error(`Gagal mengambil data distribusi: ${error.message}`);
  }

  return (data ?? []).map(mapDistributionRow);
}

export async function upsertDistributions(
  payload: Database["public"]["Tables"]["material_distributions"]["Insert"][],
) {
  if (!isSupabaseConfigured()) {
    await mutateLocalDatabase((database) => {
      payload.forEach((item) => {
        const existingIndex = database.materialDistributions.findIndex(
          (distribution) =>
            distribution.material_id === item.material_id &&
            distribution.class_id === item.class_id,
        );

        const row: Database["public"]["Tables"]["material_distributions"]["Row"] = {
          id:
            existingIndex >= 0
              ? database.materialDistributions[existingIndex].id
              : createLocalId(),
          class_id: item.class_id,
          material_id: item.material_id,
          distributed_at: item.distributed_at ?? new Date().toISOString(),
          created_at:
            existingIndex >= 0
              ? database.materialDistributions[existingIndex].created_at
              : new Date().toISOString(),
        };

        if (existingIndex >= 0) {
          database.materialDistributions[existingIndex] = row;
        } else {
          database.materialDistributions.unshift(row);
        }
      });
    });

    return;
  }

  const supabase = createSupabaseServerClient();

  if (!supabase) {
    throw new Error("Supabase belum dikonfigurasi.");
  }

  const { error } = await supabase
    .from("material_distributions")
    .upsert(payload, { onConflict: "material_id,class_id" });

  if (error) {
    throw new Error(`Gagal menyimpan distribusi: ${error.message}`);
  }
}

export async function deleteDistributionRecord(id: string) {
  if (!isSupabaseConfigured()) {
    await mutateLocalDatabase((database) => {
      database.materialDistributions = database.materialDistributions.filter(
        (item) => item.id !== id,
      );
    });

    return;
  }

  const supabase = createSupabaseServerClient();

  if (!supabase) {
    throw new Error("Supabase belum dikonfigurasi.");
  }

  const { error } = await supabase.from("material_distributions").delete().eq("id", id);

  if (error) {
    throw new Error(`Gagal menghapus distribusi: ${error.message}`);
  }
}
