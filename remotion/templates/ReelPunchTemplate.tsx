import { AbsoluteFill, Easing, OffthreadVideo, Sequence, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import React from "react";
import { LogoOverlay } from "./shared/LogoOverlay";

interface Scene {
  image_url?: string | null;
  video_url?: string | null;
  speech?: string;
  id: number;
}

interface ReelPunchProps {
  scenes?: Scene[];
  productName?: string;
  brandColor?: string;
  bgColor?: string;
  fontFamily?: string;
  logoUrl?: string;
  ctaText?: string;
}

export const ReelPunchTemplate: React.FC<ReelPunchProps> = ({
  scenes = [],
  productName = "Product Name",
  brandColor = "#22c55e",
  bgColor,
  fontFamily,
  logoUrl,
  ctaText,
}) => {
  const { fps } = useVideoConfig();
  const sceneDuration = Math.round(2.4 * fps);

  return (
    <AbsoluteFill style={{ backgroundColor: bgColor || "#000", fontFamily: fontFamily || "Arial Black, Arial, sans-serif", color: "#fff" }}>
      {scenes.map((scene, index) => (
        <Sequence key={scene.id} from={index * sceneDuration} durationInFrames={sceneDuration}>
          <PunchScene
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

const PunchScene: React.FC<{
  scene: Scene;
  productName: string;
  brandColor: string;
  sceneIndex: number;
  totalScenes: number;
}> = ({ scene, productName, brandColor, sceneIndex }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sceneDuration = Math.round(2.4 * fps);
  const copy = scene.speech?.trim() || "GET IT NOW";

  // Very fast crossfade (3 frames)
  const opacity = interpolate(frame, [0, 3, sceneDuration - 3, sceneDuration], [0, 1, 1, 0], {
    extrapolateRight: "clamp",
  });

  // White flash frame on entry
  const flashOpacity = interpolate(frame, [0, 1, 3], [1, 0.8, 0], {
    extrapolateRight: "clamp",
  });

  // Camera shake
  const shakeX = Math.sin(frame * 1.3) * 3;
  const shakeY = Math.cos(frame * 1.7) * 2;

  // Zoom punch: quick scale up then settle
  const zoomPunch = frame < 12
    ? interpolate(frame, [0, 6, 12], [1.0, 1.15, 1.08], {
        easing: Easing.out(Easing.cubic),
        extrapolateRight: "clamp",
      })
    : interpolate(frame, [12, sceneDuration], [1.08, 1.12], {
        easing: Easing.out(Easing.cubic),
      });

  // Text slam: spring with high stiffness
  const textSpring = spring({ frame: frame - 4, fps, config: { damping: 7, stiffness: 260, mass: 0.5 } });
  const textScale = interpolate(textSpring, [0, 1], [1.4, 1.0]);
  const textOpacity = interpolate(textSpring, [0, 1], [0, 1]);

  // Backing strip width grows
  const stripWidth = interpolate(frame, [3, 12], [0, 100], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  return (
    <AbsoluteFill style={{ opacity }}>
      {/* Full-bleed product image with camera shake + zoom punch */}
      <AbsoluteFill
        style={{
          transform: `scale(${zoomPunch}) translate(${shakeX}px, ${shakeY}px)`,
        }}
      >
        {scene.video_url ? (
          <OffthreadVideo src={scene.video_url} muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : scene.image_url ? (
          <img src={scene.image_url} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" crossOrigin="anonymous" />
        ) : (
          <div style={{ width: "100%", height: "100%", background: `linear-gradient(135deg, ${brandColor}66 0%, #000 100%)` }} />
        )}
      </AbsoluteFill>

      {/* White flash overlay */}
      <AbsoluteFill
        style={{
          backgroundColor: "#fff",
          opacity: flashOpacity,
          pointerEvents: "none",
        }}
      />

      {/* Heavy dark vignette */}
      <AbsoluteFill
        style={{
          background: "radial-gradient(ellipse at 50% 50%, transparent 30%, rgba(0,0,0,0.7) 100%)",
        }}
      />

      {/* Bottom gradient for text readability */}
      <AbsoluteFill
        style={{
          background: "linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.6) 70%, rgba(0,0,0,0.85) 100%)",
        }}
      />

      {/* Center text strip: colored backing rectangle + bold text */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: `translate(-50%, -50%) scale(${textScale})`,
          opacity: textOpacity,
          textAlign: "center",
          zIndex: 10,
        }}
      >
        {/* Colored backing strip */}
        <div
          style={{
            position: "absolute",
            top: "-10%",
            bottom: "-10%",
            left: `${(100 - stripWidth) / 2}%`,
            right: `${(100 - stripWidth) / 2}%`,
            backgroundColor: brandColor,
            borderRadius: 8,
            zIndex: -1,
            boxShadow: `0 0 30px ${brandColor}88`,
          }}
        />
        <p
          style={{
            margin: 0,
            fontSize: 64,
            fontWeight: 900,
            lineHeight: 1.0,
            textTransform: "uppercase",
            letterSpacing: "0.02em",
            padding: "16px 32px",
            textShadow: "0 4px 16px rgba(0,0,0,0.5)",
            whiteSpace: "nowrap",
          }}
        >
          {copy.length > 25 ? copy.slice(0, 25) : copy}
        </p>
      </div>

      {/* Product name (very small, bottom-right, low opacity) — intentionally minimal chrome */}
      <div
        style={{
          position: "absolute",
          bottom: "3%",
          right: "4%",
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.3)",
        }}
      >
        {productName}
      </div>
    </AbsoluteFill>
  );
};
