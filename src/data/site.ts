// All editable portfolio content lives here.
// Replace every [BRACKETED] placeholder with your own details.

export const site = {
  name: "Bilal",
  domain: "[YOURDOMAIN].COM",
  year: 2026,
  email: "bilalwdev26@gmail.com",
  linkedin: "https://www.linkedin.com/in/bilal-ali-dev/",
  github: "https://github.com/Bilalwebdev26",
  ctaLabel: "Book a Call",
  ctaHref: "#contact",
  socials: [
    { label: "Email", href: "mailto:bilalwdev26@gmail.com" },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/bilal-ali-dev/" },
    { label: "GitHub", href: "https://github.com/Bilalwebdev26" },
  ],
};

/** Opens a Gmail compose window addressed to Bilal (optionally pre-filled). */
export function gmailComposeUrl(subject = "", body = "") {
  const q = new URLSearchParams({ view: "cm", fs: "1", to: site.email });
  if (subject) q.set("su", subject);
  if (body) q.set("body", body);
  return `https://mail.google.com/mail/?${q.toString()}`;
}

export const hero = {
  headline: ["Full stack developer", "and DevOps engineer"],
  // The last headline line evaporates from one word into the next.
  headlineRotating: ["for Gen AI.", "for MERN.", "for Next.js.", "for the cloud."],
  subline1: "Building Gen AI, MERN and Next.js products",
  subline2: "from APIs and databases to CI/CD and the cloud.",
  greeting: "hi, I'm Bilal Ali",
};

export const intro = [
  {
    title: "Hi, I'm Bilal",
    body: "A Computer Science graduate from UMT, now an Associate Software Developer at Codev Digital.",
  },
  {
    title: "Full stack, end to end",
    body: "MERN and Next.js apps backed by NestJS APIs, PostgreSQL and MongoDB — typed, tested and fast.",
  },
  {
    title: "Gen AI and DevOps",
    body: "LLM-powered features and AI agents, shipped through Docker, Kubernetes, Terraform and AWS.",
  },
];

// Logos live in /public/company-logos. `h` is the display height in px —
// tuned per logo so wide wordmarks and square marks look equally weighted.
export const clients = [
  { name: "Codev Digital", logo: "/company-logos/codev%20digital.avif", width: 212, height: 52, h: 38 },
  { name: "EON", logo: "/company-logos/eon.png", width: 182, height: 148, h: 58 },
  { name: "Elewo", logo: "/company-logos/elewo.svg", width: 759, height: 245, h: 46 },
  { name: "Terapage", logo: "/company-logos/terapage.webp", width: 901, height: 102, h: 26 },
];

export type Category = "Gen AI" | "Full Stack" | "Frontend";
export const categories: ("All" | Category)[] = ["All", "Gen AI", "Full Stack", "Frontend"];

export type Project = {
  name: string;
  /** Badge on the laptop card, e.g. "Gen AI". */
  badge: string;
  description: string;
  /** One-line result or standout feature, shown with a trend arrow. */
  highlight: string;
  tech: string[];
  year: number;
  categories: Category[];
  /** Screenshot in /public/screen-shots, shown on the laptop screen. */
  image: string;
  /** Backdrop colours for the laptop card: [deep, bright]. */
  accent: [string, string];
  /** Live site or case study. Leave empty until it's ready. */
  href: string;
};

