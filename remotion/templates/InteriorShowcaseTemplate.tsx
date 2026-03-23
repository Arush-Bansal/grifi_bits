import { AbsoluteFill, OffthreadVideo, Sequence, interpolate, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import React from "react";

interface Scene {
  image_url?: string | null;
  video_url?: string | null;
  speech?: string;
  id: number;
}

interface InteriorShowcaseProps {
  scenes?: Scene[];
  productName?: string;
  brandColor?: string;
}

export const InteriorShowcaseTemplate: React.FC<InteriorShowcaseProps> = ({
  scenes = [],
  productName = "Product Name",
  brandColor = "#44403c", // Warm Stone
}) => {
  const { fps } = useVideoConfig();
  const sceneDuration = Math.round(4.5 * fps);

  return (
    <AbsoluteFill style={{ backgroundColor: "#fafaf9", color: "#1c1917", fontFamily: "Outfit, sans-serif" }}>
      {scenes.map((scene, index) => {
        const startFrame = index * sceneDuration;
        return (
          <Sequence key={scene.id} from={startFrame} durationInFrames={sceneDuration}>
            <InteriorScene 
              scene={scene} 
              productName={productName} 
              brandColor={brandColor} 
            />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

const InteriorScene: React.FC<{ scene: Scene; productName: string; brandColor: string }> = ({
  scene,
  productName,
  brandColor,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig(); // width, height unused
  const sceneDuration = Math.round(4.5 * fps);
  
  // Elegant Panning
  const panX = interpolate(frame, [0, sceneDuration], [-50, 50], {
      easing: Easing.bezier(0.25, 0.1, 0.25, 1)
  });
  
  const opacity = interpolate(frame, [0, 20, sceneDuration - 20, sceneDuration], [0, 1, 1, 0]);
  const scale = interpolate(frame, [0, sceneDuration], [1, 1.1]);

  return (
    <AbsoluteFill style={{ opacity }}>
      {/* Lifestyle Media */}
      <AbsoluteFill style={{ 
          transform: `scale(${scale}) translateX(${panX}px)`,
          width: "90%",
          height: "80%",
          left: "5%",
          top: "10%",
          borderRadius: "40px",
          overflow: "hidden",
          boxShadow: "0 40px 100px rgba(0,0,0,0.1)",
          border: `20px solid #fff`
      }}>
           {scene.video_url ? (
              <OffthreadVideo src={scene.video_url} muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : scene.image_url ? (
              <img src={scene.image_url} alt="Interior" style={{ width: "100%", height: "100%", objectFit: "cover" }} crossOrigin="anonymous" />
          ) : (
              <div style={{ width: "100%", height: "100%", background: brandColor }} />
          )}
      </AbsoluteFill>

      {/* Elegant HUD Overlay */}
      <div style={{
          position: "absolute",
          top: "140px",
          left: "140px",
          zIndex: 10
      }}>
          <div style={{ 
              backgroundColor: brandColor, 
              width: "60px", 
              height: "4px", 
              marginBottom: "40px",
              transform: `scaleX(${interpolate(frame, [20, 40], [0, 1], { extrapolateRight: "clamp" })})`,
              transformOrigin: "left"
          }} />
          <h2 style={{ 
              fontSize: "72px", 
              fontWeight: 200, 
              margin: 0, 
              letterSpacing: "-0.04em",
              color: brandColor
          }}>
              {productName}
          </h2>
      </div>

      {/* Product Spec Detail */}
      <div style={{
          position: "absolute",
          bottom: "160px",
          right: "140px",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          zIndex: 10,
          textAlign: "right"
      }}>
          <div style={{ fontSize: "12px", letterSpacing: "0.5em", opacity: 0.4 }}>MATERIAL_FINISH</div>
          <div style={{ fontSize: "28px", fontWeight: 700 }}>{scene.speech || "Handcrafted Elegance."}</div>
      </div>

      {/* Aesthetic Border Accent */}
      <div style={{
          position: "absolute",
          inset: "80px",
          border: "1px solid rgba(0,0,0,0.05)",
          pointerEvents: "none"
      }} />
    </AbsoluteFill>
  );
};
