import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { getSeo, getSettings } from "@/lib/data";
import { SITE_URL, media, absoluteMedia } from "@/lib/site";

const inter = Inter({ subsets: ["latin"], weight: ["200", "300", "400", "500", "600"], variable: "--font-inter", display: "swap" });

const DEFAULT_TITLE = "NexaLight | Architectural, Facade & Landscape Lighting in India";
const DEFAULT_DESC =
  "NexaLight makes architectural LED lighting in India: facade wall washers and flood lights, COB downlights and spots, bollards, garden and fibre optic lighting. Get project pricing.";

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeo("home");
  const title = seo.title || DEFAULT_TITLE;
  const description = seo.description || DEFAULT_DESC;
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: title, template: "%s" },
    description,
    authors: [{ name: "NexaLight Studio" }],
    alternates: { canonical: "/" },
    openGraph: { title, description, type: "website", siteName: "NexaLight", locale: "en_IN", url: "/", images: [media("assets/images/linear_nanox.png")] },
    twitter: { card: "summary_large_image", title, description, images: [media("assets/images/linear_nanox.png")] },
  };
}

export const viewport: Viewport = { themeColor: "#f8f8f6", width: "device-width", initialScale: 1 };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings();
  const orgSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: "NexaLight",
    alternateName: "NexaLight Architectural Lighting",
    url: SITE_URL,
    logo: absoluteMedia("images/logo.png"),
    description:
      "Architectural LED lighting for facades, interiors, landscapes and fibre optic installations, supplied to projects across India.",
    address: { "@type": "PostalAddress", addressLocality: "Ganaur", addressRegion: "Haryana", addressCountry: "IN" },
    areaServed: "IN",
    contactPoint: { "@type": "ContactPoint", telephone: settings.phone, contactType: "sales", email: settings.email, areaServed: "IN", availableLanguage: ["en", "hi"] },
    sameAs: ["https://www.linkedin.com/company/nexalight", "https://www.instagram.com/nexalight"],
  };

  const siteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: "NexaLight",
    url: SITE_URL,
    publisher: { "@id": `${SITE_URL}/#organization` },
    inLanguage: "en-IN",
    potentialAction: { "@type": "SearchAction", target: `${SITE_URL}/products?q={search_term_string}`, "query-input": "required name=search_term_string" },
  };

  return (
    <html lang="en-IN" className={inter.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify([orgSchema, siteSchema]) }} />
      </head>
      <body className="font-sans selection:bg-accent selection:text-white relative">{children}</body>
    </html>
  );
}
