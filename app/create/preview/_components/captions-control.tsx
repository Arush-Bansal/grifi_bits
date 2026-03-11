"use client";

import { cn } from "@/lib/utils";
import { Subtitles } from "lucide-react";
import { VideoSettings } from "../../types";

interface CaptionsControlProps {
  settings: VideoSettings;
  setSettings: (updater: (prev: VideoSettings) => VideoSettings) => void;
}

export function CaptionsControl({ settings, setSettings }: CaptionsControlProps) {
  return (
    <div className="rounded-xl bg-secondary/50 p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold">Captions</p>
          <p className="text-xs text-muted-foreground">Auto animate subtitle tracks</p>
        </div>
        <button
          type="button"
          onClick={() => setSettings(prev => ({ ...prev, captions_enabled: !prev.captions_enabled }))}
          className={cn(
            "relative inline-flex h-7 w-12 items-center rounded-full transition-colors",
            settings.captions_enabled ? "bg-primary" : "bg-muted"
          )}
        >
          <span
            className={cn(
              "inline-block h-5 w-5 transform rounded-full bg-white transition-transform",
              settings.captions_enabled ? "translate-x-6" : "translate-x-1"
            )}
          />
        </button>
      </div>
      <div className="mt-3 inline-flex items-center gap-2 text-xs text-muted-foreground">
        <Subtitles className="h-3.5 w-3.5" /> Burned-in UGC style captions
      </div>
    </div>
  );
}
