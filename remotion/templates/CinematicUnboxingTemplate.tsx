import { AbsoluteFill, Easing, OffthreadVideo, Sequence, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import React from "react";

interface Scene {
  image_url?: string | null;
  video_url?: string | null;
  speech?: string;
  id: number;
}

interface CinematicUnboxingProps {
  scenes?: Scene[];
  productName?: string;
  brandColor?: string;
}

export const CinematicUnboxingTemplate: React.FC<CinematicUnboxingProps> = ({
  scenes = [],
  productName = "Product Name",
  brandColor = "#111827",
}) => {
  const { fps } = useVideoConfig();
  const sceneDuration = Math.round(4.5 * fps);

  return (
    <AbsoluteFill style={{ backgroundColor: "#000", color: "white", fontFamily: "Playfair Display, serif" }}>
      {scenes.map((scene, index) => {
        const startFrame = index * sceneDuration;
        return (
          <Sequence key={scene.id} from={startFrame} durationInFrames={sceneDuration}>
            <UnboxingScene 
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

const UnboxingScene: React.FC<{ scene: Scene; productName: string; brandColor: string }> = ({
  scene,
  productName,
  brandColor,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sceneDuration = Math.round(4.5 * fps);
  
  // Cinematic Camera Pan
  const pan = interpolate(frame, [0, sceneDuration], [0, -100], {
      easing: Easing.bezier(0.25, 0.1, 0.25, 1)
  });
  
  const opacity = interpolate(frame, [0, 20, sceneDuration - 20, sceneDuration], [0, 1, 1, 0]);
  const scale = interpolate(frame, [0, sceneDuration], [1.1, 1.3]);

  return (
    <AbsoluteFill style={{ opacity }}>
      {/* Background Media with Dark Overlay */}
      <AbsoluteFill style={{ transform: `scale(${scale}) translateX(${pan}px)` }}>
           {scene.video_url ? (
              <OffthreadVideo src={scene.video_url} muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : scene.image_url ? (
              <img src={scene.image_url} alt="Cinematic" style={{ width: "100%", height: "100%", objectFit: "cover" }} crossOrigin="anonymous" />
          ) : (
              <div style={{ width: "100%", height: "100%", background: brandColor }} />
          )}
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, rgba(0,0,0,0.8), transparent)" }} />
      </AbsoluteFill>

      {/* Cinematic Text Overlay */}
      <div style={{
          position: "absolute",
          left: "80px",
          top: "0",
          bottom: "0",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          maxWidth: "500px",
          zIndex: 10
      }}>
          <div style={{ 
              width: "40px", 
              height: "2px", 
              backgroundColor: "#fff", 
              marginBottom: "30px",
              transform: `scaleX(${interpolate(frame, [10, 30], [0, 1], { extrapolateRight: "clamp" })})`,
              transformOrigin: "left"
          }} />
          
          <h2 style={{ 
              fontSize: "64px", 
              fontWeight: 300, 
              margin: 0, 
              fontStyle: "italic",
              letterSpacing: "-0.02em" 
          }}>
              {productName}
          </h2>
          
          <div style={{ 
              fontSize: "20px", 
              marginTop: "40px", 
              lineHeight: 1.6, 
              opacity: interpolate(frame, [30, 50], [0, 0.8], { extrapolateRight: "clamp" }),
              fontWeight: 300
          }}>
              {scene.speech || "A masterclass in design. Every detail considered, every edge refined. Experience the evolution of elegance."}
          </div>

          {/* Luxury Label */}
          <div style={{
              marginTop: "60px",
              border: "1px solid rgba(255,255,255,0.3)",
              padding: "8px 16px",
              fontSize: "12px",
              letterSpacing: "0.3em",
              display: "inline-block",
              width: "fit-content",
              opacity: interpolate(frame, [50, 70], [0, 1], { extrapolateRight: "clamp" })
          }}>
              PREMIUM_EDITION
          </div>
      </div>

      {/* Vignette */}
      <div style={{
          position: "absolute",
          inset: 0,
          boxShadow: "inset 0 0 200px rgba(0,0,0,1)",
          pointerEvents: "none"
      }} />
    </AbsoluteFill>
  );
};
