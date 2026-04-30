mport { createClient, SupabaseClient } from "@supabase/supabase-js";

let _client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (_client) return _client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error(
      "Mancano NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY"
    );
  }
  _client = createClient(url, key, {
    realtime: { params: { eventsPerSecond: 20 } },
    auth: { persistSession: false },
  });
  return _client;
}

export type Poll = {
  id: string;
  question: string;
  options: string[];
  is_active: boolean;
  created_at: string;
};

export type Vote = {
  id: string;
  poll_id: string;
  option_index: number;
  voter_id: string;
  created_at: string;
};
