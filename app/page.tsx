import { Navbar } from "@/components/Navbar";
import { HeroButtons } from "@/components/HeroButtons";
import { Zap, Shield, Layers } from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "Lightning Fast",
    description:
      "Built on Next.js 15 with Turbopack for instant hot reloads and blazing-fast production builds.",
  },
  {
    icon: Shield,
    title: "Type Safe",
    description:
      "Full TypeScript support with strict mode, giving you confidence in every line of code.",
  },
  {
    icon: Layers,
    title: "Design System",
    description:
      "Tailwind CSS v4 with OKLCH color tokens, semantic theming, and automatic dark mode.",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* ── Navbar ── */}
      <Navbar />

      {/* ── Hero ── */}
      <section className="relative overflow-hidden">
        {/* Gradient orbs (decorative) */}
        <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2">
          <div className="h-[500px] w-[800px] rounded-full bg-primary/10 blur-[120px]" />
        </div>

        <div className="relative mx-auto max-w-4xl px-6 pb-24 pt-28 text-center sm:pt-36">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-muted/60 px-4 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur-sm">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary/60" />
              <span className="relative inline-flex size-2 rounded-full bg-primary" />
            </span>
            Next.js 15 &middot; Tailwind v4 &middot; React 19
          </div>

          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
            Build{" "}
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              beautiful
            </span>{" "}
            web apps,
            <br className="hidden sm:block" /> faster than ever.
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
            A production-ready starter with Next.js&nbsp;15, React&nbsp;19, and
            a Tailwind CSS&nbsp;v4 design&nbsp;system — complete with dark mode,
            OKLCH color tokens, and premium aesthetics.
          </p>

          <HeroButtons />
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="border-t border-border/60 bg-muted/30">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Everything you need
            </h2>
            <p className="mt-4 text-muted-foreground">
              Pre-configured with the best tools for modern web development.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group rounded-2xl border border-border bg-card p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/5"
              >
                <div className="mb-4 inline-flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <feature.icon className="size-6" />
                </div>

                <h3 className="mb-2 text-lg font-semibold">{feature.title}</h3>

                <p className="text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="border-t border-border/60">
        <div className="mx-auto max-w-4xl px-6 py-24 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Ready to start building?
          </h2>
          <p className="mt-4 text-muted-foreground">
            Clone this project and start shipping great products today.
          </p>
          <div className="mt-8 inline-flex items-center gap-3 rounded-xl border border-border bg-card px-5 py-3 font-mono text-sm">
            <span className="text-muted-foreground">$</span>
            <code>npx create-next-app@latest</code>
          </div>
        </div>
      </section>

      {/* --- Footer --- */}
      <footer className="border-t border-white/5 py-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6">
          
          {/* 1. ฝั่งซ้าย: Copyright */}
          <div className="flex-1 text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} . Built with Next.js&nbsp;15.
          </div>

          {/* 2. ตรงกลาง: Facebook + ชื่อเพื่อน */}
          <div className="flex flex-1 items-center justify-center gap-4">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95z"/>
              </svg>
            <a href="https://www.facebook.com/guay.jeng.908484/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">GuayJeng</a>
            <a href="https://www.facebook.com/binly.xayxhalern.1" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Thepmoukda</a>
          </div>

          {/* 3. ฝั่งขวา: ลิงก์เทคโนโลยี */}
          <div className="flex flex-1 items-center justify-end gap-6">
            <a href="https://nextjs.org" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Next.js</a>
            <a href="https://tailwindcss.com" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Tailwind</a>
          </div>

        </div>
      </footer>
    </div>
  );
}
