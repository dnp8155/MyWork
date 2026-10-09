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
    const url = import.meta.env.VITE_SUPABASE_URL;
    const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (!url || !anonKey) throw new Error("Supabase config not available (Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY)");
    
    client = createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storageKey: "mywork_auth_token",
        storage: window.localStorage,
      },
      realtime: { params: { eventsPerSecond: 10 } },
    });
    return client;
  })().catch((err) => {
    initPromise = null; // allow retry on next call
    throw err;
  });

  return initPromise;
}

export async function uploadFileToSupabase(file, bucketName = "uploads") {
  const sb = await getSupabase();
  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
  
  const { error } = await sb.storage.from(bucketName).upload(fileName, file, {
    cacheControl: '3600',
    upsert: false
  });
  
  if (error) throw error;
  
  const { data: { publicUrl } } = sb.storage.from(bucketName).getPublicUrl(fileName);
  return { file_url: publicUrl };
}