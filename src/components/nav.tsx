"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { site } from "@/config/site";
import { RollLink } from "./motion";
import { EASE_CURTAIN, EASE_EXPO } from "./motion-tokens";

export function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 24);
      // hide on scroll down, reveal on scroll up (desktop polish; never hides at top)
      setHidden(y > 400 && y > last + 4);
      if (y < last - 4) setHidden(false);
      last = y;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open ]);

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 border-b transition-all duration-500 ${
          hidden ? "-translate-y-full" : "translate-y-0"
        } ${
          scrolled
            ? "border-[#F4F2ED]/10 bg-[#0A0A0B]/85 shadow-[0_12px_40px_-20px_rgba(0,0,0,0.9)] backdrop-blur-md"
            : "border-transparent bg-transparent"
        }`}
      >
        <div className={`wrap flex items-center justify-between transition-all duration-500 ${scrolled ? "h-16 sm:h-20" : "h-20 sm:h-24"}`}>
          <Link href="/" className="group flex items-center gap-2.5" aria-label="VEYRA — home">
            <Image
              src={site.logo}
              alt="VEYRA"
              width={96}
              height={80}
              className="h-8 w-auto sm:h-9"
              priority
            />
            <motion.span
              aria-hidden
              className="inline-block h-2 w-2 rounded-full bg-[#FF4D00] shadow-[0_0_12px_rgba(255,77,0,0.9)]"
              animate={{ scale: [1, 1.6, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            />
          </Link>
          <nav className="hidden items-center gap-8 md:flex" aria-label="Primary">
            {site.nav.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`u-link text-sm font-medium tracking-[0.08em] uppercase transition-colors ${
                    active ? "text-[#F4F2ED]" : "text-[#A7A5A0] hover:text-[#F4F2ED]"
                  }`}
                >
                  {active && <span className="mr-1.5 inline-block h-1 w-1 rounded-full bg-[#FF4D00]" aria-hidden />}
                  <RollLink>{item.label}</RollLink>
                </Link>
              );
            })}
            <span
              className="meta hidden items-center gap-2 rounded-full border border-[#FF4D00]/30 bg-[#FF4D00]/10 px-3 py-1.5 text-[10px] tracking-[0.18em] text-[#F4F2ED] uppercase lg:inline-flex"
              aria-label="Available for new projects"
            >
              <motion.span
                aria-hidden
                className="inline-block h-1.5 w-1.5 rounded-full bg-[#FF4D00] shadow-[0_0_10px_rgba(255,77,0,0.9)]"
                animate={{ opacity: [1, 0.3, 1], scale: [1, 0.8, 1] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
              />
              Available
            </span>
            <Link
              href="/contact"
              className="group btn-outline inline-flex items-center gap-1 border border-[#F4F2ED]/20 px-4 py-2 text-sm font-semibold tracking-[0.08em] uppercase"
            >
              Start a project
              <ArrowUpRight size={14} className="cta-arrow text-[#FF4D00]" aria-hidden />
            </Link>
          </nav>
          <button
            className="inline-flex h-11 w-11 items-center justify-center md:hidden"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            aria-expanded={open}
          >
            <Menu size={22} aria-hidden />
          </button>
        </div>
      </header>

      {/* Fullscreen mobile menu — character edition */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ clipPath: "inset(0 0 100% 0)" }}
            animate={{ clipPath: "inset(0 0 0% 0)" }}
            exit={{ clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 0.5, ease: EASE_CURTAIN }}
            className="fixed inset-0 z-[70] flex flex-col overflow-hidden bg-[#0C0C0E] md:hidden"
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
          >
            {/* ghost word */}
            <span
              aria-hidden
              className="font-display pointer-events-none absolute -bottom-8 left-0 select-none text-[26vw] leading-none font-extrabold tracking-tight whitespace-nowrap text-[#F4F2ED]/[0.04]"
            >
              MENU®
            </span>
            <div
              aria-hidden
              className="pointer-events-none absolute -top-24 right-0 h-72 w-72 rounded-full opacity-25 blur-[100px]"
              style={{ background: "#FF4D00" }}
            />
            <div className="wrap relative flex h-16 items-center justify-between">
              <Image src={site.logo} alt="VEYRA" width={84} height={70} className="h-7 w-auto" />
              <button
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#F4F2ED]/20"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
              >
                <X size={22} aria-hidden />
              </button>
            </div>
            <nav className="wrap relative flex flex-1 flex-col justify-center gap-1" aria-label="Mobile">
              {site.nav.map((item, i) => (
                <span key={item.href} className="block overflow-hidden border-b border-[#F4F2ED]/10">
                  <motion.span className="block" initial={{ y: "110%" }} animate={{ y: "0%" }} transition={{ duration: 0.6, delay: 0.15 + i * 0.07, ease: EASE_EXPO }}>
                    <Link
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className="font-display group flex items-baseline gap-4 py-3 text-5xl font-extrabold tracking-tight"
                    >
                      <span className="meta tnum text-xs text-[#FF4D00]">0{i + 1}</span>
                      <span className="transition-colors group-active:text-[#FF4D00]">{item.label}</span>
                      <ArrowUpRight size={26} aria-hidden className="ml-auto self-center text-[#FF4D00] opacity-0 transition-opacity group-active:opacity-100" />
                    </Link>
                  </motion.span>
                </span>
              ))}
              <motion.span
                className="block"
                initial={{ y: "110%", opacity: 0 }}
                animate={{ y: "0%", opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.45, ease: EASE_EXPO }}
              >
                <Link
                  href="/contact"
                  onClick={() => setOpen(false)}
                  className="font-display mt-6 inline-flex items-center gap-2 text-2xl text-[#FF4D00]"
                >
                  Start a project <ArrowUpRight aria-hidden />
                </Link>
              </motion.span>
            </nav>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.4 }}
              className="wrap relative flex items-center justify-between pb-8"
            >
              <p className="meta text-[11px] tracking-[0.2em] text-[#6E6D6A]">
                INDEPENDENT STUDIO — 2026
              </p>
              <p className="meta text-[11px] tracking-[0.2em] text-[#FF4D00]">
                AVAILABLE FOR WORK
              </p>
            </motion.div>
            <a href={`mailto:${site.email}`} className="wrap meta relative pb-6 text-xs tracking-[0.14em] text-[#A7A5A0] uppercase">
              {site.email}
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
