"use client";

import { Button } from "@/components/ui/button";
import { Scene, VideoSettings } from "../../types";
import { MediaDisplay } from "./MediaDisplay";

interface VideoPreviewProps {
  scenes: Scene[];
  audioRef: React.RefObject<HTMLAudioElement>;
  bgAudioRef: React.RefObject<HTMLAudioElement>;
  isPending: boolean;
  onRenderVideo: () => void;
  settings?: VideoSettings;
  productName?: string;
}

export function VideoPreview({
  scenes,
  audioRef,
  bgAudioRef,
  isPending,
  onRenderVideo,
  settings,
  productName,
}: VideoPreviewProps) {
  return (
    <div className="rounded-2xl border border-border bg-white/90 p-4 flex flex-col h-full">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-semibold text-foreground">Video Preview</p>
        <div className="flex items-center gap-2">
           {/* Add a simple play/pause indicator if needed or just rely on video controls */}
        </div>
      </div>
      
      <div className="flex-1 min-h-0">
        <MediaDisplay
          scenes={scenes}
          audioRef={audioRef}
          bgAudioRef={bgAudioRef}
          isPending={isPending}
          settings={settings}
          productName={productName}
        />
      </div>

      <Button onClick={onRenderVideo} disabled={isPending} className="mt-4 w-full h-12 text-lg font-medium">
        {isPending ? "Generating..." : "Generate Final Media"}
      </Button>
    </div>
  );
}
