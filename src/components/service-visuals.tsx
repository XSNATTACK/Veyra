"use client";

import Image from "next/image";
import type { Project } from "@/content/projects";
import { GenerativeVisual } from "./generative-visual";

/**
 * Service preview visuals — actual shipped screenshots.
 *
 * - Business Websites  → public/work/Banyulancarss.png
 * - Web Applications   → public/work/Tradionss.png
 *
 * Save your screenshots to those paths (PNG/JPG/WebP).
 * Framed top-aligned so the hero + nav read instantly inside the 16/10 viewport.
 */

function Shot({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="relative h-full w-full overflow-hidden bg-[#0D0D10]">
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 1024px) 100vw, 50vw"
        className="object-cover object-top"
        priority={false}
      />
    </div>
  );
}

export function TradionPreview() {
  return <Shot src="/work/Tradionss.png" alt="Tradion — Learn to read markets with a coach beside you" />;
}

export function PlumbingPreview() {
  return <Shot src="/work/Banyulancarss.png" alt="Banyu Lancar Plumbing — Saluran mampet atau pipa bocor, kami siap bantu" />;
}

/**
 * Project display visual — real screenshot when the project has one,
 * generative canvas otherwise. Shared by cards, showcase, and case pages.
 */
export function ProjectShot({
  project,
  closing = false,
  priority = false,
}: {
  project: Project;
  closing?: boolean;
  priority?: boolean;
}) {
  if (project.visualKind === "image" && project.heroImage) {
    return (
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#0D0D10] sm:aspect-[21/10]">
        <Image
          src={project.heroImage}
          alt={project.imageAlt ?? `${project.title} — ${project.category} screenshot`}
          fill
          priority={priority}
          sizes={priority ? "(max-width: 1024px) 100vw, 1344px" : "(max-width: 1024px) 100vw, 60vw"}
          className="object-cover object-top"
        />
      </div>
    );
  }
  return (
    <GenerativeVisual
      motif={project.motif}
      index={project.index}
      title={closing ? `${project.title} — closing visual` : project.title}
    />
  );
}
