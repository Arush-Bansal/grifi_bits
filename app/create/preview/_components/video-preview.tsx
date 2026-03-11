"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Scene } from "../../types";
import { formatTimelineTime } from "../../_utils";
import { StoryboardTimelineClip } from "@/components/timeline/storyboard-timeline";

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
      <div className="relative mx-auto aspect-[9/16] max-h-[620px] overflow-hidden rounded-2xl bg-gradient-to-b from-[#89c9ff] to-[#3f98eb]">
        <audio ref={audioRef} className="hidden" />
        <audio ref={bgAudioRef} className="hidden" />
        {activeTimelineClip?.sceneId ? (
          (() => {
            const activeScene = scenes.find((s) => s.id === activeTimelineClip.sceneId);
            if (activeScene?.video_url) {
              return (
                <video
                  src={activeScene.video_url}
                  controls
                  className="absolute inset-0 h-full w-full object-cover"
                />
              );
            }
            return (
              <div className="absolute inset-0">
                {activeScene?.image_url ? (
                  <div className="relative h-full w-full">
                    <Image
                      src={activeScene.image_url}
                      alt="Preview"
                      fill
                      className="object-cover opacity-40 blur-[2px]"
                    />
                    <div className="absolute inset-0 bg-black/20" />
                  </div>
                ) : (
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.45),transparent_45%)]" />
                )}
                <div className="absolute inset-0 flex items-center justify-center p-4 text-center text-white">
                  {isPending ? (
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
              {isPending ? "Generating your video masterpiece..." : "Generate media to see the video preview"}
            </div>
          </>
        )}
        <div className="absolute bottom-4 left-4 right-4 rounded-xl bg-black/30 px-3 py-2 text-xs text-white">
          {captionsEnabled ? "Caption preview enabled" : "Captions disabled"}
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
      <Button onClick={onGenerateMedia} disabled={isPending} className="mt-4 w-full">
        {isPending ? "Generating Media..." : "Generate Final Media"}
      </Button>
    </div>
  );
}
