import { AbsoluteFill, Easing, OffthreadVideo, Sequence, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import React from "react";

interface Scene {
  image_url?: string | null;
  video_url?: string | null;
  speech?: string;
  id: number;
}

interface SplitScreenProps {
  scenes?: Scene[];
  productName?: string;
  brandColor?: string;
}

export const SplitScreenTemplate: React.FC<SplitScreenProps> = ({
  scenes = [],
  productName = "Product Name",
  brandColor = "#f97316",
}) => {
  const { fps } = useVideoConfig();
  const sceneDuration = Math.round(3.6 * fps);

  return (
    <AbsoluteFill style={{ backgroundColor: "#05070c" }}>
      {scenes.map((scene, index) => {
        const startFrame = index * sceneDuration;
        return (
          <Sequence key={scene.id} from={startFrame} durationInFrames={sceneDuration}>
            <SplitScene scene={scene} productName={productName} brandColor={brandColor} isEven={index % 2 === 0} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

const SplitScene: React.FC<{ scene: Scene; productName: string; brandColor: string; isEven: boolean }> = ({
  scene,
  productName,
  brandColor,
  isEven,
}) => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const sceneDuration = Math.round(3.6 * fps);
  const copy = scene.speech?.trim() || "Side-by-side proof that this performs better.";

  const enter = interpolate(frame, [0, 16], [0, 1], {
    easing: Easing.out(Easing.cubic),
    extrapolateRight: "clamp",
  });
  const exit = interpolate(frame, [sceneDuration - 14, sceneDuration], [0, 1], {
    easing: Easing.in(Easing.cubic),
    extrapolateLeft: "clamp",
  });
  const mediaShift = (1 - enter) * (isEven ? -90 : 90);
  const copyShift = (1 - enter) * (isEven ? 80 : -80);
  const opacity = 1 - exit;

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        flexDirection: isEven ? "row" : "row-reverse",
        backgroundColor: "#ffffff",
        opacity,
      }}
    >
      <div
        style={{
          flex: 1,
          position: "relative",
          overflow: "hidden",
          transform: `translateX(${mediaShift}px)`,
        }}
      >
        {scene.video_url ? (
          <OffthreadVideo src={scene.video_url} muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : scene.image_url ? (
          <img
            src={scene.image_url}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
            alt="Product"
            crossOrigin="anonymous"
          />
        ) : (
          <AbsoluteFill style={{ background: `linear-gradient(135deg, ${brandColor}55 0%, #0f172a 100%)` }} />
        )}

        <AbsoluteFill
          style={{
            background: "linear-gradient(150deg, rgba(2,6,23,0.06) 0%, rgba(2,6,23,0.44) 90%)",
          }}
        />

        <div
          style={{
            position: "absolute",
            top: "8%",
            left: "7%",
            backgroundColor: "rgba(255,255,255,0.88)",
            color: "#0f172a",
            borderRadius: 9999,
            padding: width > height ? "7px 14px" : "9px 16px",
            fontWeight: 700,
            letterSpacing: "0.07em",
            fontSize: width > height ? 14 : 16,
            textTransform: "uppercase",
          }}
        >
          {`Frame ${scene.id}`}
        </div>
      </div>

      <div
        style={{
          flex: 1,
          backgroundColor: "#0b1220",
          color: "white",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: width > height ? "52px" : "42px",
          transform: `translateX(${copyShift}px)`,
          position: "relative",
          overflow: "hidden",
          fontFamily: "Arial, Helvetica, sans-serif",
        }}
      >
        <AbsoluteFill
          style={{
            background: `radial-gradient(circle at 86% 15%, ${brandColor}2e 0%, transparent 38%)`,
          }}
        />

        <div style={{ position: "relative" }}>
          <div style={{ height: 4, width: 74, backgroundColor: brandColor, marginBottom: 22 }} />
          <h3
            style={{
              margin: 0,
              fontSize: width > height ? 20 : 22,
              textTransform: "uppercase",
              letterSpacing: "0.14em",
              color: "#a9b4c8",
            }}
          >
            {productName}
          </h3>
          <h2
            style={{
              margin: "16px 0 0",
              fontSize: width > height ? 48 : 56,
              fontWeight: 800,
              lineHeight: 1.08,
              letterSpacing: "-0.01em",
              color: "#f8fafc",
            }}
          >
            {copy}
          </h2>

          <div
            style={{
              marginTop: 26,
              border: `1px solid ${brandColor}`,
              borderRadius: 14,
              padding: "12px 14px",
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              backgroundColor: "rgba(11, 18, 32, 0.5)",
            }}
          >
            <span
              style={{
                width: 9,
                height: 9,
                borderRadius: "50%",
                backgroundColor: brandColor,
                display: "inline-block",
              }}
            />
            <span style={{ fontSize: width > height ? 16 : 18, color: "#dbe5f5", fontWeight: 600 }}>
              Built for conversion-focused storytelling
            </span>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
