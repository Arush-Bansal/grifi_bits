"use client";

import { useProjectsQuery, useSaveProjectMutation, useDeleteProjectMutation } from "../create/_hooks";
import { ProjectData } from "../create/types";
import { Plus, Video, Calendar, ArrowRight, Trash2, Edit3, Check, X } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Input } from "@/components/ui/input";

export default function LibraryPage() {
  const { data: projects, isLoading } = useProjectsQuery();
  const deleteMutation = useDeleteProjectMutation();
  const saveMutation = useSaveProjectMutation();
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const projectsList = (projects || []) as ProjectData[];

  const handleRename = (project: ProjectData) => {
    if (!project.id) return;
    if (editName.trim() === "" || editName === project.product_name) {
      setEditingId(null);
      return;
    }
    saveMutation.mutate({ ...project, product_name: editName });
    setEditingId(null);
  };

  const handleDelete = (id: string | undefined) => {
    if (!id) return;
    if (confirm("Are you sure you want to delete this project?")) {
      deleteMutation.mutate(id);
    }
  };

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

      {projectsList && projectsList.length > 0 ? (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projectsList.map((project) => (
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
                <div className="flex items-start justify-between gap-2">
                  {editingId === project.id ? (
                    <div className="flex w-full items-center gap-2">
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="h-8 flex-1"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleRename(project);
                          if (e.key === "Escape") setEditingId(null);
                        }}
                      />
                      <button onClick={() => handleRename(project)} className="text-primary hover:text-primary/80">
                        <Check className="h-4 w-4" />
                      </button>
                      <button onClick={() => setEditingId(null)} className="text-muted-foreground hover:text-foreground">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <h3 className="text-lg font-bold group-hover:text-primary transition-colors line-clamp-1">{project.product_name}</h3>
                      <button 
                        onClick={() => {
                          if (project.id) {
                            setEditingId(project.id);
                            setEditName(project.product_name || "");
                          }
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-primary"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                    </>
                  )}
                </div>
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{project.product_description}</p>
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleDelete(project.id)}
                      className="text-muted-foreground hover:text-destructive transition-colors"
                      title="Delete project"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5" />
                      {project.created_at ? new Date(project.created_at).toLocaleDateString() : 'No date'}
                    </div>
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

