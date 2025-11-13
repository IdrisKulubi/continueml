"use client";

import { useEffect, useState } from "react";
import { Navbar } from "./navbar";
import { SkipNav } from "./skip-nav";

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <div className="relative min-h-screen flex flex-col">
      <SkipNav />
      {isMounted ? <Navbar /> : <div className="h-16" aria-hidden="true" />}
      <main id="main-content" className="flex-1" tabIndex={-1}>
        {children}
      </main>
    </div>
  );
}
