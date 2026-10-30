"use client";

import { useEffect, useMemo, useState } from "react";
import { hashParams } from "../AdminApp";
import { remove, saveMany } from "../db";
import { useStore, type AdminProduct } from "../store";
import { Badge, Button, PageHeader, Thumb, inputClass, useToast } from "../ui";
import { ISSUES } from "./Dashboard";
import { titleCase } from "@/lib/site";

const PAGE = 50;
type SortKey = "name" | "category" | "subcategory" | "status";

export default function ProductsPage() {
  const { data, reload } = useStore();
  const toast = useToast();
  const initial = typeof window === "undefined" ? new URLSearchParams() : hashParams();
  const [q, setQ] = useState(initial.get("q") ?? "");
  const [cat, setCat] = useState(initial.get("cat") ?? "");
  const [sub, setSub] = useState(initial.get("sub") ?? "");
  const [status, setStatus] = useState(initial.get("status") ?? "");
  const [issue, setIssue] = useState(initial.get("issue") ?? "");
  const [sort, setSort] = useState<{ key: SortKey; dir: 1 | -1 }>({ key: "name", dir: 1 });
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);
  const [moveTo, setMoveTo] = useState({ cat: "", sub: "" });

  // Keep filters in the address so "Back" from the editor returns to the same list.
  useEffect(() => {
    const p = new URLSearchParams();
    for (const [k, v] of Object.entries({ q, cat, sub, status, issue })) if (v) p.set(k, v);
    const qs = p.toString();
    history.replaceState(null, "", `#/products${qs ? `?${qs}` : ""}`);
    setPage(0);
  }, [q, cat, sub, status, issue]);

  const categories = useMemo(() => Array.from(new Set([...Object.keys(data.categories), ...data.products.map((p) => p.category)])).sort(), [data]);
  const subsFor = (c: string) => Array.from(new Set([...(data.categories[c] ?? []), ...data.products.filter((p) => p.category === c).map((p) => p.subcategory ?? "")])).filter(Boolean);

  const rows = useMemo(() => {
    const term = q.trim().toLowerCase();
    const check = ISSUES.find((i) => i.key === issue);
    const list = data.products.filter(
      (p) =>
        (!term || `${p.name} ${p.id} ${p.subcategory ?? ""} ${p.category}`.toLowerCase().includes(term)) &&
        (!cat || p.category === cat) &&
        (!sub || p.subcategory === sub) &&
        (!status || (status === "approved" ? p.status === "approved" : p.status !== "approved")) &&
        (!check || check.test(p, data.categories))
    );
    return list.sort((a, b) => String(a[sort.key] ?? "").localeCompare(String(b[sort.key] ?? ""), undefined, { sensitivity: "base" }) * sort.dir);
  }, [data, q, cat, sub, status, issue, sort]);

  const shown = rows.slice(page * PAGE, page * PAGE + PAGE);
  const pages = Math.ceil(rows.length / PAGE);
  const allShownSelected = shown.length > 0 && shown.every((p) => selected.has(p.id));
  const chosen = data.products.filter((p) => selected.has(p.id));

  const toggle = (id: string) =>
    setSelected((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  const bulk = async (label: string, change: (p: AdminProduct) => AdminProduct) => {
    setBusy(true);
    try {
      await saveMany(
        "products",
        chosen.map((p) => {
          const { id, ...rest } = change(p);
          return { id, data: { ...rest, id } };
        })
      );
      await reload();
      toast(`${label}: ${chosen.length} product${chosen.length === 1 ? "" : "s"}`);
      setSelected(new Set());
    } catch (e) {
      toast(`Failed: ${(e as Error).message}`, true);
    }
    setBusy(false);
  };

  const bulkDelete = async () => {
    if (!confirm(`Delete ${chosen.length} product(s) permanently? This cannot be undone.`)) return;
    setBusy(true);
    try {
      await remove("products", chosen.map((p) => p.id));
      await reload();
      toast(`Deleted ${chosen.length} product(s)`);
      setSelected(new Set());
    } catch (e) {
      toast(`Failed: ${(e as Error).message}`, true);
    }
    setBusy(false);
  };

  const exportCsv = () => {
    const head = ["id", "name", "category", "subcategory", "status", "price", "image", "specs"];
    const esc = (v: string) => `"${v.replace(/"/g, '""')}"`;
    const lines = rows.map((p) =>
      [p.id, p.name, p.category, p.subcategory ?? "", p.status ?? "", p.price ?? "", p.heroImg ?? "", Object.entries(p.specs ?? {}).map(([k, v]) => `${k}: ${v}`).join("; ")].map((v) => esc(String(v))).join(",")
    );
    const url = URL.createObjectURL(new Blob([[head.join(","), ...lines].join("\n")], { type: "text/csv" }));
    const a = Object.assign(document.createElement("a"), { href: url, download: "nexalight-products.csv" });
    a.click();
    URL.revokeObjectURL(url);
  };

  const th = (key: SortKey, label: string, cls = "") => (
    <th className={`px-3 py-2.5 font-medium text-left ${cls}`}>
      <button onClick={() => setSort((s) => ({ key, dir: s.key === key ? ((-s.dir) as 1 | -1) : 1 }))} className="hover:text-primary">
        {label} {sort.key === key ? (sort.dir === 1 ? "↑" : "↓") : ""}
      </button>
    </th>
  );

  return (
    <>
      <PageHeader
        title="Products"
        subtitle={`${rows.length} of ${data.products.length} products`}
        actions={
          <>
            <Button variant="secondary" onClick={exportCsv}>Export CSV</Button>
            <a href="#/products/new" className="inline-flex items-center h-10 px-4 rounded-lg bg-primary text-white text-sm font-medium">+ Add product</a>
          </>
        }
      />

      <div className="bg-white rounded-xl border border-black/[0.08] p-3 mb-4 grid grid-cols-2 md:grid-cols-6 gap-2">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name or ID…" className={`${inputClass} col-span-2`} />
        <select value={cat} onChange={(e) => (setCat(e.target.value), setSub(""))} className={inputClass}>
          <option value="">All categories</option>
          {categories.map((c) => <option key={c}>{c}</option>)}
        </select>
        <select value={sub} onChange={(e) => setSub(e.target.value)} className={inputClass} disabled={!cat}>
          <option value="">All sub-categories</option>
          {cat && subsFor(cat).map((s) => <option key={s}>{s}</option>)}
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className={inputClass}>
          <option value="">Any status</option>
          <option value="approved">Live</option>
          <option value="draft">Hidden / draft</option>
        </select>
        <select value={issue} onChange={(e) => setIssue(e.target.value)} className={inputClass}>
          <option value="">Any quality</option>
          {ISSUES.map((i) => <option key={i.key} value={i.key}>{i.label}</option>)}
        </select>
      </div>

      {selected.size > 0 && (
        <div className="sticky top-14 lg:top-0 z-20 bg-primary text-white rounded-xl p-3 mb-4 flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium px-2">{selected.size} selected</span>
          <Button variant="secondary" disabled={busy} onClick={() => bulk("Made live", (p) => ({ ...p, status: "approved" }))}>Make live</Button>
          <Button variant="secondary" disabled={busy} onClick={() => bulk("Hidden", (p) => ({ ...p, status: "draft" }))}>Hide</Button>
          <Button variant="secondary" disabled={busy} onClick={() => bulk("Names capitalised", (p) => ({ ...p, name: titleCase(p.name) }))}>Capitalise names</Button>
          <span className="flex items-center gap-2 bg-white/10 rounded-lg p-1">
            <select value={moveTo.cat} onChange={(e) => setMoveTo({ cat: e.target.value, sub: "" })} className={`${inputClass} !h-8 !w-44`}>
              <option value="">Move to category…</option>
              {categories.map((c) => <option key={c}>{c}</option>)}
            </select>
            <select value={moveTo.sub} onChange={(e) => setMoveTo((m) => ({ ...m, sub: e.target.value }))} className={`${inputClass} !h-8 !w-40`} disabled={!moveTo.cat}>
              <option value="">Sub-category…</option>
              {moveTo.cat && subsFor(moveTo.cat).map((s) => <option key={s}>{s}</option>)}
            </select>
            <Button variant="secondary" className="!h-8" disabled={busy || !moveTo.cat || !moveTo.sub} onClick={() => bulk(`Moved to ${moveTo.sub}`, (p) => ({ ...p, category: moveTo.cat, subcategory: moveTo.sub }))}>
              Apply
            </Button>
          </span>
          <Button variant="danger" disabled={busy} onClick={bulkDelete}>Delete</Button>
          <button onClick={() => setSelected(new Set())} className="ml-auto text-sm text-white/70 hover:text-white px-2">Clear</button>
        </div>
      )}

      <div className="bg-white rounded-xl border border-black/[0.08] overflow-x-auto">
        <table className="w-full text-sm min-w-[760px]">
          <thead className="text-xs text-secondary border-b border-black/[0.08] bg-surfaceLight/50">
            <tr>
              <th className="w-10 px-3">
                <input
                  type="checkbox"
                  aria-label="Select all on this page"
                  checked={allShownSelected}
                  onChange={() =>
                    setSelected((s) => {
                      const n = new Set(s);
                      for (const p of shown) {
                        if (allShownSelected) n.delete(p.id);
                        else n.add(p.id);
                      }
                      return n;
                    })
                  }
                />
              </th>
              {th("name", "Product")}
              {th("category", "Category")}
              {th("subcategory", "Sub-category")}
              {th("status", "Status")}
              <th className="px-3 py-2.5" />
            </tr>
          </thead>
          <tbody className="divide-y divide-black/[0.06]">
            {shown.map((p) => (
              <tr key={p.id} className={selected.has(p.id) ? "bg-surfaceLight/70" : "hover:bg-surfaceLight/40"}>
                <td className="px-3">
                  <input type="checkbox" aria-label={`Select ${p.name}`} checked={selected.has(p.id)} onChange={() => toggle(p.id)} />
                </td>
                <td className="px-3 py-2">
                  <a href={`#/products/${encodeURIComponent(p.id)}`} className="flex items-center gap-3 group">
                    <Thumb src={p.heroImg || p.gallery?.[0]} />
                    <span className="min-w-0">
                      <span className="block text-primary font-medium group-hover:underline truncate max-w-[22rem]">{p.name}</span>
                      <span className="block text-xs text-secondary truncate max-w-[22rem]">{p.id}</span>
                    </span>
                  </a>
                </td>
                <td className="px-3 py-2 text-secondary">{p.category}</td>
                <td className="px-3 py-2 text-secondary">{p.subcategory}</td>
                <td className="px-3 py-2">{p.status === "approved" ? <Badge tone="live">Live</Badge> : <Badge tone="draft">Hidden</Badge>}</td>
                <td className="px-3 py-2 text-right whitespace-nowrap">
                  <a href={`#/products/${encodeURIComponent(p.id)}`} className="text-xs font-medium text-primary hover:underline mr-3">Edit</a>
                  <a href={`#/products/${encodeURIComponent(p.id)}/copy`} className="text-xs text-secondary hover:text-primary mr-3">Duplicate</a>
                  {p.status === "approved" && (
                    <a href={`/product/${p.id}`} target="_blank" className="text-xs text-secondary hover:text-primary">View ↗</a>
                  )}
                </td>
              </tr>
            ))}
            {shown.length === 0 && (
              <tr>
                <td colSpan={6} className="px-3 py-16 text-center text-secondary">No products match these filters.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {pages > 1 && (
        <div className="flex items-center justify-between mt-4 text-sm text-secondary">
          <span>
            Page {page + 1} of {pages}
          </span>
          <div className="flex gap-2">
            <Button variant="secondary" disabled={page === 0} onClick={() => setPage((n) => n - 1)}>← Previous</Button>
            <Button variant="secondary" disabled={page >= pages - 1} onClick={() => setPage((n) => n + 1)}>Next →</Button>
          </div>
        </div>
      )}
    </>
  );
}
