import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BlogCard } from "@/components/cards";
import { getBlogArticles } from "@/lib/data";
import { SITE_URL, media } from "@/lib/site";

export const revalidate = 60;

type Params = { params: Promise<{ slug: string }> };

async function findArticle(slug: string) {
  return (await getBlogArticles()).find((a) => a.slug === slug);
}

export async function generateStaticParams() {
  return (await getBlogArticles()).map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const art = await findArticle((await params).slug);
  if (!art) return { title: "Article not found | NexaLight" };
  return {
    title: `${art.title} | NexaLight Studio Journal`,
    description: art.excerpt,
    alternates: { canonical: `/blog/${art.slug}` },
    openGraph: { title: art.title, description: art.excerpt, images: [media(art.image)], type: "article" },
  };
}

export default async function ArticlePage({ params }: Params) {
  const { slug } = await params;
  const all = await getBlogArticles();
  const art = all.find((a) => a.slug === slug);
  if (!art) notFound();
  const more = all.filter((a) => a.slug !== slug).slice(0, 3);

  const schema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: art.title,
    image: [media(art.image)],
    author: { "@type": "Person", name: art.author || "NexaLight Studio" },
    publisher: { "@type": "Organization", name: "NexaLight" },
    description: art.excerpt,
    url: `${SITE_URL}/blog/${art.slug}`,
  };

  return (
    <article className="bg-background">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <header className="relative h-[60svh] min-h-[420px] w-full overflow-hidden bg-primary">
        <Image src={media(art.image)} alt={art.title} fill priority sizes="100vw" className="object-cover opacity-80" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/30" />
        <div className="absolute inset-x-0 bottom-0 px-6 md:px-12 pb-12 md:pb-16">
          <div className="max-w-4xl mx-auto">
            <span className="inline-block px-3.5 py-1 rounded-full bg-accent text-primary text-[10px] font-bold uppercase tracking-widest mb-4">{art.category}</span>
            <h1 className="text-3xl md:text-6xl font-medium tracking-tight text-white leading-tight">{art.title}</h1>
          </div>
        </div>
      </header>

      <div className="px-6 md:px-12 py-12 md:py-20">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between pb-8 mb-10 border-b border-black/5 flex-wrap gap-4">
            <div className="flex items-center gap-4">
              {art.authorAvatar && <Image src={media(art.authorAvatar)} alt="" width={48} height={48} className="w-12 h-12 rounded-full object-cover border border-black/10" />}
              <div>
                <span className="block text-sm font-bold text-primary">{art.author || "NexaLight Studio"}</span>
                {art.authorRole && <span className="block text-xs text-secondary">{art.authorRole}</span>}
              </div>
            </div>
            <div className="text-xs font-semibold uppercase tracking-widest text-secondary flex items-center gap-2">
              {art.date && <span>Published {art.date}</span>}
              {art.date && art.readTime && <span>•</span>}
              {art.readTime && <span>{art.readTime}</span>}
            </div>
          </div>

          {art.content ? (
            // Article HTML is written by the site's own admins in the CMS.
            <div className="article-body text-lg" dangerouslySetInnerHTML={{ __html: art.content }} />
          ) : (
            <p className="text-secondary text-lg leading-relaxed">{art.excerpt}</p>
          )}

          <div className="mt-12 pt-8 border-t border-black/5 flex flex-wrap items-center justify-between gap-4">
            <a
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`${SITE_URL}/blog/${art.slug}`)}`}
              target="_blank"
              rel="noopener"
              className="px-5 py-2.5 rounded-full bg-surface text-xs font-semibold text-secondary hover:bg-primary hover:text-white transition-all"
            >
              Share on LinkedIn
            </a>
            <Link href="/blog" className="px-8 py-3.5 rounded-full bg-primary text-white text-xs font-bold uppercase tracking-widest hover:bg-accent hover:text-primary transition-all shadow-md">
              ← All Articles
            </Link>
          </div>
        </div>
      </div>

      {more.length > 0 && (
        <section className="py-20 px-6 md:px-12 bg-surfaceLight border-t border-black/5">
          <div className="max-w-[100rem] mx-auto">
            <h2 className="text-3xl md:text-5xl font-medium tracking-tight text-primary mb-12">Continue Reading.</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {more.map((a, i) => (
                <BlogCard key={a.slug} art={a} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}
    </article>
  );
}
