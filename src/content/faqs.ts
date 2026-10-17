export interface FaqItem {
  q: string;
  a: string;
}

/**
 * Shared FAQ content — rendered by the homepage accordion and mirrored
 * as FAQPage structured data. Keep answers literal; they are indexed.
 */
export const faqs: FaqItem[] = [
  {
    q: "Who is this for?",
    a: "Founders, SaaS teams, and businesses who need a site that looks like a $10k build without the $10k timeline. If you need something live in weeks, not months, you're in the right place.",
  },
  {
    q: "What do you actually help with?",
    a: "Four things: business websites that convert, web applications with complex workflows, digital products from concept to production, and AI-enabled experiences where AI creates genuine utility. Pick one, or all four.",
  },
  {
    q: "Are you a designer, or do you also build?",
    a: "Both. Design and build happen here — no handoff, no waiting on a separate developer to translate the Figma file. What you approve is what ships.",
  },
  {
    q: "How fast can we start?",
    a: "Usually right away. The practice stays small by design so turnaround is fast — tell us your deadline and we'll confirm what's realistic before anything is signed.",
  },
  {
    q: "What happens after launch?",
    a: "Every project includes 2 weeks of post-launch support for fixes. Need anything beyond that? We scope and price it separately — no retainer trap.",
  },
];
