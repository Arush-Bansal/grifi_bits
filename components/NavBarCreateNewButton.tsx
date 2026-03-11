"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useSaveProjectMutation } from "@/app/create/_hooks";
import axios from "axios";

export function NavBarCreateNewButton() {
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
    <Button onClick={handleCreateNew} disabled={createProjectMutation.isPending}>
      {createProjectMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      Create New
    </Button>
  );
}
