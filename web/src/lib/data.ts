import "server-only";
import { cache } from "react";
import fallbackGallery from "./fallback-gallery.json";
import fallbackBlog from "./fallback-blog.json";

import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "./supabase-config";

// Pages are regenerated in the background at most this often (seconds), so
// admin edits show up on the site within a minute.
export const REVALIDATE_SECONDS = 60;

export type Product = {
  id: string;
  name: string;
  category: string;
  subcategory?: string;
  price?: string;
  heroImg?: string;
  gallery?: string[];
  desc?: string;
  features?: string[];
  specs?: Record<string, string>;
  status?: string;
  seoTitle?: string;
  seoDesc?: string;
};

export type Categories = Record<string, string[]>;

export type Settings = {
  email: string;
  phone: string;
  whatsapp: string;
  location: string;
  mapEmbed: string;
};

export type GalleryProject = {
  id: string;
  title: string;
  location?: string;
  year?: string;
  category?: string;
  image?: string;
  product?: string;
  desc?: string;
  specs?: string;
};

export type BlogArticle = {
  id: string;
  slug: string;
  title: string;
  category: string;
  date?: string;
  readTime?: string;
  author?: string;
  authorRole?: string;
  authorAvatar?: string;
  image?: string;
  excerpt?: string;
  content?: string;
  tags?: string[];
};

export type Seo = { title?: string; description?: string };

const DEFAULT_SETTINGS: Settings = {
  email: "info@nexalight.in",
  phone: "+91 81082 09914",
  whatsapp: "https://wa.me/918108209914",
  location: "Design Studio, Ganaur, Haryana, India",
  mapEmbed:
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3485.498426038843!2d77.0142981!3d29.1203099!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390db17d2da53ea3%3A0x2a98f1f7bd84b2c1!2sGanaur%2C%20Haryana!5e0!3m2!1sen!2sin!4v1718453400000!5m2!1sen!2sin",
};

type Row<T> = { id: string; data: T };

const loadCollection = cache(async function loadCollection<T>(collection: string): Promise<Row<T>[]> {
  // Local testing without network access: NEXALIGHT_FIXTURE=path/to/export.json
  if (process.env.NEXALIGHT_FIXTURE) {
    const { readFile } = await import("node:fs/promises");
    const all = JSON.parse(await readFile(process.env.NEXALIGHT_FIXTURE, "utf8")) as Record<string, Record<string, T>>;
    return Object.entries(all[collection] ?? {}).map(([id, data]) => ({ id, data }));
  }
  const url = `${SUPABASE_URL}/rest/v1/documents?select=id,data&collection=eq.${encodeURIComponent(collection)}&order=id`;
  try {
    const res = await fetch(url, {
      headers: { apikey: SUPABASE_PUBLISHABLE_KEY, Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}` },
      next: { revalidate: REVALIDATE_SECONDS, tags: [collection] },
    });
    if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
    return (await res.json()) as Row<T>[];
  } catch (err) {
    console.error(`Loading "${collection}" from Supabase failed:`, err);
    return [];
  }
});

// Live (approved) products, in the same order the old site listed them.
export async function getProducts(): Promise<Product[]> {
  const rows = await loadCollection<Product>("products");
  return rows
    .map((r) => ({ ...r.data, id: r.id }))
    .filter((p) => p.status === "approved");
}

export async function getProduct(id: string): Promise<Product | undefined> {
  return (await getProducts()).find((p) => p.id === id);
}

export async function getCategories(): Promise<Categories> {
  const rows = await loadCollection<{ subcategories?: string[] }>("categories");
  return Object.fromEntries(rows.map((r) => [r.id, r.data.subcategories ?? []]));
}

export async function getSettings(): Promise<Settings> {
  const rows = await loadCollection<Partial<Settings>>("settings");
  const config = rows.find((r) => r.id !== "credentials")?.data ?? {};
  const merged = { ...DEFAULT_SETTINGS };
  for (const key of Object.keys(merged) as (keyof Settings)[]) {
    if (config[key]) merged[key] = config[key] as string;
  }
  return merged;
}

// Admin-managed projects; the built-in showcase is used until any are added.
export async function getGallery(): Promise<GalleryProject[]> {
  const rows = await loadCollection<Omit<GalleryProject, "id">>("gallery");
  const projects = rows.map((r) => ({ ...r.data, id: r.id }));
  return projects.length ? projects : (fallbackGallery as GalleryProject[]);
}

// Admin-written articles first, followed by the built-in studio essays.
export async function getBlogArticles(): Promise<BlogArticle[]> {
  const rows = await loadCollection<Partial<BlogArticle>>("blogs");
  const fromAdmin: BlogArticle[] = rows.map((r) => ({
    ...r.data,
    title: r.data.title || r.id,
    category: r.data.category || "Studio News",
    id: r.id,
    slug: r.id,
  }));
  const builtIn = fallbackBlog as BlogArticle[];
  const taken = new Set(fromAdmin.map((a) => a.slug));
  return [...fromAdmin, ...builtIn.filter((a) => !taken.has(a.slug))];
}

export async function getSeo(page: string): Promise<Seo> {
  const rows = await loadCollection<Seo>("seo_settings");
  const seo = rows.find((r) => r.id === page)?.data ?? {};
  return { title: seo.title || undefined, description: seo.description || undefined };
}
