import { betterAuth } from "better-auth";
import { firestoreAdapter } from "better-auth-firestore";
import { db } from "./firebase";

let auth;
try {
  // Validate environment variables
  const secret = process.env.BETTER_AUTH_SECRET?.trim().replace(/^"|"$/g, "");
  const baseURL = process.env.BETTER_AUTH_URL?.trim().replace(/^"|"$/g, "") || "http://localhost:3000";
  const projectId = process.env.FIREBASE_PROJECT_ID?.trim().replace(/^"|"$/g, "");
  const googleClientId = process.env.GOOGLE_CLIENT_ID?.trim().replace(/^"|"$/g, "");
  const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim().replace(/^"|"$/g, "");

  if (!secret) {
    throw new Error("BETTER_AUTH_SECRET is not set in .env.local");
  }

  console.log("🔐 Better Auth Configuration Check:");
  console.log(`  ✓ Secret: ${secret ? "✓ Present" : "❌ MISSING"}`);
  console.log(`  ✓ Base URL: ${baseURL}`);
  console.log(`  ✓ Project ID: ${projectId}`);
  console.log(`  ✓ Google OAuth: ${googleClientId && googleClientSecret ? "✓ Configured" : "⚠️  Not configured (optional)"}`);

  auth = betterAuth({
    appName: "Jeng",
    baseURL: baseURL,
    secret: secret,
    basePath: "/api/auth",

    database: firestoreAdapter({
      firestore: db,
      debugLogs: true
    }),

    emailAndPassword: {
      enabled: true,
      autoSignUpEnabled: true,
      minPasswordLength: 8,
      maxPasswordLength: 128,
    },

    socialProviders: {
      google: {
        clientId: googleClientId || "",
        clientSecret: googleClientSecret || "",
      },
    },

    user: {
      additionalFields: {},
    },

    advanced: {
      useSecureCookies: process.env.NODE_ENV === "production",
      disableCSRFCheck: false,
    },
  });

  console.log("✅ Better Auth with Firestore initialized successfully");
  console.log(`   Using Firestore Database: projects/${projectId}/databases/(default)`);
  console.log(`   Collections: users, accounts, sessions, verification`);
} catch (error: unknown) {
  console.error("❌ Failed to initialize Better Auth:", error instanceof Error ? error.message : error);
  throw error;
}

export { auth };
export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;
