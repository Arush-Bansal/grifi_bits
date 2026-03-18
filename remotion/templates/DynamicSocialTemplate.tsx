import { AbsoluteFill, Easing, OffthreadVideo, Sequence, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import React from "react";

interface Scene {
  image_url?: string | null;
  video_url?: string | null;
  speech?: string;
  id: number;
}

interface DynamicSocialProps {
  scenes?: Scene[];
  productName?: string;
  brandColor?: string;
}

export const DynamicSocialTemplate: React.FC<DynamicSocialProps> = ({
  scenes = [],
  productName = "Product Name",
  brandColor = "#f97316",
}) => {
  const { fps } = useVideoConfig();
  const sceneDuration = Math.round(2.8 * fps);

  return (
    <AbsoluteFill style={{ backgroundColor: "#03040a", color: "white", fontFamily: "Arial Black, Arial, sans-serif" }}>
      {scenes.map((scene, index) => {
        const startFrame = index * sceneDuration;
        return (
          <Sequence key={scene.id} from={startFrame} durationInFrames={sceneDuration}>
            <DynamicScene 
              scene={scene} 
              productName={productName} 
              brandColor={brandColor} 
            />
          </Sequence>
        );
      })}
      
      {/* Global Progress Bar (Top) */}
      <ProgressBar brandColor={brandColor} totalScenes={scenes.length} sceneDuration={sceneDuration} />
    </AbsoluteFill>
  );
};

const DynamicScene: React.FC<{ scene: Scene; productName: string; brandColor: string }> = ({
  scene,
  productName,
  brandColor,
}) => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const sceneDuration = Math.round(2.8 * fps);
  const copy = scene.speech?.trim() || "Fast. Fresh. Delivered now.";

  const entrance = spring({ frame, fps, config: { damping: 13, mass: 0.8 } });
  const textY = interpolate(entrance, [0, 1], [40, 0]);
  const textScale = interpolate(entrance, [0, 1], [0.95, 1]);
  const bgScale = interpolate(frame, [0, sceneDuration], [1.06, 1], { easing: Easing.out(Easing.cubic) });
  const bgRotate = interpolate(frame, [0, sceneDuration], [-1.6, 1.1]);
  const opacity = interpolate(frame, [0, 5, sceneDuration - 10, sceneDuration], [0, 1, 1, 0]);
  const stickerTwist = interpolate(Math.sin(frame / 10), [-1, 1], [-4, 4]);

  return (
    <AbsoluteFill style={{ opacity }}>
      <AbsoluteFill style={{ transform: `scale(${bgScale}) rotate(${bgRotate}deg)` }}>
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
          <AbsoluteFill
            style={{
              background: `linear-gradient(135deg, ${brandColor} 0%, #1b2149 45%, #03040a 100%)`,
            }}
          />
        )}
      </AbsoluteFill>

      <AbsoluteFill
        style={{
          background:
            "linear-gradient(180deg, rgba(2,6,23,0.14) 0%, rgba(2,6,23,0.6) 52%, rgba(2,6,23,0.86) 100%)",
        }}
      />

      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at 82% 18%, ${brandColor}40 0%, transparent 30%)`,
        }}
      />

      <div
        style={{
          position: "absolute",
          top: "8%",
          right: "6%",
          backgroundColor: brandColor,
          color: "#ffffff",
          padding: width > height ? "8px 14px" : "10px 18px",
          borderRadius: 14,
          fontWeight: 900,
          fontSize: width > height ? 18 : 22,
          transform: `rotate(${stickerTwist}deg)`,
          letterSpacing: "0.04em",
          boxShadow: "0 10px 22px rgba(0,0,0,0.3)",
        }}
      >
        TRENDING
      </div>

      <div
        style={{
          position: "absolute",
          bottom: "9%",
          left: "6%",
          right: "6%",
          transform: `translateY(${textY}px) scale(${textScale})`,
        }}
      >
        <div
          style={{
            display: "inline-block",
            backgroundColor: "rgba(0, 0, 0, 0.45)",
            border: `2px solid ${brandColor}`,
            color: "#f4f7ff",
            padding: width > height ? "8px 16px" : "10px 18px",
            fontSize: width > height ? 18 : 21,
            fontWeight: 900,
            textTransform: "uppercase",
            marginBottom: 14,
            letterSpacing: "0.08em",
            borderRadius: 12,
            backdropFilter: "blur(8px)",
          }}
        >
          {productName}
        </div>

        <h2
          style={{
            fontSize: width > height ? 56 : 72,
            lineHeight: 1.02,
            fontWeight: 900,
            margin: 0,
            color: "#ffffff",
            textShadow: "0 8px 24px rgba(0,0,0,0.45)",
            letterSpacing: "-0.01em",
          }}
        >
          {copy}
        </h2>
      </div>
    </AbsoluteFill>
  );
};

const ProgressBar: React.FC<{ brandColor: string; totalScenes: number; sceneDuration: number }> = ({ brandColor, totalScenes, sceneDuration }) => {
  const frame = useCurrentFrame();
  const totalDuration = Math.max(1, totalScenes * sceneDuration);
  const progress = (frame / totalDuration) * 100;

  return (
    <div style={{
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      height: "8px",
      backgroundColor: "rgba(255,255,255,0.2)",
    }}>
      <div style={{
        height: "100%",
        width: `${progress}%`,
        backgroundColor: brandColor,
        transition: "width 0.1s linear",
      }} />
    </div>
  );
};
