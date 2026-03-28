import { AbsoluteFill, Easing, OffthreadVideo, Sequence, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import React from "react";
import { LogoOverlay } from "./shared/LogoOverlay";

interface Scene {
  image_url?: string | null;
  video_url?: string | null;
  speech?: string;
  id: number;
}

interface UnboxRevealProps {
  scenes?: Scene[];
  productName?: string;
  brandColor?: string;
  bgColor?: string;
  fontFamily?: string;
  logoUrl?: string;
  ctaText?: string;
}

export const UnboxRevealTemplate: React.FC<UnboxRevealProps> = ({
  scenes = [],
  productName = "Product Name",
  brandColor = "#a855f7",
  bgColor,
  fontFamily,
  logoUrl,
  ctaText,
}) => {
  const { fps } = useVideoConfig();
  const sceneDuration = Math.round(3.2 * fps);

  return (
    <AbsoluteFill style={{ backgroundColor: bgColor || "#08060e", fontFamily: fontFamily || "Arial, Helvetica, sans-serif", color: "#fff" }}>
      {scenes.map((scene, index) => (
        <Sequence key={scene.id} from={index * sceneDuration} durationInFrames={sceneDuration}>
          <RevealScene
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

const RevealScene: React.FC<{
  scene: Scene;
  productName: string;
  brandColor: string;
  sceneIndex: number;
  totalScenes: number;
}> = ({ scene, productName, brandColor, sceneIndex, totalScenes }) => {
  const frame = useCurrentFrame();
  const { height, fps } = useVideoConfig();
  const sceneDuration = Math.round(3.2 * fps);
  const copy = scene.speech?.trim() || "Ready to see something amazing?";

  // Scene fade envelope
  const opacity = interpolate(frame, [0, 6, sceneDuration - 8, sceneDuration], [0, 1, 1, 0], {
    extrapolateRight: "clamp",
  });

  // Curtain reveal: top-down peel (clipPath percentage)
  const revealPercent = interpolate(frame, [10, sceneDuration - 22], [100, 0], {
    easing: Easing.inOut(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Post-reveal product scale pop
  const revealComplete = revealPercent < 5;
  const popSpring = spring({
    frame: revealComplete ? frame - Math.round(sceneDuration * 0.7) : 0,
    fps,
    config: { damping: 10, stiffness: 160, mass: 0.6 },
  });
  const productScale = revealComplete
    ? interpolate(popSpring, [0, 1], [1.06, 1.02])
    : interpolate(frame, [0, sceneDuration], [1.0, 1.06], { easing: Easing.out(Easing.cubic) });

  // Shimmer line scanning top-to-bottom (pre-reveal)
  const shimmerY = interpolate(frame, [0, sceneDuration * 0.65], [0, height], {
    extrapolateRight: "clamp",
  });

  // Speech text spring entrance
  const speechSpring = spring({ frame: frame - Math.round(sceneDuration * 0.5), fps, config: { damping: 12, stiffness: 140 } });
  const speechY = interpolate(speechSpring, [0, 1], [40, 0]);
  const speechOpacity = interpolate(speechSpring, [0, 1], [0, 1]);

  // Sparkle particles (6 dots)
  const sparkles = [
    { x: 15, y: 20, speed: 8, phase: 0 },
    { x: 80, y: 15, speed: 10, phase: 1.5 },
    { x: 25, y: 70, speed: 12, phase: 3 },
    { x: 75, y: 65, speed: 9, phase: 4.5 },
    { x: 50, y: 30, speed: 7, phase: 2 },
    { x: 60, y: 80, speed: 11, phase: 5 },
  ];

  // Product name badge entrance
  const badgeSpring = spring({ frame: frame - 4, fps, config: { damping: 14, stiffness: 180 } });
  const badgeScale = interpolate(badgeSpring, [0, 1], [0.5, 1]);

  return (
    <AbsoluteFill style={{ opacity }}>
      {/* Ambient brandColor radial glow */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse at 50% 50%, ${brandColor}18 0%, transparent 55%)`,
        }}
      />

      {/* Product image layer (revealed as curtain lifts) */}
      <AbsoluteFill
        style={{
          transform: `scale(${productScale})`,
        }}
      >
        {scene.video_url ? (
          <OffthreadVideo src={scene.video_url} muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : scene.image_url ? (
          <img src={scene.image_url} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" crossOrigin="anonymous" />
        ) : (
          <div style={{ width: "100%", height: "100%", background: `linear-gradient(135deg, ${brandColor}44 0%, #0e0a18 100%)` }} />
        )}
      </AbsoluteFill>

      {/* Cinematic vignette */}
      <AbsoluteFill
        style={{
          background: "radial-gradient(ellipse at 50% 50%, transparent 40%, rgba(8,6,14,0.5) 100%)",
        }}
      />

      {/* Curtain layer (dark, animated clipPath shrinking from top) */}
      <AbsoluteFill
        style={{
          clipPath: `inset(0 0 ${100 - revealPercent}% 0)`,
          zIndex: 5,
        }}
      >
        {/* Dark curtain gradient */}
        <AbsoluteFill
          style={{
            background: `linear-gradient(180deg, #08060e 0%, ${brandColor}15 30%, #08060e 100%)`,
          }}
        />

        {/* Question mark / teaser text in curtain */}
        <div
          style={{
            position: "absolute",
            top: "40%",
            left: 0,
            right: 0,
            textAlign: "center",
            fontSize: 120,
            fontWeight: 900,
            color: brandColor,
            opacity: 0.15,
          }}
        >
          ?
        </div>

        {/* Shimmer line scanning down */}
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: shimmerY,
            height: 2,
            background: `linear-gradient(90deg, transparent 5%, ${brandColor}88 30%, white 50%, ${brandColor}88 70%, transparent 95%)`,
            boxShadow: `0 0 20px ${brandColor}66, 0 0 40px ${brandColor}33`,
          }}
        />
      </AbsoluteFill>

      {/* Sparkle particle dots */}
      {sparkles.map((s, i) => {
        const sparkleOpacity = interpolate(
          Math.sin(frame / s.speed + s.phase),
          [-1, 1],
          [0, 0.8]
        );
        const sparkleScale = interpolate(
          Math.sin(frame / s.speed + s.phase),
          [-1, 1],
          [0.5, 1.2]
        );
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${s.x}%`,
              top: `${s.y}%`,
              width: 6,
              height: 6,
              borderRadius: "50%",
              backgroundColor: brandColor,
              opacity: sparkleOpacity,
              transform: `scale(${sparkleScale})`,
              boxShadow: `0 0 8px ${brandColor}88`,
              zIndex: 10,
              pointerEvents: "none",
            }}
          />
        );
      })}

      {/* Product name badge (top-center) */}
      <div
        style={{
          position: "absolute",
          top: "4%",
          left: 0,
          right: 0,
          textAlign: "center",
          zIndex: 15,
        }}
      >
        <span
          style={{
            display: "inline-block",
            padding: "10px 22px",
            borderRadius: 14,
            backgroundColor: `${brandColor}cc`,
            color: "#fff",
            fontSize: 18,
            fontWeight: 800,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            transform: `scale(${badgeScale})`,
            boxShadow: `0 4px 16px ${brandColor}66`,
          }}
        >
          {productName}
        </span>
      </div>

      {/* Speech text (bottom) */}
      <div
        style={{
          position: "absolute",
          bottom: "8%",
          left: "8%",
          right: "8%",
          textAlign: "center",
          transform: `translateY(${speechY}px)`,
          opacity: speechOpacity,
          zIndex: 15,
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: 40,
            fontWeight: 800,
            lineHeight: 1.15,
            textShadow: `0 4px 20px rgba(0,0,0,0.6), 0 0 40px ${brandColor}33`,
          }}
        >
          {copy}
        </p>
      </div>

      {/* Progress bar */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 4, backgroundColor: "rgba(255,255,255,0.08)", zIndex: 20 }}>
        <div style={{ height: "100%", backgroundColor: brandColor, width: `${(frame / sceneDuration) * 100}%`, boxShadow: `0 0 10px ${brandColor}88` }} />
      </div>
    </AbsoluteFill>
  );
};
