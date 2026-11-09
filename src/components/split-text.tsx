/**
 * Split-text — static version (reveal animations removed 2026-11-09).
 * Renders plain text with the same exports/props as before, so callers
 * don't change. Restore the animated versions from split-text.tsx.bak.
 */
export function SplitText({
  text,
  className,
}: {
  text: string;
  className?: string;
  delay?: number;
  stagger?: number;
  as?: "span" | "div" | "h1" | "h2";
}) {
  return (
    <span className={className} aria-label={text}>
      {text}
    </span>
  );
}

export function SplitScrub({ text, className }: { text: string; className?: string }) {
  return (
    <span className={className} aria-label={text}>
      {text}
    </span>
  );
}
