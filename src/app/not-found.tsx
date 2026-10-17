import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SplitText } from "@/components/split-text";

export default function NotFound() {
  return (
    <div className="wrap relative flex min-h-[70dvh] flex-col justify-center overflow-hidden pt-32" aria-labelledby="nf-title">
      {/* drifting backdrop numerals */}
      <div aria-hidden className="font-display pointer-events-none absolute -right-6 top-24 select-none text-[12rem] leading-none text-[#F4F2ED]/[0.04] sm:text-[20rem]">
        404
      </div>
      <p className="eyebrow">Error — 404 / Null route</p>
      <h1 id="nf-title" className="flicker font-display mt-4 text-[6rem] leading-none font-extrabold sm:text-[10rem]" aria-label="404">
        404
      </h1>
      <p className="font-display mt-2 text-2xl font-medium sm:text-4xl">
        <SplitText text="This page doesn't exist." />
      </p>
      <p className="lede mt-4 max-w-xl">
        The route was removed, renamed, or never shipped. The index, however, is intact.
      </p>
      <div className="mt-8">
        <Link
          href="/"

          className="group btn-primary inline-flex items-center gap-2 bg-[#F4F2ED] px-7 py-4 text-sm font-semibold tracking-[0.08em] text-black uppercase"
        >
          Return home
          <ArrowRight size={15} className="cta-arrow" aria-hidden />
        </Link>
      </div>
      <p className="meta mt-10 text-[11px] tracking-[0.2em] text-[#6E6D6A] uppercase">
        ERR_NO_ROUTE — Logged locally, reported nowhere
      </p>
    </div>
  );
}
