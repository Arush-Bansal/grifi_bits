"use client";

import { Input } from "@/components/ui/input";
import { UploadCloud } from "lucide-react";

interface AddReferenceCardProps {
  onAdd: (files: FileList | null) => void;
}

export function AddReferenceCard({ onAdd }: AddReferenceCardProps) {
  return (
    <article className="overflow-hidden rounded-2xl border border-dashed border-primary/40 bg-white/60">
      <label
        htmlFor="add-reference-image"
        className="flex min-h-[278px] cursor-pointer flex-col items-center justify-center gap-2 p-4 text-center"
      >
        <UploadCloud className="h-6 w-6 text-primary" />
        <p className="text-sm font-semibold text-foreground">Add reference</p>
        <p className="text-xs text-muted-foreground">Upload a new image card</p>
      </label>
      <Input
        id="add-reference-image"
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          onAdd(e.target.files);
          e.target.value = "";
        }}
      />
    </article>
  );
}
