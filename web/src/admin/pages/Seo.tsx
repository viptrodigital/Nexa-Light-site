"use client";

import { useState } from "react";
import { save } from "../db";
import { useStore } from "../store";
import { Button, Card, Field, PageHeader, inputClass, useToast } from "../ui";

const PAGES = [
  { id: "home", label: "Home", path: "/" },
  { id: "products", label: "Products", path: "/products" },
  { id: "gallery", label: "Gallery", path: "/gallery" },
  { id: "blog", label: "Blog", path: "/blog" },
  { id: "about", label: "About Us", path: "/about" },
  { id: "contact", label: "Contact", path: "/contact" },
];

export default function SeoPage() {
  const { data, reload } = useStore();
  const toast = useToast();
  const [values, setValues] = useState(() => Object.fromEntries(PAGES.map((p) => [p.id, { title: data.seo[p.id]?.title ?? "", description: data.seo[p.id]?.description ?? "" }])));
  const [busy, setBusy] = useState("");

  const submit = async (id: string) => {
    setBusy(id);
    try {
      await save("seo_settings", id, { ...values[id], updatedAt: new Date().toISOString() });
      await reload();
      toast("SEO saved");
    } catch (e) {
      toast(`Save failed: ${(e as Error).message}`, true);
    }
    setBusy("");
  };

  return (
    <>
      <PageHeader title="SEO" subtitle="Title and description Google shows for each page. Leave empty to use the built-in text. Product SEO is set on each product." />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {PAGES.map((p) => {
          const v = values[p.id];
          const set = (k: "title" | "description", val: string) => setValues((all) => ({ ...all, [p.id]: { ...all[p.id], [k]: val } }));
          return (
            <Card key={p.id} title={p.label} actions={<a href={p.path} target="_blank" className="text-xs text-secondary hover:text-primary">{p.path} ↗</a>}>
              <div className="space-y-3">
                <Field label="Title" hint={<span className={v.title.length > 60 ? "text-red-700" : ""}>{v.title.length}/60</span>}>
                  <input value={v.title} onChange={(e) => set("title", e.target.value)} className={inputClass} />
                </Field>
                <Field label="Description" hint={<span className={v.description.length > 160 ? "text-red-700" : ""}>{v.description.length}/160</span>}>
                  <textarea value={v.description} onChange={(e) => set("description", e.target.value)} rows={3} className={`${inputClass} !h-auto py-2`} />
                </Field>
                <Button disabled={busy === p.id} onClick={() => submit(p.id)}>{busy === p.id ? "Saving…" : "Save"}</Button>
              </div>
            </Card>
          );
        })}
      </div>
    </>
  );
}
