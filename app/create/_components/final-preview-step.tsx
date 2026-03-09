"use client";

import StoryboardTimeline, { StoryboardTimelineClip } from "@/components/timeline/storyboard-timeline";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Music2, Subtitles, Video } from "lucide-react";
import { Scene } from "../types";

interface FinalPreviewStepProps {
  productName: string;
  activeTimelineClip: StoryboardTimelineClip | null;
  scenes: Scene[];
  generateMediaLoading: boolean;
  generateMedia: () => void;
  captions: boolean;
  setCaptions: (val: boolean | ((prev: boolean) => boolean)) => void;
  music: string;
  setMusic: (val: string) => void;
  timelineClips: StoryboardTimelineClip[];
  timelineCurrentTime: number;
  timelineIsPlaying: boolean;
  TIMELINE_MIN_DURATION_SECONDS: number;
  handleTimelineTimeChange: (time: number) => void;
  setTimelineIsPlaying: (playing: boolean) => void;
  handleTimelineClipsChange: (clips: StoryboardTimelineClip[]) => void;
  saveProject: () => void;
  saving: boolean;
  formatTimelineTime: (seconds: number) => string;
  timelineTotalDuration: number;
}

export function FinalPreviewStep({
  productName,
  activeTimelineClip,
  scenes,
  generateMediaLoading,
  generateMedia,
  captions,
  setCaptions,
  music,
  setMusic,
  timelineClips,
  timelineCurrentTime,
  timelineIsPlaying,
  TIMELINE_MIN_DURATION_SECONDS,
  handleTimelineTimeChange,
  setTimelineIsPlaying,
  handleTimelineClipsChange,
  saveProject,
  saving,
  formatTimelineTime,
  timelineTotalDuration
}: FinalPreviewStepProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(280px,420px)_1fr]">
      <div className="rounded-2xl border border-border bg-white/90 p-4">
        <p className="mb-3 text-sm font-semibold text-foreground">Video Preview (Portrait)</p>
        <div className="relative mx-auto aspect-[9/16] max-h-[620px] overflow-hidden rounded-2xl bg-gradient-to-b from-[#89c9ff] to-[#3f98eb]">
          {activeTimelineClip?.sceneId ? (
            (() => {
              const activeScene = scenes.find((s) => s.id === activeTimelineClip.sceneId);
              if (activeScene?.videoUrl) {
                return (
                  <video
                    src={activeScene.videoUrl}
                    controls
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                );
              }
              return (
                <div className="absolute inset-0">
                  {activeScene?.imagePreview ? (
                    <div className="relative h-full w-full">
                      <img
                        src={activeScene.imagePreview}
                        alt="Preview"
                        className="h-full w-full object-cover opacity-40 blur-[2px]"
                      />
                      <div className="absolute inset-0 bg-black/20" />
                    </div>
                  ) : (
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.45),transparent_45%)]" />
                  )}
                  <div className="absolute inset-0 flex items-center justify-center p-4 text-center text-white">
                    {generateMediaLoading ? (
                      "Generating your video masterpiece..."
                    ) : (
                      <span className="font-medium drop-shadow-md">Generate media to see the video preview</span>
                    )}
                  </div>
                </div>
              );
            })()
          ) : (
            <>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.45),transparent_45%)]" />
              <div className="absolute inset-0 flex items-center justify-center p-4 text-center text-white">
                {generateMediaLoading ? "Generating your video masterpiece..." : "Generate media to see the video preview"}
              </div>
            </>
          )}
          <div className="absolute bottom-4 left-4 right-4 rounded-xl bg-black/30 px-3 py-2 text-xs text-white">
            {captions ? "Caption preview enabled" : "Captions disabled"}
          </div>
          <div className="absolute left-4 top-4 rounded-full bg-white/85 px-3 py-1 text-xs font-medium text-primary">
            {productName || "Your Brand"}
          </div>
        </div>
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
        <Button onClick={generateMedia} disabled={generateMediaLoading} className="mt-4 w-full">
          {generateMediaLoading ? "Generating Media..." : "Generate Final Media"}
        </Button>
      </div>

      <div className="space-y-4 rounded-2xl border border-border bg-white/85 p-5">
        <h2 className="text-xl font-semibold">Final Controls</h2>

        <div className="rounded-xl bg-secondary/50 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold">Captions</p>
              <p className="text-xs text-muted-foreground">Auto animate subtitle tracks</p>
            </div>
            <button
              type="button"
              onClick={() => setCaptions(!captions)}
              className={cn(
                "relative inline-flex h-7 w-12 items-center rounded-full transition-colors",
                captions ? "bg-primary" : "bg-muted"
              )}
            >
              <span
                className={cn(
                  "inline-block h-5 w-5 transform rounded-full bg-white transition-transform",
                  captions ? "translate-x-6" : "translate-x-1"
                )}
              />
            </button>
          </div>
          <div className="mt-3 inline-flex items-center gap-2 text-xs text-muted-foreground">
            <Subtitles className="h-3.5 w-3.5" /> Burned-in UGC style captions
          </div>
        </div>

        <div className="rounded-xl bg-secondary/50 p-4">
          <Label htmlFor="music">Music</Label>
          <div className="mt-2 flex items-center gap-3">
            <Music2 className="h-4 w-4 text-primary" />
            <select
              id="music"
              value={music}
              onChange={(e) => setMusic(e.target.value)}
              className="h-10 w-full rounded-md border border-input bg-white px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="ambient-glow">Ambient Glow</option>
              <option value="tension-pop">Tension Pop</option>
              <option value="clean-corporate">Clean Corporate</option>
              <option value="hyper-ugc">Hyper UGC</option>
            </select>
          </div>
        </div>

        <div className="rounded-xl bg-secondary/50 p-4">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Video className="h-4 w-4 text-primary" /> Render Setup
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Resolution: 1080x1920, format: MP4, length: 25-35 sec
          </p>
        </div>

        <div className="rounded-xl bg-secondary/50 p-4">
          <StoryboardTimeline
            clips={timelineClips}
            currentTime={timelineCurrentTime}
            isPlaying={timelineIsPlaying}
            minClipDuration={TIMELINE_MIN_DURATION_SECONDS}
            onCurrentTimeChange={handleTimelineTimeChange}
            onIsPlayingChange={setTimelineIsPlaying}
            onClipsChange={handleTimelineClipsChange}
          />
        </div>

        <Button onClick={saveProject} disabled={saving} className="w-full">
          {saving ? "Saving..." : "Save Project"}
        </Button>
      </div>
    </div>
  );
}
