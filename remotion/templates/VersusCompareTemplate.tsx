import { AbsoluteFill, Easing, OffthreadVideo, Sequence, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import React from "react";
import { LogoOverlay } from "./shared/LogoOverlay";

interface Scene {
  image_url?: string | null;
  video_url?: string | null;
  speech?: string;
  id: number;
}

interface VersusCompareProps {
  scenes?: Scene[];
  productName?: string;
  brandColor?: string;
  bgColor?: string;
  fontFamily?: string;
  logoUrl?: string;
  ctaText?: string;
}

export const VersusCompareTemplate: React.FC<VersusCompareProps> = ({
  scenes = [],
  productName = "Product Name",
  brandColor = "#3b82f6",
  bgColor,
  fontFamily,
  logoUrl,
  ctaText,
}) => {
  const { fps } = useVideoConfig();
  const sceneDuration = Math.round(3.6 * fps);

  return (
    <AbsoluteFill style={{ backgroundColor: bgColor || "#060810", fontFamily: fontFamily || "Arial, Helvetica, sans-serif", color: "#fff" }}>
      {scenes.map((scene, index) => (
        <Sequence key={scene.id} from={index * sceneDuration} durationInFrames={sceneDuration}>
          <VersusScene
            scene={scene}
            productName={productName}
            brandColor={brandColor}
            sceneIndex={index}
            totalScenes={scenes.length}
          />
        </Sequence>
      ))}
      <LogoOverlay logoUrl={logoUrl} />
    </AbsoluteFill>
  );
};

const VersusScene: React.FC<{
  scene: Scene;
  productName: string;
  brandColor: string;
  sceneIndex: number;
  totalScenes: number;
}> = ({ scene, productName, brandColor, sceneIndex, totalScenes }) => {
  const frame = useCurrentFrame();
  const { width, fps } = useVideoConfig();
  const sceneDuration = Math.round(3.6 * fps);
  const copy = scene.speech?.trim() || "Others fade. This lasts.";

  // Scene fade
  const opacity = interpolate(frame, [0, 8, sceneDuration - 10, sceneDuration], [0, 1, 1, 0], {
    extrapolateRight: "clamp",
  });

  // Left panel slides in from left
  const leftSlide = interpolate(frame, [0, 14], [-120, 0], {
    easing: Easing.out(Easing.cubic),
    extrapolateRight: "clamp",
  });

  // Right panel slides in from right (2 frame delay)
  const rightSlide = interpolate(frame, [2, 16], [120, 0], {
    easing: Easing.out(Easing.cubic),
    extrapolateRight: "clamp",
  });

  // Ken Burns on product image (right side)
  const productScale = interpolate(frame, [0, sceneDuration], [1.0, 1.1], {
    easing: Easing.out(Easing.cubic),
  });

  // VS badge spring entrance
  const vsSpring = spring({ frame: frame - 8, fps, config: { damping: 10, stiffness: 200, mass: 0.6 } });
  const vsScale = interpolate(vsSpring, [0, 1], [0, 1]);

  // VS badge rotation oscillation
  const vsRotate = interpolate(Math.sin(frame / 20), [-1, 1], [-3, 3]);

  // Divider glow pulse
  const dividerGlow = interpolate(Math.sin(frame / 8), [-1, 1], [0.4, 1.0]);

  // Speech bar entrance
  const speechSpring = spring({ frame: frame - 18, fps, config: { damping: 14, stiffness: 130 } });
  const speechY = interpolate(speechSpring, [0, 1], [40, 0]);
  const speechOpacity = interpolate(speechSpring, [0, 1], [0, 1]);

  const halfWidth = width / 2;

  return (
    <AbsoluteFill style={{ opacity }}>
      {/* Left panel — "THEM" (desaturated) */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: halfWidth - 2,
          overflow: "hidden",
          transform: `translateX(${leftSlide}px)`,
        }}
      >
        {/* Desaturated image */}
        <div
          style={{
            width: "100%",
            height: "100%",
            filter: "grayscale(75%) brightness(0.45) contrast(0.9)",
            transform: `scale(${productScale})`,
          }}
        >
          {scene.video_url ? (
            <OffthreadVideo src={scene.video_url} muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : scene.image_url ? (
            <img src={scene.image_url} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" crossOrigin="anonymous" />
          ) : (
            <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg, #1a1a2e 0%, #0a0a14 100%)" }} />
          )}
        </div>

        {/* Dark overlay for left */}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, rgba(6,8,16,0.3) 0%, rgba(6,8,16,0.5) 100%)" }} />

        {/* "THEM" label */}
        <div
          style={{
            position: "absolute",
            top: "8%",
            left: "8%",
            padding: "8px 18px",
            borderRadius: 10,
            backgroundColor: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.15)",
            fontSize: 18,
            fontWeight: 900,
            letterSpacing: "0.12em",
            color: "rgba(255,255,255,0.5)",
            backdropFilter: "blur(8px)",
          }}
        >
          THEM
        </div>

        {/* Red X marks */}
        <div
          style={{
            position: "absolute",
            bottom: "18%",
            left: "8%",
            right: "12%",
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          {["Fades quickly", "Generic quality", "No guarantee"].map((text, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                opacity: interpolate(frame, [14 + i * 4, 20 + i * 4], [0, 0.7], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
              }}
            >
              <span style={{ color: "#ef4444", fontSize: 22, fontWeight: 900 }}>✕</span>
              <span style={{ fontSize: 18, color: "rgba(255,255,255,0.5)", fontWeight: 600 }}>{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — "US" (full color, vibrant) */}
      <div
        style={{
          position: "absolute",
          right: 0,
          top: 0,
          bottom: 0,
          width: halfWidth - 2,
          overflow: "hidden",
          transform: `translateX(${rightSlide}px)`,
        }}
      >
        {/* Full-color product image with Ken Burns */}
        <div
          style={{
            width: "100%",
            height: "100%",
            transform: `scale(${productScale})`,
          }}
        >
          {scene.video_url ? (
            <OffthreadVideo src={scene.video_url} muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : scene.image_url ? (
            <img src={scene.image_url} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" crossOrigin="anonymous" />
          ) : (
            <div style={{ width: "100%", height: "100%", background: `linear-gradient(135deg, ${brandColor}66 0%, #0a1428 100%)` }} />
          )}
        </div>

        {/* Accent radial glow */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `radial-gradient(circle at 60% 40%, ${brandColor}28 0%, transparent 50%)`,
          }}
        />

        {/* Cinematic bottom gradient */}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, transparent 50%, rgba(6,8,16,0.6) 100%)" }} />

        {/* "US" label */}
        <div
          style={{
            position: "absolute",
            top: "8%",
            right: "8%",
            padding: "8px 18px",
            borderRadius: 10,
            backgroundColor: `${brandColor}33`,
            border: `1px solid ${brandColor}66`,
            fontSize: 18,
            fontWeight: 900,
            letterSpacing: "0.12em",
            color: brandColor,
            backdropFilter: "blur(8px)",
          }}
        >
          US
        </div>

        {/* Product name pill */}
        <div
          style={{
            position: "absolute",
            top: "8%",
            left: "8%",
            padding: "6px 14px",
            borderRadius: 9999,
            backgroundColor: brandColor,
            color: "#fff",
            fontSize: 14,
            fontWeight: 800,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          {productName}
        </div>
      </div>

      {/* Center divider line with glow */}
      <div
        style={{
          position: "absolute",
          left: halfWidth - 1.5,
          top: 0,
          bottom: 0,
          width: 3,
          backgroundColor: brandColor,
          boxShadow: `0 0 ${16 * dividerGlow}px ${brandColor}88, 0 0 ${30 * dividerGlow}px ${brandColor}44`,
          zIndex: 10,
        }}
      />

      {/* VS badge */}
      <div
        style={{
          position: "absolute",
          left: halfWidth - 36,
          top: "50%",
          marginTop: -36,
          width: 72,
          height: 72,
          borderRadius: "50%",
          backgroundColor: brandColor,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transform: `scale(${vsScale}) rotate(${vsRotate}deg)`,
          boxShadow: `0 0 24px ${brandColor}88, 0 8px 20px rgba(0,0,0,0.4)`,
          zIndex: 20,
          fontSize: 28,
          fontWeight: 900,
          letterSpacing: "0.04em",
          color: "#fff",
        }}
      >
        VS
      </div>

      {/* Bottom speech bar */}
      <div
        style={{
          position: "absolute",
          bottom: "5%",
          left: "10%",
          right: "10%",
          transform: `translateY(${speechY}px)`,
          opacity: speechOpacity,
          backgroundColor: "rgba(6,8,16,0.75)",
          backdropFilter: "blur(16px)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 18,
          padding: "20px 28px",
          textAlign: "center",
          zIndex: 15,
        }}
      >
        <p style={{ margin: 0, fontSize: 28, fontWeight: 800, lineHeight: 1.2, textShadow: "0 2px 8px rgba(0,0,0,0.4)" }}>
          {copy}
        </p>
      </div>

      {/* Progress bar */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 4, backgroundColor: "rgba(255,255,255,0.08)", zIndex: 20 }}>
        <div style={{ height: "100%", backgroundColor: brandColor, width: `${(frame / sceneDuration) * 100}%`, boxShadow: `0 0 8px ${brandColor}66` }} />
      </div>
    </AbsoluteFill>
  );
};
