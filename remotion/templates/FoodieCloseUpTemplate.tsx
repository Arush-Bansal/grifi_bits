import { AbsoluteFill, OffthreadVideo, Sequence, interpolate, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import React from "react";

interface Scene {
  image_url?: string | null;
  video_url?: string | null;
  speech?: string;
  id: number;
}

interface FoodieCloseUpProps {
  scenes?: Scene[];
  productName?: string;
  brandColor?: string;
}

export const FoodieCloseUpTemplate: React.FC<FoodieCloseUpProps> = ({
  scenes = [],
  productName = "Product Name",
  brandColor = "#ea580c", // Savory Orange
}) => {
  const { fps } = useVideoConfig();
  const sceneDuration = Math.round(3.5 * fps);

  return (
    <AbsoluteFill style={{ backgroundColor: "#000", color: "#fff", fontFamily: "Playfair Display, serif" }}>
      {scenes.map((scene, index) => {
        const startFrame = index * sceneDuration;
        return (
          <Sequence key={scene.id} from={startFrame} durationInFrames={sceneDuration}>
            <FoodScene 
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

const FoodScene: React.FC<{ scene: Scene; productName: string; brandColor: string }> = ({
  scene,
  productName,
  brandColor,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sceneDuration = Math.round(3.5 * fps);
  
  // Savory Zoom & Panning
  const scale = interpolate(frame, [0, sceneDuration], [1.2, 1.4], {
      easing: Easing.bezier(0.33, 1, 0.68, 1)
  });
  
  const opacity = interpolate(frame, [0, 10, sceneDuration - 10, sceneDuration], [0, 1, 1, 0]);

  return (
    <AbsoluteFill style={{ opacity }}>
      {/* Intense Macro Media */}
      <AbsoluteFill style={{ transform: `scale(${scale})` }}>
           {scene.video_url ? (
              <OffthreadVideo src={scene.video_url} muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : scene.image_url ? (
              <img src={scene.image_url} alt="Food Close-up" style={{ width: "100%", height: "100%", objectFit: "cover" }} crossOrigin="anonymous" />
          ) : (
              <div style={{ width: "100%", height: "100%", background: brandColor }} />
          )}
      </AbsoluteFill>

      {/* Savory Vignette */}
      <div style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(circle, transparent 40%, rgba(0,0,0,0.8) 100%)",
          pointerEvents: "none"
      }} />

      {/* Recipe/Detail Overlay */}
      <div style={{
          position: "absolute",
          top: "80px",
          left: "80px",
          zIndex: 10
      }}>
          <div style={{ 
              fontSize: "14px", 
              letterSpacing: "0.4em", 
              color: brandColor, 
              fontWeight: 700,
              textTransform: "uppercase",
              opacity: interpolate(frame, [10, 20], [0, 1])
          }}>
              Premium_Quality
          </div>
          <h2 style={{ 
              fontSize: "90px", 
              fontWeight: 200, 
              margin: 0, 
              marginTop: "20px",
              fontStyle: "italic",
              textShadow: "0 10px 30px rgba(0,0,0,0.5)"
          }}>
              {productName}
          </h2>
      </div>

      {/* Bottom Savory Label */}
      <div style={{
          position: "absolute",
          bottom: "100px",
          right: "80px",
          textAlign: "right",
          maxWidth: "400px",
          zIndex: 10
      }}>
          <p style={{ 
              fontSize: "24px", 
              lineHeight: 1.4, 
              fontWeight: 300, 
              opacity: interpolate(frame, [20, 40], [0, 0.9])
          }}>
             &quot;{scene.speech || "Crafted with passion. Every ingredient matters. A symphony of flavors in every bite."}&quot;
          </p>
      </div>

      {/* Subtle Heat/Steam Overlay (Simulated) */}
      <div style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(to top, rgba(255,255,255,0.05), transparent)",
          opacity: Math.sin(frame / 10) * 0.5 + 0.5,
          pointerEvents: "none"
      }} />
    </AbsoluteFill>
  );
};
