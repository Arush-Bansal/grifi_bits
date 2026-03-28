import { AbsoluteFill, Easing, OffthreadVideo, Series, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import React from "react";

interface Scene {
  image_url?: string | null;
  video_url?: string | null;
  speech?: string;
  id: number;
}

interface MinimalistVerticalProps {
  scenes?: Scene[];
  productName?: string;
  brandColor?: string;
}

export const MinimalistVerticalTemplate: React.FC<MinimalistVerticalProps> = ({
  scenes = [],
  productName = "Product Name",
  brandColor = "#18181b",
}) => {
  const { fps } = useVideoConfig();
  const sceneDuration = Math.round(4.0 * fps);

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(168deg, #0e1117 0%, #151a24 50%, #0e1117 100%)",
        color: "#f0f2f5",
        fontFamily: "Georgia, Times New Roman, serif",
      }}
    >
      <Series>
        {scenes.map((scene, index) => (
          <Series.Sequence key={scene.id} durationInFrames={sceneDuration}>
            <MinimalistVerticalScene
              scene={scene}
              productName={productName}
              brandColor={brandColor}
              sceneIndex={index}
              totalScenes={scenes.length}
            />
          </Series.Sequence>
        ))}
      </Series>
    </AbsoluteFill>
  );
};

const MinimalistVerticalScene: React.FC<{
  scene: Scene;
  productName: string;
  brandColor: string;
  sceneIndex: number;
  totalScenes: number;
}> = ({ scene, productName, brandColor, sceneIndex, totalScenes }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sceneDuration = Math.round(4.0 * fps);
  const copy = scene.speech?.trim() || "Refined form. Thoughtful function.";

  // Cinematic fade envelope
  const opacity = interpolate(frame, [0, 12, sceneDuration - 14, sceneDuration], [0, 1, 1, 0], {
    extrapolateRight: "clamp",
  });

  // Strong Ken Burns zoom (forward, cinematic)
  const mediaScale = interpolate(frame, [0, sceneDuration], [1.0, 1.12], {
    easing: Easing.out(Easing.cubic),
  });

  // Slow pan drift for cinematic feel
  const mediaPanX = interpolate(frame, [0, sceneDuration], [sceneIndex % 2 === 0 ? -8 : 8, sceneIndex % 2 === 0 ? 8 : -8], {
    easing: Easing.inOut(Easing.cubic),
  });

  // Text entrance with spring physics
  const textEntrance = spring({ frame: frame - 10, fps, config: { damping: 14, stiffness: 120, mass: 0.8 } });
  const textY = interpolate(textEntrance, [0, 1], [30, 0]);
  const textOpacity = interpolate(textEntrance, [0, 1], [0, 1]);

  // Accent line grows in
  const lineGrow = interpolate(frame, [8, 32], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Ambient shimmer scanning across the media
  const shimmerX = interpolate(frame, [0, sceneDuration], [-20, 120], { easing: Easing.inOut(Easing.cubic) });

  // Subtle pulsing glow on the accent line
  const glowPulse = interpolate(Math.sin(frame / 14), [-1, 1], [0.4, 1]);

  // Product name entrance
  const nameEntrance = spring({ frame: frame - 4, fps, config: { damping: 16, stiffness: 100 } });
  const nameOpacity = interpolate(nameEntrance, [0, 1], [0, 1]);
  const nameY = interpolate(nameEntrance, [0, 1], [-12, 0]);

  return (
    <AbsoluteFill style={{ opacity }}>
      {/* Dark ambient radial glow */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse at 50% 35%, ${brandColor}22 0%, transparent 60%)`,
        }}
      />

      {/* Product name header */}
      <div
        style={{
          position: "absolute",
          top: "4.5%",
          left: 0,
          right: 0,
          textAlign: "center",
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          fontSize: 16,
          fontFamily: "Arial, Helvetica, sans-serif",
          color: "#8899aa",
          opacity: nameOpacity,
          transform: `translateY(${nameY}px)`,
        }}
      >
        {productName}
      </div>

      {/* Media area — top section with cinematic treatment */}
      <div
        style={{
          position: "absolute",
          top: "9%",
          left: 0,
          right: 0,
          height: "52%",
          overflow: "hidden",
        }}
      >
        {/* Media with Ken Burns + Pan */}
        <div
          style={{
            width: "100%",
            height: "100%",
            transform: `scale(${mediaScale}) translateX(${mediaPanX}px)`,
          }}
        >
          {scene.video_url ? (
            <OffthreadVideo
              src={scene.video_url}
              muted
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          ) : scene.image_url ? (
            <img
              src={scene.image_url}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
              alt="Product"
              crossOrigin="anonymous"
            />
          ) : (
            <AbsoluteFill
              style={{
                background: `linear-gradient(145deg, ${brandColor}44 0%, #1a2030 100%)`,
              }}
            />
          )}
        </div>

        {/* Dark cinematic vignette overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(180deg, rgba(14,17,23,0.3) 0%, transparent 30%, transparent 70%, rgba(14,17,23,0.5) 100%)",
          }}
        />

        {/* Shimmer sweep overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `linear-gradient(105deg, transparent ${shimmerX - 15}%, rgba(255,255,255,0.06) ${shimmerX}%, transparent ${shimmerX + 15}%)`,
            pointerEvents: "none",
          }}
        />
      </div>

      {/* Accent line divider with glow */}
      <div
        style={{
          position: "absolute",
          top: "63%",
          left: "50%",
          transform: "translateX(-50%)",
          height: 2,
          backgroundColor: brandColor,
          width: `${Math.max(16, 80 * lineGrow)}px`,
          boxShadow: `0 0 ${12 * glowPulse}px ${brandColor}88, 0 0 ${24 * glowPulse}px ${brandColor}44`,
        }}
      />

      {/* Text area — bottom with spring entrance */}
      <div
        style={{
          position: "absolute",
          left: "8%",
          right: "8%",
          bottom: "8%",
          top: "66%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
          transform: `translateY(${textY}px)`,
          opacity: textOpacity,
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: 38,
            lineHeight: 1.3,
            color: "#c8d0dc",
            maxWidth: 900,
            fontStyle: "italic",
            textShadow: "0 2px 12px rgba(0,0,0,0.5)",
          }}
        >
          {copy}
        </p>
        <p
          style={{
            marginTop: 18,
            marginBottom: 0,
            fontSize: 15,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            fontFamily: "Arial, Helvetica, sans-serif",
            color: "#556677",
          }}
        >
          {`0${sceneIndex + 1} / 0${totalScenes}`}
        </p>
      </div>

      {/* Decorative pulsing dot */}
      <div
        style={{
          position: "absolute",
          right: "7%",
          top: "10%",
          width: 12,
          height: 12,
          borderRadius: "50%",
          backgroundColor: brandColor,
          opacity: glowPulse * 0.6,
          boxShadow: `0 0 8px ${brandColor}66`,
        }}
      />

      {/* Bottom progress bar */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 3,
          backgroundColor: "rgba(255,255,255,0.08)",
        }}
      >
        <div
          style={{
            height: "100%",
            backgroundColor: brandColor,
            width: `${(frame / sceneDuration) * 100}%`,
            boxShadow: `0 0 8px ${brandColor}66`,
          }}
        />
      </div>
    </AbsoluteFill>
  );
};
