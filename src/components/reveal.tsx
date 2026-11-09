import type { ReactNode } from "react";

/**
 * Static versions (fade-ins removed 2026-11-09).
 * Same exports/props as before so callers don't change.
 * Restore the animated originals from reveal.tsx.bak.
 */
export function Reveal({
  children,
  className,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  x?: number;
  scale?: number;
  className?: string;
}) {
  return <div className={className}>{children}</div>;
}

export function ClipReveal({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={className}>{children}</div>;
}
