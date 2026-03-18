"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowRight, Sparkles, Link as LinkIcon } from "lucide-react";
import { useSaveProjectMutation } from "./create/_hooks";
import axios from "axios";
import { cn } from "@/lib/utils";

export default function HomePage() {
  const router = useRouter();
  const [productLink, setProductLink] = useState("");

  const createProjectMutation = useSaveProjectMutation({
    onSuccess: (data) => {
      if (data.id) {
        router.push(`/create/setup?id=${data.id}${productLink ? `&url=${encodeURIComponent(productLink)}` : ""}`);
      }
    },
    onError: (error: Error) => {
      console.error("Failed to create project:", error);
      let message = error.message || "Unknown error";
      if (axios.isAxiosError(error)) {
        message = (error.response?.data as { error?: string })?.error || message;
      }
      alert(`Failed to create project: ${message}`);
    }
  });

  const handleCreateNew = () => {
    createProjectMutation.mutate({
      product_name: "Untitled Project",
      settings: productLink ? {
        orientation: "portrait",
        duration: 15,
        product_urls: [productLink]
      } : undefined
    });
  };

  return (
    <main className="relative min-h-[calc(100vh-64px)] overflow-hidden flex items-center justify-center py-20 px-6">
      {/* Background Elements */}
      <div className="absolute inset-0 mesh-bg opacity-40" />
      
      {/* Dynamic Orbs */}
      <div className="absolute top-[10%] left-[5%] w-[40rem] h-[40rem] bg-primary/20 rounded-full blur-[120px] animate-float opacity-30 pointer-events-none" />
      <div className="absolute bottom-[10%] right-[5%] w-[35rem] h-[35rem] bg-blue-400/20 rounded-full blur-[120px] animate-float-delayed opacity-20 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[50rem] h-[50rem] bg-indigo-500/10 rounded-full blur-[150px] animate-float-slow opacity-20 pointer-events-none" />

      <div className="relative z-10 w-full max-w-5xl mx-auto flex flex-col items-center text-center">
        {/* Badge */}
        <div className="mb-10 group cursor-default">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card border-primary/20 bg-primary/5 transition-all duration-300 hover:scale-105 active:scale-95">
            <Sparkles className="w-4 h-4 text-primary animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary/80">BITS BY GRIFI</span>
          </div>
        </div>

        {/* Hero Title */}
        <h1 className="max-w-4xl text-5xl md:text-8xl font-black tracking-tight leading-[0.95] mb-8 premium-text-gradient">
          One-click product demos for your <span className="italic font-serif text-primary">e-commerce</span>
        </h1>

        {/* Hero Description */}
        <p className="max-w-2xl text-lg md:text-2xl text-muted-foreground mb-12 font-medium leading-relaxed">
          Paste your product link, and we&apos;ll generate a professional video ad in minutes. 
          Powerful AI. Zero effort.
        </p>

        {/* Call to Action Container */}
        <div className="w-full max-w-2xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-12 duration-1000 fill-mode-both">
          <div className="glass-card p-2 rounded-3xl flex flex-col md:flex-row gap-3 relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-blue-500/10 to-primary/20 rounded-[2rem] blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500 pointer-events-none" />
            
            <div className="relative flex-1 flex items-center px-4 md:px-6 py-3 rounded-2xl bg-background/50 border border-transparent focus-within:border-primary/30 transition-all duration-300">
              <LinkIcon className="w-5 h-5 text-muted-foreground mr-3 shrink-0" />
              <input
                type="text"
                placeholder="Paste Amazon, Blinkit, or website link"
                className="w-full bg-transparent text-lg md:text-xl outline-none placeholder:text-muted-foreground/50 font-medium"
                value={productLink}
                onChange={(e) => setProductLink(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && productLink.trim() && handleCreateNew()}
              />
            </div>
            
            <Button 
              size="lg" 
              className={cn(
                "h-14 md:h-auto px-8 py-6 text-lg font-bold rounded-2xl shadow-xl shadow-primary/20 transition-all group/btn",
                "bg-primary hover:bg-primary/90 text-primary-foreground hover:scale-[1.02] active:scale-[0.98]"
              )}
              onClick={handleCreateNew}
              disabled={createProjectMutation.isPending || !productLink.trim()}
            >
              {createProjectMutation.isPending ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <span className="flex items-center gap-2">
                  Get Started
                  <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                </span>
              )}
            </Button>
          </div>

          {/* Manual Link */}
          <button 
            onClick={handleCreateNew}
            className="text-sm md:text-base font-semibold text-muted-foreground/60 hover:text-primary transition-colors flex items-center justify-center gap-2 mx-auto italic decoration-dotted underline-offset-4 underline"
          >
            Don&apos;t have a link? Set up manually 
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </main>
  );
}
