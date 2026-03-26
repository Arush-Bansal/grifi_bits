import { AbsoluteFill, Easing, OffthreadVideo, Sequence, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import React from "react";

interface Scene {
  image_url?: string | null;
  video_url?: string | null;
  speech?: string;
  id: number;
}

interface StoryCardsProps {
  scenes?: Scene[];
  productName?: string;
  brandColor?: string;
}

export const StoryCardsTemplate: React.FC<StoryCardsProps> = ({
  scenes = [],
  productName = "Product Name",
  brandColor = "#8b5cf6",
}) => {
  const { fps } = useVideoConfig();
  const sceneDuration = Math.round(3.0 * fps);

  return (
    <AbsoluteFill style={{ backgroundColor: "#0f0f14", fontFamily: "Arial, Helvetica, sans-serif" }}>
      {scenes.map((scene, index) => {
        const startFrame = index * sceneDuration;
        return (
          <Sequence key={scene.id} from={startFrame} durationInFrames={sceneDuration}>
            <StoryCardScene
              scene={scene}
              productName={productName}
              brandColor={brandColor}
              sceneIndex={index}
              totalScenes={scenes.length}
            />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

const StoryCardScene: React.FC<{
  scene: Scene;
  productName: string;
  brandColor: string;
  sceneIndex: number;
  totalScenes: number;
}> = ({ scene, productName, brandColor, sceneIndex, totalScenes }) => {
  const frame = useCurrentFrame();
  const { width, fps } = useVideoConfig();
  const sceneDuration = Math.round(3.0 * fps);
  const copy = scene.speech?.trim() || "Swipe to discover more.";

  // Card slide entrance from right, exit to left
  const cardX = interpolate(
    frame,
    [0, 12, sceneDuration - 10, sceneDuration],
    [width * 0.35, 0, 0, -width * 0.35],
    { easing: Easing.out(Easing.cubic) }
  );
  const cardOpacity = interpolate(frame, [0, 6, sceneDuration - 6, sceneDuration], [0, 1, 1, 0], {
    extrapolateRight: "clamp",
  });

  // Parallax on inner image (opposite direction)
  const parallaxX = interpolate(frame, [0, 12], [-30, 0], {
    easing: Easing.out(Easing.cubic),
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill>
      {/* Blurred background from scene image */}
      <AbsoluteFill style={{ filter: "blur(40px) brightness(0.3)", transform: "scale(1.2)" }}>
        {scene.image_url ? (
          <img
            src={scene.image_url}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
            alt=""
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
      </AbsoluteFill>

      {/* Dark overlay for contrast */}
      <AbsoluteFill style={{ backgroundColor: "rgba(0,0,0,0.3)" }} />

      {/* Card */}
      <div
        style={{
          position: "absolute",
          top: "6%",
          bottom: "10%",
          left: "6%",
          right: "6%",
          transform: `translateX(${cardX}px)`,
          opacity: cardOpacity,
          borderRadius: 28,
          backgroundColor: "#ffffff",
          boxShadow: "0 24px 60px rgba(0,0,0,0.4)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Card media — top 58% */}
        <div
          style={{
            flex: "0 0 58%",
            overflow: "hidden",
            position: "relative",
          }}
        >
          <div style={{ transform: `translateX(${parallaxX}px)`, width: "110%", height: "100%", marginLeft: "-5%" }}>
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
                  background: `linear-gradient(135deg, ${brandColor}33 0%, #e2e8f0 100%)`,
                }}
              />
            )}
          </div>

          {/* Product name pill on card */}
          <div
            style={{
              position: "absolute",
              top: 20,
              left: 20,
              backgroundColor: brandColor,
              color: "#ffffff",
              padding: "8px 16px",
              borderRadius: 9999,
              fontSize: 16,
              fontWeight: 700,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
            }}
          >
            {productName}
          </div>
        </div>

        {/* Card text — bottom 42% */}
        <div
          style={{
            flex: 1,
            padding: "32px 28px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            textAlign: "center",
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: 36,
              fontWeight: 800,
              lineHeight: 1.2,
              color: "#0f172a",
              letterSpacing: "-0.01em",
            }}
          >
            {copy}
          </p>
        </div>
      </div>

      {/* Dot indicator */}
      <DotIndicator
        totalScenes={totalScenes}
        activeIndex={sceneIndex}
        brandColor={brandColor}
      />
    </AbsoluteFill>
  );
};

const DotIndicator: React.FC<{
  totalScenes: number;
  activeIndex: number;
  brandColor: string;
}> = ({ totalScenes, activeIndex, brandColor }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <div
      style={{
        position: "absolute",
        bottom: "3.5%",
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        gap: 8,
      }}
    >
      {Array.from({ length: totalScenes }).map((_, i) => {
        const isActive = i === activeIndex;
        const dotScale = isActive
          ? spring({ frame, fps, config: { damping: 12, stiffness: 200 } })
          : 1;

        return (
          <div
            key={i}
            style={{
              width: isActive ? 12 : 8,
              height: isActive ? 12 : 8,
              borderRadius: "50%",
              backgroundColor: isActive ? brandColor : "rgba(255,255,255,0.45)",
              transform: `scale(${dotScale})`,
              transition: "width 0.2s, height 0.2s",
            }}
          />
        );
      })}
    </div>
  );
};
