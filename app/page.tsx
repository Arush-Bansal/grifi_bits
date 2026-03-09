"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useSaveProjectMutation } from "./create/_hooks";
import axios from "axios";

export default function HomePage() {
  const router = useRouter();

  const createProjectMutation = useSaveProjectMutation({
    onSuccess: (data) => {
      if (data.id) {
        router.push(`/create/setup?id=${data.id}`);
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
      product_name: "Untitled Project"
    });
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 md:px-10">
      <div className="absolute inset-0 mesh-bg opacity-60" />
      <div className="relative z-10 mx-auto max-w-5xl text-center">
        <p className="mb-6 text-sm uppercase tracking-[0.24em] text-primary md:text-base">Orbit UGC Studio</p>
        <h1 className="text-5xl font-bold leading-[0.98] text-foreground md:text-7xl">Create UGC ads from an idea to final video in minutes</h1>
        <p className="mx-auto mt-7 max-w-2xl text-base text-muted-foreground md:text-2xl">
          Describe your product, choose references, tune scenes, and generate a portrait-ready ad preview.
        </p>
        <Button 
          size="lg" 
          className="mt-10 rounded-full px-14 text-lg md:h-14 md:text-xl"
          onClick={handleCreateNew}
          disabled={createProjectMutation.isPending}
        >
          {createProjectMutation.isPending && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
          Create New
        </Button>
      </div>
    </main>
  );
}
