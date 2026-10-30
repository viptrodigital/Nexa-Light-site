"use client";

import { useState } from "react";
import { remove, save, saveMany } from "../db";
import { useStore } from "../store";
import { Button, Card, PageHeader, inputClass, useToast } from "../ui";

export default function CategoriesPage() {
  const { data, reload } = useStore();
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const [newCat, setNewCat] = useState("");
  const [newSub, setNewSub] = useState<Record<string, string>>({});

  const names = Array.from(new Set([...Object.keys(data.categories), ...data.products.map((p) => p.category)]));
  const count = (c: string, s?: string) => data.products.filter((p) => p.category === c && (s === undefined || p.subcategory === s)).length;
  const subsOf = (c: string) => Array.from(new Set([...(data.categories[c] ?? []), ...data.products.filter((p) => p.category === c).map((p) => p.subcategory ?? "")])).filter(Boolean);

  const run = async (label: string, fn: () => Promise<void>) => {
    setBusy(true);
    try {
      await fn();
      await reload();
      toast(label);
    } catch (e) {
      toast(`Failed: ${(e as Error).message}`, true);
    }
    setBusy(false);
  };
  const saveSubs = (c: string, subs: string[]) => save("categories", c, { subcategories: subs });

  const addCategory = () => {
    const c = newCat.trim();
    if (!c || names.includes(c)) return toast(c ? "That category already exists." : "Enter a name.", true);
    run(`Added ${c}`, async () => {
      await saveSubs(c, []);
      setNewCat("");
    });
  };

  const addSub = (c: string) => {
    const s = (newSub[c] ?? "").trim();
    if (!s || subsOf(c).includes(s)) return toast(s ? "That sub-category already exists." : "Enter a name.", true);
    run(`Added ${s}`, async () => {
      await saveSubs(c, [...subsOf(c), s]);
      setNewSub((m) => ({ ...m, [c]: "" }));
    });
  };

  const renameSub = (c: string, s: string) => {
    const next = prompt(`Rename “${s}” to:`, s)?.trim();
    if (!next || next === s) return;
    const affected = data.products.filter((p) => p.category === c && p.subcategory === s);
    run(`Renamed to ${next} (${affected.length} products updated)`, async () => {
      await saveSubs(c, Array.from(new Set(subsOf(c).map((x) => (x === s ? next : x)))));
      await saveMany("products", affected.map(({ id, ...p }) => ({ id, data: { ...p, id, subcategory: next } })));
    });
  };

  const removeSub = (c: string, s: string) => {
    if (count(c, s)) return toast(`Move or delete the ${count(c, s)} product(s) in “${s}” first.`, true);
    if (!confirm(`Remove sub-category “${s}”?`)) return;
    run(`Removed ${s}`, () => saveSubs(c, subsOf(c).filter((x) => x !== s)));
  };

  const moveSub = (c: string, i: number, d: number) => {
    const list = subsOf(c);
    if (i + d < 0 || i + d >= list.length) return;
    [list[i], list[i + d]] = [list[i + d], list[i]];
    run("Order saved", () => saveSubs(c, list));
  };

  const removeCategory = (c: string) => {
    if (count(c)) return toast(`“${c}” still has ${count(c)} product(s).`, true);
    if (!confirm(`Delete category “${c}”?`)) return;
    run(`Deleted ${c}`, () => remove("categories", [c]));
  };

  return (
    <>
      <PageHeader title="Categories" subtitle="Renaming a sub-category also updates every product in it." />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {names.map((c) => (
          <Card
            key={c}
            title={`${c} · ${count(c)} products`}
            actions={
              !count(c) && (
                <Button variant="ghost" className="!h-8 text-red-700" disabled={busy} onClick={() => removeCategory(c)}>Delete</Button>
              )
            }
          >
            <ul className="divide-y divide-black/[0.06] mb-4">
              {subsOf(c).map((s, i) => (
                <li key={s} className="flex items-center gap-2 py-2">
                  <span className="flex-1 text-sm text-primary">{s}</span>
                  <a href={`#/products?cat=${encodeURIComponent(c)}&sub=${encodeURIComponent(s)}`} className="text-xs text-secondary hover:text-primary hover:underline w-20 text-right">
                    {count(c, s)} products
                  </a>
                  <Button variant="ghost" className="!h-8 !px-2" disabled={busy} onClick={() => moveSub(c, i, -1)} aria-label="Move up">↑</Button>
                  <Button variant="ghost" className="!h-8 !px-2" disabled={busy} onClick={() => moveSub(c, i, 1)} aria-label="Move down">↓</Button>
                  <Button variant="ghost" className="!h-8" disabled={busy} onClick={() => renameSub(c, s)}>Rename</Button>
                  <Button variant="ghost" className="!h-8 !px-2 text-red-700" disabled={busy} onClick={() => removeSub(c, s)} aria-label={`Remove ${s}`}>✕</Button>
                </li>
              ))}
            </ul>
            <div className="flex gap-2">
              <input
                value={newSub[c] ?? ""}
                onChange={(e) => setNewSub((m) => ({ ...m, [c]: e.target.value }))}
                onKeyDown={(e) => e.key === "Enter" && addSub(c)}
                placeholder="New sub-category"
                className={inputClass}
              />
              <Button variant="secondary" disabled={busy} onClick={() => addSub(c)}>Add</Button>
            </div>
          </Card>
        ))}
        <Card title="Add a category">
          <p className="text-xs text-secondary mb-3">The four main divisions have their own pages on the website. A new category appears in the product filters.</p>
          <div className="flex gap-2">
            <input value={newCat} onChange={(e) => setNewCat(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addCategory()} placeholder="Category name" className={inputClass} />
            <Button disabled={busy} onClick={addCategory}>Add</Button>
          </div>
        </Card>
      </div>
    </>
  );
}
