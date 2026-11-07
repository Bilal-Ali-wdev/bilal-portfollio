import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono, Caveat } from "next/font/google";
import SmoothScroll from "@/components/SmoothScroll";
import "lenis/dist/lenis.css";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const mono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

const hand = Caveat({
  variable: "--font-hand",
  subsets: ["latin"],
  weight: ["500"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Bilal — Full Stack Developer · Gen AI, MERN, Next.js & DevOps",
  description:
    "Bilal is a full stack developer and DevOps engineer building Gen AI, MERN and Next.js products — from APIs and databases to CI/CD, Docker, Kubernetes and AWS.",
  keywords: [
    "Full Stack Developer",
    "Gen AI",
    "MERN",
    "Next.js",
    "NestJS",
    "DevOps Engineer",
    "Docker",
    "Kubernetes",
    "AWS",
  ],
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

// Before first paint: set the theme (no light/dark flash) and flag the preloader.
// Without JS neither class is added, so the page simply shows.
const themeScript = `(function(){try{var t=localStorage.getItem('theme');if(t!=='light'&&t!=='dark'){t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}var d=document.documentElement;d.dataset.theme=t;d.classList.add('is-loading','has-preloader')}catch(e){}})();`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${mono.variable} ${hand.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}
