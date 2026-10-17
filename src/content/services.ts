export interface ServiceItem {
  n: string;
  title: string;
  body: string;
  detail: string;
  timeline: string;
  deliverables: string[];
  price: string;
}

/**
 * The complete offering — rendered by the homepage and /services accordions
 * and used to build Service structured data. Keep values in sync with
 * what is actually delivered.
 */
export const services: ServiceItem[] = [
  {
    n: "01",
    title: "Business Websites",
    body: "A single sharp website built to earn its traffic.",
    detail:
      "Message-first structure, editorial type, and a conversion path that stays visible without shouting. Live example: banyulancar.web.id.",
    timeline: "1–2 weeks",
    deliverables: ["Full website"],
    price: "50$ (negotiable)",
  },
  {
    n: "02",
    title: "Web Applications",
    body: "Complex workflows rebuilt as clean, intuitive interfaces.",
    detail:
      "State-aware views, role-scoped surfaces, and empty states designed — never defaulted. Live example: tradionapp.com.",
    timeline: "2–4 weeks",
    deliverables: ["App", "API wiring"],
    price: "450$ (negotiable)",
  },
  {
    n: "03",
    title: "Digital Products",
    body: "From concept and interface through production.",
    detail:
      "Smallest testable core loop first, tokens earned from real screens, iteration kept cheap. Live example: bdacapital.vercel.app/.",
    timeline: "3–6 weeks",
    deliverables: ["Product", "System"],
    price: "scoped",
  },
];
