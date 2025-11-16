import { MainLayout } from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { Sparkles, Brain, Layers, Wand2, CheckCircle2, Film } from "lucide-react";

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
        <div className="container max-w-5xl px-4 py-16">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted text-sm mb-6">
              <Sparkles className="w-4 h-4" />
              <span>AI Memory System</span>
            </div>
            
            <h1 className="text-5xl sm:text-7xl font-bold tracking-tight mb-6">
              Build worlds,<br />not just one-offs
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-4">
              AI tools like Runway, Midjourney, and Stable Diffusion are powerful—but they forget everything between generations.
            </p>
            
            <p className="text-xl font-medium max-w-2xl mx-auto mb-10">
              continueml gives them memory, so your characters, locations, and styles stay consistent across every piece of content you create.
            </p>
            
            <div className="flex gap-4 justify-center">
              <Button asChild size="lg" className="text-base">
                <Link href="/login">Get Started Free</Link>
              </Button>
            </div>
          </div>

          {/* Problem/Solution */}
          <div className="bg-muted/50 rounded-lg p-8 mb-16">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold mb-3 text-destructive">The Problem</h3>
                <p className="text-muted-foreground mb-4">
                  Every AI generation starts from scratch. Your hero looks different in every scene. 
                  Your fictional city changes style. Your brand character loses consistency.
                </p>
                <p className="text-sm text-muted-foreground">
                  Creating episodic content or coherent universes is nearly impossible.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-3">The Solution</h3>
                <p className="text-muted-foreground mb-4">
                  continueml sits above your generation tools as a persistent memory layer. 
                  Define your entities once, and we ensure every generation respects your world's rules.
                </p>
                <p className="text-sm text-muted-foreground">
                  Build series, games, comics, and brands with true consistency.
                </p>
              </div>
            </div>
          </div>

          {/* How It Works */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="flex flex-col items-center text-center">
                <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold mb-4">1</div>
                <h3 className="font-semibold mb-2">Define Your World</h3>
                <p className="text-sm text-muted-foreground">
                  Create entities: characters, locations, objects, styles. Upload reference images and descriptions.
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold mb-4">2</div>
                <h3 className="font-semibold mb-2">Generate with Memory</h3>
                <p className="text-sm text-muted-foreground">
                  Our AI automatically enhances your prompts using entity memories and visual embeddings.
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold mb-4">3</div>
                <h3 className="font-semibold mb-2">Stay Consistent</h3>
                <p className="text-sm text-muted-foreground">
                  Check consistency scores, validate outputs, and build a coherent universe across all your content.
                </p>
              </div>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 mb-4">
                <Brain className="w-6 h-6" />
              </div>
              <h3 className="font-semibold mb-2">Vector Memory</h3>
              <p className="text-sm text-muted-foreground">
                Semantic and visual embeddings ensure AI understands your entities deeply
              </p>
            </div>
            
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 mb-4">
                <Wand2 className="w-6 h-6" />
              </div>
              <h3 className="font-semibold mb-2">Prompt Enhancement</h3>
              <p className="text-sm text-muted-foreground">
                Automatically inject entity details into your generation prompts
              </p>
            </div>
            
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 mb-4">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="font-semibold mb-2">Consistency Checker</h3>
              <p className="text-sm text-muted-foreground">
                Validate generated content matches your entity definitions
              </p>
            </div>
          </div>

          {/* Use Cases */}
          <div className="bg-card border rounded-lg p-8">
            <h2 className="text-2xl font-bold text-center mb-8">Perfect For</h2>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
              <div className="flex items-start gap-3">
                <Film className="w-5 h-5 mt-0.5 text-primary" />
                <div>
                  <h4 className="font-semibold text-sm mb-1">AI Filmmakers</h4>
                  <p className="text-xs text-muted-foreground">Create episodic series with consistent characters</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Layers className="w-5 h-5 mt-0.5 text-primary" />
                <div>
                  <h4 className="font-semibold text-sm mb-1">Game Developers</h4>
                  <p className="text-xs text-muted-foreground">Generate concept art with unified aesthetics</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 mt-0.5 text-primary" />
                <div>
                  <h4 className="font-semibold text-sm mb-1">Comic Creators</h4>
                  <p className="text-xs text-muted-foreground">Maintain character consistency across panels</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Brain className="w-5 h-5 mt-0.5 text-primary" />
                <div>
                  <h4 className="font-semibold text-sm mb-1">Brand Agencies</h4>
                  <p className="text-xs text-muted-foreground">Keep brand characters on-model</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Wand2 className="w-5 h-5 mt-0.5 text-primary" />
                <div>
                  <h4 className="font-semibold text-sm mb-1">Writers</h4>
                  <p className="text-xs text-muted-foreground">Build and visualize fictional universes</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 mt-0.5 text-primary" />
                <div>
                  <h4 className="font-semibold text-sm mb-1">Content Creators</h4>
                  <p className="text-xs text-muted-foreground">Produce cohesive visual narratives</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
