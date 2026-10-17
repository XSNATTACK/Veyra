import type { Metadata } from "next";
import { projects } from "@/content/projects";
import { ProjectCard } from "@/components/project-card";
import { DrawRule } from "@/components/motion";
import { SplitText } from "@/components/split-text";
import { Reveal } from "@/components/reveal";

export const metadata: Metadata = {
  title: "Selected Work",
  description: "Selected websites, web applications, and digital products — designed and built independently.",
  alternates: { canonical: "/work" },
};

export default function WorkIndex() {
  return (
    <div className="wrap pt-32 sm:pt-44" aria-labelledby="work-index-title">
      <Reveal>
        <p className="eyebrow">Work — Index</p>
        <h1 id="work-index-title" className="font-display display-1 mt-5 font-medium">
          <SplitText text="Selected work." />
        </h1>
        <p className="lede mt-5 max-w-2xl">
          A small number of projects, shown with substance. Each entry opens into
          a full case study — challenge, approach, solution, and build decisions.
        </p>
        <p className="meta mt-6 text-[11px] tracking-[0.2em] text-[#6E6D6A] uppercase">
          {String(projects.length).padStart(2, "0")} projects — 2024 / 2026
        </p>
      </Reveal>
      <DrawRule className="mt-8" />
      <div className="mt-6">
        {projects.map((p, i) => (
          <ProjectCard key={p.slug} project={p} flip={i % 2 === 1} />
        ))}
      </div>
    </div>
  );
}
