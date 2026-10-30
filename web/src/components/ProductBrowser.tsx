"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { Categories, Product } from "@/lib/data";
import { titleCase } from "@/lib/site";
import { ProductCard } from "./cards";
import { ChevronDown } from "./icons";

const PAGE = 24;
type CardProduct = Pick<Product, "id" | "name" | "category" | "subcategory" | "heroImg">;
type Props = { products: CardProduct[]; categories: Categories };
type Sort = "featured" | "az" | "za";

// Reads ?cat=, ?sub= and ?q= from the URL; used inside <Suspense>.
export function ProductBrowserFromUrl(props: Props) {
  const params = useSearchParams();
  return <ProductBrowser {...props} initialCat={params.get("cat") || ""} initialSub={params.get("sub") || ""} initialQuery={params.get("q") || ""} />;
}

export function ProductBrowser({ products, categories, initialCat = "", initialSub = "", initialQuery = "" }: Props & { initialCat?: string; initialSub?: string; initialQuery?: string }) {
  const [cat, setCat] = useState(initialCat);
  const [sub, setSub] = useState(initialSub);
  const [query, setQuery] = useState(initialQuery);
  const [sort, setSort] = useState<Sort>("featured");
  const [limit, setLimit] = useState(PAGE);
  const [drawer, setDrawer] = useState(false);

  // Category tree in admin order, with only the subcategories that have products.
  const tree = useMemo(() => {
    const names = Array.from(new Set([...Object.keys(categories), ...products.map((p) => p.category)]));
    return names
      .map((c) => {
        const inCat = products.filter((p) => p.category === c);
        const subs = Array.from(new Set([...(categories[c] ?? []), ...inCat.map((p) => p.subcategory || "")]))
          .filter(Boolean)
          .map((s) => ({ name: s, count: inCat.filter((p) => p.subcategory === s).length }))
          .filter((s) => s.count > 0);
        return { name: c, count: inCat.length, subs };
      })
      .filter((c) => c.count > 0);
  }, [products, categories]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = products.filter(
      (p) =>
        (!cat || p.category === cat) &&
        (!sub || p.subcategory === sub) &&
        (!q || `${p.name} ${p.subcategory ?? ""} ${p.category} ${p.id}`.toLowerCase().includes(q))
    );
    if (sort === "featured") return list;
    const sorted = [...list].sort((a, b) => titleCase(a.name).localeCompare(titleCase(b.name)));
    return sort === "az" ? sorted : sorted.reverse();
  }, [products, cat, sub, query, sort]);

  // Keep the URL shareable without reloading the page.
  useEffect(() => {
    const url = new URL(window.location.href);
    for (const [k, v] of [["cat", cat], ["sub", sub], ["q", query.trim()]] as const) {
      if (v) url.searchParams.set(k, v);
      else url.searchParams.delete(k);
    }
    window.history.replaceState(null, "", url);
  }, [cat, sub, query]);

  useEffect(() => {
    document.body.style.overflow = drawer ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawer]);

  const select = (nextCat: string, nextSub = "") => {
    setCat(nextCat);
    setSub(nextSub);
    setLimit(PAGE);
  };
  const reset = () => {
    setQuery("");
    select("");
  };

  const filters = (
    <div className="space-y-8">
      <div>
        <label htmlFor="product-search" className="block text-[10px] font-bold uppercase tracking-widest text-primary mb-3">Search</label>
        <input
          id="product-search"
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setLimit(PAGE);
          }}
          placeholder="Product name or model"
          className="w-full h-11 rounded-lg border border-black/15 bg-white px-3 text-sm text-primary outline-none focus:border-primary"
        />
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-3">Categories</p>
        <ul className="space-y-1 text-sm">
          <li>
            <button onClick={() => select("")} className={`w-full flex justify-between items-center px-3 py-2 rounded-lg transition-colors ${!cat ? "bg-primary text-white" : "text-primary hover:bg-surfaceLight"}`}>
              <span>All products</span>
              <span className={`text-xs ${!cat ? "text-white/70" : "text-secondary"}`}>{products.length}</span>
            </button>
          </li>
          {tree.map((c) => {
            const open = cat === c.name;
            return (
              <li key={c.name}>
                <button
                  onClick={() => select(c.name)}
                  aria-expanded={open}
                  className={`w-full flex justify-between items-center gap-2 px-3 py-2 rounded-lg text-left transition-colors ${open && !sub ? "bg-primary text-white" : open ? "bg-surfaceLight text-primary font-medium" : "text-primary hover:bg-surfaceLight"}`}
                >
                  <span className="flex items-center gap-2">
                    <ChevronDown className={`shrink-0 transition-transform ${open ? "" : "-rotate-90"}`} />
                    {c.name}
                  </span>
                  <span className={`text-xs ${open && !sub ? "text-white/70" : "text-secondary"}`}>{c.count}</span>
                </button>
                {open && c.subs.length > 0 && (
                  <ul className="mt-1 mb-2 ml-5 pl-3 border-l border-black/10 space-y-0.5">
                    {c.subs.map((s) => (
                      <li key={s.name}>
                        <button
                          onClick={() => select(c.name, s.name)}
                          className={`w-full flex justify-between items-center px-3 py-1.5 rounded-md text-[13px] text-left transition-colors ${sub === s.name ? "bg-primary text-white" : "text-secondary hover:text-primary hover:bg-surfaceLight"}`}
                        >
                          <span>{s.name}</span>
                          <span className={`text-xs ${sub === s.name ? "text-white/70" : "text-secondary/70"}`}>{s.count}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </div>
      <div className="rounded-xl bg-primary text-white p-5">
        <p className="text-sm font-semibold mb-1">Bulk or project order?</p>
        <p className="text-xs text-white/70 leading-relaxed mb-4">Share your BOQ and our team will send pricing, datasheets and IES files.</p>
        <Link href="/contact" className="inline-block text-[11px] font-bold uppercase tracking-widest border-b border-white/40 pb-0.5 hover:border-white">Send enquiry →</Link>
      </div>
    </div>
  );

  const chips = [cat && { label: cat, clear: () => select("") }, sub && { label: sub, clear: () => select(cat) }, query.trim() && { label: `“${query.trim()}”`, clear: () => setQuery("") }].filter(
    Boolean
  ) as { label: string; clear: () => void }[];

  return (
    <div className="max-w-[90rem] mx-auto grid grid-cols-1 lg:grid-cols-[17rem_1fr] gap-8 lg:gap-12">
      <aside className="hidden lg:block">
        <div className="sticky top-28">{filters}</div>
      </aside>

      <div className="min-w-0">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-6 border-b border-black/10">
          <p className="text-sm text-secondary">
            <span className="font-semibold text-primary">{visible.length}</span> {visible.length === 1 ? "product" : "products"}
            {sub ? ` in ${sub}` : cat ? ` in ${cat}` : ""}
          </p>
          <div className="flex items-center gap-2">
            <button onClick={() => setDrawer(true)} className="lg:hidden h-10 px-4 rounded-lg border border-black/15 bg-white text-xs font-semibold uppercase tracking-widest text-primary">
              Filters{chips.length ? ` (${chips.length})` : ""}
            </button>
            <label className="flex items-center gap-2 text-xs text-secondary">
              <span className="hidden sm:inline">Sort by</span>
              <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} className="h-10 rounded-lg border border-black/15 bg-white px-3 text-sm text-primary outline-none focus:border-primary">
                <option value="featured">Featured</option>
                <option value="az">Name: A to Z</option>
                <option value="za">Name: Z to A</option>
              </select>
            </label>
          </div>
        </div>

        {chips.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-6">
            {chips.map((c) => (
              <button key={c.label} onClick={c.clear} className="flex items-center gap-2 h-8 pl-3 pr-2 rounded-full bg-surfaceLight text-xs text-primary hover:bg-surface">
                {c.label} <span aria-label="Remove filter" className="text-secondary">×</span>
              </button>
            ))}
            <button onClick={reset} className="text-xs text-secondary underline underline-offset-2 hover:text-primary ml-1">Clear all</button>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-3 2xl:grid-cols-4 gap-3 md:gap-5">
          {visible.slice(0, limit).map((p) => (
            <ProductCard key={p.id} p={p} />
          ))}
        </div>

        {visible.length === 0 && (
          <div className="py-24 text-center">
            <p className="text-lg text-primary mb-2">No products found</p>
            <p className="text-sm text-secondary mb-6">Try another search term or category.</p>
            <button onClick={reset} className="px-6 py-3 rounded-full bg-primary text-white text-xs font-bold uppercase tracking-widest">Show all products</button>
          </div>
        )}

        {visible.length > limit && (
          <div className="mt-10 flex flex-col items-center gap-3">
            <p className="text-xs text-secondary">Showing {limit} of {visible.length}</p>
            <button onClick={() => setLimit((n) => n + PAGE)} className="px-8 py-3 rounded-full border border-primary text-xs font-bold uppercase tracking-widest text-primary hover:bg-primary hover:text-white transition-colors">
              Load more
            </button>
          </div>
        )}
      </div>

      {drawer && (
        <div className="fixed inset-0 z-[80] lg:hidden" role="dialog" aria-modal="true" aria-label="Filters">
          <button className="absolute inset-0 bg-black/40" aria-label="Close filters" onClick={() => setDrawer(false)} />
          <div className="absolute inset-y-0 left-0 w-[85%] max-w-sm bg-background p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <p className="text-base font-semibold text-primary">Filters</p>
              <button onClick={() => setDrawer(false)} className="text-2xl leading-none text-primary" aria-label="Close filters">×</button>
            </div>
            {filters}
            <button onClick={() => setDrawer(false)} className="mt-8 w-full h-12 rounded-lg bg-primary text-white text-xs font-bold uppercase tracking-widest">
              Show {visible.length} products
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
