import React from "react";
import { AbsoluteFill, Sequence, useVideoConfig } from "remotion";
import { TEMPLATE_COMPONENTS } from "../template-components";
import { TemplateId, TEMPLATE_METADATA } from "../../lib/template-catalog";

export interface MultiScene {
  template_id: TemplateId;
  id: number;
  image_url?: string | null;
  video_url?: string | null;
  speech?: string;
  name?: string;
}

interface MainAdProps {
  scenes?: MultiScene[];
  productName?: string;
  brandColor?: string;
}

export const MainAdTemplate: React.FC<MainAdProps> = ({
  scenes = [],
  productName = "Product Name",
  brandColor = "#f97316",
}) => {
  const { fps, width, height } = useVideoConfig();
  const isLandscape = width > height;

  let currentFrame = 0;

  if (scenes.length === 0) {
    console.warn("MainAdTemplate: No scenes provided");
    return <AbsoluteFill style={{ backgroundColor: "red" }} />; // Visible error
  }

  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {scenes.map((scene, index) => {
        // Fallback rotation for standard templates if template_id is missing
        const portraitFallbacks: TemplateId[] = ["ProductDemoVertical", "BentoGrid", "DynamicSocial", "Minimalist"];
        const landscapeFallbacks: TemplateId[] = ["ProductDemo", "BentoGrid", "Minimalist", "SplitScreen"];
        
        const fallbackIds = isLandscape ? landscapeFallbacks : portraitFallbacks;
        const tid = scene.template_id || fallbackIds[index % fallbackIds.length];
        
        const component = TEMPLATE_COMPONENTS[tid];
        const metadata = TEMPLATE_METADATA[tid];
        
        if (!component || !metadata) {
          console.error(`MainAdTemplate: Missing component or metadata for template_id: "${tid}". original: "${scene.template_id}". Scene object:`, JSON.stringify(scene, null, 2));
          return null;
        }

        const durationInFrames = Math.round(metadata.sceneDurationSeconds * fps);
        const startFrame = currentFrame;
        currentFrame += durationInFrames;

        const TemplateComponent = component;

        return (
          <Sequence
            key={`${scene.id}-${scene.template_id}-${index}`}
            from={startFrame}
            durationInFrames={durationInFrames}
          >
            <TemplateComponent
              scenes={[scene]}
              productName={productName}
              brandColor={brandColor}
            />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
