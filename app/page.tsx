"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 md:px-10">
      <div className="absolute inset-0 mesh-bg opacity-60" />
      <div className="relative z-10 mx-auto max-w-5xl text-center">
        <p className="mb-6 text-sm uppercase tracking-[0.24em] text-primary md:text-base">Orbit UGC Studio</p>
        <h1 className="text-5xl font-bold leading-[0.98] text-foreground md:text-7xl">Create UGC ads from an idea to final video in minutes</h1>
        <p className="mx-auto mt-7 max-w-2xl text-base text-muted-foreground md:text-2xl">
          Describe your product, choose references, tune scenes, and generate a portrait-ready ad preview.
        </p>
        <Button asChild size="lg" className="mt-10 rounded-full px-14 text-lg md:h-14 md:text-xl">
          <Link href="/create">Start</Link>
        </Button>
      </div>
    </main>
  );
}