// Logo for each tech name used in a project's `tech` list (files in /public/stack-logos).
// Add an entry here when you use a new technology in a project.
export const techLogos: Record<string, { logo: string; invertDark?: boolean }> = {
  "Next.js": { logo: "/stack-logos/nextjs.svg", invertDark: true },
  React: { logo: "/stack-logos/react.svg" },
  "Node.js": { logo: "/stack-logos/nodejs.svg" },
  NestJS: { logo: "/stack-logos/nestjs.svg" },
  Express: { logo: "/stack-logos/express.svg", invertDark: true },
  MongoDB: { logo: "/stack-logos/mongodb.svg" },
  PostgreSQL: { logo: "/stack-logos/postgresql.svg" },
  Prisma: { logo: "/stack-logos/prisma.svg", invertDark: true },
  OpenAI: { logo: "/stack-logos/codex.svg", invertDark: true },
  Stripe: { logo: "/stack-logos/stripe.svg" },
  "Tailwind CSS": { logo: "/stack-logos/tailwindcss.svg" },
  Docker: { logo: "/stack-logos/docker.svg" },
  AWS: { logo: "/stack-logos/aws.svg", invertDark: true },
  n8n: { logo: "/stack-logos/n8n.svg" },
  WhatsApp: { logo: "/stack-logos/whatsapp.svg" },
  Gmail: { logo: "/contact-logos/gmail.svg" },
  Jira: { logo: "/stack-logos/jira.svg" },
  "Google Sheets": { logo: "/stack-logos/googlesheets.svg" },
};

// Descriptions are drafted from the screenshots — replace with real details.
export const projects: Project[] = [
  {
    name: "NoDelay AI",
    badge: "Gen AI",
    description:
      "An AI studio platform that wires AI into existing business stacks — AI agents, automations and assistants, with a live dashboard for orders and customers.",
    highlight: "AI agents that auto-confirm orders",
    tech: ["Next.js", "Node.js", "OpenAI", "MongoDB"],
    year: 2026,
    categories: ["Gen AI", "Full Stack"],
    image: "/screen-shots/nodealyai.PNG",
    accent: ["#0b0f02", "#9fd11a"],
    href: "https://nodelayai.vercel.app/",
  },
  {
    name: "payTransit",
    badge: "SaaS",
    description:
      "A payroll SaaS for growing teams: run payroll, track time and leave, and export bank-ready files — all from one simple dashboard.",
    highlight: "Payroll, time tracking & bank exports in one place",
    tech: ["Next.js", "NestJS", "PostgreSQL", "Stripe"],
    year: 2026,
    categories: ["Full Stack"],
    image: "/screen-shots/payTransit.png",
    accent: ["#04302a", "#0f9b84"],
    href: "https://pay-transit.vercel.app/",
  },
  {
    name: "PetDen",
    badge: "E-commerce",
    description:
      "A UK pet-supplies marketplace with multi-vendor selling, a DenPass membership, wallet and gift cards, and free next-day delivery options.",
    highlight: "UK marketplace with next-day delivery",
    tech: ["Next.js", "Node.js", "MongoDB", "Stripe"],
    year: 2026,
    categories: ["Full Stack", "Frontend"],
    image: "/screen-shots/petden.PNG",
    accent: ["#3a1702", "#f7941d"],
    href: "https://www.petden.co.uk/",
  },
  {
    name: "Qwess",
    badge: "Logistics",
    description:
      "A package-tracking platform for Qwess Logistics — search any tracking number or manifest and results load instantly, even from partial numbers.",
    highlight: "Instant search by tracking number or manifest",
    tech: ["React", "Node.js", "PostgreSQL"],
    year: 2025,
    categories: ["Full Stack", "Frontend"],
    image: "/screen-shots/quess.png",
    accent: ["#06332c", "#c9d82a"],
    href: "https://quess.vercel.app/",
  },
  {
    name: "Reachly",
    badge: "Platform",
    description:
      "Pakistan's first creator booking platform — fans book one-on-one sessions with their favourite creators, with creator profiles, events and a dashboard.",
    highlight: "Pakistan's first creator booking platform",
    tech: ["Next.js", "Node.js", "MongoDB"],
    year: 2025,
    categories: ["Full Stack", "Frontend"],
    image: "/screen-shots/reachly.png",
    accent: ["#0a1650", "#3b5bff"],
    href: "https://reachly-indol-theta.vercel.app/",
  },
];

