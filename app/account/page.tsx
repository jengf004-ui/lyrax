"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { signOut, getSession } from "@/lib/auth-client";
import { LogOut, ArrowLeft } from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
  emailVerified: boolean;
}

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const getUser = async () => {
      try {
        const session = await getSession();
        
        if (!session.data) {
          router.push("/auth/signin");
          return;
        }

        setUser(session.data.user as User);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load user");
        router.push("/auth/signin");
      } finally {
        setLoading(false);
      }
    };

    getUser();
  }, [router]);

  const handleLogout = async () => {
    try {
      await signOut();
      router.push("/");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to sign out");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground transition-colors duration-300 flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background text-foreground transition-colors duration-300 flex items-center justify-center">
        <div className="text-destructive">{error}</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background text-foreground transition-colors duration-300 flex items-center justify-center">
        <div className="text-muted-foreground">No user data available</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* ── Navbar ── */}
      <nav className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-lg">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary">
              <span className="text-sm font-bold text-primary-foreground">J</span>
            </div>
            <span className="text-lg font-semibold tracking-tight">Jeng</span>
          </Link>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors"
          >
            <LogOut className="size-4" />
            Sign Out
          </button>
        </div>
      </nav>

      {/* ── Main Content ── */}
      <div className="mx-auto max-w-2xl px-6 py-12">
        <Link href="/" className="flex items-center gap-1 text-muted-foreground hover:text-foreground mb-8 transition-colors">
          <ArrowLeft className="size-4" />
          Back to Home
        </Link>

        <div className="rounded-lg border border-border bg-card p-8 shadow-lg">
          <h1 className="text-3xl font-bold mb-2">Welcome, {user.name}!</h1>
          <p className="text-muted-foreground mb-8">You are now signed in to your account.</p>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                Name
              </label>
              <div className="px-4 py-2 rounded-lg bg-background border border-input">
                {user.name}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                Email
              </label>
              <div className="px-4 py-2 rounded-lg bg-background border border-input flex items-center gap-2">
                {user.email}
                {user.emailVerified && (
                  <span className="text-xs bg-green-500/20 text-green-600 px-2 py-1 rounded">
                    Verified
                  </span>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                User ID
              </label>
              <div className="px-4 py-2 rounded-lg bg-background border border-input text-xs font-mono break-all">
                {user.id}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
