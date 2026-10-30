"use client";

import { useMemo } from "react";
import { useStore, type AdminProduct } from "../store";
import { Card, PageHeader, Thumb } from "../ui";

export type Issue = { key: string; label: string; test: (p: AdminProduct, cats: Record<string, string[]>) => boolean };

// Data-quality checks shown on the dashboard and usable as a product filter.
export const ISSUES: Issue[] = [
  { key: "no-image", label: "No product photo", test: (p) => !p.heroImg && !(p.gallery ?? []).length },
  { key: "no-specs", label: "No specifications", test: (p) => !Object.keys(p.specs ?? {}).length },
  { key: "no-desc", label: "No description", test: (p) => !(p.desc ?? "").trim() },
  { key: "lowercase", label: "Name not capitalised", test: (p) => /^[a-z]/.test(p.name.trim()) },
  { key: "bad-sub", label: "Sub-category not in category list", test: (p, cats) => !!p.subcategory && !(cats[p.category] ?? []).includes(p.subcategory) },
  { key: "no-seo", label: "Missing SEO title/description", test: (p) => !p.seoTitle || !p.seoDesc },
];

export default function Dashboard() {
  const { data } = useStore();
  const products = data.products;
  const live = products.filter((p) => p.status === "approved").length;

  const byCategory = useMemo(() => {
    const names = Array.from(new Set([...Object.keys(data.categories), ...products.map((p) => p.category)]));
    return names.map((c) => ({ name: c, total: products.filter((p) => p.category === c).length, live: products.filter((p) => p.category === c && p.status === "approved").length }));
  }, [products, data.categories]);

  const issues = ISSUES.map((i) => ({ ...i, count: products.filter((p) => i.test(p, data.categories)).length })).filter((i) => i.count > 0);
  const recent = [...products].slice(-6).reverse();

  return (
    <>
      <PageHeader
        title="Dashboard"
        subtitle="Overview of your catalogue and content. Changes appear on the website within about a minute."
        actions={
          <a href="#/products/new" className="inline-flex items-center h-10 px-4 rounded-lg bg-primary text-white text-sm font-medium">
            + Add product
          </a>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          ["Products", products.length, "#/products"],
          ["Live on website", live, "#/products?status=approved"],
          ["Hidden / draft", products.length - live, "#/products?status=draft"],
          ["Blog & projects", data.blogs.length + data.gallery.length, "#/blog"],
        ].map(([label, value, href]) => (
          <a key={label as string} href={href as string} className="bg-white rounded-xl border border-black/[0.08] p-5 hover:border-primary transition-colors">
            <p className="text-xs text-secondary mb-2">{label}</p>
            <p className="text-3xl font-semibold text-primary">{value}</p>
          </a>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Products by category">
          <ul className="space-y-3">
            {byCategory.map((c) => (
              <li key={c.name}>
                <a href={`#/products?cat=${encodeURIComponent(c.name)}`} className="flex items-center justify-between text-sm mb-1.5 hover:underline">
                  <span className="text-primary">{c.name}</span>
                  <span className="text-secondary">
                    {c.live} live / {c.total}
                  </span>
                </a>
                <div className="h-1.5 rounded-full bg-surfaceLight overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: `${products.length ? (c.total / products.length) * 100 : 0}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </Card>

        <Card title="Needs attention">
          {issues.length === 0 ? (
            <p className="text-sm text-secondary">Everything looks good.</p>
          ) : (
            <ul className="divide-y divide-black/[0.06]">
              {issues.map((i) => (
                <li key={i.key}>
                  <a href={`#/products?issue=${i.key}`} className="flex items-center justify-between py-2.5 text-sm hover:underline">
                    <span className="text-primary">{i.label}</span>
                    <span className="inline-flex items-center justify-center min-w-7 h-6 px-2 rounded-md bg-surfaceLight text-xs font-semibold text-primary">{i.count}</span>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title="Recently added" className="lg:col-span-2">
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {recent.map((p) => (
              <li key={p.id}>
                <a href={`#/products/${encodeURIComponent(p.id)}`} className="flex items-center gap-3 p-2 rounded-lg hover:bg-surfaceLight">
                  <Thumb src={p.heroImg} />
                  <span className="min-w-0">
                    <span className="block text-sm text-primary truncate">{p.name}</span>
                    <span className="block text-xs text-secondary truncate">
                      {p.category} · {p.subcategory}
                    </span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </>
  );
}
