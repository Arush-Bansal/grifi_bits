import { AbsoluteFill, Easing, OffthreadVideo, Sequence, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import React from "react";

interface Scene {
  image_url?: string | null;
  video_url?: string | null;
  speech?: string;
  id: number;
}

interface CountdownLaunchProps {
  scenes?: Scene[];
  productName?: string;
  brandColor?: string;
}

export const CountdownLaunchTemplate: React.FC<CountdownLaunchProps> = ({
  scenes = [],
  productName = "Product Name",
  brandColor = "#f43f5e",
}) => {
  const { fps } = useVideoConfig();
  const sceneDuration = Math.round(2.8 * fps);

  return (
    <AbsoluteFill style={{ backgroundColor: "#0a0610", fontFamily: "Arial, Helvetica, sans-serif", color: "#fff" }}>
      {scenes.map((scene, index) => (
        <Sequence key={scene.id} from={index * sceneDuration} durationInFrames={sceneDuration}>
          <CountdownScene
            scene={scene}
            productName={productName}
            brandColor={brandColor}
            sceneIndex={index}
            totalScenes={scenes.length}
          />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

const CountdownScene: React.FC<{
  scene: Scene;
  productName: string;
  brandColor: string;
  sceneIndex: number;
  totalScenes: number;
}> = ({ scene, productName, brandColor, sceneIndex, totalScenes }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sceneDuration = Math.round(2.8 * fps);
  const copy = scene.speech?.trim() || "Get ready.";

  const isLastScene = sceneIndex === totalScenes - 1;
  const countdownNumber = isLastScene ? "GO" : String(totalScenes - sceneIndex);

  // Scene fade (snappy)
  const opacity = interpolate(frame, [0, 4, sceneDuration - 5, sceneDuration], [0, 1, 1, 0], {
    extrapolateRight: "clamp",
  });

  // Giant countdown number spring with overshoot
  const numSpring = spring({ frame: frame - 2, fps, config: { damping: 8, stiffness: 220, mass: 0.5 } });
  const numScale = interpolate(numSpring, [0, 1], [2.0, 1.0]);
  const numOpacity = interpolate(numSpring, [0, 1], [0, 1]);

  // Radial burst lines (8 lines)
  const burstLines = 8;
  const burstLength = interpolate(frame, [2, 14], [0, 120], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const burstOpacity = interpolate(frame, [2, 14, sceneDuration - 10, sceneDuration], [0, 0.6, 0.6, 0], {
    extrapolateRight: "clamp",
  });

  // Background pulse
  const bgPulse = interpolate(Math.sin(frame / 6), [-1, 1], [0.08, 0.22]);

  // Product image float
  const imageFloat = interpolate(Math.sin(frame / 12), [-1, 1], [-5, 5]);

  // Product image Ken Burns
  const imageScale = interpolate(frame, [0, sceneDuration], [1.0, 1.08], {
    easing: Easing.out(Easing.cubic),
  });

  // Speech text entrance
  const speechSpring = spring({ frame: frame - 12, fps, config: { damping: 13, stiffness: 150 } });
  const speechY = interpolate(speechSpring, [0, 1], [20, 0]);
  const speechOpacity = interpolate(speechSpring, [0, 1], [0, 1]);

  return (
    <AbsoluteFill style={{ opacity }}>
      {/* Pulsing radial background glow */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at 50% 40%, ${brandColor}${Math.round(bgPulse * 255).toString(16).padStart(2, "0")} 0%, transparent 50%)`,
        }}
      />

      {/* Secondary ambient glow */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse at 50% 80%, ${brandColor}10 0%, transparent 40%)`,
        }}
      />

      {/* Product name pill (top) */}
      <div
        style={{
          position: "absolute",
          top: "4%",
          left: 0,
          right: 0,
          textAlign: "center",
          zIndex: 10,
        }}
      >
        <span
          style={{
            display: "inline-block",
            padding: "8px 20px",
            borderRadius: 9999,
            backgroundColor: `${brandColor}22`,
            border: `1px solid ${brandColor}44`,
            color: brandColor,
            fontSize: 16,
            fontWeight: 800,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
          }}
        >
          {productName}
        </span>
      </div>

      {/* Radial burst lines from center */}
      {Array.from({ length: burstLines }).map((_, i) => {
        const angle = (360 / burstLines) * i;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: "50%",
              top: "38%",
              width: burstLength,
              height: 2,
              backgroundColor: brandColor,
              opacity: burstOpacity,
              transform: `rotate(${angle}deg)`,
              transformOrigin: "0 50%",
              boxShadow: `0 0 6px ${brandColor}66`,
            }}
          />
        );
      })}

      {/* Giant countdown number */}
      <div
        style={{
          position: "absolute",
          top: "22%",
          left: 0,
          right: 0,
          textAlign: "center",
          fontSize: isLastScene ? 180 : 220,
          fontWeight: 900,
          transform: `scale(${numScale})`,
          opacity: numOpacity,
          color: "#fff",
          textShadow: `0 0 40px ${brandColor}88, 0 0 80px ${brandColor}44, 0 8px 30px rgba(0,0,0,0.5)`,
          letterSpacing: isLastScene ? "0.08em" : "-0.02em",
          lineHeight: 1,
        }}
      >
        {countdownNumber}
      </div>

      {/* Product image in circular frame (bottom area) */}
      <div
        style={{
          position: "absolute",
          bottom: "20%",
          left: "50%",
          marginLeft: -75,
          width: 150,
          height: 150,
          borderRadius: "50%",
          overflow: "hidden",
          border: `3px solid ${brandColor}66`,
          boxShadow: `0 0 20px ${brandColor}44, 0 8px 24px rgba(0,0,0,0.5)`,
          transform: `translateY(${imageFloat}px) scale(${imageScale})`,
        }}
      >
        {scene.video_url ? (
          <OffthreadVideo src={scene.video_url} muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : scene.image_url ? (
          <img src={scene.image_url} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" crossOrigin="anonymous" />
        ) : (
          <div style={{ width: "100%", height: "100%", background: `linear-gradient(135deg, ${brandColor}44 0%, #1a0a20 100%)` }} />
        )}
      </div>

      {/* Speech text (between number and image) */}
      <div
        style={{
          position: "absolute",
          top: "55%",
          left: "10%",
          right: "10%",
          textAlign: "center",
          transform: `translateY(${speechY}px)`,
          opacity: speechOpacity,
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: 34,
            fontWeight: 800,
            lineHeight: 1.2,
            textShadow: "0 4px 16px rgba(0,0,0,0.5)",
          }}
        >
          {copy}
        </p>
      </div>

      {/* Progress dots (bottom) */}
      <div
        style={{
          position: "absolute",
          bottom: "4%",
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          gap: 10,
        }}
      >
        {Array.from({ length: totalScenes }).map((_, i) => {
          const isActive = i === sceneIndex;
          return (
            <div
              key={i}
              style={{
                width: isActive ? 24 : 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: isActive ? brandColor : "rgba(255,255,255,0.2)",
                boxShadow: isActive ? `0 0 8px ${brandColor}88` : "none",
                transition: "width 0.15s",
              }}
            />
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
