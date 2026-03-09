"use client";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Pencil, Trash2, UploadCloud } from "lucide-react";
import Image from "next/image";
import { ReferenceCard } from "../types";

interface ReferenceStyleStepProps {
  references: ReferenceCard[];
  setReferences: (refs: ReferenceCard[] | ((prev: ReferenceCard[]) => ReferenceCard[])) => void;
  editingRefId: string | null;
  setEditingRefId: (id: string | null) => void;
  updateReferenceLimit: (id: string, key: "label" | "tagline", value: string) => void;
  updateReferenceImage: (referenceId: string, files: FileList | null) => void;
  addReferenceCard: (files: FileList | null) => void;
  setIsAiAvatarLibraryOpen: (open: boolean) => void;
}

export function ReferenceStyleStep({
  references,
  setReferences,
  editingRefId,
  setEditingRefId,
  updateReferenceLimit,
  updateReferenceImage,
  addReferenceCard,
  setIsAiAvatarLibraryOpen
}: ReferenceStyleStepProps) {
  return (
    <div>
      <p className="mb-5 max-w-2xl text-sm text-muted-foreground">
        These references are all used in the next step. Edit any image or upload additional references.
      </p>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {references.map((reference) => {
          return (
            <article
              key={reference.id}
              className={cn(
                "overflow-hidden rounded-2xl border border-border bg-white/90 transition-all hover:border-primary/50"
              )}
            >
              <div className="group block w-full text-left">
                <div className="relative h-44 w-full">
                  <Image
                    src={reference.image}
                    alt={reference.label}
                    fill
                    className="object-cover transition group-hover:scale-105"
                    unoptimized
                  />
                  {reference.id.startsWith("custom-") && (
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
                    readOnly={editingRefId !== reference.id}
                    className={cn(
                      "h-7 text-sm font-semibold text-foreground transition-all duration-200",
                      editingRefId === reference.id
                        ? "bg-background border-input px-3"
                        : "border-none bg-transparent p-0 focus-visible:ring-0"
                    )}
                  />
                  <Input
                    value={reference.tagline}
                    onChange={(e) => updateReferenceLimit(reference.id, "tagline", e.target.value)}
                    readOnly={editingRefId !== reference.id}
                    className={cn(
                      "h-7 text-xs text-muted-foreground transition-all duration-200",
                      editingRefId === reference.id
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
                    if (editingRefId === reference.id) {
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
                  {editingRefId === reference.id ? "Save" : "Edit details"}
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
        })}
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
              addReferenceCard(e.target.files);
              e.target.value = "";
            }}
          />
        </article>
        <article className="overflow-hidden rounded-2xl border border-dashed border-primary/40 bg-white/60">
          <button
            onClick={() => setIsAiAvatarLibraryOpen(true)}
            type="button"
            className="flex min-h-[278px] w-full cursor-pointer flex-col items-center justify-center gap-2 p-4 text-center hover:bg-white/40"
          >
            <span className="text-2xl">✨</span>
            <p className="text-sm font-semibold text-foreground">AI Avatar Library</p>
            <p className="text-xs text-muted-foreground">Select an AI avatar reference</p>
          </button>
        </article>
      </div>
    </div>
  );
}
