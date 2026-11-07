// All editable portfolio content lives here.
// Replace every [BRACKETED] placeholder with your own details.

export const site = {
  name: "Bilal",
  domain: "[YOURDOMAIN].COM",
  year: 2026,
  email: "[your email]",
  ctaLabel: "Book a Call",
  ctaHref: "#contact",
  socials: [
    { label: "Email", href: "mailto:[your email]" },
    { label: "LinkedIn", href: "#" },
    { label: "GitHub", href: "#" },
  ],
};

export const hero = {
  headline: ["Technical product", "and experience designer"],
  headlineMuted: "and builder.",
  subline1: "Crafting AI and SaaS products",
  subline2: "from research to design systems to code.",
  greeting: "hi, I'm Bilal",
};

export const intro = [
  {
    title: "Hi, I'm Bilal",
    body: "[One line on your background — e.g. what you studied or did before design.]",
  },
  {
    title: "I design and build interfaces",
    body: "[The kinds of products you work on — web, mobile, SaaS, AI tools.]",
  },
  {
    title: "Design and front-end engineering",
    body: "[Your process — research, UI, then code with React / TypeScript.]",
  },
];

export const clients = ["[COMPANY]", "[COMPANY]", "[COMPANY]", "[COMPANY]", "[COMPANY]", "[COMPANY]"];

export type Category = "AI" | "SaaS" | "Websites" | "Mobile";
export const categories: ("All" | Category)[] = ["All", "AI", "SaaS", "Websites", "Mobile"];

export type Project = {
  name: string;
  role: string;
  description: string;
  tags: string[];
  year: number;
  categories: Category[];
  cover: "light" | "dark" | "stone";
  href: string;
};

export const projects: Project[] = [
  {
    name: "[Project name]",
    role: "[Your role]",
    description: "[One-line description of the problem and what you shipped.]",
    tags: ["AI", "SaaS"],
    year: 2026,
    categories: ["AI", "SaaS"],
    cover: "light",
    href: "#",
  },
  {
    name: "[Project name]",
    role: "[Your role]",
    description: "[One-line description of the problem and what you shipped.]",
    tags: ["Mobile app"],
    year: 2026,
    categories: ["Mobile"],
    cover: "dark",
    href: "#",
  },
  {
    name: "[Project name]",
    role: "[Your role]",
    description: "[One-line description of the problem and what you shipped.]",
    tags: ["Website"],
    year: 2025,
    categories: ["Websites"],
    cover: "stone",
    href: "#",
  },
  {
    name: "[Project name]",
    role: "[Your role]",
    description: "[One-line description of the problem and what you shipped.]",
    tags: ["Design system"],
    year: 2025,
    categories: ["SaaS"],
    cover: "light",
    href: "#",
  },
];

export const experiments = [
  { name: "[Experiment name]", body: "[What it does, in one line.]", cover: "light", href: "#" },
  { name: "[Experiment name]", body: "[What it does, in one line.]", cover: "dark", href: "#" },
  { name: "[Experiment name]", body: "[What it does, in one line.]", cover: "stone", href: "#" },
] as const;

export const about = {
  headline: "I also code,",
  headlineMuted: "speak [languages], and [hobby].",
  bio: "[Short bio — two or three sentences about who you are, how you got into design and what you care about when building products.]",
  journey: [
    { title: "[Role] · [Company]", period: "2025 — NOW" },
    { title: "[Role] · [Company]", period: "[YEAR — YEAR]" },
    { title: "[Role] · [Company]", period: "[YEAR — YEAR]" },
    { title: "[Degree] · [University]", period: "[YEAR — YEAR]" },
  ],
};

export const stack = ["Figma", "React", "TypeScript", "Next.js", "Tailwind", "Framer", "Node.js", "[Tool]"];

export const quote = {
  text: "Design is not just what it looks like and feels like.",
  muted: "Design is how it works.",
  author: "Steve Jobs",
};
