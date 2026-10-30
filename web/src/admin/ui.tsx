"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";
import { media } from "@/lib/site";
import { uploadImage } from "./db";

export const inputClass =
  "w-full h-10 rounded-lg border border-black/15 bg-white px-3 text-sm text-primary outline-none focus:border-primary disabled:bg-surfaceLight disabled:text-secondary";

export function Button({
  variant = "primary",
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "danger" | "ghost" }) {
  const styles = {
    primary: "bg-primary text-white hover:bg-black/80",
    secondary: "bg-white text-primary border border-black/15 hover:border-primary",
    danger: "bg-white text-red-700 border border-red-200 hover:bg-red-50",
    ghost: "text-secondary hover:text-primary hover:bg-surfaceLight",
  }[variant];
  return (
    <button
      type="button"
      {...props}
      className={`inline-flex items-center justify-center gap-2 h-10 px-4 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none ${styles} ${className}`}
    />
  );
}

export function Field({ label, hint, children, className = "" }: { label: string; hint?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="block text-xs font-semibold text-primary mb-1.5">{label}</span>
      {children}
      {hint && <span className="block text-[11px] text-secondary mt-1">{hint}</span>}
    </label>
  );
}

export function Card({ title, actions, children, className = "" }: { title?: string; actions?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <section className={`bg-white rounded-xl border border-black/[0.08] ${className}`}>
      {(title || actions) && (
        <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-black/[0.06]">
          {title && <h2 className="text-sm font-semibold text-primary">{title}</h2>}
          {actions}
        </div>
      )}
      <div className="p-5">{children}</div>
    </section>
  );
}

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-primary">{title}</h1>
        {subtitle && <p className="text-sm text-secondary mt-1">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Badge({ tone = "neutral", children }: { tone?: "neutral" | "live" | "draft" | "warn"; children: React.ReactNode }) {
  const styles = {
    neutral: "bg-surfaceLight text-secondary",
    live: "bg-primary text-white",
    draft: "bg-white text-secondary border border-black/15",
    warn: "bg-amber-50 text-amber-800 border border-amber-200",
  }[tone];
  return <span className={`inline-flex items-center h-6 px-2 rounded-md text-[11px] font-semibold whitespace-nowrap ${styles}`}>{children}</span>;
}

export function Thumb({ src, size = 44 }: { src?: string; size?: number }) {
  return (
    <span className="block shrink-0 rounded-md bg-white border border-black/10 overflow-hidden" style={{ width: size, height: size }}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={media(src)} alt="" loading="lazy" className="w-full h-full object-contain" />
      ) : (
        <span className="w-full h-full flex items-center justify-center text-[10px] text-secondary">—</span>
      )}
    </span>
  );
}

// --- Toasts ---

type Toast = { id: number; text: string; error?: boolean };
const ToastContext = createContext<(text: string, error?: boolean) => void>(() => {});
export const useToast = () => useContext(ToastContext);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const push = useCallback((text: string, error = false) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, text, error }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), error ? 7000 : 3500);
  }, []);
  return (
    <ToastContext.Provider value={push}>
      {children}
      <div className="fixed bottom-4 right-4 z-[200] flex flex-col gap-2 max-w-sm" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`px-4 py-3 rounded-lg shadow-lg text-sm ${t.error ? "bg-red-700 text-white" : "bg-primary text-white"}`}>
            {t.text}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

// --- Image list: upload, reorder, remove; the first image is the main one ---

export function ImagesEditor({ images, onChange, max = 12 }: { images: string[]; onChange: (next: string[]) => void; max?: number }) {
  const toast = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(0);
  const [drag, setDrag] = useState(false);
  const [url, setUrl] = useState("");

  const upload = async (files: FileList | File[]) => {
    const list = Array.from(files).filter((f) => f.type.startsWith("image/")).slice(0, max - images.length);
    if (!list.length) return;
    setBusy(list.length);
    const added: string[] = [];
    for (const f of list) {
      try {
        added.push(await uploadImage(f));
      } catch (e) {
        toast(`Upload failed (${f.name}): ${(e as Error).message}`, true);
      }
      setBusy((n) => n - 1);
    }
    if (added.length) onChange([...images, ...added]);
  };
  const move = (i: number, d: number) => {
    const next = [...images];
    const j = i + d;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };

  return (
    <div>
      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3">
        {images.map((src, i) => (
          <div key={src + i} className="group relative rounded-lg border border-black/10 bg-white overflow-hidden">
            <div className="aspect-square">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={media(src)} alt="" className="w-full h-full object-contain" />
            </div>
            {i === 0 && <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-primary text-white text-[10px] font-semibold">Main</span>}
            <div className="flex border-t border-black/10 text-xs">
              <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="flex-1 h-8 hover:bg-surfaceLight disabled:opacity-30" aria-label="Move left">←</button>
              {i > 0 && (
                <button type="button" onClick={() => onChange([src, ...images.filter((_, k) => k !== i)])} className="flex-1 h-8 hover:bg-surfaceLight" title="Make main image">★</button>
              )}
              <button type="button" onClick={() => move(i, 1)} disabled={i === images.length - 1} className="flex-1 h-8 hover:bg-surfaceLight disabled:opacity-30" aria-label="Move right">→</button>
              <button type="button" onClick={() => onChange(images.filter((_, k) => k !== i))} className="flex-1 h-8 text-red-700 hover:bg-red-50" aria-label="Remove image">✕</button>
            </div>
          </div>
        ))}
        {images.length < max && (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setDrag(true);
            }}
            onDragLeave={() => setDrag(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDrag(false);
              upload(e.dataTransfer.files);
            }}
            className={`aspect-square rounded-lg border-2 border-dashed flex flex-col items-center justify-center gap-1 text-xs text-secondary transition-colors ${drag ? "border-primary bg-surfaceLight" : "border-black/15 hover:border-primary"}`}
          >
            <span className="text-2xl leading-none">+</span>
            {busy ? `Uploading ${busy}…` : "Upload or drop"}
          </button>
        )}
      </div>
      <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={(e) => e.target.files && upload(e.target.files).then(() => (e.target.value = ""))} />
      <div className="flex gap-2 mt-3">
        <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="…or paste an image URL" className={inputClass} />
        <Button
          variant="secondary"
          disabled={!url.trim()}
          onClick={() => {
            onChange([...images, url.trim()]);
            setUrl("");
          }}
        >
          Add
        </Button>
      </div>
      <p className="text-[11px] text-secondary mt-2">The first image is the main product photo. Large photos are resized and converted to WebP automatically.</p>
    </div>
  );
}

export function SingleImage({ value, onChange }: { value?: string; onChange: (v: string) => void }) {
  return <ImagesEditor images={value ? [value] : []} onChange={(l) => onChange(l[l.length - 1] ?? "")} max={1} />;
}
