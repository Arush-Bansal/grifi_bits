import { AbsoluteFill, Easing, OffthreadVideo, Sequence, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import React from "react";

interface Scene {
  image_url?: string | null;
  video_url?: string | null;
  speech?: string;
  id: number;
}

interface LiquidMorphProps {
  scenes?: Scene[];
  productName?: string;
  brandColor?: string;
}

export const LiquidMorphTemplate: React.FC<LiquidMorphProps> = ({
  scenes = [],
  productName = "Product Name",
  brandColor = "#ec4899",
}) => {
  const { fps } = useVideoConfig();
  const sceneDuration = Math.round(3.8 * fps);

  return (
    <AbsoluteFill style={{ backgroundColor: "#000", color: "white", fontFamily: "Outfit, sans-serif" }}>
       {/* SVG Filter for Liquid Effect */}
      <svg style={{ position: "absolute", width: 0, height: 0 }}>
        <filter id="liquid">
          <feGaussianBlur in="SourceGraphic" stdDeviation="15" result="blur" />
          <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 25 -10" result="liquid" />
          <feComposite in="SourceGraphic" in2="liquid" operator="atop" />
        </filter>
      </svg>

      {scenes.map((scene, index) => {
        const startFrame = index * sceneDuration;
        return (
          <Sequence key={scene.id} from={startFrame} durationInFrames={sceneDuration}>
            <LiquidScene 
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

const LiquidScene: React.FC<{ scene: Scene; productName: string; brandColor: string; isLast: boolean }> = ({
  scene,
  productName,
  brandColor,
  isLast,
}) => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const sceneDuration = Math.round(3.8 * fps);
  
  const entrance = spring({ frame, fps, config: { damping: 12, mass: 0.8 } });
  
  // Transition scale and blobbiness
  const blobScale = interpolate(frame, [0, 10, sceneDuration - 15, sceneDuration], [0.8, 1, 1, 1.2], {
     easing: Easing.bezier(0.33, 1, 0.68, 1)
  });
  
  const opacity = interpolate(frame, [0, 12, sceneDuration - 12, sceneDuration], [0, 1, 1, 0]);

  return (
    <AbsoluteFill style={{ opacity, display: "flex", justifyContent: "center", alignItems: "center" }}>
      {/* Background Gradient */}
      <div style={{
        position: "absolute",
        inset: 0,
        background: `radial-gradient(circle at 70% 30%, ${brandColor}22 0%, transparent 60%)`,
        opacity: 0.5
      }} />

      {/* Liquid Media Container */}
      <div style={{
        width: width > height ? "55%" : "85%",
        aspectRatio: "4/5",
        filter: "url(#liquid)",
        transform: `scale(${blobScale})`,
        borderRadius: "40% 60% 70% 30% / 40% 50% 60% 70%", // Initial organic shape
        overflow: "hidden",
        backgroundColor: "#111",
        boxShadow: `0 0 80px ${brandColor}22`
      }}>
         <AbsoluteFill>
            {scene.video_url ? (
                <OffthreadVideo src={scene.video_url} muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : scene.image_url ? (
                <img src={scene.image_url} alt="Organic" style={{ width: "100%", height: "100%", objectFit: "cover" }} crossOrigin="anonymous" />
            ) : (
                <div style={{ width: "100%", height: "100%", background: `linear-gradient(45deg, ${brandColor}, #000)` }} />
            )}
         </AbsoluteFill>
      </div>

      {/* Floating Callouts */}
      <div style={{
        position: "absolute",
        bottom: "12%",
        textAlign: "center"
      }}>
          <div style={{
             display: "inline-block",
             backgroundColor: "rgba(255,255,255,0.05)",
             borderRadius: "99px",
             padding: "10px 24px",
             border: `1px solid ${brandColor}44`,
             backdropFilter: "blur(10px)",
             transform: `translateY(${interpolate(entrance, [0, 1], [30, 0])}px)`
          }}>
             <h2 style={{ 
                margin: 0, 
                fontSize: "36px", 
                fontWeight: 800, 
                letterSpacing: "-0.01em" 
             }}>
                {isLast ? "Unforgettable." : productName}
             </h2>
             <p style={{ 
                margin: "4px 0 0", 
                fontSize: "18px", 
                color: "#999",
                fontWeight: 500
             }}>
                {scene.speech || "Organic beauty in every frame."}
             </p>
          </div>
      </div>
    </AbsoluteFill>
  );
};
