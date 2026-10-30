import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import BlogBrowser from "@/components/BlogBrowser";
import { getBlogArticles, getSeo } from "@/lib/data";
import { SITE_URL, media, absoluteMedia } from "@/lib/site";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeo("blog");
  return {
    title: seo.title || "Studio Journal & Lighting Intelligence | NexaLight Architectural Blog",
    description:
      seo.description ||
      "Read technical treatises, optical engineering research, circadian biophilic illumination guides, and architectural lighting trends from the NexaLight Laboratory.",
    alternates: { canonical: "/blog" },
  };
}

export default async function BlogPage() {
  const articles = await getBlogArticles();
  const [featured, ...others] = articles;
  const schema = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "NexaLight Studio Journal",
    url: `${SITE_URL}/blog`,
    publisher: { "@type": "Organization", name: "NexaLight", logo: { "@type": "ImageObject", url: absoluteMedia("images/logo.png") } },
  };

  return (
    <div className="bg-background relative min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <section className="pt-36 pb-20 px-6 md:px-12 bg-surfaceLight border-b border-black/5 relative overflow-hidden">
        <div className="max-w-[100rem] mx-auto anim-fade-up">
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-accent block mb-4">Studio Journal</span>
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-medium tracking-tighter text-primary leading-tight mb-6">
            Lighting Intelligence<br />&amp; Editorial Essays.
          </h1>
          <p className="text-secondary text-base md:text-xl font-light max-w-2xl leading-relaxed">
            Technical treatises, optical engineering breakthroughs, and architectural illumination design trends from the NexaLight research laboratory.
          </p>
        </div>
      </section>

      {featured && (
        <section className="pt-16 px-6 md:px-12">
          <div className="max-w-[100rem] mx-auto">
            <Link href={`/blog/${featured.slug}`} className="rounded-[2.5rem] overflow-hidden bg-white shadow-premium hover:shadow-premium-dark transition-all duration-700 border border-black/5 grid grid-cols-1 lg:grid-cols-12 group">
              <div className="lg:col-span-7 relative min-h-[350px] lg:min-h-[480px] overflow-hidden bg-skeleton">
                <Image src={media(featured.image)} alt={featured.title} fill priority sizes="(min-width: 1024px) 58vw, 100vw" className="object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute top-6 left-6 z-10">
                  <span className="px-4 py-1.5 rounded-full bg-primary/90 text-[10px] font-bold uppercase tracking-widest text-white border border-white/10">
                    Featured Essay • {featured.category}
                  </span>
                </div>
              </div>
              <div className="lg:col-span-5 p-8 md:p-14 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-4 text-xs font-semibold uppercase tracking-widest text-secondary mb-4">
                    {featured.date && <span>{featured.date}</span>}
                    {featured.date && featured.readTime && <span>•</span>}
                    {featured.readTime && <span>{featured.readTime}</span>}
                  </div>
                  <h2 className="text-2xl md:text-4xl font-medium tracking-tight text-primary leading-tight mb-6 group-hover:text-accent transition-colors">{featured.title}</h2>
                  {featured.excerpt && <p className="text-secondary text-sm md:text-base leading-relaxed mb-8 font-light">{featured.excerpt}</p>}
                </div>
                <div className="flex items-center justify-between pt-6 border-t border-black/5">
                  <div className="flex items-center gap-3">
                    {featured.authorAvatar && <Image src={media(featured.authorAvatar)} alt="" width={40} height={40} className="w-10 h-10 rounded-full object-cover border border-black/10" />}
                    <div>
                      <span className="block text-xs font-bold text-primary">{featured.author || "NexaLight Studio"}</span>
                      {featured.authorRole && <span className="block text-[10px] text-secondary">{featured.authorRole}</span>}
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary group-hover:translate-x-2 transition-transform">Read Essay →</span>
                </div>
              </div>
            </Link>
          </div>
        </section>
      )}

      <BlogBrowser articles={others} />
    </div>
  );
}
