"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import type { Categories, Product } from "@/lib/data";
import { ProductCard } from "./cards";
import { ChevronDown } from "./icons";

const ALL = "All Products";
const PAGE = 24;

type Props = { products: Product[]; categories: Categories };

// Reads ?cat= and ?sub= from the URL; used inside <Suspense>.
export function ProductBrowserFromUrl(props: Props) {
  const params = useSearchParams();
  return <ProductBrowser {...props} initialCat={params.get("cat") || ALL} initialSub={params.get("sub") || ""} />;
}

export function ProductBrowser({ products, categories, initialCat = ALL, initialSub = "" }: Props & { initialCat?: string; initialSub?: string }) {
  const [cat, setCat] = useState(initialCat);
  const [sub, setSub] = useState(initialSub);
  const [query, setQuery] = useState("");
  const [limit, setLimit] = useState(PAGE);

  const select = (nextCat: string, nextSub = "") => {
    setCat(nextCat);
    setSub(nextSub);
    setLimit(PAGE);
    const url = new URL(window.location.href);
    if (nextCat === ALL) url.searchParams.delete("cat");
    else url.searchParams.set("cat", nextCat);
    if (nextSub) url.searchParams.set("sub", nextSub);
    else url.searchParams.delete("sub");
    window.history.replaceState(null, "", url);
  };

  const count = (c: string) => (c === ALL ? products.length : products.filter((p) => p.category === c).length);
  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter(
      (p) => (cat === ALL || p.category === cat) && (!sub || p.subcategory === sub) && (!q || p.name.toLowerCase().includes(q))
    );
  }, [products, cat, sub, query]);

  const reset = () => {
    setQuery("");
    select(ALL);
  };

  return (
    <div className="max-w-[100rem] mx-auto grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-16">
      <aside className="md:col-span-4 lg:col-span-3 2xl:col-span-2 hidden md:block">
        <div className="sticky top-32 glass-sidebar p-8">
          <h3 className="text-[10px] uppercase tracking-widest text-primary font-bold mb-8">Search &amp; Filter</h3>
          <input
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setLimit(PAGE);
            }}
            placeholder="Search products..."
            aria-label="Search products"
            className="premium-input !text-xs !bg-transparent !px-0 !pt-0 !pb-4 mb-8"
          />
          <div className="space-y-1">
            <div className="mb-4">
              <button onClick={() => select(ALL)} className={`w-full text-left flex justify-between items-center text-sm transition-colors hover:text-accent ${cat === ALL ? "text-primary font-medium" : "text-secondary"}`}>
                <span>{ALL}</span>
                <span className="text-[10px] bg-white border border-black/5 px-2 py-0.5 rounded-full text-secondary">{count(ALL)}</span>
              </button>
            </div>
            {Object.entries(categories).map(([c, subs]) => (
              <div key={c} className="mb-3">
                <button onClick={() => select(c)} className={`w-full text-left flex justify-between items-center text-sm transition-colors group hover:text-primary ${cat === c ? "text-primary font-medium" : "text-secondary"}`}>
                  <span className="flex items-center gap-2">
                    <ChevronDown className={`transition-transform opacity-50 group-hover:opacity-100 ${cat === c ? "" : "-rotate-90"}`} />
                    {c}
                  </span>
                  <span className="text-[10px] bg-white border border-black/5 px-2 py-0.5 rounded-full text-secondary">{count(c)}</span>
                </button>
                {cat === c && subs.length > 0 && (
                  <div className="pl-6 mt-2 space-y-2">
                    {subs.map((s) => (
                      <button key={s} onClick={() => select(c, s)} className={`w-full text-left text-[13px] transition-colors hover:text-accent ${sub === s ? "text-accent font-medium" : "text-secondary"}`}>
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-10 p-6 rounded-2xl bg-primary text-white overflow-hidden relative group">
            <div className="relative z-10">
              <h4 className="text-xs font-bold uppercase tracking-widest mb-2">Need Support?</h4>
              <p className="text-[10px] opacity-70 mb-4 leading-relaxed">Our engineers are available for photometric planning.</p>
              <Link href="/contact" className="text-[10px] font-bold border-b border-white/30 pb-1 hover:border-white transition-all">Talk to Expert</Link>
            </div>
            <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.12),transparent_70%)]" />
          </div>
        </div>
      </aside>

      <div className="md:hidden mb-4 border-b border-black/5 pb-6">
        <input
          type="search"
          value={query}
          onChange={(e) => {
              setQuery(e.target.value);
              setLimit(PAGE);
            }}
          placeholder="Search products..."
          aria-label="Search products"
          className="premium-input text-sm !bg-transparent border !border-black/20 !rounded-lg !p-3 mb-4"
        />
        <div className="flex flex-wrap gap-2">
          {[ALL, ...Object.keys(categories)].map((c) => (
            <button key={c} onClick={() => select(c)} className={`text-xs border border-black/10 rounded-full px-4 py-2 transition-colors ${cat === c ? "bg-primary text-white border-primary" : "bg-surfaceLight text-secondary"}`}>
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="md:col-span-8 lg:col-span-9 2xl:col-span-10">
      <div className="grid grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3 md:gap-5 content-start">
        {visible.slice(0, limit).map((p) => (
          <ProductCard key={p.id} p={p} />
        ))}
        {visible.length === 0 && (
          <div className="col-span-full py-32 text-center text-secondary">
            <p className="text-xl font-light">No products found matching your search.</p>
            <button onClick={reset} className="mt-4 text-primary text-sm font-medium border-b border-primary">Clear all filters</button>
          </div>
        )}
      </div>
      {visible.length > limit && (
        <div className="mt-10 flex flex-col items-center gap-3">
          <p className="text-xs text-secondary">Showing {limit} of {visible.length}</p>
          <button onClick={() => setLimit((n) => n + PAGE)} className="px-8 py-3 rounded-full border border-primary text-xs font-bold uppercase tracking-widest text-primary hover:bg-primary hover:text-white transition-colors">
            Load more
          </button>
        </div>
      )}
      </div>
    </div>
  );
}
