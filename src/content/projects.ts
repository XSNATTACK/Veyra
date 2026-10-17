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
    slug: "ratuplafon",
    index: "03",
    title: "RatuPlafon",
    summary: "From a sketch to the one above your head.",
    category: "Business Website",
    year: "2025",
    role: "Design / Build",
    services: ["Interface design", "Development", "Service structure", "Lead capture"],
    stack: ["React", "TypeScript", "Next.js", "Responsive system"],
    visualKind: "image",
    heroImage: "/work/RatuPlafon.png",
    motif: "field",
    liveUrl: "ratuplafon.netlify.app/",
    challenge: [
      "Ratu Plafon PVC sells and installs premium PVC ceilings in Jakarta Barat — a product buyers can't judge without seeing finishes, advantages, and proof of past work.",
      "The site had to answer why PVC over gypsum, show the design range, and turn interest into a free consultation over WhatsApp.",
    ],
    approach: [
      "Led with the value proposition (elegant, termite-proof, water-resistant, affordable), then services, then the four hard advantages, then gallery proof, then contact.",
      "Gave every section the same exit: contact and quote-request actions pointing at WhatsApp.",
    ],
    solution: [
      "A service-company site covering professional installation, premium materials, and custom designs, backed by an advantage grid and a six-piece design gallery.",
      "Full contact block — Kalideres address, phone/WhatsApp, operating hours — with free-consultation actions throughout.",
    ],
    features: [
      { title: "Service trio", body: "Professional installation, premium materials, and custom motif designs, each with its own section." },
      { title: "Advantage grid", body: "Water-resistant, termite-proof, durable, economical — the four reasons to switch from gypsum." },
      { title: "Design gallery", body: "Six finished looks from minimalist to classic luxury as inspiration and proof." },
      { title: "Quote capture", body: "Contact, quote, and free-consultation actions wired to WhatsApp on every screen." },
    ],
    design: [
      "Clean contractor aesthetic: bright surfaces, product photography, and a restrained accent reserved for calls to action.",
      "Gallery-first on mobile — the finishes sell the job, so imagery leads and copy supports.",
    ],
    development: [
      "Component-driven build with reusable service-card, gallery, and section primitives. Semantic HTML with labeled imagery throughout.",
      "Static-first rendering with per-page metadata, sitemap, and structured data for the local business.",
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
