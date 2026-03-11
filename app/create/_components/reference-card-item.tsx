"use client";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Pencil, Trash2, UploadCloud } from "lucide-react";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";
import { useReference } from "../_hooks/useReference";
import { useReferenceState } from "../_hooks/useReferenceState";
import { useUIState } from "../_hooks/useUIState";

interface ReferenceCardItemProps {
  projectId: string;
  referenceId: string;
}

export function ReferenceCardItem({ projectId, referenceId }: ReferenceCardItemProps) {
  const { reference, isEditing } = useReference(projectId, referenceId);
  const { 
    setReferences, 
    setEditingRefId, 
    updateReferenceLimit, 
    updateReferenceImage 
  } = useReferenceState();
  const { setLightboxImage } = useUIState();

  if (!reference) return null;

  const isGenerating = !reference.image_url && !!reference.ai_prompt;

  return (
    <article
      className={cn(
        "overflow-hidden rounded-2xl border border-border bg-white/90 transition-all hover:border-primary/50"
      )}
    >
      <div className="group block w-full text-left">
        <div className="relative h-44 w-full">
          {reference.image_url && typeof reference.image_url === 'string' && (reference.image_url.startsWith('http') || reference.image_url.startsWith('blob:') || reference.image_url.startsWith('/')) ? (
            <Image
              src={reference.image_url}
              alt={reference.label}
              fill
              className="object-cover transition group-hover:scale-105 cursor-pointer"
              onClick={() => setLightboxImage(reference.image_url!)}
              unoptimized
            />
          ) : isGenerating ? (
            <Skeleton className="h-full w-full rounded-none" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-muted">
              <span className="text-[10px] text-muted-foreground">No image available</span>
            </div>
          )}
          {typeof reference?.id === "string" && reference.id.startsWith("custom-") && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                setReferences((prev) => prev.filter((r) => r.id !== reference.id));
              }}
              className="absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md transition-all hover:bg-destructive"
              title="Remove reference"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <div className="bg-white/90 p-4">
          <Input
            id={`reference-label-${reference.id}`}
            value={reference.label}
            onChange={(e) => updateReferenceLimit(reference.id, "label", e.target.value)}
            readOnly={!isEditing}
            className={cn(
              "h-7 text-sm font-semibold text-foreground transition-all duration-200",
              isEditing
                ? "bg-background border-input px-3"
                : "border-none bg-transparent p-0 focus-visible:ring-0"
            )}
          />
          <Input
            value={reference.tagline}
            onChange={(e) => updateReferenceLimit(reference.id, "tagline", e.target.value)}
            readOnly={!isEditing}
            className={cn(
              "h-7 text-xs text-muted-foreground transition-all duration-200",
              isEditing
                ? "mt-2 bg-background border-input px-3"
                : "mt-1 border-none bg-transparent p-0 focus-visible:ring-0"
            )}
          />
        </div>
      </div>
      <div className="flex items-center gap-3 border-t border-border/70 bg-white/90 p-3">
        <button
          type="button"
          onClick={() => {
            if (isEditing) {
              setEditingRefId(null);
            } else {
              setEditingRefId(reference.id);
              setTimeout(() => {
                const input = document.getElementById(`reference-label-${reference.id}`);
                if (input) input.focus();
              }, 50);
            }
          }}
          className="inline-flex cursor-pointer items-center gap-1 text-xs text-primary bg-transparent border-none p-0 outline-none hover:underline"
        >
          <Pencil className="h-3.5 w-3.5" />
          {isEditing ? "Save" : "Edit details"}
        </button>
        <span className="text-xs text-muted-foreground">|</span>
        <label
          htmlFor={`reference-image-${reference.id}`}
          className="inline-flex cursor-pointer items-center gap-1 text-xs text-primary"
        >
          <UploadCloud className="h-3.5 w-3.5" />
          Upload image
        </label>
        <Input
          id={`reference-image-${reference.id}`}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            updateReferenceImage(reference.id, e.target.files);
            e.target.value = "";
          }}
        />
      </div>
    </article>
  );
}