// n8n automations shown in the Lab section on a 3D desktop display. Images live in /public/lab.
export type LabProject = {
  title: string;
  badge: string;
  description: string;
  /** Short list of what the workflow does. */
  points: string[];
  tools: string[];
  image: string;
  /** Background of the screenshot — fills any gap around the image on screen. */
  screenBg: string;
  /** Backdrop colours for the display card: [deep, bright]. */
  accent: [string, string];
};

export const labProjects: LabProject[] = [
  {
    title: "WhatsApp AI Agent for Restaurants",
    badge: "n8n · RAG",
    description:
      "Customers message the restaurant on WhatsApp and an AI agent answers instantly — menu, timings, orders — grounded in the restaurant's own knowledge base.",
    points: ["Vector-store answers (RAG)", "Conversation memory", "Graceful fallback for unsupported messages"],
    tools: ["n8n", "WhatsApp", "OpenAI"],
    image: "/lab/n8n-1.jpg",
    screenBg: "#2a2a2a",
    accent: ["#03251a", "#1fbf6a"],
  },
  {
    title: "Multi-Agent WhatsApp Assistant",
    badge: "n8n · Multi-agent",
    description:
      "A personal assistant on WhatsApp that understands text, voice and images, then delegates to specialist agents for calendar, email, tasks and web research.",
    points: ["Calendar, Gmail & Google Tasks agents", "Research via Perplexity, Tavily & Wikipedia", "Long-term memory in MongoDB Atlas"],
    tools: ["n8n", "WhatsApp", "OpenAI", "MongoDB", "Gmail"],
    image: "/lab/n8n-whatsapp.jpg",
    screenBg: "#1f2a1f",
    accent: ["#0a1640", "#4c74ff"],
  },
  {
    title: "AI Ops Agent: Jira, Sheets & Gmail",
    badge: "n8n · Tools agent",
    description:
      "A webhook-triggered agent that works across Atlassian, looks up contacts in Google Sheets and sends emails — one API call in, the task done out.",
    points: ["Atlassian (Jira/Confluence) tools", "Contacts lookup in Google Sheets", "Replies straight to the webhook"],
    tools: ["n8n", "OpenAI", "Jira", "Google Sheets", "Gmail"],
    image: "/lab/n8n-2.jpg",
    screenBg: "#f7f7f9",
    accent: ["#3a0716", "#ea4b71"],
  },
];

export const about = {
  headline: "I build full-stack products,",
  headlineMuted: "then ship and scale them in the cloud.",
  // Newest first.
  journey: [
    {
      role: "Associate Software Developer",
      org: "Codev Digital",
      period: "May 2026 — Now",
      logo: "/company-logos/codev%20digital.avif",
      current: true,
    },
    {
      role: "Full Stack Software Engineer Intern",
      org: "Codev Digital",
      period: "Feb 2026 — Apr 2026",
      logo: "/company-logos/codev%20digital.avif",
    },
    {
      role: "Frontend Intern",
      org: "Elewo Pathways",
      period: "Jul 2025 — Sep 2025",
      logo: "/company-logos/elewo.svg",
    },
    {
      role: "Bachelor of Science in Computer Science",
      org: "University of Management and Technology (UMT)",
      period: "2022 — 2026",
      logo: "/company-logos/umt.jpg",
    },
  ],
};

// Logos live in /public/stack-logos (Devicon, Simple Icons, or the tool's own site icon).
// `invertDark` flips black/dark logos to light in dark mode so they stay visible.
export type Tool = { name: string; logo: string; invertDark?: boolean };

export type StackRow = {
  label: string;
  /** 1 = moves left→right while scrolling down, -1 = right→left. Scrolling up reverses it. */
  direction: 1 | -1;
  /** Starting position (in % of one item set) so rows don't line up. */
  offset: number;
  items: Tool[];
};

const L = (file: string) => `/stack-logos/${file}`;

