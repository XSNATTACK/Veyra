import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CapabilityAccordion, Manifest } from "@/components/capabilities";
import { SplitText } from "@/components/split-text";
import { Reveal } from "@/components/reveal";
import { services } from "@/content/services";
import { projects } from "@/content/projects";
import { site } from "@/config/site";

export const metadata: Metadata = {
  title: "Web Design & Development Services",
  description:
    "Business websites, web applications, and digital products — designed and built end to end. Clear scope, fast turnaround, motion included. Working worldwide.",
  alternates: { canonical: "/services" },
};

/** Service structured data — one Service node per offering, cross-referenced to the site's Organization. */
const servicesJsonLd = {
  "@context": "https://schema.org",
  "@graph": services.map((s) => {
    const price = s.price.match(/\d+/)?.[0];
    return {
      "@type": "Service",
      name: s.title,
      serviceType: s.title,
      description: s.body,
      url: `${site.url}/services`,
      areaServed: "Worldwide",
      provider: { "@id": `${site.url}/#organization` },
      offers: {
        "@type": "Offer",
        name: `${s.title} engagement`,
        description: s.detail,
        url: `${site.url}/services`,
        ...(price ? { price, priceCurrency: "USD" } : {}),
      },
    };
  }),
};

export default function Services() {
  return (
    <div className="wrap pt-32 sm:pt-44" aria-labelledby="services-title">
      <Reveal>
        <p className="eyebrow">Services — Capabilities</p>
        <h1 id="services-title" className="font-display display-1 mt-5 font-medium">
          <SplitText text="What we build." />
        </h1>
        <p className="lede mt-5 max-w-2xl">
          The offering is deliberately narrow. Three things, done properly — no
          brochure language, no claimed services that cannot be delivered.
        </p>
      </Reveal>
      <div className="mt-12">
        <CapabilityAccordion />
      </div>
      <Reveal>
        <p className="mt-8 text-sm leading-relaxed text-[#A7A5A0]">
          Recent builds:{" "}
          {projects.map((p, i) => (
            <span key={p.slug}>
              <Link href={`/work/${p.slug}`} className="u-link text-[#F4F2ED]">
                {p.title}
              </Link>
              {i < projects.length - 1 && <span aria-hidden className="mx-2 text-[#6E6D6A]">·</span>}
            </span>
          ))}
        </p>
      </Reveal>
      <Reveal>
        <h2 className="font-display display-3 mt-20 font-semibold">Capability manifest.</h2>
        <p className="mt-3 max-w-2xl text-[#A7A5A0]">
          The working stack. Everything listed is in active use — nothing aspirational.
        </p>
      </Reveal>
      <div className="mt-8">
        <Manifest />
      </div>
      <Reveal>
        <div className="mt-14 border-t border-[#F4F2ED]/10 py-10">
          <Link
            href="/contact"
            className="group btn-primary inline-flex items-center gap-2 bg-[#F4F2ED] px-7 py-4 text-sm font-semibold tracking-[0.08em] text-black uppercase"
          >
            Discuss your project
            <ArrowRight size={15} className="cta-arrow" aria-hidden />
          </Link>
        </div>
      </Reveal>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(servicesJsonLd) }}
      />
    </div>
  );
}
