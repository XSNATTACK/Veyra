const TEXT =
  "You've already built something great. Whether it's taking shape or already scaling — it deserves a website that matches the work you put in.";

/**
 * Statement — static version (reveal removed 2026-11-09).
 * Restore the scroll-scrubbed word reveal from statement.tsx.bak.
 */
export function Statement() {
  return (
    <section className="relative" aria-label="Studio premise">
      <div className="wrap flex flex-col justify-center py-32">
        <p className="eyebrow eyebrow-sovereign">The premise</p>
        <p className="font-display mt-8 max-w-6xl text-[clamp(2rem,5vw,4.5rem)] leading-[1.05] font-medium tracking-tight">
          {TEXT}
        </p>
      </div>
    </section>
  );
}