export const stackRows: StackRow[] = [
  {
    label: "AI IDEs & agents",
    direction: 1,
    offset: 0,
    items: [
      { name: "Claude Code", logo: L("claude.svg") },
      { name: "Cursor", logo: L("cursor.svg"), invertDark: true },
      { name: "Copilot", logo: L("copilot.svg"), invertDark: true },
      { name: "Codex", logo: L("codex.svg"), invertDark: true },
      { name: "Antigravity", logo: L("antigravity.png") },
      { name: "v0", logo: L("v0.svg"), invertDark: true },
      { name: "Trae", logo: L("trae.svg") },
      { name: "Devin", logo: L("devin.png") },
      { name: "Kiro", logo: L("kiro.png") },
      { name: "Bubble.io", logo: L("bubble.png"), invertDark: true },
      { name: "Replit", logo: L("replit.svg") },
    ],
  },
  {
    label: "Backend",
    direction: -1,
    offset: 0.3,
    items: [
      { name: "Express.js", logo: L("express.svg"), invertDark: true },
      { name: "NestJS", logo: L("nestjs.svg") },
      { name: "Node.js", logo: L("nodejs.svg") },
      { name: "FastAPI", logo: L("fastapi.svg") },
      { name: "MongoDB", logo: L("mongodb.svg") },
      { name: "PostgreSQL", logo: L("postgresql.svg") },
      { name: "Prisma", logo: L("prisma.svg"), invertDark: true },
      { name: "Drizzle", logo: L("drizzle.svg") },
      { name: "TypeORM", logo: L("typeorm.svg"), invertDark: true },
    ],
  },
  {
    label: "Frontend",
    direction: 1,
    offset: 0.55,
    items: [
      { name: "Next.js", logo: L("nextjs.svg"), invertDark: true },
      { name: "React", logo: L("react.svg") },
      { name: "Framer Motion", logo: L("framermotion.svg"), invertDark: true },
      { name: "shadcn/ui", logo: L("shadcn.svg"), invertDark: true },
      { name: "Uiverse", logo: L("uiverse.png") },
      { name: "Tailwind CSS", logo: L("tailwindcss.svg") },
      { name: "Lenis", logo: L("lenis.png") },
    ],
  },
  {
    label: "DevOps & cloud",
    direction: -1,
    offset: 0.15,
    items: [
      { name: "Docker", logo: L("docker.svg") },
      { name: "Kubernetes", logo: L("kubernetes.svg") },
      { name: "Ansible", logo: L("ansible.svg") },
      { name: "Terraform", logo: L("terraform.svg") },
      { name: "Prometheus", logo: L("prometheus.svg") },
      { name: "Grafana", logo: L("grafana.svg") },
      { name: "AWS EC2", logo: L("ec2.svg") },
      { name: "AWS Lambda", logo: L("lambda.svg") },
      { name: "AWS S3", logo: L("s3.svg") },
      { name: "AWS VPS", logo: L("aws.svg"), invertDark: true },
    ],
  },
  {
    label: "Tools & testing",
    direction: 1,
    offset: 0.8,
    items: [
      { name: "GitHub", logo: L("github.svg"), invertDark: true },
      { name: "GitLab", logo: L("gitlab.svg") },
      { name: "GitHub Actions", logo: L("githubactions.svg") },
      { name: "Postman", logo: L("postman.svg") },
      { name: "Jira", logo: L("jira.svg") },
      { name: "Trello", logo: L("trello.svg") },
      { name: "Notion", logo: L("notion.svg"), invertDark: true },
      { name: "JUnit", logo: L("junit.svg") },
      { name: "Jest", logo: L("jest.svg") },
      { name: "Pytest", logo: L("pytest.svg") },
    ],
  },
];

export const marquee = ["Build", "Ship", "Scale", "Automate", "Deploy", "Iterate"];

export const quote = {
  text: "First, solve the problem.",
  muted: "Then, write the code.",
  author: "John Johnson",
};
