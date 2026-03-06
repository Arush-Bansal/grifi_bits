"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Plus, Video, Calendar, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

type Scene = {
  id: number;
  name: string;
  imagePrompt: string;
  videoScript: string;
  audioPrompt: string;
  imagePreview?: string;
  videoUrl?: string;
  audioUrl?: string;
};

type Project = {
  id: string;
  product_name: string;
  product_description: string;
  created_at: string;
  scenes?: Scene[];
};

export default function LibraryPage() {
  const { data: projects, isLoading } = useQuery<Project[]>({
    queryKey: ["projects"],
    queryFn: async () => {
      const { data } = await axios.get("/api/projects");
      return data;
    },
  });

  if (isLoading) {
    return (
      <main className="mx-auto min-h-[calc(100vh-4rem)] w-full max-w-6xl px-6 py-12">
        <div className="flex animate-pulse flex-col gap-6">
          <div className="h-10 w-48 rounded-md bg-muted" />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 rounded-2xl bg-muted" />
            ))}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-[calc(100vh-4rem)] w-full max-w-6xl px-6 py-12">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/60 pb-8">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Your Library</h1>
          <p className="mt-2 text-muted-foreground">Manage your generated video ads and projects.</p>
        </div>
        <Link href="/create">
          <Button className="h-11 gap-2 px-6">
            <Plus className="h-4 w-4" />
            Create New
          </Button>
        </Link>
      </div>

      {projects && projects.length > 0 ? (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <article
              key={project.id}
              className="group relative overflow-hidden rounded-2xl border border-border bg-background/50 transition-all hover:border-primary/40 hover:shadow-xl"
            >
              <div className="aspect-video w-full bg-muted/30">
                {/* Thumbnail logic - simplified for now */}
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10">
                   <Video className="h-10 w-10 text-primary/30" />
                </div>
              </div>
              <div className="p-5">
                <h3 className="text-lg font-bold group-hover:text-primary transition-colors">{project.product_name}</h3>
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{project.product_description}</p>
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" />
                    {new Date(project.created_at).toLocaleDateString()}
                  </div>
                  <Link href={`/create?id=${project.id}`} className="text-sm font-semibold text-primary hover:underline flex items-center gap-1">
                    Edit <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <section className="mt-20 flex flex-col items-center justify-center text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-secondary/50 text-muted-foreground">
            <Video className="h-10 w-10" />
          </div>
          <h2 className="mt-6 text-xl font-bold">No projects yet</h2>
          <p className="mt-2 max-w-sm text-muted-foreground">
            You haven&apos;t created any AI ads yet. Start by fetching product info and generating a storyboard.
          </p>
          <Link href="/create" className="mt-8">
            <Button size="lg" className="gap-2">
              <Plus className="h-5 w-5" />
              Start First Project
            </Button>
          </Link>
        </section>
      )}
    </main>
  );
}
