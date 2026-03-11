"use client";

import Image from "next/image";
import { Scene } from "../../types";
import { StoryboardTimelineClip } from "@/components/timeline/storyboard-timeline";

interface MediaDisplayProps {
  activeTimelineClip: StoryboardTimelineClip | null;
  scenes: Scene[];
  audioRef: React.RefObject<HTMLAudioElement>;
  bgAudioRef: React.RefObject<HTMLAudioElement>;
  isPending: boolean;
  captionsEnabled: boolean;
}

export function MediaDisplay({
  activeTimelineClip,
  scenes,
  audioRef,
  bgAudioRef,
  isPending,
  captionsEnabled,
}: MediaDisplayProps) {
  const activeScene = scenes.find((s) => s.id === activeTimelineClip?.sceneId);

  return (
    <div className="relative mx-auto aspect-[9/16] max-h-[620px] overflow-hidden rounded-2xl bg-gradient-to-b from-[#89c9ff] to-[#3f98eb]">
      <audio ref={audioRef} className="hidden" />
      <audio ref={bgAudioRef} className="hidden" />

      {activeTimelineClip?.sceneId ? (
        <>
          {activeScene?.video_url ? (
            <video
              src={activeScene.video_url}
              controls
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
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
          )}
        </>
      ) : (
        <>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.45),transparent_45%)]" />
          <div className="absolute inset-0 flex items-center justify-center p-4 text-center text-white">
            {isPending ? "Generating your video masterpiece..." : "Generate media to see the video preview"}
          </div>
        </>
      )}

      <div className="absolute bottom-4 left-4 right-4 rounded-xl bg-black/30 px-3 py-2 text-xs text-white text-center">
        {captionsEnabled ? "Caption preview enabled" : "Captions disabled"}
      </div>
    </div>
  );
}
