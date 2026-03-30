"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "@/lib/auth-client";
import { ThemeToggle } from "./ThemeToggle";
import { LogOut, Zap } from "lucide-react";

export function Navbar() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  // ★ Client-side safety net: redirect unverified users to verify-email
  useEffect(() => {
    if (!isPending && session?.user && !session.user.emailVerified) {
      router.push("/auth/verify-email");
    }
  }, [session, isPending, router]);

  const handleSignOut = async () => {
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/");
        },
      },
    });
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary">
            <span className="text-sm font-bold text-primary-foreground">
              <Zap className="size-6 text-primary-foreground" />
            </span>
          </div>
          {/* <span className="text-lg font-semibold tracking-tight">Jeng</span> */}
        </Link>

        {/* Navigation Links and User Menu */}
        <div className="flex items-center gap-6">
          {/* Features Link (visible on larger screens) */}
          {!session && (
            <a
              href="#features"
              className="hidden text-sm text-muted-foreground transition-colors hover:text-foreground sm:block"
            >
              Features
            </a>
          )}

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Auth Section */}
          {!isPending && (
            <>
              {session ? (
                // Logged In State
                <div className="flex items-center gap-4">
                  <div className="hidden sm:flex items-center gap-2">
                    <div className="size-8 rounded-full bg-primary/20 flex items-center justify-center">
                      <span className="text-xs font-semibold text-primary">
                        {session.user.name?.charAt(0).toUpperCase() || "U"}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-foreground">
                        {session.user.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {session.user.email}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                    title="Sign Out"
                  >
                    <LogOut className="size-4" />
                    <span className="hidden sm:inline">Sign Out</span>
                  </button>
                </div>
              ) : (
                // Logged Out State
                <div className="flex items-center gap-2">
                  <Link
                    href="/auth/signin"
                    className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
