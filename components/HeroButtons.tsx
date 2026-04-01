"use client";

import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { ArrowRight } from "lucide-react";

export function HeroButtons() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  const handleClick = (href: string) => {
    if (isPending) {
      return;
    }

    if (!session?.user) {
      router.push("/auth/signup");
      return;
    }

    window.open(href, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
      <button
        onClick={() => handleClick("https://nextjs.org/docs")}
        disabled={isPending}
        className="group inline-flex h-12 items-center gap-2 rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30 hover:brightness-110 cursor-pointer"
      >
        Get Started
        <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
      </button>
      <button
        onClick={() => handleClick("https://github.com/vercel/next.js")}
        disabled={isPending}
        className="inline-flex h-12 items-center gap-2 rounded-xl border border-border bg-background px-6 text-sm font-semibold transition-colors hover:bg-accent cursor-pointer"
      >
        View on GitHub
      </button>
    </div>
  );
}
