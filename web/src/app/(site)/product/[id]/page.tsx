import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import ProductMedia from "@/components/ProductMedia";
import QuoteBox from "@/components/QuoteBox";
import SectionTabs from "@/components/SectionTabs";
import { Download } from "@/components/icons";
import { getProduct, getProducts, getSettings } from "@/lib/data";
import { SITE_URL, media, titleCase, absoluteMedia } from "@/lib/site";
import { divisionByCategory, divisionHref } from "@/lib/divisions";

export const revalidate = 60;

type Params = { params: Promise<{ id: string }> };

// Spec rows shown as headline tiles, matched by label (first match wins).
const HIGHLIGHTS: { label: string; match: RegExp }[] = [
  { label: "Power", match: /power(?! factor)|wattage/i },
  { label: "Protection", match: /\bip\b|protection|ingress/i },
  { label: "Colour Temp.", match: /colou?r temp|cct/i },
  { label: "Beam Angle", match: /beam/i },
  { label: "CRI", match: /\bcri\b|colou?r rendering/i },
  { label: "Luminous Flux", match: /lumen|luminous|flux/i },
  { label: "Input Voltage", match: /voltage|input/i },
  { label: "Lifespan", match: /life/i },
];


export async function generateStaticParams() {
  return (await getProducts()).map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const p = await getProduct((await params).id);
  if (!p) return { title: "Product not found | NexaLight" };
  const name = titleCase(p.name);
  const title = p.seoTitle || `${name} - ${p.category} | NexaLight`;
  const description = p.seoDesc || `${name} by NexaLight: ${(p.desc || "architectural LED lighting").slice(0, 140)}. Request project pricing, IES files and datasheet.`;
  return {
    title,
    description,
    alternates: { canonical: `/product/${p.id}` },
    openGraph: { title, description, images: [media(p.heroImg)], type: "website" },
  };
}

