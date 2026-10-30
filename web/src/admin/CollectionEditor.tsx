"use client";

import { useState } from "react";
import { remove, save, slugify } from "./db";
import { Button, Card, Field, PageHeader, SingleImage, Thumb, inputClass, useToast } from "./ui";

export type FieldDef = {
  key: string;
  label: string;
  type?: "text" | "textarea" | "image" | "date" | "longtext";
  hint?: string;
  wide?: boolean;
  required?: boolean;
};

type Item = { id: string } & Record<string, unknown>;

// Generic list + form editor for simple collections (gallery projects, blog posts).
export default function CollectionEditor({
  collection,
  title,
  subtitle,
  items: rawItems,
  fields,
  titleKey,
  imageKey,
  meta,
  viewUrl,
  idFromTitle = true,
  beforeSave = (d) => d,
  reload,
}: {
  collection: string;
  title: string;
  subtitle?: string;
  items: { id: string }[];
  fields: FieldDef[];
  titleKey: string;
  imageKey?: string;
  meta?: (item: Item) => string;
  viewUrl?: (id: string) => string;
  idFromTitle?: boolean;
  beforeSave?: (data: Record<string, unknown>) => Record<string, unknown>;
  reload: () => Promise<void>;
}) {
  const items = rawItems as Item[];
  const toast = useToast();
  const [editing, setEditing] = useState<Item | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [busy, setBusy] = useState(false);
  const [q, setQ] = useState("");

  const open = (item: Item | null) => {
    setIsNew(!item);
    setEditing(item ? { ...item } : { id: "" });
    window.scrollTo(0, 0);
  };

  const submit = async () => {
    if (!editing) return;
    for (const f of fields) if (f.required && !String(editing[f.key] ?? "").trim()) return toast(`${f.label} is required.`, true);
    const id = isNew ? slugify(String(editing.id || (idFromTitle ? editing[titleKey] : "") || Date.now())) : editing.id;
    if (isNew && items.some((i) => i.id === id)) return toast(`“${id}” already exists. Change the title or ID.`, true);
    setBusy(true);
    try {
      const rest: Record<string, unknown> = { ...editing };
      delete rest.slug;
      await save(collection, id, beforeSave({ ...rest, id }));
      await reload();
      toast("Saved");
      setEditing(null);
    } catch (e) {
      toast(`Save failed: ${(e as Error).message}`, true);
    }
    setBusy(false);
  };

  const del = async (item: Item) => {
    if (!confirm(`Delete “${String(item[titleKey] ?? item.id)}” permanently?`)) return;
    setBusy(true);
    try {
      await remove(collection, [item.id]);
      await reload();
      toast("Deleted");
      setEditing(null);
    } catch (e) {
      toast(`Delete failed: ${(e as Error).message}`, true);
    }
    setBusy(false);
  };

  if (editing) {
    const set = (k: string, v: unknown) => setEditing((e) => (e ? { ...e, [k]: v } : e));
    return (
      <>
        <PageHeader
          title={isNew ? `New ${title.toLowerCase().replace(/s$/, "")}` : String(editing[titleKey] || "Edit")}
          actions={
            <>
              <Button variant="secondary" onClick={() => setEditing(null)}>← Back</Button>
              <Button disabled={busy} onClick={submit}>{busy ? "Saving…" : "Save"}</Button>
            </>
          }
        />
        <Card>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="URL / ID" hint={isNew ? "Leave empty to create it from the title." : "Can't be changed after creation."}>
              <input value={editing.id} disabled={!isNew} onChange={(e) => set("id", e.target.value)} className={inputClass} />
            </Field>
            {fields.map((f) => (
              <Field key={f.key} label={`${f.label}${f.required ? " *" : ""}`} hint={f.hint} className={f.wide || f.type === "textarea" || f.type === "longtext" || f.type === "image" ? "md:col-span-2" : ""}>
                {f.type === "image" ? (
                  <SingleImage value={String(editing[f.key] ?? "")} onChange={(v) => set(f.key, v)} />
                ) : f.type === "textarea" || f.type === "longtext" ? (
                  <textarea value={String(editing[f.key] ?? "")} onChange={(e) => set(f.key, e.target.value)} rows={f.type === "longtext" ? 18 : 4} className={`${inputClass} !h-auto py-2 ${f.type === "longtext" ? "font-mono text-xs" : ""}`} />
                ) : (
                  <input type={f.type === "date" ? "date" : "text"} value={String(editing[f.key] ?? "")} onChange={(e) => set(f.key, e.target.value)} className={inputClass} />
                )}
              </Field>
            ))}
          </div>
        </Card>
        {!isNew && (
          <div className="mt-6">
            <Button variant="danger" disabled={busy} onClick={() => del(editing)}>Delete</Button>
          </div>
        )}
      </>
    );
  }

  const term = q.trim().toLowerCase();
  const shown = items.filter((i) => !term || JSON.stringify(i).toLowerCase().includes(term));

  return (
    <>
      <PageHeader title={title} subtitle={subtitle} actions={<Button onClick={() => open(null)}>+ Add new</Button>} />
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search…" className={`${inputClass} mb-4 max-w-sm`} />
      <div className="bg-white rounded-xl border border-black/[0.08] divide-y divide-black/[0.06]">
        {shown.map((item) => (
          <div key={item.id} className="flex items-center gap-3 p-3">
            {imageKey && <Thumb src={item[imageKey] as string | undefined} size={56} />}
            <button onClick={() => open(item)} className="flex-1 min-w-0 text-left">
              <span className="block text-sm font-medium text-primary truncate hover:underline">{String(item[titleKey] || item.id)}</span>
              {meta && <span className="block text-xs text-secondary truncate">{meta(item)}</span>}
            </button>
            {viewUrl && (
              <a href={viewUrl(item.id)} target="_blank" className="text-xs text-secondary hover:text-primary">View ↗</a>
            )}
            <Button variant="secondary" className="!h-8" onClick={() => open(item)}>Edit</Button>
          </div>
        ))}
        {shown.length === 0 && <p className="p-8 text-center text-sm text-secondary">Nothing here yet.</p>}
      </div>
    </>
  );
}
