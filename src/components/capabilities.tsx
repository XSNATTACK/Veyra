"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import { ArrowUpRight, Plus } from "lucide-react";
import { EASE_SNAP } from "./motion-tokens";

const services = [
  {
    n: "01",
    title: "Business Websites",
    body: "A single sharp website built to earn its traffic.",
    detail:
      "Message-first structure, editorial type, and a conversion path that stays visible without shouting. Live example: banyulancar.web.id.",
    timeline: "1–2 weeks",
    deliverables: ["Full website"],
    price: "50$ (negotiable)",
  },
  {
    n: "02",
    title: "Web Applications",
    body: "Complex workflows rebuilt as clean, intuitive interfaces.",
    detail:
      "State-aware views, role-scoped surfaces, and empty states designed — never defaulted. Live example: tradionapp.com.",
    timeline: "2–4 weeks",
    deliverables: ["App", "API wiring"],
    price: "450$ (negotiable)",
  },
  {
    n: "03",
    title: "Digital Products",
    body: "From concept and interface through production.",
    detail:
      "Smallest testable core loop first, tokens earned from real screens, iteration kept cheap. Live example: bdacapital.vercel.app/.",
    timeline: "3–6 weeks",
    deliverables: ["Product", "System"],
    price: "scoped",
  },
];

/**
 * Kota-style service timeline — accordion cards with
 * timeline badge, deliverable chips, price + CTA.
 */
export function CapabilityAccordion() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div role="list">
      {services.map((s, i) => {
        const isOpen = open === i;
        return (
          <motion.div
            key={s.n}
            role="listitem"
            initial={{ opacity: 0, y: 48 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.7, delay: i * 0.06, ease: EASE_SNAP }}
            className={`border-t border-[#F4F2ED]/10 transition-colors last:border-b ${
              isOpen ? "bg-[#F4F2ED]/[0.03]" : "hover:bg-[#F4F2ED]/[0.02]"
            }`}
          >
            <button
              className="grid w-full grid-cols-[auto_1fr_auto] items-baseline gap-4 px-2 py-8 text-left sm:gap-8 sm:px-4"
              onClick={() => setOpen(isOpen ? null : i)}
              aria-expanded={isOpen}
              aria-controls={`service-panel-${s.n}`}
            >
              <span className="meta tnum text-sm text-[#FF4D00]">{s.n}</span>
              <span>
                <span className="font-display block text-3xl font-bold tracking-tight sm:text-5xl">
                  {s.title}
                </span>
                <span className="mt-2 block text-sm text-[#A7A5A0] sm:text-base">{s.body}</span>
                <span className="mt-4 flex flex-wrap items-center gap-2">
                  <span className="meta inline-flex items-center rounded-full border border-[#FF4D00]/35 bg-[#FF4D00]/10 px-3 py-1 text-[10px] tracking-[0.16em] uppercase">
                    ◷ {s.timeline}
                  </span>
                  {s.deliverables.map((d) => (
                    <span
                      key={d}
                      className="meta hidden rounded-full border border-[#F4F2ED]/15 px-3 py-1 text-[10px] tracking-[0.16em] text-[#A7A5A0] uppercase sm:inline-flex"
                    >
                      {d}
                    </span>
                  ))}
                  <span className="meta tnum inline-flex rounded-full bg-[#F4F2ED] px-3 py-1 text-[10px] font-bold tracking-[0.16em] text-black uppercase">
                    {s.price}
                  </span>
                </span>
              </span>
              <motion.span
                animate={{ rotate: isOpen ? 45 : 0 }}
                transition={{ duration: 0.3, ease: EASE_SNAP }}
                className={`inline-flex h-11 w-11 items-center justify-center rounded-full border transition-colors ${
                  isOpen ? "border-[#FF4D00] bg-[#FF4D00] text-white" : "border-[#F4F2ED]/20"
                }`}
              >
                <Plus aria-hidden size={18} />
              </motion.span>
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  id={`service-panel-${s.n}`}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.45, ease: EASE_SNAP }}
                  className="overflow-hidden"
                >
                  <div className="grid gap-6 px-2 pb-8 sm:px-4 sm:pl-14 lg:grid-cols-[1fr_auto] lg:items-end">
                    <p className="max-w-2xl text-sm leading-relaxed text-[#A7A5A0] sm:text-base">
                      {s.detail}
                    </p>
                    <Link
                      href="/contact"
                      className="group meta inline-flex w-fit items-center gap-2 rounded-full bg-[#F4F2ED] px-5 py-3 text-[11px] font-bold tracking-[0.16em] text-black uppercase transition-colors hover:bg-[#FF4D00] hover:text-white"
                    >
                      Start a project
                      <ArrowUpRight size={14} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden />
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
}

const manifest: { group: string; items: string[] }[] = [
  { group: "Design", items: ["UI / UX", "Design systems", "Interaction", "Motion"] },
  { group: "Development", items: ["React", "TypeScript", "Next.js / Vite", "Supabase", "APIs", "Responsive systems"] },
  { group: "Product", items: ["Prototyping", "Architecture", "Iteration", "Performance", "Deployment"] },
];

export function Manifest() {
  return (
    <div className="grid gap-px overflow-hidden rounded-3xl border border-[#F4F2ED]/10 bg-[#F4F2ED]/10 sm:grid-cols-3">
      {manifest.map((m) => (
        <div key={m.group} className="group bg-[#0A0A0B] p-6 transition-colors duration-300 hover:bg-[#F4F2ED] hover:text-[#0A0A0B] sm:p-8">
          <p className="eyebrow">{m.group}</p>
          <ul className="font-display mt-5 space-y-2 text-xl font-semibold sm:text-2xl">
            {m.items.map((item) => (
              <li key={item} className="transition-colors hover:text-[#FF4D00]">{item}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
