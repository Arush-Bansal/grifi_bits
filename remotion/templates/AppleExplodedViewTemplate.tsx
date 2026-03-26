import { AbsoluteFill, Easing, OffthreadVideo, Sequence, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import React from "react";

interface Scene {
  image_url?: string | null;
  video_url?: string | null;
  speech?: string;
  id: number;
}

interface AppleExplodedViewProps {
  scenes?: Scene[];
  productName?: string;
  brandColor?: string;
}

export const AppleExplodedViewTemplate: React.FC<AppleExplodedViewProps> = ({
  scenes = [],
  productName = "Product Name",
  brandColor = "#f97316",
}) => {
  const { fps } = useVideoConfig();
  const sceneDuration = Math.round(4.5 * fps);

  return (
    <AbsoluteFill style={{ backgroundColor: "#000", color: "white", fontFamily: "Helvetica, Arial, sans-serif" }}>
      {scenes.map((scene, index) => {
        const startFrame = index * sceneDuration;
        return (
          <Sequence key={scene.id} from={startFrame} durationInFrames={sceneDuration}>
            <ExplodedScene 
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

const ExplodedScene: React.FC<{ scene: Scene; productName: string; brandColor: string; isLast: boolean }> = ({
  scene,
  productName,
  brandColor,
  isLast,
}) => {
  const frame = useCurrentFrame();
  
  // 3D-like explosion animation
  const explode = interpolate(frame, [15, 35, 65, 85], [0, 1, 1, 0], {
     easing: Easing.bezier(0.33, 1, 0.68, 1),
     extrapolateLeft: "clamp",
     extrapolateRight: "clamp"
  });

  const mainScale = interpolate(explode, [0, 1], [1, 0.85]);
  const layerOffset = interpolate(explode, [0, 1], [0, 120]);
  const layerOpacity = interpolate(explode, [0, 0.4, 1], [0, 0.6, 0.3]);

  return (
    <AbsoluteFill style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
      {/* Background Glow */}
      <div style={{
        position: "absolute",
        width: "100%",
        height: "100%",
        background: `radial-gradient(circle at 50% 50%, ${brandColor}11 0%, transparent 70%)`,
        opacity: explode
      }} />

      {/* The "Exploding" Media Layers */}
      <div style={{ position: "relative", width: "60%", height: "60%", perspective: "1000px" }}>
        
        {/* Shadow Layer 1 (Back) */}
        <div style={{
          position: "absolute",
          inset: 0,
          opacity: layerOpacity,
          transform: `translateZ(${-layerOffset * 1.5}px) scale(${1 + explode * 0.1})`,
          filter: "blur(10px)"
        }}>
           <MediaLayer scene={scene} brandColor={brandColor} />
        </div>

        {/* Shadow Layer 2 (Front) */}
        <div style={{
          position: "absolute",
          inset: 0,
          opacity: layerOpacity,
          transform: `translateZ(${layerOffset}px) scale(${1 - explode * 0.05})`,
          filter: "contrast(1.2)"
        }}>
           <MediaLayer scene={scene} brandColor={brandColor} />
        </div>

        {/* Main Layer */}
        <div style={{
          position: "absolute",
          inset: 0,
          transform: `scale(${mainScale})`,
          boxShadow: `0 ${30 * explode}px ${60 * explode}px rgba(0,0,0,0.5)`,
          zIndex: 5
        }}>
           <MediaLayer scene={scene} brandColor={brandColor} />
        </div>

        {/* Callouts (Specs) that appear during explosion */}
        <div style={{
          position: "absolute",
          top: "-10%",
          left: "80%",
          opacity: explode,
          transform: `translateX(${interpolate(explode, [0, 1], [40, 0])}px)`,
          transition: "opacity 0.3s ease-out"
        }}>
            <SpecLabel label="Titanium Case" brandColor={brandColor} />
        </div>

        <div style={{
          position: "absolute",
          bottom: "10%",
          right: "85%",
          opacity: explode,
          transform: `translateX(${interpolate(explode, [0, 1], [-40, 0])}px)`,
        }}>
            <SpecLabel label="Ultra-Fast Chip" brandColor={brandColor} />
        </div>
      </div>

      {/* Bottom Text */}
      <div style={{
        position: "absolute",
        bottom: "8%",
        textAlign: "center",
        width: "100%",
        opacity: interpolate(frame, [0, 10], [0, 1], { extrapolateRight: "clamp" })
      }}>
         <h2 style={{ 
            fontSize: "48px", 
            fontWeight: 800, 
            letterSpacing: "-0.02em",
            margin: "0 0 10px 0",
            textTransform: "uppercase"
         }}>
           {isLast ? "Evolution achieved" : productName}
         </h2>
         <p style={{ 
            fontSize: "24px", 
            color: "#888", 
            maxWidth: "600px", 
            margin: "0 auto",
            lineHeight: 1.4
         }}>
           {scene.speech || "Precision engineering meets timeless design."}
         </p>
      </div>
    </AbsoluteFill>
  );
};

const MediaLayer: React.FC<{ scene: Scene; brandColor: string }> = ({ scene, brandColor }) => {
    return (
        <AbsoluteFill style={{ borderRadius: "20px", overflow: "hidden", backgroundColor: "#111" }}>
            {scene.video_url ? (
                <OffthreadVideo src={scene.video_url} muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : scene.image_url ? (
                <img src={scene.image_url} alt="Product" style={{ width: "100%", height: "100%", objectFit: "cover" }} crossOrigin="anonymous" />
            ) : (
                <div style={{ width: "100%", height: "100%", background: `linear-gradient(45deg, ${brandColor}44, #000)` }} />
            )}
        </AbsoluteFill>
    )
}

const SpecLabel: React.FC<{ label: string; brandColor: string }> = ({ label, brandColor }) => (
    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <div style={{ width: "40px", height: "1px", backgroundColor: brandColor }} />
        <span style={{ fontSize: "18px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: brandColor }}>
            {label}
        </span>
    </div>
)
