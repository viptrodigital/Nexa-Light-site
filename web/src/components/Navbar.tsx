"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { NAV_LINKS, media } from "@/lib/site";
import { DIVISIONS } from "@/lib/divisions";
import { ChevronDown, Download } from "./icons";

export default function Navbar({ email, phone }: { email: string; phone: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const barRef = useRef<HTMLDivElement>(null);

  // Updates the progress bar directly (no React re-render per scroll frame),
  // at most once per animation frame.
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const y = window.scrollY;
      const h = document.documentElement.scrollHeight - window.innerHeight;
      if (barRef.current) barRef.current.style.transform = `scaleX(${h > 0 ? y / h : 0})`;
      setScrolled(y > 50);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
  }, [open]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || (href === "/products" && pathname.startsWith("/product"));

  return (
    <>
      <div ref={barRef} className="fixed top-0 left-0 w-full h-[3px] bg-accent z-[1000] origin-left will-change-transform" style={{ transform: "scaleX(0)" }} aria-hidden />
      <nav className={`fixed w-full top-0 z-[60] glass-nav ${open ? "menu-active" : ""} ${scrolled && !open ? "shadow-premium" : ""}`}>
        <div className="w-full max-w-[100rem] mx-auto px-6 md:px-12 py-4 md:py-5 flex justify-between items-center relative z-[60]">
          <Link href="/" className="relative z-[60] flex items-center group" aria-label="NexaLight home">
            <Image
              src={media("images/logo.png")}
              alt="NexaLight Logo"
              width={160}
              height={40}
              priority
              unoptimized
              className="h-8 md:h-10 w-auto object-contain transition-transform duration-500 group-hover:scale-105"
            />
          </Link>

          <div className="hidden md:flex text-sm font-medium items-center">
            <div className="flex space-x-10 lg:space-x-12 items-center">
              {NAV_LINKS.map((l) =>
                l.href === "/products" ? (
                  <div key={l.href} className="relative group py-2">
                    <Link href="/products" className={`nav-link flex items-center gap-1 ${isActive("/products") ? "active" : ""}`}>
                      Products
                      <ChevronDown className="opacity-50 group-hover:opacity-100 transition-opacity" />
                    </Link>
                    <div className="absolute top-full left-0 pt-3 w-64 opacity-0 invisible group-hover:opacity-100 group-hover:visible group-focus-within:opacity-100 group-focus-within:visible transition-opacity duration-150 z-[70]">
                      <ul className="bg-white border border-black/10 shadow-premium rounded-xl py-2">
                        {DIVISIONS.map((d) => (
                          <li key={d.slug}>
                            <Link href={`/products/${d.slug}`} className="block px-5 py-2.5 text-sm text-primary hover:bg-surfaceLight transition-colors">
                              {d.category}
                            </Link>
                          </li>
                        ))}
                        <li className="border-t border-black/5 mt-2 pt-2">
                          <Link href="/products" className="block px-5 py-2.5 text-sm font-semibold text-primary hover:bg-surfaceLight transition-colors">
                            All Products
                          </Link>
                        </li>
                      </ul>
                    </div>
                  </div>
                ) : (
                  <Link key={l.href} href={l.href} className={`nav-link ${isActive(l.href) ? "active" : ""}`}>
                    {l.label}
                  </Link>
                )
              )}
              <a
                href="/catalogue"
                target="_blank"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-black/10 bg-white/90 hover:bg-primary hover:text-white hover:border-primary transition-all duration-300 text-xs font-semibold tracking-wider uppercase shadow-sm"
              >
                <Download size={13} />
                <span>Catalogue</span>
              </a>
            </div>
          </div>

          <button
            className="md:hidden flex flex-col justify-center items-end w-8 h-8 z-[60] relative"
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
          >
            <span className="bg-primary w-6 h-[1.5px] transition-transform duration-500 mb-[5px]" style={{ transform: open ? "rotate(45deg) translate(4px, 4px)" : "none" }} />
            <span className="bg-primary w-6 h-[1.5px] transition-transform duration-500" style={{ transform: open ? "rotate(-45deg) translate(1px, -1px)" : "none" }} />
          </button>
        </div>
      </nav>

      <div
        className={`fixed inset-0 bg-background z-[55] flex flex-col justify-between px-8 pt-32 pb-12 md:hidden overflow-y-auto transition-opacity duration-500 ${open ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        aria-hidden={!open}
      >
        <div className="flex flex-col space-y-4 text-primary w-full">
          {NAV_LINKS.map((l, i) => (
            <div key={l.href} className="overflow-hidden">
              <Link
                href={l.href}
                tabIndex={open ? 0 : -1}
                className="block text-[3rem] tracking-tighter font-medium leading-[1.1] hover:text-accent transition-all duration-500"
                style={{ transform: open ? "none" : "translateY(100%)", transitionDelay: open ? `${i * 50 + 100}ms` : "0ms" }}
              >
                {l.label}
              </Link>
              {l.href === "/products" && (
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 pt-2 pb-2">
                  {DIVISIONS.map((d) => (
                    <Link key={d.slug} href={`/products/${d.slug}`} tabIndex={open ? 0 : -1} className="text-sm text-secondary hover:text-accent transition-colors">
                      {d.category}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
          <div className="pt-4">
            <a
              href="/catalogue"
              target="_blank"
              tabIndex={open ? 0 : -1}
              className="inline-flex items-center gap-3 px-6 py-3.5 rounded-full bg-primary text-white text-xs font-semibold tracking-widest uppercase shadow-xl hover:bg-accent hover:text-primary transition-all"
            >
              <span>Download Catalogue PDF</span>
              <span>↓</span>
            </a>
          </div>
        </div>
        <div className="flex flex-col space-y-2 text-secondary text-sm font-medium">
          <span>{email}</span>
          <span>{phone}</span>
        </div>
      </div>
    </>
  );
}
