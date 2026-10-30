"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { BlogArticle, GalleryProject, Product, Seo, Settings } from "@/lib/data";
import { list } from "./db";

export type AdminProduct = Product & { signatureImg?: string };
export type AdminData = {
  products: AdminProduct[];
  categories: Record<string, string[]>;
  settings: Partial<Settings>;
  gallery: GalleryProject[];
  blogs: BlogArticle[];
  seo: Record<string, Seo>;
};

const empty: AdminData = { products: [], categories: {}, settings: {}, gallery: [], blogs: [], seo: {} };
const StoreContext = createContext<{ data: AdminData; loading: boolean; reload: () => Promise<void> }>({ data: empty, loading: true, reload: async () => {} });
export const useStore = () => useContext(StoreContext);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<AdminData>(empty);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    const [products, categories, settings, gallery, blogs, seo] = await Promise.all([
      list<AdminProduct>("products"),
      list<{ subcategories?: string[] }>("categories"),
      list<Partial<Settings>>("settings"),
      list<GalleryProject>("gallery"),
      list<BlogArticle>("blogs"),
      list<Seo>("seo_settings"),
    ]);
    setData({
      products: products.map((r) => ({ ...r.data, id: r.id })),
      categories: Object.fromEntries(categories.map((r) => [r.id, r.data.subcategories ?? []])),
      settings: settings.find((r) => r.id === "config")?.data ?? settings.find((r) => r.id !== "credentials")?.data ?? {},
      gallery: gallery.map((r) => ({ ...r.data, id: r.id })),
      blogs: blogs.map((r) => ({ ...r.data, id: r.id, slug: r.id })),
      seo: Object.fromEntries(seo.map((r) => [r.id, r.data])),
    });
    setLoading(false);
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return <StoreContext.Provider value={{ data, loading, reload }}>{children}</StoreContext.Provider>;
}
