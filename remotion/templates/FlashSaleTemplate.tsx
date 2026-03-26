import { AbsoluteFill, Easing, OffthreadVideo, Sequence, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import React from "react";

interface Scene {
  image_url?: string | null;
  video_url?: string | null;
  speech?: string;
  id: number;
}

interface FlashSaleProps {
  scenes?: Scene[];
  productName?: string;
  brandColor?: string;
}

export const FlashSaleTemplate: React.FC<FlashSaleProps> = ({
  scenes = [],
  productName = "Product Name",
  brandColor = "#ef4444",
}) => {
  const { fps } = useVideoConfig();
  const sceneDuration = Math.round(2.6 * fps);

  return (
    <AbsoluteFill style={{ backgroundColor: "#0a0406", color: "white", fontFamily: "Arial Black, Arial, sans-serif" }}>
      {scenes.map((scene, index) => {
        const startFrame = index * sceneDuration;
        return (
          <Sequence key={scene.id} from={startFrame} durationInFrames={sceneDuration}>
            <FlashSaleScene
              scene={scene}
              productName={productName}
              brandColor={brandColor}
              sceneIndex={index}
              totalScenes={scenes.length}
            />
          </Sequence>
        );
      })}
      <CountdownTimer brandColor={brandColor} totalScenes={scenes.length} sceneDuration={sceneDuration} />
    </AbsoluteFill>
  );
};

const FlashSaleScene: React.FC<{
  scene: Scene;
  productName: string;
  brandColor: string;
  sceneIndex: number;
  totalScenes: number;
}> = ({ scene, productName, brandColor, sceneIndex, totalScenes }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sceneDuration = Math.round(2.6 * fps);
  const copy = scene.speech?.trim() || "Limited time deal. Order now!";

  const opacity = interpolate(frame, [0, 4, sceneDuration - 6, sceneDuration], [0, 1, 1, 0], {
    extrapolateRight: "clamp",
  });

  const imageEntrance = spring({ frame, fps, config: { damping: 10, stiffness: 180, mass: 0.7 } });
  const imageScale = interpolate(imageEntrance, [0, 1], [0.8, 1]);

  const pulseScale = interpolate(Math.sin(frame / 5), [-1, 1], [0.94, 1.06]);
  const starburstRotation = interpolate(frame, [0, sceneDuration], [0, 360]);

  // Shifting warm gradient per scene
  const hueShift = (sceneIndex / Math.max(1, totalScenes - 1)) * 30;
  const bgGradient = `linear-gradient(135deg,
    hsl(${0 + hueShift}, 85%, 50%) 0%,
    hsl(${20 + hueShift}, 90%, 45%) 40%,
    hsl(${35 + hueShift}, 80%, 40%) 100%)`;

  return (
    <AbsoluteFill style={{ opacity }}>
      {/* Hot gradient background */}
      <AbsoluteFill style={{ background: bgGradient, opacity: 0.9 }} />

      {/* Radial darkening for contrast */}
      <AbsoluteFill
        style={{
          background: "radial-gradient(circle at 50% 45%, transparent 30%, rgba(0,0,0,0.5) 100%)",
        }}
      />

      {/* SALE starburst badge */}
      <div
        style={{
          position: "absolute",
          top: "14%",
          right: "8%",
          width: 120,
          height: 120,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transform: `rotate(${starburstRotation}deg)`,
        }}
      >
        <div
          style={{
            width: 110,
            height: 110,
            borderRadius: "50%",
            backgroundColor: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: `0 0 30px ${brandColor}88, 0 0 60px ${brandColor}44`,
          }}
        >
          <span
            style={{
              fontSize: 28,
              fontWeight: 900,
              color: brandColor,
              letterSpacing: "0.06em",
              transform: `rotate(${-starburstRotation}deg)`,
            }}
          >
            SALE
          </span>
        </div>
      </div>

      {/* Product image — center */}
      <div
        style={{
          position: "absolute",
          top: "22%",
          left: "10%",
          right: "10%",
          height: "40%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transform: `scale(${imageScale})`,
        }}
      >
        <div
          style={{
            width: "85%",
            height: "100%",
            borderRadius: 24,
            overflow: "hidden",
            boxShadow: `0 20px 50px rgba(0,0,0,0.4), 0 0 40px ${brandColor}33`,
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
                background: `linear-gradient(135deg, ${brandColor} 0%, #1a0a0a 100%)`,
              }}
            />
          )}
        </div>
      </div>

      {/* Product name pill */}
      <div
        style={{
          position: "absolute",
          top: "15%",
          left: "7%",
          backgroundColor: "rgba(0,0,0,0.6)",
          color: "#ffffff",
          padding: "10px 20px",
          borderRadius: 9999,
          fontSize: 20,
          fontWeight: 900,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          backdropFilter: "blur(8px)",
          border: "1px solid rgba(255,255,255,0.2)",
        }}
      >
        {productName}
      </div>

      {/* Speech banner — bottom */}
      <div
        style={{
          position: "absolute",
          bottom: "12%",
          left: "6%",
          right: "6%",
          transform: `scale(${pulseScale})`,
        }}
      >
        <div
          style={{
            backgroundColor: "#ffffff",
            color: "#0a0406",
            padding: "22px 28px",
            borderRadius: 20,
            textAlign: "center",
            boxShadow: `0 12px 32px rgba(0,0,0,0.3), 0 0 20px ${brandColor}44`,
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: 42,
              fontWeight: 900,
              lineHeight: 1.1,
              letterSpacing: "-0.01em",
            }}
          >
            {copy}
          </p>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const CountdownTimer: React.FC<{
  brandColor: string;
  totalScenes: number;
  sceneDuration: number;
}> = ({ brandColor, totalScenes, sceneDuration }) => {
  const frame = useCurrentFrame();
  const totalDuration = Math.max(1, totalScenes * sceneDuration);

  // Fake countdown from 23:59:59 ticking down
  const totalSeconds = Math.max(0, 86399 - Math.floor(frame / 2));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const timeStr = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  const progress = (frame / totalDuration) * 100;

  return (
    <>
      {/* Countdown at top */}
      <div
        style={{
          position: "absolute",
          top: "4%",
          left: 0,
          right: 0,
          textAlign: "center",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            backgroundColor: "rgba(0,0,0,0.7)",
            backdropFilter: "blur(12px)",
            padding: "10px 24px",
            borderRadius: 16,
            border: `2px solid ${brandColor}`,
          }}
        >
          <span
            style={{
              fontSize: 14,
              fontWeight: 900,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: brandColor,
            }}
          >
            ENDS IN
          </span>
          <span
            style={{
              fontSize: 28,
              fontWeight: 900,
              fontFamily: "monospace",
              color: "#ffffff",
              letterSpacing: "0.06em",
            }}
          >
            {timeStr}
          </span>
        </div>
      </div>

      {/* Progress bar at very bottom */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 6,
          backgroundColor: "rgba(255,255,255,0.15)",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${progress}%`,
            backgroundColor: brandColor,
          }}
        />
      </div>
    </>
  );
};
