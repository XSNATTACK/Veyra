"use client";

import type { ReactNode } from "react";

/**
 * Browser mockup frame — traffic lights, URL pill, rounded viewport.
 * Makes generative visuals read as real shipped websites (Kota proof language).
 */
export function BrowserFrame({
  children,
  url = "veyra.studio",
  className,
  dark = true,
}: {
  children: ReactNode;
  url?: string;
  className?: string;
  dark?: boolean;
}) {
  return (
    <div
      className={`overflow-hidden rounded-2xl border sm:rounded-3xl ${
        dark ? "border-[#F4F2ED]/15 bg-[#0D0D10]" : "border-black/10 bg-white"
      } ${className ?? ""}`}
    >
      <div
        className={`flex items-center gap-3 border-b px-4 py-3 ${
          dark ? "border-[#F4F2ED]/10" : "border-black/10"
        }`}
        aria-hidden="true"
      >
        <span className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#FF5F57]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#FEBC2E]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#28C840]" />
        </span>
        <span
          className={`meta mx-auto flex max-w-[60%] items-center gap-2 truncate rounded-full px-4 py-1 text-[10px] tracking-[0.08em] ${
            dark ? "bg-[#F4F2ED]/8 text-[#A7A5A0]" : "bg-black/5 text-black/50"
          }`}
        >
          <span className="inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-[#FF4D00]" />
          <span className="truncate">{url}</span>
        </span>
        <span className={`w-10 shrink-0 ${dark ? "text-[#6E6D6A]" : "text-black/30"}`}>···</span>
      </div>
      <div className="relative">{children}</div>
    </div>
  );
}

/**
 * Inline headline media chip — small rounded live visual embedded
 * mid-sentence in display type (Kota's signature headline motif).
 */
export function HeadlineChip({
  children,
  className,
  label,
}: {
  children: ReactNode;
  className?: string;
  label: string;
}) {
  return (
    <span
      role="img"
      aria-label={label}
      className={`relative mx-[0.12em] inline-block h-[0.72em] w-[1.7em] shrink-0 overflow-hidden rounded-full align-[-0.08em] ${className ?? ""}`}
    >
      <span className="absolute inset-0">{children}</span>
    </span>
  );
}
