"use client";

import { X } from "lucide-react";
import Image from "next/image";

interface AiAvatarLibraryProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  loading: boolean;
  avatars: string[];
  addAiAvatarReference: (imageUrl: string) => void;
}

export function AiAvatarLibrary({
  isOpen,
  setIsOpen,
  loading,
  avatars,
  addAiAvatarReference
}: AiAvatarLibraryProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-2xl rounded-xl bg-background p-6 shadow-xl">
        <button
          onClick={() => setIsOpen(false)}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
        <div className="mb-4">
          <h2 className="text-lg font-semibold">AI Avatar Library</h2>
          <p className="text-sm text-muted-foreground">Select an avatar to use as a reference.</p>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 max-h-[60vh] overflow-y-auto pr-2">
          {loading ? (
            <div className="col-span-full py-8 text-center text-sm text-muted-foreground">
              Loading avatars...
            </div>
          ) : avatars.length === 0 ? (
            <div className="col-span-full py-8 text-center text-sm text-muted-foreground">
              No avatars found in library.
            </div>
          ) : (
            avatars.map((file, index) => (
              <button
                key={file}
                onClick={() => addAiAvatarReference(`/ai-avatars/${file}`)}
                className="group relative aspect-square overflow-hidden rounded-lg border border-border hover:border-primary focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <Image
                  src={`/ai-avatars/${file}`}
                  alt={`AI Avatar ${index + 1}`}
                  fill
                  className="object-cover transition group-hover:scale-105"
                  unoptimized
                />
                <div className="absolute inset-0 bg-primary/0 transition-colors group-hover:bg-primary/10" />
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
