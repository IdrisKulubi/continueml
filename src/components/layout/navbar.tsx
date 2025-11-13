"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Globe, Settings, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/themes/mode-toggle";
import { UserNav } from "@/components/layout/user-nav";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavigate = () => setMobileMenuOpen(false);
  const renderNavLinks = (onNavigate?: () => void) => (
    <>
      <Button variant="ghost" className="gap-2" asChild>
        <Link href="/worlds" onClick={onNavigate} aria-label="View all worlds">
          <Globe className="h-4 w-4" aria-hidden="true" />
          <span>Worlds</span>
        </Link>
      </Button>
      <Button variant="ghost" className="gap-2" asChild>
        <Link href="/settings" onClick={onNavigate} aria-label="Open settings">
          <Settings className="h-4 w-4" aria-hidden="true" />
          <span>Settings</span>
        </Link>
      </Button>
    </>
  );

  return (
    <nav 
      className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60"
      aria-label="Main navigation"
    >
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo and App Name */}
        <div className="flex items-center gap-6">
          <Link 
            href="/" 
            className="flex items-center gap-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring rounded-md"
            aria-label="continueml home"
          >
            <Image
              src="/images/logo.png"
              alt=""
              width={32}
              height={32}
              className="h-8 w-8 rounded-lg"
              priority
              role="presentation"
            />
            <span className="text-xl font-semibold">continueml</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2" role="navigation" aria-label="Primary">
            {renderNavLinks()}
          </div>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-2" role="navigation" aria-label="User actions">
          <ModeToggle />
          <UserNav />

          {/* Mobile Menu */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" aria-label="Toggle navigation menu">
                <Menu className="h-5 w-5" aria-hidden="true" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64" aria-label="Mobile navigation">
              <SheetHeader className="sr-only">
                <SheetTitle>Navigation menu</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-4 mt-8" aria-label="Mobile menu">
                {renderNavLinks(handleNavigate)}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
