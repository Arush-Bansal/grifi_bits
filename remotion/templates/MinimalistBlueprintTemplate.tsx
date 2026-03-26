import { AbsoluteFill, OffthreadVideo, Sequence, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import React from "react";

interface Scene {
  image_url?: string | null;
  video_url?: string | null;
  speech?: string;
  id: number;
}

interface MinimalistBlueprintProps {
  scenes?: Scene[];
  productName?: string;
  brandColor?: string;
}

export const MinimalistBlueprintTemplate: React.FC<MinimalistBlueprintProps> = ({
  scenes = [],
  productName = "Product Name",
  brandColor = "#334155",
}) => {
  const { fps } = useVideoConfig();
  const sceneDuration = Math.round(4.0 * fps);

  return (
    <AbsoluteFill style={{ backgroundColor: "#f8fafc", color: "#334155", fontFamily: "Space Mono, monospace" }}>
      {scenes.map((scene, index) => {
        const startFrame = index * sceneDuration;
        return (
          <Sequence key={scene.id} from={startFrame} durationInFrames={sceneDuration}>
            <BlueprintScene 
              scene={scene} 
              productName={productName} 
              brandColor={brandColor} 
              index={index}
            />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

const BlueprintScene: React.FC<{ scene: Scene; productName: string; brandColor: string; index: number }> = ({
  scene,
  productName,
  brandColor,
  index,
}) => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  
  const drawProgress = spring({ frame, fps, config: { damping: 15 } });
  
  // Blueprint Grid
  const gridOpacity = interpolate(drawProgress, [0, 1], [0, 0.1]);

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      {/* Blueprint Grid */}
      <div style={{
          position: "absolute",
          inset: 0,
          backgroundImage: "linear-gradient(#64748b 1px, transparent 1px), linear-gradient(90deg, #64748b 1px, transparent 1px)",
          backgroundSize: "40px 40px",
          opacity: gridOpacity
      }} />

      {/* Main Schematic Frame */}
      <div style={{
          position: "absolute",
          inset: "60px",
          border: "1px solid rgba(51, 65, 85, 0.2)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center"
      }}>
          <div style={{
              width: width > height ? "60%" : "80%",
              aspectRatio: "1/1",
              position: "relative",
              transform: `scale(${interpolate(drawProgress, [0, 1], [0.8, 1])})`,
              opacity: drawProgress
          }}>
              {/* Corner Accents */}
              <div style={{ position: "absolute", top: -20, left: -20, borderTop: "2px solid #334155", borderLeft: "2px solid #334155", width: 40, height: 40 }} />
              <div style={{ position: "absolute", bottom: -20, right: -20, borderBottom: "2px solid #334155", borderRight: "2px solid #334155", width: 40, height: 40 }} />
              
              {/* Product Visual */}
              <div style={{
                  width: "100%",
                  height: "100%",
                  backgroundColor: "rgba(255,255,255,0.5)",
                  backdropFilter: "contrast(1.2) grayscale(100%)",
                  overflow: "hidden",
                  border: "1px solid rgba(51, 65, 85, 0.1)"
              }}>
                   {scene.video_url ? (
                      <OffthreadVideo src={scene.video_url} muted style={{ width: "100%", height: "100%", objectFit: "cover", mixBlendMode: "multiply" }} />
                  ) : scene.image_url ? (
                      <img src={scene.image_url} alt="Schematic" style={{ width: "100%", height: "100%", objectFit: "cover", mixBlendMode: "multiply" }} crossOrigin="anonymous" />
                  ) : (
                      <div style={{ width: "100%", height: "100%", background: "#fff" }} />
                  )}
              </div>

              {/* Technical Callouts */}
              <div style={{
                  position: "absolute",
                  top: "20%",
                  right: "-200px",
                  display: "flex",
                  alignItems: "center",
                  gap: "20px"
              }}>
                  <div style={{ width: "150px", height: "1px", backgroundColor: "#334155", transform: `scaleX(${interpolate(drawProgress, [0.4, 0.8], [0, 1])})`, transformOrigin: "left" }} />
                  <div style={{ opacity: interpolate(drawProgress, [0.7, 1], [0, 1]) }}>
                      <div style={{ fontSize: "12px", fontWeight: 700 }}>MATERIAL_V01</div>
                      <div style={{ fontSize: "16px", marginTop: "4px" }}>REINFORCED_POLY</div>
                  </div>
              </div>

              <div style={{
                  position: "absolute",
                  bottom: "20%",
                  left: "-200px",
                  display: "flex",
                  alignItems: "center",
                  gap: "20px",
                  flexDirection: "row-reverse"
              }}>
                  <div style={{ width: "150px", height: "1px", backgroundColor: "#334155", transform: `scaleX(${interpolate(drawProgress, [0.4, 0.8], [0, 1])})`, transformOrigin: "right" }} />
                  <div style={{ opacity: interpolate(drawProgress, [0.7, 1], [0, 1]), textAlign: "right" }}>
                      <div style={{ fontSize: "12px", fontWeight: 700 }}>PRECISION_GEOMETRY</div>
                      <div style={{ fontSize: "16px", marginTop: "4px" }}>+/- 0.002mm</div>
                  </div>
              </div>
          </div>
      </div>

      {/* Info Panel (Bottom Right) */}
      <div style={{
          position: "absolute",
          bottom: "100px",
          right: "100px",
          textAlign: "right",
          transform: `translateY(${interpolate(drawProgress, [0, 1], [50, 0])}px)`,
          opacity: drawProgress
      }}>
          <div style={{ fontSize: "64px", fontWeight: 900, lineHeight: 1, letterSpacing: "-0.05em" }}>{productName.toUpperCase()}</div>
          <div style={{ fontSize: "20px", marginTop: "10px", color: brandColor }}>SERIES_REF: {index + 1}/3</div>
          <p style={{ maxWidth: "300px", fontSize: "14px", marginTop: "20px", lineHeight: 1.6, opacity: 0.8 }}>
              {scene.speech || "Designed for maximum durability and minimalist aesthetic."}
          </p>
      </div>
    </AbsoluteFill>
  );
};
