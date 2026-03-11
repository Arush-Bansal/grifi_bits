"use client";

import { Pause, Play } from "lucide-react";
import { Button } from "@/components/ui/button";

type TimelineFooterProps = {
  isPlaying: boolean;
  onTogglePlayback: () => void;
};

export function TimelineFooter({ isPlaying, onTogglePlayback }: TimelineFooterProps) {
  return (
    <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
      <p className="text-xs text-muted-foreground">Drag to reorder, resize clip edges to trim. Snap: 0.5s, min: 1.0s.</p>
      <Button type="button" variant="outline" size="sm" onClick={onTogglePlayback}>
        {isPlaying ? <Pause className="mr-1.5 h-3.5 w-3.5" /> : <Play className="mr-1.5 h-3.5 w-3.5" />}
        {isPlaying ? "Pause" : "Play"}
      </Button>
    </div>
  );
}
