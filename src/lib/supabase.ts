import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

function createSupabaseClient(): SupabaseClient {
  if (!supabaseUrl || !supabaseAnonKey) {
    return createClient("https://placeholder.supabase.co", "placeholder-key");
  }
  return createClient(supabaseUrl, supabaseAnonKey);
}

export const supabase = createSupabaseClient();

export function getSupabaseAdmin() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    throw new Error("Supabase is not configured");
  }
  return createClient(supabaseUrl, serviceKey);
}

export const ORDER_CHANNEL_PREFIX = "orders";

export function orderChannelName(restaurantId: string) {
  return `${ORDER_CHANNEL_PREFIX}:${restaurantId}`;
}

export function tableChannelName(tableId: string) {
  return `table:${tableId}`;
}
