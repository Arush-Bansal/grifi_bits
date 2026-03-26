import { AbsoluteFill, OffthreadVideo, Sequence, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import React from "react";

interface Scene {
  image_url?: string | null;
  video_url?: string | null;
  speech?: string;
  id: number;
}

interface HolographicHUDProps {
  scenes?: Scene[];
  productName?: string;
  brandColor?: string;
}

export const HolographicHUDTemplate: React.FC<HolographicHUDProps> = ({
  scenes = [],
  productName = "Product Name",
  brandColor = "#0ea5e9",
}) => {
  const { fps } = useVideoConfig();
  const sceneDuration = Math.round(4.0 * fps);

  return (
    <AbsoluteFill style={{ backgroundColor: "#020617", color: "white", fontFamily: "Orbitron, sans-serif" }}>
      {scenes.map((scene, index) => {
        const startFrame = index * sceneDuration;
        return (
          <Sequence key={scene.id} from={startFrame} durationInFrames={sceneDuration}>
            <HUDScene 
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

const HUDScene: React.FC<{ scene : Scene; productName: string; brandColor: string }> = ({
  scene,
  productName,
  brandColor,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sceneDuration = Math.round(4.0 * fps);
  
  const scanProgress = interpolate(frame, [0, sceneDuration], [0, 1]);

  return (
    <AbsoluteFill style={{ opacity: interpolate(frame, [0, 10, sceneDuration - 10, sceneDuration], [0, 1, 1, 0]) }}>
      {/* Background Content */}
      <div style={{
          position: "absolute",
          inset: 0,
          opacity: 0.6,
          filter: "brightness(0.5) contrast(1.2) blue-ish"
      }}>
           {scene.video_url ? (
              <OffthreadVideo src={scene.video_url} muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : scene.image_url ? (
              <img src={scene.image_url} alt="HUD background" style={{ width: "100%", height: "100%", objectFit: "cover" }} crossOrigin="anonymous" />
          ) : (
              <div style={{ width: "100%", height: "100%", background: "#000" }} />
          )}
      </div>

      {/* Crosshair / Targeting */}
      <div style={{
          position: "absolute",
          inset: "10%",
          border: `1px solid ${brandColor}44`,
          display: "flex",
          justifyContent: "center",
          alignItems: "center"
      }}>
          <div style={{ width: "2px", height: "40px", backgroundColor: brandColor, position: "absolute", top: 0 }} />
          <div style={{ width: "2px", height: "40px", backgroundColor: brandColor, position: "absolute", bottom: 0 }} />
          <div style={{ height: "2px", width: "40px", backgroundColor: brandColor, position: "absolute", left: 0 }} />
          <div style={{ height: "2px", width: "40px", backgroundColor: brandColor, position: "absolute", right: 0 }} />
      </div>

      {/* Scanning Line */}
      <div style={{
          position: "absolute",
          top: `${scanProgress * 100}%`,
          left: 0,
          right: 0,
          height: "2px",
          backgroundColor: brandColor,
          boxShadow: `0 0 20px ${brandColor}`,
          zIndex: 20
      }} />

      {/* Floating HUD Gauges */}
      <div style={{ position: "absolute", left: "60px", top: "60px", opacity: 0.8 }}>
          <div style={{ fontSize: "14px", color: brandColor, marginBottom: "10px" }}>_TARGET_ID: {productName.toUpperCase()}</div>
          <div style={{ display: "flex", gap: "20px" }}>
              {[1, 2, 3].map(i => (
                  <div key={i} style={{ width: "6px", height: "40px", backgroundColor: frame % (i * 10) > 5 ? brandColor : "rgba(255,255,255,0.1)" }} />
              ))}
          </div>
      </div>

      <div style={{ position: "absolute", right: "60px", bottom: "60px", textAlign: "right", opacity: 0.8 }}>
          <div style={{ fontSize: "12px", color: brandColor, marginBottom: "8px" }}>SCAN_COORD: {Math.floor(scanProgress * 1000)}, 485</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <div style={{ fontSize: "24px", fontWeight: 700 }}>{scene.speech || "ANALYZING_CORE_DATA"}</div>
              <div style={{ width: "100%", height: "4px", backgroundColor: "rgba(255,255,255,0.1)", position: "relative" }}>
                  <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${interpolate(frame, [0, sceneDuration], [0, 100])}%`, backgroundColor: brandColor }} />
              </div>
          </div>
      </div>

      {/* Circular HUD (Center) */}
      <div style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          width: "400px",
          height: "400px",
          border: `2px dashed ${brandColor}44`,
          borderRadius: "50%",
          animation: "spin 10s linear infinite", // Note: Remotion won't use CSS animations well, but this is a placeholder for HUD feel
          display: "flex",
          justifyContent: "center",
          alignItems: "center"
      }}>
           <div style={{ 
               width: "200px", 
               height: "200px", 
               border: `4px solid ${brandColor}`, 
               borderRadius: "50%", 
               opacity: 0.3, 
               transform: `scale(${interpolate(Math.sin(frame / 5), [-1, 1], [0.9, 1.1])})` 
           }} />
      </div>

    </AbsoluteFill>
  );
};