export default async function ProductPage({ params }: Params) {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) notFound();

  const [all, settings] = await Promise.all([getProducts(), getSettings()]);
  const name = titleCase(product.name);
  const division = divisionByCategory(product.category);
  const specs = Object.entries(product.specs ?? {}).filter(([, v]) => v);
  const model = specs.find(([k]) => /^model/i.test(k))?.[1] || product.id.replace(/^nex-light-/, "").toUpperCase();
  const used = new Set<string>();
  const highlights = HIGHLIGHTS.flatMap(({ label, match }) => {
    const row = specs.find(([k]) => match.test(k) && !used.has(k));
    if (!row) return [];
    used.add(row[0]);
    return [{ label, value: row[1] }];
  }).slice(0, 6);
  const price = product.price && /\d/.test(product.price) ? product.price : null;
  const features = product.features ?? [];
  const sameSub = all.filter((p) => p.id !== product.id && p.category === product.category && p.subcategory === product.subcategory);
  const sameCat = all.filter((p) => p.id !== product.id && p.category === product.category && p.subcategory !== product.subcategory);
  const related = [...sameSub, ...sameCat].slice(0, 4);
  const images = Array.from(new Set([product.heroImg, ...(product.gallery ?? [])].filter(Boolean) as string[])).map(media);
  if (images.length === 0) images.push(media(null));
  const url = `${SITE_URL}/product/${product.id}`;

  const crumbs = [
    { name: "Home", href: "/" },
    { name: "Products", href: "/products" },
    { name: product.category, href: divisionHref(product.category) },
    { name, href: `/product/${product.id}` },
  ];

  const schema = [
    {
      "@context": "https://schema.org/",
      "@type": "Product",
      name,
      sku: model,
      mpn: model,
      image: images.map((i) => absoluteMedia(i)),
      description: product.desc || product.seoDesc || `${name} architectural lighting by NexaLight.`,
      brand: { "@type": "Brand", name: "NexaLight" },
      category: [product.category, product.subcategory].filter(Boolean).join(" > "),
      url,
      additionalProperty: specs.map(([k, v]) => ({ "@type": "PropertyValue", name: k, value: v })),
    },
    {
      "@context": "https://schema.org/",
      "@type": "BreadcrumbList",
      itemListElement: crumbs.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.name, item: `${SITE_URL}${c.href}` })),
    },
  ];

  const downloads = [
    ["Product datasheet", "PDF"],
    ["Photometric file", "IES / LDT"],
    ["Installation guide", "PDF"],
  ];
  const tabs = [
    (product.desc || features.length > 0) && {
      id: "overview",
      label: "Overview",
      content: (
        <div className="max-w-5xl">
          {product.desc && <p className="text-base md:text-lg text-secondary font-light leading-relaxed whitespace-pre-line mb-8">{product.desc}</p>}
          {features.length > 0 && (
            <>
              <h3 className="text-xs font-bold uppercase tracking-widest text-primary mb-4">Key features</h3>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-3">
                {features.map((f) => (
                  <li key={f} className="flex gap-3 text-sm text-secondary leading-relaxed">
                    <svg className="w-4 h-4 mt-0.5 shrink-0 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
                      <path d="M5 12l5 5L20 7" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      ),
    },
    specs.length > 0 && {
      id: "specifications",
      label: "Specifications",
      content: (
        <div className="max-w-5xl">
          <div className="rounded-2xl border border-black/10 overflow-hidden">
            <table className="w-full text-sm">
              <tbody>
                {specs.map(([k, v], i) => (
                  <tr key={k} className={i % 2 ? "bg-white" : "bg-surfaceLight/60"}>
                    <th scope="row" className="text-left font-medium text-secondary px-5 py-3 w-2/5 align-top">{k}</th>
                    <td className="px-5 py-3 text-primary">{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-secondary mt-4">Values are nominal. Custom variants are confirmed on the quotation.</p>
        </div>
      ),
    },
    division && {
      id: "applications",
      label: "Applications",
      content: (
        <div className="flex flex-wrap gap-3 max-w-5xl">
          {division.applications.map((a) => (
            <span key={a} className="px-4 py-2 rounded-full border border-black/10 text-sm text-primary">{a}</span>
          ))}
        </div>
      ),
    },
    {
      id: "downloads",
      label: "Downloads",
      content: (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-5xl">
          {downloads.map(([t, f]) => (
            <a
              key={t}
              href={`mailto:${settings.email}?subject=${encodeURIComponent(`${t} request: ${name} (${model})`)}`}
              className="group flex items-center justify-between gap-4 rounded-xl border border-black/10 p-4 hover:border-primary transition-colors"
            >
              <span>
                <span className="block text-sm font-medium text-primary">{t}</span>
                <span className="block text-[11px] text-secondary">{f} · on request</span>
              </span>
              <Download size={18} className="text-secondary group-hover:text-primary" />
            </a>
          ))}
        </div>
      ),
    },
  ].filter((t) => !!t);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      <section className="pt-28 md:pt-32 pb-12 md:pb-16 px-6 md:px-12 bg-background">
        <div className="max-w-[90rem] mx-auto">
          <nav aria-label="Breadcrumb" className="mb-6 md:mb-8">
            <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-secondary">
              {crumbs.map((c, i) => (
                <li key={c.href} className="flex items-center gap-2 min-w-0">
                  {i > 0 && <span className="text-black/25">/</span>}
                  {i < crumbs.length - 1 ? (
                    <Link href={c.href} className="hover:text-primary transition-colors">{c.name}</Link>
                  ) : (
                    <span className="text-primary font-medium truncate max-w-[16rem]" aria-current="page">{c.name}</span>
                  )}
                </li>
              ))}
            </ol>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
            <div className="lg:col-span-6 lg:sticky lg:top-28">
              <ProductMedia images={images} name={name} />
            </div>

            <div className="lg:col-span-6">
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <Link href={divisionHref(product.category)} className="px-3 py-1 rounded-full bg-primary text-white text-[10px] font-bold uppercase tracking-widest">
                  {product.category}
                </Link>
                {product.subcategory && (
                  <span className="px-3 py-1 rounded-full border border-black/10 bg-white text-[10px] font-bold uppercase tracking-widest text-secondary">{product.subcategory}</span>
                )}
              </div>

              <h1 className="text-3xl md:text-5xl font-medium tracking-tight text-primary leading-[1.1] mb-3">{name}</h1>
              <p className="text-sm text-secondary mb-6 break-all sm:break-normal">
                Model: <span className="font-semibold text-primary">{model}</span>
                <span className="hidden sm:inline">
                  <span className="mx-3 text-black/20">|</span>
                  Brand: <span className="font-semibold text-primary">NexaLight</span>
                </span>
              </p>

              {(product.desc || product.seoDesc) && (
                <p className="text-base text-secondary font-light leading-relaxed mb-8 line-clamp-3">{product.desc || product.seoDesc}</p>
              )}

              {highlights.length > 0 && (
                <dl className="grid grid-cols-2 sm:grid-cols-3 gap-px bg-black/10 border border-black/10 rounded-2xl overflow-hidden mb-8">
                  {highlights.map((h) => (
                    <div key={h.label} className="bg-white p-4">
                      <dt className="text-[10px] font-bold uppercase tracking-widest text-secondary mb-1">{h.label}</dt>
                      <dd className="text-sm font-semibold text-primary break-words">{h.value}</dd>
                    </div>
                  ))}
                </dl>
              )}

              <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-2 mb-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-secondary mb-1">Price</p>
                  <p className="text-2xl font-medium text-primary">{price ?? "Price on request"}</p>
                </div>
                <p className="text-xs text-secondary">
                  <span className="inline-block w-2 h-2 rounded-full bg-primary mr-2 align-middle" />
                  Available for project orders
                </p>
              </div>

              <QuoteBox name={name} model={model} url={url} whatsapp={settings.whatsapp} email={settings.email} />

              <ul className="grid grid-cols-2 gap-3 mt-6">
                {[
                  ["Bulk & project pricing", "Volume rates for contractors and specifiers"],
                  ["Customisable", "Wattage, CCT, beam angle and finish"],
                  ["Technical support", "Lighting layouts & photometric files"],
                  ["Lead time", "4–6 weeks for custom batches"],
                ].map(([t, d]) => (
                  <li key={t} className="rounded-xl bg-surfaceLight p-4">
                    <p className="text-xs font-semibold text-primary mb-1">{t}</p>
                    <p className="text-[11px] text-secondary leading-snug">{d}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <SectionTabs tabs={tabs} />

      {related.length > 0 && (
        <section className="py-16 md:py-24 px-6 md:px-12 bg-background">
          <div className="max-w-[90rem] mx-auto">
            <div className="flex justify-between items-end mb-10 gap-6">
              <h2 className="text-3xl md:text-4xl font-medium tracking-tight text-primary">Related products</h2>
              <Link href={divisionHref(product.category)} className="text-xs font-bold uppercase tracking-widest border-b border-primary pb-1 hover:text-accent hover:border-accent transition-colors shrink-0">
                View all
              </Link>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {related.map((p) => (
                <Link key={p.id} href={`/product/${p.id}`} className="group block rounded-2xl bg-white border border-black/5 overflow-hidden hover:shadow-premium-hover transition-shadow">
                  <div className="aspect-square relative bg-white">
                    <Image src={media(p.heroImg)} alt={titleCase(p.name)} fill sizes="(min-width: 1024px) 22vw, 50vw" className="object-contain p-4 transition-transform duration-500 group-hover:scale-105" />
                  </div>
                  <div className="p-4 border-t border-black/5">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-secondary mb-1">{p.subcategory || p.category}</p>
                    <h3 className="text-sm md:text-base font-medium text-primary group-hover:text-accent transition-colors">{titleCase(p.name)}</h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
