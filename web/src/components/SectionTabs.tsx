"use client";

import { useState } from "react";

// Tab bar whose panels open in place, below the bar.
export default function SectionTabs({ tabs }: { tabs: { id: string; label: string; content: React.ReactNode }[] }) {
  const [active, setActive] = useState(tabs[0]?.id);

  return (
    <div className="bg-white">
      <div className="border-y border-black/5">
        <div role="tablist" className="max-w-[90rem] mx-auto px-6 md:px-12 flex gap-6 md:gap-10 overflow-x-auto hide-scrollbar">
          {tabs.map((t) => (
            <button
              key={t.id}
              role="tab"
              id={`tab-${t.id}`}
              aria-selected={t.id === active}
              aria-controls={`panel-${t.id}`}
              onClick={() => setActive(t.id)}
              className={`py-4 text-xs font-bold uppercase tracking-widest whitespace-nowrap border-b-2 transition-colors ${t.id === active ? "border-primary text-primary" : "border-transparent text-secondary hover:text-primary"}`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>
      {tabs.map((t) => (
        <div key={t.id} role="tabpanel" id={`panel-${t.id}`} aria-labelledby={`tab-${t.id}`} hidden={t.id !== active} className="max-w-[90rem] mx-auto px-6 md:px-12 py-10 md:py-14 min-h-[16rem]">
          {t.content}
        </div>
      ))}
    </div>
  );
}
