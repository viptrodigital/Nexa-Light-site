import { revalidatePath } from "next/cache";
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "@/lib/supabase-config";

// Called by the admin panel after every change so the website shows it at once
// instead of after the next background refresh. Only signed-in admins may call it.
export async function POST(request: Request) {
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return Response.json({ ok: false }, { status: 401 });

  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/is_admin`, {
    method: "POST",
    headers: { apikey: SUPABASE_PUBLISHABLE_KEY, Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: "{}",
    cache: "no-store",
  });
  if (!res.ok || (await res.json()) !== true) return Response.json({ ok: false }, { status: 403 });

  revalidatePath("/", "layout");
  return Response.json({ ok: true });
}
