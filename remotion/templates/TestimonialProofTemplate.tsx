import { AbsoluteFill, Easing, OffthreadVideo, Sequence, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import React from "react";

interface Scene {
  image_url?: string | null;
  video_url?: string | null;
  speech?: string;
  id: number;
}

interface TestimonialProofProps {
  scenes?: Scene[];
  productName?: string;
  brandColor?: string;
}

export const TestimonialProofTemplate: React.FC<TestimonialProofProps> = ({
  scenes = [],
  productName = "Product Name",
  brandColor = "#f59e0b",
}) => {
  const { fps } = useVideoConfig();
  const sceneDuration = Math.round(3.4 * fps);

  return (
    <AbsoluteFill style={{ backgroundColor: "#0c0a08", fontFamily: "Arial, Helvetica, sans-serif" }}>
      {scenes.map((scene, index) => (
        <Sequence key={scene.id} from={index * sceneDuration} durationInFrames={sceneDuration}>
          <TestimonialScene
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

const TestimonialScene: React.FC<{
  scene: Scene;
  productName: string;
  brandColor: string;
  sceneIndex: number;
  totalScenes: number;
}> = ({ scene, productName, brandColor, sceneIndex, totalScenes }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sceneDuration = Math.round(3.4 * fps);
  const quote = scene.speech?.trim() || "Absolutely love this product. Changed my routine completely!";

  // Scene fade envelope
  const opacity = interpolate(frame, [0, 10, sceneDuration - 10, sceneDuration], [0, 1, 1, 0], {
    extrapolateRight: "clamp",
  });

  // Background image: heavy blur + Ken Burns
  const bgScale = interpolate(frame, [0, sceneDuration], [1.0, 1.1], {
    easing: Easing.out(Easing.cubic),
  });

  // Review card: spring entrance
  const cardSpring = spring({ frame: frame - 6, fps, config: { damping: 14, stiffness: 140, mass: 0.8 } });
  const cardScale = interpolate(cardSpring, [0, 1], [0.85, 1]);
  const cardOpacity = interpolate(cardSpring, [0, 1], [0, 1]);

  // Ambient glow pulse around card
  const glowSpread = interpolate(Math.sin(frame / 16), [-1, 1], [20, 40]);
  const glowOpacity = interpolate(Math.sin(frame / 16), [-1, 1], [0.15, 0.35]);

  // Quote text entrance
  const textSpring = spring({ frame: frame - 16, fps, config: { damping: 13, stiffness: 120 } });
  const textY = interpolate(textSpring, [0, 1], [20, 0]);
  const textOpacity = interpolate(textSpring, [0, 1], [0, 1]);

  // Star rating count (always 5 for social proof)
  const stars = 5;

  return (
    <AbsoluteFill style={{ opacity }}>
      {/* Blurred product image background with Ken Burns */}
      <AbsoluteFill
        style={{
          filter: "blur(30px) brightness(0.3) saturate(0.7)",
          transform: `scale(${bgScale})`,
        }}
      >
        {scene.video_url ? (
          <OffthreadVideo src={scene.video_url} muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : scene.image_url ? (
          <img src={scene.image_url} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" crossOrigin="anonymous" />
        ) : (
          <div style={{ width: "100%", height: "100%", background: `linear-gradient(135deg, ${brandColor}44 0%, #1a1408 100%)` }} />
        )}
      </AbsoluteFill>

      {/* Dark overlay */}
      <AbsoluteFill style={{ backgroundColor: "rgba(12,10,8,0.4)" }} />

      {/* Ambient radial glow */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse at 50% 45%, ${brandColor}20 0%, transparent 55%)`,
        }}
      />

      {/* Product name pill - top */}
      <div
        style={{
          position: "absolute",
          top: "5%",
          left: 0,
          right: 0,
          textAlign: "center",
        }}
      >
        <span
          style={{
            display: "inline-block",
            padding: "8px 20px",
            borderRadius: 9999,
            backgroundColor: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.12)",
            color: "#aaa",
            fontSize: 14,
            fontWeight: 700,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            backdropFilter: "blur(8px)",
          }}
        >
          {productName}
        </span>
      </div>

      {/* Review card */}
      <div
        style={{
          position: "absolute",
          top: "14%",
          bottom: "14%",
          left: "7%",
          right: "7%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 900,
            backgroundColor: "rgba(255,255,255,0.95)",
            borderRadius: 28,
            padding: "48px 40px",
            transform: `scale(${cardScale})`,
            opacity: cardOpacity,
            boxShadow: `0 20px 50px rgba(0,0,0,0.4), 0 0 ${glowSpread}px ${brandColor}${Math.round(glowOpacity * 255).toString(16).padStart(2, "0")}`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 24,
          }}
        >
          {/* Star rating row */}
          <div style={{ display: "flex", gap: 6 }}>
            {Array.from({ length: stars }).map((_, i) => {
              const starDelay = 12 + i * 3;
              const starSpring = spring({ frame: frame - starDelay, fps, config: { damping: 10, stiffness: 200, mass: 0.5 } });
              const starScale = interpolate(starSpring, [0, 1], [0.3, 1]);
              const starOpacity = interpolate(starSpring, [0, 1], [0, 1]);

              return (
                <div
                  key={i}
                  style={{
                    width: 36,
                    height: 36,
                    transform: `scale(${starScale})`,
                    opacity: starOpacity,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 32,
                    color: brandColor,
                  }}
                >
                  ★
                </div>
              );
            })}
          </div>

          {/* Quote mark */}
          <div
            style={{
              fontSize: 72,
              lineHeight: 0.5,
              color: brandColor,
              opacity: 0.3,
              fontFamily: "Georgia, serif",
              marginTop: -8,
            }}
          >
            "
          </div>

          {/* Quote text */}
          <p
            style={{
              margin: 0,
              fontSize: 34,
              fontWeight: 700,
              lineHeight: 1.35,
              color: "#1a1a1a",
              textAlign: "center",
              maxWidth: 700,
              transform: `translateY(${textY}px)`,
              opacity: textOpacity,
              fontStyle: "italic",
            }}
          >
            {quote}
          </p>

          {/* Attribution */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginTop: 8,
              opacity: textOpacity,
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                backgroundColor: brandColor,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontWeight: 800,
                fontSize: 16,
              }}
            >
              {String.fromCharCode(65 + (sceneIndex % 26))}
            </div>
            <span style={{ color: "#666", fontSize: 16, fontWeight: 600 }}>
              Verified Buyer
            </span>
          </div>
        </div>
      </div>

      {/* Bottom progress bar */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 4,
          backgroundColor: "rgba(255,255,255,0.1)",
        }}
      >
        <div
          style={{
            height: "100%",
            backgroundColor: brandColor,
            width: `${((sceneIndex * sceneDuration + frame) / (totalScenes * sceneDuration)) * 100}%`,
            boxShadow: `0 0 8px ${brandColor}88`,
          }}
        />
      </div>
    </AbsoluteFill>
  );
};
