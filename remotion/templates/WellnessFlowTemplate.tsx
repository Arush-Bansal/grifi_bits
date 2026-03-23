import { AbsoluteFill, OffthreadVideo, Sequence, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import React from "react";

interface Scene {
  image_url?: string | null;
  video_url?: string | null;
  speech?: string;
  id: number;
}

interface WellnessFlowProps {
  scenes?: Scene[];
  productName?: string;
  brandColor?: string;
}

export const WellnessFlowTemplate: React.FC<WellnessFlowProps> = ({
  scenes = [],
  productName = "Product Name",
  brandColor = "#fdf2f8", // Soft Rose
}) => {
  const { fps } = useVideoConfig();
  const sceneDuration = Math.round(4.0 * fps);

  return (
    <AbsoluteFill style={{ backgroundColor: "#fff", color: "#334155", fontFamily: "Outfit, sans-serif" }}>
      {/* Background Glow */}
      <AbsoluteFill style={{
          background: `radial-gradient(circle at 50% 50%, ${brandColor}66 0%, transparent 70%)`,
          filter: "blur(40px)"
      }} />

      {scenes.map((scene, index) => {
        const startFrame = index * sceneDuration;
        return (
          <Sequence key={scene.id} from={startFrame} durationInFrames={sceneDuration}>
            <WellnessScene 
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

const WellnessScene: React.FC<{ scene: Scene; productName: string; brandColor: string }> = ({
  scene,
  productName,
  brandColor,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sceneDuration = Math.round(4.0 * fps);
  
  const opacity = interpolate(frame, [0, 20, sceneDuration - 20, sceneDuration], [0, 1, 1, 0]);
  const scale = interpolate(frame, [0, sceneDuration], [1, 1.05]);

  return (
    <AbsoluteFill style={{ opacity, display: "flex", justifyContent: "center", alignItems: "center" }}>
      {/* Centered Media Frame */}
      <div style={{
          width: "80%",
          height: "70%",
          backgroundColor: "#fff",
          borderRadius: "100px 100px 100px 100px",
          overflow: "hidden",
          boxShadow: "0 30px 60px rgba(0,0,0,0.05)",
          border: `2px solid ${brandColor}`,
          transform: `scale(${scale})`
      }}>
          {scene.video_url ? (
              <OffthreadVideo src={scene.video_url} muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : scene.image_url ? (
              <img src={scene.image_url} alt="Wellness" style={{ width: "100%", height: "100%", objectFit: "cover" }} crossOrigin="anonymous" />
          ) : (
              <div style={{ width: "100%", height: "100%", background: brandColor }} />
          )}
      </div>

      {/* Elegant Floaters */}
      <div style={{
          position: "absolute",
          top: "100px",
          width: "100%",
          textAlign: "center",
          zIndex: 10
      }}>
          <h2 style={{ fontSize: "64px", fontWeight: 200, margin: 0, letterSpacing: "0.2em", opacity: 0.8 }}>{productName.toUpperCase()}</h2>
      </div>

      <div style={{
          position: "absolute",
          bottom: "120px",
          left: "50%",
          transform: "translateX(-50%)",
          maxWidth: "450px",
          textAlign: "center",
          zIndex: 10
      }}>
          <p style={{ fontSize: "22px", lineHeight: 1.6, fontWeight: 300, fontStyle: "italic" }}>
             &quot;{scene.speech || "Find your center. Natural ingredients meet modern science for a more radiant you."}&quot;
          </p>
      </div>

      {/* Floating Sparkles (Simulated) */}
      {[1, 2, 3].map(i => (
          <div key={i} style={{
              position: "absolute",
              width: "10px",
              height: "10px",
              backgroundColor: brandColor,
              borderRadius: "50%",
              boxShadow: `0 0 10px ${brandColor}`,
              left: `${20 * i}%`,
              top: `${Math.sin(frame / 20 + i) * 100 + 400}px`,
              opacity: 0.4
          }} />
      ))}
    </AbsoluteFill>
  );
};
