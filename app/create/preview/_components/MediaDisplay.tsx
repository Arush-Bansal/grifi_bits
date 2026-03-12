"use client";

import { Player } from "@remotion/player";
import { ProductDemoTemplate } from "../../../../remotion/templates/ProductDemoTemplate";
import { MinimalistTemplate } from "../../../../remotion/templates/MinimalistTemplate";
import { DynamicSocialTemplate } from "../../../../remotion/templates/DynamicSocialTemplate";
import { SplitScreenTemplate } from "../../../../remotion/templates/SplitScreenTemplate";
import { Scene, VideoSettings } from "../../types";

const TEMPLATE_COMPONENTS: Record<string, React.FC<any>> = {
  ProductDemo: ProductDemoTemplate,
  Minimalist: MinimalistTemplate,
  DynamicSocial: DynamicSocialTemplate,
  SplitScreen: SplitScreenTemplate,
};

export function MediaDisplay({
  scenes,
  audioRef,
  bgAudioRef,
  isPending,
  settings,
  productName,
}: {
  scenes: Scene[];
  audioRef: React.RefObject<HTMLAudioElement>;
  bgAudioRef: React.RefObject<HTMLAudioElement>;
  isPending: boolean;
  settings?: VideoSettings;
  productName?: string;
}) {
  const orientation = settings?.orientation || "landscape";
  const templateId = settings?.template_id || "ProductDemo";
  const TemplateComponent = TEMPLATE_COMPONENTS[templateId] || ProductDemoTemplate;
  
  // Base dimensions for the player
  const width = orientation === "portrait" ? 1080 : 1920;
  const height = orientation === "portrait" ? 1920 : 1080;

  return (
    <div className="relative mx-auto aspect-[9/16] max-h-[620px] w-full overflow-hidden rounded-2xl bg-black shadow-xl">
      <audio ref={audioRef} className="hidden" />
      <audio ref={bgAudioRef} className="hidden" />

      {isPending ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-white bg-gradient-to-b from-[#89c9ff] to-[#3f98eb]">
           <div className="h-12 w-12 animate-spin rounded-full border-4 border-white/20 border-t-white" />
           <p className="mt-4 font-medium">Crafting your video...</p>
        </div>
      ) : scenes.length > 0 ? (
        <Player
          component={TemplateComponent as any}
          inputProps={{
            scenes: scenes || [],
            productName: productName || "Product Name",
            brandColor: "#f97316", // Default color for now
          }}
          durationInFrames={scenes.length * 3 * 30} // 3s per scene @ 30fps
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
