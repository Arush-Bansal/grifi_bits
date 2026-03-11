"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { UploadCloud } from "lucide-react";

interface ProductImageUploadProps {
  handleFileInput: (files: FileList | null) => void;
}

export function ProductImageUpload({ handleFileInput }: ProductImageUploadProps) {
  return (
    <div className="rounded-xl border border-dashed border-primary/40 bg-secondary/30 p-5">
      <Label htmlFor="images" className="mb-2 block">
        Upload product images
      </Label>
      <label
        htmlFor="images"
        className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-border bg-background/80 px-4 py-3 text-sm text-muted-foreground"
      >
        <UploadCloud className="h-4 w-4" />
        Select up to 8 images
      </label>
      <Input
        id="images"
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFileInput(e.target.files)}
      />
    </div>
  );
}
