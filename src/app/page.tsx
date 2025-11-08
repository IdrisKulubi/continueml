import { MainLayout } from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";

// Force dynamic rendering since we check session
export const dynamic = "force-dynamic";

export default async function Home() {
  const session = await getSession();
  
  // Redirect authenticated users to worlds page
  if (session) {
    redirect("/worlds");
  }

  return (
    <MainLayout>
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <div className="container px-4 py-16 text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl mb-6">
            AI Memory for Creative Projects
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Build consistent worlds across multiple AI-generated content pieces.
            Maintain characters, locations, and styles with persistent memory.
          </p>
          <div className="flex gap-4 justify-center">
            <Button asChild size="lg">
              <Link href="/login">Get Started</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/login">Sign In</Link>
            </Button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
