"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Globe, Settings, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/themes/mode-toggle";
import { UserNav } from "@/components/layout/user-nav";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavigate = () => setMobileMenuOpen(false);
  const renderNavLinks = (onNavigate?: () => void) => (
    <>
      <Button variant="ghost" className="gap-2" asChild>
        <Link href="/worlds" onClick={onNavigate}>
          <Globe className="h-4 w-4" />
          <span>Worlds</span>
        </Link>
      </Button>
      <Button variant="ghost" className="gap-2" asChild>
        <Link href="/settings" onClick={onNavigate}>
          <Settings className="h-4 w-4" />
          <span>Settings</span>
        </Link>
      </Button>
    </>
  );

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo and App Name */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/images/logo.png"
              alt="continueml logo"
              width={32}
              height={32}
              className="h-8 w-8 rounded-lg"
              priority
            />
            <span className="text-xl font-semibold">continueml</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2">
            {renderNavLinks()}
          </div>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-2">
          <ModeToggle />
          <UserNav />

          {/* Mobile Menu */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64">
              <div className="flex flex-col gap-4 mt-8">
                {renderNavLinks(handleNavigate)}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
