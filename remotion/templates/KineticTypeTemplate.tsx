import { AbsoluteFill, Easing, OffthreadVideo, Sequence, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import React from "react";

interface Scene {
  image_url?: string | null;
  video_url?: string | null;
  speech?: string;
  id: number;
}

interface KineticTypeProps {
  scenes?: Scene[];
  productName?: string;
  brandColor?: string;
}

export const KineticTypeTemplate: React.FC<KineticTypeProps> = ({
  scenes = [],
  productName = "Product Name",
  brandColor = "#e11d48",
}) => {
  const { fps } = useVideoConfig();
  const sceneDuration = Math.round(3.0 * fps);

  return (
    <AbsoluteFill style={{ backgroundColor: "#0a0a0f", color: "white", fontFamily: "Arial Black, Arial, sans-serif" }}>
      {scenes.map((scene, index) => {
        const startFrame = index * sceneDuration;
        return (
          <Sequence key={scene.id} from={startFrame} durationInFrames={sceneDuration}>
            <KineticScene scene={scene} productName={productName} brandColor={brandColor} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

const KineticScene: React.FC<{ scene: Scene; productName: string; brandColor: string }> = ({
  scene,
  productName,
  brandColor,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sceneDuration = Math.round(3.0 * fps);
  const speech = scene.speech?.trim() || "Bold words speak louder.";

  // Split into words, cap at 8 for timing
  const words = speech.split(/\s+/).slice(0, 8);
  const framesPerWord = Math.max(4, Math.floor((sceneDuration * 0.6) / words.length));

  const opacity = interpolate(frame, [0, 6, sceneDuration - 8, sceneDuration], [0, 1, 1, 0], {
    extrapolateRight: "clamp",
  });

  const lineGrow = interpolate(frame, [8, 28], [0, 1], { extrapolateRight: "clamp" });

  // Image float
  const imageFloat = interpolate(Math.sin(frame / 14), [-1, 1], [-6, 6]);

  return (
    <AbsoluteFill style={{ opacity }}>
      {/* Subtle noise-like radial bg */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse at 50% 80%, ${brandColor}15 0%, transparent 50%),
                       radial-gradient(ellipse at 20% 20%, rgba(255,255,255,0.03) 0%, transparent 40%)`,
        }}
      />

      {/* Product name watermark — top left */}
      <div
        style={{
          position: "absolute",
          top: "5%",
          left: "7%",
          fontSize: 16,
          fontWeight: 700,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.2)",
        }}
      >
        {productName}
      </div>

      {/* Words — hero area */}
      <div
        style={{
          position: "absolute",
          top: "12%",
          left: "7%",
          right: "7%",
          bottom: "38%",
          display: "flex",
          flexWrap: "wrap",
          alignContent: "center",
          gap: "8px 16px",
        }}
      >
        {words.map((word, i) => {
          const wordStart = 4 + i * framesPerWord;
          const wordSpring = spring({
            frame: frame - wordStart,
            fps,
            config: { damping: 14, stiffness: 160, mass: 0.6 },
          });
          const wordY = interpolate(wordSpring, [0, 1], [30, 0]);
          const wordOpacity = interpolate(frame, [wordStart, wordStart + 5], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });

          return (
            <span
              key={i}
              style={{
                fontSize: words.length <= 4 ? 108 : 82,
                fontWeight: 900,
                lineHeight: 1.05,
                color: "#ffffff",
                transform: `translateY(${wordY}px)`,
                opacity: wordOpacity,
                letterSpacing: "-0.02em",
              }}
            >
              {word}
            </span>
          );
        })}
      </div>

      {/* Accent line */}
      <div
        style={{
          position: "absolute",
          left: "7%",
          top: "64%",
          height: 4,
          backgroundColor: brandColor,
          width: `${Math.max(0, 180 * lineGrow)}px`,
          borderRadius: 2,
        }}
      />

      {/* Product image — bottom area, small with glow */}
      <div
        style={{
          position: "absolute",
          bottom: "6%",
          left: "50%",
          transform: `translateX(-50%) translateY(${imageFloat}px)`,
          width: "32%",
          aspectRatio: "1",
          borderRadius: 20,
          overflow: "hidden",
          boxShadow: `0 0 40px ${brandColor}44, 0 20px 40px rgba(0,0,0,0.5)`,
        }}
      >
        {scene.video_url ? (
          <OffthreadVideo
            src={scene.video_url}
            muted
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : scene.image_url ? (
          <img
            src={scene.image_url}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
            alt="Product"
            crossOrigin="anonymous"
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              background: `linear-gradient(135deg, ${brandColor}44 0%, #1a1a2e 100%)`,
            }}
          />
        )}
      </div>
    </AbsoluteFill>
  );
};
