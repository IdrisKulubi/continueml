import { auth } from "../../../auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

/**
 * Get the current session on the server side
 * Use this in Server Components, Server Actions, and API Routes
 */
export async function getSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  
  return session;
}

/**
 * Require authentication - redirects to login if not authenticated
 * Use this in Server Components that require authentication
 */
export async function requireAuth() {
  const session = await getSession();
  
  if (!session) {
    redirect("/login");
  }
  
  return session;
}

/**
 * Get the current user ID
 * Returns null if not authenticated
 */
export async function getCurrentUserId(): Promise<string | null> {
  const session = await getSession();
  return session?.user?.id || null;
}
