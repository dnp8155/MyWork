import { secrets } from "base44:runtime";

export default async function(req: Request): Promise<Response> {
  try {
    const url = secrets.get("SUPABASE_URL");
    const anonKey = secrets.get("SUPABASE_ANON_KEY");
    if (!url || !anonKey) {
      return Response.json({ error: "Supabase config not set" }, { status: 500 });
    }
    return Response.json({ url, anonKey });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}