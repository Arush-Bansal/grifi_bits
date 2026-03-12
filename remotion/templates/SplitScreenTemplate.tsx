import { AbsoluteFill, Sequence, useVideoConfig, useCurrentFrame, interpolate, Easing } from "remotion";
import React from "react";

interface Scene {
  image_url: string;
  speech: string;
  id: number;
}

interface SplitScreenProps {
  scenes: Scene[];
  productName: string;
  brandColor?: string;
}

export const SplitScreenTemplate: React.FC<SplitScreenProps> = ({
  scenes = [],
  productName = "Product Name",
  brandColor = "#f97316",
}) => {
  const { fps } = useVideoConfig();
  const sceneDuration = 3.5 * fps;

  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {scenes.map((scene, index) => {
        const startFrame = index * sceneDuration;
        return (
          <Sequence key={scene.id} from={startFrame} durationInFrames={sceneDuration}>
            <SplitScene 
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

const SplitScene: React.FC<{ scene: Scene; productName: string; brandColor: string; isEven: boolean }> = ({
  scene,
  productName,
  brandColor,
  isEven,
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  
  const progress = interpolate(frame, [0, 15], [0, 1], { easing: Easing.out(Easing.quad), extrapolateRight: "clamp" });
  const exit = interpolate(frame, [90, 105], [0, 1], { easing: Easing.in(Easing.quad), extrapolateRight: "clamp" });
  
  const slideIn = (1 - progress) * (isEven ? -100 : 100);
  const slideOut = exit * (isEven ? 100 : -100);

  return (
    <AbsoluteFill style={{ flexDirection: isEven ? "row" : "row-reverse", display: "flex", backgroundColor: "white" }}>
      {/* Image Half */}
      <div style={{ 
        flex: 1, 
        position: "relative",
        overflow: "hidden",
        transform: `translateX(${slideIn}%) translateY(0)`,
        opacity: 1 - exit
      }}>
        <img 
          src={scene.image_url} 
          style={{ width: "100%", height: "100%", objectFit: "cover" }} 
          alt="Product"
          crossOrigin="anonymous"
        />
      </div>

      {/* Text Half */}
      <div style={{ 
        flex: 1, 
        backgroundColor: "#18181b", 
        color: "white",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "40px",
        transform: `translateX(${-slideIn}%)`,
        opacity: 1 - exit,
        fontFamily: "sans-serif"
      }}>
        <div style={{ 
          height: "4px", 
          width: "60px", 
          backgroundColor: brandColor, 
          marginBottom: "20px" 
        }} />
        <h3 style={{ 
          fontSize: "20px", 
          textTransform: "uppercase", 
          letterSpacing: "2px",
          color: brandColor,
          marginBottom: "10px"
        }}>
          {productName}
        </h3>
        <h2 style={{ 
          fontSize: width > height ? "40px" : "48px", 
          fontWeight: "bold",
          lineHeight: 1.2
        }}>
          {scene.speech}
        </h2>
      </div>
    </AbsoluteFill>
  );
};
