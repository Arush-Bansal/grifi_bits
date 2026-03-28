import { AbsoluteFill, Easing, OffthreadVideo, Sequence, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import React from "react";
import { LogoOverlay } from "./shared/LogoOverlay";

interface Scene {
  image_url?: string | null;
  video_url?: string | null;
  speech?: string;
  id: number;
}

interface SpecGridProps {
  scenes?: Scene[];
  productName?: string;
  brandColor?: string;
  bgColor?: string;
  fontFamily?: string;
  logoUrl?: string;
  ctaText?: string;
}

export const SpecGridTemplate: React.FC<SpecGridProps> = ({
  scenes = [],
  productName = "Product Name",
  brandColor = "#06b6d4",
  bgColor,
  fontFamily,
  logoUrl,
  ctaText,
}) => {
  const { fps } = useVideoConfig();
  const sceneDuration = Math.round(3.8 * fps);

  return (
    <AbsoluteFill style={{ backgroundColor: bgColor || "#040810", fontFamily: fontFamily || "Arial, Helvetica, sans-serif", color: "#fff" }}>
      {scenes.map((scene, index) => (
        <Sequence key={scene.id} from={index * sceneDuration} durationInFrames={sceneDuration}>
          <SpecScene
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

const SpecScene: React.FC<{
  scene: Scene;
  productName: string;
  brandColor: string;
  sceneIndex: number;
  totalScenes: number;
}> = ({ scene, productName, brandColor, sceneIndex, totalScenes }) => {
  const frame = useCurrentFrame();
  const { width, fps } = useVideoConfig();
  const sceneDuration = Math.round(3.8 * fps);
  const speech = scene.speech?.trim() || "Premium quality. Built to last.";

  // Split speech into spec cards (by sentence or period)
  const specLines = speech.split(/[.!]/).filter(s => s.trim().length > 0).slice(0, 3);
  if (specLines.length === 0) specLines.push(speech);

  // Scene fade
  const opacity = interpolate(frame, [0, 10, sceneDuration - 12, sceneDuration], [0, 1, 1, 0], {
    extrapolateRight: "clamp",
  });

  // Product image Ken Burns
  const imageScale = interpolate(frame, [0, sceneDuration], [1.0, 1.08], {
    easing: Easing.out(Easing.cubic),
  });

  // Product image slow pan
  const imagePanY = interpolate(frame, [0, sceneDuration], [-4, 4], {
    easing: Easing.inOut(Easing.cubic),
  });

  // Product name + line entrance
  const nameSpring = spring({ frame: frame - 4, fps, config: { damping: 14, stiffness: 120 } });
  const nameOpacity = interpolate(nameSpring, [0, 1], [0, 1]);
  const lineWidth = interpolate(frame, [6, 26], [0, 80], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const leftWidth = width * 0.45;

  return (
    <AbsoluteFill style={{ opacity }}>
      {/* Left column — product image (45%) */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: leftWidth,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            transform: `scale(${imageScale}) translateY(${imagePanY}px)`,
          }}
        >
          {scene.video_url ? (
            <OffthreadVideo src={scene.video_url} muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : scene.image_url ? (
            <img src={scene.image_url} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" crossOrigin="anonymous" />
          ) : (
            <div style={{ width: "100%", height: "100%", background: `linear-gradient(145deg, ${brandColor}33 0%, #0a1020 100%)` }} />
          )}
        </div>

        {/* Vignette on image */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(90deg, transparent 60%, rgba(4,8,16,0.8) 100%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(180deg, rgba(4,8,16,0.3) 0%, transparent 30%, transparent 70%, rgba(4,8,16,0.4) 100%)",
          }}
        />
      </div>

      {/* Right column — spec cards (55%) */}
      <div
        style={{
          position: "absolute",
          left: leftWidth,
          top: 0,
          bottom: 0,
          right: 0,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "0 48px",
          gap: 20,
        }}
      >
        {/* Subtle grid pattern overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
            pointerEvents: "none",
          }}
        />

        {/* Product name + accent line */}
        <div style={{ marginBottom: 12, opacity: nameOpacity }}>
          <div
            style={{
              fontSize: 16,
              fontWeight: 800,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: brandColor,
              marginBottom: 8,
            }}
          >
            {productName}
          </div>
          <div
            style={{
              height: 3,
              backgroundColor: brandColor,
              width: lineWidth,
              boxShadow: `0 0 8px ${brandColor}66`,
            }}
          />
        </div>

        {/* Spec cards */}
        {specLines.map((line, i) => {
          const cardDelay = 10 + i * 8;
          const cardSpring = spring({ frame: frame - cardDelay, fps, config: { damping: 13, stiffness: 130, mass: 0.7 } });
          const cardX = interpolate(cardSpring, [0, 1], [60, 0]);
          const cardOpacity = interpolate(cardSpring, [0, 1], [0, 1]);

          // Accent bar height grows
          const barHeight = interpolate(frame, [cardDelay + 6, cardDelay + 16], [0, 100], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });

          return (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "stretch",
                gap: 16,
                transform: `translateX(${cardX}px)`,
                opacity: cardOpacity,
                backgroundColor: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 16,
                padding: "20px 24px",
                backdropFilter: "blur(8px)",
              }}
            >
              {/* Accent bar */}
              <div
                style={{
                  width: 4,
                  borderRadius: 4,
                  backgroundColor: brandColor,
                  alignSelf: "stretch",
                  clipPath: `inset(${100 - barHeight}% 0 0 0)`,
                  boxShadow: `0 0 6px ${brandColor}66`,
                }}
              />

              {/* Card content */}
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: brandColor,
                    marginBottom: 6,
                    opacity: 0.8,
                  }}
                >
                  FEATURE {i + 1}
                </div>
                <p
                  style={{
                    margin: 0,
                    fontSize: 24,
                    fontWeight: 700,
                    lineHeight: 1.25,
                    color: "#e0e4ec",
                  }}
                >
                  {line.trim()}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Scene counter bottom-right */}
      <div
        style={{
          position: "absolute",
          bottom: "4%",
          right: "4%",
          fontSize: 14,
          fontWeight: 600,
          color: "rgba(255,255,255,0.3)",
          letterSpacing: "0.1em",
        }}
      >
        {`0${sceneIndex + 1} / 0${totalScenes}`}
      </div>

      {/* Progress bar */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 4, backgroundColor: "rgba(255,255,255,0.06)" }}>
        <div style={{ height: "100%", backgroundColor: brandColor, width: `${(frame / sceneDuration) * 100}%`, boxShadow: `0 0 8px ${brandColor}66` }} />
      </div>
    </AbsoluteFill>
  );
};
