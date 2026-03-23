import { AbsoluteFill, OffthreadVideo, Sequence, interpolate, useCurrentFrame, useVideoConfig, spring } from "remotion";
import React from "react";

interface Scene {
  image_url?: string | null;
  video_url?: string | null;
  speech?: string;
  id: number;
}

interface DailyRoutineProps {
  scenes?: Scene[];
  productName?: string;
  brandColor?: string;
}

export const DailyRoutineTemplate: React.FC<DailyRoutineProps> = ({
  scenes = [],
  productName = "Product Name",
  brandColor = "#06b6d4", // Clean Cyan
}) => {
  const { fps } = useVideoConfig();
  const sceneDuration = Math.round(3.0 * fps);

  return (
    <AbsoluteFill style={{ backgroundColor: "#f0fdfa", color: "#164e63", fontFamily: "Inter, sans-serif" }}>
      {scenes.map((scene, index) => {
        const startFrame = index * sceneDuration;
        return (
          <Sequence key={scene.id} from={startFrame} durationInFrames={sceneDuration}>
            <RoutineScene 
              scene={scene} 
              productName={productName} 
              brandColor={brandColor} 
              index={index}
            />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

const RoutineScene: React.FC<{ scene: Scene; productName: string; brandColor: string; index: number }> = ({
  scene,
  productName,
  brandColor,
  index,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig(); // width, height unused
  const sceneDuration = Math.round(3.0 * fps);
  
  // Fast Montage Animations
  const entrance = spring({ frame, fps, config: { damping: 12 } });
  const scale = interpolate(entrance, [0, 1], [0.8, 1]);
  const opacity = interpolate(frame, [0, 5, sceneDuration - 5, sceneDuration], [0, 1, 1, 0]);

  // Time indicator (Mock)
  const times = ["07:30 AM", "12:00 PM", "04:45 PM", "08:15 PM", "11:00 PM"];
  const currentTime = times[index % times.length];

  return (
    <AbsoluteFill style={{ opacity }}>
      {/* Product Integration Media */}
      <AbsoluteFill style={{ transform: `scale(${scale})` }}>
           {scene.video_url ? (
              <OffthreadVideo src={scene.video_url} muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : scene.image_url ? (
              <img src={scene.image_url} alt="Routine" style={{ width: "100%", height: "100%", objectFit: "cover" }} crossOrigin="anonymous" />
          ) : (
              <div style={{ width: "100%", height: "100%", background: brandColor }} />
          )}
      </AbsoluteFill>

      {/* Routine HUD */}
      <div style={{
          position: "absolute",
          top: "60px",
          left: "60px",
          backgroundColor: "#fff",
          padding: "16px 24px",
          borderRadius: "20px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          zIndex: 10
      }}>
          <div style={{ width: "12px", height: "12px", borderRadius: "50%", backgroundColor: brandColor }} />
          <div style={{ fontWeight: 800, fontSize: "18px" }}>{currentTime}</div>
      </div>

      {/* Habit Label */}
      <div style={{
          position: "absolute",
          top: "60px",
          right: "60px",
          textAlign: "right",
          zIndex: 10
      }}>
          <div style={{ fontSize: "12px", letterSpacing: "0.2em", opacity: 0.5 }}>DAILY_HABIT</div>
          <h2 style={{ fontSize: "48px", fontWeight: 900, margin: 0, textTransform: "uppercase", color: brandColor }}>{productName}</h2>
      </div>

      {/* Narrative Panel */}
      <div style={{
          position: "absolute",
          bottom: "80px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "90%",
          backgroundColor: "rgba(255,255,255,0.95)",
          backdropFilter: "blur(10px)",
          padding: "30px",
          borderRadius: "30px",
          textAlign: "center",
          boxShadow: "0 20px 50px rgba(0,0,0,0.1)",
          zIndex: 10
      }}>
          <p style={{ margin: 0, fontSize: "24px", fontWeight: 300, color: "#164e63" }}>
             {scene.speech || "Seamlessly integrated into your day. Better results, every single time."}
          </p>
      </div>

      {/* Progress Bar (Habit Tracking) */}
      <div style={{
          position: "absolute",
          bottom: "20px",
          left: "5%",
          right: "5%",
          height: "6px",
          backgroundColor: "rgba(0,0,0,0.05)",
          borderRadius: "3px",
          overflow: "hidden"
      }}>
          <div style={{
              width: `${((index + 1) / 5) * 100}%`,
              height: "100%",
              backgroundColor: brandColor,
              transition: "width 0.5s"
          }} />
      </div>
    </AbsoluteFill>
  );
};
