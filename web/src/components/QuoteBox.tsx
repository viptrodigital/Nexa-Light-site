"use client";

import { useState } from "react";
import { Mail, WhatsApp } from "./icons";

// B2B enquiry: quantity + project name, sent as a prefilled WhatsApp message or email.
export default function QuoteBox({ name, model, url, whatsapp, email }: { name: string; model: string; url: string; whatsapp: string; email: string }) {
  const [qty, setQty] = useState(10);
  const [project, setProject] = useState("");
  const message = [
    `Hello NexaLight, I would like a quotation for:`,
    `Product: ${name}`,
    `Model: ${model}`,
    `Quantity: ${qty} pcs`,
    project && `Project / location: ${project}`,
    url,
  ]
    .filter(Boolean)
    .join("\n");
  const waHref = `${whatsapp}${whatsapp.includes("?") ? "&" : "?"}text=${encodeURIComponent(message)}`;
  const mailHref = `mailto:${email}?subject=${encodeURIComponent(`Quotation request: ${name} (${model})`)}&body=${encodeURIComponent(message)}`;
  const set = (n: number) => setQty(Math.max(1, Math.min(99999, Math.round(n) || 1)));

  return (
    <div className="rounded-2xl border border-black/10 bg-white p-5 md:p-6">
      <div className="grid grid-cols-1 sm:grid-cols-[auto_1fr] gap-4 mb-5">
        <label className="block">
          <span className="block text-[10px] font-bold uppercase tracking-widest text-secondary mb-2">Quantity (pcs)</span>
          <div className="flex items-center h-12 rounded-xl border border-black/15 overflow-hidden w-full sm:w-40">
            <button type="button" onClick={() => set(qty - 1)} aria-label="Decrease quantity" className="w-12 h-full text-lg text-primary hover:bg-surfaceLight">−</button>
            <input
              type="number"
              inputMode="numeric"
              min={1}
              value={qty}
              onChange={(e) => set(Number(e.target.value))}
              className="flex-1 min-w-0 h-full text-center text-sm font-semibold text-primary outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
            />
            <button type="button" onClick={() => set(qty + 1)} aria-label="Increase quantity" className="w-12 h-full text-lg text-primary hover:bg-surfaceLight">+</button>
          </div>
        </label>
        <label className="block">
          <span className="block text-[10px] font-bold uppercase tracking-widest text-secondary mb-2">Project / city (optional)</span>
          <input
            value={project}
            onChange={(e) => setProject(e.target.value)}
            placeholder="e.g. Hotel facade, Mumbai"
            className="w-full h-12 rounded-xl border border-black/15 px-4 text-sm text-primary outline-none focus:border-primary"
          />
        </label>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <a href={waHref} target="_blank" rel="noopener" className="h-12 rounded-xl bg-primary text-white text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-black/80 transition-colors">
          <WhatsApp size={18} /> Get Quote on WhatsApp
        </a>
        <a href={mailHref} className="h-12 rounded-xl border border-primary text-primary text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-primary hover:text-white transition-colors">
          <Mail size={18} /> Email Enquiry
        </a>
      </div>
      <p className="text-[11px] text-secondary mt-4 leading-relaxed">Project &amp; bulk pricing shared within one business day. Custom wattage, CCT, beam angle and finish available on order.</p>
    </div>
  );
}
