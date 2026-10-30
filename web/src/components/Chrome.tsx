import Link from "next/link";
import { Chat, Download, Mail } from "./icons";

export function FloatingActions({ whatsapp }: { whatsapp: string }) {
  return (
    <div className="no-print fixed bottom-6 right-6 md:bottom-8 md:right-8 z-40 flex flex-col gap-3 md:gap-4">
      <a href={whatsapp} target="_blank" rel="noopener" aria-label="WhatsApp" className="w-12 h-12 md:w-14 md:h-14 glass-fab rounded-full flex items-center justify-center">
        <Chat />
      </a>
      <Link href="/contact" aria-label="Contact Studio" className="w-12 h-12 md:w-14 md:h-14 glass-fab rounded-full flex items-center justify-center">
        <Mail />
      </Link>
      <a
        href="/catalogue"
        target="_blank"
        aria-label="Download 2026 Master Catalogue (PDF)"
        className="w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center bg-primary text-white hover:bg-white hover:text-primary transition-all shadow-xl"
      >
        <Download />
      </a>
    </div>
  );
}

const PILLARS = [
  { title: "Specification", text: "Request high-resolution photometrics, IES files, and 3D Revit models for your project planning." },
  { title: "Sustainability", text: "Our commitment to 100% recyclable aluminum housings and zero-plastic packaging by 2026." },
  { title: "Support", text: "Direct engineering support for complex facade narratives and dynamic lighting control systems." },
  { title: "Warranty", text: "Standard 5-year replacement warranty on all electronics, extendable to 15 years for landmark projects." },
];

// Shown above the footer on every page, as on the original site.
export function SupportBanner() {
  return (
    <section className="py-24 md:py-40 px-6 md:px-12 bg-surfaceLight relative overflow-hidden border-t border-black/5">
      <div className="max-w-[100rem] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 items-start">
        {PILLARS.map((p, i) => (
          <div key={p.title} className="anim-fade-up" style={{ transitionDelay: `${i * 100}ms` }}>
            <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-accent mb-6">{p.title}</h4>
            <p className="text-sm text-secondary font-light leading-relaxed">{p.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
