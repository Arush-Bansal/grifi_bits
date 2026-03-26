import { AbsoluteFill, Easing, OffthreadVideo, Sequence, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import React from "react";

interface Scene {
  image_url?: string | null;
  video_url?: string | null;
  speech?: string;
  id: number;
}

interface BeforeAfterProps {
  scenes?: Scene[];
  productName?: string;
  brandColor?: string;
}

export const BeforeAfterTemplate: React.FC<BeforeAfterProps> = ({
  scenes = [],
  productName = "Product Name",
  brandColor = "#10b981",
}) => {
  const { fps } = useVideoConfig();
  const sceneDuration = Math.round(3.8 * fps);

  return (
    <AbsoluteFill style={{ backgroundColor: "#08090e", color: "white", fontFamily: "Arial, Helvetica, sans-serif" }}>
      {scenes.map((scene, index) => {
        const startFrame = index * sceneDuration;
        return (
          <Sequence key={scene.id} from={startFrame} durationInFrames={sceneDuration}>
            <BeforeAfterScene
              scene={scene}
              productName={productName}
              brandColor={brandColor}
              isEven={index % 2 === 0}
            />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

const BeforeAfterScene: React.FC<{
  scene: Scene;
  productName: string;
  brandColor: string;
  isEven: boolean;
}> = ({ scene, productName, brandColor, isEven }) => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const sceneDuration = Math.round(3.8 * fps);
  const copy = scene.speech?.trim() || "See the transformation.";

  const opacity = interpolate(frame, [0, 10, sceneDuration - 10, sceneDuration], [0, 1, 1, 0], {
    extrapolateRight: "clamp",
  });

  // Wipe reveal: starts at 100% covered, reveals to 0%
  const revealPercent = interpolate(frame, [14, sceneDuration - 24], [100, 0], {
    easing: Easing.inOut(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Wipe handle X position
  const handleX = interpolate(revealPercent, [0, 100], [0, width * 0.78]);

  // Label entrance
  const labelSpring = spring({ frame: frame - 6, fps, config: { damping: 12, stiffness: 160 } });
  const labelScale = interpolate(labelSpring, [0, 1], [0.6, 1]);
  const labelOpacity = interpolate(labelSpring, [0, 1], [0, 1]);

  // Text entrance
  const textY = interpolate(frame, [10, 26], [16, 0], {
    easing: Easing.out(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const mediaArea = { top: "6%", left: "4%", right: "4%", bottom: "26%" };

  return (
    <AbsoluteFill style={{ opacity }}>
      {/* Media area */}
      <div
        style={{
          position: "absolute",
          ...mediaArea,
          overflow: "hidden",
          borderRadius: 12,
        }}
      >
        {/* Full color "after" layer (always underneath) */}
        <MediaLayer scene={scene} brandColor={brandColor} />

        {/* Grayscale "before" overlay with animated clip */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            clipPath: `inset(0 0 0 ${100 - revealPercent}%)`,
          }}
        >
          <div style={{ width: "100%", height: "100%", filter: "grayscale(100%) brightness(0.7)" }}>
            <MediaLayer scene={scene} brandColor={brandColor} />
          </div>
        </div>

        {/* Wipe line */}
        <div
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: `${100 - revealPercent}%`,
            width: 3,
            backgroundColor: brandColor,
            boxShadow: `0 0 16px ${brandColor}88`,
            zIndex: 10,
          }}
        >
          {/* Handle circle */}
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 32,
              height: 32,
              borderRadius: "50%",
              backgroundColor: brandColor,
              border: "3px solid white",
              boxShadow: `0 0 12px ${brandColor}66`,
            }}
          />
        </div>

        {/* BEFORE label (shown on odd/even scenes) */}
        <div
          style={{
            position: "absolute",
            top: 16,
            left: isEven ? 16 : undefined,
            right: isEven ? undefined : 16,
            transform: `scale(${labelScale})`,
            opacity: labelOpacity,
            zIndex: 5,
          }}
        >
          <div
            style={{
              backgroundColor: isEven ? "rgba(239,68,68,0.9)" : "rgba(16,185,129,0.9)",
              color: "#ffffff",
              padding: "8px 16px",
              borderRadius: 10,
              fontSize: 16,
              fontWeight: 800,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            {isEven ? "BEFORE" : "AFTER"}
          </div>
        </div>
      </div>

      {/* Bottom text area */}
      <div
        style={{
          position: "absolute",
          bottom: "4%",
          left: "5%",
          right: "5%",
          top: "78%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          transform: `translateY(${textY}px)`,
        }}
      >
        <div style={{ flex: 1 }}>
          <h2
            style={{
              margin: 0,
              fontSize: 44,
              fontWeight: 800,
              lineHeight: 1.1,
              color: "#f8fafc",
              letterSpacing: "-0.01em",
            }}
          >
            {copy}
          </h2>
        </div>
        <div
          style={{
            marginLeft: 24,
            fontSize: 16,
            fontWeight: 600,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: brandColor,
            whiteSpace: "nowrap",
          }}
        >
          {productName}
        </div>
      </div>

      {/* Progress bar */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 6,
          backgroundColor: "rgba(255,255,255,0.12)",
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

const MediaLayer: React.FC<{ scene: Scene; brandColor: string }> = ({ scene, brandColor }) => {
  return scene.video_url ? (
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
        background: `linear-gradient(135deg, ${brandColor}33 0%, #0f172a 100%)`,
      }}
    />
  );
};
