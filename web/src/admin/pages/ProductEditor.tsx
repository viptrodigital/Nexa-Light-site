"use client";

import { useEffect, useMemo, useState } from "react";
import { go } from "../AdminApp";
import { remove, save, slugify } from "../db";
import { useStore, type AdminProduct } from "../store";
import { Button, Card, Field, ImagesEditor, PageHeader, inputClass, useToast } from "../ui";

type Spec = { k: string; v: string };

// "Key: Value", "Key - Value" or tab-separated lines → spec rows.
function parseSpecs(text: string): Spec[] {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const m = line.match(/^(.+?)\s*(?:\t|:|\s[-–]\s)\s*(.+)$/);
      return m ? { k: m[1].trim(), v: m[2].trim() } : { k: line, v: "" };
    });
}

export default function ProductEditor({ id, copyFrom }: { id: string | null; copyFrom?: string }) {
  const { data, reload } = useStore();
  const toast = useToast();
  const source = data.products.find((p) => p.id === (copyFrom ?? id));
  const isNew = !id || !!copyFrom;

  const [name, setName] = useState(source ? (copyFrom ? `${source.name} (copy)` : source.name) : "");
  const [slug, setSlug] = useState(isNew ? "" : (id as string));
  const [slugTouched, setSlugTouched] = useState(false);
  const [category, setCategory] = useState(source?.category ?? Object.keys(data.categories)[0] ?? "");
  const [subcategory, setSubcategory] = useState(source?.subcategory ?? "");
  const [status, setStatus] = useState(copyFrom ? "draft" : source?.status ?? "approved");
  const [price, setPrice] = useState(source?.price ?? "");
  const [desc, setDesc] = useState(source?.desc ?? "");
  const [features, setFeatures] = useState((source?.features ?? []).join("\n"));
  const [specs, setSpecs] = useState<Spec[]>(Object.entries(source?.specs ?? {}).map(([k, v]) => ({ k, v })));
  const [images, setImages] = useState<string[]>(Array.from(new Set([source?.heroImg, ...(source?.gallery ?? [])].filter(Boolean) as string[])));
  const [seoTitle, setSeoTitle] = useState(source?.seoTitle ?? "");
  const [seoDesc, setSeoDesc] = useState(source?.seoDesc ?? "");
  const [paste, setPaste] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [dirty, setDirty] = useState(false);

  // Any edit marks the form dirty so leaving the page asks first.
  useEffect(() => setDirty(true), [name, category, subcategory, status, price, desc, features, specs, images, seoTitle, seoDesc]);
  useEffect(() => setDirty(false), []);
  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => {
      if (dirty) e.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const finalId = isNew ? slugify(slugTouched ? slug : name) : (id as string);
  const idTaken = isNew && data.products.some((p) => p.id === finalId);
  const categories = useMemo(() => Array.from(new Set([...Object.keys(data.categories), ...data.products.map((p) => p.category)])), [data]);
  const subs = Array.from(new Set([...(data.categories[category] ?? []), ...data.products.filter((p) => p.category === category).map((p) => p.subcategory ?? "")])).filter(Boolean);

  if (!isNew && !source) {
    return (
      <Card>
        <p className="text-sm text-secondary mb-4">Product “{id}” was not found.</p>
        <a href="#/products" className="text-sm underline">Back to products</a>
      </Card>
    );
  }

  const back = () => {
    if (dirty && !confirm("Discard unsaved changes?")) return;
    if (history.length > 1) history.back();
    else go("products");
  };

  const submit = async (andNew = false) => {
    if (!name.trim()) return toast("Please enter a product name.", true);
    if (!finalId) return toast("Please enter a valid ID.", true);
    if (idTaken) return toast(`ID “${finalId}” is already used by another product.`, true);
    if (!category || !subcategory) return toast("Choose a category and sub-category.", true);
    setBusy(true);
    const product: AdminProduct = {
      ...(copyFrom ? {} : source),
      id: finalId,
      name: name.trim(),
      category,
      subcategory,
      status,
      price: price.trim(),
      desc: desc.trim(),
      features: features.split(/\r?\n/).map((f) => f.trim()).filter(Boolean),
      specs: Object.fromEntries(specs.filter((s) => s.k.trim() && s.v.trim()).map((s) => [s.k.trim(), s.v.trim()])),
      heroImg: images[0] ?? "",
      signatureImg: images[0] ?? "",
      gallery: images.slice(1),
      seoTitle: seoTitle.trim(),
      seoDesc: seoDesc.trim(),
    };
    try {
      await save("products", finalId, product);
      await reload();
      setDirty(false);
      toast(isNew ? "Product created" : "Product saved");
      if (andNew) go("products/new");
      else if (isNew) go(`products/${encodeURIComponent(finalId)}`);
    } catch (e) {
      toast(`Save failed: ${(e as Error).message}`, true);
    }
    setBusy(false);
  };

  const del = async () => {
    if (!confirm(`Delete “${name}” permanently? This cannot be undone.`)) return;
    setBusy(true);
    try {
      await remove("products", [id as string]);
      await reload();
      setDirty(false);
      toast("Product deleted");
      go("products");
    } catch (e) {
      toast(`Delete failed: ${(e as Error).message}`, true);
      setBusy(false);
    }
  };

  const setSpec = (i: number, patch: Partial<Spec>) => setSpecs((s) => s.map((row, k) => (k === i ? { ...row, ...patch } : row)));
  const moveSpec = (i: number, d: number) =>
    setSpecs((s) => {
      const n = [...s];
      if (i + d < 0 || i + d >= n.length) return s;
      [n[i], n[i + d]] = [n[i + d], n[i]];
      return n;
    });

  const actions = (
    <>
      <Button variant="secondary" onClick={back}>← Back</Button>
      {!isNew && status === "approved" && (
        <a href={`/product/${id}`} target="_blank" className="inline-flex items-center h-10 px-4 rounded-lg border border-black/15 bg-white text-sm font-medium text-primary hover:border-primary">View ↗</a>
      )}
      {isNew && <Button variant="secondary" disabled={busy} onClick={() => submit(true)}>Save & add another</Button>}
      <Button disabled={busy} onClick={() => submit()}>{busy ? "Saving…" : "Save product"}</Button>
    </>
  );

  return (
    <>
      <PageHeader title={isNew ? (copyFrom ? "Duplicate product" : "New product") : name || "Edit product"} subtitle={isNew ? undefined : `ID: ${id}`} actions={actions} />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        <div className="xl:col-span-2 space-y-6">
          <Card title="Basic information">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Product name *" className="md:col-span-2">
                <input value={name} onChange={(e) => setName(e.target.value)} className={inputClass} placeholder="e.g. Bollard BL-001" />
              </Field>
              <Field
                label="URL / ID"
                hint={isNew ? <>Page address: /product/{finalId || "…"} {idTaken && <b className="text-red-700">— already in use</b>}</> : "The ID can't be changed after creation."}
              >
                <input
                  value={isNew ? (slugTouched ? slug : finalId) : (id as string)}
                  disabled={!isNew}
                  onChange={(e) => {
                    setSlugTouched(true);
                    setSlug(e.target.value);
                  }}
                  className={inputClass}
                />
              </Field>
              <Field label="Price" hint="Leave empty to show “Price on request”.">
                <input value={price} onChange={(e) => setPrice(e.target.value)} className={inputClass} placeholder="e.g. ₹4,500 / piece" />
              </Field>
              <Field label="Category *">
                <select value={category} onChange={(e) => (setCategory(e.target.value), setSubcategory(""))} className={inputClass}>
                  {categories.map((c) => <option key={c}>{c}</option>)}
                </select>
              </Field>
              <Field label="Sub-category *" hint={<a href="#/categories" className="underline">Manage categories</a>}>
                <select value={subcategory} onChange={(e) => setSubcategory(e.target.value)} className={inputClass}>
                  <option value="">Choose…</option>
                  {subs.map((s) => <option key={s}>{s}</option>)}
                </select>
              </Field>
              <Field label="Description" className="md:col-span-2" hint={`${desc.length} characters`}>
                <textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={5} className={`${inputClass} !h-auto py-2`} />
              </Field>
            </div>
          </Card>

          <Card title="Photos">
            <ImagesEditor images={images} onChange={setImages} />
          </Card>

          <Card
            title={`Specifications (${specs.filter((s) => s.k && s.v).length})`}
            actions={
              <div className="flex gap-2">
                <Button variant="ghost" className="!h-8" onClick={() => setPaste(paste === null ? "" : null)}>Paste list</Button>
                <Button variant="secondary" className="!h-8" onClick={() => setSpecs((s) => [...s, { k: "", v: "" }])}>+ Row</Button>
              </div>
            }
          >
            {paste !== null && (
              <div className="mb-4 p-3 rounded-lg bg-surfaceLight">
                <textarea
                  value={paste}
                  onChange={(e) => setPaste(e.target.value)}
                  rows={6}
                  placeholder={"One per line, e.g.\nPower: 12W\nIP Rating: IP65\nBeam Angle\t120°"}
                  className={`${inputClass} !h-auto py-2 font-mono text-xs`}
                />
                <div className="flex gap-2 mt-2">
                  <Button className="!h-8" onClick={() => (setSpecs((s) => [...s.filter((r) => r.k || r.v), ...parseSpecs(paste)]), setPaste(null))}>Add rows</Button>
                  <Button variant="ghost" className="!h-8" onClick={() => setPaste(null)}>Cancel</Button>
                </div>
              </div>
            )}
            {specs.length === 0 ? (
              <p className="text-sm text-secondary">No specifications yet. Add rows or paste a list.</p>
            ) : (
              <div className="space-y-2">
                {specs.map((s, i) => (
                  <div key={i} className="flex gap-2">
                    <input value={s.k} onChange={(e) => setSpec(i, { k: e.target.value })} placeholder="Name (e.g. Power)" className={`${inputClass} w-2/5`} />
                    <input value={s.v} onChange={(e) => setSpec(i, { v: e.target.value })} placeholder="Value (e.g. 12W)" className={inputClass} />
                    <Button variant="ghost" className="!px-2" onClick={() => moveSpec(i, -1)} aria-label="Move up">↑</Button>
                    <Button variant="ghost" className="!px-2" onClick={() => moveSpec(i, 1)} aria-label="Move down">↓</Button>
                    <Button variant="ghost" className="!px-2 text-red-700" onClick={() => setSpecs((r) => r.filter((_, k) => k !== i))} aria-label="Remove row">✕</Button>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card title={`Key features (${features.split(/\n/).filter((f) => f.trim()).length})`}>
            <textarea value={features} onChange={(e) => setFeatures(e.target.value)} rows={7} placeholder="One feature per line" className={`${inputClass} !h-auto py-2`} />
          </Card>
        </div>

        <div className="space-y-6 xl:sticky xl:top-6">
          <Card title="Visibility">
            <div className="grid grid-cols-2 gap-2">
              {[
                ["approved", "Live", "Shown on website"],
                ["draft", "Hidden", "Saved as draft"],
              ].map(([v, label, hint]) => (
                <button
                  key={v}
                  onClick={() => setStatus(v)}
                  className={`text-left p-3 rounded-lg border transition-colors ${status === v ? "border-primary bg-primary text-white" : "border-black/15 hover:border-primary"}`}
                >
                  <span className="block text-sm font-semibold">{label}</span>
                  <span className={`block text-[11px] ${status === v ? "text-white/70" : "text-secondary"}`}>{hint}</span>
                </button>
              ))}
            </div>
          </Card>

          <Card title="Search engine (SEO)">
            <div className="space-y-4">
              <Field label="SEO title" hint={<span className={seoTitle.length > 60 ? "text-red-700" : ""}>{seoTitle.length}/60 characters</span>}>
                <input value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} placeholder={`${name} | NexaLight`} className={inputClass} />
              </Field>
              <Field label="SEO description" hint={<span className={seoDesc.length > 160 ? "text-red-700" : ""}>{seoDesc.length}/160 characters</span>}>
                <textarea value={seoDesc} onChange={(e) => setSeoDesc(e.target.value)} rows={4} className={`${inputClass} !h-auto py-2`} />
              </Field>
              <div className="rounded-lg border border-black/10 p-3">
                <p className="text-[11px] text-secondary mb-1">Google preview</p>
                <p className="text-[15px] text-[#1a0dab] leading-snug truncate">{seoTitle || `${name || "Product name"} | NexaLight`}</p>
                <p className="text-xs text-[#006621] truncate">nexalight.in/product/{finalId || "…"}</p>
                <p className="text-xs text-secondary line-clamp-2 mt-0.5">{seoDesc || desc || "Add a description to show here."}</p>
              </div>
            </div>
          </Card>

          {!isNew && (
            <Card title="More actions">
              <div className="flex flex-wrap gap-2">
                <a href={`#/products/${encodeURIComponent(id as string)}/copy`} className="inline-flex items-center h-10 px-4 rounded-lg border border-black/15 bg-white text-sm font-medium text-primary hover:border-primary">Duplicate</a>
                <Button variant="danger" disabled={busy} onClick={del}>Delete product</Button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
