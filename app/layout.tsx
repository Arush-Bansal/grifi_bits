import type { Metadata } from "next";
import Link from "next/link";
import { Plus_Jakarta_Sans, Sora } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Toaster } from "sonner";


const bodyFont = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-body"
});

const headingFont = Sora({
  subsets: ["latin"],
  variable: "--font-heading"
});

export const metadata: Metadata = {
  title: "ORBIT",
  description: "AI SaaS for UGC and ad creation"
};

import Providers from "@/components/Providers";
import { NavBarCreateNewButton } from "@/components/NavBarCreateNewButton";

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={cn(bodyFont.variable, headingFont.variable, "min-h-screen bg-background font-sans text-foreground")}>
        <Providers>
          <div className="min-h-screen">
            <header className="fixed inset-x-0 top-0 z-50 border-b border-primary/20 bg-secondary/65 backdrop-blur">
              <nav className="flex h-16 w-full items-center justify-between px-3 sm:px-5 md:px-7">
                <Button asChild variant="ghost" className="px-2 text-base font-bold tracking-tight text-foreground">
                  <Link href="/">ORBIT</Link>
                </Button>
                <div className="flex items-center gap-2">
                  <Button asChild variant="outline" className="border-primary/30 bg-background/65 hover:bg-accent/70">
                    <Link href="/library">Library</Link>
                  </Button>
                  <NavBarCreateNewButton />
                </div>
              </nav>
            </header>
            <main className="pt-16">{children}</main>
          </div>
          <Toaster position="top-right" richColors closeButton />
        </Providers>
      </body>

    </html>
  );
}
