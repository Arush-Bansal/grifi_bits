"use client";

import { Video } from "lucide-react";

export function RenderSetup() {
  return (
    <div className="rounded-xl bg-secondary/50 p-4">
      <div className="flex items-center gap-2 text-sm font-semibold">
        <Video className="h-4 w-4 text-primary" /> Render Setup
      </div>
      <p className="mt-2 text-sm text-muted-foreground">
        Resolution: 1080x1920, format: MP4, length: 25-35 sec
      </p>
    </div>
  );
}
