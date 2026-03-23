import { AbsoluteFill, OffthreadVideo, Sequence, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import React from "react";

interface Scene {
  image_url?: string | null;
  video_url?: string | null;
  speech?: string;
  id: number;
}

interface SimulatedUIWalkthroughProps {
  scenes?: Scene[];
  productName?: string;
  brandColor?: string;
}

export const SimulatedUIWalkthroughTemplate: React.FC<SimulatedUIWalkthroughProps> = ({
  scenes = [],
  productName = "Product Name",
  brandColor = "#3b82f6",
}) => {
  const { fps } = useVideoConfig();
  const sceneDuration = Math.round(4.0 * fps);

  return (
    <AbsoluteFill style={{ backgroundColor: "#f1f5f9", color: "#0f172a", fontFamily: "Inter, sans-serif" }}>
      {scenes.map((scene, index) => {
        const startFrame = index * sceneDuration;
        return (
          <Sequence key={scene.id} from={startFrame} durationInFrames={sceneDuration}>
            <UIScene 
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

const UIScene: React.FC<{ scene: Scene; productName: string; brandColor: string; index: number }> = ({
  scene,
  productName,
  brandColor,
  index,
}) => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  
  // Cursor Pathing
  const cursorX = interpolate(frame, [0, 20, 40, 60, 80], [width * 0.8, width * 0.5, width * 0.5, width * 0.2, width * 0.2], {
      // Easing.bezier is not imported, removing it to fix the error.
      // If a specific easing function is desired, it needs to be imported from 'remotion' or defined.
      // For now, removing the easing property.
  });
  const cursorY = interpolate(frame, [0, 20, 40, 60, 80], [height * 0.8, height * 0.4, height * 0.4, height * 0.6, height * 0.6], {
      // Easing.bezier is not imported, removing it to fix the error.
  });
  
  // Click Animation
  const isClicking = frame >= 35 && frame <= 45;
  const clickScale = spring({ frame: isClicking ? frame - 35 : 0, fps, config: { damping: 10 } });
  const cursorScale = interpolate(clickScale, [0, 1], [1, 0.8]);

  return (
    <AbsoluteFill>
      {/* Simulated Browser Interface */}
      <div style={{
          position: "absolute",
          inset: "40px",
          backgroundColor: "#fff",
          borderRadius: "16px",
          boxShadow: "0 20px 50px rgba(0,0,0,0.1)",
          overflow: "hidden",
          border: "1px solid rgba(0,0,0,0.05)"
      }}>
          {/* Browser Header */}
          <div style={{ height: "40px", backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0", display: "flex", alignItems: "center", padding: "0 20px", gap: "10px" }}>
              <div style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "#ef4444" }} />
              <div style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "#fbbf24" }} />
              <div style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "#22c55e" }} />
              <div style={{ flex: 1, height: "24px", backgroundColor: "#fff", borderRadius: "4px", border: "1px solid #e2e8f0", margin: "0 20px", fontSize: "12px", color: "#94a3b8", display: "flex", alignItems: "center", padding: "0 10px" }}>
                  {productName.toLowerCase().replace(/\s/g, "")}.com
              </div>
          </div>

          {/* Page Content */}
          <AbsoluteFill style={{ top: "40px" }}>
              <div style={{ padding: "40px", display: "flex", gap: "40px", height: "100%" }}>
                  {/* Left Column: Text */}
                  <div style={{ flex: 1 }}>
                      <div style={{ 
                          width: "80px", 
                          height: "6px", 
                          backgroundColor: brandColor, 
                          borderRadius: "3px", 
                          marginBottom: "20px",
                          transform: `scaleX(${interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" })})`,
                          transformOrigin: "left"
                      }} />
                      <h1 style={{ fontSize: "40px", fontWeight: 800, margin: 0 }}>{productName}</h1>
                      <p style={{ fontSize: "18px", color: "#64748b", marginTop: "20px", lineHeight: 1.5 }}>
                          {scene.speech || "Intuitive design meets unparalleled performance. Experience the future today."}
                      </p>
                      
                      {/* Simulated Button */}
                      <div style={{
                          marginTop: "40px",
                          backgroundColor: isClicking ? `${brandColor}dd` : brandColor,
                          color: "#fff",
                          padding: "14px 28px",
                          borderRadius: "8px",
                          fontWeight: 700,
                          display: "inline-block",
                          transform: `scale(${isClicking ? 0.95 : 1})`,
                          transition: "transform 0.1s"
                      }}>
                          Learn More
                      </div>
                  </div>

                  {/* Right Column: Image/Video */}
                  <div style={{ 
                      flex: 1.2, 
                      borderRadius: "12px", 
                      overflow: "hidden", 
                      position: "relative",
                      border: "1px solid #f1f5f9"
                  }}>
                      {scene.video_url ? (
                          <OffthreadVideo src={scene.video_url} muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : scene.image_url ? (
                          <img src={scene.image_url} alt="UI walkthrough" style={{ width: "100%", height: "100%", objectFit: "cover" }} crossOrigin="anonymous" />
                      ) : (
                          <div style={{ width: "100%", height: "100%", background: `linear-gradient(135deg, ${brandColor}11, ${brandColor}22)` }} />
                      )}
                  </div>
              </div>
          </AbsoluteFill>
      </div>

      {/* Simulated Cursor */}
      <div style={{
          position: "absolute",
          left: cursorX,
          top: cursorY,
          transform: `scale(${cursorScale})`,
          zIndex: 100,
          pointerEvents: "none"
      }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 3L10.07 19.97L12.58 12.58L19.97 10.07L3 3Z" fill="black" stroke="white" strokeWidth="2" strokeLinejoin="round"/>
          </svg>
          {isClicking && (
              <div style={{
                  position: "absolute",
                  left: "0",
                  top: "0",
                  width: "10px",
                  height: "10px",
                  borderRadius: "50%",
                  border: `2px solid ${brandColor}`,
                  transform: `scale(${interpolate(clickScale, [0, 1], [0, 5])})`,
                  opacity: interpolate(clickScale, [0, 1], [1, 0])
              }} />
          )}
      </div>
    </AbsoluteFill>
  );
};
