import { AbsoluteFill, Easing, OffthreadVideo, Sequence, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import React from "react";
import { LogoOverlay } from "./shared/LogoOverlay";

interface Scene {
  image_url?: string | null;
  video_url?: string | null;
  speech?: string;
  id: number;
}

interface ProductDemoProps {
  scenes?: Scene[];
  productName?: string;
  brandColor?: string;
  bgColor?: string;
  fontFamily?: string;
  logoUrl?: string;
  ctaText?: string;
}

export const ProductDemoTemplate: React.FC<ProductDemoProps> = ({
  scenes = [],
  productName = "Product Name",
  brandColor = "#f97316",
  bgColor,
  fontFamily,
  logoUrl,
  ctaText,
}) => {
  const { fps, width, height } = useVideoConfig();
  const sceneDurationSeconds = width > height ? 3.4 : 3.2;
  const sceneDuration = Math.round(sceneDurationSeconds * fps);

  return (
    <AbsoluteFill style={{ backgroundColor: bgColor || "#07090c", color: "white", fontFamily: fontFamily || "Arial, Helvetica, sans-serif" }}>
      {scenes.map((scene, index) => {
        const startFrame = index * sceneDuration;
        return (
          <Sequence key={scene.id} from={startFrame} durationInFrames={sceneDuration}>
            <SceneContent
              scene={scene}
              productName={productName}
              brandColor={brandColor}
              isLast={index === scenes.length - 1}
            />
          </Sequence>
        );
      })}
      <LogoOverlay logoUrl={logoUrl} />
    </AbsoluteFill>
  );
};

const SceneContent: React.FC<{ scene: Scene; productName: string; brandColor: string; isLast: boolean }> = ({
  scene,
  productName,
  brandColor,
  isLast,
}) => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const sceneDuration = Math.round((width > height ? 3.4 : 3.2) * fps);
  const copy = scene.speech?.trim() || "Designed for faster, smarter everyday use.";

  const opacity = interpolate(frame, [0, 8, sceneDuration - 12, sceneDuration], [0, 1, 1, 0], { extrapolateRight: "clamp" });
  const mediaScale = interpolate(frame, [0, sceneDuration], [1.04, 1.12], { easing: Easing.out(Easing.cubic) });
  const cardLift = interpolate(frame, [0, 16], [18, 0], { extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  const cardOpacity = interpolate(frame, [0, 14], [0, 1], { extrapolateRight: "clamp" });
  const accentPulse = interpolate(Math.sin(frame / 12), [-1, 1], [0.72, 1]);
  const sceneLabel = `Scene ${scene.id}`;

  return (
    <AbsoluteFill style={{ opacity }}>
      <AbsoluteFill style={{ transform: `scale(${mediaScale})` }}>
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
            alt="Product shot"
            crossOrigin="anonymous"
          />
        ) : (
          <AbsoluteFill
            style={{
              background: `linear-gradient(135deg, ${brandColor} 0%, #0b1220 100%)`,
            }}
          />
        )}
      </AbsoluteFill>

      <AbsoluteFill
        style={{
          background:
            "linear-gradient(160deg, rgba(2,6,23,0.18) 0%, rgba(2,6,23,0.64) 56%, rgba(2,6,23,0.86) 100%)",
        }}
      />

      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at 86% 14%, ${brandColor}33 0%, transparent 34%)`,
        }}
      />

      <div
        style={{
          position: "absolute",
          top: "5%",
          left: "4%",
          border: `1px solid ${brandColor}`,
          color: "#ffffff",
          borderRadius: 9999,
          padding: width > height ? "8px 16px" : "12px 22px",
          fontSize: width > height ? 20 : 24,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          fontWeight: 700,
          backgroundColor: "rgba(0, 0, 0, 0.35)",
          transform: `scale(${accentPulse})`,
        }}
      >
        {sceneLabel}
      </div>

      <AbsoluteFill style={{ justifyContent: "flex-end", padding: "4.5%" }}>
        <div
          style={{
            transform: `translateY(${cardLift}px)`,
            opacity: cardOpacity,
            backgroundColor: "rgba(10, 15, 25, 0.62)",
            backdropFilter: "blur(16px)",
            padding: width > height ? "32px" : "38px",
            borderRadius: width > height ? 24 : 32,
            border: "1px solid rgba(255,255,255,0.16)",
            boxShadow: "0 18px 45px rgba(0,0,0,0.45)",
            display: "grid",
            gridTemplateColumns: width > height ? "1fr auto" : "1fr",
            gap: width > height ? 20 : 12,
            alignItems: "end",
          }}
        >
          <div>
            <h2
              style={{
                fontSize: width > height ? 52 : 68,
                marginBottom: 12,
                marginTop: 0,
                lineHeight: 1.04,
                fontWeight: 800,
                letterSpacing: "-0.01em",
              }}
            >
              {isLast ? "Ready To Order?" : productName}
            </h2>
            <p
              style={{
                margin: 0,
                fontSize: width > height ? 30 : 42,
                lineHeight: 1.22,
                color: "#ebeff6",
                maxWidth: width > height ? "76%" : "100%",
              }}
            >
              {copy}
            </p>
          </div>

          {width > height ? (
            <div
              style={{
                minWidth: 160,
                borderRadius: 16,
                padding: "12px 14px",
                border: `1px solid ${brandColor}`,
                backgroundColor: "rgba(5, 8, 14, 0.65)",
                textAlign: "left",
              }}
            >
              <p
                style={{
                  margin: 0,
                  color: "#b8c2d4",
                  fontSize: 14,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                }}
              >
                Benefit
              </p>
              <p
                style={{
                  margin: "4px 0 0",
                  color: "#ffffff",
                  fontWeight: 700,
                  fontSize: 22,
                }}
              >
                Fast Delivery
              </p>
            </div>
          ) : null}
        </div>
      </AbsoluteFill>

      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 10,
          backgroundColor: "rgba(255,255,255,0.18)",
        }}
      >
        <div
          style={{
            height: "100%",
            backgroundColor: brandColor,
            width: `${(frame / sceneDuration) * 100}%`,
          }}
        />
      </div>
    </AbsoluteFill>
  );
};
