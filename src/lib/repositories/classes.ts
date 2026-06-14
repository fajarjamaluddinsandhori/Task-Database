import { createLocalId, mutateLocalDatabase, readLocalDatabase } from "@/lib/local-store";
import { isSupabaseConfigured } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import type { Database } from "@/types/database";
import type { Classroom } from "@/types/domain";

function mapClassRow(row: Database["public"]["Tables"]["classes"]["Row"]): Classroom {
  return {
    id: row.id,
    name: row.name,
    courseCode: row.course_code,
    semesterLabel: row.semester_label,
    participantCount: row.participant_count,
    status: row.status,
    createdAt: row.created_at,
  };
}

export async function listClassEntities() {
  if (!isSupabaseConfigured()) {
    const database = await readLocalDatabase();
    return database.classes
      .slice()
      .sort((a, b) => a.semester_label.localeCompare(b.semester_label) || a.name.localeCompare(b.name))
      .map(mapClassRow);
  }

  const supabase = createSupabaseServerClient();

  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("classes")
    .select("*")
    .order("semester_label", { ascending: true })
    .order("name", { ascending: true });

  if (error) {
    throw new Error(`Gagal mengambil data kelas: ${error.message}`);
  }

  return (data ?? []).map(mapClassRow);
}

export async function getClassEntityById(id: string) {
  if (!isSupabaseConfigured()) {
    const database = await readLocalDatabase();
    const row = database.classes.find((item) => item.id === id);
    return row ? mapClassRow(row) : null;
  }

  const supabase = createSupabaseServerClient();

  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase.from("classes").select("*").eq("id", id).maybeSingle();

  if (error) {
    throw new Error(`Gagal mengambil detail kelas: ${error.message}`);
  }

  return data ? mapClassRow(data) : null;
}

export async function createClassRecord(
  payload: Database["public"]["Tables"]["classes"]["Insert"],
) {
  if (!isSupabaseConfigured()) {
    const id = createLocalId();
    const row: Database["public"]["Tables"]["classes"]["Row"] = {
      id,
      name: payload.name,
      course_code: payload.course_code ?? null,
      semester_label: payload.semester_label,
      participant_count: payload.participant_count ?? 0,
      status: payload.status ?? "active",
      created_at: payload.created_at ?? new Date().toISOString(),
    };

    await mutateLocalDatabase((database) => {
      database.classes.unshift(row);
      return id;
    });

    return id;
  }

  const supabase = createSupabaseServerClient();

  if (!supabase) {
    throw new Error("Supabase belum dikonfigurasi.");
  }

  const { data, error } = await supabase.from("classes").insert(payload).select("id").single();

  if (error) {
    throw new Error(`Gagal menambah kelas: ${error.message}`);
  }

  return data.id;
}

export async function updateClassRecord(
  id: string,
  payload: Database["public"]["Tables"]["classes"]["Update"],
) {
  if (!isSupabaseConfigured()) {
    await mutateLocalDatabase((database) => {
      const index = database.classes.findIndex((item) => item.id === id);

      if (index === -1) {
        throw new Error("Kelas tidak ditemukan.");
      }

      database.classes[index] = {
        ...database.classes[index],
        ...payload,
      };
    });

    return;
  }

  const supabase = createSupabaseServerClient();

  if (!supabase) {
    throw new Error("Supabase belum dikonfigurasi.");
  }

  const { error } = await supabase.from("classes").update(payload).eq("id", id);

  if (error) {
    throw new Error(`Gagal memperbarui kelas: ${error.message}`);
  }
}

export async function deleteClassRecord(id: string) {
  if (!isSupabaseConfigured()) {
    await mutateLocalDatabase((database) => {
      database.classes = database.classes.filter((item) => item.id !== id);
      database.materialDistributions = database.materialDistributions.filter(
        (item) => item.class_id !== id,
      );
    });

    return;
  }

  const supabase = createSupabaseServerClient();

  if (!supabase) {
    throw new Error("Supabase belum dikonfigurasi.");
  }

  const { error } = await supabase.from("classes").delete().eq("id", id);

  if (error) {
    throw new Error(`Gagal menghapus kelas: ${error.message}`);
  }
}
