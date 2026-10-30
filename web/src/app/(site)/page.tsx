import Image from "next/image";
import Link from "next/link";
import HeroCarousel from "@/components/HeroCarousel";
import InstrumentsScroller from "@/components/InstrumentsScroller";
import GalleryGrid from "@/components/GalleryGrid";
import { BlogCard } from "@/components/cards";
import { getBlogArticles, getGallery, getProducts } from "@/lib/data";
import { DIVISIONS } from "@/lib/divisions";
import { media } from "@/lib/site";

export const revalidate = 60;

export default async function HomePage() {
  const [products, gallery, articles] = await Promise.all([getProducts(), getGallery(), getBlogArticles()]);

  return (
    <>
      <HeroCarousel />

      <section className="py-20 md:py-32 px-6 md:px-12 bg-white relative overflow-hidden border-b border-black/5">
        <div className="max-w-[100rem] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-16 items-end mb-12 md:mb-16 anim-fade-up">
            <div className="lg:col-span-7">
              <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] mb-5 text-accent">Our Divisions</h2>
              <p className="text-4xl md:text-6xl font-medium tracking-tight text-primary leading-[1.05]">Four disciplines.<br />One standard of light.</p>
            </div>
            <p className="lg:col-span-5 text-secondary font-light text-lg leading-relaxed">
              From the building envelope to the garden path and the rooms within, every NexaLight product belongs to one of four specialist divisions.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
            {DIVISIONS.map((d, i) => {
              const items = products.filter((p) => p.category === d.category);
              return (
                <Link
                  key={d.slug}
                  href={`/products/${d.slug}`}
                  className="group flex flex-col rounded-[1.75rem] overflow-hidden bg-background border border-black/5 hover:shadow-premium-hover transition-shadow duration-500 anim-fade-up"
                  style={{ transitionDelay: `${i * 80}ms` }}
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-skeleton">
                    <Image src={media(items.find((p) => p.heroImg)?.heroImg)} alt={d.category} fill sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
                    <span className="absolute top-5 left-5 text-[11px] font-bold text-white bg-black/40 rounded-full px-3 py-1">{d.number}</span>
                  </div>
                  <div className="flex-1 flex flex-col p-6 md:p-7">
                    <h3 className="text-xl md:text-2xl font-medium tracking-tight text-primary mb-2 group-hover:text-accent transition-colors">{d.category}</h3>
                    <p className="text-sm text-secondary font-light leading-relaxed mb-6">{d.tagline}</p>
                    <div className="mt-auto flex items-center justify-between pt-5 border-t border-black/5 text-xs font-bold uppercase tracking-widest">
                      <span className="text-secondary">{items.length} products</span>
                      <span className="text-primary group-hover:translate-x-1 transition-transform">Explore →</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="pt-20 pb-16 md:pt-40 md:pb-20 px-0 md:px-12 bg-background relative z-10 overflow-hidden border-b border-black/5 bg-grid-premium">
        <div className="hero-bg-text" style={{ top: "20%", fontSize: "20vw" }}>PRECISION</div>
        <InstrumentsScroller header={<h2 className="text-4xl md:text-[5rem] font-medium tracking-tighter text-primary leading-none">Optical<br />Instruments.</h2>}>
          {products.slice(0, 8).map((p) => (
            <div key={p.id} className="min-w-[75vw] md:min-w-[420px] snap-start">
              <Link href={`/product/${p.id}`} className="block group" draggable={false}>
                <div className="aspect-square overflow-hidden rounded-[1.5rem] md:rounded-[2rem] mb-4 md:mb-6 shadow-premium transition-all duration-700 group-hover:shadow-premium-dark relative bg-skeleton">
                  <Image src={media(p.heroImg)} alt={p.name} fill sizes="(min-width: 768px) 420px, 75vw" className="object-cover transition-transform duration-1000 scale-105 group-hover:scale-100" />
                  <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors duration-500" />
                </div>
                <h3 className="text-xl md:text-2xl font-medium tracking-tight mb-1 md:mb-2 text-primary group-hover:text-accent transition-colors">{p.name}</h3>
                <p className="text-secondary font-light text-xs md:text-sm uppercase tracking-widest">{p.category}</p>
              </Link>
            </div>
          ))}
        </InstrumentsScroller>
      </section>


      <section className="py-24 md:py-48 px-6 md:px-12 bg-background relative border-t border-black/5">
        <div className="max-w-[100rem] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          <div className="lg:col-span-5 anim-fade-up">
            <h2 className="text-xs font-semibold uppercase tracking-widest mb-4 text-accent">Our Philosophy</h2>
            <h3 className="text-4xl md:text-7xl font-medium tracking-tight text-primary leading-[0.9] mb-8">Light is a<br />Language.</h3>
            <p className="text-lg md:text-xl text-secondary font-light leading-relaxed mb-10">
              We believe that lighting should not just illuminate; it should narrate. Every shadow, every highlight, and every gradient is a word in the architectural story.
            </p>
            <div className="flex flex-col gap-6">
              {[
                ["01", "Stealth Design", "Instruments that disappear into the architecture, leaving only the effect of light."],
                ["02", "Human Centric", "Optimized for visual comfort and the biological rhythms of the inhabitants."],
              ].map(([n, t, d]) => (
                <div key={n} className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-surface text-primary flex items-center justify-center shrink-0">{n}</div>
                  <div>
                    <h4 className="font-medium text-lg mb-1">{t}</h4>
                    <p className="text-secondary text-sm font-light">{d}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="lg:col-span-7 relative anim-fade-up" style={{ transitionDelay: "200ms" }}>
            <div className="aspect-[16/10] rounded-[3rem] overflow-hidden shadow-premium-dark bg-surface relative">
              <Image src={media("images/lang.png")} alt="Architectural lighting by NexaLight" fill sizes="(min-width: 1024px) 58vw, 100vw" className="object-cover" />
            </div>
            <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-[radial-gradient(circle,rgba(0,0,0,0.08),transparent_70%)]" />
          </div>
        </div>
      </section>

      <section className="py-24 md:py-48 px-6 bg-background relative overflow-hidden border-b border-black/5 bg-grid-premium">
        <div className="hero-bg-text" style={{ top: "10%", fontSize: "15vw" }}>MASTERY</div>
        <div className="max-w-[100rem] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="anim-fade-up">
            <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-accent mb-8">Technical Excellence</h2>
            <h3 className="text-4xl md:text-[5rem] font-medium tracking-tighter text-primary leading-none mb-10">Engineering<br />The Dark.</h3>
            <p className="text-lg text-secondary font-light leading-relaxed mb-12">
              At NexaLight, we believe that the mastery of light begins with a profound understanding of darkness. Our research laboratory in Ganaur is dedicated to the study of photometrics, thermal management, and architectural integration.
            </p>
            <Link href="/about" className="btn-premium px-10 py-5 rounded-full text-xs font-bold tracking-widest uppercase">Our Process</Link>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:gap-6 anim-fade-up" style={{ transitionDelay: "200ms" }}>
            {[
              ["0.1µ", "Tolerance"],
              ["15yr", "Warranty Opt."],
              ["IP68+", "Ingress Prot."],
              ["100%", "Recyclable"],
            ].map(([v, l]) => (
              <div key={l} className="p-6 sm:p-10 rounded-[2rem] sm:rounded-[2.5rem] bg-white shadow-premium border border-black/5">
                <span className="block text-3xl sm:text-4xl font-medium text-primary mb-2">{v}</span>
                <span className="text-[10px] uppercase tracking-widest text-secondary font-bold">{l}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 md:py-36 px-6 md:px-12 bg-surfaceLight border-t border-black/5 relative overflow-hidden">
        <div className="max-w-[100rem] mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-accent block mb-3">Portfolio Highlights</span>
              <h2 className="text-3xl sm:text-5xl md:text-6xl font-medium tracking-tight text-primary">Landmark Installations.</h2>
            </div>
            <Link href="/gallery" className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-primary text-white text-xs font-bold uppercase tracking-widest hover:bg-accent hover:text-primary transition-all shadow-xl self-start md:self-auto">
              <span>Explore All Installations</span>
              <span>→</span>
            </Link>
          </div>
          <GalleryGrid projects={gallery} limit={3} rounded="rounded-[2.5rem]" />
        </div>
      </section>

      <section className="py-20 px-6 md:px-12 bg-primary text-white relative overflow-hidden">
        <div className="max-w-[100rem] mx-auto rounded-[3rem] bg-gradient-to-r from-[#222] via-[#1a1a1a] to-primary border border-white/10 p-10 md:p-16 shadow-premium-dark flex flex-col lg:flex-row items-center justify-between gap-10 relative overflow-hidden group">
          <div className="absolute -right-24 -bottom-24 w-96 h-96 rounded-full pointer-events-none bg-[radial-gradient(circle,rgba(255,255,255,0.08),transparent_70%)]" />
          <div className="max-w-2xl relative z-10">
            <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-accent/20 border border-accent/40 text-accent text-[10px] font-bold uppercase tracking-widest mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              Technical Specification Binder
            </span>
            <h2 className="text-3xl md:text-5xl font-medium tracking-tight mb-4">2026 Master Architectural Catalogue</h2>
            <p className="text-white/70 text-sm md:text-base font-light leading-relaxed">
              Download our comprehensive specification binder including IES photometric distributions, IP68 environmental testing certificates, and Autodesk Revit BIM integration guides.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4 relative z-10 w-full lg:w-auto justify-start lg:justify-end">
            <a href="/catalogue" target="_blank" className="px-10 py-5 rounded-full bg-accent text-primary font-bold text-xs uppercase tracking-widest hover:bg-white transition-all shadow-2xl flex items-center gap-3">
              <span>Download Complete PDF</span>
              <span className="text-base font-normal">↓</span>
            </a>
            <Link href="/products" className="px-8 py-5 rounded-full border border-white/20 bg-white/5 hover:bg-white/10 text-white font-semibold text-xs uppercase tracking-widest transition-all">
              View Online Library
            </Link>
          </div>
        </div>
      </section>

      <section className="py-24 md:py-36 px-6 md:px-12 bg-background border-b border-black/5">
        <div className="max-w-[100rem] mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-accent block mb-3">Lighting Intelligence</span>
              <h2 className="text-3xl sm:text-5xl md:text-6xl font-medium tracking-tight text-primary">Studio Journal.</h2>
            </div>
            <Link href="/blog" className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-primary text-white text-xs font-bold uppercase tracking-widest hover:bg-accent hover:text-primary transition-all shadow-xl self-start md:self-auto">
              <span>Read Studio Journal</span>
              <span>→</span>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {articles.slice(0, 3).map((art, i) => (
              <BlogCard key={art.slug} art={art} index={i} rounded="rounded-[2.5rem]" />
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 md:py-48 px-6 text-center bg-white relative overflow-hidden">
        <div className="max-w-4xl mx-auto anim-fade-up relative z-10">
          <h2 className="text-3xl sm:text-5xl md:text-[8rem] font-medium tracking-tighter mb-10 md:mb-14 leading-none text-primary">Specify<br />NexaLight.</h2>
          <Link href="/contact" className="btn-premium px-10 py-4 md:px-14 md:py-6 rounded-full text-xs md:text-sm font-semibold tracking-widest uppercase shadow-xl">
            Contact Our Studio
          </Link>
        </div>
      </section>
    </>
  );
}
