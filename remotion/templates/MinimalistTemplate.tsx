import { AbsoluteFill, Easing, OffthreadVideo, Series, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import React from "react";

interface Scene {
  image_url?: string | null;
  video_url?: string | null;
  speech?: string;
  id: number;
}

interface MinimalistProps {
  scenes?: Scene[];
  productName?: string;
  brandColor?: string;
}

export const MinimalistTemplate: React.FC<MinimalistProps> = ({
  scenes = [],
  productName = "Product Name",
  brandColor = "#18181b",
}) => {
  const { fps } = useVideoConfig();
  const sceneDuration = Math.round(4.2 * fps);

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(145deg, #f8fafc 0%, #ffffff 56%, #eef2f7 100%)",
        color: "#101828",
        fontFamily: "Georgia, Times New Roman, serif",
      }}
    >
      <Series>
        {scenes.map((scene) => (
          <Series.Sequence key={scene.id} durationInFrames={sceneDuration}>
            <MinimalistScene scene={scene} productName={productName} brandColor={brandColor} />
          </Series.Sequence>
        ))}
      </Series>
    </AbsoluteFill>
  );
};

const MinimalistScene: React.FC<{ scene: Scene; productName: string; brandColor: string }> = ({
  scene,
  productName,
  brandColor,
}) => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const sceneDuration = Math.round(4.2 * fps);
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
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(circle at 15% 16%, rgba(255,255,255,0.75) 0%, rgba(255,255,255,0) 42%)",
        }}
      />

      <div
        style={{
          position: "absolute",
          top: "8%",
          left: "8%",
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          fontSize: width > height ? 13 : 18,
          fontFamily: "Arial, Helvetica, sans-serif",
          color: "#667085",
        }}
      >
        Editorial Product Story
      </div>

      <div
        style={{
          position: "absolute",
          inset: width > height ? "13% 10% 24% 10%" : "14% 7% 30% 7%",
          overflow: "hidden",
          borderRadius: 2,
          border: "1px solid rgba(15, 23, 42, 0.12)",
          boxShadow: "0 24px 60px rgba(15, 23, 42, 0.14)",
          backgroundColor: "#f9fafb",
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
              background: `linear-gradient(125deg, ${brandColor}22 0%, #dbe4ef 100%)`,
            }}
          />
        )}
      </div>

      <div
        style={{
          position: "absolute",
          left: "10%",
          right: "10%",
          bottom: "9%",
          transform: `translateY(${textY}px)`,
          textAlign: "center",
        }}
      >
        <h2
          style={{
            margin: 0,
            fontSize: width > height ? 34 : 44,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            fontWeight: 500,
            color: "#0f172a",
          }}
        >
          {productName}
        </h2>
        <div
          style={{
            height: 2,
            margin: "14px auto 18px",
            backgroundColor: brandColor,
            width: `${Math.max(18, 56 * lineGrow)}px`,
          }}
        />
        <p
          style={{
            margin: 0,
            fontSize: width > height ? 24 : 32,
            lineHeight: 1.3,
            color: "#334155",
            maxWidth: 960,
            marginLeft: "auto",
            marginRight: "auto",
            fontStyle: "italic",
          }}
        >
          {copy}
        </p>
        <p
          style={{
            marginTop: 12,
            marginBottom: 0,
            fontSize: width > height ? 13 : 16,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            fontFamily: "Arial, Helvetica, sans-serif",
            color: "#64748b",
          }}
        >
          {`0${scene.id} / ${Math.max(1, scene.id)}`}
        </p>
      </div>

      <div
        style={{
          position: "absolute",
          right: width > height ? "8.2%" : "9%",
          top: width > height ? "17%" : "20%",
          width: width > height ? 14 : 18,
          height: width > height ? 14 : 18,
          borderRadius: "50%",
          backgroundColor: brandColor,
          opacity: 0.5,
        }}
      />
    </AbsoluteFill>
  );
};
