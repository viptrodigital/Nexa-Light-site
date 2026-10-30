import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { getSeo, getSettings } from "@/lib/data";
import { SITE_URL, media, absoluteMedia } from "@/lib/site";

const inter = Inter({ subsets: ["latin"], weight: ["200", "300", "400", "500", "600"], variable: "--font-inter", display: "swap" });

const DEFAULT_TITLE = "NexaLight | Precision Architectural & Facade Lighting";
const DEFAULT_DESC =
  "NexaLight specializes in precision architectural, facade, fiber optic, and landscape lighting systems designed for landmark projects and modern spaces.";

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeo("home");
  const title = seo.title || DEFAULT_TITLE;
  const description = seo.description || DEFAULT_DESC;
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: title, template: "%s" },
    description,
    keywords: [
      "Architectural Lighting", "Facade Lighting", "Fiber Optic Lighting", "Landscape Lighting", "Indoor Lighting",
      "LED Systems", "NexaLight", "Premium Lighting", "IES files", "Revit models",
    ],
    authors: [{ name: "NexaLight Studio" }],
    alternates: { canonical: "/" },
    openGraph: { title, description, type: "website", siteName: "NexaLight", url: "/", images: [media("assets/images/linear_nanox.png")] },
    twitter: { card: "summary_large_image", title, description, images: [media("assets/images/linear_nanox.png")] },
  };
}

export const viewport: Viewport = { themeColor: "#f8f8f6", width: "device-width", initialScale: 1 };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings();
  const orgSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "NexaLight Architectural Lighting",
    url: SITE_URL,
    logo: absoluteMedia("images/logo.png"),
    description:
      "Precision architectural, facade, fiber optic, and landscape lighting systems engineered for landmark developments.",
    address: { "@type": "PostalAddress", addressLocality: "Ganaur", addressRegion: "Haryana", addressCountry: "IN" },
    contactPoint: { "@type": "ContactPoint", telephone: settings.phone, contactType: "customer support", email: settings.email },
    sameAs: ["https://www.linkedin.com/company/nexalight", "https://www.instagram.com/nexalight"],
  };

  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }} />
      </head>
      <body className="font-sans selection:bg-accent selection:text-white relative">{children}</body>
    </html>
  );
}
