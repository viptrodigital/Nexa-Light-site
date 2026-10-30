export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://nexalight.in").replace(/\/$/, "");

// Uploaded product photos (/uploads/...) and brand images (/images/...) still
// live on the existing Hostinger site.
const MEDIA_BASE = (process.env.NEXT_PUBLIC_MEDIA_BASE || "https://nexalight.in").replace(/\/$/, "");

const PLACEHOLDER = "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=800";

export function media(src?: string | null): string {
  if (!src) return PLACEHOLDER;
  if (/^https?:\/\//.test(src)) return src;
  // Product images bundled with the site (public/catalog).
  if (src.startsWith("/catalog/")) return src;
  return `${MEDIA_BASE}/${src.replace(/^\/+/, "")}`;
}

// Stored names are sometimes lowercase ("bollard light series").
export const titleCase = (s: string) => s.replace(/\s+/g, " ").trim().replace(/(^|\s)([a-z])/g, (_, sp: string, c: string) => sp + c.toUpperCase());

export const telHref = (phone: string) => `tel:${phone.replace(/[^+\d]/g, "")}`;

export const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Products" },
  { href: "/gallery", label: "Gallery" },
  { href: "/blog", label: "Blog" },
  { href: "/about", label: "About Us" },
  { href: "/contact", label: "Contact" },
];

