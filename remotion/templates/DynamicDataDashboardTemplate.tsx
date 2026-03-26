import { AbsoluteFill, OffthreadVideo, Sequence, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import React from "react";

interface Scene {
  image_url?: string | null;
  video_url?: string | null;
  speech?: string;
  id: number;
}

interface DynamicDataDashboardProps {
  scenes?: Scene[];
  productName?: string;
  brandColor?: string;
}

export const DynamicDataDashboardTemplate: React.FC<DynamicDataDashboardProps> = ({
  scenes = [],
  productName = "Product Name",
  brandColor = "#8b5cf6",
}) => {
  const { fps } = useVideoConfig();
  const sceneDuration = Math.round(4.0 * fps);

  return (
    <AbsoluteFill style={{ backgroundColor: "#020617", color: "white", fontFamily: "IBM Plex Mono, monospace" }}>
      {scenes.map((scene, index) => {
        const startFrame = index * sceneDuration;
        return (
          <Sequence key={scene.id} from={startFrame} durationInFrames={sceneDuration}>
            <DashboardScene 
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

const DashboardScene: React.FC<{ scene: Scene; productName: string; brandColor: string }> = ({
  scene,
  productName,
  brandColor,
}) => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  
  // Data growth animation
  const chartProgress = spring({ frame: frame - 10, fps, config: { damping: 12 } });
  
  // Mock data points
  const points = [40, 70, 55, 90, 85, 100];
  const currentStat = Math.floor(interpolate(chartProgress, [0, 1], [0, 99]));

  return (
    <AbsoluteFill style={{ padding: "60px" }}>
      {/* Grid Pattern Background */}
      <div style={{
          position: "absolute",
          inset: 0,
          backgroundImage: "radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
          opacity: 0.5
      }} />

      {/* Header Stat */}
      <div style={{ position: "relative", zIndex: 10 }}>
          <div style={{ fontSize: "14px", color: brandColor, letterSpacing: "0.2em", fontWeight: 700 }}>PERFORMANCE_METRICS</div>
          <div style={{ display: "flex", alignItems: "baseline", gap: "20px", marginTop: "10px" }}>
              <h1 style={{ fontSize: "120px", fontWeight: 900, margin: 0, letterSpacing: "-0.05em" }}>
                  {currentStat}%
              </h1>
              <div style={{ fontSize: "24px", color: "#4ade80", fontWeight: 700 }}>+24.8% YoY</div>
          </div>
      </div>

      {/* Main Grid Layout */}
      <div style={{ 
          marginTop: "40px", 
          display: "grid", 
          gridTemplateColumns: width > height ? "1.5fr 1fr" : "1fr",
          gap: "40px", 
          flex: 1,
          position: "relative",
          zIndex: 10
      }}>
          {/* Main Visualized Media */}
          <div style={{ 
              borderRadius: "24px", 
              overflow: "hidden", 
              border: "1px solid rgba(255,255,255,0.1)",
              backgroundColor: "rgba(255,255,255,0.02)",
              backdropFilter: "blur(20px)",
              position: "relative"
          }}>
              {scene.video_url ? (
                  <OffthreadVideo src={scene.video_url} muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : scene.image_url ? (
                  <img src={scene.image_url} alt="Data visualization" style={{ width: "100%", height: "100%", objectFit: "cover" }} crossOrigin="anonymous" />
              ) : (
                  <div style={{ width: "100%", height: "100%", background: `linear-gradient(225deg, ${brandColor}33, transparent)` }} />
              )}
              
              {/* Dynamic Overlays on Media */}
              <div style={{ position: "absolute", top: "20px", right: "20px", display: "flex", gap: "10px" }}>
                  <div style={{ backgroundColor: "#000", padding: "8px 12px", borderRadius: "8px", border: "1px solid rgba(46, 204, 113, 0.4)", color: "#2ecc71", fontSize: "12px" }}>
                      LIVE_FEED
                  </div>
              </div>
          </div>

          {/* Sidebar Charts */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {/* Bar Chart */}
              <div style={{ 
                  backgroundColor: "rgba(255,255,255,0.03)", 
                  padding: "30px", 
                  borderRadius: "24px", 
                  border: "1px solid rgba(255,255,255,0.06)",
                  flex: 1
              }}>
                  <div style={{ fontSize: "14px", opacity: 0.5, marginBottom: "24px" }}>EFFICIENCY_DISTRIBUTION</div>
                  <div style={{ display: "flex", alignItems: "flex-end", gap: "12px", height: "160px" }}>
                      {points.map((p, i) => {
                          const barHeight = interpolate(chartProgress, [i * 0.1, i * 0.1 + 0.3], [0, p], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
                          return (
                              <div key={i} style={{ 
                                  flex: 1, 
                                  backgroundColor: i === points.length - 1 ? brandColor : "rgba(255,255,255,0.1)", 
                                  height: `${barHeight}%`,
                                  borderRadius: "4px 4px 0 0" 
                              }} />
                          );
                      })}
                  </div>
              </div>
              
              {/* Feature Box */}
              <div style={{ 
                  backgroundColor: brandColor, 
                  padding: "30px", 
                  borderRadius: "24px", 
                  color: "white"
              }}>
                  <div style={{ fontWeight: 800, fontSize: "24px" }}>{productName}</div>
                  <div style={{ marginTop: "10px", fontSize: "16px", opacity: 0.9 }}>{scene.speech || "Optimized for maximum throughput."}</div>
              </div>
          </div>
      </div>
    </AbsoluteFill>
  );
};
