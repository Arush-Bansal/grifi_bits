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
    <AbsoluteFill style={{ backgroundColor: "#07080e", fontFamily: "Arial, Helvetica, sans-serif" }}>
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

  // Continuous Ken Burns zoom on card image (cinematic feel)
  const cardMediaScale = interpolate(frame, [0, sceneDuration], [1.0, 1.14], {
    easing: Easing.out(Easing.cubic),
  });

  // Background Ken Burns (blurred bg also moves)
  const bgScale = interpolate(frame, [0, sceneDuration], [1.25, 1.35], {
    easing: Easing.out(Easing.cubic),
  });
  const bgRotate = interpolate(frame, [0, sceneDuration], [-1, 1.5]);

  // Card glow pulse
  const glowIntensity = interpolate(Math.sin(frame / 12), [-1, 1], [0.3, 0.7]);

  // Text entrance with spring
  const textSpring = spring({ frame: frame - 14, fps, config: { damping: 13, stiffness: 140, mass: 0.7 } });
  const textY = interpolate(textSpring, [0, 1], [24, 0]);
  const textOpacity = interpolate(textSpring, [0, 1], [0, 1]);

  // Product name pill entrance
  const pillSpring = spring({ frame: frame - 8, fps, config: { damping: 12, stiffness: 200 } });
  const pillScale = interpolate(pillSpring, [0, 1], [0.7, 1]);

  // Shimmer sweep on card
  const shimmerPos = interpolate(frame, [6, sceneDuration - 6], [-20, 120], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill>
      {/* Blurred background from scene image with Ken Burns */}
      <AbsoluteFill
        style={{
          filter: "blur(50px) brightness(0.25)",
          transform: `scale(${bgScale}) rotate(${bgRotate}deg)`,
        }}
      >
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
              background: `linear-gradient(135deg, ${brandColor}66 0%, #0a0e1a 100%)`,
            }}
          />
        )}
      </AbsoluteFill>

      {/* Dark cinematic overlay */}
      <AbsoluteFill style={{ backgroundColor: "rgba(0,0,0,0.35)" }} />

      {/* Ambient radial glow from brand color */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at 50% 40%, ${brandColor}18 0%, transparent 50%)`,
        }}
      />

      {/* Card */}
      <div
        style={{
          position: "absolute",
          top: "5%",
          bottom: "9%",
          left: "5%",
          right: "5%",
          transform: `translateX(${cardX}px)`,
          opacity: cardOpacity,
          borderRadius: 28,
          backgroundColor: "rgba(18,20,30,0.85)",
          border: "1px solid rgba(255,255,255,0.1)",
          boxShadow: `0 24px 60px rgba(0,0,0,0.5), 0 0 ${40 * glowIntensity}px ${brandColor}22`,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          backdropFilter: "blur(20px)",
        }}
      >
        {/* Card media — top 58% with continuous Ken Burns */}
        <div
          style={{
            flex: "0 0 58%",
            overflow: "hidden",
            position: "relative",
          }}
        >
          <div
            style={{
              transform: `translateX(${parallaxX}px) scale(${cardMediaScale})`,
              width: "110%",
              height: "110%",
              marginLeft: "-5%",
              marginTop: "-5%",
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
                  background: `linear-gradient(135deg, ${brandColor}44 0%, #1a1e2e 100%)`,
                }}
              />
            )}
          </div>

          {/* Cinematic vignette on card image */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(180deg, rgba(0,0,0,0.15) 0%, transparent 30%, transparent 60%, rgba(18,20,30,0.6) 100%)",
            }}
          />

          {/* Shimmer sweep */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: `linear-gradient(110deg, transparent ${shimmerPos - 12}%, rgba(255,255,255,0.08) ${shimmerPos}%, transparent ${shimmerPos + 12}%)`,
              pointerEvents: "none",
            }}
          />

          {/* Product name pill on card with spring */}
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
              transform: `scale(${pillScale})`,
              boxShadow: `0 4px 16px ${brandColor}66`,
            }}
          >
            {productName}
          </div>
        </div>

        {/* Card text — bottom 42% with spring entrance */}
        <div
          style={{
            flex: 1,
            padding: "32px 28px",
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
              fontSize: 36,
              fontWeight: 800,
              lineHeight: 1.2,
              color: "#f0f2f8",
              letterSpacing: "-0.01em",
              textShadow: "0 2px 12px rgba(0,0,0,0.4)",
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

      {/* Top progress bar */}
      <div
        style={{
          position: "absolute",
          top: 0,
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
            width: `${(frame / sceneDuration) * 100}%`,
            boxShadow: `0 0 10px ${brandColor}88`,
          }}
        />
      </div>
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
        bottom: "3%",
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
              width: isActive ? 14 : 8,
              height: isActive ? 14 : 8,
              borderRadius: "50%",
              backgroundColor: isActive ? brandColor : "rgba(255,255,255,0.3)",
              transform: `scale(${dotScale})`,
              boxShadow: isActive ? `0 0 8px ${brandColor}88` : "none",
              transition: "width 0.2s, height 0.2s",
            }}
          />
        );
      })}
    </div>
  );
};
