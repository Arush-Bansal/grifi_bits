"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function CreatePage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const projectId = searchParams.get("id");
    const url = `/create/setup${projectId ? `?id=${projectId}` : ""}`;
    router.replace(url);
  }, [router, searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground font-medium animate-pulse uppercase tracking-widest">
          Redirecting to LabEnvironment...
        </p>
      </div>
    </div>
  );
}
