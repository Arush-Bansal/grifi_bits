import { AbsoluteFill, OffthreadVideo, Sequence, interpolate, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import React from "react";

interface Scene {
  image_url?: string | null;
  video_url?: string | null;
  speech?: string;
  id: number;
}

interface MaterialFocusProps {
  scenes?: Scene[];
  productName?: string;
  brandColor?: string;
}

export const MaterialFocusTemplate: React.FC<MaterialFocusProps> = ({
  scenes = [],
  productName = "Product Name",
  brandColor = "#78350f", // Rich Amber/Oak
}) => {
  const { fps } = useVideoConfig();
  const sceneDuration = Math.round(4.0 * fps);

  return (
    <AbsoluteFill style={{ backgroundColor: "#111", color: "#fff", fontFamily: "Playfair Display, serif" }}>
      {scenes.map((scene, index) => {
        const startFrame = index * sceneDuration;
        return (
          <Sequence key={scene.id} from={startFrame} durationInFrames={sceneDuration}>
            <MaterialScene 
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

const MaterialScene: React.FC<{ scene: Scene; productName: string; brandColor: string }> = ({
  scene,
  productName,
  brandColor,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig(); // width, height unused
  const sceneDuration = Math.round(4.0 * fps);
  
  // Deliberate Macro Pan
  const panX = interpolate(frame, [0, sceneDuration], [0, -100], {
      easing: Easing.bezier(0.12, 0, 0.39, 0)
  });
  
  const opacity = interpolate(frame, [0, 20, sceneDuration - 20, sceneDuration], [0, 1, 1, 0]);
  const scale = interpolate(frame, [0, sceneDuration], [1.3, 1.4]);

  return (
    <AbsoluteFill style={{ opacity }}>
      {/* Macro Media */}
      <AbsoluteFill style={{ transform: `scale(${scale}) translateX(${panX}px)`, filter: "contrast(1.1) brightness(0.9)" }}>
           {scene.video_url ? (
              <OffthreadVideo src={scene.video_url} muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : scene.image_url ? (
              <img src={scene.image_url} alt="Material" style={{ width: "100%", height: "100%", objectFit: "cover" }} crossOrigin="anonymous" />
          ) : (
              <div style={{ width: "100%", height: "100%", background: brandColor }} />
          )}
      </AbsoluteFill>

      {/* Crafted Vignette */}
      <div style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(to bottom, rgba(0,0,0,0.4), transparent 30%, transparent 70%, rgba(0,0,0,0.8) 100%)",
          pointerEvents: "none"
      }} />

      {/* Craftsmanship Overlay */}
      <div style={{
          position: "absolute",
          left: "80px",
          bottom: "120px",
          zIndex: 10
      }}>
          <div style={{ 
              backgroundColor: brandColor, 
              padding: "8px 16px", 
              borderRadius: "4px", 
              fontSize: "12px", 
              fontWeight: 700, 
              letterSpacing: "0.2em",
              display: "inline-block",
              marginBottom: "20px"
          }}>
              HAND_CRAFTED
          </div>
          <h2 style={{ fontSize: "64px", fontWeight: 200, margin: 0, fontStyle: "italic", textShadow: "0 10px 30px rgba(0,0,0,0.5)" }}>{productName}</h2>
          <div style={{ 
              marginTop: "20px", 
              paddingLeft: "10px", 
              borderLeft: `4px solid ${brandColor}`,
              maxWidth: "400px"
          }}>
              <p style={{ fontSize: "20px", margin: 0, opacity: 0.8, fontWeight: 300, lineHeight: 1.5 }}>
                 {scene.speech || "Every fiber tells a story of quality, durability, and absolute precision."}
              </p>
          </div>
      </div>

      {/* Floating Specs */}
      <div style={{
          position: "absolute",
          top: "80px",
          right: "80px",
          fontSize: "14px",
          textAlign: "right",
          opacity: 0.4,
          letterSpacing: "0.4em"
      }}>
          CRAFTSMANSHIP_V24
      </div>
    </AbsoluteFill>
  );
};
