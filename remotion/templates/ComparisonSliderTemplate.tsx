import { AbsoluteFill, Easing, OffthreadVideo, Sequence, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import React from "react";

interface Scene {
  image_url?: string | null;
  video_url?: string | null;
  speech?: string;
  id: number;
}

interface ComparisonSliderProps {
  scenes?: Scene[];
  productName?: string;
  brandColor?: string;
}

export const ComparisonSliderTemplate: React.FC<ComparisonSliderProps> = ({
  scenes = [],
  productName = "Product Name",
  brandColor = "#3b82f6",
}) => {
  const { fps } = useVideoConfig();
  const sceneDuration = Math.round(4.0 * fps);

  return (
    <AbsoluteFill style={{ backgroundColor: "#111", color: "white", fontFamily: "Inter, sans-serif" }}>
      {scenes.map((scene, index) => {
        const startFrame = index * sceneDuration;
        return (
          <Sequence key={scene.id} from={startFrame} durationInFrames={sceneDuration}>
            <ComparisonScene 
              scene={scene} 
              productName={productName} 
              brandColor={brandColor} 
              isLast={index === scenes.length - 1}
            />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

const ComparisonScene: React.FC<{ scene: Scene; productName: string; brandColor: string; isLast: boolean }> = ({
  scene,
  productName,
  brandColor,
  isLast,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sceneDuration = Math.round(4.0 * fps);
  
  // Slider position animation (0 to 100)
  const sliderPos = interpolate(frame, [15, 65, 85], [0, 100, 100], {
    easing: Easing.bezier(0.45, 0.05, 0.55, 0.95),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp"
  });

  const opacity = interpolate(frame, [0, 10, sceneDuration - 10, sceneDuration], [0, 1, 1, 0]);

  return (
    <AbsoluteFill style={{ opacity }}>
      {/* Background Layer (Before - Grayscale) */}
      <AbsoluteFill style={{ filter: "grayscale(100%) blur(2px) contrast(0.8)" }}>
         <MediaContent scene={scene} />
      </AbsoluteFill>

      {/* Foreground Layer (After - Color, Clipped) */}
      <AbsoluteFill style={{ 
        clipPath: `inset(0 ${100 - sliderPos}% 0 0)`,
      }}>
         <MediaContent scene={scene} />
      </AbsoluteFill>

      {/* Slider Handle */}
      <div style={{
        position: "absolute",
        left: `${sliderPos}%`,
        top: 0,
        bottom: 0,
        width: "4px",
        backgroundColor: "white",
        boxShadow: "0 0 20px rgba(0,0,0,0.5)",
        zIndex: 10,
        transform: "translateX(-50%)"
      }}>
          <div style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "50px",
            height: "50px",
            borderRadius: "50%",
            backgroundColor: brandColor,
            border: "4px solid white",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            fontSize: "20px",
            color: "white"
          }}>
             {sliderPos < 50 ? "←" : "→"}
          </div>
          
          <div style={{
            position: "absolute",
            top: "10%",
            right: "15px",
            backgroundColor: "rgba(0,0,0,0.6)",
            padding: "8px 16px",
            borderRadius: "8px",
            fontSize: "14px",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            opacity: sliderPos > 20 ? 1 : 0
          }}>
             After
          </div>

          <div style={{
            position: "absolute",
            top: "10%",
            left: "15px",
            backgroundColor: "rgba(0,0,0,0.6)",
            padding: "8px 16px",
            borderRadius: "8px",
            fontSize: "14px",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            opacity: sliderPos < 80 ? 1 : 0,
            transform: "translateX(-100%)"
          }}>
             Before
          </div>
      </div>

      {/* Text Callouts */}
      <div style={{
        position: "absolute",
        bottom: "8%",
        left: "5%",
        right: "5%",
        textAlign: "center"
      }}>
          <h2 style={{ fontSize: "42px", fontWeight: 900, textShadow: "0 4px 10px rgba(0,0,0,0.8)" }}>
             {isLast ? "Ready to Upgrade?" : productName}
          </h2>
          <p style={{ fontSize: "20px", color: "#ddd", maxWidth: "800px", margin: "10px auto" }}>
             {scene.speech || "Witness the dramatic transformation with our latest innovation."}
          </p>
      </div>
    </AbsoluteFill>
  );
};

const MediaContent: React.FC<{ scene: Scene }> = ({ scene }) => (
    <AbsoluteFill>
        {scene.video_url ? (
            <OffthreadVideo src={scene.video_url} muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : scene.image_url ? (
            <img src={scene.image_url} alt="Comparison" style={{ width: "100%", height: "100%", objectFit: "cover" }} crossOrigin="anonymous" />
        ) : (
            <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg, #333, #000)" }} />
        )}
    </AbsoluteFill>
)
