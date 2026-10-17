import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { getNextProject, getProject, projects } from "@/content/projects";
import { ProjectShot } from "@/components/service-visuals";
import { CaseHeroVisual } from "@/components/displacement-visual";
import { BrowserFrame } from "@/components/browser-frame";
import { CaseChapters } from "@/components/case-chapters";
import { SplitText } from "@/components/split-text";
import { Parallax } from "@/components/motion";
import { ClipReveal, Reveal } from "@/components/reveal";

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = getProject(slug);
  if (!p) return { title: "Project not found" };
  return {
    title: `${p.title} — ${p.category}`,
    description: p.summary,
    alternates: { canonical: `/work/${p.slug}` },
    openGraph: { title: `${p.title} — VEYRA`, description: p.summary, type: "article" },
  };
}

function Block({ eyebrow, index, id, children }: { eyebrow: string; index: string; id: string; children: React.ReactNode }) {
  return (
    <Reveal>
      <div id={id} className="grid scroll-mt-28 gap-4 py-10 sm:grid-cols-12 sm:gap-8">
        <p className="eyebrow sm:col-span-3 sm:pt-1">
          <span className="mr-3 text-[#FF4D00]">{index}</span>
          {eyebrow}
        </p>
        <div className="space-y-4 text-[1.05rem] leading-relaxed text-[#D8D6D0] sm:col-span-8 sm:col-start-5">
          {children}
        </div>
      </div>
    </Reveal>
  );
}

