import { getSetupStatus, isSupabaseConfigured } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export { isSupabaseConfigured };
export { createSupabaseServerClient };

export function getSupabaseStatusMessage() {
  return getSetupStatus().message;
}

export function getSupabaseSetupView() {
  return getSetupStatus();
}
