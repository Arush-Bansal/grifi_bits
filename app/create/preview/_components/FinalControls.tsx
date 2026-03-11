"use client";

import StoryboardTimeline from "./timeline";
import { StoryboardTimelineClip } from "../../types";
import { Button } from "@/components/ui/button";
import { CaptionsControl } from "./captions-control";
import { MusicControl } from "./music-control";
import { RenderSetup } from "./render-setup";
import { TIMELINE_MIN_DURATION_SECONDS } from "../../constants";
import { VideoSettings } from "../../types";

interface FinalControlsProps {
  settings: VideoSettings;
  setSettings: (updater: VideoSettings | ((prev: VideoSettings) => VideoSettings)) => void;
  timelineClips: StoryboardTimelineClip[];
  timelineCurrentTime: number;
  timelineIsPlaying: boolean;
  onTimelineTimeChange: (time: number) => void;
  onTimelineIsPlayingChange: (isPlaying: boolean) => void;
  onTimelineClipsChange: (clips: StoryboardTimelineClip[]) => void;
  onSaveProject: () => void;
  isSaving: boolean;
}

export function FinalControls({
  settings,
  setSettings,
  timelineClips,
  timelineCurrentTime,
  timelineIsPlaying,
  onTimelineTimeChange,
  onTimelineIsPlayingChange,
  onTimelineClipsChange,
  onSaveProject,
  isSaving,
}: FinalControlsProps) {
  return (
    <div className="space-y-4 rounded-2xl border border-border bg-white/85 p-5">
      <h2 className="text-xl font-semibold">Final Controls</h2>

      <CaptionsControl settings={settings} setSettings={setSettings} />

      <MusicControl settings={settings} setSettings={setSettings} />

      <RenderSetup />

      <div className="rounded-xl bg-secondary/50 p-4">
        <StoryboardTimeline
          clips={timelineClips}
          currentTime={timelineCurrentTime}
          isPlaying={timelineIsPlaying}
          minClipDuration={TIMELINE_MIN_DURATION_SECONDS}
          onCurrentTimeChange={onTimelineTimeChange}
          onIsPlayingChange={onTimelineIsPlayingChange}
          onClipsChange={onTimelineClipsChange}
        />
      </div>

      <Button 
        onClick={onSaveProject} 
        disabled={isSaving} 
        className="w-full"
      >
        {isSaving ? "Saving..." : "Save Project"}
      </Button>
    </div>
  );
}
