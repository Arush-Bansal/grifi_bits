import { AbsoluteFill, OffthreadVideo, Sequence, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import React from "react";

interface Scene {
  image_url?: string | null;
  video_url?: string | null;
  speech?: string;
  id: number;
}

interface NeonNightProps {
  scenes?: Scene[];
  productName?: string;
  brandColor?: string;
}

export const NeonNightTemplate: React.FC<NeonNightProps> = ({
  scenes = [],
  productName = "Product Name",
  brandColor = "#f0abfc", // Neon Pink/Purple
}) => {
  const { fps } = useVideoConfig();
  const sceneDuration = Math.round(3.5 * fps);

  return (
    <AbsoluteFill style={{ backgroundColor: "#020617", color: "white", fontFamily: "Orbitron, sans-serif" }}>
      {scenes.map((scene, index) => {
        const startFrame = index * sceneDuration;
        return (
          <Sequence key={scene.id} from={startFrame} durationInFrames={sceneDuration}>
            <NeonScene 
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

const NeonScene: React.FC<{ scene: Scene; productName: string; brandColor: string }> = ({
  scene,
  productName,
  brandColor,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sceneDuration = Math.round(3.5 * fps);
  
  const flicker = interpolate(Math.sin(frame / 1.5), [-1, 1], [0.7, 1]);
  const opacity = interpolate(frame, [0, 10, sceneDuration - 10, sceneDuration], [0, 1, 1, 0]);

  return (
    <AbsoluteFill style={{ opacity }}>
      {/* Background with Scanlines */}
      <AbsoluteFill>
          <div style={{ position: "absolute", inset: 0, opacity: 0.4, filter: "grayscale(100%) contrast(1.5)" }}>
              {scene.video_url ? (
                  <OffthreadVideo src={scene.video_url} muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : scene.image_url ? (
                  <img src={scene.image_url} alt="Neon background" style={{ width: "100%", height: "100%", objectFit: "cover" }} crossOrigin="anonymous" />
              ) : (
                  <div style={{ width: "100%", height: "100%", background: "#000" }} />
              )}
          </div>
          {/* Scanline Overlay */}
          <div style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))",
              backgroundSize: "100% 2px, 3px 100%",
              pointerEvents: "none",
              zIndex: 10
          }} />
      </AbsoluteFill>

      {/* Neon Borders */}
      <div style={{
          position: "absolute",
          inset: "40px",
          border: `2px solid ${brandColor}`,
          boxShadow: `0 0 20px ${brandColor}, inset 0 0 20px ${brandColor}`,
          opacity: flicker,
          zIndex: 20,
          pointerEvents: "none"
      }}>
          {/* Corner Accents */}
          <div style={{ position: "absolute", top: "-5px", left: "-5px", width: "30px", height: "30px", borderTop: `4px solid white`, borderLeft: `4px solid white` }} />
          <div style={{ position: "absolute", bottom: "-5px", right: "-5px", width: "30px", height: "30px", borderBottom: `4px solid white`, borderRight: `4px solid white` }} />
      </div>

      {/* Floating Product Name (Glow) */}
      <div style={{
          position: "absolute",
          top: "80px",
          left: "50%",
          transform: "translateX(-50%)",
          textAlign: "center",
          zIndex: 30
      }}>
          <h1 style={{
              fontSize: "80px",
              fontWeight: 900,
              margin: 0,
              color: "white",
              textShadow: `0 0 10px ${brandColor}, 0 0 20px ${brandColor}, 0 0 40px ${brandColor}`,
              letterSpacing: "0.1em"
          }}>
              {productName.toUpperCase()}
          </h1>
          <div style={{ 
              fontSize: "18px", 
              marginTop: "10px", 
              color: brandColor, 
              fontWeight: 700, 
              letterSpacing: "0.5em",
              opacity: flicker
          }}>
              SYSTEM_READY_V1.0
          </div>
      </div>

      {/* Bottom Text Panel */}
      <div style={{
          position: "absolute",
          bottom: "100px",
          left: "80px",
          right: "80px",
          backgroundColor: "rgba(0,0,0,0.8)",
          padding: "30px",
          borderLeft: `8px solid ${brandColor}`,
          boxShadow: `0 0 30px rgba(0,0,0,0.5)`,
          zIndex: 30
      }}>
          <p style={{ margin: 0, fontSize: "24px", lineHeight: 1.4, fontWeight: 300, fontStyle: "italic" }}>
             &quot;{scene.speech || "Engineered for the night. Born in the grid. Unleash the power of pure neon."}&quot;
          </p>
      </div>

      {/* Glitch Square */}
      {frame % 30 < 5 && (
          <div style={{
              position: "absolute",
              width: "100px",
              height: "100px",
              backgroundColor: brandColor,
              left: `${Math.random() * 80}%`,
              top: `${Math.random() * 80}%`,
              opacity: 0.2,
              zIndex: 5
          }} />
      )}
    </AbsoluteFill>
  );
};
