"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { UploadCloud } from "lucide-react";

interface ProductImageUploadProps {
  handleFileInput: (files: FileList | null) => void;
}

export function ProductImageUpload({ handleFileInput }: ProductImageUploadProps) {
  return (
    <div className="group relative rounded-2xl border-2 border-dashed border-primary/20 bg-primary/5 p-8 transition-all hover:border-primary/40 hover:bg-primary/10">
      <div className="flex flex-col items-center text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary shadow-sm transition-transform group-hover:scale-110">
          <UploadCloud className="h-7 w-7" />
        </div>
        <Label htmlFor="images" className="mb-1 text-lg font-bold tracking-tight text-foreground/90">
          Upload product images
        </Label>
        <p className="mb-6 text-sm text-muted-foreground">
          Select up to 8 high-quality images of your product
        </p>
        <label
          htmlFor="images"
          className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-full bg-primary px-8 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95"
        >
          Select Files
        </label>
      </div>
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
