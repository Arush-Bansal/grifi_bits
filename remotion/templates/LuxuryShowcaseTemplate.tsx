import { AbsoluteFill, Easing, OffthreadVideo, Sequence, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import React from "react";

interface Scene {
  image_url?: string | null;
  video_url?: string | null;
  speech?: string;
  id: number;
}

interface LuxuryShowcaseProps {
  scenes?: Scene[];
  productName?: string;
  brandColor?: string;
}

export const LuxuryShowcaseTemplate: React.FC<LuxuryShowcaseProps> = ({
  scenes = [],
  productName = "Product Name",
  brandColor = "#c9a96e",
}) => {
  const { fps } = useVideoConfig();
  const sceneDuration = Math.round(4.5 * fps);

  return (
    <AbsoluteFill style={{ backgroundColor: "#020204", color: "#f5f0e8", fontFamily: "Georgia, Times New Roman, serif" }}>
      {scenes.map((scene, index) => {
        const startFrame = index * sceneDuration;
        return (
          <Sequence key={scene.id} from={startFrame} durationInFrames={sceneDuration}>
            <LuxuryScene scene={scene} productName={productName} brandColor={brandColor} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

const LuxuryScene: React.FC<{ scene: Scene; productName: string; brandColor: string }> = ({
  scene,
  productName,
  brandColor,
}) => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const sceneDuration = Math.round(4.5 * fps);
  const copy = scene.speech?.trim() || "Crafted with intention. Made to endure.";

  const opacity = interpolate(frame, [0, 16, sceneDuration - 16, sceneDuration], [0, 1, 1, 0], {
    extrapolateRight: "clamp",
  });

  // Ultra-slow Ken Burns
  const mediaScale = interpolate(frame, [0, sceneDuration], [1.0, 1.03], {
    easing: Easing.out(Easing.cubic),
  });

  // Text entrance
  const textY = interpolate(frame, [8, 28], [14, 0], {
    easing: Easing.out(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const textOpacity = interpolate(frame, [8, 24], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Border draw-on animation (4 segments)
  const inset = Math.round(width * 0.04);
  const borderW = width - inset * 2;
  const borderH = height - inset * 2;
  const totalPerimeter = (borderW + borderH) * 2;

  // Draw over first 40 frames
  const drawProgress = interpolate(frame, [4, 44], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const drawn = drawProgress * totalPerimeter;

  // Top line
  const topLen = Math.min(drawn, borderW);
  // Right line
  const rightLen = Math.min(Math.max(0, drawn - borderW), borderH);
  // Bottom line
  const bottomLen = Math.min(Math.max(0, drawn - borderW - borderH), borderW);
  // Left line
  const leftLen = Math.min(Math.max(0, drawn - borderW - borderH - borderW), borderH);

  const borderColor = brandColor;

  return (
    <AbsoluteFill style={{ opacity }}>
      {/* Subtle ambient glow */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse at 50% 50%, ${brandColor}0a 0%, transparent 60%)`,
        }}
      />

      {/* Animated border — 4 lines */}
      {/* Top */}
      <div
        style={{
          position: "absolute",
          top: inset,
          left: inset,
          height: 1,
          width: topLen,
          backgroundColor: borderColor,
          opacity: 0.6,
        }}
      />
      {/* Right */}
      <div
        style={{
          position: "absolute",
          top: inset,
          right: inset,
          width: 1,
          height: rightLen,
          backgroundColor: borderColor,
          opacity: 0.6,
        }}
      />
      {/* Bottom */}
      <div
        style={{
          position: "absolute",
          bottom: inset,
          right: inset,
          height: 1,
          width: bottomLen,
          backgroundColor: borderColor,
          opacity: 0.6,
        }}
      />
      {/* Left */}
      <div
        style={{
          position: "absolute",
          bottom: inset,
          left: inset,
          width: 1,
          height: leftLen,
          backgroundColor: borderColor,
          opacity: 0.6,
        }}
      />

      {/* Product name — top center */}
      <div
        style={{
          position: "absolute",
          top: inset + 36,
          left: 0,
          right: 0,
          textAlign: "center",
          fontSize: 18,
          fontWeight: 400,
          letterSpacing: "0.3em",
          textTransform: "uppercase",
          color: brandColor,
          opacity: textOpacity,
        }}
      >
        {productName}
      </div>

      {/* Centered product image */}
      <div
        style={{
          position: "absolute",
          top: "18%",
          bottom: "28%",
          left: "22%",
          right: "22%",
          overflow: "hidden",
          borderRadius: 4,
          boxShadow: `0 30px 70px rgba(0,0,0,0.6), 0 0 1px ${brandColor}44`,
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
              transform: `scale(${mediaScale})`,
            }}
          />
        ) : scene.image_url ? (
          <img
            src={scene.image_url}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              transform: `scale(${mediaScale})`,
            }}
            alt="Product"
            crossOrigin="anonymous"
          />
        ) : (
          <AbsoluteFill
            style={{
              background: `linear-gradient(145deg, ${brandColor}22 0%, #0a0a10 100%)`,
            }}
          />
        )}
      </div>

      {/* Speech text — bottom center */}
      <div
        style={{
          position: "absolute",
          bottom: inset + 40,
          left: "15%",
          right: "15%",
          textAlign: "center",
          transform: `translateY(${textY}px)`,
          opacity: textOpacity,
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: 26,
            lineHeight: 1.4,
            fontStyle: "italic",
            color: "#d4cfc4",
            fontWeight: 400,
          }}
        >
          {copy}
        </p>
      </div>
    </AbsoluteFill>
  );
};
