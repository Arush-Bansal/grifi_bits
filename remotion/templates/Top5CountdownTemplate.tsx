import { AbsoluteFill, Easing, OffthreadVideo, Sequence, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import React from "react";

interface Scene {
  image_url?: string | null;
  video_url?: string | null;
  speech?: string;
  id: number;
}

interface Top5CountdownProps {
  scenes?: Scene[];
  productName?: string;
  brandColor?: string;
}

export const Top5CountdownTemplate: React.FC<Top5CountdownProps> = ({
  scenes = [],
  productName = "Product Name",
  brandColor = "#f43f5e",
}) => {
  const { fps } = useVideoConfig();
  const sceneDuration = Math.round(2.5 * fps); // Quick 2.5s per scene

  return (
    <AbsoluteFill style={{ backgroundColor: "#000", color: "white", fontFamily: "Archivo Black, sans-serif" }}>
      {scenes.map((scene, index) => {
        const startFrame = index * sceneDuration;
        const number = scenes.length - index;
        return (
          <Sequence key={scene.id} from={startFrame} durationInFrames={sceneDuration}>
            <CountdownScene 
              scene={scene} 
              productName={productName} 
              brandColor={brandColor} 
              number={number}
              isLast={index === scenes.length - 1}
            />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

const CountdownScene: React.FC<{ scene: Scene; productName: string; brandColor: string; number: number; isLast: boolean }> = ({
  scene,
  productName,
  brandColor,
  number,
  isLast,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig(); // width/height unused for now but kept for consistency
  const sceneDuration = Math.round(2.5 * fps);
  
  const entrance = spring({ frame, fps, config: { damping: 10, mass: 0.5 } });
  const scale = interpolate(entrance, [0, 1], [4, 1], { easing: Easing.out(Easing.exp) });
  const opacity = interpolate(frame, [0, 5, sceneDuration - 5, sceneDuration], [0, 1, 1, 0]);

  // Flicker effect for the number
  const flicker = Math.sin(frame * 2) > 0.5 ? 1 : 0.8;

  return (
    <AbsoluteFill style={{ opacity }}>
      {/* Background Media (Blurred/Darkened) */}
      <AbsoluteFill style={{ opacity: 0.4, filter: "grayscale(100%) contrast(1.5)" }}>
          {scene.video_url ? (
              <OffthreadVideo src={scene.video_url} muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : scene.image_url ? (
              <img src={scene.image_url} alt="Background" style={{ width: "100%", height: "100%", objectFit: "cover" }} crossOrigin="anonymous" />
          ) : (
              <div style={{ width: "100%", height: "100%", background: "#111" }} />
          )}
      </AbsoluteFill>

      {/* Large Number Overlay */}
      <div style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontSize: "600px",
          fontWeight: 900,
          color: brandColor,
          opacity: 0.2 * flicker,
          transform: `scale(${scale * 0.8})`,
          WebkitTextStroke: "4px white",
          zIndex: 1
      }}>
          {number}
      </div>

      {/* Main Feature Text */}
      <div style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 10,
          padding: "40px",
          textAlign: "center"
      }}>
          <div style={{
              fontSize: "120px",
              lineHeight: 0.9,
              textTransform: "uppercase",
              letterSpacing: "-0.05em",
              transform: `scale(${scale}) translateY(${interpolate(entrance, [0, 1], [100, 0])}px)`,
              color: "#fff",
              textShadow: "0 20px 40px rgba(0,0,0,0.8)"
          }}>
              {scene.speech || `FEATURE #${number}`}
          </div>
          
          <div style={{
              marginTop: "40px",
              fontSize: "32px",
              fontWeight: 700,
              color: brandColor,
              backgroundColor: "white",
              padding: "10px 30px",
              transform: `rotate(-2deg) scale(${interpolate(entrance, [0.8, 1], [0, 1], { extrapolateLeft: "clamp" })})`
          }}>
              {isLast ? "THE WINNER" : productName.toUpperCase()}
          </div>
      </div>
    </AbsoluteFill>
  );
};
