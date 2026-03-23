import { AbsoluteFill, OffthreadVideo, Sequence, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import React from "react";

interface Scene {
  image_url?: string | null;
  video_url?: string | null;
  speech?: string;
  id: number;
}

interface BentoGridProps {
  scenes?: Scene[];
  productName?: string;
  brandColor?: string;
}

export const BentoGridTemplate: React.FC<BentoGridProps> = ({
  scenes = [],
  productName = "Product Name",
  brandColor = "#10b981",
}) => {
  const { fps } = useVideoConfig();
  const sceneDuration = Math.round(4.0 * fps);

  return (
    <AbsoluteFill style={{ backgroundColor: "#000000", color: "white", fontFamily: "Outfit, sans-serif" }}>
      {scenes.map((scene, index) => {
        const startFrame = index * sceneDuration;
        return (
          <Sequence key={scene.id} from={startFrame} durationInFrames={sceneDuration}>
            <BentoScene 
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

const BentoScene: React.FC<{ scene: Scene; productName: string; brandColor: string; isLast: boolean }> = ({
  scene,
  productName,
  brandColor,
  isLast,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sceneDuration = Math.round(4.0 * fps);
  
  const entrance = spring({ frame, fps, config: { damping: 14 } });
  const opacity = interpolate(frame, [0, 10, sceneDuration - 10, sceneDuration], [0, 1, 1, 0]);

  return (
    <AbsoluteFill style={{ opacity, padding: "3%" }}>
      <div style={{
        display: "grid",
        gridTemplateColumns: "1.2fr 1fr",
        gridTemplateRows: "1fr 1.2fr",
        gap: "1.5%",
        width: "100%",
        height: "100%"
      }}>
        {/* Main Feature Block */}
        <div style={{
          gridRow: "1 / 3",
          backgroundColor: "#111",
          borderRadius: "32px",
          overflow: "hidden",
          border: "1px solid rgba(255,255,255,0.1)",
          position: "relative",
          transform: `scale(${interpolate(entrance, [0, 1], [0.95, 1])})`
        }}>
           {scene.video_url ? (
            <OffthreadVideo
              src={scene.video_url}
              muted
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : scene.image_url ? (
            <img
              src={scene.image_url}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
              alt="Feature"
              crossOrigin="anonymous"
            />
          ) : (
            <AbsoluteFill style={{ background: `linear-gradient(45deg, ${brandColor}44, #111)` }} />
          )}
          
          <div style={{
            position: "absolute",
            bottom: "30px",
            left: "30px",
            backgroundColor: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(10px)",
            padding: "16px 24px",
            borderRadius: "20px",
            border: "1px solid rgba(255,255,255,0.1)"
          }}>
            <h3 style={{ margin: 0, fontSize: "28px", fontWeight: 700 }}>{productName}</h3>
            <p style={{ margin: "4px 0 0", color: "#888", fontSize: "18px" }}>Primary Feature</p>
          </div>
        </div>

        {/* Info Block 1 */}
        <div style={{
          backgroundColor: brandColor,
          borderRadius: "32px",
          padding: "40px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          transform: `translateX(${interpolate(entrance, [0, 1], [100, 0])}px)`
        }}>
          <h2 style={{ 
            fontSize: "42px", 
            fontWeight: 800, 
            lineHeight: 1, 
            margin: 0,
            color: "#000"
          }}>
            {isLast ? "Ready?" : "Key Benefit"}
          </h2>
          <p style={{ 
            fontSize: "20px", 
            marginTop: "15px", 
            color: "rgba(0,0,0,0.7)",
            fontWeight: 500
          }}>
            {scene.speech || "Engineered for excellence in every detail."}
          </p>
        </div>

        {/* Stat/Secondary Block */}
        <div style={{
          backgroundColor: "#1a1a1a",
          borderRadius: "32px",
          padding: "40px",
          display: "flex",
          alignItems: "center",
          gap: "20px",
          border: "1px solid rgba(255,255,255,0.05)",
          transform: `translateY(${interpolate(entrance, [0, 1], [50, 0])}px)`
        }}>
          <div style={{
            width: "80px",
            height: "80px",
            borderRadius: "50%",
            backgroundColor: `${brandColor}22`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "40px"
          }}>
            ✨
          </div>
          <div>
            <div style={{ fontSize: "36px", fontWeight: 900 }}>99.9%</div>
            <div style={{ color: "#666", fontSize: "16px", textTransform: "uppercase", letterSpacing: "0.1em" }}>Reliability</div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
