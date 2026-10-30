"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

const SLIDES = [
  "https://images.unsplash.com/photo-1519010470956-6d877008eaa4?w=1600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=1600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1600&auto=format&fit=crop",
];

export default function HeroCarousel() {
  const [index, setIndex] = useState(0);
  const [tick, setTick] = useState(0); // restarts the timer after a manual pick

  useEffect(() => {
    const t = setInterval(() => setIndex((i) => (i + 1) % SLIDES.length), 6000);
    return () => clearInterval(t);
  }, [tick]);

  return (
    <section className="h-[100svh] md:h-[95vh] w-full relative flex items-center justify-center px-4 md:px-8 bg-background pt-20 pb-4 md:pt-24 md:pb-8 overflow-hidden">
      <div className="floating-blob top-0 left-0" />
      <div className="floating-blob bottom-0 right-0" style={{ animationDelay: "-10s", background: "radial-gradient(circle, rgba(0,0,0,0.05) 0%, transparent 70%)" }} />
      <div className="hero-bg-text">NEXA</div>

      <div className="relative w-full h-full rounded-[1.5rem] md:rounded-[2rem] overflow-hidden shadow-premium bg-surfaceLight">
        {SLIDES.map((src, i) => (
          <Image
            key={src}
            src={src}
            alt="Architectural facade lighting by NexaLight"
            fill
            sizes="100vw"
            priority={i === 0}
            className={`object-cover transition-opacity duration-[1500ms] ease-in-out ${i === index ? "opacity-100" : "opacity-0"}`}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 md:via-black/20 to-transparent z-[2] pointer-events-none" />
        <div className="absolute inset-0 z-20 flex flex-col justify-end p-6 pb-28 md:pb-20 md:p-20 max-w-[100rem] mx-auto w-full">
          <h1 className="text-[11px] md:text-sm font-semibold uppercase tracking-[0.25em] text-white/80 mb-4 md:mb-6">
            Architectural, Facade &amp; Landscape Lighting Manufacturer in India
          </h1>
          <p className="text-[14vw] md:text-[9.5rem] font-medium tracking-tighter leading-[1.0] mb-6 md:mb-8 text-white">
            <span className="block clip-text pb-1 md:pb-2"><span>Sculpting</span></span>
            <span className="block clip-text pb-2 md:pb-4 text-white/90"><span style={{ animationDelay: "80ms" }}>with light.</span></span>
          </p>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 md:gap-10">
            <p className="text-base md:text-2xl text-white/80 font-light max-w-2xl leading-relaxed">
              Precision optical systems designed to command the night and seamlessly disappear by day.
            </p>
            <div className="flex flex-col items-start md:items-end gap-6">
              <Link
                href="/products"
                className="inline-flex px-8 py-4 md:px-10 md:py-5 rounded-full text-xs md:text-sm font-semibold tracking-wide uppercase hover:-translate-y-1 transition-all duration-500 shadow-xl bg-white text-primary hover:bg-primary hover:text-white"
              >
                View All Products
              </Link>
              <div className="flex gap-2 md:gap-3 mt-2 md:mt-4">
                {SLIDES.map((_, i) => (
                  <button
                    key={i}
                    aria-label={`Show slide ${i + 1}`}
                    className={`slider-dot ${i === index ? "active" : ""}`}
                    onClick={() => {
                      setIndex(i);
                      setTick((t) => t + 1);
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
