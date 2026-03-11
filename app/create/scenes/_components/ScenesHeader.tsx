"use client";

import { Button } from "@/components/ui/button";
import { Loader2, Music2, Video } from "lucide-react";

interface ScenesHeaderProps {
  onGenerateAllImages: () => void;
  onGenerateAllAudios: () => void;
  isGeneratingAllImages: boolean;
  isGeneratingAllAudios: boolean;
}

export function ScenesHeader({
  onGenerateAllImages,
  onGenerateAllAudios,
  isGeneratingAllImages,
  isGeneratingAllAudios,
}: ScenesHeaderProps) {
  return (
    <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
      <p className="text-sm text-muted-foreground">
        Each row is one scene with editable prompts and read-only mock previews for start image and audio.
      </p>
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          className="h-9 px-4 text-xs font-semibold uppercase tracking-wider"
          onClick={onGenerateAllImages}
          disabled={isGeneratingAllImages}
        >
          {isGeneratingAllImages ? (
            <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
          ) : (
            <Video className="mr-2 h-3.5 w-3.5" />
          )}
          {isGeneratingAllImages ? "Generating All..." : "Generate All Images"}
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-9 px-4 text-xs font-semibold uppercase tracking-wider border-primary/30 text-primary hover:bg-primary/5"
          onClick={onGenerateAllAudios}
          disabled={isGeneratingAllAudios}
        >
          {isGeneratingAllAudios ? (
            <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
          ) : (
            <Music2 className="mr-2 h-3.5 w-3.5" />
          )}
          {isGeneratingAllAudios ? "Generating All..." : "Generate All Audios"}
        </Button>
      </div>
    </div>
  );
}
