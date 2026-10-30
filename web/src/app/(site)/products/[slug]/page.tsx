import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import DivisionProducts from "@/components/DivisionProducts";
import { getProducts, getSeo } from "@/lib/data";
import { DIVISIONS, DIVISION_FAQS, divisionBySlug } from "@/lib/divisions";
import { SITE_URL, media, titleCase } from "@/lib/site";

export const revalidate = 60;
export const dynamicParams = false;

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return DIVISIONS.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const d = divisionBySlug((await params).slug);
  if (!d) return {};
  const seo = await getSeo(d.slug);
  return {
    title: seo.title || `${d.category} | NexaLight Architectural Lighting`,
    description: seo.description || `${d.tagline} ${d.intro}`.slice(0, 160),
    alternates: { canonical: `/products/${d.slug}` },
  };
}

export default async function DivisionPage({ params }: Params) {
  const d = divisionBySlug((await params).slug);
  if (!d) notFound();

  const all = await getProducts();
  const products = all
    .filter((p) => p.category === d.category)
    .map(({ id, name, category, subcategory, price, heroImg }) => ({ id, name, category, subcategory, price, heroImg }));
  const subcategories = new Set(products.map((p) => p.subcategory).filter(Boolean));
  const heroImage = products.find((p) => p.heroImg)?.heroImg;
  const others = DIVISIONS.filter((o) => o.slug !== d.slug);
  const cover = (category: string) => all.find((p) => p.category === category && p.heroImg)?.heroImg;

  const faqs = DIVISION_FAQS[d.slug] ?? [];
  const schema = [
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: d.category,
      description: d.intro,
      url: `${SITE_URL}/products/${d.slug}`,
      breadcrumb: {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
          { "@type": "ListItem", position: 2, name: "Products", item: `${SITE_URL}/products` },
          { "@type": "ListItem", position: 3, name: d.category, item: `${SITE_URL}/products/${d.slug}` },
        ],
      },
      mainEntity: {
        "@type": "ItemList",
        numberOfItems: products.length,
        itemListElement: products.slice(0, 50).map((p, i) => ({ "@type": "ListItem", position: i + 1, name: titleCase(p.name), url: `${SITE_URL}/product/${p.id}` })),
      },
    },
    ...(faqs.length
      ? [
          {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
          },
        ]
      : []),
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      {/* Hero */}
      <section className="pt-28 md:pt-32 pb-16 md:pb-24 px-6 md:px-12 bg-background">
        <div className="max-w-[100rem] mx-auto">
          <nav aria-label="Breadcrumb" className="text-[11px] font-semibold uppercase tracking-widest text-secondary mb-10 md:mb-14">
            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
            <span className="mx-3 text-black/20">/</span>
            <Link href="/products" className="hover:text-primary transition-colors">Products</Link>
            <span className="mx-3 text-black/20">/</span>
            <span className="text-primary">{d.category}</span>
          </nav>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            <div className="lg:col-span-6">
              <p className="text-accent text-xs font-bold uppercase tracking-[0.3em] mb-6">Division {d.number}</p>
              <h1 className="text-5xl md:text-7xl xl:text-8xl font-medium tracking-tighter text-primary leading-[0.95] mb-8">
                <span className="block clip-text pb-2"><span>{d.category.replace(" Lighting", "")}</span></span>{" "}
                <span className="block clip-text pb-2 text-secondary/70 font-light"><span style={{ animationDelay: "80ms" }}>Lighting.</span></span>
              </h1>
              <p className="text-lg md:text-xl text-secondary font-light leading-relaxed max-w-xl mb-10">{d.intro}</p>
              <div className="flex flex-wrap gap-10 py-6 border-y border-black/10 mb-10">
                <div>
                  <span className="block text-3xl font-medium text-primary">{products.length}</span>
                  <span className="text-[10px] uppercase tracking-widest text-secondary font-bold">Products</span>
                </div>
                <div>
                  <span className="block text-3xl font-medium text-primary">{subcategories.size}</span>
                  <span className="text-[10px] uppercase tracking-widest text-secondary font-bold">Product families</span>
                </div>
                <div>
                  <span className="block text-3xl font-medium text-primary">IES</span>
                  <span className="text-[10px] uppercase tracking-widest text-secondary font-bold">Data on request</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-4">
                <a href="#range" className="btn-premium px-8 py-4 rounded-full text-xs font-bold tracking-widest uppercase">View the range</a>
                <Link
                  href={`/contact?category=${encodeURIComponent(d.category)}`}
                  className="px-8 py-4 rounded-full text-xs font-bold tracking-widest uppercase border border-black/15 text-primary hover:border-primary transition-colors"
                >
                  Request a specification
                </Link>
              </div>
            </div>
            <div className="lg:col-span-6">
              <div className="relative aspect-[4/3] lg:aspect-[5/4] rounded-[2rem] md:rounded-[2.5rem] overflow-hidden bg-skeleton shadow-premium">
                <Image src={media(heroImage)} alt={d.category} fill priority sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Applications & capabilities */}
      <section className="py-20 md:py-28 px-6 md:px-12 bg-white border-y border-black/5">
        <div className="max-w-[100rem] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16">
          <div className="lg:col-span-4 anim-fade-up">
            <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-accent mb-6">Applications</h2>
            <p className="text-3xl md:text-4xl font-medium tracking-tight text-primary leading-tight mb-8">Where {d.short.toLowerCase()} lighting is specified.</p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
              {d.applications.map((a) => (
                <li key={a} className="flex items-center gap-3 text-secondary">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                  {a}
                </li>
              ))}
            </ul>
          </div>
          <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            {d.capabilities.map((c, i) => (
              <div key={c.title} className="p-8 rounded-[1.5rem] bg-background border border-black/5 anim-fade-up" style={{ transitionDelay: `${i * 100}ms` }}>
                <span className="block text-xs font-bold text-accent mb-6">0{i + 1}</span>
                <h3 className="text-xl font-medium text-primary mb-3">{c.title}</h3>
                <p className="text-sm text-secondary font-light leading-relaxed">{c.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Range */}
      <section id="range" className="py-20 md:py-28 px-6 md:px-12 bg-background scroll-mt-24">
        <div className="max-w-[100rem] mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div>
              <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-accent mb-4">The Range</h2>
              <p className="text-4xl md:text-6xl font-medium tracking-tight text-primary">{d.category}.</p>
            </div>
            <a href="/catalogue" target="_blank" className="text-xs font-bold uppercase tracking-widest border-b border-primary pb-1 hover:text-accent hover:border-accent transition-colors self-start md:self-auto">
              Download catalogue
            </a>
          </div>
          {products.length ? (
            <DivisionProducts products={products} />
          ) : (
            <p className="py-24 text-center text-secondary font-light text-lg">New products for this division are being added. Contact us for the full range.</p>
          )}
        </div>
      </section>

      {faqs.length > 0 && (
        <section className="py-20 md:py-28 px-6 md:px-12 bg-white border-t border-black/5">
          <div className="max-w-[100rem] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
            <div className="lg:col-span-4">
              <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-accent mb-6">Questions</h2>
              <p className="text-3xl md:text-4xl font-medium tracking-tight text-primary leading-tight">{d.short} lighting, answered.</p>
            </div>
            <div className="lg:col-span-8 divide-y divide-black/10 border-y border-black/10">
              {faqs.map((f) => (
                <details key={f.q} className="group py-5">
                  <summary className="flex items-center justify-between gap-6 cursor-pointer list-none text-lg font-medium text-primary">
                    <h3>{f.q}</h3>
                    <span className="text-2xl text-secondary transition-transform group-open:rotate-45">+</span>
                  </summary>
                  <p className="mt-3 text-secondary font-light leading-relaxed max-w-3xl">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Other divisions */}
      <section className="py-20 md:py-28 px-6 md:px-12 bg-white border-t border-black/5">
        <div className="max-w-[100rem] mx-auto">
          <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-accent mb-10">Other Divisions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {others.map((o) => (
              <Link key={o.slug} href={`/products/${o.slug}`} className="group relative aspect-[16/10] rounded-[1.5rem] overflow-hidden bg-skeleton">
                <Image src={media(cover(o.category))} alt={o.category} fill sizes="(min-width: 768px) 33vw, 100vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-6 md:p-8 text-white">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-accent">Division {o.number}</span>
                  <h3 className="text-2xl font-medium mt-1 flex items-center justify-between">
                    {o.category}
                    <span className="transition-transform group-hover:translate-x-1">→</span>
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
