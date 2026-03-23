import { AbsoluteFill, OffthreadVideo, Sequence, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import React from "react";

interface Scene {
  image_url?: string | null;
  video_url?: string | null;
  speech?: string;
  id: number;
}

interface FeatureBinaryProps {
  scenes?: Scene[];
  productName?: string;
  brandColor?: string;
}

export const FeatureBinaryTemplate: React.FC<FeatureBinaryProps> = ({
  scenes = [],
  productName = "Product Name",
  brandColor = "#3b82f6",
}) => {
  const { fps } = useVideoConfig();
  const sceneDuration = Math.round(4.0 * fps);

  return (
    <AbsoluteFill style={{ backgroundColor: "#000", color: "#fff", fontFamily: "Inter, sans-serif" }}>
      {scenes.map((scene, index) => {
        const startFrame = index * sceneDuration;
        return (
          <Sequence key={scene.id} from={startFrame} durationInFrames={sceneDuration}>
            <BinaryScene 
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

const BinaryScene: React.FC<{ scene: Scene; productName: string; brandColor: string }> = ({
  scene,
  productName,
  brandColor,
}) => {
  const frame = useCurrentFrame();
  const { width, fps } = useVideoConfig();
  
  // Wipe Animation
  const wipeProgress = spring({ frame, fps, config: { damping: 15 } });
  const wipePosition = interpolate(wipeProgress, [0, 1], [0, width]);

  return (
    <AbsoluteFill>
      {/* Left side: Legacy/Old (Static Placeholder or dimmed) */}
      <AbsoluteFill style={{ backgroundColor: "#111" }}>
          <div style={{ position: "absolute", inset: 0, opacity: 0.3, filter: "grayscale(100%)" }}>
              {scene.video_url ? (
                  <OffthreadVideo src={scene.video_url} muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : scene.image_url ? (
                  <img src={scene.image_url} alt="Comparison" style={{ width: "100%", height: "100%", objectFit: "cover" }} crossOrigin="anonymous" />
              ) : (
                  <div style={{ width: "100%", height: "100%", background: "#333" }} />
              )}
          </div>
          <div style={{ position: "absolute", top: "50%", left: "25%", transform: "translate(-50%, -50%)", textAlign: "center" }}>
              <div style={{ fontSize: "24px", letterSpacing: "0.2em", opacity: 0.5 }}>THE_PAST</div>
              <div style={{ fontSize: "60px", fontWeight: 200, marginTop: "20px", textDecoration: "line-through", opacity: 0.3 }}>LEGACY</div>
          </div>
      </AbsoluteFill>

      {/* Right side: Next-Gen/New (Clipped) */}
      <div style={{ 
          position: "absolute", 
          inset: 0, 
          width: wipePosition, 
          overflow: "hidden", 
          borderRight: `4px solid ${brandColor}`,
          boxShadow: `10px 0 50px ${brandColor}33`,
          zIndex: 10
      }}>
          <AbsoluteFill style={{ width, backgroundColor: "#000" }}>
              {scene.video_url ? (
                  <OffthreadVideo src={scene.video_url} muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : scene.image_url ? (
                  <img src={scene.image_url} alt="Next Gen" style={{ width: "100%", height: "100%", objectFit: "cover" }} crossOrigin="anonymous" />
              ) : (
                  <div style={{ width: "100%", height: "100%", background: brandColor }} />
              )}
              
              {/* Labels for New side */}
              <div style={{ position: "absolute", top: "50%", left: "75%", transform: "translate(-50%, -50%)", textAlign: "center" }}>
                  <div style={{ fontSize: "24px", color: brandColor, letterSpacing: "0.2em", fontWeight: 700 }}>THE_FUTURE</div>
                  <div style={{ fontSize: "80px", fontWeight: 900, marginTop: "20px" }}>{productName.toUpperCase().split(" ")[0]}</div>
              </div>
          </AbsoluteFill>
      </div>

      {/* Floating Callout */}
      <div style={{
          position: "absolute",
          bottom: "80px",
          left: "50%",
          transform: "translateX(-50%)",
          backgroundColor: "#fff",
          color: "#000",
          padding: "20px 40px",
          borderRadius: "50px",
          fontWeight: 800,
          fontSize: "24px",
          boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
          whiteSpace: "nowrap",
          zIndex: 20,
          opacity: wipeProgress
      }}>
          {scene.speech || "Stop compromising. Start evolving."}
      </div>
    </AbsoluteFill>
  );
};
