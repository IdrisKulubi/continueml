import { MainLayout } from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
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
              <Link href="/worlds">Get Started</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/settings">Learn More</Link>
            </Button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
