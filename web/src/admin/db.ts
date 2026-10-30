"use client";

import { createClient } from "@supabase/supabase-js";
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "@/lib/supabase-config";

// Browser client for the admin panel. Row Level Security only lets signed-in
// admins (public.admin_users) write; the publishable key is public.
export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

const TABLE = "documents";
const BUCKET = "media";
const PUBLIC_PREFIX = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/`;

export type Row<T> = { id: string; data: T };

function check<T>({ data, error }: { data: T; error: { message: string } | null }): T {
  if (error) throw new Error(error.message);
  return data;
}

export async function list<T>(collection: string): Promise<Row<T>[]> {
  return check(await supabase.from(TABLE).select("id, data").eq("collection", collection).order("id")) as Row<T>[];
}

// Asks the website to rebuild its pages now, so changes show up immediately.
async function refreshSite() {
  try {
    const { data } = await supabase.auth.getSession();
    await fetch("/api/revalidate", { method: "POST", headers: { Authorization: `Bearer ${data.session?.access_token ?? ""}` } });
  } catch {
    // The site still refreshes on its own within a couple of minutes.
  }
}

export async function save<T>(collection: string, id: string, data: T) {
  check(await supabase.from(TABLE).upsert({ collection, id, data }));
  await refreshSite();
}

export async function saveMany<T>(collection: string, rows: Row<T>[]) {
  if (!rows.length) return;
  check(await supabase.from(TABLE).upsert(rows.map((r) => ({ collection, id: r.id, data: r.data }))));
  await refreshSite();
}

// Fails loudly when nothing was deleted (e.g. no permission), instead of looking successful.
export async function remove(collection: string, ids: string[]) {
  if (!ids.length) return;
  const deleted = check(await supabase.from(TABLE).delete().eq("collection", collection).in("id", ids).select("id")) as { id: string }[];
  if (deleted.length < ids.length) throw new Error(`Only ${deleted.length} of ${ids.length} deleted. Check that you are signed in as an admin.`);
  await refreshSite();
}

export async function isAdmin() {
  return check(await supabase.rpc("is_admin")) === true;
}

// Large photos are scaled down (longest side 1800px) and stored as WebP.
async function compress(file: File): Promise<Blob> {
  if (!file.type.startsWith("image/") || file.type === "image/svg+xml" || file.type === "image/gif") return file;
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, 1800 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/webp", 0.85));
    return blob && blob.size < file.size ? blob : file;
  } catch {
    return file;
  }
}

export async function uploadImage(file: File): Promise<string> {
  const blob = await compress(file);
  const type = blob.type || "image/jpeg";
  const ext = (type.split("/")[1] || "jpg").replace("jpeg", "jpg");
  const path = `uploads/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  check(await supabase.storage.from(BUCKET).upload(path, blob, { contentType: type, cacheControl: "31536000" }));
  return PUBLIC_PREFIX + path;
}

// Removes a file this panel uploaded; other URLs (old /uploads, external) are left alone.
export async function deleteImage(url: string) {
  if (!url.startsWith(PUBLIC_PREFIX)) return;
  await supabase.storage.from(BUCKET).remove([decodeURIComponent(url.slice(PUBLIC_PREFIX.length))]);
}

export const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