export default async function CaseStudy({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();
  const next = getNextProject(slug);

  return (
    <article className="wrap pt-32 sm:pt-44" aria-labelledby="case-title">
      <Reveal>
        <Link href="/work" className="meta inline-flex items-center gap-2 text-xs tracking-[0.18em] uppercase text-[#A7A5A0] hover:text-white">
          <ArrowLeft size={14} aria-hidden /> Work index
        </Link>
        <p className="font-display mt-6 text-xl font-bold text-[#FF4D00]">№ {project.index}</p>
        <h1 id="case-title" className="font-display display-1 mt-2 font-medium"><SplitText text={project.title} /></h1>
        <div className="meta mt-6 flex flex-wrap gap-x-8 gap-y-2 text-[11px] tracking-[0.2em] uppercase text-[#A7A5A0]">
          <span>{project.category}</span>
          <span>{project.year}</span>
          <span>{project.role}</span>
        </div>
        <p className="lede mt-6 max-w-3xl">{project.summary}</p>
      </Reveal>

      <ClipReveal className="mt-10">
        <div className="frame overflow-hidden">
          {project.visualKind === "image" && project.heroImage ? (
            <BrowserFrame url={project.liveUrl ?? `veyra.studio/work/${project.slug}`}>
              <ProjectShot project={project} />
            </BrowserFrame>
          ) : (
            <CaseHeroVisual motif={project.motif} nextMotif={next.motif} index={project.index} title={project.title} />
          )}
        </div>
      </ClipReveal>

      {/* at a glance — factual record, no fabricated metrics */}
      <Reveal>
        <dl className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-[#F4F2ED]/10 bg-[#F4F2ED]/10 sm:grid-cols-4">
          {[
            { k: "Category", v: project.category },
            { k: "Year", v: project.year },
            { k: "Role", v: project.role },
            { k: "Stack", v: project.stack.slice(0, 3).join(" / ") },
          ].map((f) => (
            <div key={f.k} className="bg-[#0A0A0B] p-5 sm:p-6">
              <dt className="meta text-[10px] tracking-[0.22em] text-[#6E6D6A] uppercase">{f.k}</dt>
              <dd className="font-display mt-2 text-lg leading-snug font-bold">{f.v}</dd>
            </div>
          ))}
        </dl>
      </Reveal>

      <div className="mt-6 grid gap-10 lg:grid-cols-[200px_1fr]">
        <CaseChapters
          items={[
            { id: "challenge", label: "Challenge" },
            { id: "approach", label: "Approach" },
            { id: "solution", label: "Solution" },
            { id: "features", label: "Features" },
            { id: "design", label: "Design" },
            { id: "development", label: "Development" },
            ...(project.outcome ? [{ id: "outcome", label: "Outcome" }] : []),
          ]}
        />
        <div className="min-w-0">
      <div className="rule divide-y divide-[#F4F2ED]/10">
        <Block eyebrow="The challenge" index="01" id="challenge">
          {project.challenge.map((t, i) => <p key={i}>{t}</p>)}
        </Block>
        <Block eyebrow="The approach" index="02" id="approach">
          {project.approach.map((t, i) => <p key={i}>{t}</p>)}
        </Block>
        {/* pull quote — the project's own thesis, set large */}
        {project.solution[0] && (
          <Reveal>
            <blockquote className="border-l-2 border-[#FF4D00] py-10 pl-6 sm:pl-10">
              <p className="font-display display-3 font-bold tracking-tight text-[#F4F2ED]">
                “{project.solution[0]}”
              </p>
            </blockquote>
          </Reveal>
        )}
        <Block eyebrow="The solution" index="03" id="solution">
          {project.solution.map((t, i) => <p key={i}>{t}</p>)}
        </Block>
      </div>

      <Reveal>
        <div id="features" className="scroll-mt-28 border-t border-[#F4F2ED]/10 py-10">
          <p className="eyebrow"><span className="mr-3 text-[#FF4D00]">04</span>Key features</p>
          <div className="mt-6 grid gap-px overflow-hidden border border-[#F4F2ED]/10 bg-[#F4F2ED]/10 sm:grid-cols-2">
            {project.features.map((f, i) => (
              <Reveal key={f.title} delay={(i % 2) * 0.08}>
                <div className="group h-full bg-[#0A0A0B] p-6 transition-colors duration-300 hover:bg-[#101013] sm:p-8">
                  <p className="meta text-[11px] text-[#FF4D00]">F.{i + 1}</p>
                  <h3 className="font-display mt-2 text-xl font-semibold transition-transform duration-300 group-hover:translate-x-1">{f.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#A7A5A0]">{f.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </Reveal>

      <div className="divide-y divide-[#F4F2ED]/10 border-t border-[#F4F2ED]/10">
        <Block eyebrow="Design" index="05" id="design">
          {project.design.map((t, i) => <p key={i}>{t}</p>)}
        </Block>
        <Block eyebrow="Development" index="06" id="development">
          {project.development.map((t, i) => <p key={i}>{t}</p>)}
          <ul className="meta flex flex-wrap gap-x-3 gap-y-1 pt-3 text-xs tracking-[0.12em] text-[#6E6D6A] uppercase">
            {project.stack.map((s, i) => (
              <li key={s} className="transition-colors hover:text-white">
                {s}{i < project.stack.length - 1 && <span aria-hidden className="pl-3 text-[#FF4D00]">/</span>}
              </li>
            ))}
          </ul>
        </Block>
        {project.outcome && (
          <Block eyebrow="Outcome" index="07" id="outcome">
            {project.outcome.map((t, i) => <p key={i}>{t}</p>)}
          </Block>
        )}
      </div>
        </div>
      </div>

      <ClipReveal className="mt-6">
        <Parallax speed={60} className="frame">
          <ProjectShot project={project} closing />
        </Parallax>
      </ClipReveal>

      <Reveal>
        <Link
          href={`/work/${next.slug}`}
          className="group mt-14 block overflow-hidden border-t border-[#F4F2ED]/10 py-10"

          aria-label={`Next project: ${next.title}`}
        >
          <span className="eyebrow">Next project — {next.index}</span>
          <span className="font-display display-2 mt-3 flex items-center gap-4 font-bold transition-colors duration-300 group-hover:text-[#FF4D00]">
            {next.title}
            <ArrowUpRight size={36} aria-hidden className="cta-arrow shrink-0 transition-transform duration-500 group-hover:rotate-45" />
          </span>
          <span className="mt-2 block text-[#A7A5A0]">{next.summary}</span>
        </Link>
      </Reveal>
    </article>
  );
}
