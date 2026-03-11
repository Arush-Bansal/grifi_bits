"use client";

import { Button } from "@/components/ui/button";
import { Scene } from "../../types";
import { formatTimelineTime } from "../../_utils";
import { StoryboardTimelineClip } from "@/components/timeline/storyboard-timeline";
import { MediaDisplay } from "./MediaDisplay";

interface VideoPreviewProps {
  activeTimelineClip: StoryboardTimelineClip | null;
  scenes: Scene[];
  audioRef: React.RefObject<HTMLAudioElement>;
  bgAudioRef: React.RefObject<HTMLAudioElement>;
  isPending: boolean;
  onGenerateMedia: () => void;
  timelineCurrentTime: number;
  timelineTotalDuration: number;
  captionsEnabled: boolean;
}

export function VideoPreview({
  activeTimelineClip,
  scenes,
  audioRef,
  bgAudioRef,
  isPending,
  onGenerateMedia,
  timelineCurrentTime,
  timelineTotalDuration,
  captionsEnabled,
}: VideoPreviewProps) {
  return (
    <div className="rounded-2xl border border-border bg-white/90 p-4">
      <p className="mb-3 text-sm font-semibold text-foreground">Video Preview (Portrait)</p>
      
      <MediaDisplay
        activeTimelineClip={activeTimelineClip}
        scenes={scenes}
        audioRef={audioRef}
        bgAudioRef={bgAudioRef}
        isPending={isPending}
        captionsEnabled={captionsEnabled}
      />

      <div className="mt-3 rounded-xl border border-border/70 bg-secondary/40 p-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Active Clip</p>
        <p className="mt-1 text-sm font-semibold text-foreground">
          {activeTimelineClip
            ? `Scene ${activeTimelineClip.sceneId}: ${activeTimelineClip.title}`
            : "No clip selected"}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Playhead {formatTimelineTime(timelineCurrentTime)} / {formatTimelineTime(timelineTotalDuration)}
        </p>
      </div>

      <Button onClick={onGenerateMedia} disabled={isPending} className="mt-4 w-full">
        {isPending ? "Generating Media..." : "Generate Final Media"}
      </Button>
    </div>
  );
}
