import type { MetadataRoute } from "next";
import { getBlogArticles, getProducts } from "@/lib/data";
import { DIVISIONS } from "@/lib/divisions";
import { SITE_URL, absoluteMedia } from "@/lib/site";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, articles] = await Promise.all([getProducts(), getBlogArticles()]);
  const lastModified = new Date();
  const page = (path: string, priority: number, changeFrequency: "daily" | "weekly" | "monthly" = "weekly", images?: string[]) => ({
    url: `${SITE_URL}${path}`,
    lastModified,
    changeFrequency,
    priority,
    ...(images?.length ? { images } : {}),
  });

  return [
    page("/", 1, "daily"),
    page("/products", 0.9),
    ...DIVISIONS.map((d) => page(`/products/${d.slug}`, 0.9)),
    ...products.map((p) => page(`/product/${p.id}`, 0.8, "weekly", [p.heroImg, ...(p.gallery ?? [])].filter(Boolean).slice(0, 5).map((i) => absoluteMedia(i)))),
    page("/gallery", 0.8),
    page("/blog", 0.8),
    ...articles.map((a) => page(`/blog/${a.slug}`, 0.6, "monthly")),
    page("/about", 0.7, "monthly"),
    page("/contact", 0.8, "monthly"),
  ];
}
