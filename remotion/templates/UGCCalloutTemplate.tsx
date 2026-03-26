import { AbsoluteFill, OffthreadVideo, Sequence, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import React from "react";

interface Scene {
  image_url?: string | null;
  video_url?: string | null;
  speech?: string;
  id: number;
}

interface UGCCalloutProps {
  scenes?: Scene[];
  productName?: string;
  brandColor?: string;
}

export const UGCCalloutTemplate: React.FC<UGCCalloutProps> = ({
  scenes = [],
  productName = "Product Name",
  brandColor = "#ef4444",
}) => {
  const { fps } = useVideoConfig();
  const sceneDuration = Math.round(3.0 * fps);

  return (
    <AbsoluteFill style={{ backgroundColor: "#000", color: "white", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      {scenes.map((scene, index) => {
        const startFrame = index * sceneDuration;
        return (
          <Sequence key={scene.id} from={startFrame} durationInFrames={sceneDuration}>
            <UGCScene 
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

const UGCScene: React.FC<{ scene: Scene; productName: string; brandColor: string }> = ({
  scene,
  productName,
  brandColor,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sceneDuration = Math.round(3.0 * fps);
  
  const opacity = interpolate(frame, [0, 5, sceneDuration - 5, sceneDuration], [0, 1, 1, 0]);
  const recOpacity = interpolate(Math.sin(frame / 10), [-1, 1], [0.2, 1]);

  return (
    <AbsoluteFill style={{ opacity }}>
      {/* Main UGC Media */}
      <AbsoluteFill>
          {scene.video_url ? (
              <OffthreadVideo src={scene.video_url} muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : scene.image_url ? (
              <img src={scene.image_url} alt="Review" style={{ width: "100%", height: "100%", objectFit: "cover" }} crossOrigin="anonymous" />
          ) : (
              <div style={{ width: "100%", height: "100%", background: "#111" }} />
          )}
      </AbsoluteFill>

      {/* Social Media Recording Overlay */}
      <AbsoluteFill style={{ padding: "40px", pointerEvents: "none" }}>
          {/* Top Row: REC indicator */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{ width: "16px", height: "16px", borderRadius: "50%", backgroundColor: brandColor, opacity: recOpacity }} />
                  <span style={{ fontSize: "24px", fontWeight: 700, letterSpacing: "0.05em" }}>REC</span>
              </div>
              <div style={{ fontSize: "20px", opacity: 0.8 }}>
                 {Math.floor(frame / fps)}s / {Math.floor(sceneDuration / fps)}s
              </div>
          </div>

          {/* Floating Emojis (Engagement) */}
          <div style={{ position: "absolute", right: "40px", bottom: "150px", display: "flex", flexDirection: "column", gap: "20px" }}>
              {[1, 2, 3, 4].map((i) => {
                  const floatEntrance = spring({ frame: frame - i * 12, fps, config: { damping: 10 } });
                  const y = interpolate(floatEntrance, [0, 1], [50, -200]);
                  const x = Math.sin((frame - i * 15) / 10) * 20;
                  return (
                      <div key={i} style={{ 
                          fontSize: "40px", 
                          opacity: interpolate(floatEntrance, [0, 0.2, 0.8, 1], [0, 1, 1, 0]),
                          transform: `translate(${x}px, ${y}px)`
                      }}>
                          {["❤", "🔥", "💯", "👏"][i - 1]}
                      </div>
                  );
              })}
          </div>

          {/* Bottom Card: The Reviewer info */}
          <div style={{
              position: "absolute",
              bottom: "40px",
              left: "40px",
              right: "40px",
              display: "flex",
              alignItems: "flex-end",
              gap: "20px"
          }}>
              <div style={{
                  width: "80px",
                  height: "80px",
                  borderRadius: "50%",
                  backgroundColor: brandColor,
                  border: "3px solid #fff",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  fontSize: "32px",
                  fontWeight: 800
              }}>
                  {productName[0]}
              </div>
              <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "24px", fontWeight: 900, marginBottom: "8px" }}>@{productName.toLowerCase().replace(/\s/g, '_')}</div>
                  <div style={{ 
                      fontSize: "20px", 
                      lineHeight: 1.3, 
                      backgroundColor: "rgba(0,0,0,0.5)", 
                      padding: "10px 16px", 
                      borderRadius: "12px",
                      backdropFilter: "blur(10px)",
                      border: "1px solid rgba(255,255,255,0.1)"
                  }}>
                      {scene.speech || "This is honestly the best purchase I've made this year. Must fragments!"}
                  </div>
              </div>
          </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
