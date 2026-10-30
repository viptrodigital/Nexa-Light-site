import Image from "next/image";
import Link from "next/link";
import type { BlogArticle, Product } from "@/lib/data";
import { media, titleCase } from "@/lib/site";

export function ProductCard({ p }: { p: Pick<Product, "id" | "name" | "category" | "subcategory" | "heroImg"> }) {
  const name = titleCase(p.name);
  return (
    <Link href={`/product/${p.id}`} className="group flex flex-col h-full rounded-2xl bg-white border border-black/[0.06] overflow-hidden hover:border-black/20 hover:shadow-premium-hover transition-all duration-300">
      <div className="aspect-square relative bg-white">
        <Image
          src={media(p.heroImg)}
          alt={name}
          fill
          sizes="(min-width: 1280px) 22vw, (min-width: 1024px) 30vw, 50vw"
          className="object-contain p-3 md:p-5 transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="flex flex-col flex-1 p-3 md:p-4 border-t border-black/5">
        <p className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-secondary mb-1 truncate">{p.subcategory || p.category}</p>
        <h2 className="text-sm md:text-base font-medium text-primary leading-snug line-clamp-2 flex-1">{name}</h2>
        <span className="mt-3 text-[10px] md:text-[11px] font-semibold uppercase tracking-widest text-primary">
          View details <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
        </span>
      </div>
    </Link>
  );
}

export function BlogCard({ art, index = 0, rounded = "rounded-[2rem]" }: { art: BlogArticle; index?: number; rounded?: string }) {
  return (
    <Link
      href={`/blog/${art.slug}`}
      className={`group bg-white ${rounded} overflow-hidden shadow-premium hover:shadow-premium-dark transition-all duration-700 border border-black/5 flex flex-col anim-fade-up`}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      <div className="aspect-[16/10] w-full overflow-hidden relative bg-skeleton">
        <Image src={media(art.image)} alt={art.title} fill sizes="(min-width: 768px) 33vw, 100vw" className="object-cover group-hover:scale-105 transition-transform duration-700" />
        <div className="absolute top-4 left-4 z-10">
          <span className="px-3.5 py-1.5 rounded-full bg-white/95 text-[10px] font-bold uppercase tracking-widest text-primary shadow-sm">{art.category}</span>
        </div>
      </div>
      <div className="p-8 flex-1 flex flex-col justify-between">
        <div>
          {(art.date || art.readTime) && (
            <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-secondary mb-3">
              {art.date && <span>{art.date}</span>}
              {art.date && art.readTime && <span>•</span>}
              {art.readTime && <span>{art.readTime}</span>}
            </div>
          )}
          <h3 className="text-xl font-medium tracking-tight text-primary mb-3 leading-snug group-hover:text-accent transition-colors">{art.title}</h3>
          {art.excerpt && <p className="text-xs text-secondary leading-relaxed line-clamp-3 font-light mb-6">{art.excerpt}</p>}
        </div>
        <div className="flex items-center justify-between pt-5 border-t border-black/5">
          <div className="flex items-center gap-2.5">
            {art.authorAvatar && (
              <Image src={media(art.authorAvatar)} alt="" width={28} height={28} className="w-7 h-7 rounded-full object-cover border border-black/10" />
            )}
            <span className="text-xs font-semibold text-primary">{art.author || "NexaLight Studio"}</span>
          </div>
          <span className="text-xs font-bold uppercase tracking-widest text-accent group-hover:translate-x-1 transition-transform">Read →</span>
        </div>
      </div>
    </Link>
  );
}
