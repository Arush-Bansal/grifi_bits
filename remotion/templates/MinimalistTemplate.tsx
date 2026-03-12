import { AbsoluteFill, useVideoConfig, useCurrentFrame, interpolate, Easing, Series } from "remotion";
import React from "react";

interface Scene {
  image_url: string;
  speech: string;
  id: number;
}

interface MinimalistProps {
  scenes: Scene[];
  productName: string;
  brandColor?: string;
}

export const MinimalistTemplate: React.FC<MinimalistProps> = ({
  scenes = [],
  productName = "Product Name",
  brandColor = "#18181b",
}) => {
  const { fps } = useVideoConfig();
  const sceneDuration = 4 * fps;

  return (
    <AbsoluteFill style={{ backgroundColor: "#ffffff", color: "#18181b", fontFamily: "serif" }}>
      <Series>
        {scenes.map((scene) => (
          <Series.Sequence key={scene.id} durationInFrames={sceneDuration}>
            <MinimalistScene 
              scene={scene} 
              productName={productName} 
              brandColor={brandColor} 
            />
          </Series.Sequence>
        ))}
      </Series>
    </AbsoluteFill>
  );
};

const MinimalistScene: React.FC<{ scene: Scene; productName: string; brandColor: string }> = ({
  scene,
  productName,
  brandColor,
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  
  const opacity = interpolate(frame, [0, 15, 105, 120], [0, 1, 1, 0], { extrapolateRight: "clamp" });
  const scale = interpolate(frame, [0, 120], [1, 1.05], { easing: Easing.out(Easing.quad) });
  const textY = interpolate(frame, [0, 20], [20, 0], { easing: Easing.out(Easing.quad), extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ opacity }}>
      {/* Centered Image with subtle zoom */}
      <div style={{ 
        position: "absolute", 
        inset: "10%", 
        overflow: "hidden", 
        borderRadius: "2px",
        boxShadow: "0 20px 50px rgba(0,0,0,0.1)" 
      }}>
        <img 
          src={scene.image_url} 
          style={{ 
            width: "100%", 
            height: "100%", 
            objectFit: "cover", 
            transform: `scale(${scale})` 
          }} 
          alt="Product"
          crossOrigin="anonymous"
        />
      </div>

      {/* Minimal Overlay */}
      <div style={{ 
        position: "absolute",
        bottom: "15%",
        left: "0",
        right: "0",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        transform: `translateY(${textY}px)`
      }}>
        <div style={{
          backgroundColor: "white",
          padding: "10px 30px",
          textAlign: "center"
        }}>
          <h2 style={{ 
            fontSize: width > height ? "28px" : "40px", 
            letterSpacing: "4px", 
            textTransform: "uppercase",
            margin: 0,
            fontWeight: 300
          }}>
             {productName}
          </h2>
          <div style={{ width: "40px", height: "1px", backgroundColor: brandColor, margin: "15px auto" }} />
          <p style={{ 
            fontSize: width > height ? "18px" : "26px", 
            fontStyle: "italic",
            color: "#52525b",
            maxWidth: "600px",
            margin: 0
          }}>
            {scene.speech}
          </p>
        </div>
      </div>
    </AbsoluteFill>
  );
};
