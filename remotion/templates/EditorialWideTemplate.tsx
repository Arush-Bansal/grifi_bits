import { AbsoluteFill, Easing, OffthreadVideo, Sequence, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import React from "react";

interface Scene {
  image_url?: string | null;
  video_url?: string | null;
  speech?: string;
  id: number;
}

interface EditorialWideProps {
  scenes?: Scene[];
  productName?: string;
  brandColor?: string;
}

export const EditorialWideTemplate: React.FC<EditorialWideProps> = ({
  scenes = [],
  productName = "Product Name",
  brandColor = "#171717",
}) => {
  const { fps } = useVideoConfig();
  const sceneDuration = Math.round(4.0 * fps);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#f5f0e6",
        fontFamily: "Georgia, Times New Roman, serif",
        color: "#1a1a1a",
      }}
    >
      {scenes.map((scene, index) => (
        <Sequence key={scene.id} from={index * sceneDuration} durationInFrames={sceneDuration}>
          <EditorialScene
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

const EditorialScene: React.FC<{
  scene: Scene;
  productName: string;
  brandColor: string;
  sceneIndex: number;
  totalScenes: number;
}> = ({ scene, productName, brandColor, sceneIndex, totalScenes }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sceneDuration = Math.round(4.0 * fps);
  const copy = scene.speech?.trim() || "Crafted with intention. Designed to endure.";

  // Slow crossfade (calm tempo)
  const opacity = interpolate(frame, [0, 16, sceneDuration - 16, sceneDuration], [0, 1, 1, 0], {
    extrapolateRight: "clamp",
  });

  // Words for typewriter stagger
  const words = copy.split(/\s+/);
  const framesPerWord = 3;

  // Underline draws on
  const underlineWidth = interpolate(frame, [8 + words.length * framesPerWord, 8 + words.length * framesPerWord + 16], [0, 100], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  // Product circle slides in from right
  const circleSpring = spring({ frame: frame - 6, fps, config: { damping: 16, stiffness: 100, mass: 0.9 } });
  const circleX = interpolate(circleSpring, [0, 1], [80, 0]);
  const circleOpacity = interpolate(circleSpring, [0, 1], [0, 1]);

  // Product image Ken Burns (very slow for calm feel)
  const imageScale = interpolate(frame, [0, sceneDuration], [1.0, 1.03], {
    easing: Easing.out(Easing.cubic),
  });

  // Subtle paper texture shimmer
  const shimmerPos = interpolate(frame, [0, sceneDuration], [-10, 110], {
    easing: Easing.inOut(Easing.cubic),
  });

  return (
    <AbsoluteFill style={{ opacity }}>
      {/* Warm cream background with subtle grain noise */}
      <AbsoluteFill
        style={{
          background: "linear-gradient(135deg, #f5f0e6 0%, #efe8d8 50%, #f5f0e6 100%)",
        }}
      />

      {/* Subtle paper shimmer */}
      <AbsoluteFill
        style={{
          background: `linear-gradient(115deg, transparent ${shimmerPos - 8}%, rgba(255,255,255,0.3) ${shimmerPos}%, transparent ${shimmerPos + 8}%)`,
          pointerEvents: "none",
        }}
      />

      {/* Scene number (top-left, monospace) */}
      <div
        style={{
          position: "absolute",
          top: "8%",
          left: "6%",
          fontSize: 14,
          fontFamily: "Courier, monospace",
          color: "#999",
          letterSpacing: "0.12em",
        }}
      >
        {`0${sceneIndex + 1} / 0${totalScenes}`}
      </div>

      {/* Main text area (left 60%) */}
      <div
        style={{
          position: "absolute",
          left: "6%",
          top: "20%",
          width: "55%",
          bottom: "18%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        {/* Typewriter word stagger */}
        <div
          style={{
            fontSize: 52,
            lineHeight: 1.25,
            fontWeight: 400,
            color: "#1a1a1a",
          }}
        >
          {words.map((word, i) => {
            const wordStart = 8 + i * framesPerWord;
            const wordOpacity = interpolate(frame, [wordStart, wordStart + framesPerWord], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
            return (
              <span
                key={i}
                style={{
                  opacity: wordOpacity,
                  display: "inline",
                }}
              >
                {word}{" "}
              </span>
            );
          })}
        </div>

        {/* Animated underline */}
        <div
          style={{
            marginTop: 20,
            height: 3,
            backgroundColor: brandColor === "#171717" ? "#1a1a1a" : brandColor,
            width: `${underlineWidth}%`,
            maxWidth: 260,
            borderRadius: 2,
          }}
        />
      </div>

      {/* Small circular product image (top-right) */}
      <div
        style={{
          position: "absolute",
          top: "12%",
          right: "8%",
          width: 140,
          height: 140,
          borderRadius: "50%",
          overflow: "hidden",
          border: "3px solid rgba(26,26,26,0.1)",
          boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
          transform: `translateX(${circleX}px) scale(${imageScale})`,
          opacity: circleOpacity,
        }}
      >
        {scene.video_url ? (
          <OffthreadVideo src={scene.video_url} muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : scene.image_url ? (
          <img src={scene.image_url} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" crossOrigin="anonymous" />
        ) : (
          <div style={{ width: "100%", height: "100%", background: `linear-gradient(135deg, #e0d8c8 0%, #c8c0b0 100%)` }} />
        )}
      </div>

      {/* Product name (bottom-left, small caps) */}
      <div
        style={{
          position: "absolute",
          bottom: "7%",
          left: "6%",
          fontSize: 13,
          fontFamily: "Arial, Helvetica, sans-serif",
          fontWeight: 700,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: "#999",
        }}
      >
        {productName}
      </div>

      {/* Thin bottom accent line */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 3,
          backgroundColor: "rgba(26,26,26,0.08)",
        }}
      >
        <div
          style={{
            height: "100%",
            backgroundColor: brandColor === "#171717" ? "#1a1a1a" : brandColor,
            width: `${(frame / sceneDuration) * 100}%`,
            opacity: 0.4,
          }}
        />
      </div>
    </AbsoluteFill>
  );
};
