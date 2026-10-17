"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUp } from "lucide-react";
import { site } from "@/config/site";

/**
 * Monumental footer — link columns, divider, full-bleed giant
 * wordmark + back-to-top.
 */
export function Footer() {

  return (
    <footer className="bg-[#060607]" aria-label="Footer">
      <div className="wrap grid gap-12 pt-16 pb-12 sm:pt-24 md:grid-cols-12">
        <div className="md:col-span-5">
          <Link href="/" aria-label="VEYRA — home">
            <Image src={site.logo} alt="VEYRA" width={120} height={100} className="h-10 w-auto" />
          </Link>
          <p className="meta mt-6 text-sm leading-relaxed text-[#A7A5A0]">
            Independent digital studio.
            <br />
            Design / Development / Product.
          </p>
          <a href={`mailto:${site.email}`} className="u-link font-display mt-5 inline-block text-2xl font-semibold">
            {site.email}
          </a>
          <p className="meta mt-2 text-[11px] tracking-[0.2em] text-[#6E6D6A] uppercase">{site.location}</p>
        </div>
        <nav className="md:col-span-3" aria-label="Footer index">
          <p className="meta mb-5 text-[11px] tracking-[0.24em] text-[#6E6D6A] uppercase">Index</p>
          <ul className="font-display space-y-3 text-2xl font-medium tracking-tight">
            {site.nav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="u-link text-[#F4F2ED]/90 transition-colors hover:text-[#FF4D00]">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="md:col-span-4">
          <p className="meta mb-5 text-[11px] tracking-[0.24em] text-[#6E6D6A] uppercase">Socials</p>
          <ul className="font-display space-y-3 text-2xl font-medium tracking-tight">
            {[
              ["X (Twitter)", "https://x.com/"],
              ["Instagram", "https://instagram.com/"],
              ["LinkedIn", "https://linkedin.com/"],
            ].map(([label, href]) => (
              <li key={label}>
                <a href={href} target="_blank" rel="noreferrer" className="u-link text-[#F4F2ED]/90 transition-colors hover:text-[#FF4D00]">
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="wrap">
        <div className="border-t border-[#F4F2ED]/12" aria-hidden />
      </div>

      {/* giant wordmark */}
      <div className="wrap relative overflow-hidden pt-6" aria-hidden="true">
        <p className="font-display leading-[0.82] font-semibold tracking-[-0.04em] whitespace-nowrap text-[#F4F2ED] select-none" style={{ fontSize: "clamp(4rem, 17.5vw, 19rem)" }}>
          VEYRA<span className="text-[#FF4D00]">®</span>
        </p>
      </div>

      <div className="wrap flex flex-wrap items-center justify-between gap-4 py-7">
        <p className="meta text-[11px] tracking-[0.18em] text-[#A7A5A0] uppercase">
          Working worldwide
        </p>
        <p className="meta text-[11px] tracking-[0.18em] text-[#6E6D6A] uppercase">
          © 2026 {site.name} — All rights reserved
        </p>
        <span className="flex items-center gap-5">
          <Link href="/privacy" className="u-link meta text-[11px] tracking-[0.18em] text-[#6E6D6A] uppercase">Privacy</Link>
          <Link href="/terms" className="u-link meta text-[11px] tracking-[0.18em] text-[#6E6D6A] uppercase">Terms</Link>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            aria-label="Back to top"
            className="glass-pill inline-flex h-11 w-11 items-center justify-center rounded-full transition-colors hover:border-[#FF4D00] hover:text-[#FF4D00]"
          >
            <ArrowUp size={17} aria-hidden />
          </button>
        </span>
      </div>
    </footer>
  );
}
