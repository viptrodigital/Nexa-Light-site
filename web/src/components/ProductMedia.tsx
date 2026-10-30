"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "./icons";

const LENS = 170;

// Product image carousel with thumbnails and a desktop hover magnifier.
export default function ProductMedia({ images, name }: { images: string[]; name: string }) {
  const [index, setIndex] = useState(0);
  const [zoom, setZoom] = useState<{ x: number; y: number; px: number; py: number } | null>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const many = images.length > 1;
  const go = (i: number) => setIndex((i + images.length) % images.length);

  const onMove = (e: React.MouseEvent) => {
    const rect = boxRef.current?.getBoundingClientRect();
    if (!rect || window.innerWidth < 1024) return;
    const x = Math.max(0, Math.min(e.clientX - rect.left - LENS / 2, rect.width - LENS));
    const y = Math.max(0, Math.min(e.clientY - rect.top - LENS / 2, rect.height - LENS));
    setZoom({ x, y, px: (x / (rect.width - LENS)) * 100, py: (y / (rect.height - LENS)) * 100 });
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 relative z-[40]">
      {zoom && (
        <div
          className="hidden lg:block absolute top-0 left-[calc(100%+24px)] w-[520px] aspect-square bg-white z-50 rounded-2xl shadow-premium border border-black/10 pointer-events-none"
          style={{ backgroundImage: `url(${images[index]})`, backgroundRepeat: "no-repeat", backgroundSize: "260%", backgroundPosition: `${zoom.px}% ${zoom.py}%` }}
          aria-hidden
        />
      )}

      {many && (
        <div className="order-2 lg:order-1 flex lg:flex-col gap-2 overflow-x-auto lg:overflow-y-auto hide-scrollbar pb-2 lg:pb-0 w-full lg:w-[76px] lg:max-h-[560px] shrink-0">
          {images.map((src, i) => (
            <button
              key={src + i}
              onClick={() => go(i)}
              onMouseEnter={() => go(i)}
              aria-label={`Show image ${i + 1}`}
              className={`relative w-16 h-16 lg:w-20 lg:h-20 shrink-0 rounded-xl overflow-hidden border transition-all duration-300 bg-white ${i === index ? "border-primary opacity-100" : "border-black/10 opacity-70 hover:opacity-100"}`}
            >
              <Image src={src} alt="" fill sizes="80px" className="object-contain p-1" />
            </button>
          ))}
        </div>
      )}

      <div
        ref={boxRef}
        className="order-1 lg:order-2 flex-1 w-full aspect-square relative overflow-hidden rounded-2xl lg:cursor-crosshair bg-white border border-black/5"
        onMouseMove={onMove}
        onMouseLeave={() => setZoom(null)}
      >
        {images.map((src, i) => (
          <Image
            key={src + i}
            src={src}
            alt={i === 0 ? name : `${name} view ${i + 1}`}
            fill
            sizes="(min-width: 1024px) 45vw, 100vw"
            priority={i === 0}
            className={`object-contain p-4 md:p-8 transition-opacity duration-700 ${i === index ? "opacity-100 z-10" : "opacity-0 z-0"}`}
          />
        ))}
        {zoom && (
          <div
            className="hidden lg:block absolute pointer-events-none z-30"
            style={{ left: zoom.x, top: zoom.y, width: LENS, height: LENS, backgroundColor: "rgba(0,160,255,0.15)", border: "1px solid rgba(0,160,255,0.4)" }}
          />
        )}
        {many && (
          <>
            <button onClick={() => go(index - 1)} aria-label="Previous image" className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 hover:bg-white text-primary flex items-center justify-center transition-all z-20 border border-white/40 shadow-md">
              <ChevronLeft size={20} />
            </button>
            <button onClick={() => go(index + 1)} aria-label="Next image" className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 hover:bg-white text-primary flex items-center justify-center transition-all z-20 border border-white/40 shadow-md">
              <ChevronRight size={20} />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
