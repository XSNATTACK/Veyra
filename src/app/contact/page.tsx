import type { Metadata } from "next";
import { site } from "@/config/site";
import { ContactForm } from "@/components/contact-form";
import { SplitText } from "@/components/split-text";
import { Reveal } from "@/components/reveal";

export const metadata: Metadata = {
  title: "Contact",
  description: "Start a project — tell us what you're working on and what needs to be built.",
  alternates: { canonical: "/contact" },
};

export default function Contact() {
  return (
    <div className="wrap pt-32 sm:pt-44" aria-labelledby="contact-title">
      <div className="grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <Reveal>
            <p className="eyebrow">Contact — Inquiry</p>
            <h1 id="contact-title" className="font-display display-2 mt-4 font-medium">
              <SplitText text="Have something worth building?" />
            </h1>
            <p className="lede mt-5">
              Tell us what you&apos;re working on, where you&apos;re trying to go,
              and what needs to be built.
            </p>
            <dl className="meta mt-8 space-y-3 text-[11px] tracking-[0.18em] uppercase">
              <div className="flex gap-4"><dt className="w-20 text-[#6E6D6A]">Email</dt><dd><a className="u-link" href={`mailto:${site.email}`}>{site.email}</a></dd></div>
              <div className="flex gap-4"><dt className="w-20 text-[#6E6D6A]">Base</dt><dd>{site.location}</dd></div>
              <div className="flex gap-4"><dt className="w-20 text-[#6E6D6A]">Reply</dt><dd>Within two business days</dd></div>
            </dl>
            <p className="mt-8 max-w-sm text-sm leading-relaxed text-[#6E6D6A]">
              Short, honest briefs get the fastest replies. Budget and timeline
              ranges are enough — precision can wait for the call.
            </p>
          </Reveal>
        </div>
        <div className="lg:col-span-7">
          <Reveal delay={0.1}>
            <ContactForm />
          </Reveal>
        </div>
      </div>
    </div>
  );
}
