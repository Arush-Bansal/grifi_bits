import { AbsoluteFill, OffthreadVideo, Sequence, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import React from "react";

interface Scene {
  image_url?: string | null;
  video_url?: string | null;
  speech?: string;
  id: number;
}

interface InfinityScrollProps {
  scenes?: Scene[];
  productName?: string;
  brandColor?: string;
}

export const InfinityScrollTemplate: React.FC<InfinityScrollProps> = ({
  scenes = [],
  productName = "Product Name",
  brandColor = "#f59e0b",
}) => {
  const { fps } = useVideoConfig();
  const sceneDuration = Math.round(3.5 * fps);

  return (
    <AbsoluteFill style={{ backgroundColor: "#fafafa", color: "#111", fontFamily: "Outfit, sans-serif" }}>
      {scenes.map((scene, index) => {
        const startFrame = index * sceneDuration;
        return (
          <Sequence key={scene.id} from={startFrame} durationInFrames={sceneDuration}>
            <ScrollScene 
              productName={productName} 
              brandColor={brandColor} 
              index={index}
              allScenes={scenes}
            />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

const ScrollScene: React.FC<{ productName: string; brandColor: string; index: number; allScenes: Scene[] }> = ({
  productName,
  brandColor,
  index,
  allScenes,
}) => {
  const frame = useCurrentFrame();
  const { height, fps } = useVideoConfig();
  const sceneDuration = Math.round(3.5 * fps);
  
  // Smooth Vertical Scroll
  const scrollOffset = interpolate(frame, [0, sceneDuration], [0, -height], {
      extrapolateRight: "clamp"
  });

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      {/* Background Scroll Grid */}
      <div style={{
          position: "absolute",
          top: scrollOffset,
          left: 0,
          right: 0,
          display: "flex",
          flexDirection: "column",
          gap: "20px",
          padding: "20px"
      }}>
          {[...allScenes, ...allScenes].map((s, i) => {
              const isCurrent = i === index;
              return (
                  <div key={`${s.id}-${i}`} style={{
                      width: "100%",
                      height: `${height - 60}px`,
                      borderRadius: "32px",
                      backgroundColor: isCurrent ? brandColor : "#eee",
                      overflow: "hidden",
                      position: "relative",
                      transition: "transform 0.5s",
                      transform: isCurrent ? "scale(1)" : "scale(0.95)",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center"
                  }}>
                      {s.video_url ? (
                          <OffthreadVideo src={s.video_url} muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : s.image_url ? (
                          <img src={s.image_url} alt="Gallery" style={{ width: "100%", height: "100%", objectFit: "cover" }} crossOrigin="anonymous" />
                      ) : (
                          <div style={{ fontSize: "100px", fontWeight: 900, opacity: 0.1 }}>{productName[0]}</div>
                      )}
                      
                      {/* Price/Tag Overlay */}
                      <div style={{
                          position: "absolute",
                          bottom: "40px",
                          right: "40px",
                          backgroundColor: "#fff",
                          padding: "16px 24px",
                          borderRadius: "20px",
                          boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
                          fontWeight: 800,
                          fontSize: "24px"
                      }}>
                          $199.00
                      </div>
                  </div>
              );
          })}
      </div>

      {/* Static Sidebar Label */}
      <div style={{
          position: "absolute",
          left: "60px",
          top: "50%",
          transform: "translateY(-50%) rotate(-90deg)",
          transformOrigin: "center",
          whiteSpace: "nowrap",
          zIndex: 10
      }}>
          <span style={{ fontSize: "14px", letterSpacing: "0.4em", opacity: 0.5 }}>COLLECTION_2026</span>
          <h2 style={{ fontSize: "64px", fontWeight: 900, margin: 0, marginTop: "10px" }}>{productName.toUpperCase()}</h2>
      </div>

      {/* Navigation Indicators */}
      <div style={{
          position: "absolute",
          right: "40px",
          top: "50%",
          transform: "translateY(-50%)",
          display: "flex",
          flexDirection: "column",
          gap: "12px"
      }}>
          {allScenes.map((s, i) => (
              <div key={s.id} style={{
                  width: "8px",
                  height: i === index ? "40px" : "8px",
                  borderRadius: "4px",
                  backgroundColor: i === index ? brandColor : "rgba(0,0,0,0.1)",
                  transition: "all 0.3s"
              }} />
          ))}
      </div>
    </AbsoluteFill>
  );
};
