import type { Metadata } from "next";
import { Suspense } from "react";
import { ProductBrowser, ProductBrowserFromUrl } from "@/components/ProductBrowser";
import Link from "next/link";
import { getCategories, getProducts, getSeo } from "@/lib/data";
import { DIVISIONS } from "@/lib/divisions";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeo("products");
  return {
    title: seo.title || "Architectural & Outdoor LED Lighting Products | NexaLight",
    description:
      seo.description ||
      "Browse NexaLight facade, fibre optic, landscape and indoor architectural lighting. Request project pricing, datasheets and IES files.",
    alternates: { canonical: "/products" },
  };
}

export default async function ProductsPage() {
  const [all, categories] = await Promise.all([getProducts(), getCategories()]);
  // Only what the cards need goes to the browser (no descriptions/specs).
  const products = all.map(({ id, name, category, subcategory, heroImg }) => ({ id, name, category, subcategory, heroImg }));

  return (
    <div className="bg-background min-h-screen">
      <section className="pt-28 md:pt-32 pb-8 md:pb-10 px-6 md:px-12 border-b border-black/5">
        <div className="max-w-[90rem] mx-auto">
          <nav aria-label="Breadcrumb" className="mb-5 text-xs text-secondary">
            <Link href="/" className="hover:text-primary">Home</Link>
            <span className="mx-2 text-black/25">/</span>
            <span className="text-primary font-medium" aria-current="page">Products</span>
          </nav>
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl md:text-5xl font-medium tracking-tight text-primary mb-3">All Products</h1>
              <p className="text-secondary text-sm md:text-base max-w-2xl">
                {all.length} architectural lighting products across four divisions. Filter by category, compare specifications and request project pricing.
              </p>
            </div>
            <a href="/catalogue" target="_blank" className="self-start lg:self-auto shrink-0 inline-flex items-center gap-2 h-11 px-5 rounded-lg border border-primary text-xs font-bold uppercase tracking-widest text-primary hover:bg-primary hover:text-white transition-colors">
              Download catalogue
            </a>
          </div>
          <div className="flex gap-3 overflow-x-auto hide-scrollbar -mx-6 px-6 md:mx-0 md:px-0 md:grid md:grid-cols-4">
            {DIVISIONS.map((d) => (
              <Link key={d.slug} href={`/products/${d.slug}`} className="group shrink-0 w-56 md:w-auto flex items-center justify-between gap-3 p-4 rounded-xl bg-white border border-black/[0.06] hover:border-primary transition-colors">
                <span>
                  <span className="block text-sm font-semibold text-primary leading-snug">{d.category}</span>
                  <span className="block text-xs text-secondary mt-1">{all.filter((p) => p.category === d.category).length} products</span>
                </span>
                <span className="text-primary group-hover:translate-x-1 transition-transform">→</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
      <section className="py-10 md:py-14 px-6 md:px-12">
        {/* The full list is pre-rendered; the URL's filters apply once the page loads. */}
        <Suspense fallback={<ProductBrowser products={products} categories={categories} />}>
          <ProductBrowserFromUrl products={products} categories={categories} />
        </Suspense>
      </section>
    </div>
  );
}
