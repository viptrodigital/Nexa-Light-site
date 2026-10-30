import type { Metadata } from "next";
import { Mail, Phone, WhatsApp } from "@/components/icons";
import { getSeo, getSettings } from "@/lib/data";
import { telHref } from "@/lib/site";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeo("contact");
  return {
    title: seo.title || "Contact & Specify | Request Photometric Planning | NexaLight",
    description:
      seo.description ||
      "Contact our optical engineers for custom photometric simulation, cabling schematics, sample mockups, and architectural specification worldwide.",
    alternates: { canonical: "/contact" },
  };
}

export default async function ContactPage() {
  const s = await getSettings();
  const cards = [
    { href: s.whatsapp, external: true, title: "WhatsApp", value: s.phone, text: "Instant specification help & support", icon: <WhatsApp className="sm:w-7 sm:h-7" />, iconClass: "bg-primary/5 text-primary group-hover:bg-white/10 group-hover:text-white" },
    { href: telHref(s.phone), title: "Call", value: s.phone, text: "Speak directly with our team", icon: <Phone />, iconClass: "bg-primary/5 text-primary group-hover:bg-white/10 group-hover:text-white" },
    { href: `mailto:${s.email}`, title: "Email", value: s.email, text: "Send drawings, photometrics & inquiries", icon: <Mail />, iconClass: "bg-primary/5 text-primary group-hover:bg-white/10 group-hover:text-white" },
  ];

  return (
    <section className="pt-32 md:pt-48 pb-20 px-6 md:px-12 bg-background min-h-screen relative overflow-hidden bg-grid-premium">
      <div className="floating-blob top-[-10%] right-[-10%]" />
      <div className="max-w-[100rem] mx-auto w-full relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">
        <div className="lg:col-span-5 flex flex-col justify-center">
          <h1 className="text-[11px] font-bold uppercase tracking-[0.3em] text-secondary mb-5">Contact NexaLight · Lighting Enquiries &amp; Project Pricing</h1>
          <p className="text-5xl md:text-[7rem] font-medium tracking-tighter mb-6 text-primary leading-none">
            <span className="block clip-text pb-2 md:pb-4"><span>Let&apos;s Talk.</span></span>
          </p>
          <p className="text-lg md:text-xl text-secondary mb-12 font-light leading-relaxed anim-fade-up">
            Whether you are conceptualizing a masterplan or finalizing specifications, our studio is ready to assist.
          </p>
          <div className="mt-8 pt-12 border-t border-black/10 anim-fade-up flex justify-between items-start gap-4" style={{ transitionDelay: "200ms" }}>
            <div>
              <h2 className="text-xl font-medium mb-6">Our Studio</h2>
              <h3 className="text-sm font-semibold uppercase tracking-widest text-primary mb-2">India</h3>
              <p className="text-sm text-secondary leading-relaxed font-light">
                {s.location.split(", ").map((line, i) => (
                  <span key={i} className="block">{line}</span>
                ))}
              </p>
            </div>
            <div className="w-40 h-40 sm:w-48 sm:h-48 rounded-2xl overflow-hidden shadow-premium border border-black/5 flex-shrink-0 relative">
              <iframe
                src={s.mapEmbed}
                title="NexaLight studio location"
                className="w-full h-full border-0 grayscale hover:grayscale-0 transition-all duration-700 absolute inset-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 flex flex-col justify-center gap-4 sm:gap-6 anim-fade-up" style={{ transitionDelay: "300ms" }}>
          {cards.map((c) => (
            <a
              key={c.title}
              href={c.href}
              {...(c.external ? { target: "_blank", rel: "noopener" } : {})}
              className="group bg-white hover:bg-primary hover:text-white p-6 sm:p-8 rounded-[1.5rem] sm:rounded-[2rem] border border-black/5 shadow-premium hover:shadow-premium-dark transition-all duration-500 flex items-center justify-between"
            >
              <div className="flex items-center gap-4 sm:gap-6">
                <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center transition-colors flex-shrink-0 ${c.iconClass}`}>{c.icon}</div>
                <div className="min-w-0">
                  <h4 className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-secondary group-hover:text-white/60 transition-colors">{c.title}</h4>
                  <p className="text-lg sm:text-2xl font-medium tracking-tight break-all">{c.value}</p>
                  <p className="text-[10px] sm:text-xs text-secondary group-hover:text-white/60 transition-colors">{c.text}</p>
                </div>
              </div>
              <span className="text-accent group-hover:translate-x-2 transition-transform duration-300 font-semibold text-lg">→</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
