import { setupEnvSchema } from "@/lib/validations";
import type { SetupStatus } from "@/types/domain";

interface SupabaseEnv {
  url: string;
  serviceRoleKey: string;
}

export function getSupabaseEnv(): SupabaseEnv | null {
  const raw = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  };

  const parsed = setupEnvSchema.safeParse(raw);

  if (!parsed.success) {
    return null;
  }

  return {
    url: parsed.data.NEXT_PUBLIC_SUPABASE_URL,
    serviceRoleKey: parsed.data.SUPABASE_SERVICE_ROLE_KEY,
  };
}

export function getSetupStatus(): SetupStatus {
  const missingKeys = [
    !process.env.NEXT_PUBLIC_SUPABASE_URL && "NEXT_PUBLIC_SUPABASE_URL",
    !process.env.SUPABASE_SERVICE_ROLE_KEY && "SUPABASE_SERVICE_ROLE_KEY",
  ].filter(Boolean) as string[];

  const env = getSupabaseEnv();

  if (env) {
    return {
      isConfigured: true,
      mode: "supabase",
      missingKeys: [],
      message: "Supabase aktif. CRUD kelas, materi, dan distribusi siap memakai backend asli.",
    };
  }

  return {
    isConfigured: true,
    mode: "local",
    missingKeys,
    message:
      "Mode lokal aktif. Data dan file akan disimpan langsung di laptop Anda. Isi env Supabase jika nanti ingin sinkron ke cloud.",
  };
}

export function isSupabaseConfigured() {
  return getSupabaseEnv() !== null;
}
