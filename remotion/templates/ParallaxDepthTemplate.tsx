import { AbsoluteFill, OffthreadVideo, Sequence, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import React from "react";

interface Scene {
  image_url?: string | null;
  video_url?: string | null;
  speech?: string;
  id: number;
}

interface ParallaxDepthProps {
  scenes?: Scene[];
  productName?: string;
  brandColor?: string;
}

export const ParallaxDepthTemplate: React.FC<ParallaxDepthProps> = ({
  scenes = [],
  productName = "Product Name",
  brandColor = "#6366f1",
}) => {
  const { fps } = useVideoConfig();
  const sceneDuration = Math.round(4.5 * fps);

  return (
    <AbsoluteFill style={{ backgroundColor: "#0f172a", color: "#fff", fontFamily: "Outfit, sans-serif" }}>
      {scenes.map((scene, index) => {
        const startFrame = index * sceneDuration;
        return (
          <Sequence key={scene.id} from={startFrame} durationInFrames={sceneDuration}>
            <ParallaxScene 
              scene={scene} 
              productName={productName} 
              brandColor={brandColor} 
            />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

const ParallaxScene: React.FC<{ scene: Scene; productName: string; brandColor: string }> = ({
  scene,
  productName,
  brandColor,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig(); // width, height unused
  const sceneDuration = Math.round(4.5 * fps);
  
  const moveX = interpolate(frame, [0, sceneDuration], [-50, 50]);
  const moveY = interpolate(frame, [0, sceneDuration], [-30, 30]);
  
  const opacity = interpolate(frame, [0, 20, sceneDuration - 20, sceneDuration], [0, 1, 1, 0]);

  return (
    <AbsoluteFill style={{ opacity }}>
      {/* Deepest Layer: Background Media (Blurred) */}
      <AbsoluteFill style={{ 
          transform: `scale(1.2) translate(${moveX * 0.2}px, ${moveY * 0.2}px)`,
          filter: "blur(40px) brightness(0.4)"
      }}>
           {scene.video_url ? (
              <OffthreadVideo src={scene.video_url} muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : scene.image_url ? (
              <img src={scene.image_url} alt="Parallax BG" style={{ width: "100%", height: "100%", objectFit: "cover" }} crossOrigin="anonymous" />
          ) : (
              <div style={{ width: "100%", height: "100%", background: "#111" }} />
          )}
      </AbsoluteFill>

      {/* Middle Layer: Secondary Product Mask (Semi-Opaque) */}
      <AbsoluteFill style={{ 
          display: "flex", justifyItems: "center", alignItems: "center",
          transform: `scale(1.1) translate(${moveX * 0.5}px, ${moveY * 0.5}px)`,
          opacity: 0.3
      }}>
          <div style={{ width: "80%", height: "80%", margin: "0 auto", borderRadius: "40px", overflow: "hidden" }}>
               {scene.image_url && <img src={scene.image_url} alt="Mid" style={{ width: "100%", height: "100%", objectFit: "contain" }} crossOrigin="anonymous" />}
          </div>
      </AbsoluteFill>

      {/* Front Layer: Main Product */}
      <AbsoluteFill style={{ 
          display: "flex", justifyItems: "center", alignItems: "center",
          transform: `translate(${moveX}px, ${moveY}px)`
      }}>
          <div style={{ 
              width: "70%", 
              height: "70%", 
              margin: "0 auto", 
              borderRadius: "50px", 
              overflow: "hidden",
              boxShadow: "0 50px 100px rgba(0,0,0,0.5)",
              border: `1px solid rgba(255,255,255,0.1)`
          }}>
              {scene.video_url ? (
                  <OffthreadVideo src={scene.video_url} muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : scene.image_url ? (
                  <img src={scene.image_url} alt="Main" style={{ width: "100%", height: "100%", objectFit: "cover" }} crossOrigin="anonymous" />
              ) : (
                  <div style={{ width: "100%", height: "100%", background: brandColor }} />
              )}
          </div>
      </AbsoluteFill>

      {/* HUD Layer (Static but slight parallax) */}
      <div style={{
          position: "absolute",
          top: "100px",
          left: "100px",
          transform: `translate(${moveX * 1.5}px, ${moveY * 1.5}px)`,
          zIndex: 50
      }}>
          <h2 style={{ fontSize: "80px", fontWeight: 900, margin: 0, textShadow: "0 10px 30px rgba(0,0,0,0.5)" }}>{productName}</h2>
          <div style={{ height: "4px", width: "100px", backgroundColor: brandColor, marginTop: "20px" }} />
          <p style={{ fontSize: "24px", marginTop: "30px", maxWidth: "400px", opacity: 0.8, fontWeight: 300 }}>
             {scene.speech || "Depth of field. Layered innovation. Experience the product from every angle."}
          </p>
      </div>

      {/* Floating Particles */}
      {[1, 2, 3, 4, 5].map(i => (
          <div key={i} style={{
              position: "absolute",
              width: `${10 * i}px`,
              height: `${10 * i}px`,
              borderRadius: "50%",
              backgroundColor: brandColor,
              opacity: 0.1,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              transform: `translate(${moveX * (2 + i)}px, ${moveY * (2 + i)}px)`
          }} />
      ))}
    </AbsoluteFill>
  );
};
