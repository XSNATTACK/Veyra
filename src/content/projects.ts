export type ProjectVisualKind = "generative" | "image";

export interface Project {
  slug: string;
  index: string;
  title: string;
  summary: string;
  category: string;
  year: string;
  role: string;
  services: string[];
  stack: string[];
  visualKind: ProjectVisualKind;
  /** Visual motif seed — drives the generative composition. Replace with real imagery when available. */
  motif: "grid" | "ledger" | "field" | "signal";
  /** Live deployed URL shown in browser pills. */
  liveUrl?: string;
  heroImage?: string;
  gallery?: string[];
  challenge: string[];
  approach: string[];
  solution: string[];
  features: { title: string; body: string }[];
  design: string[];
  development: string[];
  /** Omit outcome when no real data exists. Never fabricate metrics. */
  outcome?: string[];
}

export const projects: Project[] = [
  {
    slug: "baanthong",
    index: "01",
    title: "BaanThong",
    summary: "Authentic Thai-food restaurant with authentic spices.",
    category: "Business Website",
    year: "2025",
    role: "Design / Build",
    services: ["Interface design", "Development", "Menu structure", "Local info"],
    stack: ["React", "TypeScript", "Next.js", "Responsive system"],
    visualKind: "image",
    heroImage: "/work/Baanthong.png",
    motif: "grid",
    liveUrl: "baanthong.netlify.app/",
    challenge: [
      "BaanThong needed a home worthy of its food: an authentic Thai street-food restaurant in Serpong Utara whose story, signature dishes, and visit details lived nowhere coherent online.",
      "The page had to do three jobs at once — sell the craving (menu), earn the trust (story and heritage), and get people through the door (hours, address, GoFood ordering).",
    ],
    approach: [
      "Structured the page like a visit: craving first with hero and signature dishes, then story and heritage, then the full categorized menu, gallery, and visit details last.",
      "Kept every conversion path visible — Explore Menu, the GoFood order link, contact details — so appetite never hits a dead end.",
    ],
    solution: [
      "A single-page restaurant site covering story, signature dishes, full menu (starters, mains, desserts), gallery, and visit info with opening hours, address, and phone.",
      "Direct ordering through the GoFood link plus a contact section, so both dine-in and delivery visitors know exactly what to do next.",
    ],
    features: [
      { title: "Signature dishes", body: "Curry, pad thai, and soup selections presented first to create appetite before detail." },
      { title: "Full categorized menu", body: "Appetizers, signature mains, and desserts with descriptions, ending in GoFood ordering." },
      { title: "Story and heritage", body: "Philosophy, craft, and team-note sections that give the restaurant a voice." },
      { title: "Visit section", body: "Address, Tue–Sun hours, phone, and message form — everything needed to show up." },
    ],
    design: [
      "Warm, appetite-led art direction: dark surfaces with rich food photography, editorial type for statements, quiet sans for menu reading.",
      "One deliberate column of sections on mobile — hero, story, menu, gallery, visit — same order, recomposed, not shrunk.",
    ],
    development: [
      "Component-driven build with reusable type, menu-card, and section primitives. Semantic HTML with a real heading outline across menu categories.",
      "Static-first rendering with per-page metadata, sitemap, and structured data for the restaurant listing.",
    ],
  },
  {
    slug: "didesa",
    index: "02",
    title: "DIDESA",
    summary: "Indonesian cuisine to connect the bridge of calmness and taste.",
    category: "Business Website",
    year: "2025",
    role: "Design / Build",
    services: ["Interface design", "Development", "Menu structure", "Reservations"],
    stack: ["React", "TypeScript", "Next.js", "Responsive system"],
    visualKind: "image",
    heroImage: "/work/DIDESA.png",
    motif: "ledger",
    liveUrl: "didesaseleranusantara.netlify.app/",
    challenge: [
      "DIDESA Selera Nusantara serves Indonesian cuisine in Tangerang Selatan, but the site had to carry the whole experience: tradition, menu, gallery, table reservation, and location.",
      "The core conversion is a WhatsApp reservation — everything on the page must steer a hungry visitor toward that single chat tap.",
    ],
    approach: [
      "Built the page around the visit flow: hero with cuisine promise, tradition section for warmth, menu for craving, gallery for proof, reservation and location to close.",
      "Made the WhatsApp reservation the one repeated action, with its own dedicated section plus nav placement.",
    ],
    solution: [
      "A calm, warm single-page restaurant site: Beranda, Menu, Galeri, Reservasi, and Lokasi, with the reservation section wired straight to WhatsApp chat.",
      "Menu split into Nusantara mains (ayam, sate maranggi, ikan bakar) and drinks/desserts (es teler, wedang jahe), with an honest note that details live at the venue.",
    ],
    features: [
      { title: "Nusantara menu", body: "Signature mains plus drinks and desserts, each with a one-line taste description." },
      { title: "WhatsApp reservations", body: "A dedicated reservation section that opens a chat — no forms, no friction." },
      { title: "Gallery proof", body: "A visual strip of dishes and space that backs up the calm-taste promise." },
      { title: "Location section", body: "Tangerang Selatan base with map slot, so visitors know where the bridge lands." },
    ],
    design: [
      "Warm, calm hospitality direction: generous whitespace, food-led imagery, and type that reads like a menu — unhurried and legible.",
      "Single-column rhythm on mobile keeps the order intact: craving, proof, reservation.",
    ],
    development: [
      "Component-driven build with reusable menu, gallery, and section primitives. Semantic landmarks per section for anchor navigation.",
      "Static-first rendering with per-page metadata and click-to-chat links tuned for mobile visitors.",
    ],
  },
  {
    slug: "bdacapital",
    index: "03",
    title: "BDA Capital",
    summary: "Independent investment holding company.",
    category: "Business Website",
    year: "2026",
    role: "Design / Build",
    services: ["Interface design", "Development", "Information architecture", "Editorial system"],
    stack: ["Next.js", "TypeScript", "Tailwind", "Responsive system"],
    visualKind: "image",
    heroImage: "/work/BDACapital.png",
    motif: "field",
    liveUrl: "bdacapital.vercel.app/",
    challenge: [
      "BDA Capital is an independent investment holding company — an owner, not an operator-for-hire — and the site had to state that position precisely: ownership structure, investment philosophy, and portfolio, without ever sounding like a fund soliciting investors.",
      "It had to answer three questions in one pass: what the company owns, how capital is allocated, and why ownership is patient — while giving its operating business, Veyra, a distinct identity rather than absorbing it.",
    ],
    approach: [
      "Built the site as an ordered argument — overview first, then portfolio, then the four-stage investment approach, then about and contact — so every page escalates the same thesis instead of repeating it.",
      "Kept the tone deliberately factual: five clear tenets, no invented mandate, and explicit notes on what is not promised. Credibility comes from restraint, not claims.",
    ],
    solution: [
      "A multi-page corporate site — Overview, Portfolio, Investment Approach, About, Contact — that lays out the holding structure, three ownership principles, and a four-stage approach as one ordered system.",
      "The portfolio module presents the digital services business under an ownership line drawn from parent to operating company, making the holding structure legible at a glance.",
    ],
    features: [
      { title: "Holdings module", body: "The portfolio stated as a ledger — one company today, with the ownership line drawn parent to operating company." },
      { title: "Investment philosophy", body: "Three principles behind every allocation: long-term perspective, disciplined capital, and independent business identity." },
      { title: "Four-stage approach", body: "Identify, invest, support ownership, compound value — the method, numbered and kept in order." },
      { title: "Structure section", body: "One parent and an independent business, side by side — ownership supports; it does not absorb." },
    ],
    design: [
      "Document-like art direction: cream surfaces, hairline rules, figure annotations, and a heavy display serif carrying short, weighty statements.",
      "Order as the visual system — holdings, principles, and stages are all numbered — so the eye always knows where it stands in the argument.",
    ],
    development: [
      "Static-first Next.js build with per-page metadata and a shared layout system, so portfolio, approach, and about stay consistent at any width.",
      "The footer carries an explicit disclaimer — not a fund or licensed asset manager — keeping the presentation honest end to end.",
    ],
  },
  {
    slug: "sinergipest",
    index: "04",
    title: "Sinergipest",
    summary: "Standard operation of pest cleaning for your comfort.",
    category: "Business Website",
    year: "2025",
    role: "Design / Build",
    services: ["Interface design", "Development", "Service structure", "Lead capture"],
    stack: ["React", "TypeScript", "Next.js", "Responsive system"],
    visualKind: "image",
    heroImage: "/work/Sinergipest.png",
    motif: "signal",
    liveUrl: "sinergipest.netlify.app/",
    challenge: [
      "Sinergipest offers professional pest control in Tangerang Selatan — a trust business where certification, method, and proof decide who gets the call.",
      "The site had to present the full operation: inspection process, eco-friendly methods, five treatment services, testimonials, and booking — without overwhelming a worried homeowner.",
    ],
    approach: [
      "Opened with protection promise and booking action, then the three-step standard (deep inspection, eco-friendly method, periodic reports) before any service list.",
      "Closed with the five treatments, client testimonials, and a contact block with WhatsApp, hours, and 24/7 emergency line.",
    ],
    solution: [
      "A complete service site: process, five treatments (misting, spraying, hot fogging, rodent control, anti-termite), vision and mission, testimonials, and booking consultation.",
      "Every path ends at WhatsApp booking, with the Serpong Utara address and operating hours stated plainly.",
    ],
    features: [
      { title: "Three-step standard", body: "Deep inspection, eco-friendly method, and periodic reports — the operation, explained." },
      { title: "Five treatments", body: "Misting, spraying, hot fogging, rodent control, and anti-termite, each with its scope." },
      { title: "Client testimonials", body: "Homeowner, restaurant, and emergency-call reviews that carry the trust argument." },
      { title: "Booking + emergency", body: "Consultation booking over WhatsApp with a 24/7 emergency line for urgent cases." },
    ],
    design: [
      "Trust-first service aesthetic: deep greens, documentation photography, numbered process steps, and check-marked guarantees.",
      "Mobile keeps the booking action reachable — the worried visitor converts from the phone in hand.",
    ],
    development: [
      "Component-driven build with reusable service-card, testimonial, and section primitives. Semantic HTML with labeled service imagery.",
      "Static-first rendering with per-page metadata, sitemap, and pre-filled WhatsApp booking links.",
    ],
  },
];

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}

export function getNextProject(slug: string): Project {
  const i = projects.findIndex((p) => p.slug === slug);
  return projects[(i + 1) % projects.length];
}
