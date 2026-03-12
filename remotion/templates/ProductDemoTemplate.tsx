import { AbsoluteFill, Sequence, useVideoConfig, useCurrentFrame, interpolate, Easing } from "remotion";
import React from "react";

interface Scene {
  image_url: string;
  speech: string;
  id: number;
}

interface ProductDemoProps {
  scenes: Scene[];
  productName: string;
  brandColor?: string;
}

export const ProductDemoTemplate: React.FC<ProductDemoProps> = ({
  scenes = [],
  productName = "Product Name",
  brandColor = "#f97316",
}) => {
  const { fps } = useVideoConfig();
  
  const sceneDuration = 3 * fps; // 3 seconds per scene for uniform flow

  return (
    <AbsoluteFill style={{ backgroundColor: "#09090b", color: "white", fontFamily: "sans-serif" }}>
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
  const { width, height } = useVideoConfig();
  
  const opacity = interpolate(frame, [0, 10, 80, 90], [0, 1, 1, 0], { extrapolateRight: "clamp" });
  const scale = interpolate(frame, [0, 90], [1, 1.1], { easing: Easing.out(Easing.quad) });

  return (
    <AbsoluteFill style={{ opacity }}>
      {/* Background Image with Zoom */}
      <AbsoluteFill style={{ transform: `scale(${scale})` }}>
        <img 
          src={scene.image_url} 
          style={{ width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.7)" }} 
          alt="Product shot"
          crossOrigin="anonymous"
        />
      </AbsoluteFill>

      {/* Overlay Content */}
      <AbsoluteFill style={{ justifyContent: "flex-end", padding: "5%" }}>
        <div style={{ 
          backgroundColor: "rgba(0,0,0,0.6)", 
          backdropFilter: "blur(10px)",
          padding: "30px",
          borderRadius: "20px",
          borderLeft: `8px solid ${brandColor}`,
          boxShadow: "0 10px 30px rgba(0,0,0,0.5)"
        }}>
          <h2 style={{ fontSize: width > height ? "40px" : "60px", marginBottom: "10px", fontWeight: "bold" }}>
             {isLast ? "Ready to Order?" : productName}
          </h2>
          <p style={{ fontSize: width > height ? "24px" : "36px", lineHeight: 1.4, color: "#e4e4e7" }}>
            {scene.speech}
          </p>
        </div>
      </AbsoluteFill>
      
      {/* Branded Progress Bar */}
      <div style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        height: "10px",
        backgroundColor: brandColor,
        width: `${(frame / 90) * 100}%`
      }} />
    </AbsoluteFill>
  );
};
