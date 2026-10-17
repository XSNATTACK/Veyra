export const site = {
  name: "VEYRA",
  wordmark: "VEYRA®",
  logo: "/veyra-logo.png",
  tagline: "Independent digital studio",
  description:
    "Independent digital studio designing and building websites, web applications, and digital products for founders and businesses worldwide.",
  url: "https://bdaveyra.vercel.app",
  email: "xsnckp@gmail.com",
  location: "Working worldwide",
  year: "2026",
  nav: [
    { label: "Work", href: "/work" },
    { label: "Services", href: "/services" },
    { label: "Studio", href: "/studio" },
    { label: "Contact", href: "/contact" },
  ],
} as const;

export type SiteNavItem = (typeof site.nav)[number];
