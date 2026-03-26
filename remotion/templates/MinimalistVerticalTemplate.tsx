import { AbsoluteFill, Easing, OffthreadVideo, Series, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import React from "react";

interface Scene {
  image_url?: string | null;
  video_url?: string | null;
  speech?: string;
  id: number;
}

interface MinimalistVerticalProps {
  scenes?: Scene[];
  productName?: string;
  brandColor?: string;
}

export const MinimalistVerticalTemplate: React.FC<MinimalistVerticalProps> = ({
  scenes = [],
  productName = "Product Name",
  brandColor = "#18181b",
}) => {
  const { fps } = useVideoConfig();
  const sceneDuration = Math.round(4.0 * fps);

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(168deg, #f8fafc 0%, #ffffff 50%, #eef2f7 100%)",
        color: "#101828",
        fontFamily: "Georgia, Times New Roman, serif",
      }}
    >
      <Series>
        {scenes.map((scene, index) => (
          <Series.Sequence key={scene.id} durationInFrames={sceneDuration}>
            <MinimalistVerticalScene
              scene={scene}
              productName={productName}
              brandColor={brandColor}
              sceneIndex={index}
              totalScenes={scenes.length}
            />
          </Series.Sequence>
        ))}
      </Series>
    </AbsoluteFill>
  );
};

const MinimalistVerticalScene: React.FC<{
  scene: Scene;
  productName: string;
  brandColor: string;
  sceneIndex: number;
  totalScenes: number;
}> = ({ scene, productName, brandColor, sceneIndex, totalScenes }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sceneDuration = Math.round(4.0 * fps);
  const copy = scene.speech?.trim() || "Refined form. Thoughtful function.";

  const opacity = interpolate(frame, [0, 14, sceneDuration - 12, sceneDuration], [0, 1, 1, 0], {
    extrapolateRight: "clamp",
  });
  const mediaScale = interpolate(frame, [0, sceneDuration], [1.03, 1], {
    easing: Easing.out(Easing.cubic),
  });
  const textY = interpolate(frame, [0, 18], [22, 0], {
    easing: Easing.out(Easing.cubic),
    extrapolateRight: "clamp",
  });
  const lineGrow = interpolate(frame, [0, 24], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ opacity }}>
      {/* Subtle radial highlight */}
      <AbsoluteFill
        style={{
          background: "radial-gradient(circle at 50% 20%, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 50%)",
        }}
      />

      {/* Product name header */}
      <div
        style={{
          position: "absolute",
          top: "4.5%",
          left: 0,
          right: 0,
          textAlign: "center",
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          fontSize: 16,
          fontFamily: "Arial, Helvetica, sans-serif",
          color: "#667085",
        }}
      >
        {productName}
      </div>

      {/* Media area — top 55% */}
      <div
        style={{
          position: "absolute",
          top: "9%",
          left: 0,
          right: 0,
          height: "52%",
          overflow: "hidden",
          borderBottom: "1px solid rgba(15, 23, 42, 0.08)",
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
              background: `linear-gradient(145deg, ${brandColor}18 0%, #dbe4ef 100%)`,
            }}
          />
        )}
      </div>

      {/* Accent line divider */}
      <div
        style={{
          position: "absolute",
          top: "63%",
          left: "50%",
          transform: "translateX(-50%)",
          height: 2,
          backgroundColor: brandColor,
          width: `${Math.max(16, 64 * lineGrow)}px`,
        }}
      />

      {/* Text area — bottom 35% */}
      <div
        style={{
          position: "absolute",
          left: "8%",
          right: "8%",
          bottom: "8%",
          top: "66%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
          transform: `translateY(${textY}px)`,
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: 38,
            lineHeight: 1.3,
            color: "#334155",
            maxWidth: 900,
            fontStyle: "italic",
          }}
        >
          {copy}
        </p>
        <p
          style={{
            marginTop: 18,
            marginBottom: 0,
            fontSize: 15,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            fontFamily: "Arial, Helvetica, sans-serif",
            color: "#64748b",
          }}
        >
          {`0${sceneIndex + 1} / 0${totalScenes}`}
        </p>
      </div>

      {/* Decorative dot */}
      <div
        style={{
          position: "absolute",
          right: "7%",
          top: "10%",
          width: 16,
          height: 16,
          borderRadius: "50%",
          backgroundColor: brandColor,
          opacity: 0.45,
        }}
      />
    </AbsoluteFill>
  );
};
