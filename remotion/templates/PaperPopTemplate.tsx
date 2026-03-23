import { AbsoluteFill, OffthreadVideo, Sequence, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import React from "react";

interface Scene {
  image_url?: string | null;
  video_url?: string | null;
  speech?: string;
  id: number;
}

interface PaperPopProps {
  scenes?: Scene[];
  productName?: string;
  brandColor?: string;
}

export const PaperPopTemplate: React.FC<PaperPopProps> = ({
  scenes = [],
  productName = "Product Name",
  brandColor = "#10b981",
}) => {
  const { fps } = useVideoConfig();
  const sceneDuration = Math.round(3.5 * fps);

  return (
    <AbsoluteFill style={{ backgroundColor: "#f8fafc", color: "#1e293b", fontFamily: "Quicksand, sans-serif" }}>
      {scenes.map((scene, index) => {
        const startFrame = index * sceneDuration;
        return (
          <Sequence key={scene.id} from={startFrame} durationInFrames={sceneDuration}>
            <PaperScene 
              scene={scene} 
              productName={productName} 
              brandColor={brandColor} 
              isLast={index === scenes.length - 1}
            />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

const PaperScene: React.FC<{ scene: Scene; productName: string; brandColor: string; isLast: boolean }> = ({
  scene,
  productName,
  brandColor,
  isLast,
}) => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const sceneDuration = Math.round(3.5 * fps);
  
  const pop = spring({ frame, fps, config: { damping: 12, mass: 0.8 } });
  
  // Isometric transform
  const rotationX = 45;
  const rotationZ = -35;
  
  const translateY = interpolate(pop, [0, 1], [400, 0]);
  const scale = interpolate(pop, [0, 1], [0.5, 1]);
  const opacity = interpolate(frame, [0, 10, sceneDuration - 10, sceneDuration], [0, 1, 1, 0]);

  return (
    <AbsoluteFill style={{ opacity, display: "flex", justifyContent: "center", alignItems: "center", perspective: "1500px" }}>
      {/* Shadows */}
      <div style={{
          position: "absolute",
          width: width > height ? "500px" : "300px",
          height: width > height ? "600px" : "400px",
          backgroundColor: "rgba(0,0,0,0.1)",
          borderRadius: "20px",
          transform: `rotateX(${rotationX}deg) rotateZ(${rotationZ}deg) translateZ(-50px) scale(${scale})`,
          filter: "blur(40px)"
      }} />

      {/* Pop-up Paper Card */}
      <div style={{
          width: width > height ? "500px" : "300px",
          height: width > height ? "600px" : "400px",
          backgroundColor: "#fff",
          borderRadius: "12px",
          border: "1px solid rgba(0,0,0,0.05)",
          boxShadow: `0 20px 50px rgba(0,0,0,0.1)`,
          transform: `rotateX(${rotationX}deg) rotateZ(${rotationZ}deg) translateY(${translateY}px) scale(${scale})`,
          overflow: "hidden",
          position: "relative"
      }}>
          <AbsoluteFill>
              {scene.video_url ? (
                  <OffthreadVideo src={scene.video_url} muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : scene.image_url ? (
                  <img src={scene.image_url} alt="Pop-up" style={{ width: "100%", height: "100%", objectFit: "cover" }} crossOrigin="anonymous" />
              ) : (
                  <div style={{ width: "100%", height: "100%", background: `linear-gradient(45deg, ${brandColor}22, #fff)` }} />
              )}
          </AbsoluteFill>
          
          {/* Label on the card */}
          <div style={{
              position: "absolute",
              bottom: "20px",
              left: "20px",
              backgroundColor: brandColor,
              color: "#fff",
              padding: "8px 16px",
              borderRadius: "8px",
              fontWeight: 700,
              fontSize: "18px"
          }}>
              {productName}
          </div>
      </div>

      {/* Text Callouts floating next to the card */}
      <div style={{
          position: "absolute",
          top: "20%",
          left: width > height ? "65%" : "10%",
          opacity: interpolate(pop, [0.5, 1], [0, 1]),
          transform: `translateX(${interpolate(pop, [0.5, 1], [40, 0])}px)`
      }}>
          <h2 style={{ fontSize: "48px", fontWeight: 900, color: "#1e293b", margin: 0 }}>
              {isLast ? "Pop into action" : "Step Up."}
          </h2>
          <p style={{ fontSize: "24px", color: "#64748b", maxWidth: "400px", marginTop: "10px" }}>
              {scene.speech || "Lightweight design that pops in any environment."}
          </p>
          <div style={{ marginTop: "20px", width: "60px", height: "6px", backgroundColor: brandColor, borderRadius: "3px" }} />
      </div>
    </AbsoluteFill>
  );
};
