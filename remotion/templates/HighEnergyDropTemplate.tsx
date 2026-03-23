import { AbsoluteFill, OffthreadVideo, Sequence, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import React from "react";

interface Scene {
  image_url?: string | null;
  video_url?: string | null;
  speech?: string;
  id: number;
}

interface HighEnergyDropProps {
  scenes?: Scene[];
  productName?: string;
  brandColor?: string;
}

export const HighEnergyDropTemplate: React.FC<HighEnergyDropProps> = ({
  scenes = [],
  productName = "Product Name",
  brandColor = "#ef4444",
}) => {
  const { fps } = useVideoConfig();
  const sceneDuration = Math.round(2.0 * fps);

  return (
    <AbsoluteFill style={{ backgroundColor: "#000", color: "#fff", fontFamily: "Impact, sans-serif" }}>
      {scenes.map((scene, index) => {
        const startFrame = index * sceneDuration;
        return (
          <Sequence key={scene.id} from={startFrame} durationInFrames={sceneDuration}>
            <DropScene 
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

const DropScene: React.FC<{ scene: Scene; productName: string; brandColor: string }> = ({
  scene,
  productName,
  brandColor,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  
  // High Intensity Animations
  const impact = spring({ frame, fps, config: { damping: 5, stiffness: 200 } });
  const scale = interpolate(impact, [0, 1], [4, 1]);
  const rotation = interpolate(impact, [0, 1], [45, 0]);
  
  // Glitch Effect (Random flash)
  const isGlitch = frame % 5 === 0 && frame < 15;
  const glitchX = (Math.random() - 0.5) * 50;

  return (
    <AbsoluteFill>
      {/* Glitch Overlay */}
      {isGlitch && (
          <AbsoluteFill style={{ backgroundColor: brandColor, opacity: 0.3, zIndex: 100 }} />
      )}

      {/* Main Content */}
      <AbsoluteFill style={{ 
          transform: `scale(${scale}) rotate(${rotation}deg) translateX(${isGlitch ? glitchX : 0}px)`,
          filter: isGlitch ? "contrast(3) brightness(2)" : "none"
      }}>
          {scene.video_url ? (
              <OffthreadVideo src={scene.video_url} muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : scene.image_url ? (
              <img src={scene.image_url} alt="Drop" style={{ width: "100%", height: "100%", objectFit: "cover" }} crossOrigin="anonymous" />
          ) : (
              <div style={{ width: "100%", height: "100%", background: "#111" }} />
          )}
      </AbsoluteFill>

      {/* Extreme Text */}
      <div style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center"
      }}>
          <h1 style={{
              fontSize: "180px",
              fontWeight: 900,
              textTransform: "uppercase",
              textShadow: `10px 10px 0px ${brandColor}`,
              transform: `scale(${interpolate(impact, [0, 1], [0.5, 1])})`,
              opacity: interpolate(frame, [0, 10], [0, 1]),
              lineHeight: 0.8
          }}>
              {productName.split(" ")[0]}<br/>
              <span style={{ color: brandColor, textShadow: "none" }}>DROP</span>
          </h1>
      </div>

      {/* Speed Lines */}
      {frame < 10 && (
          <AbsoluteFill>
              {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} style={{
                      position: "absolute",
                      left: `${Math.random() * 100}%`,
                      top: 0,
                      bottom: 0,
                      width: "4px",
                      backgroundColor: "#fff",
                      opacity: 0.5,
                      transform: `scaleY(${Math.random()})`
                  }} />
              ))}
          </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
