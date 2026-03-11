"use client";

interface AiAvatarLibraryCardProps {
  onOpen: () => void;
}

export function AiAvatarLibraryCard({ onOpen }: AiAvatarLibraryCardProps) {
  return (
    <article className="overflow-hidden rounded-2xl border border-dashed border-primary/40 bg-white/60">
      <button
        onClick={onOpen}
        type="button"
        className="flex min-h-[278px] w-full cursor-pointer flex-col items-center justify-center gap-2 p-4 text-center hover:bg-white/40"
      >
        <span className="text-2xl">✨</span>
        <p className="text-sm font-semibold text-foreground">AI Avatar Library</p>
        <p className="text-xs text-muted-foreground">Select an AI avatar reference</p>
      </button>
    </article>
  );
}
