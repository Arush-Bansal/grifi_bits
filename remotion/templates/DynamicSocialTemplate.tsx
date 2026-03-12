import { AbsoluteFill, Sequence, useVideoConfig, useCurrentFrame, interpolate, spring, Easing } from "remotion";
import React from "react";

interface Scene {
  image_url: string;
  speech: string;
  id: number;
}

interface DynamicSocialProps {
  scenes: Scene[];
  productName: string;
  brandColor?: string;
}

export const DynamicSocialTemplate: React.FC<DynamicSocialProps> = ({
  scenes = [],
  productName = "Product Name",
  brandColor = "#f97316",
}) => {
  const { fps } = useVideoConfig();
  const sceneDuration = 3 * fps;

  return (
    <AbsoluteFill style={{ backgroundColor: "#000", color: "white", fontFamily: "system-ui, sans-serif" }}>
      {scenes.map((scene, index) => {
        const startFrame = index * sceneDuration;
        return (
          <Sequence key={scene.id} from={startFrame} durationInFrames={sceneDuration}>
            <DynamicScene 
              scene={scene} 
              productName={productName} 
              brandColor={brandColor} 
              index={index}
            />
          </Sequence>
        );
      })}
      
      {/* Global Progress Bar (Top) */}
      <ProgressBar brandColor={brandColor} totalScenes={scenes.length} sceneDuration={sceneDuration} />
    </AbsoluteFill>
  );
};

const DynamicScene: React.FC<{ scene: Scene; productName: string; brandColor: string; index: number }> = ({
  scene,
  productName,
  brandColor,
  index,
}) => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  
  const springConfig = { damping: 12 };
  const entrance = spring({ frame, fps, config: springConfig });
  
  const scale = interpolate(frame, [0, 90], [1.1, 1], { easing: Easing.out(Easing.quad) });
  const textX = interpolate(entrance, [0, 1], [-100, 0]);
  const opacity = interpolate(frame, [0, 5, 85, 90], [0, 1, 1, 0]);

  return (
    <AbsoluteFill style={{ opacity }}>
      {/* Background with Zoom Out */}
      <AbsoluteFill style={{ transform: `scale(${scale})` }}>
        <img 
          src={scene.image_url} 
          style={{ width: "100%", height: "100%", objectFit: "cover" }} 
          alt="Product"
          crossOrigin="anonymous"
        />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 60%)" }} />
      </AbsoluteFill>

      {/* Dynamic Text Overlay */}
      <div style={{ 
        position: "absolute",
        bottom: "10%",
        left: "5%",
        right: "5%",
        transform: `translateX(${textX}px)`,
      }}>
        <div style={{
          display: "inline-block",
          backgroundColor: brandColor,
          color: "white",
          padding: "5px 15px",
          fontSize: "20px",
          fontWeight: "bold",
          textTransform: "uppercase",
          marginBottom: "10px",
          borderRadius: "4px"
        }}>
          {productName}
        </div>
        <h2 style={{ 
          fontSize: width > height ? "48px" : "64px", 
          lineHeight: 1.1,
          fontWeight: "900",
          margin: 0,
          textShadow: "0 4px 10px rgba(0,0,0,0.5)"
        }}>
          {scene.speech}
        </h2>
      </div>
    </AbsoluteFill>
  );
};

const ProgressBar: React.FC<{ brandColor: string; totalScenes: number; sceneDuration: number }> = ({ brandColor, totalScenes, sceneDuration }) => {
  const frame = useCurrentFrame();
  const totalDuration = totalScenes * sceneDuration;
  const progress = (frame / totalDuration) * 100;

  return (
    <div style={{
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      height: "8px",
      backgroundColor: "rgba(255,255,255,0.2)",
    }}>
      <div style={{
        height: "100%",
        width: `${progress}%`,
        backgroundColor: brandColor,
        transition: "width 0.1s linear"
      }} />
    </div>
  );
};
