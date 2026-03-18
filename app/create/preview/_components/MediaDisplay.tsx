"use client";

import { Player } from "@remotion/player";
import { Scene, VideoSettings } from "../../types";
import { getTemplateDurationInFrames, resolveTemplateConfig } from "../../../../remotion/template-registry";

export function MediaDisplay({
  scenes,
  audioRef,
  bgAudioRef,
  isPending,
  settings,
  productName,
  finalVideoUrl,
}: {
  scenes: Scene[];
  audioRef: React.RefObject<HTMLAudioElement>;
  bgAudioRef: React.RefObject<HTMLAudioElement>;
  isPending: boolean;
  settings?: VideoSettings;
  productName?: string;
  finalVideoUrl?: string;
}) {
  const resolvedTemplateId =
    settings?.template_id ||
    (settings?.template_preference && settings.template_preference !== "auto"
      ? settings.template_preference
      : undefined);

  const templateConfig = resolveTemplateConfig(resolvedTemplateId);
  const TemplateComponent = templateConfig.component;
  const width = templateConfig.width;
  const height = templateConfig.height;
  const durationInFrames = getTemplateDurationInFrames(resolvedTemplateId, scenes.length, 30);
  const isPortrait = height >= width;

  return (
    <div
      className={`relative mx-auto w-full overflow-hidden rounded-2xl bg-black shadow-xl ${
        isPortrait ? "aspect-[9/16] max-h-[620px]" : "aspect-video max-h-[460px]"
      }`}
    >
      <audio ref={audioRef} className="hidden" />
      <audio ref={bgAudioRef} className="hidden" />

      {isPending ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-white bg-gradient-to-b from-[#89c9ff] to-[#3f98eb]">
           <div className="h-12 w-12 animate-spin rounded-full border-4 border-white/20 border-t-white" />
           <p className="mt-4 font-medium">Crafting your video...</p>
        </div>
      ) : finalVideoUrl ? (
        <video
          src={finalVideoUrl}
          controls
          className="h-full w-full object-contain bg-black"
        />
      ) : scenes.length > 0 ? (
        <Player
          component={TemplateComponent}
          inputProps={{
            scenes: scenes || [],
            productName: productName || "Product Name",
            brandColor: settings?.brand_color || "#f97316",
          }}
          durationInFrames={durationInFrames}
          fps={30}
          compositionWidth={width}
          compositionHeight={height}
          style={{
            width: "100%",
            height: "100%",
          }}
          controls
          loop
        />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-white bg-gradient-to-b from-[#89c9ff] to-[#3f98eb]">
          <p className="text-lg font-medium drop-shadow-md">
            Add scenes to see the preview
          </p>
        </div>
      )}
    </div>
  );
}
