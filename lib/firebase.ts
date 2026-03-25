import * as admin from "firebase-admin";
import { initializeApp, getApp } from "firebase/app";
import { getFirestore as getClientFirestore } from "firebase/firestore";

// ===== FIREBASE ADMIN SDK (Server-side) =====
let adminApp = admin.apps[0];

if (!adminApp) {
  const projectId = process.env.FIREBASE_PROJECT_ID?.trim().replace(/^"|"$/g, "");
  const privateKeyEnv = process.env.FIREBASE_PRIVATE_KEY?.trim().replace(/^"|"$/g, "");
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL?.trim().replace(/^"|"$/g, "");

  console.log("🔧 Firebase Admin SDK Configuration Check:");
  console.log(`  ✓ Project ID: ${projectId ? projectId : "❌ MISSING"}`);
  console.log(`  ✓ Private Key: ${privateKeyEnv ? "✓ Present" : "❌ MISSING"}`);
  console.log(`  ✓ Client Email: ${clientEmail ? clientEmail : "❌ MISSING"}`);

  if (!projectId || !privateKeyEnv || !clientEmail) {
    throw new Error(
      `Missing Firebase Admin credentials in .env.local:\n` +
      `  - FIREBASE_PROJECT_ID: ${projectId ? "✓" : "❌ Missing"}\n` +
      `  - FIREBASE_PRIVATE_KEY: ${privateKeyEnv ? "✓" : "❌ Missing"}\n` +
      `  - FIREBASE_CLIENT_EMAIL: ${clientEmail ? "✓" : "❌ Missing"}`
    );
  }

  const privateKey = privateKeyEnv.includes("\\n")
    ? privateKeyEnv.replace(/\\n/g, "\n")
    : privateKeyEnv;

  if (!privateKey.includes("BEGIN PRIVATE KEY") || !privateKey.includes("END PRIVATE KEY")) {
    throw new Error(
      "Invalid FIREBASE_PRIVATE_KEY format. Must be a valid PEM private key with BEGIN/END markers."
    );
  }

  const firebaseAdminConfig = {
    projectId: projectId,
    privateKey: privateKey,
    clientEmail: clientEmail,
  };

  try {
    admin.initializeApp({
      credential: admin.credential.cert(firebaseAdminConfig as admin.ServiceAccount),
    });
    adminApp = admin.app();
    console.log("✅ Firebase Admin SDK initialized successfully");
    console.log(`   Project: ${projectId}`);
    console.log(`   Service Account: ${clientEmail}`);
    console.log(`   Database Path: projects/${projectId}/databases/(default)`);
  } catch (error: unknown) {
    console.error("❌ Failed to initialize Firebase Admin SDK:", error instanceof Error ? error.message : error);
    throw error;
  }
}

// ===== FIRESTORE DATABASE (with explicit database ID) =====
// Use admin.firestore() with explicit database ID parameter
// The (default) database is the main Firestore database in the project
const db = admin.firestore();

// CRITICAL: Allow undefined properties in Firestore documents
// Better Auth may pass undefined values (e.g. optional `image` field during sign-up)
// Without this, Firestore rejects the document and causes a 422 error
db.settings({ ignoreUndefinedProperties: true });

// CRITICAL: Explicitly reference the (default) database
// This ensures we're connecting to the correct Firestore database instance
const projectId2 = process.env.FIREBASE_PROJECT_ID?.trim().replace(/^"|"$/g, "");
console.log(`🔥 Firestore Database initialized:`);
console.log(`   Full Path: projects/${projectId2}/databases/(default)`);
console.log(`   Database ID: (default)`);
console.log(`   Region: asia-southeast1`);

// ===== FIREBASE CLIENT SDK (for browser/client-side) =====
const firebaseClientConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY?.replace(/^"|"$/g, ""),
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN?.replace(/^"|"$/g, ""),
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.replace(/^"|"$/g, ""),
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET?.replace(/^"|"$/g, ""),
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID?.replace(/^"|"$/g, ""),
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID?.replace(/^"|"$/g, ""),
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID?.replace(/^"|"$/g, ""),
};

let firebaseClientApp;
try {
  firebaseClientApp = getApp();
} catch {
  firebaseClientApp = initializeApp(firebaseClientConfig);
  console.log("✅ Firebase Client SDK initialized");
}

export const clientDb = getClientFirestore(firebaseClientApp);
export { db };
export default admin;

