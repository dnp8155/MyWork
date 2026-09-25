import { createClient } from "@supabase/supabase-js";

let client = null;
let initPromise = null;

/**
 * Lazily creates and caches the Supabase client.
 * Fetches URL + anon key from the backend function (secrets).
 */
export async function getSupabase() {
  if (client) return client;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    const { base44 } = await import("@/api/base44Client");
    const res = await base44.functions.invoke("supabaseConfig", {});
    const { url, anonKey } = res.data || {};
    if (!url || !anonKey) throw new Error("Supabase config not available");
    client = createClient(url, anonKey, {
      realtime: { params: { eventsPerSecond: 10 } },
    });
    return client;
  })();

  return initPromise;
}