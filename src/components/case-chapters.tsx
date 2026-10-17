"use client";

import { useEffect, useState } from "react";

/** Sticky chapter nav for case studies — scroll-spied active state. */
export function CaseChapters({ items }: { items: { id: string; label: string }[] }) {
  const [active, setActive] = useState(items[0]?.id);

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setActive(e.target.id);
        }
      },
      { rootMargin: "-30% 0px -60% 0px" },
    );
    items.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, [items]);

  return (
    <nav aria-label="Case chapters" className="hidden self-start lg:sticky lg:top-28 lg:block">
      <p className="meta text-[10px] tracking-[0.24em] text-[#6E6D6A] uppercase">Chapters</p>
      <ol className="mt-4 space-y-1">
        {items.map((c, i) => {
          const on = active === c.id;
          return (
            <li key={c.id}>
              <a
                href={`#${c.id}`}
                aria-current={on ? "true" : undefined}
                className={`group meta flex items-baseline gap-3 py-1.5 text-xs tracking-[0.12em] uppercase transition-colors ${
                  on ? "text-[#F4F2ED]" : "text-[#6E6D6A] hover:text-[#A7A5A0]"
                }`}
              >
                <span className={`tnum text-[10px] transition-colors ${on ? "text-[#FF4D00]" : ""}`}>
                  0{i + 1}
                </span>
                <span className="relative">
                  {c.label}
                  <span
                    aria-hidden
                    className={`absolute -bottom-0.5 left-0 h-px bg-[#FF4D00] transition-all duration-300 ${
                      on ? "w-full" : "w-0 group-hover:w-full"
                    }`}
                  />
                </span>
              </a>
            </li>
          );
        })}
      </ol>
      <a
        href="/contact"
        className="u-link meta mt-6 inline-block text-[11px] tracking-[0.18em] uppercase"
      >
        Start yours <span className="text-[#FF4D00]">→</span>
      </a>
    </nav>
  );
}
