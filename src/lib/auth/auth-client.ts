import { createAuthClient } from "better-auth/react";
import type { auth } from "../../../auth";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
});

// Export typed session hook
export const { useSession, signIn, signOut } = authClient;

// Type exports for convenience
export type Session = typeof auth.$Infer.Session;
