import { AbsoluteFill, OffthreadVideo, Sequence, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import React from "react";

interface Scene {
  image_url?: string | null;
  video_url?: string | null;
  speech?: string;
  id: number;
}

interface GlassmorphismProps {
  scenes?: Scene[];
  productName?: string;
  brandColor?: string;
}

export const GlassmorphismTemplate: React.FC<GlassmorphismProps> = ({
  scenes = [],
  productName = "Product Name",
  brandColor = "#3b82f6",
}) => {
  const { fps } = useVideoConfig();
  const sceneDuration = Math.round(4.0 * fps);

  return (
    <AbsoluteFill style={{ backgroundColor: "#f8fafc", color: "#1e293b", fontFamily: "Inter, sans-serif" }}>
      {/* Background Gradient */}
      <AbsoluteFill style={{
          background: `radial-gradient(circle at 20% 30%, ${brandColor}33 0%, transparent 50%), radial-gradient(circle at 80% 70%, ${brandColor}44 0%, transparent 50%)`,
          filter: "blur(60px)"
      }} />

      {scenes.map((scene, index) => {
        const startFrame = index * sceneDuration;
        return (
          <Sequence key={scene.id} from={startFrame} durationInFrames={sceneDuration}>
            <GlassScene 
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

const GlassScene: React.FC<{ scene: Scene; productName: string; brandColor: string }> = ({
  scene,
  productName,
  brandColor,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig(); // width, height unused
  const sceneDuration = Math.round(4.0 * fps);
  
  const opacity = interpolate(frame, [0, 15, sceneDuration - 15, sceneDuration], [0, 1, 1, 0]);
  const scale = interpolate(frame, [0, sceneDuration], [0.95, 1.05]);

  return (
    <AbsoluteFill style={{ opacity, display: "flex", justifyContent: "center", alignItems: "center" }}>
      {/* Glass Container */}
      <div style={{
          width: "90%",
          height: "80%",
          backgroundColor: "rgba(255, 255, 255, 0.4)",
          backdropFilter: "blur(20px) saturate(180%)",
          borderRadius: "48px",
          border: "1px solid rgba(255, 255, 255, 0.5)",
          display: "flex",
          boxShadow: "0 20px 50px rgba(0,0,0,0.1)",
          overflow: "hidden",
          transform: `scale(${scale})`
      }}>
          {/* Left: Product Image */}
          <div style={{ width: "60%", position: "relative", overflow: "hidden" }}>
              {scene.video_url ? (
                  <OffthreadVideo src={scene.video_url} muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : scene.image_url ? (
                  <img src={scene.image_url} alt="Glass" style={{ width: "100%", height: "100%", objectFit: "cover" }} crossOrigin="anonymous" />
              ) : (
                  <div style={{ width: "100%", height: "100%", background: brandColor }} />
              )}
          </div>

          {/* Right: Content Section */}
          <div style={{ width: "40%", padding: "60px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                  <div style={{ 
                      backgroundColor: brandColor, 
                      width: "60px", 
                      height: "8px", 
                      borderRadius: "10px", 
                      marginBottom: "40px",
                      opacity: interpolate(frame, [10, 20], [0, 1])
                  }} />
                  <h2 style={{ fontSize: "56px", fontWeight: 800, margin: 0, letterSpacing: "-0.03em" }}>{productName}</h2>
                  <p style={{ 
                      fontSize: "24px", 
                      marginTop: "30px", 
                      lineHeight: 1.5, 
                      opacity: 0.7, 
                      fontWeight: 400 
                  }}>
                      {scene.speech || "Experience clarity in every interaction. Designed for the modern era."}
                  </p>
              </div>

              {/* Glass Badge */}
              <div style={{
                  backgroundColor: "rgba(255,255,255,0.6)",
                  padding: "20px",
                  borderRadius: "24px",
                  border: "1px solid rgba(255,255,255,0.8)",
                  display: "flex",
                  alignItems: "center",
                  gap: "15px",
                  opacity: interpolate(frame, [30, 45], [0, 1])
              }}>
                  <div style={{ width: "40px", height: "40px", borderRadius: "50%", backgroundColor: brandColor }} />
                  <div>
                      <div style={{ fontSize: "14px", fontWeight: 700, opacity: 0.5 }}>FEATURE_EXCLUSIVE</div>
                      <div style={{ fontSize: "18px", fontWeight: 800 }}>Next-Gen Architecture</div>
                  </div>
              </div>
          </div>
      </div>
    </AbsoluteFill>
  );
};
